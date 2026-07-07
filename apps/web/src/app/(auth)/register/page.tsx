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
import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import AuthCharacter, { type AuthCharacterHandle } from "@/components/auth-character";

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
  const characterRef = useRef<AuthCharacterHandle>(null);

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

  useEffect(() => {
    if (form.formState.isSubmitting) {
      characterRef.current?.setState('loading');
    }
  }, [form.formState.isSubmitting]);

  useEffect(() => {
    if (error) {
      characterRef.current?.setState('error');
      setTimeout(() => characterRef.current?.setState('idle'), 1500);
    }
  }, [error]);

  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0 && form.formState.isSubmitted) {
      characterRef.current?.setState('error');
      setTimeout(() => characterRef.current?.setState('idle'), 1500);
    }
  }, [form.formState.errors, form.formState.isSubmitted]);

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    characterRef.current?.setState('loading');

    try {
      const result = await api.register(data);
      characterRef.current?.setState('success');
      setAuth(result.data.user, result.data.tokens);
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push(getDashboardRoute(result.data.user.role as UserRole));
    } catch (err) {
      const errorMessage = err instanceof ApiClientError ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0a0a0a] dark:via-slate-950 dark:to-indigo-950/20">
      {/* ── Left brand panel ─── */}
      <div className="relative hidden w-[42%] flex-col bg-[radial-gradient(ellipse_at_top_left,_#4338ca_0%,_#312e81_40%,_#1e1b4b_100%)] lg:flex overflow-hidden">
        {/* Layered ambient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-10 -right-10 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
          <div className="absolute bottom-1/3 left-0 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-2xl animate-pulse" style={{ animationDuration: "7s" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative flex flex-1 flex-col p-10">
          {/* Logo - Claymorphism style */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Clarion home">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border-3 border-white/20 shadow-[0_4px_0_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-transform group-hover:scale-105">
              <span className="text-base font-bold text-orange-400">C</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Clarion</span>
          </Link>

          {/* AI Character - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-64">
              <AuthCharacter ref={characterRef} />
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white leading-snug mb-2">
              Your voice matters. Make it heard. ✨
            </h2>
            <p className="mt-3 text-base text-indigo-200 leading-relaxed max-w-md">
              Create your account to start submitting and tracking complaints with full transparency.
            </p>

            <ul className="mt-10 space-y-4">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-3.5 text-sm text-indigo-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-400/20 border-2 border-orange-400/30 text-orange-300 shrink-0 shadow-[0_4px_0_rgba(251,146,60,0.15)]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 relative">
        {/* Theme toggle top right */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden group" aria-label="Clarion home">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 border-3 border-indigo-500/30 shadow-[0_4px_0_rgba(79,70,229,0.3)] transition-transform group-hover:scale-105">
            <span className="text-base font-bold text-orange-400">C</span>
          </div>
          <span className="text-lg font-bold text-indigo-900 dark:text-white">Clarion</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Header with claymorphism */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-indigo-900 dark:text-white mb-3">
              Create Account
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Join your institution on Clarion
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {error && (
              <div role="alert" aria-live="polite" className="flex items-start gap-3 rounded-2xl border-3 border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-5 py-4 shadow-[0_4px_0_rgba(239,68,68,0.2)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-0.5">Registration Failed</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField>
                <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                  First name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ada"
                    autoComplete="given-name"
                    className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                    onFocus={() => characterRef.current?.setState('typing')}
                    {...form.register("firstName", {
                      onBlur: () => characterRef.current?.setState('idle'),
                    })}
                  />
                </FormControl>
                <FormMessage className="mt-2 text-sm font-medium">
                  {form.formState.errors.firstName?.message}
                </FormMessage>
              </FormField>
              <FormField>
                <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                  Last name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Okonkwo"
                    autoComplete="family-name"
                    className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                    onFocus={() => characterRef.current?.setState('typing')}
                    {...form.register("lastName", {
                      onBlur: () => characterRef.current?.setState('idle'),
                    })}
                  />
                </FormControl>
                <FormMessage className="mt-2 text-sm font-medium">
                  {form.formState.errors.lastName?.message}
                </FormMessage>
              </FormField>
            </div>

            <FormField>
              <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@institution.edu"
                  autoComplete="email"
                  className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                  onFocus={() => characterRef.current?.setState('email')}
                  {...form.register("email", {
                    onBlur: () => characterRef.current?.setState('idle'),
                  })}
                />
              </FormControl>
              <FormMessage className="mt-2 text-sm font-medium">
                {form.formState.errors.email?.message}
              </FormMessage>
            </FormField>

            <FormField>
              <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                Institution slug
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="unilag-demo"
                  className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                  onFocus={() => characterRef.current?.setState('typing')}
                  {...form.register("institutionSlug", {
                    onBlur: () => characterRef.current?.setState('idle'),
                  })}
                />
              </FormControl>
              <FormMessage className="mt-2 text-sm font-medium">
                {form.formState.errors.institutionSlug?.message}
              </FormMessage>
            </FormField>

            <FormField>
              <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                Matric number <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="CS/2021/001"
                  className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                  onFocus={() => characterRef.current?.setState('typing')}
                  {...form.register("matricNo", {
                    onBlur: () => characterRef.current?.setState('idle'),
                  })}
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                  onFocus={() => characterRef.current?.setState('password')}
                  {...form.register("password", {
                    onBlur: () => characterRef.current?.setState('idle'),
                  })}
                />
              </FormControl>
              <FormMessage className="mt-2 text-sm font-medium">
                {form.formState.errors.password?.message}
              </FormMessage>
            </FormField>

            <FormField>
              <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                Confirm password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-14 rounded-2xl border-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111113] px-5 text-base font-medium shadow-[0_4px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_rgba(255,255,255,0.02)] focus:border-indigo-400 dark:focus:border-indigo-500 focus:shadow-[0_4px_0_rgba(79,70,229,0.2)] transition-all duration-200"
                  onFocus={() => characterRef.current?.setState('password')}
                  {...form.register("confirmPassword", {
                    onBlur: () => characterRef.current?.setState('idle'),
                  })}
                />
              </FormControl>
              <FormMessage className="mt-2 text-sm font-medium">
                {form.formState.errors.confirmPassword?.message}
              </FormMessage>
            </FormField>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-base shadow-[0_6px_0_rgba(251,146,60,0.3),0_8px_16px_rgba(251,146,60,0.2)] hover:shadow-[0_4px_0_rgba(251,146,60,0.3),0_6px_12px_rgba(251,146,60,0.25)] active:shadow-[0_2px_0_rgba(251,146,60,0.3)] active:translate-y-1 border-3 border-orange-600/20 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              disabled={form.formState.isSubmitting}
              aria-busy={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
