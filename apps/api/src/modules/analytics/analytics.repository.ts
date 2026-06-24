import type { PrismaClient } from "@clarion/database";

export class AnalyticsRepository {
  constructor(private readonly db: PrismaClient) {}

  async getOverview(institutionId: string) {
    const [
      totalComplaints,
      statusCounts,
      totalTickets,
      slaBreached,
      resolved,
    ] = await Promise.all([
      this.db.complaint.count({ where: { institutionId, deletedAt: null } }),
      this.db.complaint.groupBy({
        by: ["status"],
        where: { institutionId, deletedAt: null },
        _count: true,
      }),
      this.db.ticket.count({ where: { institutionId, deletedAt: null } }),
      this.db.ticket.count({ where: { institutionId, slaBreached: true, deletedAt: null } }),
      this.db.complaint.count({ where: { institutionId, status: "RESOLVED", deletedAt: null } }),
    ]);

    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

    return { totalComplaints, statusCounts, totalTickets, slaBreached, resolved, resolutionRate };
  }

  async getComplaintsBreakdown(institutionId: string, from?: Date, to?: Date) {
    const dateFilter = from && to ? { gte: from, lte: to } : undefined;
    const where = { institutionId, deletedAt: null, ...(dateFilter && { createdAt: dateFilter }) };

    const [byStatus, byCategory, byDepartment] = await Promise.all([
      this.db.complaint.groupBy({ by: ["status"], where, _count: true }),
      this.db.complaint.groupBy({ by: ["category"], where, _count: true }),
      this.db.complaint.groupBy({ by: ["departmentId"], where, _count: true }),
    ]);

    // Enrich department names
    const deptIds = byDepartment.map((d) => d.departmentId).filter(Boolean) as string[];
    const departments = deptIds.length
      ? await this.db.department.findMany({
          where: { id: { in: deptIds } },
          select: { id: true, name: true },
        })
      : [];
    const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

    return {
      byStatus,
      byCategory: byCategory.map((c) => ({ category: c.category ?? "Uncategorised", count: c._count })),
      byDepartment: byDepartment.map((d) => ({
        departmentId: d.departmentId,
        name: d.departmentId ? (deptMap[d.departmentId] ?? "Unknown") : "Unassigned",
        count: d._count,
      })),
    };
  }

  async getDepartmentPerformance(institutionId: string) {
    const departments = await this.db.department.findMany({
      where: { institutionId },
      select: { id: true, name: true, code: true },
    });

    const results = await Promise.all(
      departments.map(async (dept) => {
        const [open, resolved, breached, total] = await Promise.all([
          this.db.ticket.count({
            where: { institutionId, departmentId: dept.id, status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] }, deletedAt: null },
          }),
          this.db.ticket.count({
            where: { institutionId, departmentId: dept.id, status: "RESOLVED", deletedAt: null },
          }),
          this.db.ticket.count({
            where: { institutionId, departmentId: dept.id, slaBreached: true, deletedAt: null },
          }),
          this.db.ticket.count({
            where: { institutionId, departmentId: dept.id, deletedAt: null },
          }),
        ]);

        const slaCompliance = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;

        return { ...dept, open, resolved, total, slaBreached: breached, slaCompliance };
      }),
    );

    return results;
  }

  async getSLAStats(institutionId: string) {
    const [total, breached, atRisk] = await Promise.all([
      this.db.ticket.count({ where: { institutionId, deletedAt: null, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
      this.db.ticket.count({ where: { institutionId, slaBreached: true, deletedAt: null } }),
      this.db.ticket.count({
        where: {
          institutionId,
          deletedAt: null,
          slaBreached: false,
          slaDeadline: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          status: { notIn: ["RESOLVED", "CLOSED"] },
        },
      }),
    ]);

    const compliance = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;
    return { total, breached, atRisk, compliance };
  }

  async getTrends(institutionId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const complaints = await this.db.complaint.findMany({
      where: { institutionId, deletedAt: null, createdAt: { gte: from } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by date (YYYY-MM-DD)
    const byDate: Record<string, { submitted: number; resolved: number }> = {};
    for (const c of complaints) {
      const key = c.createdAt.toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { submitted: 0, resolved: 0 };
      byDate[key].submitted++;
      if (c.status === "RESOLVED" || c.status === "CLOSED") byDate[key].resolved++;
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));
  }

  async getStaffWorkload(institutionId: string) {
    const staff = await this.db.user.findMany({
      where: {
        institutionId,
        role: { in: ["ADMIN_STAFF", "DEPT_HEAD"] },
        deletedAt: null,
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, department: { select: { name: true } } },
    });

    const results = await Promise.all(
      staff.map(async (u) => {
        const [open, resolved] = await Promise.all([
          this.db.ticket.count({
            where: { institutionId, assigneeId: u.id, status: { notIn: ["RESOLVED", "CLOSED"] }, deletedAt: null },
          }),
          this.db.ticket.count({
            where: { institutionId, assigneeId: u.id, status: { in: ["RESOLVED", "CLOSED"] }, deletedAt: null },
          }),
        ]);
        return { ...u, openTickets: open, resolvedTickets: resolved };
      }),
    );

    return results;
  }

  async getRecentComplaintsForAI(institutionId: string) {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const complaints = await this.db.complaint.findMany({
      where: { institutionId, deletedAt: null, createdAt: { gte: from } },
      select: { category: true, createdAt: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return complaints.map((complaint) => ({
      ...complaint,
      category: complaint.category ?? "Uncategorised",
    }));
  }
}
