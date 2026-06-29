"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Input, cn } from "@clarion/ui";
import { PageHeader, ConfirmDialog, useToast } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { AiClassificationCard } from "@/components/ai-classification-card";
import {
  useComplaint,
  useComplaintTimeline,
  useComplaintNotes,
  useUpdateComplaintStatus,
  useAddComplaintNote,
} from "@/hooks/use-api";
import { ComplaintStatus } from "@clarion/shared";
import {
  ArrowRight, FilePlus, UserPlus, MessageSquare, Star,
  ShieldCheck, GitCommit, Building2, Tag, Calendar, User, Lock, Send,
} from "lucide-react";

const NEXT_STATUSES: Record<string, ComplaintStatus[]> = {
  SUBMITTED: [ComplaintStatus.UNDER_REVIEW, ComplaintStatus.REJECTED],
  UNDER_REVIEW: [ComplaintStatus.ASSIGNED, ComplaintStatus.AWAITING_INFORMATION, ComplaintStatus.REJECTED],
  ASSIGNED: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.AWAITING_INFORMATION, ComplaintStatus.ESCALATED],
  IN_PROGRESS: [ComplaintStatus.RESOLVED, ComplaintStatus.ESCALATED, ComplaintStatus.AWAITING_INFORMATION],
  AWAITING_INFORMATION: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.CLOSED],
  ESCALATED: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED],
  RESOLVED: [ComplaintStatus.CLOSED],
  CLOSED: [], REJECTED: [], DRAFT: [ComplaintStatus.SUBMITTED],
};

const STATUS_INTENT: Record<string, string> = {
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300",
  ASSIGNED: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-300",
  IN_PROGRESS: "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-300",
  AWAITING_INFORMATION: "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-900/40 dark:bg-yellow-950/20 dark:text-yellow-300",
  ESCALATED: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300",
  CLOSED: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#111113] dark:text-slate-400",
  REJECTED: "border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300",
};

function eventIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("submit") || t.includes("create")) return <FilePlus className="h-3.5 w-3.5 text-blue-500" />;
  if (t.includes("assign")) return <UserPlus className="h-3.5 w-3.5 text-indigo-500" />;
  if (t.includes("note")) return <MessageSquare className="h-3.5 w-3.5 text-amber-500" />;
  if (t.includes("rate") || t.includes("satisfaction")) return <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />;
  if (t.includes("resolve")) return <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
  return <GitCommit className="h-3.5 w-3.5 text-slate-400" />;
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#111113] overflow-hidden shadow-sm">
      <div className="flex items-center border-b border-slate-100/80 dark:border-white/[0.05] px-6 py-3.5">
        <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {icon}{title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

type InternalNote = { id: string; content: string; createdAt: string; author: { firstName: string; lastName: string } };
type TimelineEvent = { id: string; eventType: string; description: string; createdAt: string };

export default function DeptHeadComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: complaintRes, isLoading } = useComplaint(id);
  const { data: timelineRes } = useComplaintTimeline(id);
  const { data: notesRes } = useComplaintNotes(id);
  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateComplaintStatus();
  const { mutateAsync: addNote, isPending: addingNote } = useAddComplaintNote();
  const [confirmStatus, setConfirmStatus] = useState<ComplaintStatus | null>(null);
  const [noteText, setNoteText] = useState("");
  const toast = useToast();

  const complaint = complaintRes?.data;
  const timeline = (timelineRes?.data ?? []) as TimelineEvent[];
  const notes = (notesRes?.data ?? []) as InternalNote[];

  if (isLoading) return <div className="space-y-4 max-w-3xl">{[1,2,3].map(i=><div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50"/>)}</div>;
  if (!complaint) return <p className="text-sm text-slate-500">Complaint not found.</p>;

  const nextStatuses = NEXT_STATUSES[complaint.status] ?? [];

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title={complaint.title}
        description={complaint.referenceNumber}
        breadcrumb={[{ label: "Complaints", href: "/dashboard/dept-head/complaints" }, { label: complaint.referenceNumber }]}
        action={<ComplaintStatusBadge status={complaint.status} />}
      />

      <Section title="Complaint Details">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 text-sm mb-5">
          {[
            { icon: User, label: "Submitter", value: complaint.isAnonymous ? "Anonymous" : complaint.submitter ? `${complaint.submitter.firstName} ${complaint.submitter.lastName}` : "—" },
            { icon: Building2, label: "Department", value: complaint.department?.name ?? "—" },
            { icon: Tag, label: "Category", value: complaint.category ?? "—" },
            { icon: Calendar, label: "Submitted", value: new Date(complaint.createdAt).toLocaleDateString() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"><Icon className="h-3 w-3" />{label}</p>
              <p className="mt-1.5 font-semibold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 dark:border-white/[0.05] pt-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Description</p>
          <p className="text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{complaint.description}</p>
        </div>
      </Section>

      <AiClassificationCard aiMetadata={complaint.aiMetadata} sentimentScore={complaint.sentimentScore} isStaffView />

      {nextStatuses.length > 0 && (
        <Section title="Update Status" icon={<ArrowRight className="h-3 w-3" />}>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button key={s} onClick={() => setConfirmStatus(s)}
                className={cn("flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition-all cursor-pointer",
                  STATUS_INTENT[s] ?? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100")}>
                {s.replace(/_/g, " ")}<ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Internal Notes" icon={<Lock className="h-3 w-3" />}>
        <div className="space-y-3 mb-5">
          {notes.length === 0 ? <p className="text-sm text-slate-400 dark:text-slate-500">No notes yet.</p> : notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] p-4">
              <p className="text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">{n.content}</p>
              <p className="text-[11px] text-slate-400 mt-2"><span className="font-medium">{n.author.firstName} {n.author.lastName}</span> · {new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5 border-t border-slate-100 dark:border-white/[0.05] pt-4">
          <Input placeholder="Add an internal note…" value={noteText} onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
            className="flex-1 text-sm" />
          <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim() || addingNote} className="gap-2 shrink-0">
            <Send className="h-3.5 w-3.5" />{addingNote ? "Adding…" : "Add"}
          </Button>
        </div>
      </Section>

      <Section title="Activity Timeline">
        {timeline.length === 0 ? <p className="text-sm text-slate-400 dark:text-slate-500">No activity yet.</p> : (
          <div className="relative space-y-5 pl-9">
            <div className="absolute left-[14px] top-2 bottom-2 w-px bg-slate-100 dark:bg-white/[0.06]" />
            {timeline.map((e) => (
              <div key={e.id} className="relative">
                <div className="absolute -left-9 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#111113] shadow-sm z-10">{eventIcon(e.eventType)}</div>
                <div className="pt-0.5">
                  <p className="text-[13.5px] font-medium text-slate-800 dark:text-slate-200 leading-snug">{e.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <ConfirmDialog open={!!confirmStatus} title="Update complaint status"
        description={`Move this complaint to "${confirmStatus?.replace(/_/g, " ")}"?`}
        confirmLabel="Update Status"
        onConfirm={async () => {
          if (!confirmStatus) return;
          try { await updateStatus({ id, data: { status: confirmStatus } }); setConfirmStatus(null); toast(`Status updated`); }
          catch { toast("Failed to update status", "error"); }
        }}
        onCancel={() => setConfirmStatus(null)} loading={updatingStatus} />
    </div>
  );
}
