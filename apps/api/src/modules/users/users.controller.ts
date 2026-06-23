import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { UsersService } from "./users.service.js";

export class UsersController {
  constructor(private readonly service: UsersService) {}

  listStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.service.listStaff(req.user!.institutionId!);
      sendSuccess(res, users);
    } catch (err) { next(err); }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.getMe(req.user!.sub);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.updateMe(req.user!.sub, req.body);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };
}
