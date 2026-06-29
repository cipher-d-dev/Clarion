"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { AiClassificationCard } from "@/components/ai-classification-card";
import { useComplaint, useComplaintTimeline } from "@/hooks/use-api";

type TimelineEvent = {
  id: string;
  description: string;
  createdAt: string;
};

export default function ManagementComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cData, isLoading } = useComplaint(id);
  const { data: tlData } = useComplaintTimeline(id);
  const c = cData?.data;
  const timeline = (tlData?.data ?? []) as TimelineEvent[];

  if (isLoading) return <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />;
  if (!c) return <p className="text-sm text-muted-foreground">Complaint not found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={c.title}
        description={c.referenceNumber}
        action={<Link href="/dashboard/management/complaints" className="text-sm text-muted-foreground hover:underline">← Back</Link>}
      />

      <div className="flex flex-wrap gap-2 items-center">
        <ComplaintStatusBadge status={c.status} />
        {c.department && <span className="text-xs text-muted-foreground">{c.department.name}</span>}
        {c.category && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground">{c.category}</span>}
        {c.isAnonymous && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Anonymous</span>}
      </div>

      <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] p-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.description}</p>
      </div>

      {c.aiMetadata && <AiClassificationCard aiMetadata={c.aiMetadata} />}

      {timeline.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Timeline</h2>
          <ol className="space-y-3">
            {timeline.map((ev) => (
              <li key={ev.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-700" />
                <div>
                  <p className="text-slate-800 dark:text-slate-100">{ev.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">Submitted</dt><dd>{new Date(c.createdAt).toLocaleDateString()}</dd></div>
        {c.resolvedAt && <div><dt className="text-xs text-muted-foreground">Resolved</dt><dd>{new Date(c.resolvedAt).toLocaleDateString()}</dd></div>}
        {c.satisfactionRating && <div><dt className="text-xs text-muted-foreground">Rating</dt><dd>{"★".repeat(c.satisfactionRating)}{"☆".repeat(5 - c.satisfactionRating)}</dd></div>}
      </dl>
    </div>
  );
}
