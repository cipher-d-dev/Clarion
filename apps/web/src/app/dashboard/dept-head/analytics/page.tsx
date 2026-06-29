"use client";

import { useAnalyticsOverview, useAnalyticsSLA, useAnalyticsTrends } from "@/hooks/use-api";
import { StatCard, PageHeader } from "@/components/ui-helpers";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DeptHeadAnalyticsPage() {
  const overview = useAnalyticsOverview();
  const sla = useAnalyticsSLA();
  const trends = useAnalyticsTrends();

  const ov = overview.data?.data;
  const slaData = sla.data?.data;
  const trendsData = trends.data?.data ?? [];
  const loading = overview.isLoading || sla.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Department Analytics" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/[0.05] animate-pulse"/>)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Tickets" value={ov?.totalTickets ?? 0} />
          <StatCard label="SLA Compliance" value={`${slaData?.compliance ?? 0}%`} />
          <StatCard label="SLA Breached" value={slaData?.breached ?? 0} accent={(slaData?.breached ?? 0) > 0} />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Complaint Volume</h2>
        {trends.isLoading ? (
          <div className="h-48 rounded-2xl bg-slate-100 dark:bg-white/[0.05] animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <AreaChart data={trendsData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="submitted" stroke="#1e3a5f" fill="#1e3a5f22" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
