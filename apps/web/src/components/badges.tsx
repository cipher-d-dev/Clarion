import { cn } from "@clarion/ui";
import { ComplaintStatus, TicketPriority, TicketStatus } from "@clarion/shared";

const COMPLAINT_STATUS_STYLES: Record<ComplaintStatus, string> = {
  [ComplaintStatus.DRAFT]:               "bg-gray-100 text-gray-600",
  [ComplaintStatus.SUBMITTED]:           "bg-blue-100 text-blue-700",
  [ComplaintStatus.UNDER_REVIEW]:        "bg-yellow-100 text-yellow-700",
  [ComplaintStatus.ASSIGNED]:            "bg-purple-100 text-purple-700",
  [ComplaintStatus.IN_PROGRESS]:         "bg-orange-100 text-orange-700",
  [ComplaintStatus.AWAITING_INFORMATION]:"bg-amber-100 text-amber-700",
  [ComplaintStatus.ESCALATED]:           "bg-red-100 text-red-700",
  [ComplaintStatus.RESOLVED]:            "bg-green-100 text-green-700",
  [ComplaintStatus.CLOSED]:              "bg-gray-200 text-gray-500",
  [ComplaintStatus.REJECTED]:            "bg-red-200 text-red-600",
};

const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.DRAFT]:               "Draft",
  [ComplaintStatus.SUBMITTED]:           "Submitted",
  [ComplaintStatus.UNDER_REVIEW]:        "Under Review",
  [ComplaintStatus.ASSIGNED]:            "Assigned",
  [ComplaintStatus.IN_PROGRESS]:         "In Progress",
  [ComplaintStatus.AWAITING_INFORMATION]:"Awaiting Info",
  [ComplaintStatus.ESCALATED]:           "Escalated",
  [ComplaintStatus.RESOLVED]:            "Resolved",
  [ComplaintStatus.CLOSED]:              "Closed",
  [ComplaintStatus.REJECTED]:            "Rejected",
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus | string }) {
  const s = status as ComplaintStatus;
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      COMPLAINT_STATUS_STYLES[s] ?? "bg-gray-100 text-gray-600",
    )}>
      {COMPLAINT_STATUS_LABELS[s] ?? status}
    </span>
  );
}

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  [TicketPriority.LOW]:    "bg-gray-100 text-gray-600",
  [TicketPriority.MEDIUM]: "bg-blue-100 text-blue-700",
  [TicketPriority.HIGH]:   "bg-orange-100 text-orange-700",
  [TicketPriority.URGENT]: "bg-red-100 text-red-700",
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority | string }) {
  const p = priority as TicketPriority;
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
      PRIORITY_STYLES[p] ?? "bg-gray-100 text-gray-600",
    )}>
      {priority}
    </span>
  );
}

const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]:        "bg-blue-100 text-blue-700",
  [TicketStatus.ASSIGNED]:    "bg-purple-100 text-purple-700",
  [TicketStatus.IN_PROGRESS]: "bg-orange-100 text-orange-700",
  [TicketStatus.PENDING_INFO]:"bg-amber-100 text-amber-700",
  [TicketStatus.RESOLVED]:    "bg-green-100 text-green-700",
  [TicketStatus.CLOSED]:      "bg-gray-200 text-gray-500",
};

export function TicketStatusBadge({ status }: { status: TicketStatus | string }) {
  const s = status as TicketStatus;
  const label = s.replace("_", " ");
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      TICKET_STATUS_STYLES[s] ?? "bg-gray-100 text-gray-600",
    )}>
      {label}
    </span>
  );
}
