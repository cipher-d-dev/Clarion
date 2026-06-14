"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput, UserRole } from "@clarion/shared";
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
import { useState } from "react";

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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-clarion-amber-100/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-clarion-navy-100/40 blur-3xl" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-clarion-navy-800">
            <span className="font-bold text-clarion-amber-400">C</span>
          </Link>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Join your institution on Clarion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="Ada" {...form.register("firstName")} />
                </FormControl>
                <FormMessage>{form.formState.errors.firstName?.message}</FormMessage>
              </FormField>

              <FormField>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Okonkwo" {...form.register("lastName")} />
                </FormControl>
                <FormMessage>{form.formState.errors.lastName?.message}</FormMessage>
              </FormField>
            </div>

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
              <FormLabel>Institution slug</FormLabel>
              <FormControl>
                <Input placeholder="unilag-demo" {...form.register("institutionSlug")} />
              </FormControl>
              <FormMessage>{form.formState.errors.institutionSlug?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel>Matric number (optional)</FormLabel>
              <FormControl>
                <Input placeholder="CS/2021/001" {...form.register("matricNo")} />
              </FormControl>
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

            <FormField>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...form.register("confirmPassword")}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.confirmPassword?.message}</FormMessage>
            </FormField>

            <Button
              type="submit"
              className="w-full"
              variant="accent"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-clarion-navy-700 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
