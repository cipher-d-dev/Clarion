import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import {
  validateCreateArticle,
  validateUpdateArticle,
  validateKbSearch,
} from "./knowledge-base.validators.js";
import type { KnowledgeBaseController } from "./knowledge-base.controller.js";

export function createKnowledgeBaseRouter(controller: KnowledgeBaseController): Router {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);

  router.get("/", requirePermission(Permission.KB_READ), controller.list);
  router.get("/search", requirePermission(Permission.KB_READ), validateKbSearch, controller.search);
  router.get("/:slug", requirePermission(Permission.KB_READ), controller.getBySlug);
  router.post("/", requirePermission(Permission.KB_WRITE), validateCreateArticle, controller.create);
  router.patch("/:id", requirePermission(Permission.KB_WRITE), validateUpdateArticle, controller.update);
  router.post("/:id/publish", requirePermission(Permission.KB_PUBLISH), controller.publish);
  router.delete("/:id", requirePermission(Permission.KB_WRITE), controller.delete);

  return router;
}
