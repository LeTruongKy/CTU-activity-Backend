-- ============================================================================
-- URGENT: ORPHANED DATA CLEANUP
-- ============================================================================
-- This MUST be run BEFORE restarting the backend
-- Removes all records violating FK constraints
-- ============================================================================

-- Step 1: Disable FK checks temporarily
SET session_replication_role = 'replica';

-- Step 2: DELETE ALL ORPHANED RECORDS
-- Remove user_activity_schedule records with invalid activityId
DELETE FROM user_activity_schedule
WHERE "activityId" NOT IN (SELECT id FROM activities);

-- Remove user_activity_schedule records with invalid userId  
DELETE FROM user_activity_schedule
WHERE "userId" NOT IN (SELECT id FROM users);

-- Step 3: Re-enable FK checks
SET session_replication_role = 'default';

-- Step 4: Verify cleanup
SELECT 'Cleanup Complete' as status, 
       COUNT(*) as remaining_records
FROM user_activity_schedule;

-- Expected output: remaining_records should be small or 0
