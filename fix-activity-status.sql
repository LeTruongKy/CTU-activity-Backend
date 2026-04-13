-- ============================================
-- FIX Activity Status Enum
-- ============================================
-- This script converts old activity status values to new ones
-- Old: DRAFT, PENDING, APPROVED, PUBLISHED, COMPLETED, CANCELLED
-- New: PENDING, PUBLIC, CANCEL, COMPLETE

BEGIN TRANSACTION;

-- Step 1: Convert existing data
UPDATE "activities" SET "status" = 'PENDING' WHERE "status" IN ('DRAFT', 'PENDING');
UPDATE "activities" SET "status" = 'PUBLIC' WHERE "status" IN ('APPROVED', 'PUBLISHED');
UPDATE "activities" SET "status" = 'COMPLETE' WHERE "status" = 'COMPLETED';
UPDATE "activities" SET "status" = 'CANCEL' WHERE "status" IN ('CANCELLED', 'REJECTED');

-- Step 2: Drop old enum and recreate with new values
ALTER TYPE "activities_status_enum" RENAME TO "activities_status_enum_old";

CREATE TYPE "activities_status_enum" AS ENUM('PENDING', 'PUBLIC', 'CANCEL', 'COMPLETE');

ALTER TABLE "activities" 
ALTER COLUMN "status" TYPE "activities_status_enum" USING "status"::"text"::"activities_status_enum";

-- Step 3: Set default to PENDING
ALTER TABLE "activities" 
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Step 4: Drop old enum
DROP TYPE "activities_status_enum_old";

COMMIT;

-- Verify
SELECT DISTINCT "status" FROM "activities";
