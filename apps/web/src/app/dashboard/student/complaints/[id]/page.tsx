"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@clarion/ui";
import { PageHeader } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { AiClassificationCard } from "@/components/ai-classification-card";
import { useComplaint, useComplaintTimeline, useRateComplaint } from "@/hooks/use-api";
import { ComplaintStatus } from "@clarion/shared";
import { useToast } from "@/components/ui-helpers";
import { cn } from "@clarion/ui";
import {
  Check,
  Clock,
  MessageSquare,
  UserPlus,
  FilePlus,
  Star,
  GitCommit,
  ShieldCheck,
  Sparkles,
  XCircle,
  Building2,
  Tag,
  Calendar,
  EyeOff,
} from "lucide-react";

// ── Progress tracker ──────────────────────────────────────────────────────────

const STEPS = [
  { key: "submitted", label: "Submitted", statuses: [ComplaintStatus.SUBMITTED] },
  { key: "review", label: "Under Review", statuses: [ComplaintStatus.UNDER_REVIEW] },
  { key: "assigned", label: "Assigned", statuses: [ComplaintStatus.ASSIGNED] },
  { key: "progress", label: "In Progress", statuses: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.AWAITING_INFORMATION] },
  { key: "resolved", label: "Resolved", statuses: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] },
];

function getActiveStep(status: ComplaintStatus): number {
  if (status === ComplaintStatus.DRAFT) return -1;
  if (status === ComplaintStatus.SUBMITTED) return 0;
  if (status === ComplaintStatus.UNDER_REVIEW) return 1;
  if (status === ComplaintStatus.ASSIGNED) return 2;
  if ([ComplaintStatus.IN_PROGRESS, ComplaintStatus.AWAITING_INFORMATION, ComplaintStatus.ESCALATED].includes(status)) return 3;
  if ([ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(status)) return 4;
  return 0;
}

function ProgressTracker({ status }: { status: ComplaintStatus }) {
  const current = getActiveStep(status);
  const isRejected = status === ComplaintStatus.REJECTED;
  const progressPct = isRejected ? 0 : Math.min(100, (current / 4) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-sm">
      {/* Progress bar (mobile + desktop supplement) */}
      <div className="mb-6 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isRejected ? "bg-red-400" : "bg-emerald-500"
          )}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {STEPS.map((step, idx) => {
          const done = !isRejected && idx < current;
          const active = !isRejected && idx === current;
          const pending = idx > current || isRejected;

          return (
            <div key={step.key} className="flex items-center gap-3 md:flex-col md:items-center md:gap-2 flex-1">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-bold shrink-0 transition-all duration-200",
                done && "border-emerald-400 bg-emerald-500 text-white",
                active && "border-clarion-navy-800 bg-clarion-navy-800 text-white dark:border-clarion-amber-500 dark:bg-clarion-amber-500 dark:text-clarion-navy-950 ring-4 ring-clarion-navy-100 dark:ring-clarion-amber-500/20",
                pending && "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600"
              )}>
                {done ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : active ? <Clock className="h-3.5 w-3.5" /> : <span>{idx + 1}</span>}
              </div>
              <p className={cn(
                "text-[11px] font-semibold uppercase tracking-wider transition-colors md:text-center",
                done && "text-emerald-600 dark:text-emerald-400",
                active && "text-clarion-navy-900 dark:text-slate-50",
                pending && "text-slate-400 dark:text-slate-600"
              )}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <XCircle className="h-4 w-4 shrink-0" />
          This complaint has been rejected.
        </div>
      )}
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function eventIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("submit") || t.includes("create")) return <FilePlus className="h-3.5 w-3.5 text-blue-500" />;
  if (t.includes("assign")) return <UserPlus className="h-3.5 w-3.5 text-indigo-500" />;
  if (t.includes("note")) return <MessageSquare className="h-3.5 w-3.5 text-amber-500" />;
  if (t.includes("rate") || t.includes("satisfaction")) return <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />;
  if (t.includes("resolve")) return <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
  return <GitCommit className="h-3.5 w-3.5 text-slate-400" />;
}

function Timeline({ events }: { events: { id: string; eventType: string; description: string; createdAt: string }[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 py-2">No activity recorded yet.</p>;
  }
  return (
    <div className="relative space-y-5 pl-9">
      {/* Vertical line */}
      <div className="absolute left-[14px] top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800" />
      {events.map((e) => (
        <div key={e.id} className="relative flex gap-4 animate-in fade-in slide-in-from-left-1 duration-200">
          <div className="absolute -left-9 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm z-10">
            {eventIcon(e.eventType)}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[13.5px] font-medium text-slate-800 dark:text-slate-200 leading-snug">{e.description}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {new Date(e.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Star rating widget ────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = hover !== null ? n <= hover : n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95"
          >
            <Star className={cn(
              "h-8 w-8 stroke-[1.5] transition-colors",
              filled ? "text-clarion-amber-500 fill-clarion-amber-400" : "text-slate-200 dark:text-slate-700"
            )} />
          </button>
        );
      })}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-3.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StudentComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: res, isLoading } = useComplaint(id);
  const { data: timelineRes } = useComplaintTimeline(id);
  const { mutateAsync: rate, isPending: rating } = useRateComplaint();
  const [starValue, setStarValue] = useState(0);
  const [rated, setRated] = useState(false);
  const toast = useToast();

  const complaint = res?.data;
  const timeline = timelineRes?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />)}
      </div>
    );
  }
  if (!complaint) return <p className="text-sm text-slate-500">Complaint not found.</p>;

  const canRate = complaint.status === ComplaintStatus.RESOLVED && complaint.satisfactionRating === null && !rated;

  const handleRate = async () => {
    if (!starValue) return;
    try {
      await rate({ id, data: { rating: starValue } });
      setRated(true);
      toast("Thank you for your feedback!");
    } catch {
      toast("Failed to submit rating.", "error");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title={complaint.title}
        description={`Reference: ${complaint.referenceNumber}`}
        breadcrumb={[
          { label: "Complaints", href: "/dashboard/student/complaints" },
          { label: complaint.referenceNumber },
        ]}
        action={<ComplaintStatusBadge status={complaint.status} />}
      />

      {/* Progress tracker */}
      <ProgressTracker status={complaint.status as ComplaintStatus} />

      {/* Details grid */}
      <Section title="Complaint Details">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 text-sm">
          {[
            { icon: Tag, label: "Category", value: complaint.category ?? "—" },
            { icon: Building2, label: "Department", value: complaint.department?.name ?? "—" },
            { icon: Calendar, label: "Submitted", value: new Date(complaint.createdAt).toLocaleDateString() },
            { icon: EyeOff, label: "Anonymous", value: complaint.isAnonymous ? "Yes" : "No" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Icon className="h-3 w-3" /> {label}
              </p>
              <p className="mt-1.5 font-semibold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Description</p>
          <p className="text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{complaint.description}</p>
        </div>
      </Section>

      {/* AI Classification */}
      <AiClassificationCard aiMetadata={complaint.aiMetadata} sentimentScore={complaint.sentimentScore} />

      {/* Rating widget */}
      {canRate && (
        <div className="rounded-xl border border-clarion-amber-200/60 bg-clarion-amber-50/40 dark:border-clarion-amber-900/30 dark:bg-clarion-amber-500/[0.04] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-clarion-amber-200/50 bg-clarion-amber-100/50 text-clarion-amber-600 dark:border-clarion-amber-900/30 dark:bg-clarion-amber-500/10 dark:text-clarion-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-50">How was your experience?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rate how well your complaint was handled. Your feedback improves the process.
                </p>
              </div>
              <StarRating value={starValue} onChange={setStarValue} />
              <Button
                variant="accent"
                size="sm"
                disabled={!starValue || rating}
                onClick={handleRate}
              >
                {rating ? "Submitting…" : "Submit Rating"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {complaint.satisfactionRating !== null && complaint.satisfactionRating !== undefined && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 px-6 py-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Your Rating</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4.5 w-4.5",
                    i < (complaint.satisfactionRating ?? 0) ? "fill-clarion-amber-400 text-clarion-amber-500" : "text-slate-200 dark:text-slate-700"
                  )}
                />
              ))}
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 rounded-lg">
            Submitted
          </span>
        </div>
      )}

      {/* Timeline */}
      <Section title="Activity Timeline">
        <Timeline events={timeline as { id: string; eventType: string; description: string; createdAt: string }[]} />
      </Section>
    </div>
  );
}
