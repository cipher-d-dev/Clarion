"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clarion/ui";
import { useTickets } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/badges";
import { TicketStatus, TicketPriority } from "@clarion/shared";

export default function StaffTicketsPage() {
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
        active === value ? "border-clarion-navy-800 bg-clarion-navy-800 text-white" : "border-gray-200 text-gray-600 hover:border-clarion-navy-300"
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
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse"/>)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No tickets found" />
      ) : (
        <>
          <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Ticket","Department","Assignee","Priority","Status","SLA"].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/staff/tickets/${t.id}`} className="hover:underline">
                        <p className="font-medium text-clarion-navy-800 truncate max-w-[200px]">{t.title}</p>
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
                <Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page>=meta.totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
