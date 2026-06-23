import type { PrismaClient } from "@clarion/database";

export class ChatbotRepository {
  constructor(private readonly db: PrismaClient) {}

  async saveMessage(data: { institutionId: string; userId: string; role: string; content: string; metadata?: object }) {
    return this.db.chatMessage.create({ data });
  }

  async getHistory(institutionId: string, userId: string, limit = 20) {
    return this.db.chatMessage.findMany({
      where: { institutionId, userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
