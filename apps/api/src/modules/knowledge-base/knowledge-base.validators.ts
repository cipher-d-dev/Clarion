import type { Request, Response, NextFunction } from "express";
import { createKnowledgeArticleSchema, updateKnowledgeArticleSchema, kbSearchSchema } from "@clarion/shared";
import { ValidationError } from "../../lib/errors.js";

function validate<T>(schema: { safeParse: (d: unknown) => { success: boolean; data?: T; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, source: "body" | "query") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "body" ? req.body : req.query);
    if (!result.success) throw new ValidationError(result.error!.flatten().fieldErrors);
    if (source === "body") req.body = result.data;
    next();
  };
}

export const validateCreateArticle = validate(createKnowledgeArticleSchema, "body");
export const validateUpdateArticle = validate(updateKnowledgeArticleSchema, "body");
export const validateKbSearch = validate(kbSearchSchema, "query");
