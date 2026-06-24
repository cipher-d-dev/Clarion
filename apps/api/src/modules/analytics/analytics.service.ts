import type { AIProvider } from "@clarion/ai";
import type { AnalyticsRepository } from "./analytics.repository.js";

export class AnalyticsService {
  constructor(
    private readonly repo: AnalyticsRepository,
    private readonly ai: AIProvider,
  ) {}

  overview(institutionId: string) {
    return this.repo.getOverview(institutionId);
  }

  complaintsBreakdown(institutionId: string, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.repo.getComplaintsBreakdown(institutionId, fromDate, toDate);
  }

  departmentPerformance(institutionId: string) {
    return this.repo.getDepartmentPerformance(institutionId);
  }

  sla(institutionId: string) {
    return this.repo.getSLAStats(institutionId);
  }

  trends(institutionId: string, days?: number) {
    return this.repo.getTrends(institutionId, days ? Number(days) : 30);
  }

  staffWorkload(institutionId: string) {
    return this.repo.getStaffWorkload(institutionId);
  }

  async aiInsights(institutionId: string) {
    const raw = await this.repo.getRecentComplaintsForAI(institutionId);
    return this.ai.analyzeTrends(raw);
  }
}
