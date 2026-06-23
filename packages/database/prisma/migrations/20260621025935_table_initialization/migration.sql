-- DropIndex
DROP INDEX "Ticket_institutionId_slaDeadline_idx";

-- CreateIndex
CREATE INDEX "Ticket_institutionId_status_idx" ON "Ticket"("institutionId", "status");
