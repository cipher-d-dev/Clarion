import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import {
  validateTicketFilter,
  validateAssignTicket,
  validateUpdateTicketStatus,
  validateEscalateTicket,
} from "./tickets.validators.js";
import type { TicketsController } from "./tickets.controller.js";

export function createTicketsRouter(controller: TicketsController): Router {
  const router = Router();

  router.use(authMiddleware, tenantMiddleware);

  router.get(
    "/",
    requirePermission(Permission.TICKET_READ),
    validateTicketFilter,
    controller.list,
  );

  router.get(
    "/:id",
    requirePermission(Permission.TICKET_READ),
    controller.getById,
  );

  router.post(
    "/:id/assign",
    requirePermission(Permission.TICKET_ASSIGN),
    validateAssignTicket,
    controller.assign,
  );

  router.patch(
    "/:id/status",
    requirePermission(Permission.TICKET_UPDATE),
    validateUpdateTicketStatus,
    controller.updateStatus,
  );

  router.post(
    "/:id/escalate",
    requirePermission(Permission.TICKET_ESCALATE),
    validateEscalateTicket,
    controller.escalate,
  );

  router.get(
    "/:id/notes",
    requirePermission(Permission.TICKET_READ),
    controller.getNotes,
  );

  return router;
}
