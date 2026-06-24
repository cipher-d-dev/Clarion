"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@clarion/ui";
import { PageHeader, ConfirmDialog, useToast } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge, ComplaintStatusBadge } from "@/components/badges";
import {
  useTicket, useAssignTicket, useUpdateTicketStatus,
  useUsers, useAddComplaintNote, useComplaintNotes,
} from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { TicketStatus, UserRole } from "@clarion/shared";
import { ChevronRight } from "lucide-react";

const STAFF_ROLES = [UserRole.ADMIN_STAFF, UserRole.DEPT_HEAD, UserRole.INSTITUTION_MGMT];

const NEXT_STATUSES: Record<string, TicketStatus[]> = {
  OPEN: [TicketStatus.ASSIGNED, TicketStatus.CLOSED],
  ASSIGNED: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_INFO, TicketStatus.CLOSED],
  IN_PROGRESS: [TicketStatus.RESOLVED, TicketStatus.PENDING_INFO, TicketStatus.CLOSED],
  PENDING_INFO: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  RESOLVED: [TicketStatus.CLOSED],
  CLOSED: [],
};

type StaffUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

type InternalNote = {
  id: string;
  content: string;
  createdAt: string;
  author: { firstName: string; lastName: string };
};

export default function StaffTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticketRes, isLoading } = useTicket(id);
  const { data: usersRes } = useUsers();
  const { mutateAsync: assign, isPending: assigning } = useAssignTicket();
  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateTicketStatus();

  const ticket = ticketRes?.data;
  const complaintId = ticket?.complaint?.id;
  const { data: notesRes } = useComplaintNotes(complaintId ?? "");
  const { mutateAsync: addNote, isPending: addingNote } = useAddComplaintNote();

  const [assigneeId, setAssigneeId] = useState("");
  const [confirmStatus, setConfirmStatus] = useState<TicketStatus | null>(null);
  const [noteText, setNoteText] = useState("");

  const users = (usersRes?.data ?? []) as StaffUser[];
  const currentUser = useAuthStore((s) => s.user);
  const assignableUsers = users.filter(
    (u) =>
      STAFF_ROLES.includes(u.role as UserRole) && u.id !== currentUser?.id
  );
  const notes = (notesRes?.data ?? []) as InternalNote[];
  const toast = useToast();

  if (isLoading) return <div className="h-64 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 animate-pulse" />;
  if (!ticket) return <p className="text-sm text-muted-foreground">Ticket not found.</p>;

  const nextStatuses = NEXT_STATUSES[ticket.status] ?? [];

  const handleAssign = async () => {
    if (!assigneeId) return;
    try {
      await assign({ id, data: { assigneeId } });
      setAssigneeId("");
      toast("Ticket assigned successfully");
    } catch {
      toast("Failed to assign ticket", "error");
    }
  };

  const handleStatusChange = async () => {
    if (!confirmStatus) return;
    try {
      await updateStatus({ id, data: { status: confirmStatus } });
      setConfirmStatus(null);
      toast(`Status updated to ${confirmStatus.replace(/_/g, " ")}`);
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !complaintId) return;
    try {
      await addNote({ id: complaintId, data: { content: noteText } });
      setNoteText("");
      toast("Note added");
    } catch {
      toast("Failed to add note", "error");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={ticket.title}
        description={`Ticket Reference: ${ticket.referenceNumber}`}
        action={
          <div className="flex items-center gap-2">
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        }
      />

      {/* Complaint summary */}
      <Card className="border-border/80 shadow-sm bg-white dark:bg-slate-900/40">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
          <CardTitle className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Complaint Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5 text-sm">
          <div className="flex items-center gap-3">
            <ComplaintStatusBadge status={ticket.complaint.status} />
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{ticket.complaint.referenceNumber}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{ticket.complaint.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-semibold text-slate-805 mt-1">{ticket.department?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assignee</p>
              <p className="font-semibold text-slate-805 mt-1">
                {ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : "Unassigned"}
              </p>
            </div>
            {ticket.slaDeadline && (
              <div>
                <p className="text-xs text-muted-foreground">SLA Deadline</p>
                <p className={`font-semibold mt-1 ${ticket.slaBreached ? "text-rose-600 dark:text-rose-400" : "text-slate-805"}`}>
                  {new Date(ticket.slaDeadline).toLocaleString()}
                  {ticket.slaBreached && " · BREACHED"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assign Ticket</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Select staff member…</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role.replace("_", " ")})</option>
              ))}
            </select>
            <Button variant="accent" onClick={handleAssign} disabled={!assigneeId || assigning} className="rounded-xl px-5">
              {assigning ? "Assigning…" : "Assign Staff"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status transitions */}
      {nextStatuses.length > 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Update Ticket Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-2.5">
              {nextStatuses.map((s) => (
                <Button 
                  key={s} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setConfirmStatus(s)}
                  className="rounded-xl border-border/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-x-0.5 transition-all duration-200 gap-1.5"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  {s.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Internal notes */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Internal Team Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No internal team notes yet.</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 animate-in fade-in duration-200">
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{n.content}</p>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-650 dark:text-slate-405">{n.author.firstName} {n.author.lastName}</span>
                    <span>·</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {complaintId && (
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Input
                placeholder="Add an internal note (only visible to staff)…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="rounded-xl flex-1 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button variant="outline" onClick={handleAddNote} disabled={!noteText.trim() || addingNote} className="rounded-xl px-5 border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                {addingNote ? "Adding…" : "Add Note"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmStatus}
        title="Update ticket status"
        description={`Move this ticket to "${confirmStatus?.replace("_", " ")}"?`}
        confirmLabel="Update Status"
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmStatus(null)}
        loading={updatingStatus}
      />
    </div>
  );
}
