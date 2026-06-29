"use client";

import { useAnalyticsStaff } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";

type StaffWorkload = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: { name: string } | null;
  openTickets: number;
  resolvedTickets: number;
};

export default function DeptHeadStaffPage() {
  const { data, isLoading } = useAnalyticsStaff();
  const items = (data?.data ?? []) as StaffWorkload[];

  return (
    <div className="space-y-6">
      <PageHeader title="Department Staff" />

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-white/[0.05] animate-pulse"/>)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No staff data available" />
      ) : (
        <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.04]">
              <tr>{["Name","Role","Department","Open Tickets","Resolved"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.role}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.department?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={s.openTickets > 10 ? "text-sm font-medium text-red-600" : s.openTickets > 5 ? "text-sm font-medium text-amber-600" : "text-sm text-slate-800 dark:text-slate-100"}>
                      {s.openTickets}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{s.resolvedTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
