import type { PrismaClient, User } from "@clarion/database";

export class AuthRepository {
  constructor(private readonly db: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    institutionId?: string | null;
    campusId?: string | null;
    departmentId?: string | null;
    matricNo?: string;
    staffId?: string;
  }): Promise<User> {
    return this.db.user.create({ data: data as Parameters<PrismaClient["user"]["create"]>[0]["data"] });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findInstitutionBySlug(slug: string) {
    return this.db.institution.findFirst({
      where: { slug, deletedAt: null, isActive: true },
    });
  }

  async findDepartmentByCode(institutionId: string, code: string) {
    return this.db.department.findFirst({
      where: { institutionId, code, deletedAt: null, isActive: true },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.db.refreshToken.create({ data });
  }

  async findRefreshToken(tokenHash: string) {
    return this.db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.db.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
