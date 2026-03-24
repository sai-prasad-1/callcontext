# 🔧 Quick Fix: Database Setup

## Issue
You're seeing this error:
```
Failed to create shop profile
Could not find the 'country' column of 'shops' in the schema cache
```

## Solution

You need to apply the database migrations to your Supabase project. Here are **3 ways** to do it:

---

## Option 1: Manual SQL (Quickest - 2 minutes)

1. Go to https://supabase.com/dashboard
2. Open your project: **callcontext**
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste ALL 4 migration files in order:

### Step 1: Run `001_initial_schema.sql`
```sql
-- Copy the entire contents of: supabase/migrations/001_initial_schema.sql
-- This creates all tables including the shops table
```

### Step 2: Run `002_rls_policies.sql`
```sql
-- Copy the entire contents of: supabase/migrations/002_rls_policies.sql
-- This sets up Row Level Security
```

### Step 3: Run `003_indexes.sql`
```sql
-- Copy the entire contents of: supabase/migrations/003_indexes.sql
-- This adds performance indexes
```

### Step 4: Run `004_waitlist.sql`
```sql
-- Copy the entire contents of: supabase/migrations/004_waitlist.sql
-- This adds the waitlist table
```

6. Click **RUN** for each one
7. Try signing up again!

---

## Option 2: Use Supabase CLI (Recommended for future)

### First-time setup:
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link your project
cd c:\Users\saipr\Documents\callcontext
supabase link --project-ref xyzdhdcwudjjssnpabvs
```

### Apply migrations:
```bash
supabase db push
```

That's it! All 4 migrations will be applied automatically.

---

## Option 3: Quick Fix SQL (If you just need country column)

If you already ran the migrations but are missing the `country` column:

1. Go to SQL Editor
2. Run this:

```sql
-- Quick fix for country column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' AND column_name = 'country'
    ) THEN
        ALTER TABLE shops ADD COLUMN country TEXT NOT NULL DEFAULT 'US';
    END IF;
END $$;
```

---

## Verify It Worked

After running migrations, check in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check shops table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'shops'
ORDER BY ordinal_position;
```

You should see:
- `shops` table
- `customers` table
- `calls` table
- `waitlist` table
- And more...

The `shops` table should have a `country` column.

---

## Next Time

To avoid this in the future, use the Supabase CLI:

```bash
# Create a new migration
supabase migration new add_feature_name

# Apply all migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > callcontext-frontend/lib/types/database.ts
```

---

## Still Having Issues?

Check:
1. You're connected to the correct Supabase project
2. The migrations ran without errors
3. RLS policies are enabled on the shops table

Need help? Check `SUPABASE-CLI-SETUP.md` for detailed instructions.
