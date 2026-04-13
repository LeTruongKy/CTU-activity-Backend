# 🚨 IMMEDIATE FIX - FK CONSTRAINT VIOLATION

## The Problem
```
violates foreign key constraint "FK_d2d81bf754ce50484d041be28cb"
```
**Cause**: `user_activity_schedule` table contains orphaned records referencing deleted activities/users.

---

## ⚡ IMMEDIATE ACTION (Right Now)

### Step 1: Stop Backend
```bash
# Press Ctrl+C in terminal running: npm run dev
```

### Step 2: Run ONE of these fixes:

#### **Option A: Automated Fix (EASIEST)**
```bash
cd ctu-activity-backend
.\URGENT-fix-fk-violation.ps1
# Enter database password when prompted
# Script will clean all orphaned data automatically
```

#### **Option B: Manual SQL Fix (5 minutes)**

Open **pgAdmin** or **psql** and run:
```sql
-- Copy entire contents of: URGENT-cleanup-orphaned-data.sql
-- Paste into pgAdmin/psql query editor
-- Run/Execute

SET session_replication_role = 'replica';
DELETE FROM user_activity_schedule
WHERE "activityId" NOT IN (SELECT id FROM activities);
DELETE FROM user_activity_schedule
WHERE "userId" NOT IN (SELECT id FROM users);
SET session_replication_role = 'default';
```

### Step 3: Restart Backend
```bash
cd ctu-activity-backend
npm run build
npm run start:dev
```

**Expected Success Message:**
```
[TypeOrmModule] Database connection initialized successfully
[NestFactory] Application started on port 3000
```

---

## ✅ Verification

After restart, test:
1. Check API responds: `curl http://localhost:3000/api/health`
2. Verify table exists: 
   ```sql
   SELECT COUNT(*) FROM user_activity_schedule;
   ```

---

## 📝 What Was Done

1. ✅ **Disabled TypeORM sync** (temporarily) - allows backend to start
2. ✅ **Created cleanup script** - removes all orphaned records
3. ✅ **Created entity fixes** - proper FK constraints

---

## 🔄 After Fix: Re-enable Sync

Once database is clean and backend runs:

Edit `src/app.module.ts` line ~46:
```ts
// Change from:
synchronize: false,

// To:
synchronize: isDevelopment,
```

Rebuild and restart:
```bash
npm run build && npm run start:dev
```

---

## 🆘 If Still Failing

### Check 1: Verify Activities Exist
```sql
SELECT COUNT(*) as total_activities FROM activities;
-- Should return > 0
```

### Check 2: Verify Schedule Records
```sql
SELECT "userId", "activityId" FROM user_activity_schedule LIMIT 5;
-- Should show valid UUID and activity IDs
```

### Check 3: Nuclear Reset
```sql
-- Last resort - delete and recreate table
DROP TABLE IF EXISTS user_activity_schedule CASCADE;
-- Backend will recreate on next sync (after re-enabling)
```

### Check 4: Verify Logs
Look for errors containing:
- `FK_d2d81bf754ce50484d041be28cb` 
- `violates foreign key`

---

## 📌 Files Updated

| File | Change |
|------|--------|
| `src/app.module.ts` | Disabled sync temporarily |
| `src/modules/user_activity_schedule/entities/user_activity_schedule.entity.ts` | Fixed FK constraints |

## 📌 Files Created

| File | Purpose |
|------|---------|
| `URGENT-cleanup-orphaned-data.sql` | Run this in pgAdmin/psql |
| `URGENT-fix-fk-violation.ps1` | Automated cleanup script |

---

## ✅ Checklist

- [ ] Stop backend (Ctrl+C)
- [ ] Run cleanup script (either Option A or B)
- [ ] Verify database password works
- [ ] Cleanup completes with success message
- [ ] Rebuild: `npm run build`
- [ ] Restart: `npm run start:dev`
- [ ] Check logs for "Database connection initialized successfully"
- [ ] Test API endpoint works
- [ ] Re-enable sync in app.module.ts
- [ ] Final restart: `npm run start:dev`

---

## 💡 Prevention

**Always validate foreign key references before creating schedules:**
```ts
// Before creating user_activity_schedule:
const activityExists = await activities.findOne(activityId);
const userExists = await users.findOne(userId);

if (!activityExists || !userExists) {
  throw new BadRequestException('Invalid activity or user ID');
}

// Then create schedule safely
```
