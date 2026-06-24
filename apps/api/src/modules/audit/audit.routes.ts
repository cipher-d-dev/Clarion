import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { Permission } from "@clarion/shared";
import type { AuditController } from "./audit.controller.js";

export function createAuditRouter(controller: AuditController): Router {
  const router = Router();
  router.get("/", authMiddleware, requirePermission(Permission.AUDIT_READ), controller.list);
  return router;
}
