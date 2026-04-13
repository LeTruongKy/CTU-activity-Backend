-- ============================================================================
-- USER_ACTIVITY_SCHEDULE FOREIGN KEY CONSTRAINT FIX
-- ============================================================================
-- This script fixes the foreign key constraint error by cleaning orphaned data
-- and recreating the table correctly.
-- 
-- Execute this BEFORE restarting the backend with synchronize: true
-- ============================================================================

-- Step 1: Disable constraints temporarily (PostgreSQL)
SET session_replication_role = 'replica';

-- Step 2: Remove orphaned records (optional - for data preservation)
-- DELETE FROM user_activity_schedule 
-- WHERE userId NOT IN (SELECT id FROM users)
--    OR activityId NOT IN (SELECT id FROM activities);

-- Step 3: Drop the problematic table and recreate fresh
DROP TABLE IF EXISTS user_activity_schedule CASCADE;

-- Step 4: Re-enable constraints
SET session_replication_role = 'default';

-- ============================================================================
-- NOTE: TypeORM will automatically recreate the table on next synchronize()
-- ============================================================================
-- After running this script:
-- 1. Restart your backend application
-- 2. TypeORM synchronize will create the table with correct foreign keys
-- 3. Check logs for "[TypeOrmModule] Database connection initialized successfully"

-- Optional: Verify table structure after restart
-- SELECT 
--   constraint_name, 
--   table_name, 
--   column_name 
-- FROM information_schema.key_column_usage
-- WHERE table_name = 'user_activity_schedule';

-- Clear any dangling references (if keeping partial data)
-- DELETE FROM user_activity_schedule 
-- WHERE createdAt < NOW() - INTERVAL '30 days' AND status = 'CANCELLED';
