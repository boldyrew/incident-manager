-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- create sequence for incidents
CREATE SEQUENCE incident_code_seq START 8;

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL,
    "client" TEXT NOT NULL,
    "assignedTo" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- create sequence for tickets
CREATE SEQUENCE ticket_code_seq START 8;

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "incidentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incidentId_key" ON "incidents"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketId_key" ON "tickets"("ticketId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
