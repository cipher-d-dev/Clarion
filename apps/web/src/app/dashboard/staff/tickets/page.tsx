"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clarion/ui";
import { useTickets } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/badges";
import { TicketStatus, TicketPriority } from "@clarion/shared";
import { cn } from "@clarion/ui";
import { AlertTriangle, Clock, ChevronRight, User2, Building2, Ticket } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SLA_STATUS = (t: any) => {
  if (t.slaBreached) return { label: "Breached", cls: "text-red-600 dark:text-red-400 font-semibold" };
  if (!t.slaDeadline) return { label: "—", cls: "text-slate-400" };
  const days = Math.ceil((new Date(t.slaDeadline).getTime() - Date.now()) / 86400000);
  if (days <= 1) return { label: `${days}d left`, cls: "text-orange-600 dark:text-orange-400 font-semibold" };
  if (days <= 3) return { label: `${days}d left`, cls: "text-yellow-600 dark:text-yellow-500 font-semibold" };
  return { label: `${days}d left`, cls: "text-slate-500" };
};

export default function StaffTicketsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const { data, isLoading } = useTickets({
    page,
    pageSize: 15,
    ...(status && { status }),
    ...(priority && { priority }),
  });
  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ticket Queue"
        description={meta?.total ? `${meta.total} ticket${meta.total !== 1 ? "s" : ""} total` : undefined}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {["", ...Object.values(TicketStatus)].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-150 cursor-pointer",
                status === s
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm dark:border-clarion-amber-500 dark:bg-clarion-amber-500 dark:text-slate-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-[#111113] dark:text-slate-400"
              )}
            >
              {s || "All Status"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by priority">
          {["", ...Object.values(TicketPriority)].map((p) => (
            <button
              key={p}
              onClick={() => { setPriority(p); setPage(1); }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-150 cursor-pointer",
                priority === p
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm dark:border-clarion-amber-500 dark:bg-clarion-amber-500 dark:text-slate-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-[#111113] dark:text-slate-400"
              )}
            >
              {p || "All Priority"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[60px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description={status || priority ? "Try adjusting the filters to find tickets." : "There are no tickets in the queue yet."}
          icon={<Ticket className="h-6 w-6" />}
        />
      ) : (
        <>
          {/* Table */}
          <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111113] overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto_auto_auto_auto] items-center border-b border-slate-100 dark:border-white/[0.07] bg-slate-50/70 dark:bg-[#111113]/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 gap-4">
              <span>Ticket</span>
              <span>Department</span>
              <span>Assignee</span>
              <span>Priority</span>
              <span>Status</span>
              <span>SLA</span>
              <span />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((t) => {
                const sla = SLA_STATUS(t);
                return (
                  <Link
                    key={t.id}
                    href={`/dashboard/staff/tickets/${t.id}`}
                    className="group flex flex-col gap-3 px-5 py-4 transition-colors duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 md:grid md:grid-cols-[2fr_1fr_1fr_auto_auto_auto_auto] md:items-center md:gap-4"
                  >
                    {/* Title + ref */}
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-slate-800 dark:text-slate-100 dark:group-hover:text-slate-50 transition-colors">
                        {t.title}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{t.referenceNumber}</p>
                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                      <span className="text-[12.5px] text-slate-500 dark:text-slate-400 truncate">
                        {t.department?.name ?? "—"}
                      </span>
                    </div>

                    {/* Assignee */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User2 className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                      {t.assignee ? (
                        <span className="text-[12.5px] text-slate-600 dark:text-slate-400 truncate">
                          {t.assignee.firstName} {t.assignee.lastName}
                        </span>
                      ) : (
                        <span className="text-[12.5px] font-medium text-clarion-amber-600 dark:text-clarion-amber-400">Unassigned</span>
                      )}
                    </div>

                    {/* Priority */}
                    <div><TicketPriorityBadge priority={t.priority} /></div>

                    {/* Status */}
                    <div><TicketStatusBadge status={t.status} /></div>

                    {/* SLA */}
                    <div className="flex items-center gap-1">
                      {t.slaBreached ? (
                        <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                      ) : (
                        <Clock className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                      <span className={cn("text-[12px]", sla.cls)}>{sla.label}</span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400 transition-colors hidden md:block" />
                  </Link>
                );
              })}
            </div>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">{meta.total}</span> tickets · Page {page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
