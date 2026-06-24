import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@clarion/shared";
import { sendSuccess } from "../../lib/response.js";
import type { ComplaintsService } from "./complaints.service.js";

export class ComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.list(
        req.user!.institutionId!,
        req.user!.role as UserRole,
        req.user!.sub,
        req.user!.departmentId ?? null,
        req.query as never,
      );
      sendSuccess(res, result.items, 200, result.meta);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const complaint = await this.service.getById(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.role as UserRole,
        req.user!.sub,
      );
      sendSuccess(res, complaint);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const complaint = await this.service.create(
        req.user!.institutionId!,
        req.user!.sub,
        req.body,
      );
      sendSuccess(res, complaint, 201);
    } catch (err) { next(err); }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const complaint = await this.service.updateStatus(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        req.body,
      );
      sendSuccess(res, complaint);
    } catch (err) { next(err); }
  };

  addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await this.service.addNote(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        req.body,
      );
      sendSuccess(res, note, 201);
    } catch (err) { next(err); }
  };

  rate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const complaint = await this.service.rate(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        req.body,
      );
      sendSuccess(res, complaint);
    } catch (err) { next(err); }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await this.service.getTimeline(
        String(req.params.id),
        req.user!.institutionId!,
      );
      sendSuccess(res, events);
    } catch (err) { next(err); }
  };

  getNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notes = await this.service.getNotes(
        String(req.params.id),
        req.user!.institutionId!,
      );
      sendSuccess(res, notes);
    } catch (err) { next(err); }
  };

  uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No file uploaded" } });
        return;
      }
      const attachment = await this.service.addAttachment(
        String(req.params.id),
        req.user!.institutionId!,
        req.user!.sub,
        file,
        {
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      sendSuccess(res, attachment, 201);
    } catch (err) { next(err); }
  };

  getAttachments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attachments = await this.service.getAttachments(
        String(req.params.id),
        req.user!.institutionId!,
      );
      sendSuccess(res, attachments);
    } catch (err) { next(err); }
  };
}
