import type {
  ApiResponse,
  AuthUser,
  AuthTokens,
  PaginationMeta,
  CreateComplaintInput,
  UpdateComplaintStatusInput,
  AddInternalNoteInput,
  RateComplaintInput,
  ComplaintFilterInput,
  AssignTicketInput,
  UpdateTicketStatusInput,
  EscalateTicketInput,
  UpdateProfileInput,
} from "@clarion/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<{ data: T; meta?: PaginationMeta }> {
  const { token, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...rest, headers });
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new ApiClientError(
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? "An error occurred",
      response.status,
      body.error?.details,
    );
  }

  return { data: body.data as T, meta: body.meta };
}

const get = <T>(path: string, token?: string) => request<T>(path, { token });
const post = <T>(path: string, body: unknown, token?: string) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body), token });
const patch = <T>(path: string, body: unknown, token?: string) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body), token });

async function upload<T>(path: string, formData: FormData, token: string): Promise<{ data: T; meta?: PaginationMeta }> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new ApiClientError(
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? "An error occurred",
      response.status,
      body.error?.details,
    );
  }

  return { data: body.data as T, meta: body.meta };
}

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export interface AuthResponseData {
  user: AuthUser;
  tokens: AuthTokens;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

export const api = {
  // Auth
  health: () => get<{ status: string }>("/v1/health"),
  login: (data: { email: string; password: string }) => post<AuthResponseData>("/v1/auth/login", data),
  register: (data: R) => post<AuthResponseData>("/v1/auth/register", data),
  refresh: (refreshToken: string) => post<AuthResponseData>("/v1/auth/refresh", { refreshToken }),
  logout: (refreshToken: string) => post<{ message: string }>("/v1/auth/logout", { refreshToken }),

  // Complaints
  getComplaints: (filters: Partial<ComplaintFilterInput>, token: string) =>
    get<R[]>(`/v1/complaints${buildQuery(filters as R)}`, token),
  getComplaint: (id: string, token: string) => get<R>(`/v1/complaints/${id}`, token),
  createComplaint: (data: CreateComplaintInput, token: string) => post<R>("/v1/complaints", data, token),
  updateComplaintStatus: (id: string, data: UpdateComplaintStatusInput, token: string) =>
    patch<R>(`/v1/complaints/${id}/status`, data, token),
  getComplaintTimeline: (id: string, token: string) => get<R[]>(`/v1/complaints/${id}/timeline`, token),
  getComplaintNotes: (id: string, token: string) => get<R[]>(`/v1/complaints/${id}/notes`, token),
  addComplaintNote: (id: string, data: AddInternalNoteInput, token: string) =>
    post<R>(`/v1/complaints/${id}/notes`, data, token),
  rateComplaint: (id: string, data: RateComplaintInput, token: string) =>
    post<R>(`/v1/complaints/${id}/rate`, data, token),
  getComplaintAttachments: (id: string, token: string) =>
    get<R[]>(`/v1/complaints/${id}/attachments`, token),
  uploadComplaintAttachment: (id: string, file: File, token: string) => {
    const formData = new FormData();
    formData.set("file", file);
    return upload<R>(`/v1/complaints/${id}/attachments`, formData, token);
  },

  // Tickets
  getTickets: (filters: Partial<R>, token: string) =>
    get<R[]>(`/v1/tickets${buildQuery(filters)}`, token),
  getTicket: (id: string, token: string) => get<R>(`/v1/tickets/${id}`, token),
  assignTicket: (id: string, data: AssignTicketInput, token: string) =>
    post<R>(`/v1/tickets/${id}/assign`, data, token),
  updateTicketStatus: (id: string, data: UpdateTicketStatusInput, token: string) =>
    patch<R>(`/v1/tickets/${id}/status`, data, token),
  escalateTicket: (id: string, data: EscalateTicketInput, token: string) =>
    post<R>(`/v1/tickets/${id}/escalate`, data, token),

  // Users
  getMe: (token: string) => get<R>("/v1/users/me", token),
  updateMe: (data: UpdateProfileInput, token: string) => patch<R>("/v1/users/me", data, token),
  getUsers: (token: string) => get<R[]>("/v1/users", token),

  // AI Chat
  getChatHistory: (token: string) => get<R[]>("/v1/chat/history", token),
  sendChatMessage: (data: { message: string; complaintId?: string }, token: string) =>
    post<{ message: string; sources?: string[] }>("/v1/chat", data, token),

  // Analytics
  getAnalyticsOverview: (token: string) => get<R>("/v1/analytics/overview", token),
  getAnalyticsComplaints: (token: string, from?: string, to?: string) =>
    get<R>(`/v1/analytics/complaints${buildQuery({ from, to })}`, token),
  getAnalyticsDepartments: (token: string) => get<R[]>("/v1/analytics/departments", token),
  getAnalyticsSLA: (token: string) => get<R>("/v1/analytics/sla", token),
  getAnalyticsTrends: (token: string, days?: number) =>
    get<R[]>(`/v1/analytics/trends${buildQuery({ days })}`, token),
  getAnalyticsStaff: (token: string) => get<R[]>("/v1/analytics/staff", token),
  getAnalyticsAiInsights: (token: string) => get<R>("/v1/analytics/ai-insights", token),

  // Notifications
  getNotifications: (token: string, page = 1) =>
    get<R[]>(`/v1/notifications?page=${page}`, token),
  getUnreadCount: (token: string) =>
    get<{ count: number }>("/v1/notifications/unread-count", token),
  markNotificationRead: (id: string, token: string) =>
    patch<{ ok: boolean }>(`/v1/notifications/${id}/read`, {}, token),
  markAllNotificationsRead: (token: string) =>
    patch<{ ok: boolean }>("/v1/notifications/read-all", {}, token),

  // Super admin
  getAuditLogs: (filters: Partial<R>, token: string) =>
    get<R[]>(`/v1/audit${buildQuery(filters)}`, token),
  getAdminInstitutions: (filters: Partial<R>, token: string) =>
    get<R[]>(`/v1/admin/institutions${buildQuery(filters)}`, token),
  createAdminInstitution: (data: { name: string; slug: string; domain?: string }, token: string) =>
    post<R>("/v1/admin/institutions", data, token),
  updateAdminInstitution: (id: string, data: { isActive: boolean }, token: string) =>
    patch<R>(`/v1/admin/institutions/${id}`, data, token),
  getAdminUsers: (filters: Partial<R>, token: string) =>
    get<R[]>(`/v1/admin/users${buildQuery(filters)}`, token),
  updateAdminUser: (id: string, data: Partial<R>, token: string) =>
    patch<R>(`/v1/admin/users/${id}`, data, token),
};
