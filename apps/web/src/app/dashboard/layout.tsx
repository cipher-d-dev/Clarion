"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, FileText, Ticket, Users, BarChart3 } from "lucide-react";
import { Button } from "@clarion/ui";
import { cn } from "@clarion/ui";
import { useAuthStore } from "@/stores/auth-store";
import { formatRole, getDashboardRoute } from "@/lib/auth-utils";
import { UserRole } from "@clarion/shared";
import { api } from "@/lib/api-client";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { NotificationCenter } from "@/components/notification-center";

type NavItem = { label: string; href: string; icon: React.ReactNode };

function getNavItems(role: UserRole, base: string): NavItem[] {
  const icon = (I: React.ElementType) => <I className="h-4 w-4" />;
  const shared: NavItem[] = [
    { label: "Overview", href: base, icon: icon(LayoutDashboard) },
    { label: "Complaints", href: `${base}/complaints`, icon: icon(FileText) },
  ];

  if (role === UserRole.STUDENT || role === UserRole.LECTURER) return shared;

  return [
    ...shared,
    { label: "Tickets", href: `${base}/tickets`, icon: icon(Ticket) },
    ...(role === UserRole.ADMIN_STAFF || role === UserRole.DEPT_HEAD || role === UserRole.INSTITUTION_MGMT
      ? [{ label: "Staff", href: `${base}/staff`, icon: icon(Users) }]
      : []),
    ...(role === UserRole.DEPT_HEAD || role === UserRole.INSTITUTION_MGMT || role === UserRole.SUPER_ADMIN
      ? [{ label: "Analytics", href: `${base}/analytics`, icon: icon(BarChart3) }]
      : []),
  ];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, tokens, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) router.replace("/login");
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    if (tokens?.refreshToken) {
      try { await api.logout(tokens.refreshToken); } catch { /* continue */ }
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

  const base = getDashboardRoute(user.role as UserRole);
  const navItems = getNavItems(user.role as UserRole, base);

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <aside className="hidden w-60 flex-col border-r border-clarion-navy-100 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-clarion-navy-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clarion-navy-800">
            <span className="text-sm font-bold text-clarion-amber-400">C</span>
          </div>
          <span className="font-semibold text-clarion-navy-800">Clarion</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-clarion-navy-800 text-white"
                  : "text-clarion-navy-600 hover:bg-clarion-navy-50",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-clarion-navy-100 p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-sm font-medium text-clarion-navy-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-clarion-navy-400">{formatRole(user.role as UserRole)}</p>
            </div>
            <NotificationCenter />
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-clarion-navy-100 bg-white px-6 lg:hidden">
          <span className="font-semibold text-clarion-navy-800">Clarion</span>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="p-6">{children}</div>
        
        {/* AI Chat Widget */}
        <AiChatWidget />
      </main>
    </div>
  );
}
