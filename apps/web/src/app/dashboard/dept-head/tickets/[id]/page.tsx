"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { escalateTicketSchema, type EscalateTicketInput } from "@clarion/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, FormLabel, FormControl, FormMessage } from "@clarion/ui";
import { PageHeader, ConfirmDialog, useToast } from "@/components/ui-helpers";
import { TicketPriorityBadge, TicketStatusBadge, ComplaintStatusBadge } from "@/components/badges";
import { useTicket, useEscalateTicket, useUpdateTicketStatus } from "@/hooks/use-api";
import { TicketStatus } from "@clarion/shared";

export default function DeptHeadTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticketRes, isLoading } = useTicket(id);
  const { mutateAsync: escalate, isPending: escalating } = useEscalateTicket();
  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateTicketStatus();

  const [showEscalate, setShowEscalate] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<TicketStatus | null>(null);

  const form = useForm<EscalateTicketInput>({
    resolver: zodResolver(escalateTicketSchema),
    defaultValues: { reason: "" },
  });

  const ticket = ticketRes?.data;
  const toast = useToast();

  if (isLoading) return <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />;
  if (!ticket) return <p className="text-sm text-muted-foreground">Ticket not found.</p>;

  const canEscalate = ![TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(ticket.status);

  const handleEscalate = async (data: EscalateTicketInput) => {
    try {
      await escalate({ id, data });
      setShowEscalate(false);
      form.reset();
      toast("Ticket escalated");
    } catch {
      toast("Failed to escalate ticket", "error");
    }
  };

  const handleStatusChange = async () => {
    if (!confirmStatus) return;
    try {
      await updateStatus({ id, data: { status: confirmStatus } });
      setConfirmStatus(null);
      toast("Ticket closed");
    } catch {
      toast("Failed to update status", "error");
    }
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

      {/* Ticket summary */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Details</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-3">
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
            <div>
              <p className="text-xs text-muted-foreground">SLA</p>
              <p className={`font-medium ${ticket.slaBreached ? "text-red-600" : ""}`}>
                {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : "—"}
                {ticket.slaBreached && " · BREACHED"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Escalation Level</p>
              <p className={`font-medium ${ticket.escalatedLevel > 0 ? "text-orange-600" : ""}`}>
                {ticket.escalatedLevel > 0 ? `Level ${ticket.escalatedLevel}` : "None"}
              </p>
            </div>
          </div>
          {ticket.complaint && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Complaint</p>
              <div className="flex items-center gap-2">
                <ComplaintStatusBadge status={ticket.complaint.status} />
                <span className="text-xs text-muted-foreground">{ticket.complaint.referenceNumber}</span>
              </div>
              <p className="mt-2 text-clarion-navy-700">{ticket.complaint.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status control */}
      {ticket.status === TicketStatus.OPEN && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Close Ticket</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setConfirmStatus(TicketStatus.CLOSED)}>
              Close Ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Escalation */}
      {canEscalate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Escalation</CardTitle>
              {ticket.escalations?.length > 0 && (
                <span className="text-xs text-muted-foreground">{ticket.escalations.length} escalation(s)</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!showEscalate ? (
              <Button variant="outline" size="sm" onClick={() => setShowEscalate(true)}>
                Escalate Ticket
              </Button>
            ) : (
              <form onSubmit={form.handleSubmit(handleEscalate)} className="space-y-3">
                <FormField>
                  <FormLabel>Escalation Reason</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                      placeholder="Explain why this ticket needs escalation…"
                      {...form.register("reason")}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.reason?.message}</FormMessage>
                </FormField>
                <div className="flex gap-2">
                  <Button type="submit" variant="accent" size="sm" disabled={escalating}>
                    {escalating ? "Escalating…" : "Confirm Escalation"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowEscalate(false); form.reset(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {ticket.escalations?.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                {ticket.escalations.map((e: { id: string; level: string; reason: string; createdAt: string }) => (
                  <div key={e.id} className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-orange-700">{e.level}</span>
                      <span className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1">{e.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmStatus}
        title="Close ticket"
        description="Are you sure you want to close this ticket?"
        confirmLabel="Close Ticket"
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmStatus(null)}
        loading={updatingStatus}
      />
    </div>
  );
}
