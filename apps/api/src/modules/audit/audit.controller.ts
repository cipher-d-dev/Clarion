import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { AuditService } from "./audit.service.js";
import { UserRole } from "@clarion/shared";
import { ValidationError } from "../../lib/errors.js";

export class AuditController {
  constructor(private readonly service: AuditService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
      const { action, entityType, actorId, institutionId: requestedInstitutionId, from, to } =
        req.query as Record<string, string>;
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if ((fromDate && Number.isNaN(fromDate.getTime())) || (toDate && Number.isNaN(toDate.getTime()))) {
        throw new ValidationError({ date: ["Use valid ISO date values for from and to"] });
      }

      // Super admin sees all; others scoped to their institution
      const institutionId =
        req.user!.role === UserRole.SUPER_ADMIN ? null : req.user!.institutionId!;

      const { items, total } = await this.service.list(institutionId, page, pageSize, {
        action,
        entityType,
        actorId,
        institutionId: req.user!.role === UserRole.SUPER_ADMIN ? requestedInstitutionId : undefined,
        from: fromDate,
        to: toDate,
      });
      const totalPages = Math.ceil(total / pageSize);
      sendSuccess(res, items, 200, { page, pageSize, total, totalPages });
    } catch (err) {
      next(err);
    }
  };
}
