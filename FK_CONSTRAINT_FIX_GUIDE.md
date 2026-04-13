# TypeORM Foreign Key Constraint Error - Complete Fix Guide

## Problem Statement
```
QueryFailedError: insert or update on table "user_activity_schedule" 
violates foreign key constraint "FK_d2d81bf754ce50484d041be28cb"
```

## Root Cause
1. **Orphaned Data**: Existing records in `user_activity_schedule` reference deleted users/activities
2. **Synchronize Conflict**: TypeORM tries to create FK constraints on dirty data
3. **Missing nullable: false**: Some FK columns weren't properly enforced

---

## ✅ IMMEDIATE FIX (5 Minutes)

### Step 1: Connect to Database
```bash
# Using psql or pgAdmin
# OR use your database GUI
```

### Step 2: Run Cleanup Script
```sql
-- Option A: Nuclear - Drop table (loses all schedule data)
DROP TABLE IF EXISTS user_activity_schedule CASCADE;

-- Option B: Clean only - Remove orphaned records
DELETE FROM user_activity_schedule 
WHERE userId NOT IN (SELECT id FROM users)
   OR activityId NOT IN (SELECT id FROM activities);
```

### Step 3: Rebuild TypeORM Sync
```bash
# Stop backend (Ctrl+C)

# Rebuild
npm run build

# Restart
npm run start:dev
```

---

## ✅ PERMANENT FIXES (Applied)

### 1. Entity Improvements
**File**: `src/modules/user_activity_schedule/entities/user_activity_schedule.entity.ts`

**Changes Made**:
- ✅ Added `@Index(['userId', 'startTime', 'endTime'])` for query performance
- ✅ Set `nullable: false` on both ManyToOne relations
- ✅ Set `eager: false` to prevent circular dependencies
- ✅ Added `onDelete: 'CASCADE'` to both foreign keys
- ✅ Added documentation comments

### 2. App Module Configuration
**File**: `src/app.module.ts`

**Changes Made**:
- ✅ Changed `migrationsRun: false` (use manual migrations only)
- ✅ Reduced logging to `['error']` only (cleaner output)
- ✅ Added connection pool settings
- ✅ Added statement timeout for safety

### 3. Fix Script
**File**: `fix-user-activity-schedule-fk.sql`

**Usage**:
```bash
psql -U postgres -h localhost -d ctu_activity_db -f fix-user-activity-schedule-fk.sql
```

---

## 🔍 Verify Fix

After restart, check logs should show:
```
[TypeOrmModule] Database connection initialized successfully
[NestFactory] Application started
```

### Database Verification
```sql
-- Check foreign keys exist
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage
WHERE table_name = 'user_activity_schedule';

-- Should return:
-- FK_... | user_activity_schedule | userId
-- FK_... | user_activity_schedule | activityId
```

---

## 🚨 Troubleshooting

### Still Getting FK Error?
1. Verify database has required tables:
   ```sql
   SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='users');
   SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='activities');
   ```

2. Check for orphaned records:
   ```sql
   SELECT * FROM user_activity_schedule 
   WHERE userId NOT IN (SELECT id FROM users)
      OR activityId NOT IN (SELECT id FROM activities);
   ```

3. If still failing:
   ```sql
   -- Option: Reset entire database (dev only)
   DROP DATABASE IF EXISTS ctu_activity_db;
   CREATE DATABASE ctu_activity_db;
   -- Backend will rebuild schema on start
   ```

### Connection Timeout?
- Increase `statement_timeout` in `app.module.ts`
- Check DB host/credentials in `.env`

### "Table Already Exists"?
- Clear and rebuild:
  ```bash
  rm -rf dist/
  npm run build
  npm start
  ```

---

## 📋 Checklist

- [ ] Ran cleanup SQL script
- [ ] Entity updated with nullable: false
- [ ] App module configuration updated
- [ ] Database rebuilt (npm run build)
- [ ] Backend restarted
- [ ] No errors in logs
- [ ] Created test activity registration

---

## 🎯 Prevention for Future

1. **Data Validation**: Always validate FK references before operations
2. **Migrations**: Use proper migrations instead of synchronize in production
3. **Testing**: Test FK constraints with edge cases
4. **Monitoring**: Log FK violations for debugging
5. **Cleanup**: Regular maintenance queries to remove orphaned data

---

## 💡 TypeORM Best Practices

```ts
// ✅ Always use nullable: false for required FKs
@ManyToOne(() => User, { 
  nullable: false,           // ← REQUIRED
  onDelete: 'CASCADE',       // ← Cleanup orphans
  eager: false,              // ← Prevent N+1 queries
})
@JoinColumn({ name: 'userId' })
user: User;

// ✅ Add indices for FK + time queries
@Entity()
@Index(['userId', 'startTime', 'endTime'])  // ← Performance
export class UserActivitySchedule { }
```

---

## 📞 Support

If issue persists:
1. Check database logs: `tail -f /var/log/postgresql/postgresql.log`
2. Run full schema rebuild
3. Check entity imports in app.module.ts
