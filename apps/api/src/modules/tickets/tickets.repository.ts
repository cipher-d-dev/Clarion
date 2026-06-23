import type { PrismaClient, Prisma } from "@clarion/database";
import type { TicketFilterInput } from "@clarion/shared";

export class TicketsRepository {
  constructor(private readonly db: PrismaClient) {}

  async findMany(institutionId: string, departmentId: string | null, filters: TicketFilterInput) {
    const where: Prisma.TicketWhereInput = {
      institutionId,
      deletedAt: null,
      ...(departmentId && { departmentId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters.slaBreached !== undefined && { slaBreached: filters.slaBreached }),
    };

    const [total, items] = await Promise.all([
      this.db.ticket.count({ where }),
      this.db.ticket.findMany({
        where,
        include: {
          complaint: { select: { id: true, title: true, referenceNumber: true, submitterId: true, isAnonymous: true } },
          department: { select: { id: true, name: true, code: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { [filters.sortBy ?? "createdAt"]: filters.sortOrder },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);

    return { items, total };
  }

  async findById(id: string, institutionId: string) {
    return this.db.ticket.findFirst({
      where: { id, institutionId, deletedAt: null },
      include: {
        complaint: {
          include: {
            submitter: { select: { id: true, firstName: true, lastName: true, email: true } },
            timeline: { orderBy: { createdAt: "asc" } },
            attachments: true,
          },
        },
        department: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignments: {
          include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        },
        internalNotes: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: "asc" },
        },
        escalations: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async create(data: Prisma.TicketCreateInput) {
    return this.db.ticket.create({ data });
  }

  async update(id: string, data: Prisma.TicketUpdateInput) {
    return this.db.ticket.update({ where: { id }, data });
  }

  async addNote(data: Prisma.InternalNoteCreateInput) {
    return this.db.internalNote.create({ data });
  }

  async addEscalation(data: Prisma.EscalationCreateInput) {
    return this.db.escalation.create({ data });
  }

  async addAssignment(data: Prisma.TicketAssignmentCreateInput) {
    return this.db.ticketAssignment.create({ data });
  }

  async findDeptHead(departmentId: string) {
    return this.db.user.findFirst({
      where: { departmentId, role: "DEPT_HEAD", deletedAt: null },
      select: { id: true, email: true },
    });
  }

  async findUserById(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
  }

  async getLastRefNumber(institutionId: string): Promise<string | null> {
    const last = await this.db.ticket.findFirst({
      where: { institutionId, referenceNumber: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { referenceNumber: true },
    });
    return last?.referenceNumber ?? null;
  }
}
