"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@clarion/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      setAuth(result.user, result.tokens);
      router.push(getDashboardRoute(result.user.role as UserRole));
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-clarion-amber-100/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-clarion-navy-100/40 blur-3xl" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-clarion-navy-800">
            <span className="font-bold text-clarion-amber-400">C</span>
          </Link>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Clarion account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@institution.edu"
                  {...form.register("email")}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-clarion-navy-700 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
