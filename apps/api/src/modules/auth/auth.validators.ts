import { z } from "zod";
import { UserRole } from "@clarion/shared";

export const registerBodySchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
    institutionSlug: z.string().min(1),
    matricNo: z.string().optional(),
    staffId: z.string().optional(),
    departmentCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1),
});
