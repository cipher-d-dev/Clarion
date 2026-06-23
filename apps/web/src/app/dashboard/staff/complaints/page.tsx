"use client";

import { useState } from "react";
import Link from "next/link";
import { useComplaints } from "@/hooks/use-api";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { Button } from "@clarion/ui";
import { ComplaintStatus } from "@clarion/shared";

export default function StaffComplaintsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data, isLoading } = useComplaints({
    page,
    pageSize: 15,
    ...(status && { status: status as ComplaintStatus }),
    ...(search && { search }),
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="All Complaints" />

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by title or ref…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm w-56"
        />
        <div className="flex flex-wrap gap-1.5">
          {["", ...Object.values(ComplaintStatus)].map((s) => (
            <button key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                status === s
                  ? "border-clarion-navy-800 bg-clarion-navy-800 text-white"
                  : "border-gray-200 text-gray-600 hover:border-clarion-navy-300"
              }`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse"/>)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No complaints found" />
      ) : (
        <>
          <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Reference","Title","Department","Category","Status","Submitted"].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/staff/complaints/${c.id}`} className="font-medium text-clarion-navy-800 hover:underline truncate block max-w-[200px]">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.department?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.category ?? "—"}</td>
                    <td className="px-4 py-3"><ComplaintStatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{meta.total} complaints · Page {page} of {meta.totalPages}</p>
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
