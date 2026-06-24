import {
  TicketStatus,
  UserRole,
  EscalationLevel,
  type TicketFilterInput,
  type AssignTicketInput,
  type UpdateTicketStatusInput,
  type EscalateTicketInput,
} from "@clarion/shared";
import { ForbiddenError, NotFoundError, ValidationError } from "../../lib/errors.js";
import type { TicketsRepository } from "./tickets.repository.js";
import type { NotificationsService } from "../notifications/notifications.service.js";

const TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.ASSIGNED, TicketStatus.CLOSED],
  [TicketStatus.ASSIGNED]: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_INFO, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.PENDING_INFO, TicketStatus.CLOSED],
  [TicketStatus.PENDING_INFO]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

export class TicketsService {
  constructor(
    private readonly repo: TicketsRepository,
    private readonly notifications?: NotificationsService,
  ) {}

  async list(
    institutionId: string,
    actorRole: UserRole,
    actorDeptId: string | null,
    filters: TicketFilterInput,
  ) {
    const deptFilter =
      actorRole === UserRole.DEPT_HEAD
        ? (filters.departmentId ?? actorDeptId)
        : (filters.departmentId ?? null);

    const { items, total } = await this.repo.findMany(institutionId, deptFilter, filters);

    return {
      items,
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async getById(id: string, institutionId: string, actorRole: UserRole, actorDeptId: string | null) {
    const ticket = await this.repo.findById(id, institutionId);
    if (!ticket) throw new NotFoundError("Ticket not found");

    if (actorRole === UserRole.DEPT_HEAD && ticket.departmentId !== actorDeptId) {
      throw new ForbiddenError();
    }

    return ticket;
  }

  async assign(
    id: string,
    institutionId: string,
    actorId: string,
    actorRole: UserRole,
    dto: AssignTicketInput,
  ) {
    const ticket = await this.repo.findById(id, institutionId);
    if (!ticket) throw new NotFoundError("Ticket not found");

    const updated = await this.repo.update(id, {
      assignee: { connect: { id: dto.assigneeId } },
      status: TicketStatus.ASSIGNED,
    });

    await this.repo.addAssignment({
      ticket: { connect: { id } },
      assignee: { connect: { id: dto.assigneeId } },
      assignedBy: actorId,
      note: dto.note,
    });

    // Notify assignee — use assignee data from the pre-fetch (ticket.assignee may be old),
    // so we look up the target user directly
    if (this.notifications) {
      this.repo.findUserById(dto.assigneeId).then((assignee) => {
        if (assignee) {
          this.notifications!.notifyTicketAssigned(
            institutionId,
            assignee.id,
            assignee.email,
            ticket.referenceNumber ?? ticket.id,
            id,
            ticket.complaint.title,
          ).catch(() => {});
        }
      }).catch(() => {});
    }

    return updated;
  }

  async updateStatus(
    id: string,
    institutionId: string,
    actorId: string,
    dto: UpdateTicketStatusInput,
  ) {
    const ticket = await this.repo.findById(id, institutionId);
    if (!ticket) throw new NotFoundError("Ticket not found");

    const allowed = TICKET_TRANSITIONS[ticket.status as TicketStatus] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new ValidationError(
        { status: [`Cannot transition from ${ticket.status} to ${dto.status}`] },
        "Invalid status transition",
      );
    }

    return this.repo.update(id, {
      status: dto.status,
      ...(dto.status === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
    });
  }

  async getNotes(id: string, institutionId: string) {
    const ticket = await this.repo.findById(id, institutionId);
    if (!ticket) throw new NotFoundError("Ticket not found");
    return ticket.internalNotes;
  }

  async escalate(
    id: string,
    institutionId: string,
    actorId: string,
    actorRole: UserRole,
    dto: EscalateTicketInput,
  ) {
    const ticket = await this.repo.findById(id, institutionId);
    if (!ticket) throw new NotFoundError("Ticket not found");

    const newLevel = (ticket.escalatedLevel ?? 0) + 1;
    const escalationLevel =
      newLevel === 1 ? EscalationLevel.DEPARTMENT :
      newLevel === 2 ? EscalationLevel.INSTITUTION :
      EscalationLevel.EXTERNAL;

    await this.repo.update(id, { escalatedLevel: newLevel });

    const escalation = await this.repo.addEscalation({
      ticket: { connect: { id } },
      initiator: { connect: { id: actorId } },
      level: escalationLevel,
      reason: dto.reason,
    });

    // Notify dept head
    if (this.notifications && ticket.departmentId) {
      this.repo.findDeptHead(ticket.departmentId).then((head) => {
        if (head) {
          this.notifications!.notifyEscalation(institutionId, head.id, head.email, ticket.referenceNumber ?? ticket.id, id).catch(() => {});
        }
      }).catch(() => {});
    }

    return escalation;
  }
}
