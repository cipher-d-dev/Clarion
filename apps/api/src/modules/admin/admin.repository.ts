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
          _count: { select: { users: true, complaints: true, departments: true, campuses: true } },
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

  // ── Departments ───────────────────────────────────────────────────────────

  async listDepartments(institutionId: string, page: number, pageSize: number, search?: string) {
    const where = {
      institutionId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.department.findMany({
        where,
        select: {
          id: true, name: true, code: true, description: true,
          isActive: true, createdAt: true, campusId: true,
          campus: { select: { id: true, name: true, code: true } },
          _count: { select: { users: true, complaints: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.department.count({ where }),
    ]);
    return { items, total };
  }

  async createDepartment(data: {
    institutionId: string;
    name: string;
    code: string;
    description?: string;
    campusId?: string;
  }) {
    return this.db.department.create({
      data,
      select: { id: true, name: true, code: true, description: true, isActive: true, createdAt: true },
    });
  }

  async toggleDepartment(id: string, institutionId: string, isActive: boolean) {
    return this.db.department.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });
  }

  async deleteDepartment(id: string, institutionId: string) {
    // Soft delete
    return this.db.department.update({
      where: { id, institutionId },
      data: { deletedAt: new Date() },
    });
  }

  // ── Campuses ──────────────────────────────────────────────────────────────

  async listCampuses(institutionId: string, page: number, pageSize: number, search?: string) {
    const where = {
      institutionId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.campus.findMany({
        where,
        select: {
          id: true, name: true, code: true, address: true,
          isActive: true, createdAt: true,
          _count: { select: { users: true, departments: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.campus.count({ where }),
    ]);
    return { items, total };
  }

  async createCampus(data: { institutionId: string; name: string; code: string; address?: string }) {
    return this.db.campus.create({
      data,
      select: { id: true, name: true, code: true, address: true, isActive: true, createdAt: true },
    });
  }

  async toggleCampus(id: string, institutionId: string, isActive: boolean) {
    return this.db.campus.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });
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
          department: { select: { id: true, name: true } },
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

  // ── Complaints Oversight ──────────────────────────────────────────────────

  async listAllComplaints(page: number, pageSize: number, filters: {
    institutionId?: string;
    status?: string;
    search?: string;
  }) {
    const where = {
      deletedAt: null,
      ...(filters.institutionId ? { institutionId: filters.institutionId } : {}),
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" as const } },
              { referenceNumber: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.complaint.findMany({
        where,
        select: {
          id: true, referenceNumber: true, title: true, status: true,
          category: true, isAnonymous: true, createdAt: true, resolvedAt: true,
          institution: { select: { id: true, name: true, slug: true } },
          department: { select: { id: true, name: true } },
          submitter: { select: { id: true, firstName: true, lastName: true, email: true } },
          ticket: { select: { id: true, status: true, priority: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.complaint.count({ where }),
    ]);
    return { items, total };
  }

  async forceCloseComplaint(id: string, actorId: string) {
    return this.db.$transaction(async (tx) => {
      const complaint = await tx.complaint.update({
        where: { id },
        data: { status: "CLOSED", resolvedAt: new Date() },
        select: { id: true, institutionId: true, referenceNumber: true },
      });

      // Close linked ticket if any
      await tx.ticket.updateMany({
        where: { complaintId: id },
        data: { status: "CLOSED", resolvedAt: new Date() },
      });

      // Add timeline event
      await tx.timelineEvent.create({
        data: {
          complaintId: id,
          actorId,
          eventType: "ADMIN_FORCE_CLOSED",
          description: "Complaint force-closed by Super Admin",
        },
      });

      return complaint;
    });
  }

  // ── System Stats ──────────────────────────────────────────────────────────

  async getSystemStats() {
    const [
      totalInstitutions,
      activeInstitutions,
      totalUsers,
      totalComplaints,
      openComplaints,
      totalTickets,
      openTickets,
      slaBreached,
    ] = await Promise.all([
      this.db.institution.count({ where: { deletedAt: null } }),
      this.db.institution.count({ where: { deletedAt: null, isActive: true } }),
      this.db.user.count({ where: { deletedAt: null } }),
      this.db.complaint.count({ where: { deletedAt: null } }),
      this.db.complaint.count({
        where: { deletedAt: null, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } },
      }),
      this.db.ticket.count({ where: { deletedAt: null } }),
      this.db.ticket.count({
        where: { deletedAt: null, status: { notIn: ["RESOLVED", "CLOSED"] } },
      }),
      this.db.ticket.count({ where: { slaBreached: true, deletedAt: null } }),
    ]);

    const resolved = await this.db.complaint.count({
      where: { deletedAt: null, status: { in: ["RESOLVED", "CLOSED"] } },
    });
    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

    return {
      totalInstitutions,
      activeInstitutions,
      totalUsers,
      totalComplaints,
      openComplaints,
      totalTickets,
      openTickets,
      slaBreached,
      resolutionRate,
    };
  }

  async getInstitutionBreakdown() {
    const institutions = await this.db.institution.findMany({
      where: { deletedAt: null, isActive: true },
      select: {
        id: true, name: true, slug: true,
        _count: { select: { users: true, complaints: true } },
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    return Promise.all(
      institutions.map(async (inst) => {
        const openComplaints = await this.db.complaint.count({
          where: { institutionId: inst.id, deletedAt: null, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } },
        });
        return { ...inst, openComplaints };
      }),
    );
  }
}
