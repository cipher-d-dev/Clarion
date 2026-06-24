"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type {
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

function useToken() {
  return useAuthStore((s) => s.tokens?.accessToken ?? "");
}

// ── Complaints ──────────────────────────────────────────────────────────────

export function useComplaints(filters: Partial<ComplaintFilterInput> = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["complaints", filters],
    queryFn: () => api.getComplaints(filters, token),
    enabled: !!token,
  });
}

export function useComplaint(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["complaints", id],
    queryFn: () => api.getComplaint(id, token),
    enabled: !!token && !!id,
  });
}

export function useComplaintTimeline(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["complaints", id, "timeline"],
    queryFn: () => api.getComplaintTimeline(id, token),
    enabled: !!token && !!id,
  });
}

export function useComplaintNotes(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["complaints", id, "notes"],
    queryFn: () => api.getComplaintNotes(id, token),
    enabled: !!token && !!id,
  });
}

export function useCreateComplaint() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateComplaintInput) => api.createComplaint(data, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaints"] }),
  });
}

export function useUpdateComplaintStatus() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComplaintStatusInput }) =>
      api.updateComplaintStatus(id, data, token),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["complaints", id] });
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

export function useAddComplaintNote() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddInternalNoteInput }) =>
      api.addComplaintNote(id, data, token),
    onSuccess: (_r, { id }) => qc.invalidateQueries({ queryKey: ["complaints", id, "notes"] }),
  });
}

export function useRateComplaint() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RateComplaintInput }) =>
      api.rateComplaint(id, data, token),
    onSuccess: (_r, { id }) => qc.invalidateQueries({ queryKey: ["complaints", id] }),
  });
}

export function useComplaintAttachments(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["complaints", id, "attachments"],
    queryFn: () => api.getComplaintAttachments(id, token),
    enabled: !!token && !!id,
  });
}

export function useUploadComplaintAttachment() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      api.uploadComplaintAttachment(id, file, token),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["complaints", id] });
      qc.invalidateQueries({ queryKey: ["complaints", id, "attachments"] });
    },
  });
}

// ── Tickets ─────────────────────────────────────────────────────────────────

export function useTickets(filters: Record<string, unknown> = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => api.getTickets(filters, token),
    enabled: !!token,
  });
}

export function useTicket(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => api.getTicket(id, token),
    enabled: !!token && !!id,
  });
}

export function useAssignTicket() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTicketInput }) =>
      api.assignTicket(id, data, token),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["tickets", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicketStatus() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketStatusInput }) =>
      api.updateTicketStatus(id, data, token),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["tickets", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useEscalateTicket() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EscalateTicketInput }) =>
      api.escalateTicket(id, data, token),
    onSuccess: (_r, { id }) => qc.invalidateQueries({ queryKey: ["tickets", id] }),
  });
}

// ── Users ────────────────────────────────────────────────────────────────────

export function useMe() {
  const token = useToken();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(token),
    enabled: !!token,
  });
}

export function useUsers() {
  const token = useToken();
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(token),
    enabled: !!token,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const token = useToken();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => api.updateMe(data, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

// ── Analytics ────────────────────────────────────────────────────────────────

export function useAnalyticsOverview() {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.getAnalyticsOverview(token),
    enabled: !!token,
  });
}

export function useAnalyticsComplaints(from?: string, to?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "complaints", from, to],
    queryFn: () => api.getAnalyticsComplaints(token, from, to),
    enabled: !!token,
  });
}

export function useAnalyticsDepartments() {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "departments"],
    queryFn: () => api.getAnalyticsDepartments(token),
    enabled: !!token,
  });
}

export function useAnalyticsSLA() {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "sla"],
    queryFn: () => api.getAnalyticsSLA(token),
    enabled: !!token,
  });
}

export function useAnalyticsTrends(days?: number) {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "trends", days],
    queryFn: () => api.getAnalyticsTrends(token, days),
    enabled: !!token,
  });
}

export function useAnalyticsStaff() {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "staff"],
    queryFn: () => api.getAnalyticsStaff(token),
    enabled: !!token,
  });
}

export function useAnalyticsAiInsights() {
  const token = useToken();
  return useQuery({
    queryKey: ["analytics", "ai-insights"],
    queryFn: () => api.getAnalyticsAiInsights(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 min — AI insights are expensive
  });
}

// ── AI Chat ──────────────────────────────────────────────────────────────────

export function useChatHistory() {
  const token = useToken();
  return useQuery({
    queryKey: ["chat", "history"],
    queryFn: () => api.getChatHistory(token),
    enabled: !!token,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  const token = useToken();
  return useMutation({
    mutationFn: (data: { message: string; complaintId?: string }) =>
      api.sendChatMessage(data, token),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ["chat", "history"] });
      const previousHistory = qc.getQueryData(["chat", "history"]);
      qc.setQueryData(["chat", "history"], (old: { data?: unknown[] } | undefined) => {
        const userMessage = {
          id: Date.now().toString(),
          role: "user",
          content: data.message,
          createdAt: new Date().toISOString(),
        };
        return { ...old, data: [...(old?.data || []), userMessage] };
      });
      return { previousHistory };
    },
    onError: (_err, _newData, context) => {
      qc.setQueryData(["chat", "history"], context?.previousHistory);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "history"] }),
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function useNotifications(page = 1) {
  const token = useToken();
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: () => api.getNotifications(token, page),
    enabled: !!token,
    refetchInterval: false,
  });
}

export function useUnreadCount() {
  const token = useToken();
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.getUnreadCount(token),
    enabled: !!token,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// Super admin

export function useAuditLogs(filters: Record<string, unknown> = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: () => api.getAuditLogs(filters, token),
    enabled: !!token,
  });
}

export function useAdminInstitutions(filters: Record<string, unknown> = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["admin", "institutions", filters],
    queryFn: () => api.getAdminInstitutions(filters, token),
    enabled: !!token,
  });
}

export function useCreateAdminInstitution() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; domain?: string }) =>
      api.createAdminInstitution(data, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "institutions"] }),
  });
}

export function useUpdateAdminInstitution() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateAdminInstitution(id, { isActive }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "institutions"] }),
  });
}

export function useAdminUsers(filters: Record<string, unknown> = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => api.getAdminUsers(filters, token),
    enabled: !!token,
  });
}

export function useUpdateAdminUser() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateAdminUser(id, data, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
