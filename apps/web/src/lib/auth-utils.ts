import { UserRole } from "@clarion/shared";

const DASHBOARD_ROUTES: Record<UserRole, string> = {
  [UserRole.STUDENT]: "/dashboard/student",
  [UserRole.LECTURER]: "/dashboard/lecturer",
  [UserRole.ADMIN_STAFF]: "/dashboard/staff",
  [UserRole.DEPT_HEAD]: "/dashboard/dept-head",
  [UserRole.INSTITUTION_MGMT]: "/dashboard/management",
  [UserRole.SUPER_ADMIN]: "/dashboard/admin",
};

export function getDashboardRoute(role: UserRole): string {
  return DASHBOARD_ROUTES[role] ?? "/dashboard";
}

export function formatRole(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.STUDENT]: "Student",
    [UserRole.LECTURER]: "Lecturer",
    [UserRole.ADMIN_STAFF]: "Admin Staff",
    [UserRole.DEPT_HEAD]: "Department Head",
    [UserRole.INSTITUTION_MGMT]: "Institution Management",
    [UserRole.SUPER_ADMIN]: "Super Admin",
  };
  return labels[role] ?? role;
}
