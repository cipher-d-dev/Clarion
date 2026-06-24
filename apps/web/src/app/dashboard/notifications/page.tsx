"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button, Card, CardContent } from "@clarion/ui";
import { cn } from "@clarion/ui";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useUnreadCount } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@clarion/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Notification = Record<string, any>;

function notificationHref(n: Notification, role: UserRole): string | null {
  const { complaintId, ticketId } = n.metadata ?? {};
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

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role as UserRole);

  const { data, isLoading } = useNotifications(page);
  const { data: countRes } = useUnreadCount();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: markingAll } = useMarkAllNotificationsRead();

  const notifications: Notification[] = (data?.data as Notification[] | undefined) ?? [];
  const meta = data?.meta;
  const unreadCount = countRes?.data?.count ?? 0;

  function handleClick(n: Notification) {
    if (!n.isRead) markRead(n.id);
    const href = notificationHref(n, role);
    if (href) router.push(href);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" disabled={markingAll} onClick={() => markAll()}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-px">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse bg-gray-50" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You'll see updates about your complaints and tickets here."
              action={<Bell className="h-8 w-8 text-clarion-navy-200" />}
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const href = notificationHref(n, role);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={cn(
                        "w-full px-5 py-4 text-left transition-colors hover:bg-gray-50",
                        !n.isRead && "bg-blue-50 hover:bg-blue-50/80",
                        !href && "cursor-default",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!n.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                        <div className={cn("min-w-0 flex-1", n.isRead && "pl-5")}>
                          <p className="text-sm font-medium text-clarion-navy-800 truncate">{n.title}</p>
                          <p className="mt-0.5 text-sm text-clarion-navy-600">{n.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {href && (
                          <span className="shrink-0 text-xs text-clarion-navy-400">View →</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages} · {meta.total} notifications
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
