"use client";

import { useAnalyticsOverview, useAnalyticsTrends, useAnalyticsDepartments, useAnalyticsSLA } from "@/hooks/use-api";
import { StatCard, PageHeader } from "@/components/ui-helpers";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Skeleton() {
  return <div className="h-48 rounded-lg bg-gray-100 animate-pulse" />;
}

export default function ManagementOverviewPage() {
  const overview = useAnalyticsOverview();
  const trends = useAnalyticsTrends();
  const departments = useAnalyticsDepartments();
  const sla = useAnalyticsSLA();

  const ov = overview.data?.data;
  const slaData = sla.data?.data;
  const trendsData = trends.data?.data ?? [];
  const deptData = departments.data?.data ?? [];
  const loading = overview.isLoading || sla.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Institution Overview" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total Complaints" value={ov?.totalComplaints ?? 0} />
          <StatCard label="Resolution Rate" value={`${ov?.resolutionRate ?? 0}%`} />
          <StatCard label="SLA Compliance" value={`${slaData?.compliance ?? 0}%`} />
          <StatCard label="SLA Breached" value={slaData?.breached ?? 0} accent={(slaData?.breached ?? 0) > 0} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-clarion-navy-700">Complaint Volume</h2>
          {trends.isLoading ? <Skeleton /> : (
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

        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-clarion-navy-700">Department Performance</h2>
          {departments.isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={192}>
              <BarChart data={deptData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="open" fill="#f97316" />
                <Bar dataKey="resolved" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
