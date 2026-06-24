"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@clarion/shared";
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
import { UserRole } from "@clarion/shared";
import { useState } from "react";
import { Shield, BarChart3, Users, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const BRAND_POINTS = [
  { icon: Shield, text: "Secure, institution-scoped data" },
  { icon: BarChart3, text: "Real-time analytics and SLA tracking" },
  { icon: Users, text: "Role-based access for every stakeholder" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const result = await api.login(data);
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
          <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-clarion-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-clarion-navy-600/60 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Clarion home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20">
              <span className="text-sm font-bold text-clarion-amber-400">C</span>
            </div>
            <span className="text-base font-semibold text-white">Clarion</span>
          </Link>

          <div className="mt-auto mb-16">
            <h2 className="text-2xl font-bold text-white leading-snug">
              The complaint management platform institutions trust.
            </h2>
            <p className="mt-3 text-sm text-clarion-navy-300 leading-relaxed max-w-xs">
              Transparent resolution, AI-powered routing, and full audit trails — all in one place.
            </p>

            <ul className="mt-8 space-y-3">
              {BRAND_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-clarion-navy-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-clarion-amber-400/15 text-clarion-amber-400 shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-10 dark:bg-[#0a0a0a]">
        {/* Theme toggle top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden" aria-label="Clarion home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clarion-navy-800">
            <span className="text-sm font-bold text-clarion-amber-400">C</span>
          </div>
          <span className="text-base font-semibold text-clarion-navy-800">Clarion</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Sign in to your Clarion account to continue.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <FormField>
              <FormLabel className="text-sm font-medium text-slate-700">Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@institution.edu"
                  autoComplete="email"
                  className="mt-1.5"
                  {...form.register("email")}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormField>

            <FormField>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium text-slate-700">Password</FormLabel>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="mt-1.5"
                  {...form.register("password")}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.password?.message}</FormMessage>
            </FormField>

            <Button
              type="submit"
              className="w-full"
              variant="accent"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-clarion-navy-700 hover:text-clarion-navy-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
