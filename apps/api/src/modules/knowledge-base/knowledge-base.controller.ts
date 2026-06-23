import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { KnowledgeBaseService } from "./knowledge-base.service.js";
import { Permission, hasPermission } from "@clarion/shared";
import type { UserRole } from "@clarion/shared";

const p = (v: string | string[]) => (Array.isArray(v) ? v[0]! : v);

export class KnowledgeBaseController {
  constructor(private readonly service: KnowledgeBaseService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const canManage = hasPermission(req.user!.role as UserRole, Permission.KB_WRITE);
      sendSuccess(res, await this.service.list(req.user!.institutionId!, canManage));
    } catch (err) { next(err); }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit } = req.query as { q: string; limit?: string };
      sendSuccess(res, await this.service.search(req.user!.institutionId!, q, limit ? Number(limit) : 5));
    } catch (err) { next(err); }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await this.service.getBySlug(req.user!.institutionId!, p(req.params.slug!)));
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await this.service.create(req.user!.institutionId!, req.body), 201);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await this.service.update(p(req.params.id!), req.user!.institutionId!, req.body));
    } catch (err) { next(err); }
  };

  publish = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await this.service.publish(p(req.params.id!), req.user!.institutionId!));
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.softDelete(p(req.params.id!), req.user!.institutionId!);
      sendSuccess(res, { deleted: true });
    } catch (err) { next(err); }
  };
}
