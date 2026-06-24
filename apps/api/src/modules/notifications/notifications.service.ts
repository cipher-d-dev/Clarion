import type { Response } from "express";
import { NotificationType } from "@clarion/database";
import type { NotificationsRepository, CreateNotificationInput } from "./notifications.repository.js";
import type { env as EnvType } from "../../config/env.js";

type Env = typeof EnvType;

// In-memory SSE client registry: userId → set of response streams
const sseClients = new Map<string, Set<Response>>();

export class NotificationsService {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly env: Env,
  ) {}

  // ── SSE ───────────────────────────────────────────────────────────────────

  addSSEClient(userId: string, res: Response) {
    if (!sseClients.has(userId)) sseClients.set(userId, new Set());
    sseClients.get(userId)!.add(res);
  }

  removeSSEClient(userId: string, res: Response) {
    sseClients.get(userId)?.delete(res);
  }

  private pushSSE(userId: string, data: object) {
    const clients = sseClients.get(userId);
    if (!clients?.size) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      try { client.write(payload); } catch { clients.delete(client); }
    }
  }

  // ── Core ──────────────────────────────────────────────────────────────────

  async send(input: CreateNotificationInput) {
    const notification = await this.repo.create(input);
    this.pushSSE(input.userId, notification);
    return notification;
  }

  async list(userId: string, page = 1, pageSize = 20) {
    return this.repo.findMany(userId, page, pageSize);
  }

  async markRead(id: string, userId: string) {
    return this.repo.markRead(id, userId);
  }

  async markAllRead(userId: string) {
    return this.repo.markAllRead(userId);
  }

  async countUnread(userId: string) {
    return this.repo.countUnread(userId);
  }

  // ── Convenience senders ───────────────────────────────────────────────────

  async notifyComplaintSubmitted(
    institutionId: string,
    userId: string,
    referenceNumber: string,
    complaintId: string,
  ) {
    return this.send({
      institutionId,
      userId,
      type: NotificationType.COMPLAINT_UPDATE,
      title: "Complaint submitted",
      message: `Your complaint ${referenceNumber} has been submitted and is under review.`,
      metadata: { complaintId },
    });
  }

  async notifyComplaintUpdate(
    institutionId: string,
    userId: string,
    referenceNumber: string,
    status: string,
    complaintId: string,
  ) {
    return this.send({
      institutionId,
      userId,
      type: NotificationType.COMPLAINT_UPDATE,
      title: "Complaint status updated",
      message: `Your complaint ${referenceNumber} is now ${status}.`,
      metadata: { complaintId, status },
    });
  }

  async notifyTicketAssigned(
    institutionId: string,
    assigneeId: string,
    assigneeEmail: string,
    ticketRef: string,
    ticketId: string,
    complaintTitle: string,
  ) {
    await this.send({
      institutionId,
      userId: assigneeId,
      type: NotificationType.TICKET_ASSIGNED,
      title: "Ticket assigned to you",
      message: `Ticket ${ticketRef} — "${complaintTitle}" has been assigned to you.`,
      metadata: { ticketId },
    });
    this.sendEmail(assigneeEmail, `Ticket ${ticketRef} assigned to you`, [
      `You have been assigned ticket ${ticketRef}.`,
      `Complaint: "${complaintTitle}"`,
      `Log in to Clarion to view and action this ticket.`,
    ].join("\n"));
  }

  async notifyResolved(
    institutionId: string,
    userId: string,
    userEmail: string,
    referenceNumber: string,
    complaintId: string,
  ) {
    await this.send({
      institutionId,
      userId,
      type: NotificationType.COMPLAINT_UPDATE,
      title: "Complaint resolved",
      message: `Your complaint ${referenceNumber} has been resolved.`,
      metadata: { complaintId, status: "RESOLVED" },
    });
    this.sendEmail(userEmail, `Your complaint ${referenceNumber} has been resolved`, [
      `Good news! Your complaint ${referenceNumber} has been resolved.`,
      `Log in to Clarion to view the resolution and leave a rating.`,
    ].join("\n"));
  }

  async notifyEscalation(
    institutionId: string,
    deptHeadId: string,
    deptHeadEmail: string,
    ticketRef: string,
    ticketId: string,
  ) {
    await this.send({
      institutionId,
      userId: deptHeadId,
      type: NotificationType.ESCALATION,
      title: "Ticket escalated",
      message: `Ticket ${ticketRef} has been escalated to your department.`,
      metadata: { ticketId },
    });
    this.sendEmail(deptHeadEmail, `Ticket ${ticketRef} escalated`, [
      `Ticket ${ticketRef} has been escalated and requires your attention.`,
      `Log in to Clarion to review and action this escalation.`,
    ].join("\n"));
  }

  // ── Email (fire-and-forget via Resend) ────────────────────────────────────

  private sendEmail(to: string, subject: string, text: string) {
    if (!this.env.RESEND_API_KEY) return;
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: this.env.RESEND_FROM_EMAIL, to, subject, text }),
    }).catch((err) => console.warn("[email] dispatch failed:", err));
  }
}
