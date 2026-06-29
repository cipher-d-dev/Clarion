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
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/[0.05] animate-pulse" />)}
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
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Tickets</h2>
          <Link href="/dashboard/dept-head/tickets" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline transition-colors">View all</Link>
        </div>
        <div className="space-y-2">
          {items.map((t) => (
            <Link key={t.id} href={`/dashboard/dept-head/tickets/${t.id}`}
              className="flex items-center justify-between flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
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
