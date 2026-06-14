import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import { sendError } from "../lib/response.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    sendError(res, 422, "VALIDATION_ERROR", "Validation failed", details);
    return;
  }

  console.error("Unhandled error:", err);
  sendError(res, 500, "INTERNAL_ERROR", "An unexpected error occurred");
}
