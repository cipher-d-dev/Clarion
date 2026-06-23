import type { PrismaClient, Complaint, Prisma } from "@clarion/database";
import type { ComplaintFilterInput } from "@clarion/shared";

export class ComplaintsRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByReferenceNumber(referenceNumber: string, institutionId: string) {
    return this.db.complaint.findFirst({
      where: { referenceNumber, institutionId, deletedAt: null },
      select: { id: true, title: true, status: true, createdAt: true, referenceNumber: true },
    });
  }

  async findMany(
    institutionId: string,
    submitterId: string | null,
    departmentId: string | null,
    filters: ComplaintFilterInput,
  ) {
    const where: Prisma.ComplaintWhereInput = {
      institutionId,
      deletedAt: null,
      ...(submitterId && { submitterId }),
      ...(departmentId && { departmentId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { referenceNumber: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.db.complaint.count({ where }),
      this.db.complaint.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          submitter: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { attachments: true } },
        },
        orderBy: { [filters.sortBy ?? "createdAt"]: filters.sortOrder },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);

    return { items, total };
  }

  async findById(id: string, institutionId: string) {
    return this.db.complaint.findFirst({
      where: { id, institutionId, deletedAt: null },
      include: {
        department: { select: { id: true, name: true, code: true } },
        submitter: { select: { id: true, firstName: true, lastName: true, email: true } },
        ticket: {
          include: {
            assignments: {
              include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        timeline: {
          orderBy: { createdAt: "asc" },
          include: { /* actorId only — resolve manually */ },
        },
        attachments: true,
      },
    });
  }

  async create(data: Prisma.ComplaintCreateInput): Promise<Complaint> {
    return this.db.complaint.create({ data });
  }

  async update(id: string, data: Prisma.ComplaintUpdateInput): Promise<Complaint> {
    return this.db.complaint.update({ where: { id }, data });
  }

  async getTimeline(complaintId: string) {
    return this.db.timelineEvent.findMany({
      where: { complaintId },
      orderBy: { createdAt: "asc" },
    });
  }

  async addTimelineEvent(data: Prisma.TimelineEventCreateInput) {
    return this.db.timelineEvent.create({ data });
  }

  async getInternalNotes(complaintId: string) {
    return this.db.internalNote.findMany({
      where: { ticket: { complaintId } },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async countByInstitution(institutionId: string) {
    return this.db.complaint.groupBy({
      by: ["status"],
      where: { institutionId, deletedAt: null },
      _count: true,
    });
  }

  async findAssignedTickets(institutionId: string, assigneeId: string) {
    return this.db.ticket.findMany({
      where: { institutionId, assigneeId, deletedAt: null },
      select: {
        referenceNumber: true,
        status: true,
        priority: true,
        createdAt: true,
        complaint: { select: { title: true, referenceNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  async findByIdForAI(id: string, institutionId: string) {
    return this.db.complaint.findFirst({
      where: { id, institutionId, deletedAt: null },
      select: {
        id: true,
        referenceNumber: true,
        title: true,
        description: true,
        status: true,
        category: true,
        createdAt: true,
        resolvedAt: true,
        department: { select: { name: true } },
        timeline: {
          orderBy: { createdAt: "asc" },
          select: { eventType: true, description: true, createdAt: true },
        },
      },
    });
  }

  async getLastRefNumber(institutionId: string): Promise<string | null> {
    const last = await this.db.complaint.findFirst({
      where: { institutionId, referenceNumber: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { referenceNumber: true },
    });
    return last?.referenceNumber ?? null;
  }
}
