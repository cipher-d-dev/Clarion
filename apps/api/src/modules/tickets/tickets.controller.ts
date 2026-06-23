import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@clarion/shared";
import { sendSuccess } from "../../lib/response.js";
import type { TicketsService } from "./tickets.service.js";

export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.list(
        req.user!.institutionId!,
        req.user!.role as UserRole,
        req.user!.departmentId ?? null,
        req.query as never,
      );
      sendSuccess(res, result.items, 200, result.meta);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await this.service.getById(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.role as UserRole,
        req.user!.departmentId ?? null,
      );
      sendSuccess(res, ticket);
    } catch (err) { next(err); }
  };

  assign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await this.service.assign(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        req.user!.role as UserRole,
        req.body,
      );
      sendSuccess(res, ticket);
    } catch (err) { next(err); }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await this.service.updateStatus(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        req.body,
      );
      sendSuccess(res, ticket);
    } catch (err) { next(err); }
  };

  getNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notes = await this.service.getNotes(String(req.params.id), req.user!.institutionId!);
      sendSuccess(res, notes);
    } catch (err) { next(err); }
  };

  escalate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const escalation = await this.service.escalate(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        req.user!.role as UserRole,
        req.body,
      );
      sendSuccess(res, escalation, 201);
    } catch (err) { next(err); }
  };
}
