"use client";

import { useAnalyticsOverview } from "@/hooks/use-api";
import { StatCard, PageHeader } from "@/components/ui-helpers";

export default function AdminOverviewPage() {
  const { data, isLoading } = useAnalyticsOverview();
  const ov = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Super Admin" description="System-wide oversight" />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/[0.05] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Complaints" value={ov?.totalComplaints ?? 0} />
          <StatCard label="Total Tickets" value={ov?.totalTickets ?? 0} />
          <StatCard label="Resolution Rate" value={`${ov?.resolutionRate ?? 0}%`} />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] p-4">
        <p className="text-sm text-muted-foreground">
          Full audit log and multi-institution management coming in Phase 5.
        </p>
      </div>
    </div>
  );
}
