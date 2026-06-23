import type { Request, Response, NextFunction } from "express";
import {
  assignTicketSchema,
  updateTicketStatusSchema,
  escalateTicketSchema,
  ticketFilterSchema,
} from "@clarion/shared";
import { ValidationError } from "../../lib/errors.js";

function validate(schema: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, source: "body" | "query") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError(result.error!.flatten().fieldErrors));
    }
    req[source] = result.data as never;
    next();
  };
}

export const validateAssignTicket = validate(assignTicketSchema, "body");
export const validateUpdateTicketStatus = validate(updateTicketStatusSchema, "body");
export const validateEscalateTicket = validate(escalateTicketSchema, "body");
export const validateTicketFilter = validate(ticketFilterSchema, "query");
