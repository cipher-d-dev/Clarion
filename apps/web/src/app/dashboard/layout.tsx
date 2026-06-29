"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut, LayoutDashboard, FileText, Ticket, Users,
  BarChart3, Building2, ShieldCheck, Menu, X, Loader2,
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
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 cursor-pointer min-h-[44px]",
        isActive
          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-amber-400" />
      )}
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
        isActive
          ? "bg-amber-400/10 text-amber-400"
          : "text-slate-500 group-hover:text-slate-300",
      )}>
        <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      {item.label}
    </Link>
  );
}

function SidebarInner({
  navItems, pathname, user, onLogout, closeMobile, isLoggingOut,
}: {
  navItems: NavItem[];
  pathname: string;
  user: { firstName: string; lastName: string; role: string };
  onLogout: () => void;
  closeMobile?: () => void;
  isLoggingOut?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0e0e11]">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4 border-b border-white/[0.06]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(251,146,60,0.4)]">
          <span className="text-[11px] font-black text-white">C</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">Clarion</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={closeMobile} />
        ))}
      </nav>

      {/* User area */}
      <div className="shrink-0 border-t border-white/[0.06] p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-100 leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-[11px] text-slate-500 mt-0.5">
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
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 min-h-[40px] text-[12px] font-medium text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Signing out...</>
          ) : (
            <><LogOut className="h-3.5 w-3.5" aria-hidden="true" />Sign out</>
          )}
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user) router.replace("/login");
  }, [hasHydrated, isAuthenticated, user, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (tokens?.refreshToken) { try { await api.logout(tokens.refreshToken); } catch { /* ok */ } }
    clearAuth();
    router.push("/login");
  };

  // Handle Escape key for mobile drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

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
  const sideProps = { navItems, pathname, user, onLogout: handleLogout, isLoggingOut };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#f4f4f6] dark:bg-[#080809]">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden w-56 shrink-0 flex-col lg:flex shadow-[1px_0_0_rgba(255,255,255,0.04)]">
          <div className="sticky top-0 h-screen">
            <SidebarInner {...sideProps} />
          </div>
        </aside>

        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile drawer ── */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-56 flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between bg-[#0e0e11] border-b border-white/[0.06] px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <span className="text-[11px] font-black text-white">C</span>
              </div>
              <span className="text-[15px] font-semibold text-white">Clarion</span>
            </div>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <SidebarInner {...sideProps} closeMobile={() => setMobileOpen(false)} />
        </aside>

        {/* ── Content ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-white/[0.05] bg-white/80 dark:bg-[#0e0e11]/80 backdrop-blur-md px-4 lg:hidden sticky top-0 z-30">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <span className="text-[11px] font-black text-white">C</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900 dark:text-white">Clarion</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationCenter />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-9 w-9 min-h-[44px] min-w-[44px] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 disabled:opacity-50 cursor-pointer"
                aria-label="Sign out"
              >
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
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
