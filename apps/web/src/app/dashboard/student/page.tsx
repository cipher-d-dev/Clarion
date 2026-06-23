"use client";

import Link from "next/link";
import { Button } from "@clarion/ui";
import { Plus } from "lucide-react";
import { useComplaints } from "@/hooks/use-api";
import { StatCard, PageHeader, EmptyState } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { ComplaintStatus } from "@clarion/shared";

export default function StudentOverviewPage() {
  const { data, isLoading } = useComplaints({ pageSize: 5 });
  const items = data?.data ?? [];
  const meta = data?.meta;

  const counts = {
    total: meta?.total ?? 0,
    active: items.filter((c) =>
      [ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.IN_PROGRESS, ComplaintStatus.ASSIGNED]
        .includes(c.status)
    ).length,
    resolved: items.filter((c) => c.status === ComplaintStatus.RESOLVED).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Complaints"
        description="Track and manage your submitted complaints"
        action={
          <Link href="/dashboard/student/complaints/new">
            <Button variant="accent" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New Complaint
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Submitted" value={meta?.total ?? 0} />
        <StatCard label="Active" value={counts.active} accent />
        <StatCard label="Resolved" value={counts.resolved} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-clarion-navy-700">Recent Complaints</h2>
          <Link href="/dashboard/student/complaints" className="text-xs text-clarion-navy-500 hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="h-32 rounded-lg bg-gray-50 animate-pulse" />
        ) : items.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Submit your first complaint and we'll track it for you."
            action={
              <Link href="/dashboard/student/complaints/new">
                <Button variant="accent" size="sm">Submit complaint</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/student/complaints/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-clarion-navy-800 truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.referenceNumber}</p>
                </div>
                <ComplaintStatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
