import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../lib/errors.js";
import type { JwtPayload } from "@clarion/shared";
import type { NotificationsController } from "./notifications.controller.js";

// SSE clients can't set headers so we accept ?token= as fallback
function sseAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = (req.query.token as string) ?? req.headers.authorization?.slice(7);
    if (!token) throw new UnauthorizedError();
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function createNotificationsRouter(controller: NotificationsController): Router {
  const router = Router();
  const guard = [authMiddleware, tenantMiddleware, requirePermission(Permission.NOTIFICATION_READ)];

  router.get("/stream", sseAuthMiddleware, tenantMiddleware, controller.stream);
  router.get("/", ...guard, controller.list);
  router.get("/unread-count", ...guard, controller.unreadCount);
  router.patch("/:id/read", ...guard, controller.markRead);
  router.patch("/read-all", ...guard, controller.markAllRead);

  return router;
}
