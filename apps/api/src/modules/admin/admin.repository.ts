import type { PrismaClient } from "@clarion/database";
import type { UserRole } from "@clarion/shared";

export class AdminRepository {
  constructor(private readonly db: PrismaClient) {}

  // ── Institutions ──────────────────────────────────────────────────────────

  async listInstitutions(page: number, pageSize: number, search?: string) {
    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { slug: { contains: search, mode: "insensitive" as const } },
              { domain: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.institution.findMany({
        where,
        select: {
          id: true, name: true, slug: true, domain: true,
          logoUrl: true, isActive: true, createdAt: true,
          _count: { select: { users: true, complaints: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.institution.count({ where }),
    ]);
    return { items, total };
  }

  async createInstitution(data: { name: string; slug: string; domain?: string }) {
    return this.db.institution.create({ data });
  }

  async toggleInstitution(id: string, isActive: boolean) {
    return this.db.institution.update({ where: { id }, data: { isActive } });
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(page: number, pageSize: number, filters: { institutionId?: string; search?: string; role?: UserRole }) {
    const where = {
      deletedAt: null,
      ...(filters.institutionId ? { institutionId: filters.institutionId } : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: "insensitive" as const } },
              { lastName: { contains: filters.search, mode: "insensitive" as const } },
              { email: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true,
          role: true, isActive: true, createdAt: true, lastLoginAt: true,
          institution: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.user.count({ where }),
    ]);
    return { items, total };
  }

  async updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    institutionId?: string | null;
    departmentId?: string | null;
    campusId?: string | null;
    isActive?: boolean;
  }) {
    return this.db.user.update({
      where: { id },
      data,
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, isActive: true, institutionId: true, departmentId: true,
        campusId: true, updatedAt: true,
        institution: { select: { id: true, name: true, slug: true } },
      },
    });
  }
}
