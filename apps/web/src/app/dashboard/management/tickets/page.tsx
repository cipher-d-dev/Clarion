"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clarion/ui";
import { useTickets } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/badges";
import { TicketStatus, TicketPriority } from "@clarion/shared";

export default function ManagementTicketsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const { data, isLoading } = useTickets({ page, pageSize: 15, ...(status && { status }), ...(priority && { priority }) });
  const items = data?.data ?? [];
  const meta = data?.meta;

  const filterBtn = (active: string, value: string, set: (v: string) => void, label: string) => (
    <button key={value}
      onClick={() => { set(value); setPage(1); }}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active === value ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700"
      }`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Ticket Queue" />

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1.5">
          {["", ...Object.values(TicketStatus)].map((s) => filterBtn(status, s, setStatus, s || "All Status"))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["", ...Object.values(TicketPriority)].map((p) => filterBtn(priority, p, setPriority, p || "All Priority"))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/[0.05] animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No tickets found" />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.04]">
                <tr>{["Ticket", "Department", "Assignee", "Priority", "Status", "SLA"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/management/tickets/${t.id}`} className="hover:underline">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.referenceNumber}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.department?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : <span className="text-amber-600">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3"><TicketPriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      {t.slaBreached
                        ? <span className="text-xs font-medium text-red-600">Breached</span>
                        : t.slaDeadline ? <span className="text-xs text-muted-foreground">{new Date(t.slaDeadline).toLocaleDateString()}</span>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{meta.total} tickets · Page {page} of {meta.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
