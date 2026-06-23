import { z } from "zod";
import {
  ComplaintStatus,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../enums";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
    institutionSlug: z.string().min(1, "Institution is required"),
    matricNo: z.string().optional(),
    staffId: z.string().optional(),
    departmentCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const complaintFilterSchema = paginationSchema.extend({
  status: z.nativeEnum(ComplaintStatus).optional(),
  departmentId: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

export type ComplaintFilterInput = z.infer<typeof complaintFilterSchema>;

export const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000),
  category: z.string().optional(),
  departmentId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export const updateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
  note: z.string().max(1000).optional(),
});

export type UpdateComplaintStatusInput = z.infer<
  typeof updateComplaintStatusSchema
>;

export const addInternalNoteSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type AddInternalNoteInput = z.infer<typeof addInternalNoteSchema>;

export const rateComplaintSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export type RateComplaintInput = z.infer<typeof rateComplaintSchema>;

export const ticketFilterSchema = paginationSchema.extend({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  departmentId: z.string().optional(),
  assigneeId: z.string().optional(),
  slaBreached: z.coerce.boolean().optional(),
});

export type TicketFilterInput = z.infer<typeof ticketFilterSchema>;

export const assignTicketSchema = z.object({
  assigneeId: z.string().min(1, "Assignee is required"),
  note: z.string().max(500).optional(),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  note: z.string().max(1000).optional(),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;

export const escalateTicketSchema = z.object({
  reason: z
    .string()
    .min(10, "Escalation reason must be at least 10 characters")
    .max(1000),
});

export type EscalateTicketInput = z.infer<typeof escalateTicketSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        page: z.number(),
        pageSize: z.number(),
        total: z.number(),
        totalPages: z.number(),
      })
      .optional(),
  });

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.array(z.string())).optional(),
  }),
});

// ── Knowledge Base ──────────────────────────────────────────────────────────

export const createKnowledgeArticleSchema = z.object({
  title: z.string().min(3).max(300),
  content: z.string().min(10),
  category: z.string().optional(),
  slug: z.string().optional(),
});

export type CreateKnowledgeArticleInput = z.infer<typeof createKnowledgeArticleSchema>;

export const updateKnowledgeArticleSchema = createKnowledgeArticleSchema.partial();

export type UpdateKnowledgeArticleInput = z.infer<typeof updateKnowledgeArticleSchema>;

export const kbSearchSchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type KbSearchInput = z.infer<typeof kbSearchSchema>;

// ── Chat ────────────────────────────────────────────────────────────────────

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  complaintId: z.string().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ── Auth response ───────────────────────────────────────────────────────────

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.nativeEnum(UserRole),
    institutionId: z.string().nullable().optional(),
    departmentId: z.string().nullable().optional(),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
