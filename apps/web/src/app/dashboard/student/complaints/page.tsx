"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clarion/ui";
import { Plus } from "lucide-react";
import { useComplaints } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { ComplaintStatus } from "@clarion/shared";

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
        action={
          <Link href="/dashboard/student/complaints/new">
            <Button variant="accent" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New
            </Button>
          </Link>
        }
      />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", ...Object.values(ComplaintStatus)].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s as ComplaintStatus | ""); setPage(1); }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? "border-clarion-navy-800 bg-clarion-navy-800 text-white"
                : "border-gray-200 text-gray-600 hover:border-clarion-navy-300"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No complaints found"
          action={<Link href="/dashboard/student/complaints/new"><Button variant="accent" size="sm">Submit one</Button></Link>}
        />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/student/complaints/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-clarion-navy-800 truncate">{c.title}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{c.referenceNumber}</span>
                    {c.department && <span className="text-xs text-muted-foreground">{c.department.name}</span>}
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ComplaintStatusBadge status={c.status} />
              </Link>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {meta.total} complaints · Page {page} of {meta.totalPages}
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
