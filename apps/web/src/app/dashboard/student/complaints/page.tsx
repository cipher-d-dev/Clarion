"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clarion/ui";
import { Plus, FileText, Clock, ArrowRight } from "lucide-react";
import { useComplaints } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { ComplaintStatus } from "@clarion/shared";
import { cn } from "@clarion/ui";

const STATUS_OPTIONS = ["", ...Object.values(ComplaintStatus)] as const;

const STATUS_LABELS: Record<string, string> = {
  "": "All",
  [ComplaintStatus.DRAFT]: "Draft",
  [ComplaintStatus.SUBMITTED]: "Submitted",
  [ComplaintStatus.UNDER_REVIEW]: "Under Review",
  [ComplaintStatus.ASSIGNED]: "Assigned",
  [ComplaintStatus.IN_PROGRESS]: "In Progress",
  [ComplaintStatus.AWAITING_INFORMATION]: "Awaiting Info",
  [ComplaintStatus.ESCALATED]: "Escalated",
  [ComplaintStatus.RESOLVED]: "Resolved",
  [ComplaintStatus.CLOSED]: "Closed",
  [ComplaintStatus.REJECTED]: "Rejected",
};

export default function StudentComplaintsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ComplaintStatus | "">("");

  const { data, isLoading } = useComplaints({ page, pageSize: 10, status: status || undefined });
  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Complaints"
        description={meta?.total ? `${meta.total} complaint${meta.total !== 1 ? "s" : ""} total` : undefined}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Complaints" }]}
        action={
          <Link href="/dashboard/student/complaints/new">
            <Button variant="accent" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New Complaint
            </Button>
          </Link>
        }
      />

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s as ComplaintStatus | ""); setPage(1); }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150 cursor-pointer",
              status === s
                ? "border-clarion-navy-800 bg-clarion-navy-800 text-white dark:border-clarion-amber-500 dark:bg-clarion-amber-500 dark:text-clarion-navy-950"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600"
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={status ? `No complaints with status "${STATUS_LABELS[status]}"` : "Submit your first complaint to get started."}
          icon={<FileText className="h-6 w-6" />}
          action={
            <Link href="/dashboard/student/complaints/new">
              <Button variant="accent" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Submit complaint
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/student/complaints/${c.id}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-clarion-navy-800 dark:group-hover:text-slate-50 transition-colors">
                      {c.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{c.referenceNumber}</span>
                      {c.department && (
                        <>
                          <span className="text-slate-200 dark:text-slate-700">·</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{c.department.name}</span>
                        </>
                      )}
                      <span className="text-slate-200 dark:text-slate-700">·</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <ComplaintStatusBadge status={c.status} />
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">{meta.total}</span> complaint{meta.total !== 1 ? "s" : ""} · Page {page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
