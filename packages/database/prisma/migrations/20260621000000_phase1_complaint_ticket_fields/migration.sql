-- Add ASSIGNED and AWAITING_INFORMATION to ComplaintStatus enum
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'ASSIGNED';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'AWAITING_INFORMATION';

-- Create TicketStatus enum
DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_INFO', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add new columns to Complaint
ALTER TABLE "Complaint"
  ADD COLUMN IF NOT EXISTS "referenceNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "sentimentScore" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "aiMetadata" JSONB,
  ADD COLUMN IF NOT EXISTS "satisfactionRating" INTEGER;

-- Add new columns to Ticket
ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "referenceNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "slaDeadline" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "slaBreached" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "escalatedLevel" INTEGER NOT NULL DEFAULT 0;

-- Migrate Ticket.status from ComplaintStatus to TicketStatus
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "statusNew" "TicketStatus" NOT NULL DEFAULT 'OPEN';
UPDATE "Ticket" SET "statusNew" = CASE
  WHEN "status"::text = 'SUBMITTED'     THEN 'OPEN'::"TicketStatus"
  WHEN "status"::text = 'UNDER_REVIEW'  THEN 'OPEN'::"TicketStatus"
  WHEN "status"::text = 'ASSIGNED'      THEN 'ASSIGNED'::"TicketStatus"
  WHEN "status"::text = 'IN_PROGRESS'   THEN 'IN_PROGRESS'::"TicketStatus"
  WHEN "status"::text = 'AWAITING_INFORMATION' THEN 'PENDING_INFO'::"TicketStatus"
  WHEN "status"::text = 'RESOLVED'      THEN 'RESOLVED'::"TicketStatus"
  WHEN "status"::text = 'CLOSED'        THEN 'CLOSED'::"TicketStatus"
  ELSE 'OPEN'::"TicketStatus"
END;
ALTER TABLE "Ticket" DROP COLUMN "status";
ALTER TABLE "Ticket" RENAME COLUMN "statusNew" TO "status";

-- Indexes
CREATE INDEX IF NOT EXISTS "Complaint_institutionId_referenceNumber_idx" ON "Complaint"("institutionId", "referenceNumber");
CREATE INDEX IF NOT EXISTS "Ticket_institutionId_slaDeadline_idx" ON "Ticket"("institutionId", "slaDeadline");
