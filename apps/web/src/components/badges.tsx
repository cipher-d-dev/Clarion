import { cn } from "@clarion/ui";
import { ComplaintStatus, TicketPriority, TicketStatus } from "@clarion/shared";

// ── Complaint Status Badge ────────────────────────────────────────────────────

const COMPLAINT_STYLES: Record<ComplaintStatus, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  [ComplaintStatus.DRAFT]:               { bg: "bg-slate-100 dark:bg-slate-800/60",        text: "text-slate-500 dark:text-slate-400",   dot: "bg-slate-400" },
  [ComplaintStatus.SUBMITTED]:           { bg: "bg-blue-50 dark:bg-blue-500/10",            text: "text-blue-700 dark:text-blue-300",      dot: "bg-blue-500" },
  [ComplaintStatus.UNDER_REVIEW]:        { bg: "bg-amber-50 dark:bg-amber-500/10",          text: "text-amber-700 dark:text-amber-300",    dot: "bg-amber-500" },
  [ComplaintStatus.ASSIGNED]:            { bg: "bg-indigo-50 dark:bg-indigo-500/10",        text: "text-indigo-700 dark:text-indigo-300",  dot: "bg-indigo-500" },
  [ComplaintStatus.IN_PROGRESS]:         { bg: "bg-orange-50 dark:bg-orange-500/10",        text: "text-orange-700 dark:text-orange-300",  dot: "bg-orange-500" },
  [ComplaintStatus.AWAITING_INFORMATION]:{ bg: "bg-yellow-50 dark:bg-yellow-500/10",        text: "text-yellow-700 dark:text-yellow-300",  dot: "bg-yellow-500" },
  [ComplaintStatus.ESCALATED]:           { bg: "bg-rose-100 dark:bg-rose-500/15",           text: "text-rose-700 dark:text-rose-300",      dot: "bg-rose-500",   pulse: true },
  [ComplaintStatus.RESOLVED]:            { bg: "bg-emerald-50 dark:bg-emerald-500/10",      text: "text-emerald-700 dark:text-emerald-300",dot: "bg-emerald-500" },
  [ComplaintStatus.CLOSED]:              { bg: "bg-slate-100 dark:bg-slate-800/40",         text: "text-slate-500 dark:text-slate-400",   dot: "bg-slate-400" },
  [ComplaintStatus.REJECTED]:            { bg: "bg-red-50 dark:bg-red-500/10",              text: "text-red-700 dark:text-red-300",        dot: "bg-red-500" },
};

const COMPLAINT_LABELS: Record<ComplaintStatus, string> = {
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

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus | string }) {
  const s = status as ComplaintStatus;
  const style = COMPLAINT_STYLES[s] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", style.bg, style.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
      {COMPLAINT_LABELS[s] ?? status}
    </span>
  );
}

// ── Ticket Priority Badge ─────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<TicketPriority, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  [TicketPriority.LOW]:    { bg: "bg-slate-100 dark:bg-slate-800/60",  text: "text-slate-500 dark:text-slate-400",  dot: "bg-slate-400" },
  [TicketPriority.MEDIUM]: { bg: "bg-sky-50 dark:bg-sky-500/10",       text: "text-sky-700 dark:text-sky-300",      dot: "bg-sky-500" },
  [TicketPriority.HIGH]:   { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-300",dot: "bg-orange-500" },
  [TicketPriority.URGENT]: { bg: "bg-rose-100 dark:bg-rose-500/15",    text: "text-rose-700 dark:text-rose-300",    dot: "bg-rose-500", pulse: true },
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority | string }) {
  const p = priority as TicketPriority;
  const style = PRIORITY_STYLES[p] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", style.bg, style.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
      {priority}
    </span>
  );
}

// ── Ticket Status Badge ───────────────────────────────────────────────────────

const TICKET_STATUS_STYLES: Record<TicketStatus, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  [TicketStatus.OPEN]:        { bg: "bg-blue-50 dark:bg-blue-500/10",     text: "text-blue-700 dark:text-blue-300",    dot: "bg-blue-500" },
  [TicketStatus.ASSIGNED]:    { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-300",dot: "bg-indigo-500" },
  [TicketStatus.IN_PROGRESS]: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-300",dot: "bg-orange-500", pulse: true },
  [TicketStatus.PENDING_INFO]:{ bg: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-700 dark:text-amber-300",  dot: "bg-amber-500" },
  [TicketStatus.RESOLVED]:    { bg: "bg-emerald-50 dark:bg-emerald-500/10",text:"text-emerald-700 dark:text-emerald-300",dot:"bg-emerald-500" },
  [TicketStatus.CLOSED]:      { bg: "bg-slate-100 dark:bg-slate-800/40",  text: "text-slate-500 dark:text-slate-400",  dot: "bg-slate-400" },
};

export function TicketStatusBadge({ status }: { status: TicketStatus | string }) {
  const s = status as TicketStatus;
  const style = TICKET_STATUS_STYLES[s] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", style.bg, style.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
      {s.replace(/_/g, " ")}
    </span>
  );
}
