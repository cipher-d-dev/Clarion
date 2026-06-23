import {
  ComplaintStatus,
  TicketStatus,
  TicketPriority,
  TicketSeverity,
  UserRole,
  type CreateComplaintInput,
  type UpdateComplaintStatusInput,
  type AddInternalNoteInput,
  type RateComplaintInput,
  type ComplaintFilterInput,
} from "@clarion/shared";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors.js";
import type { ComplaintsRepository } from "./complaints.repository.js";
import type { TicketsRepository } from "../tickets/tickets.repository.js";
import type { AIProvider } from "@clarion/ai";
import type { NotificationsService } from "../notifications/notifications.service.js";

// Valid transitions: from → allowed next statuses
const TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatus.DRAFT]: [ComplaintStatus.SUBMITTED],
  [ComplaintStatus.SUBMITTED]: [ComplaintStatus.UNDER_REVIEW, ComplaintStatus.REJECTED],
  [ComplaintStatus.UNDER_REVIEW]: [
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.AWAITING_INFORMATION,
    ComplaintStatus.REJECTED,
  ],
  [ComplaintStatus.ASSIGNED]: [
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.AWAITING_INFORMATION,
    ComplaintStatus.ESCALATED,
  ],
  [ComplaintStatus.IN_PROGRESS]: [
    ComplaintStatus.RESOLVED,
    ComplaintStatus.ESCALATED,
    ComplaintStatus.AWAITING_INFORMATION,
  ],
  [ComplaintStatus.AWAITING_INFORMATION]: [
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.UNDER_REVIEW,
    ComplaintStatus.CLOSED,
  ],
  [ComplaintStatus.ESCALATED]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED],
  [ComplaintStatus.RESOLVED]: [ComplaintStatus.CLOSED, ComplaintStatus.SUBMITTED],
  [ComplaintStatus.CLOSED]: [],
  [ComplaintStatus.REJECTED]: [],
};

function generateRefNumber(year: number, sequence: number) {
  return `CLN-${year}-${String(sequence).padStart(5, "0")}`;
}

function nextSequence(lastRef: string | null, year: number): number {
  if (!lastRef) return 1;
  const parts = lastRef.split("-");
  const lastYear = Number(parts[1]);
  const lastSeq = Number(parts[2]);
  return lastYear === year ? lastSeq + 1 : 1;
}

export class ComplaintsService {
  constructor(
    private readonly repo: ComplaintsRepository,
    private readonly ticketsRepo: TicketsRepository,
    private readonly ai?: AIProvider,
    private readonly notifications?: NotificationsService,
  ) {}

  async list(
    institutionId: string,
    actorRole: UserRole,
    actorId: string,
    actorDeptId: string | null,
    filters: ComplaintFilterInput,
  ) {
    let submitterFilter: string | null = null;
    let deptFilter: string | null = null;

    if (actorRole === UserRole.STUDENT || actorRole === UserRole.LECTURER) {
      submitterFilter = actorId;
    } else if (actorRole === UserRole.DEPT_HEAD) {
      deptFilter = filters.departmentId ?? actorDeptId;
    }

    const { items, total } = await this.repo.findMany(
      institutionId,
      submitterFilter,
      deptFilter,
      filters,
    );

    const sanitized = items.map((c) => this.sanitizeSubmitter(c, actorRole));

    return {
      items: sanitized,
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async getById(
    id: string,
    institutionId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const complaint = await this.repo.findById(id, institutionId);
    if (!complaint) throw new NotFoundError("Complaint not found");

    const isOwner = complaint.submitterId === actorId;
    const isStaff = actorRole !== UserRole.STUDENT && actorRole !== UserRole.LECTURER;

    if (!isOwner && !isStaff) throw new ForbiddenError();

    return this.sanitizeSubmitter(complaint, actorRole);
  }

  async create(
    institutionId: string,
    submitterId: string,
    dto: CreateComplaintInput,
  ) {
    const year = new Date().getFullYear();
    const lastRef = await this.repo.getLastRefNumber(institutionId);
    const seq = nextSequence(lastRef, year);
    const referenceNumber = generateRefNumber(year, seq);

    // AI classification — never block on failure
    let aiMetadata: object | undefined;
    let ticketPriority: TicketPriority = TicketPriority.MEDIUM;
    let ticketSeverity: TicketSeverity = TicketSeverity.MODERATE;
    let aiCategory = dto.category;
    let sentimentScore: number | undefined;

    if (this.ai) {
      try {
        const classification = await this.ai.classify(
          `${dto.title}\n\n${dto.description}`,
        );
        aiMetadata = classification;
        aiCategory = aiCategory ?? classification.category;
        sentimentScore = classification.sentimentScore;

        const priorityMap: Record<string, TicketPriority> = {
          LOW: TicketPriority.LOW,
          MEDIUM: TicketPriority.MEDIUM,
          HIGH: TicketPriority.HIGH,
          URGENT: TicketPriority.URGENT,
        };
        const severityMap: Record<string, TicketSeverity> = {
          MINOR: TicketSeverity.MINOR,
          MODERATE: TicketSeverity.MODERATE,
          MAJOR: TicketSeverity.MAJOR,
          CRITICAL: TicketSeverity.CRITICAL,
        };
        ticketPriority = priorityMap[classification.suggestedPriority] ?? TicketPriority.MEDIUM;
        ticketSeverity = severityMap[classification.suggestedSeverity] ?? TicketSeverity.MODERATE;
      } catch (err) {
        console.warn("[AI] Classification failed, continuing without it:", err);
      }
    }

    const complaint = await this.repo.create({
      institution: { connect: { id: institutionId } },
      submitter: { connect: { id: submitterId } },
      referenceNumber,
      title: dto.title,
      description: dto.description,
      category: aiCategory,
      isAnonymous: dto.isAnonymous,
      status: ComplaintStatus.SUBMITTED,
      ...(aiMetadata && { aiMetadata }),
      ...(sentimentScore !== undefined && { sentimentScore }),
      ...(dto.departmentId && { department: { connect: { id: dto.departmentId } } }),
    });

    await this.repo.addTimelineEvent({
      complaint: { connect: { id: complaint.id } },
      actorId: submitterId,
      eventType: "COMPLAINT_SUBMITTED",
      description: "Complaint submitted",
      metadata: { referenceNumber },
    });

    // Auto-create ticket with AI-derived priority/severity
    const lastTicketRef = await this.ticketsRepo.getLastRefNumber(institutionId);
    const ticketSeq = nextSequence(lastTicketRef, year);
    const ticketRef = `TKT-${year}-${String(ticketSeq).padStart(5, "0")}`;

    await this.ticketsRepo.create({
      institution: { connect: { id: institutionId } },
      complaint: { connect: { id: complaint.id } },
      referenceNumber: ticketRef,
      title: complaint.title,
      description: complaint.description,
      status: TicketStatus.OPEN,
      priority: ticketPriority,
      severity: ticketSeverity,
      ...(dto.departmentId && { department: { connect: { id: dto.departmentId } } }),
    });

    return complaint;
  }

  async updateStatus(
    id: string,
    institutionId: string,
    actorId: string,
    dto: UpdateComplaintStatusInput,
  ) {
    const complaint = await this.repo.findById(id, institutionId);
    if (!complaint) throw new NotFoundError("Complaint not found");

    const allowed = TRANSITIONS[complaint.status as ComplaintStatus] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new ValidationError(
        { status: [`Cannot transition from ${complaint.status} to ${dto.status}`] },
        "Invalid status transition",
      );
    }

    const updated = await this.repo.update(id, {
      status: dto.status,
      ...(dto.status === ComplaintStatus.RESOLVED && { resolvedAt: new Date() }),
    });

    await this.repo.addTimelineEvent({
      complaint: { connect: { id } },
      actorId,
      eventType: "STATUS_CHANGE",
      description: dto.note ?? `Status changed to ${dto.status}`,
      metadata: { from: complaint.status, to: dto.status },
    });

    // Notify submitter
    if (this.notifications && complaint.submitter) {
      const { id: userId, email } = complaint.submitter as { id: string; email: string };
      if (dto.status === ComplaintStatus.RESOLVED) {
        this.notifications.notifyResolved(
          complaint.institutionId, userId, email, complaint.referenceNumber, id,
        ).catch(() => {});
      } else {
        this.notifications.notifyComplaintUpdate(
          complaint.institutionId, userId, complaint.referenceNumber, dto.status, id,
        ).catch(() => {});
      }
    }

    return updated;
  }

  async addNote(
    complaintId: string,
    institutionId: string,
    actorId: string,
    dto: AddInternalNoteInput,
  ) {
    const complaint = await this.repo.findById(complaintId, institutionId);
    if (!complaint) throw new NotFoundError("Complaint not found");
    if (!complaint.ticket) throw new NotFoundError("No ticket associated with this complaint");

    return this.ticketsRepo.addNote({
      ticket: { connect: { id: complaint.ticket.id } },
      author: { connect: { id: actorId } },
      content: dto.content,
    });
  }

  async rate(
    id: string,
    institutionId: string,
    submitterId: string,
    dto: RateComplaintInput,
  ) {
    const complaint = await this.repo.findById(id, institutionId);
    if (!complaint) throw new NotFoundError("Complaint not found");
    if (complaint.submitterId !== submitterId) throw new ForbiddenError();
    if (complaint.status !== ComplaintStatus.RESOLVED) {
      throw new ValidationError({ status: ["Can only rate resolved complaints"] });
    }
    if (complaint.satisfactionRating !== null) {
      throw new ValidationError({ rating: ["Already rated"] });
    }

    return this.repo.update(id, { satisfactionRating: dto.rating });
  }

  async getTimeline(id: string, institutionId: string) {
    const complaint = await this.repo.findById(id, institutionId);
    if (!complaint) throw new NotFoundError("Complaint not found");
    return this.repo.getTimeline(id);
  }

  async getNotes(id: string, institutionId: string) {
    const complaint = await this.repo.findById(id, institutionId);
    if (!complaint) throw new NotFoundError("Complaint not found");
    return this.repo.getInternalNotes(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeSubmitter(complaint: any, actorRole: UserRole) {
    if (
      complaint.isAnonymous &&
      actorRole !== UserRole.SUPER_ADMIN &&
      actorRole !== UserRole.INSTITUTION_MGMT
    ) {
      return { ...complaint, submitter: null, submitterId: null };
    }
    return complaint;
  }
}
