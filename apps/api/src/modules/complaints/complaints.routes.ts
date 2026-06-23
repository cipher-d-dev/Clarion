import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import {
  validateComplaintFilter,
  validateCreateComplaint,
  validateUpdateStatus,
  validateAddNote,
  validateRate,
} from "./complaints.validators.js";
import type { ComplaintsController } from "./complaints.controller.js";

export function createComplaintsRouter(controller: ComplaintsController): Router {
  const router = Router();

  router.use(authMiddleware, tenantMiddleware);

  router.get(
    "/",
    requirePermission(Permission.COMPLAINT_READ_OWN, Permission.COMPLAINT_READ_DEPT, Permission.COMPLAINT_READ_INST),
    validateComplaintFilter,
    controller.list,
  );

  router.post(
    "/",
    requirePermission(Permission.COMPLAINT_CREATE),
    validateCreateComplaint,
    controller.create,
  );

  router.get(
    "/:id",
    requirePermission(Permission.COMPLAINT_READ_OWN, Permission.COMPLAINT_READ_DEPT, Permission.COMPLAINT_READ_INST),
    controller.getById,
  );

  router.patch(
    "/:id/status",
    requirePermission(Permission.COMPLAINT_UPDATE),
    validateUpdateStatus,
    controller.updateStatus,
  );

  router.get("/:id/timeline", controller.getTimeline);

  router.get(
    "/:id/notes",
    requirePermission(Permission.COMPLAINT_UPDATE),
    controller.getNotes,
  );

  router.post(
    "/:id/notes",
    requirePermission(Permission.COMPLAINT_UPDATE),
    validateAddNote,
    controller.addNote,
  );

  router.post(
    "/:id/rate",
    requirePermission(Permission.COMPLAINT_CREATE),
    validateRate,
    controller.rate,
  );

  return router;
}
