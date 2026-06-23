import { UserRole } from "../enums";

export enum Permission {
  // Complaints
  COMPLAINT_CREATE = "complaint:create",
  COMPLAINT_READ_OWN = "complaint:read:own",
  COMPLAINT_READ_DEPT = "complaint:read:dept",
  COMPLAINT_READ_INST = "complaint:read:inst",
  COMPLAINT_READ_ALL = "complaint:read:all",
  COMPLAINT_UPDATE = "complaint:update",
  COMPLAINT_DELETE = "complaint:delete",

  // Tickets
  TICKET_CREATE = "ticket:create",
  TICKET_READ = "ticket:read",
  TICKET_ASSIGN = "ticket:assign",
  TICKET_UPDATE = "ticket:update",
  TICKET_ESCALATE = "ticket:escalate",
  TICKET_CLOSE = "ticket:close",

  // Users
  USER_READ = "user:read",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_MANAGE_ROLES = "user:manage_roles",

  // Institution
  INSTITUTION_READ = "institution:read",
  INSTITUTION_UPDATE = "institution:update",
  INSTITUTION_MANAGE = "institution:manage",

  // Knowledge base
  KB_READ = "kb:read",
  KB_WRITE = "kb:write",
  KB_PUBLISH = "kb:publish",

  // Chat
  CHAT = "chat",

  // Analytics
  ANALYTICS_VIEW = "analytics:view",
  ANALYTICS_EXPORT = "analytics:export",

  // System
  SYSTEM_ADMIN = "system:admin",
  AUDIT_READ = "audit:read",

  // Notifications
  NOTIFICATION_READ = "notification:read",
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.COMPLAINT_CREATE,
    Permission.COMPLAINT_READ_OWN,
    Permission.KB_READ,
    Permission.CHAT,
    Permission.NOTIFICATION_READ,
  ],

  [UserRole.LECTURER]: [
    Permission.COMPLAINT_CREATE,
    Permission.COMPLAINT_READ_OWN,
    Permission.COMPLAINT_READ_DEPT,
    Permission.TICKET_READ,
    Permission.KB_READ,
    Permission.CHAT,
    Permission.NOTIFICATION_READ,
  ],

  [UserRole.ADMIN_STAFF]: [
    Permission.COMPLAINT_READ_DEPT,
    Permission.COMPLAINT_UPDATE,
    Permission.TICKET_CREATE,
    Permission.TICKET_READ,
    Permission.TICKET_UPDATE,
    Permission.TICKET_ASSIGN,
    Permission.USER_READ,
    Permission.KB_READ,
    Permission.KB_WRITE,
    Permission.CHAT,
    Permission.NOTIFICATION_READ,
  ],

  [UserRole.DEPT_HEAD]: [
    Permission.COMPLAINT_READ_DEPT,
    Permission.COMPLAINT_UPDATE,
    Permission.COMPLAINT_DELETE,
    Permission.TICKET_CREATE,
    Permission.TICKET_READ,
    Permission.TICKET_UPDATE,
    Permission.TICKET_ASSIGN,
    Permission.TICKET_ESCALATE,
    Permission.TICKET_CLOSE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.KB_READ,
    Permission.KB_WRITE,
    Permission.KB_PUBLISH,
    Permission.ANALYTICS_VIEW,
    Permission.AUDIT_READ,
    Permission.CHAT,
    Permission.NOTIFICATION_READ,
  ],

  [UserRole.INSTITUTION_MGMT]: [
    Permission.COMPLAINT_READ_INST,
    Permission.COMPLAINT_UPDATE,
    Permission.COMPLAINT_DELETE,
    Permission.TICKET_CREATE,
    Permission.TICKET_READ,
    Permission.TICKET_UPDATE,
    Permission.TICKET_ASSIGN,
    Permission.TICKET_ESCALATE,
    Permission.TICKET_CLOSE,
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
    Permission.INSTITUTION_READ,
    Permission.INSTITUTION_UPDATE,
    Permission.KB_READ,
    Permission.KB_WRITE,
    Permission.KB_PUBLISH,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.AUDIT_READ,
    Permission.CHAT,
    Permission.NOTIFICATION_READ,
  ],

  [UserRole.SUPER_ADMIN]: Object.values(Permission),
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
