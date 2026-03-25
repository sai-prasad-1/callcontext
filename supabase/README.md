# Supabase Database Setup Guide

## Quick Start

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/xyzdhdcwudjjssnpabvs

2. **Open SQL Editor**: Click "SQL Editor" in the left sidebar

3. **Run migrations in order**:
   - Copy and paste the contents of each file below into a new query
   - Click "Run" after pasting each one
   - Wait for "Success" message before proceeding to next

### Migration Order:

#### Step 1: Create Tables
```
supabase/migrations/001_initial_schema.sql
```
This creates all 12 core tables with proper relationships and constraints.

#### Step 2: Enable Row Level Security
```
supabase/migrations/002_rls_policies.sql
```
This enables RLS and creates policies so each shop can only see their own data.

#### Step 3: Add Performance Indexes
```
supabase/migrations/003_indexes.sql
```
This adds indexes for fast queries (caller lookup, dashboard loads, etc.).

#### Step 4: Waitlist (optional for landing)
```
supabase/migrations/004_waitlist.sql
```

#### Step 5: RBAC — shop memberships
```
supabase/migrations/005_rbac_shop_memberships.sql
```
Adds `shop_memberships` (owner/manager/staff/analyst), backfills owner rows for existing shops, and creates a trigger so new shops get an owner membership automatically.

#### Step 6: RLS — shared shop access
```
supabase/migrations/006_rls_shop_access_and_memberships.sql
```
Adds `shop_ids_for_current_user()` and updates tenant RLS policies so active members—not only `shops.owner_id`—can access shop data. Defines RLS for `shop_memberships`.

#### Step 7: Team invite helper (service role only)
```
supabase/migrations/007_lookup_user_id_by_email.sql
```
Adds `lookup_user_id_by_email` for the **service role** so the team invite API can attach existing auth users without exposing `auth.users` to clients.

#### Step 8: Fix shop_memberships RLS recursion (team list / 42P17)
```
supabase/migrations/008_fix_shop_memberships_rls_recursion.sql
```
Replaces the `shop_memberships` SELECT policy that subqueried `shop_memberships` (infinite recursion) with `shop_ids_for_current_user()`, and sets `row_security = off` on that helper so policy checks stay non-recursive.

---

## Verify Setup

After running all migrations through `008`, verify everything is working:

### Check Tables
Go to "Table Editor" in Supabase dashboard - you should see:
- shops
- customers
- calls
- orders
- reminders
- notes
- tasks
- loyalty_transactions
- campaigns
- integrations
- webhook_endpoints
- webhook_deliveries

### Test Signup
1. Go to your frontend: http://localhost:3000/signup
2. Fill out the signup form
3. Submit - you should see a new row in the `shops` table!

---

## Schema Overview

### Core Tables

**shops** - One per business
- Stores business info, phone number, subscription
- Links to owner via `owner_id` (Supabase auth user)

**customers** - Auto-created from calls
- Phone number is the primary identifier
- Tracks loyalty, lifetime value, preferences
- Unique constraint: one phone per shop

**calls** - Every phone call
- Links to customer and shop
- Stores transcript, recording, AI analysis
- Status: ringing → active → completed

**orders** - Created from calls or manual entry
- Links to customer and optionally a call
- Stores products (JSONB), delivery details

**reminders** - Auto-detected or manual
- Birthday, anniversary, recurring dates
- Advance notification (1 week, 3 days, etc.)

**notes** - Manual notes on customers
- Can be pinned to top of profile
- Links to customer and optionally a call

**tasks** - To-dos with due dates
- Can be assigned to specific users
- Priority: low/medium/high

**loyalty_transactions** - Points log
- earn, redeem, adjust, expire
- Tracks points history per customer

**campaigns** - SMS/Email marketing
- Segment filtering
- Scheduled sends
- Analytics tracking

**integrations** - Third-party connections
- OAuth credentials (encrypted)
- Sync status tracking

**webhook_endpoints** - Outgoing webhooks
- Event subscriptions
- Delivery logging

---

## RLS Security Model

Every table has Row Level Security enabled. This means:

✅ **Shop owners can only see their own data**
- Enforced at the database level
- Even if your code has a bug, data is isolated
- No accidental data leaks between shops

❌ **Direct access requires proper auth**
- Anonymous users see nothing
- Must be authenticated via Supabase Auth
- Must own a shop to query any data

---

## Performance Notes

### Critical Indexes

These indexes ensure sub-50ms query performance:

1. **Customer phone lookup** (`idx_customers_shop_phone`)
   - UNIQUE index on (shop_id, phone)
   - Used during every incoming call for instant caller ID

2. **Call history** (`idx_calls_shop_started`)
   - Index on (shop_id, started_at DESC)
   - Powers the dashboard call list

3. **Reminders due** (`idx_reminders_due`)
   - Filtered index for pending reminders
   - Queried daily by cron job

### Full-Text Search

**Customer search** (`idx_customers_search`)
- GIN index on name + phone
- Supports queries like: "Show me customers named John"
- Usage: `to_tsquery('english', 'john:*')`

---

## Connection Info

Your Supabase project is already configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzdhdcwudjjssnpabvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Wsc1rJY55j_6HnidHr4OCQ_E2eTBZb8
```

The anon key is safe to expose client-side because RLS protects the data.

---

## Next Steps

After running migrations:

1. ✅ Test signup flow
2. ✅ Verify shop is created in database
3. ✅ Try logging in
4. ✅ Dashboard should load without errors

Then you're ready for:
- Week 2: Vonage phone number integration
- Week 3-4: Calls page and customer profiles
- Week 5+: Real-time transcription (Railway server)

---

## Troubleshooting

**Error: "relation already exists"**
- Some tables were already created. Drop them first:
  ```sql
  DROP TABLE IF EXISTS webhook_deliveries CASCADE;
  DROP TABLE IF EXISTS webhook_endpoints CASCADE;
  DROP TABLE IF EXISTS integrations CASCADE;
  -- ... repeat for all tables in reverse order
  ```

**Error: "could not find table in schema cache"**
- Migration didn't run. Check SQL Editor for errors
- Make sure you ran 001, then 002, then 003 in order

**RLS blocks my queries**
- Make sure you're authenticated (logged in)
- Check that your user has a shop (query `shops` table)
- Verify `owner_id` matches `auth.uid()`

---

## Schema Diagram

```
auth.users (Supabase Auth)
    ↓
  shops ──┐
    ↓     │
customers │
    ↓     │
  calls   │
    ↓     │
  orders  │
    ↓     │
reminders │
    ↓     │
  notes   │
    ↓     │
  tasks ──┘
```

Everything connects through `shop_id` for multi-tenancy.
