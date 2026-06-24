"use client";

import Link from "next/link";
import { Button } from "@clarion/ui";
import { Plus, FileText, Activity, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { useComplaints } from "@/hooks/use-api";
import { StatCard, PageHeader, EmptyState } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { ComplaintStatus } from "@clarion/shared";
import { cn } from "@clarion/ui";

function ComplaintCard({ c }: { c: { id: string; title: string; referenceNumber: string; status: ComplaintStatus; createdAt: string; department?: { name: string } | null } }) {
  const isActive = [ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.IN_PROGRESS, ComplaintStatus.ASSIGNED].includes(c.status);
  return (
    <Link
      href={`/dashboard/student/complaints/${c.id}`}
      className={cn(
        "group flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-150 hover:-translate-y-0.5",
        isActive
          ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
          : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800/60 dark:bg-slate-900/30"
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          isActive
            ? "border-clarion-navy-100 bg-clarion-navy-50 text-clarion-navy-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
            : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900"
        )}>
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-snug group-hover:text-clarion-navy-800 dark:group-hover:text-slate-50 transition-colors">
            {c.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
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
  );
}

export default function StudentOverviewPage() {
  const { data, isLoading } = useComplaints({ pageSize: 5 });
  const items = data?.data ?? [];
  const meta = data?.meta;

  const active = items.filter((c) =>
    [ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.IN_PROGRESS, ComplaintStatus.ASSIGNED].includes(c.status)
  ).length;
  const resolved = items.filter((c) => c.status === ComplaintStatus.RESOLVED).length;

  return (
    <div className="space-y-7">
      <PageHeader
        title="My Dashboard"
        description="Track and manage your submitted complaints"
        action={
          <Link href="/dashboard/student/complaints/new">
            <Button variant="accent" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New Complaint
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Submitted"
          value={meta?.total ?? 0}
          icon={<FileText className="h-4.5 w-4.5" />}
        />
        <StatCard
          label="Active"
          value={active}
          accent={active > 0}
          icon={<Activity className="h-4.5 w-4.5" />}
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
        />
      </div>

      {/* Recent complaints */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Complaints</h2>
          <Link
            href="/dashboard/student/complaints"
            className="flex items-center gap-1 text-xs font-medium text-clarion-navy-600 dark:text-clarion-navy-300 hover:text-clarion-navy-800 dark:hover:text-clarion-navy-100 transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Submit your first complaint and we'll track every step for you."
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
          <div className="space-y-2">
            {items.map((c) => <ComplaintCard key={c.id} c={c as Parameters<typeof ComplaintCard>[0]["c"]} />)}
          </div>
        )}
      </div>
    </div>
  );
}
