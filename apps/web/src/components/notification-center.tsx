"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@clarion/ui";
import { cn } from "@clarion/ui";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-api";
import { useNotificationStream } from "@/hooks/use-notification-stream";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Notification = Record<string, any>;

function notificationHref(n: Notification): string | null {
  if (!n.metadata) return null;
  if (n.metadata.complaintId) return null; // resolve to role-specific path later
  if (n.metadata.ticketId) return null;
  return null;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useNotificationStream();

  const { data: countRes } = useUnreadCount();
  const { data: notifRes } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  const unreadCount = countRes?.data?.count ?? 0;
  const notifications: Notification[] = (notifRes?.data as Notification[] | undefined) ?? [];

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleClick(n: Notification) {
    if (!n.isRead) markRead(n.id);
    const href = notificationHref(n);
    if (href) { router.push(href); setOpen(false); }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-clarion-navy-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-clarion-navy-100 px-4 py-3">
            <span className="text-sm font-semibold text-clarion-navy-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll()}
                className="text-xs text-clarion-navy-500 hover:text-clarion-navy-800"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full border-b border-clarion-navy-50 px-4 py-3 text-left transition-colors hover:bg-clarion-navy-50 last:border-0",
                    !n.isRead && "bg-blue-50",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <div className={cn(!n.isRead ? "" : "pl-4")}>
                      <p className="text-sm font-medium text-clarion-navy-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-clarion-navy-500">{n.message}</p>
                      <p className="mt-1 text-xs text-clarion-navy-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
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
