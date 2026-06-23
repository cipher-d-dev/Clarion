import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { ChatbotService } from "./chatbot.service.js";

export class ChatbotController {
  constructor(private readonly service: ChatbotService) {}

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, complaintId } = req.body as { message: string; complaintId?: string };
      const result = await this.service.chat(
        req.user!.institutionId!,
        req.user!.sub,
        req.user!.role,
        message,
        complaintId,
      );
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  history = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await this.service.getHistory(req.user!.institutionId!, req.user!.sub);
      sendSuccess(res, messages);
    } catch (err) { next(err); }
  };
}
