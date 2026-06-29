"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clarion/ui";
import { useComplaints } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { ComplaintStatus } from "@clarion/shared";

export default function DeptHeadComplaintsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ComplaintStatus | "">("");

  const { data, isLoading } = useComplaints({ page, pageSize: 15, status: status || undefined });
  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="Department Complaints" />

      <div className="flex gap-1.5 flex-wrap">
        {(["", ...Object.values(ComplaintStatus)] as (ComplaintStatus | "")[]).map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/[0.05] animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No complaints found" />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.04]">
                <tr>
                  {["Reference", "Title", "Submitter", "Category", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{c.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/dept-head/complaints/${c.id}`}
                        className="font-medium text-slate-800 dark:text-slate-100 hover:underline truncate max-w-[200px] block"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.isAnonymous
                        ? "Anonymous"
                        : c.submitter
                          ? `${c.submitter.firstName} ${c.submitter.lastName}`
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.category ?? "—"}</td>
                    <td className="px-4 py-3"><ComplaintStatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{meta.total} complaints · Page {page} of {meta.totalPages}</p>
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
