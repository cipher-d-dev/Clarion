"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut, LayoutDashboard, FileText, Ticket, Users,
  BarChart3, Building2, ShieldCheck, Menu, X,
} from "lucide-react";
import { Button, cn } from "@clarion/ui";
import { useAuthStore } from "@/stores/auth-store";
import { formatRole, getDashboardRoute } from "@/lib/auth-utils";
import { UserRole } from "@clarion/shared";
import { api } from "@/lib/api-client";
import { ToastProvider } from "@/components/ui-helpers";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { NotificationCenter } from "@/components/notification-center";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = { label: string; href: string; icon: React.ElementType };

function getNavItems(role: UserRole, base: string): NavItem[] {
  if (role === UserRole.SUPER_ADMIN) return [
    { label: "Overview",      href: base,                      icon: LayoutDashboard },
    { label: "Institutions",  href: `${base}/institutions`,    icon: Building2 },
    { label: "Users",         href: `${base}/users`,           icon: Users },
    { label: "Audit Log",     href: `${base}/audit`,           icon: ShieldCheck },
    { label: "Analytics",     href: `${base}/analytics`,       icon: BarChart3 },
  ];

  const shared: NavItem[] = [
    { label: "Overview",    href: base,                   icon: LayoutDashboard },
    { label: "Complaints",  href: `${base}/complaints`,   icon: FileText },
  ];
  if (role === UserRole.STUDENT || role === UserRole.LECTURER) return shared;
  return [
    ...shared,
    { label: "Tickets", href: `${base}/tickets`, icon: Ticket },
    ...(role === UserRole.DEPT_HEAD || role === UserRole.INSTITUTION_MGMT
      ? [{ label: "Staff",     href: `${base}/staff`,     icon: Users     }] : []),
    ...(role === UserRole.DEPT_HEAD || role === UserRole.INSTITUTION_MGMT
      ? [{ label: "Analytics", href: `${base}/analytics`, icon: BarChart3 }] : []),
  ];
}

function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150",
        isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.07] hover:text-slate-900 dark:hover:text-slate-100",
      )}
    >
      <item.icon className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        isActive
          ? "text-clarion-amber-400 dark:text-slate-900"
          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
      )} />
      {item.label}
    </Link>
  );
}

function SidebarInner({
  navItems, pathname, user, onLogout, closeMobile,
}: {
  navItems: NavItem[];
  pathname: string;
  user: { firstName: string; lastName: string; role: string };
  onLogout: () => void;
  closeMobile?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-200/70 dark:border-white/[0.07] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white shadow-sm">
          <span className="text-[11px] font-bold text-clarion-amber-400 dark:text-slate-900">C</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">Clarion</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={closeMobile} />
        ))}
      </nav>

      {/* User area */}
      <div className="shrink-0 border-t border-slate-200/70 dark:border-white/[0.07] p-4 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-clarion-amber-400 dark:bg-white dark:text-slate-900">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {formatRole(user.role as UserRole)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, tokens, isAuthenticated, clearAuth } = useAuthStore();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user) router.replace("/login");
  }, [hasHydrated, isAuthenticated, user, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    if (tokens?.refreshToken) { try { await api.logout(tokens.refreshToken); } catch { /* ok */ } }
    clearAuth();
    router.push("/login");
  };

  if (!hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 dark:border-white/10 border-t-slate-900 dark:border-t-white" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading…</span>
        </div>
      </div>
    );
  }

  const base      = getDashboardRoute(user.role as UserRole);
  const navItems  = getNavItems(user.role as UserRole, base);
  const sideProps = { navItems, pathname, user, onLogout: handleLogout };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200/70 dark:border-white/[0.07] bg-white dark:bg-[#111111] lg:flex">
          <SidebarInner {...sideProps} />
        </aside>

        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* ── Mobile drawer ── */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/70 dark:border-white/[0.07] bg-white dark:bg-[#111111] shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/70 dark:border-white/[0.07] px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                <span className="text-[11px] font-bold text-clarion-amber-400 dark:text-slate-900">C</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">Clarion</span>
            </div>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <SidebarInner {...sideProps} closeMobile={() => setMobileOpen(false)} />
        </aside>

        {/* ── Content ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/70 dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 lg:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                <span className="text-[11px] font-bold text-clarion-amber-400 dark:text-slate-900">C</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">Clarion</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationCenter />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-8 animate-in fade-in duration-200">
              {children}
            </div>
          </main>
        </div>

        <AiChatWidget />
      </div>
    </ToastProvider>
  );
}
