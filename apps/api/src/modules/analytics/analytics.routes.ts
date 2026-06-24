import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { tenantMiddleware } from "../../middleware/tenant.js";
import { Permission } from "@clarion/shared";
import type { AnalyticsController } from "./analytics.controller.js";

export function createAnalyticsRouter(controller: AnalyticsController): Router {
  const router = Router();
  const base = [authMiddleware, tenantMiddleware];
  const deptGuard = [...base, requirePermission(Permission.ANALYTICS_VIEW)];
  const instGuard = [...base, requirePermission(Permission.ANALYTICS_VIEW_INST)];

  // Dept Head+: overview, sla, staff workload
  router.get("/overview", ...deptGuard, controller.overview);
  router.get("/sla", ...deptGuard, controller.sla);
  router.get("/staff", ...deptGuard, controller.staffWorkload);

  // Inst Mgmt+: complaints breakdown, department performance, trends, ai-insights
  router.get("/complaints", ...instGuard, controller.complaintsBreakdown);
  router.get("/departments", ...instGuard, controller.departmentPerformance);
  router.get("/trends", ...instGuard, controller.trends);
  router.get("/ai-insights", ...instGuard, controller.aiInsights);

  return router;
}
