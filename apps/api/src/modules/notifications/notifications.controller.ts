import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { NotificationsService } from "./notifications.service.js";

export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const result = await this.service.list(req.user!.sub, page, pageSize);
      sendSuccess(res, result.items, undefined, { page, pageSize, total: result.total, totalPages: Math.ceil(result.total / pageSize) });
    } catch (err) { next(err); }
  };

  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.markRead(String(req.params.id), req.user!.sub);
      sendSuccess(res, { ok: true });
    } catch (err) { next(err); }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.markAllRead(req.user!.sub);
      sendSuccess(res, { ok: true });
    } catch (err) { next(err); }
  };

  unreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.service.countUnread(req.user!.sub);
      sendSuccess(res, { count });
    } catch (err) { next(err); }
  };

  // SSE stream — kept here since it needs direct res.write access
  stream = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const userId = req.user!.sub;
    this.service.addSSEClient(userId, res);

    // Heartbeat every 30s
    const heartbeat = setInterval(() => {
      try { res.write(": ping\n\n"); } catch { /* client gone */ }
    }, 30_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      this.service.removeSSEClient(userId, res);
    });
  };
}
