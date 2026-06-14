"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@clarion/ui";
import { useAuthStore } from "@/stores/auth-store";
import { formatRole } from "@/lib/auth-utils";
import { UserRole } from "@clarion/shared";
import { api } from "@/lib/api-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, tokens, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    if (tokens?.refreshToken) {
      try {
        await api.logout(tokens.refreshToken);
      } catch {
        // Continue logout even if API call fails
      }
    }
    clearAuth();
    router.push("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-clarion-navy-200 border-t-clarion-navy-800" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <aside className="hidden w-64 flex-col border-r border-clarion-navy-100 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-clarion-navy-100 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clarion-navy-800">
            <span className="text-sm font-bold text-clarion-amber-400">C</span>
          </div>
          <span className="font-semibold text-clarion-navy-800">Clarion</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/dashboard"
            className="flex items-center rounded-lg bg-clarion-navy-50 px-3 py-2 text-sm font-medium text-clarion-navy-800"
          >
            Dashboard
          </Link>
        </nav>

        <div className="border-t border-clarion-navy-100 p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-clarion-navy-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-clarion-navy-400">
              {formatRole(user.role as UserRole)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-clarion-navy-100 bg-white px-6 lg:hidden">
          <Link href="/dashboard" className="font-semibold text-clarion-navy-800">
            Clarion
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
