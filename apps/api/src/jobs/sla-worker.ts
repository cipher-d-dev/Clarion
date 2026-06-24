import type { PrismaClient } from "@clarion/database";

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

async function runSLACheck(db: PrismaClient) {
  const now = new Date();

  const overdue = await db.ticket.findMany({
    where: {
      slaBreached: false,
      slaDeadline: { lte: now },
      status: { notIn: ["RESOLVED", "CLOSED"] },
      deletedAt: null,
    },
    select: { id: true },
  });

  if (overdue.length === 0) return;

  const ids = overdue.map((t) => t.id);

  await db.ticket.updateMany({ where: { id: { in: ids } }, data: { slaBreached: true } });

  await db.timelineEvent.createMany({
    data: ids.map((ticketId) => ({
      ticketId,
      eventType: "SLA_BREACHED",
      description: "SLA deadline exceeded. Ticket marked as breached.",
    })),
  });

  console.log(`[sla-job] Marked ${ids.length} ticket(s) as SLA breached`);
}

export function startSLAJob(db: PrismaClient) {
  // Run once on startup, then every 15 minutes
  runSLACheck(db).catch((err) => console.error("[sla-job] Error:", err));
  const timer = setInterval(() => {
    runSLACheck(db).catch((err) => console.error("[sla-job] Error:", err));
  }, INTERVAL_MS);

  console.log("[sla-job] SLA checker started (15 min interval)");
  return timer;
}
