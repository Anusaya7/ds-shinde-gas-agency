-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "aadhaarNumber" TEXT;
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "aadhaarDocument" BYTEA;
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "aadhaarMimeType" TEXT;
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "aadhaarConsentAt" TIMESTAMP(3);
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
