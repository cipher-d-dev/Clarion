import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission, updateProfileSchema } from "@clarion/shared";
import { ValidationError } from "../../lib/errors.js";
import type { UsersController } from "./users.controller.js";

export function createUsersRouter(controller: UsersController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get("/me", controller.getMe);

  router.patch("/me", (req, _res, next) => {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) return next(new ValidationError(result.error.flatten().fieldErrors));
    req.body = result.data;
    next();
  }, controller.updateMe);

  router.get(
    "/",
    tenantMiddleware,
    requirePermission(Permission.USER_READ),
    controller.listStaff,
  );

  return router;
}
