"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/badges";
import { useTicket, useComplaintTimeline } from "@/hooks/use-api";

type TimelineEvent = {
  id: string;
  description: string;
  createdAt: string;
};

export default function ManagementTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tData, isLoading } = useTicket(id);
  const t = tData?.data;
  const { data: tlData } = useComplaintTimeline(t?.complaintId ?? "");
  const timeline = (tlData?.data ?? []) as TimelineEvent[];

  if (isLoading) return <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />;
  if (!t) return <p className="text-sm text-muted-foreground">Ticket not found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={t.title ?? t.complaint?.title}
        description={t.referenceNumber}
        action={<Link href="/dashboard/management/tickets" className="text-sm text-muted-foreground hover:underline">← Back</Link>}
      />

      <div className="flex flex-wrap gap-2 items-center">
        <TicketStatusBadge status={t.status} />
        <TicketPriorityBadge priority={t.priority} />
        {t.slaBreached && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">SLA Breached</span>}
        {t.escalatedLevel > 0 && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">Escalated L{t.escalatedLevel}</span>}
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-white p-4 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">Department</dt><dd>{t.department?.name ?? "—"}</dd></div>
        <div>
          <dt className="text-xs text-muted-foreground">Assignee</dt>
          <dd>{t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : <span className="text-amber-600">Unassigned</span>}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">SLA Deadline</dt>
          <dd>{t.slaDeadline ? new Date(t.slaDeadline).toLocaleDateString() : "—"}</dd>
        </div>
        <div><dt className="text-xs text-muted-foreground">Created</dt><dd>{new Date(t.createdAt).toLocaleDateString()}</dd></div>
        {t.resolvedAt && <div><dt className="text-xs text-muted-foreground">Resolved</dt><dd>{new Date(t.resolvedAt).toLocaleDateString()}</dd></div>}
        <div><dt className="text-xs text-muted-foreground">Severity</dt><dd>{t.severity}</dd></div>
      </dl>

      {t.complaint && (
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-clarion-navy-700">Complaint</h2>
          <Link href={`/dashboard/management/complaints/${t.complaintId}`} className="text-sm text-clarion-navy-600 hover:underline font-medium">
            {t.complaint.title}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{t.complaint.description}</p>
        </div>
      )}

      {timeline.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-clarion-navy-700">Timeline</h2>
          <ol className="space-y-3">
            {timeline.map((ev) => (
              <li key={ev.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-clarion-navy-300" />
                <div>
                  <p className="text-clarion-navy-800">{ev.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
