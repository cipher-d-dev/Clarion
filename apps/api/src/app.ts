import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import path from "path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { rateLimiter } from "./middleware/rate-limit.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { createComplaintsRouter } from "./modules/complaints/complaints.routes.js";
import { createTicketsRouter } from "./modules/tickets/tickets.routes.js";
import { createUsersRouter } from "./modules/users/users.routes.js";
import { createKnowledgeBaseRouter } from "./modules/knowledge-base/knowledge-base.routes.js";
import { createChatbotRouter } from "./modules/chatbot/chatbot.routes.js";
import { createNotificationsRouter } from "./modules/notifications/notifications.routes.js";
import { createAnalyticsRouter } from "./modules/analytics/analytics.routes.js";
import { createAuditRouter } from "./modules/audit/audit.routes.js";
import { createAdminRouter } from "./modules/admin/admin.routes.js";
import {
  complaintsController,
  ticketsController,
  usersController,
  kbController,
  chatbotController,
  notificationsController,
  analyticsController,
  auditController,
  adminController,
} from "./container.js";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()), credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimiter);

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use("/v1/health", healthRouter);
  app.use("/v1/auth", authRouter);
  app.use("/v1/complaints", createComplaintsRouter(complaintsController));
  app.use("/v1/tickets", createTicketsRouter(ticketsController));
  app.use("/v1/users", createUsersRouter(usersController));
  app.use("/v1/knowledge", createKnowledgeBaseRouter(kbController));
  app.use("/v1/chat", createChatbotRouter(chatbotController));
  app.use("/v1/notifications", createNotificationsRouter(notificationsController));
  app.use("/v1/analytics", createAnalyticsRouter(analyticsController));
  app.use("/v1/audit", createAuditRouter(auditController));
  app.use("/v1/admin", createAdminRouter(adminController));

  // Sentry error capture — must be after routes, before custom error handler
  if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use(errorHandler);

  return app;
}
