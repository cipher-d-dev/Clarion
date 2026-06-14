import type { Request, Response, NextFunction } from "express";
import type { TenantContext } from "@clarion/shared";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export function tenantMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const institutionId = req.headers["x-institution-id"] as string | undefined;

    if (req.user.role === "SUPER_ADMIN") {
      if (institutionId) {
        req.tenant = {
          institutionId,
          institutionSlug: "",
          departmentId: req.user.departmentId ?? undefined,
        };
      }
      next();
      return;
    }

    if (!req.user.institutionId) {
      throw new ForbiddenError("User is not associated with an institution");
    }

    req.tenant = {
      institutionId: req.user.institutionId,
      institutionSlug: "",
      departmentId: req.user.departmentId ?? undefined,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export function requireTenant(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    if (!req.tenant?.institutionId && req.user?.role !== "SUPER_ADMIN") {
      throw new ForbiddenError("Tenant context required");
    }
    next();
  } catch (err) {
    next(err);
  }
}
