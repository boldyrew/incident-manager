-- CreateEnum
CREATE TYPE "TenantTier" AS ENUM ('ENTERPRISE', 'PROFESSIONAL', 'STARTER');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tier" "TenantTier" NOT NULL DEFAULT 'PROFESSIONAL';
