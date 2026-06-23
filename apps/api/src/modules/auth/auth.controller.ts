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
      console.log("[auth] register attempt", { email: req.body?.email });
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
      console.log("[auth] register success", { userId: result.user.id });
      sendSuccess(res, result, 201);
    } catch (err) {
      console.error("[auth] register error", err);
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("[auth] login attempt", { email: req.body?.email });
      const body = loginBodySchema.parse(req.body);
      const result = await this.authService.login(body, {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });
      console.log("[auth] login success", { userId: result.user.id, role: result.user.role });
      sendSuccess(res, result);
    } catch (err) {
      console.error("[auth] login error", err);
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("[auth] refresh attempt");
      const body = refreshBodySchema.parse(req.body);
      const result = await this.authService.refresh(body, {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });
      console.log("[auth] refresh success", { userId: result.user.id });
      sendSuccess(res, result);
    } catch (err) {
      console.error("[auth] refresh error", err);
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("[auth] logout attempt");
      const body = logoutBodySchema.parse(req.body);
      await this.authService.logout(body);
      console.log("[auth] logout success");
      sendSuccess(res, { message: "Logged out successfully" });
    } catch (err) {
      console.error("[auth] logout error", err);
      next(err);
    }
  };
}
