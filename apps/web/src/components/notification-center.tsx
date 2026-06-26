"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, ExternalLink, Info, ShieldCheck, UserPlus, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@clarion/ui";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-api";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@clarion/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Notification = Record<string, any>;

function notificationHref(n: Notification, role: UserRole): string | null {
  if (!n.metadata) return null;
  const { complaintId, ticketId } = n.metadata;
  if (complaintId) {
    if (role === UserRole.STUDENT || role === UserRole.LECTURER) return `/dashboard/student/complaints/${complaintId}`;
    if (role === UserRole.DEPT_HEAD) return `/dashboard/dept-head/complaints/${complaintId}`;
    return `/dashboard/staff/complaints/${complaintId}`;
  }
  if (ticketId) {
    if (role === UserRole.DEPT_HEAD) return `/dashboard/dept-head/tickets/${ticketId}`;
    return `/dashboard/staff/tickets/${ticketId}`;
  }
  return null;
}

function notificationIcon(n: Notification) {
  const title = (n.title ?? "").toLowerCase();
  if (title.includes("assign")) return <UserPlus className="h-3.5 w-3.5 text-indigo-500" />;
  if (title.includes("note") || title.includes("comment")) return <MessageSquare className="h-3.5 w-3.5 text-amber-500" />;
  if (title.includes("resolve") || title.includes("resolved")) return <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
  if (title.includes("complaint") || title.includes("submitted")) return <FileText className="h-3.5 w-3.5 text-blue-500" />;
  return <Info className="h-3.5 w-3.5 text-slate-400" />;
}

function timeAgo(date: string): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString();
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useNotificationStream();

  const role = useAuthStore((s) => s.user?.role as UserRole);
  const { data: countRes } = useUnreadCount();
  const { data: notifRes } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  const unreadCount = countRes?.data?.count ?? 0;
  const notifications: Notification[] = (notifRes?.data as Notification[] | undefined) ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleClick(n: Notification) {
    if (!n.isRead) markRead(n.id);
    const href = notificationHref(n, role);
    if (href) { router.push(href); setOpen(false); }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
          open
            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
        )}
      >
        <Bell className="h-4.5 w-4.5" style={{ height: "1.0625rem", width: "1.0625rem" }} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-10 z-50 w-[340px] max-w-[calc(100vw-2rem)]",
            "rounded-xl border border-slate-200 dark:border-slate-800",
            "bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/30",
            "animate-in fade-in slide-in-from-top-2 duration-150",
            "mr-0 sm:mr-0"
          )}
          style={{
            maxHeight: "min(80vh, 500px)",
            right: "0",
            left: "auto"
          }}
          role="region"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white min-w-[1.25rem]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll()}
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-[11.5px] font-medium text-clarion-navy-600 dark:text-clarion-navy-300 hover:text-clarion-navy-900 dark:hover:text-clarion-navy-100 transition-colors"
              >
                View all <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                <Bell className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">You&apos;re all caught up</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n, idx) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-100 cursor-pointer",
                    idx < notifications.length - 1 && "border-b border-slate-50 dark:border-slate-800/60",
                    !n.isRead
                      ? "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border mt-0.5",
                    !n.isRead
                      ? "border-blue-200/60 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
                      : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  )}>
                    {notificationIcon(n)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-[12.5px] leading-snug truncate",
                        !n.isRead
                          ? "font-semibold text-slate-800 dark:text-slate-100"
                          : "font-medium text-slate-600 dark:text-slate-400"
                      )}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                      )}
                    </div>
                    {n.message && (
                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                        {n.message}
                      </p>
                    )}
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
