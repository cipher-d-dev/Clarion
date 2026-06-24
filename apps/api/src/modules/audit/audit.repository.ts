import type { PrismaClient } from "@clarion/database";

export interface AuditFilters {
  action?: string;
  entityType?: string;
  actorId?: string;
  institutionId?: string;
  from?: Date;
  to?: Date;
}

export class AuditRepository {
  constructor(private readonly db: PrismaClient) {}

  async find(institutionId: string | null, page: number, pageSize: number, filters: AuditFilters) {
    const where = {
      ...(institutionId ? { institutionId } : filters.institutionId ? { institutionId: filters.institutionId } : {}),
      ...(filters.action ? { action: { contains: filters.action, mode: "insensitive" as const } } : {}),
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.actorId ? { actorId: filters.actorId } : {}),
      ...((filters.from || filters.to)
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, firstName: true, lastName: true, email: true } },
          institution: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.auditLog.count({ where }),
    ]);
    return { items, total };
  }

  async create(data: {
    institutionId?: string | null;
    actorId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: object;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return this.db.auditLog.create({ data });
  }
}
