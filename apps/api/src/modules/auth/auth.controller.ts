import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { AuthService } from "./auth.service.js";
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "./auth.validators.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerBodySchema.parse(req.body);
      const result = await this.authService.register(
        {
          email: body.email,
          password: body.password,
          firstName: body.firstName,
          lastName: body.lastName,
          role: body.role,
          institutionSlug: body.institutionSlug,
          matricNo: body.matricNo,
          staffId: body.staffId,
          departmentCode: body.departmentCode,
        },
        {
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip,
        },
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginBodySchema.parse(req.body);
      const result = await this.authService.login(body, {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = refreshBodySchema.parse(req.body);
      const result = await this.authService.refresh(body, {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = logoutBodySchema.parse(req.body);
      await this.authService.logout(body);
      sendSuccess(res, { message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  };
}
