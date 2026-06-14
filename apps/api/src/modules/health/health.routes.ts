import { Router, type IRouter } from "express";
import { sendSuccess } from "../../lib/response.js";

export const healthRouter: IRouter = Router();

healthRouter.get("/", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "clarion-api",
    version: "0.1.0",
  });
});
