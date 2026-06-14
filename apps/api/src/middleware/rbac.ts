import type { Request, Response, NextFunction } from "express";
import { Permission, hasPermission, type UserRole } from "@clarion/shared";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const role = req.user.role as UserRole;
      const allowed = permissions.some((p) => hasPermission(role, p));

      if (!allowed) {
        throw new ForbiddenError(
          `Missing required permission: ${permissions.join(" or ")}`,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      if (!roles.includes(req.user.role as UserRole)) {
        throw new ForbiddenError(
          `Access restricted to: ${roles.join(", ")}`,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
