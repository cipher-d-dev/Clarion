import type { PrismaClient } from "@clarion/database";
import type { UserRole } from "@clarion/shared";

export class UsersRepository {
  constructor(private readonly db: PrismaClient) {}

  async findStaff(institutionId: string) {
    return this.db.user.findMany({
      where: {
        institutionId,
        isActive: true,
        deletedAt: null,
        role: { in: ["ADMIN_STAFF", "DEPT_HEAD", "INSTITUTION_MGMT"] as UserRole[] },
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, departmentId: true,
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }

  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, institutionId: true, departmentId: true,
        matricNo: true, staffId: true, phone: true, avatarUrl: true,
        isActive: true, lastLoginAt: true, createdAt: true,
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    return this.db.user.update({
      where: { id },
      data,
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, institutionId: true, departmentId: true,
        phone: true, avatarUrl: true,
      },
    });
  }
}
