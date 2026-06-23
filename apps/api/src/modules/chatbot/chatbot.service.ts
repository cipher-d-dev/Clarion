import type { AIProvider } from "@clarion/ai";
import type { ChatbotRepository } from "./chatbot.repository.js";
import type { KnowledgeBaseService } from "../knowledge-base/knowledge-base.service.js";
import type { ComplaintsRepository } from "../complaints/complaints.repository.js";

export class ChatbotService {
  constructor(
    private readonly repo: ChatbotRepository,
    private readonly ai: AIProvider,
    private readonly kb: KnowledgeBaseService,
    private readonly complaints: ComplaintsRepository,
  ) {}

  async chat(
    institutionId: string,
    userId: string,
    role: string,
    message: string,
    complaintId?: string,
  ) {
    const isStaff = !["STUDENT", "LECTURER"].includes(role);

    // 1. Recent history for context window
    const history = await this.repo.getHistory(institutionId, userId, 10);
    const pastMessages = history
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // 2. Full complaint context — from explicit complaintId or a reference number in the message
    let complaintContext = "";
    const targetId = complaintId ?? message.match(/CLN-\d{4}-\d{5}/)?.[0];
    if (targetId) {
      try {
        const isUUID = /^[0-9a-f-]{36}$/.test(targetId);
        const complaint = isUUID
          ? await this.complaints.findByIdForAI(targetId, institutionId)
          : await this.complaints.findByReferenceNumber(targetId, institutionId).then(
              (c) => c ? this.complaints.findByIdForAI(c.id, institutionId) : null
            );
        if (complaint) {
          const timeline = complaint.timeline
            .map((e) => `- [${new Date(e.createdAt).toLocaleDateString()}] ${e.eventType}: ${e.description}`)
            .join("\n");
          complaintContext = [
            `Complaint ${complaint.referenceNumber}: "${complaint.title}"`,
            `Status: ${complaint.status}`,
            `Category: ${complaint.category ?? "Uncategorized"}`,
            complaint.department ? `Department: ${complaint.department.name}` : "",
            `Submitted: ${new Date(complaint.createdAt).toLocaleDateString()}`,
            complaint.resolvedAt ? `Resolved: ${new Date(complaint.resolvedAt).toLocaleDateString()}` : "",
            `Description: ${complaint.description.slice(0, 500)}`,
            timeline ? `\nTimeline:\n${timeline}` : "",
          ].filter(Boolean).join("\n");
        }
      } catch { /* ignore */ }
    }

    // 3. Role-aware workload context
    let workloadContext = "";
    try {
      if (isStaff) {
        // Staff: show their assigned tickets
        const tickets = await this.complaints.findAssignedTickets(institutionId, userId);
        if (tickets.length > 0) {
          workloadContext = "Your assigned tickets:\n" + tickets
            .map((t) => `- ${t.referenceNumber} [${t.status}] [${t.priority}]: "${t.complaint.title}" (complaint ${t.complaint.referenceNumber})`)
            .join("\n");
        } else {
          workloadContext = "You have no tickets currently assigned to you.";
        }
      } else {
        // Students/lecturers: show their submitted complaints
        const recentComplaints = await this.complaints.findMany(institutionId, userId, null, { page: 1, pageSize: 5, sortOrder: "desc" });
        if (recentComplaints.items.length > 0) {
          workloadContext = "Your recent complaints: " + recentComplaints.items
            .map((c) => `${c.referenceNumber}: "${c.title}" (${c.status})`)
            .join(", ");
        }
      }
    } catch { /* ignore */ }

    // 4. RAG — KB context chunks
    let kbContext = "";
    let sourceTitles: string[] = [];
    try {
      const chunks = await this.kb.getContextChunks(institutionId, message, 4);
      sourceTitles = chunks.map((c) => c.title);
      if (chunks.length > 0) {
        kbContext = chunks.map((c) => `[${c.title}]\n${c.content.slice(0, 500)}`).join("\n\n---\n\n");
      }
    } catch { /* KB failure doesn't block chat */ }

    // 5. AI call
    const messages = [...pastMessages, { role: "user" as const, content: message }];
    const response = await this.ai.chat(messages, {
      kbContext: kbContext || undefined,
      complaintContext: complaintContext || workloadContext || undefined,
      userRole: role,
    });

    // 6. Persist
    await this.repo.saveMessage({ institutionId, userId, role: "user", content: message });
    await this.repo.saveMessage({
      institutionId,
      userId,
      role: "assistant",
      content: response.message,
      metadata: { sourceTitles },
    });

    return { message: response.message, sources: sourceTitles };
  }

  async getHistory(institutionId: string, userId: string) {
    return (await this.repo.getHistory(institutionId, userId, 50)).reverse();
  }
}
