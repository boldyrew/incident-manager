-- CreateEnum
CREATE TYPE "IncidentActivityType" AS ENUM ('INCIDENT_OPENED', 'STATUS_UPDATED', 'SEVERITY_UPDATED', 'ASSIGNEE_UPDATED', 'COMMENT_ADDED', 'DESCRIPTION_UPDATED', 'TITLE_UPDATED');

-- CreateTable
CREATE TABLE "incident_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "IncidentActivityType" NOT NULL,
    "userId" UUID,
    "incidentId" UUID,
    "plainData" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incident_activities" ADD CONSTRAINT "incident_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_activities" ADD CONSTRAINT "incident_activities_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
