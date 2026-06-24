import { cn } from "@clarion/ui";
import { ComplaintStatus, TicketPriority, TicketStatus } from "@clarion/shared";

type BadgeStyle = {
  container: string;
  dot: string;
  pulse?: boolean;
};

const COMPLAINT_STATUS_STYLES: Record<ComplaintStatus, BadgeStyle> = {
  [ComplaintStatus.DRAFT]: {
    container: "bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50",
    dot: "bg-slate-400",
  },
  [ComplaintStatus.SUBMITTED]: {
    container: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30",
    dot: "bg-blue-500",
  },
  [ComplaintStatus.UNDER_REVIEW]: {
    container: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30",
    dot: "bg-amber-500",
  },
  [ComplaintStatus.ASSIGNED]: {
    container: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30",
    dot: "bg-indigo-500",
  },
  [ComplaintStatus.IN_PROGRESS]: {
    container: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30",
    dot: "bg-orange-500",
  },
  [ComplaintStatus.AWAITING_INFORMATION]: {
    container: "bg-yellow-50 text-yellow-800 border-yellow-200/60 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/30",
    dot: "bg-yellow-500",
  },
  [ComplaintStatus.ESCALATED]: {
    container: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30",
    dot: "bg-rose-500",
    pulse: true,
  },
  [ComplaintStatus.RESOLVED]: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30",
    dot: "bg-emerald-500",
  },
  [ComplaintStatus.CLOSED]: {
    container: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700/20",
    dot: "bg-slate-400",
  },
  [ComplaintStatus.REJECTED]: {
    container: "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30",
    dot: "bg-red-500",
  },
};

const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
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
  const style = COMPLAINT_STATUS_STYLES[s] ?? {
    container: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide shadow-sm transition-all duration-200",
      style.container
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
      {COMPLAINT_STATUS_LABELS[s] ?? status}
    </span>
  );
}

const PRIORITY_STYLES: Record<TicketPriority, BadgeStyle> = {
  [TicketPriority.LOW]: {
    container: "bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50",
    dot: "bg-slate-400",
  },
  [TicketPriority.MEDIUM]: {
    container: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30",
    dot: "bg-blue-500",
  },
  [TicketPriority.HIGH]: {
    container: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30",
    dot: "bg-orange-500",
  },
  [TicketPriority.URGENT]: {
    container: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30",
    dot: "bg-rose-500",
    pulse: true,
  },
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority | string }) {
  const p = priority as TicketPriority;
  const style = PRIORITY_STYLES[p] ?? {
    container: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all duration-200",
      style.container
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
      {priority}
    </span>
  );
}

const TICKET_STATUS_STYLES: Record<TicketStatus, BadgeStyle> = {
  [TicketStatus.OPEN]: {
    container: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30",
    dot: "bg-blue-500",
  },
  [TicketStatus.ASSIGNED]: {
    container: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30",
    dot: "bg-indigo-500",
  },
  [TicketStatus.IN_PROGRESS]: {
    container: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30",
    dot: "bg-orange-500",
  },
  [TicketStatus.PENDING_INFO]: {
    container: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30",
    dot: "bg-amber-500",
  },
  [TicketStatus.RESOLVED]: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30",
    dot: "bg-emerald-500",
  },
  [TicketStatus.CLOSED]: {
    container: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700/20",
    dot: "bg-slate-400",
  },
};

export function TicketStatusBadge({ status }: { status: TicketStatus | string }) {
  const s = status as TicketStatus;
  const style = TICKET_STATUS_STYLES[s] ?? {
    container: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  const label = s.replace("_", " ");
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide shadow-sm transition-all duration-200",
      style.container
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
      {label}
    </span>
  );
}

