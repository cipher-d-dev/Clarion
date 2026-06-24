import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../lib/response.js";
import type { AnalyticsService } from "./analytics.service.js";

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  overview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.overview(req.user!.institutionId!);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };

  complaintsBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query as Record<string, string>;
      const data = await this.service.complaintsBreakdown(req.user!.institutionId!, from, to);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };

  departmentPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.departmentPerformance(req.user!.institutionId!);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };

  sla = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.sla(req.user!.institutionId!);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };

  trends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days } = req.query as Record<string, string>;
      const data = await this.service.trends(req.user!.institutionId!, days ? Number(days) : 30);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };

  staffWorkload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.staffWorkload(req.user!.institutionId!);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };

  aiInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.aiInsights(req.user!.institutionId!);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  };
}
