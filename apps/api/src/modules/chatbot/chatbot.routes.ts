import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import type { ChatbotController } from "./chatbot.controller.js";

export function createChatbotRouter(controller: ChatbotController): Router {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware, requirePermission(Permission.CHAT));

  router.post("/", controller.chat);
  router.get("/history", controller.history);

  return router;
}
