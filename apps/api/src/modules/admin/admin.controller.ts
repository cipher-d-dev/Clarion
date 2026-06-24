import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { AdminService } from "./admin.service.js";
import { UserRole } from "@clarion/shared";

export class AdminController {
  constructor(private readonly service: AdminService) {}

  listInstitutions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
      const search = req.query.search as string | undefined;
      const { items, total } = await this.service.listInstitutions(page, pageSize, search);
      sendSuccess(res, items, 200, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
    } catch (err) { next(err); }
  };

  createInstitution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, domain } = req.body as { name: string; slug: string; domain?: string };
      const institution = await this.service.createInstitution(
        { name, slug, domain },
        {
          actorId: req.user!.sub,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      sendSuccess(res, institution, 201);
    } catch (err) { next(err); }
  };

  toggleInstitution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isActive } = req.body as { isActive: boolean };
      const institution = await this.service.toggleInstitution(
        String(req.params.id),
        isActive,
        {
          actorId: req.user!.sub,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      sendSuccess(res, institution);
    } catch (err) { next(err); }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
      const institutionId = req.query.institutionId as string | undefined;
      const search = req.query.search as string | undefined;
      const role = req.query.role as UserRole | undefined;
      const { items, total } = await this.service.listUsers(page, pageSize, { institutionId, search, role });
      sendSuccess(res, items, 200, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
    } catch (err) { next(err); }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.updateUser(
        String(req.params.id),
        req.body,
        {
          actorId: req.user!.sub,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };
}
