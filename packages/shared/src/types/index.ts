import { UserRole } from "../enums";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TenantContext {
  institutionId: string;
  institutionSlug: string;
  campusId?: string;
  departmentId?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  institutionId?: string | null;
  departmentId?: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId?: string | null;
  departmentId?: string | null;
}
