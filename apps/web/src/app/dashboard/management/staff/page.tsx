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

export default function ManagementStaffPage() {
  const { data, isLoading } = useAnalyticsStaff();
  const items = (data?.data ?? []) as StaffWorkload[];

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Workload" />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No staff data available" />
      ) : (
        <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{["Name", "Role", "Department", "Open Tickets", "Resolved Tickets"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-clarion-navy-800">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.role}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.department?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={
                      s.openTickets > 10 ? "text-sm font-medium text-red-600" :
                      s.openTickets > 5 ? "text-sm font-medium text-amber-600" :
                      "text-sm text-clarion-navy-800"
                    }>
                      {s.openTickets}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-clarion-navy-800">{s.resolvedTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
