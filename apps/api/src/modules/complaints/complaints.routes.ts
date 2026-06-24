import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import {
  validateComplaintFilter,
  validateCreateComplaint,
  validateUpdateStatus,
  validateAddNote,
  validateRate,
} from "./complaints.validators.js";
import type { ComplaintsController } from "./complaints.controller.js";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 180);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const institutionId = req.user?.institutionId ?? "unknown-institution";
      const target = path.join(uploadDir, institutionId, "complaints", String(req.params.id));
      fs.mkdirSync(target, { recursive: true });
      cb(null, target);
    },
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${sanitizeFileName(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_ATTACHMENT_MIME_TYPES.has(file.mimetype));
  },
});

export function createComplaintsRouter(controller: ComplaintsController): Router {
  const router = Router();

  router.use(authMiddleware, tenantMiddleware);

  router.get(
    "/",
    requirePermission(Permission.COMPLAINT_READ_OWN, Permission.COMPLAINT_READ_DEPT, Permission.COMPLAINT_READ_INST),
    validateComplaintFilter,
    controller.list,
  );

  router.post(
    "/",
    requirePermission(Permission.COMPLAINT_CREATE),
    validateCreateComplaint,
    controller.create,
  );

  router.get(
    "/:id",
    requirePermission(Permission.COMPLAINT_READ_OWN, Permission.COMPLAINT_READ_DEPT, Permission.COMPLAINT_READ_INST),
    controller.getById,
  );

  router.patch(
    "/:id/status",
    requirePermission(Permission.COMPLAINT_UPDATE),
    validateUpdateStatus,
    controller.updateStatus,
  );

  router.get("/:id/timeline", controller.getTimeline);

  router.get(
    "/:id/notes",
    requirePermission(Permission.COMPLAINT_UPDATE),
    controller.getNotes,
  );

  router.post(
    "/:id/notes",
    requirePermission(Permission.COMPLAINT_UPDATE),
    validateAddNote,
    controller.addNote,
  );

  router.post(
    "/:id/rate",
    requirePermission(Permission.COMPLAINT_CREATE),
    validateRate,
    controller.rate,
  );

  router.get("/:id/attachments", controller.getAttachments);

  router.post(
    "/:id/attachments",
    requirePermission(Permission.COMPLAINT_CREATE),
    upload.single("file"),
    controller.uploadAttachment,
  );

  return router;
}
