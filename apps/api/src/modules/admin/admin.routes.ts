import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { UserRole } from "@clarion/shared";
import type { AdminController } from "./admin.controller.js";

export function createAdminRouter(controller: AdminController): Router {
  const router = Router();
  const guard = [authMiddleware, requireRole(UserRole.SUPER_ADMIN)];

  router.get("/institutions", ...guard, controller.listInstitutions);
  router.post("/institutions", ...guard, controller.createInstitution);
  router.patch("/institutions/:id", ...guard, controller.toggleInstitution);

  router.get("/users", ...guard, controller.listUsers);
  router.patch("/users/:id", ...guard, controller.updateUser);

  return router;
}
