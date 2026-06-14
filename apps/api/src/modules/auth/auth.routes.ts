import { Router, type IRouter } from "express";
import { authController } from "../../container.js";
import { authRateLimiter } from "../../middleware/rate-limit.js";

export const authRouter: IRouter = Router();

authRouter.post("/register", authRateLimiter, authController.register);
authRouter.post("/login", authRateLimiter, authController.login);
authRouter.post("/refresh", authRateLimiter, authController.refresh);
authRouter.post("/logout", authController.logout);
