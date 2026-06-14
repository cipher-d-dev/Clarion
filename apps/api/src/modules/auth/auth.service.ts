import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@clarion/database";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY_MS,
  BCRYPT_ROUNDS,
  REFRESH_TOKEN_EXPIRY_MS,
  UserRole,
  type JwtPayload,
} from "@clarion/shared";
import { env } from "../../config/env.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../lib/errors.js";
import { generateRefreshToken, hashToken } from "../../lib/tokens.js";
import type { AuthRepository } from "./auth.repository.js";
import type {
  AuthResponseDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
} from "./auth.dto.js";

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async register(
    dto: RegisterDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDto> {
    const existing = await this.repository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const institution = await this.repository.findInstitutionBySlug(
      dto.institutionSlug,
    );
    if (!institution) {
      throw new NotFoundError("Institution not found");
    }

    let departmentId: string | undefined;
    if (dto.departmentCode) {
      const department = await this.repository.findDepartmentByCode(
        institution.id,
        dto.departmentCode,
      );
      if (!department) {
        throw new NotFoundError("Department not found");
      }
      departmentId = department.id;
    }

    const role = (dto.role ?? UserRole.STUDENT) as UserRole;

    if (role === UserRole.SUPER_ADMIN) {
      throw new ValidationError(
        { role: ["Cannot self-register as super admin"] },
        "Invalid role",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.repository.createUser({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role,
      institutionId: institution.id,
      departmentId: departmentId ?? null,
      matricNo: dto.matricNo,
      staffId: dto.staffId,
    });

    return this.buildAuthResponse(user, meta);
  }

  async login(
    dto: LoginDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDto> {
    const user = await this.repository.findUserByEmail(dto.email.toLowerCase());

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await this.repository.updateLastLogin(user.id);

    return this.buildAuthResponse(user, meta);
  }

  async refresh(
    dto: RefreshDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDto> {
    const tokenHash = hashToken(dto.refreshToken);
    const stored = await this.repository.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    if (!stored.user.isActive || stored.user.deletedAt) {
      throw new UnauthorizedError("User account is inactive");
    }

    await this.repository.revokeRefreshToken(tokenHash);

    return this.buildAuthResponse(stored.user, meta);
  }

  async logout(dto: LogoutDto): Promise<void> {
    const tokenHash = hashToken(dto.refreshToken);
    const stored = await this.repository.findRefreshToken(tokenHash);

    if (stored && !stored.revokedAt) {
      await this.repository.revokeRefreshToken(tokenHash);
    }
  }

  private async buildAuthResponse(
    user: User,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
      institutionId: user.institutionId,
      departmentId: user.departmentId,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        institutionId: user.institutionId,
        departmentId: user.departmentId,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_MS,
      },
    };
  }
}
