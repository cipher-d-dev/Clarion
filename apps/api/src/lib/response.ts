import type { Response } from "express";
import type { ApiResponse } from "@clarion/shared";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"],
): void {
  const body: ApiResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, string[]>,
): void {
  const body: ApiResponse = {
    success: false,
    error: { code, message, details },
  };
  res.status(statusCode).json(body);
}
