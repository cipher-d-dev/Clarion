import type { AdminRepository } from "./admin.repository.js";
import type { AuditService } from "../audit/audit.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../../lib/errors.js";
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

  // ── Institutions ──────────────────────────────────────────────────────────

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

  // ── Departments ───────────────────────────────────────────────────────────

  listDepartments(institutionId: string, page: number, pageSize: number, search?: string) {
    return this.repo.listDepartments(institutionId, page, pageSize, search);
  }

  async createDepartment(
    data: { institutionId: string; name: string; code: string; description?: string; campusId?: string },
    actor: AdminActorContext,
  ) {
    if (!data.name?.trim()) throw new ValidationError({ name: ["Name is required"] });
    if (!data.code?.trim()) throw new ValidationError({ code: ["Code is required"] });

    try {
      const dept = await this.repo.createDepartment({
        ...data,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
      });
      await this.audit?.log({
        institutionId: data.institutionId,
        actorId: actor.actorId,
        action: "DEPARTMENT_CREATED",
        entityType: "Department",
        entityId: dept.id,
        metadata: { name: dept.name, code: dept.code },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });
      return dept;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        throw new ConflictError("Department code already exists in this institution");
      }
      throw err;
    }
  }

  async toggleDepartment(id: string, institutionId: string, isActive: boolean, actor: AdminActorContext) {
    const dept = await this.repo.toggleDepartment(id, institutionId, isActive);
    await this.audit?.log({
      institutionId,
      actorId: actor.actorId,
      action: "DEPARTMENT_UPDATED",
      entityType: "Department",
      entityId: id,
      metadata: { isActive },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return dept;
  }

  async deleteDepartment(id: string, institutionId: string, actor: AdminActorContext) {
    await this.repo.deleteDepartment(id, institutionId);
    await this.audit?.log({
      institutionId,
      actorId: actor.actorId,
      action: "DEPARTMENT_DELETED",
      entityType: "Department",
      entityId: id,
      metadata: {},
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
  }

  // ── Campuses ──────────────────────────────────────────────────────────────

  listCampuses(institutionId: string, page: number, pageSize: number, search?: string) {
    return this.repo.listCampuses(institutionId, page, pageSize, search);
  }

  async createCampus(
    data: { institutionId: string; name: string; code: string; address?: string },
    actor: AdminActorContext,
  ) {
    if (!data.name?.trim()) throw new ValidationError({ name: ["Name is required"] });
    if (!data.code?.trim()) throw new ValidationError({ code: ["Code is required"] });

    try {
      const campus = await this.repo.createCampus({
        ...data,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
      });
      await this.audit?.log({
        institutionId: data.institutionId,
        actorId: actor.actorId,
        action: "CAMPUS_CREATED",
        entityType: "Campus",
        entityId: campus.id,
        metadata: { name: campus.name, code: campus.code },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });
      return campus;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        throw new ConflictError("Campus code already exists in this institution");
      }
      throw err;
    }
  }

  async toggleCampus(id: string, institutionId: string, isActive: boolean, actor: AdminActorContext) {
    const campus = await this.repo.toggleCampus(id, institutionId, isActive);
    await this.audit?.log({
      institutionId,
      actorId: actor.actorId,
      action: "CAMPUS_UPDATED",
      entityType: "Campus",
      entityId: id,
      metadata: { isActive },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return campus;
  }

  // ── Users ─────────────────────────────────────────────────────────────────

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

  // ── Complaints Oversight ──────────────────────────────────────────────────

  listAllComplaints(page: number, pageSize: number, filters: {
    institutionId?: string;
    status?: string;
    search?: string;
  }) {
    return this.repo.listAllComplaints(page, pageSize, filters);
  }

  async forceCloseComplaint(id: string, actor: AdminActorContext) {
    const result = await this.repo.forceCloseComplaint(id, actor.actorId);
    await this.audit?.log({
      institutionId: result.institutionId,
      actorId: actor.actorId,
      action: "COMPLAINT_FORCE_CLOSED",
      entityType: "Complaint",
      entityId: id,
      metadata: { referenceNumber: result.referenceNumber },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return result;
  }

  // ── System Stats ──────────────────────────────────────────────────────────

  getSystemStats() {
    return this.repo.getSystemStats();
  }

  getInstitutionBreakdown() {
    return this.repo.getInstitutionBreakdown();
  }
}
