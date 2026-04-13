-- ============================================================================
-- DATABASE HEALTH CHECK & ORPHANED DATA DETECTION
-- ============================================================================
-- Run this to identify all foreign key constraint issues
-- Execute BEFORE attempting to restart backend
-- ============================================================================

-- Step 1: Check all foreign key constraints
SELECT 
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' 
  AND referenced_table_name IS NOT NULL
ORDER BY table_name, constraint_name;

-- ============================================================================
-- Step 2: Detect Orphaned Records in user_activity_schedule
-- ============================================================================
SELECT 'user_activity_schedule - orphaned userId' as issue, COUNT(*) as count
FROM user_activity_schedule uas
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = uas.userId);

SELECT 'user_activity_schedule - orphaned activityId' as issue, COUNT(*) as count
FROM user_activity_schedule uas
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = uas.activityId);

-- ============================================================================
-- Step 3: Detect Orphaned Records in Other Common Tables
-- ============================================================================

-- Registrations orphaned users
SELECT 'registrations - orphaned userId' as issue, COUNT(*) as count
FROM registrations r
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = r.userId);

-- Registrations orphaned activities
SELECT 'registrations - orphaned activityId' as issue, COUNT(*) as count
FROM registrations r
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = r.activityId);

-- UserCriteria orphaned users
SELECT 'user_criteria - orphaned userId' as issue, COUNT(*) as count
FROM user_criteria uc
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = uc.userId);

-- UserCriteria orphaned criteria groups
SELECT 'user_criteria - orphaned criteriaGroupId' as issue, COUNT(*) as count
FROM user_criteria uc
WHERE NOT EXISTS (SELECT 1 FROM criteria_groups cg WHERE cg.id = uc.criteriaGroupId);

-- Activities orphaned categories
SELECT 'activities - orphaned categoryId' as issue, COUNT(*) as count
FROM activities a
WHERE a."categoryId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM activity_categories ac WHERE ac.id = a."categoryId");

-- Activities orphaned units
SELECT 'activities - orphaned unitId' as issue, COUNT(*) as count
FROM activities a
WHERE NOT EXISTS (SELECT 1 FROM units u WHERE u.id = a."unitId");

-- Activities orphaned creators
SELECT 'activities - orphaned createdBy' as issue, COUNT(*) as count
FROM activities a
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = a."createdBy");

-- ============================================================================
-- Step 4: List All Orphaned Records (for manual review)
-- ============================================================================

-- User Activity Schedule orphaned records
SELECT 'user_activity_schedule' as table_name, uas.id, uas."userId", uas."activityId"
FROM user_activity_schedule uas
LEFT JOIN users u ON u.id = uas."userId"
LEFT JOIN activities a ON a.id = uas."activityId"
WHERE u.id IS NULL OR a.id IS NULL
LIMIT 20;

-- ============================================================================
-- Step 5: Automatic Cleanup (OPTIONAL - USE WITH CAUTION)
-- ============================================================================
-- Uncomment only if you want to auto-delete orphaned records

-- -- Delete orphaned user_activity_schedule records
-- DELETE FROM user_activity_schedule
-- WHERE userId NOT IN (SELECT DISTINCT id FROM users)
--       OR activityId NOT IN (SELECT DISTINCT id FROM activities);

-- -- Delete orphaned registrations
-- DELETE FROM registrations
-- WHERE userId NOT IN (SELECT DISTINCT id FROM users)
--       OR activityId NOT IN (SELECT DISTINCT id FROM activities);

-- -- Delete orphaned user_criteria
-- DELETE FROM user_criteria
-- WHERE userId NOT IN (SELECT DISTINCT id FROM users)
--       OR "criteriaGroupId" NOT IN (SELECT DISTINCT id FROM criteria_groups);

-- ============================================================================
-- Step 6: Summary Report
-- ============================================================================
SELECT 
  'HEALTHY' as status,
  'No orphaned records detected' as message
WHERE NOT EXISTS (
  SELECT 1 FROM user_activity_schedule 
  WHERE userId NOT IN (SELECT id FROM users) OR activityId NOT IN (SELECT id FROM activities)
)
AND NOT EXISTS (
  SELECT 1 FROM registrations
  WHERE userId NOT IN (SELECT id FROM users) OR activityId NOT IN (SELECT id FROM activities)
);
