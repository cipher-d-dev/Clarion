import type { AdminRepository } from "./admin.repository.js";
import type { AuditService } from "../audit/audit.service.js";
import { ConflictError, ValidationError } from "../../lib/errors.js";
import { UserRole } from "@clarion/shared";

export interface AdminActorContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AdminService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly audit?: AuditService,
  ) {}

  listInstitutions(page: number, pageSize: number, search?: string) {
    return this.repo.listInstitutions(page, pageSize, search);
  }

  async createInstitution(data: { name: string; slug: string; domain?: string }, actor: AdminActorContext) {
    const normalized = {
      name: data.name?.trim(),
      slug: data.slug?.trim().toLowerCase(),
      domain: data.domain?.trim().toLowerCase() || undefined,
    };

    if (!normalized.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized.slug)) {
      throw new ValidationError({
        name: normalized.name ? [] : ["Name is required"],
        slug: ["Use lowercase letters, numbers and hyphens only"],
      });
    }

    try {
      const institution = await this.repo.createInstitution(normalized);
      await this.audit?.log({
        institutionId: institution.id,
        actorId: actor.actorId,
        action: "INSTITUTION_CREATED",
        entityType: "Institution",
        entityId: institution.id,
        metadata: { name: institution.name, slug: institution.slug },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });
      return institution;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        throw new ConflictError("Institution slug already exists");
      }
      throw err;
    }
  }

  async toggleInstitution(id: string, isActive: boolean, actor: AdminActorContext) {
    const institution = await this.repo.toggleInstitution(id, isActive);
    await this.audit?.log({
      institutionId: institution.id,
      actorId: actor.actorId,
      action: "INSTITUTION_UPDATED",
      entityType: "Institution",
      entityId: institution.id,
      metadata: { isActive },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return institution;
  }

  listUsers(page: number, pageSize: number, filters: { institutionId?: string; search?: string; role?: UserRole }) {
    return this.repo.listUsers(page, pageSize, filters);
  }

  async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      institutionId?: string | null;
      departmentId?: string | null;
      campusId?: string | null;
      isActive?: boolean;
    },
    actor: AdminActorContext,
  ) {
    if (data.role && !Object.values(UserRole).includes(data.role)) {
      throw new ValidationError({ role: ["Invalid role"] });
    }
    const user = await this.repo.updateUser(id, data);
    await this.audit?.log({
      institutionId: user.institutionId,
      actorId: actor.actorId,
      action: "USER_UPDATED",
      entityType: "User",
      entityId: user.id,
      metadata: {
        changedFields: Object.keys(data),
        email: user.email,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return user;
  }
}
