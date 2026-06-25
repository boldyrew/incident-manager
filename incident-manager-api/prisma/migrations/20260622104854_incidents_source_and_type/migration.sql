-- CreateEnum
CREATE TYPE "IncidentSourceType" AS ENUM ('MANUAL', 'API', 'SIEM', 'MONITORING');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('UNAUTHORIZED_ACCESS', 'PHISHING', 'MALWARE', 'DATA_BREACH', 'SERVICE_OUTAGE', 'OTHER');

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "sourceRef" TEXT,
ADD COLUMN     "sourceType" "IncidentSourceType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "type" "IncidentType";
