# Database Foreign Key Constraint Fix

## Root Cause
The error occurs because:
- `synchronize: true` tries to create foreign keys
- Existing orphaned data in `user_activity_schedule` violates constraints
- `userId` or `activityId` references non-existent parents

## Solution (Choose One)

### ✅ OPTION 1: QUICK FIX - Truncate Problem Table (Recommended)

Run in PostgreSQL:
```sql
-- Drop the problematic table
DROP TABLE IF EXISTS user_activity_schedule CASCADE;

-- TypeORM will recreate it on next sync
```

Then restart the backend.

---

### ✅ OPTION 2: Clean All Migrations (Full Reset)

```bash
# Stop backend
# Delete entire database
# Recreate database

CREATE DATABASE ctu_activity_db;
```

Then restart backend - TypeORM will sync all tables fresh.

---

### ✅ OPTION 3: Disable Sync, Fix Manually

In `src/app.module.ts`:
```ts
synchronize: false,  // ← Temporarily disable
```

Then run:
```sql
-- Remove orphaned records first
DELETE FROM user_activity_schedule 
WHERE userId NOT IN (SELECT id FROM users)
   OR activityId NOT IN (SELECT id FROM activities);

-- Drop and recreate
DROP TABLE IF EXISTS user_activity_schedule CASCADE;
```

Then re-enable `synchronize: true` and restart.

---

## Prevention

**Entity Relations - All Should Have CASCADE Rules:**

```ts
// user_activity_schedule.entity.ts
@ManyToOne(() => User, { onDelete: 'CASCADE' })      // ✅ Correct
@JoinColumn({ name: 'userId' })
user: User;

@ManyToOne(() => Activity, { 
  onDelete: 'CASCADE'  // ✅ Correct - deletes schedule when activity deleted
})
@JoinColumn({ name: 'activityId' })
activity: Activity;
```

---

## Immediate Action

1. **Execute in pgAdmin/psql:**
   ```sql
   DROP TABLE IF EXISTS user_activity_schedule CASCADE;
   ```

2. **Restart backend:** The table will be recreated correctly
