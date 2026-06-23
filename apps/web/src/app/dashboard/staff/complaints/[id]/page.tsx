"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@clarion/ui";
import { PageHeader, ConfirmDialog } from "@/components/ui-helpers";
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

const NEXT_STATUSES: Record<string, ComplaintStatus[]> = {
  SUBMITTED: [ComplaintStatus.UNDER_REVIEW, ComplaintStatus.REJECTED],
  UNDER_REVIEW: [ComplaintStatus.ASSIGNED, ComplaintStatus.AWAITING_INFORMATION, ComplaintStatus.REJECTED],
  ASSIGNED: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.AWAITING_INFORMATION, ComplaintStatus.ESCALATED],
  IN_PROGRESS: [ComplaintStatus.RESOLVED, ComplaintStatus.ESCALATED, ComplaintStatus.AWAITING_INFORMATION],
  AWAITING_INFORMATION: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.CLOSED],
  ESCALATED: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED],
  RESOLVED: [ComplaintStatus.CLOSED],
  CLOSED: [],
  REJECTED: [],
  DRAFT: [ComplaintStatus.SUBMITTED],
};

export default function StaffComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: complaintRes, isLoading } = useComplaint(id);
  const { data: timelineRes } = useComplaintTimeline(id);
  const { data: notesRes } = useComplaintNotes(id);
  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateComplaintStatus();
  const { mutateAsync: addNote, isPending: addingNote } = useAddComplaintNote();

  const [confirmStatus, setConfirmStatus] = useState<ComplaintStatus | null>(null);
  const [noteText, setNoteText] = useState("");

  const complaint = complaintRes?.data;
  const timeline = timelineRes?.data ?? [];
  const notes = notesRes?.data ?? [];

  if (isLoading) return <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />;
  if (!complaint) return <p className="text-sm text-muted-foreground">Complaint not found.</p>;

  const nextStatuses = NEXT_STATUSES[complaint.status] ?? [];

  const handleStatusChange = async () => {
    if (!confirmStatus) return;
    await updateStatus({ id, data: { status: confirmStatus } });
    setConfirmStatus(null);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote({ id, data: { content: noteText } });
    setNoteText("");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={complaint.title}
        description={complaint.referenceNumber}
        action={<ComplaintStatusBadge status={complaint.status} />}
      />

      {/* Details */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Submitter</p>
              <p className="font-medium">
                {complaint.isAnonymous
                  ? "Anonymous"
                  : complaint.submitter
                    ? `${complaint.submitter.firstName} ${complaint.submitter.lastName}`
                    : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{complaint.department?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium">{complaint.category ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-clarion-navy-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Classification */}
      <AiClassificationCard 
        aiMetadata={complaint.aiMetadata}
        sentimentScore={complaint.sentimentScore}
        isStaffView={true}
      />

      {/* Status transitions */}
      {nextStatuses.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Update Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => setConfirmStatus(s)}>
                  → {s.replace(/_/g, " ")}
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
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          {timeline.length === 0
            ? <p className="text-sm text-muted-foreground">No activity yet.</p>
            : (
              <div className="space-y-4">
                {timeline.map((e: { id: string; eventType: string; description: string; createdAt: string }, i: number) => (
                  <div key={e.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-clarion-navy-400 mt-1.5" />
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-clarion-navy-100 my-1" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm font-medium text-clarion-navy-800">{e.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(e.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmStatus}
        title="Update complaint status"
        description={`Move this complaint to "${confirmStatus?.replace(/_/g, " ")}"?`}
        confirmLabel="Update"
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmStatus(null)}
        loading={updatingStatus}
      />
    </div>
  );
}
