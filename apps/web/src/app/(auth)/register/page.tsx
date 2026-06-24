"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput, UserRole } from "@clarion/shared";
import {
  Button,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  Input,
} from "@clarion/ui";
import { api, ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { getDashboardRoute } from "@/lib/auth-utils";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const CHECKLIST = [
  "Submit and track complaints",
  "Receive real-time status updates",
  "Rate your resolution experience",
  "Access full audit timeline",
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: UserRole.STUDENT,
      institutionSlug: "unilag-demo",
      matricNo: "",
      departmentCode: "CS",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    try {
      const result = await api.register(data);
      setAuth(result.data.user, result.data.tokens);
      router.push(getDashboardRoute(result.data.user.role as UserRole));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* ── Left brand panel ─── */}
      <div className="relative hidden w-[42%] flex-col bg-clarion-navy-800 lg:flex overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-clarion-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-clarion-navy-600/60 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col p-10">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Clarion home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20">
              <span className="text-sm font-bold text-clarion-amber-400">C</span>
            </div>
            <span className="text-base font-semibold text-white">Clarion</span>
          </Link>

          <div className="mt-auto mb-16">
            <h2 className="text-2xl font-bold text-white leading-snug">
              Your voice matters. Make it heard.
            </h2>
            <p className="mt-3 text-sm text-clarion-navy-300 leading-relaxed max-w-xs">
              Create your account to start submitting and tracking complaints with full transparency.
            </p>

            <ul className="mt-8 space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-clarion-navy-200">
                  <CheckCircle className="h-4 w-4 text-clarion-amber-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-10 dark:bg-[#0a0a0a]">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden" aria-label="Clarion home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clarion-navy-800">
            <span className="text-sm font-bold text-clarion-amber-400">C</span>
          </div>
          <span className="text-base font-semibold text-clarion-navy-800">Clarion</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Create your account</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Join your institution on Clarion.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField>
                <FormLabel className="text-xs font-medium text-slate-600">First name</FormLabel>
                <FormControl>
                  <Input placeholder="Ada" autoComplete="given-name" className="mt-1" {...form.register("firstName")} />
                </FormControl>
                <FormMessage>{form.formState.errors.firstName?.message}</FormMessage>
              </FormField>
              <FormField>
                <FormLabel className="text-xs font-medium text-slate-600">Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Okonkwo" autoComplete="family-name" className="mt-1" {...form.register("lastName")} />
                </FormControl>
                <FormMessage>{form.formState.errors.lastName?.message}</FormMessage>
              </FormField>
            </div>

            <FormField>
              <FormLabel className="text-xs font-medium text-slate-600">Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@institution.edu" autoComplete="email" className="mt-1" {...form.register("email")} />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel className="text-xs font-medium text-slate-600">Institution slug</FormLabel>
              <FormControl>
                <Input placeholder="unilag-demo" className="mt-1" {...form.register("institutionSlug")} />
              </FormControl>
              <FormMessage>{form.formState.errors.institutionSlug?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel className="text-xs font-medium text-slate-600">
                Matric number <span className="font-normal text-slate-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="CS/2021/001" className="mt-1" {...form.register("matricNo")} />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel className="text-xs font-medium text-slate-600">Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="new-password" className="mt-1" {...form.register("password")} />
              </FormControl>
              <FormMessage>{form.formState.errors.password?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel className="text-xs font-medium text-slate-600">Confirm password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="new-password" className="mt-1" {...form.register("confirmPassword")} />
              </FormControl>
              <FormMessage>{form.formState.errors.confirmPassword?.message}</FormMessage>
            </FormField>

            <Button
              type="submit"
              className="w-full mt-1"
              variant="accent"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-clarion-navy-700 hover:text-clarion-navy-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
