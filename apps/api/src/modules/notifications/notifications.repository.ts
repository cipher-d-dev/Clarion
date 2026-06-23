import type { PrismaClient } from "@clarion/database";
import { NotificationType } from "@clarion/database";

export type CreateNotificationInput = {
  institutionId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: object;
};

export class NotificationsRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CreateNotificationInput) {
    return this.db.notification.create({ data });
  }

  async findMany(userId: string, page: number, pageSize: number) {
    const [total, items] = await Promise.all([
      this.db.notification.count({ where: { userId } }),
      this.db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, total };
  }

  async markRead(id: string, userId: string) {
    return this.db.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async countUnread(userId: string) {
    return this.db.notification.count({ where: { userId, isRead: false } });
  }
}
