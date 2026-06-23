"use client";

import Link from "next/link";
import { useTickets } from "@/hooks/use-api";
import { StatCard, PageHeader } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/badges";
import { TicketStatus } from "@clarion/shared";

export default function DeptHeadOverviewPage() {
  const { data } = useTickets({ pageSize: 5 });
  const items = data?.data ?? [];
  const meta = data?.meta;

  const open = items.filter((t) => [TicketStatus.OPEN, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS].includes(t.status)).length;
  const resolved = items.filter((t) => t.status === TicketStatus.RESOLVED).length;
  const slaBreached = items.filter((t) => t.slaBreached).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Department Overview" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Tickets" value={meta?.total ?? 0} />
        <StatCard label="Active" value={open} accent={open > 0} />
        <StatCard label="SLA Breached" value={slaBreached} accent={slaBreached > 0} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-clarion-navy-700">Department Tickets</h2>
          <Link href="/dashboard/dept-head/tickets" className="text-xs text-clarion-navy-500 hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {items.map((t) => (
            <Link key={t.id} href={`/dashboard/dept-head/tickets/${t.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50">
              <div className="min-w-0">
                <p className="text-sm font-medium text-clarion-navy-800 truncate">{t.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{t.referenceNumber}</span>
                  {t.slaBreached && <span className="text-xs font-medium text-red-600">SLA Breached</span>}
                  {t.escalatedLevel > 0 && <span className="text-xs font-medium text-orange-600">Escalated L{t.escalatedLevel}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <TicketPriorityBadge priority={t.priority} />
                <TicketStatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
