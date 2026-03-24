# 🚨 Database Setup Required

## You're seeing this error because the database tables haven't been created yet.

### Quick Fix (5 minutes):

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/xyzdhdcwudjjssnpabvs/sql
   - Click "New query"

2. **Run Migration 1: Create Tables**
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success. No rows returned"

3. **Run Migration 2: Enable RLS**
   - Open `supabase/migrations/002_rls_policies.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success

4. **Run Migration 3: Add Indexes**
   - Open `supabase/migrations/003_indexes.sql`
   - Copy the entire contents  
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success

5. **Test Signup Again**:
   - Go back to http://localhost:3000/signup
   - Fill out the form
   - Click "Create account"
   - Should work now! ✅

---

## What These Migrations Do:

**001_initial_schema.sql** (12 tables):
- Creates shops, customers, calls, orders, reminders, notes, tasks
- Sets up foreign keys and relationships
- Adds constraints for data integrity

**002_rls_policies.sql** (Row Level Security):
- Ensures each shop can only see their own data
- Prevents data leaks between different businesses
- Enforces multi-tenancy at database level

**003_indexes.sql** (Performance):
- Adds indexes for fast queries
- Enables sub-50ms caller ID lookup during calls
- Optimizes dashboard and analytics queries

---

## Troubleshooting:

### ❌ "relation already exists"
**Fix**: Some tables were already created. Drop them first:
```sql
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS webhook_endpoints CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
```
Then run the migrations again.

### ❌ "new row violates row-level security policy"
**Fix**: Make sure you ran migration 002 (RLS policies) AND that the user is authenticated. The error happens when:
1. RLS is enabled but policies aren't created yet
2. User isn't authenticated when trying to insert

### ❌ "Could not find the table in schema cache"
**Fix**: Migration 001 didn't run. Make sure to:
1. Copy the ENTIRE file (all 310 lines)
2. Paste into SQL Editor
3. Click "Run"
4. Check for any error messages in the output

---

## Verify Setup:

After running all migrations, check in Supabase:

1. **Table Editor** (left sidebar):
   - Should see 12 tables: shops, customers, calls, orders, etc.
   - Each table should have columns and data types

2. **Authentication > Policies** (left sidebar):
   - Should see RLS policies for each table
   - "Enable RLS" should be ON for all tables

3. **Test Signup**:
   - Go to http://localhost:3000/signup
   - Create an account
   - Check "shops" table - should see 1 new row!

---

## Need Help?

See full instructions in: `supabase/README.md`

Or check the Supabase docs: https://supabase.com/docs/guides/database/tables
