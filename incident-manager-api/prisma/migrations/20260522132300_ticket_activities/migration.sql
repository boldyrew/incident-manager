-- CreateEnum
CREATE TYPE "TicketActivityType" AS ENUM ('TICKET_OPENED', 'STATUS_UPDATED', 'PRIORITY_UPDATED', 'ASSIGNEE_UPDATED', 'INCIDENT_LINKED', 'COMMENT_ADDED', 'DESCRIPTION_UPDATED', 'TITLE_UPDATED');

-- CreateTable
CREATE TABLE "ticket_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "TicketActivityType" NOT NULL,
    "userId" UUID,
    "ticketId" UUID,
    "plainData" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ticket_activities" ADD CONSTRAINT "ticket_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_activities" ADD CONSTRAINT "ticket_activities_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
