import type { Request, Response, NextFunction } from "express";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
  addInternalNoteSchema,
  rateComplaintSchema,
  complaintFilterSchema,
} from "@clarion/shared";
import { ValidationError } from "../../lib/errors.js";

function validate(schema: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, source: "body" | "query") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const fields = result.error!.flatten().fieldErrors;
      return next(new ValidationError(fields));
    }
    req[source] = result.data as never;
    next();
  };
}

export const validateCreateComplaint = validate(createComplaintSchema, "body");
export const validateUpdateStatus = validate(updateComplaintStatusSchema, "body");
export const validateAddNote = validate(addInternalNoteSchema, "body");
export const validateRate = validate(rateComplaintSchema, "body");
export const validateComplaintFilter = validate(complaintFilterSchema, "query");
