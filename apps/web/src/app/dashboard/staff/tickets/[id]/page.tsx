"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, FormField, FormLabel, FormControl, FormMessage } from "@clarion/ui";
import { PageHeader, ConfirmDialog } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge, ComplaintStatusBadge } from "@/components/badges";
import {
  useTicket, useAssignTicket, useUpdateTicketStatus,
  useUsers, useAddComplaintNote, useComplaintNotes,
} from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { TicketStatus, UserRole } from "@clarion/shared";

const STAFF_ROLES = [UserRole.ADMIN_STAFF, UserRole.DEPT_HEAD, UserRole.INSTITUTION_MGMT];

const NEXT_STATUSES: Record<string, TicketStatus[]> = {
  OPEN: [TicketStatus.ASSIGNED, TicketStatus.CLOSED],
  ASSIGNED: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_INFO, TicketStatus.CLOSED],
  IN_PROGRESS: [TicketStatus.RESOLVED, TicketStatus.PENDING_INFO, TicketStatus.CLOSED],
  PENDING_INFO: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  RESOLVED: [TicketStatus.CLOSED],
  CLOSED: [],
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

  const users = usersRes?.data ?? [];
  const currentUser = useAuthStore((s) => s.user);
  const assignableUsers = users.filter(
    (u: { id: string; role: string }) =>
      STAFF_ROLES.includes(u.role as UserRole) && u.id !== currentUser?.id
  );
  const notes = notesRes?.data ?? [];

  if (isLoading) return <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />;
  if (!ticket) return <p className="text-sm text-muted-foreground">Ticket not found.</p>;

  const nextStatuses = NEXT_STATUSES[ticket.status] ?? [];

  const handleAssign = async () => {
    if (!assigneeId) return;
    await assign({ id, data: { assigneeId } });
    setAssigneeId("");
  };

  const handleStatusChange = async () => {
    if (!confirmStatus) return;
    await updateStatus({ id, data: { status: confirmStatus } });
    setConfirmStatus(null);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !complaintId) return;
    await addNote({ id: complaintId, data: { content: noteText } });
    setNoteText("");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={ticket.title}
        description={ticket.referenceNumber}
        action={
          <div className="flex items-center gap-2">
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        }
      />

      {/* Complaint summary */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Complaint</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <ComplaintStatusBadge status={ticket.complaint.status} />
            <span className="text-muted-foreground">{ticket.complaint.referenceNumber}</span>
          </div>
          <p className="text-clarion-navy-700">{ticket.complaint.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{ticket.department?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assignee</p>
              <p className="font-medium">
                {ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : "Unassigned"}
              </p>
            </div>
            {ticket.slaDeadline && (
              <div>
                <p className="text-xs text-muted-foreground">SLA Deadline</p>
                <p className={`font-medium ${ticket.slaBreached ? "text-red-600" : ""}`}>
                  {new Date(ticket.slaDeadline).toLocaleString()}
                  {ticket.slaBreached && " · BREACHED"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Assign Ticket</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <select
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Select staff member…</option>
              {assignableUsers.map((u: { id: string; firstName: string; lastName: string; role: string }) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role.replace("_", " ")})</option>
              ))}
            </select>
            <Button variant="accent" onClick={handleAssign} disabled={!assigneeId || assigning}>
              {assigning ? "Assigning…" : "Assign"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status transitions */}
      {nextStatuses.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Update Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => setConfirmStatus(s)}>
                  → {s.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Internal notes */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Internal Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {notes.length === 0
            ? <p className="text-sm text-muted-foreground">No notes yet.</p>
            : notes.map((n: { id: string; content: string; createdAt: string; author: { firstName: string; lastName: string } }) => (
              <div key={n.id} className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-clarion-navy-800">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {n.author.firstName} {n.author.lastName} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

          {complaintId && (
            <div className="flex gap-3 pt-2 border-t">
              <Input
                placeholder="Add an internal note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <Button variant="outline" onClick={handleAddNote} disabled={!noteText.trim() || addingNote}>
                {addingNote ? "Adding…" : "Add"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmStatus}
        title="Update ticket status"
        description={`Move this ticket to "${confirmStatus?.replace("_", " ")}"?`}
        confirmLabel="Update"
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmStatus(null)}
        loading={updatingStatus}
      />
    </div>
  );
}
