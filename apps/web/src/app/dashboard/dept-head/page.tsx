"use client";

import Link from "next/link";
import { useTickets, useAnalyticsOverview, useAnalyticsSLA } from "@/hooks/use-api";
import { StatCard, PageHeader } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/badges";

export default function DeptHeadOverviewPage() {
  const overview = useAnalyticsOverview();
  const sla = useAnalyticsSLA();
  const { data: ticketsData } = useTickets({ pageSize: 5 });
  const items = ticketsData?.data ?? [];

  const ov = overview.data?.data;
  const slaData = sla.data?.data;
  const loading = overview.isLoading || sla.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Department Overview" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Tickets" value={ov?.totalTickets ?? 0} />
          <StatCard label="SLA Compliance" value={`${slaData?.compliance ?? 0}%`} />
          <StatCard label="SLA Breached" value={slaData?.breached ?? 0} accent={(slaData?.breached ?? 0) > 0} />
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-clarion-navy-700">Recent Tickets</h2>
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
