# Supabase CLI Setup Guide

## Option 1: Local Development with Supabase CLI (Recommended)

### Install Supabase CLI

**Windows (PowerShell):**
```powershell
scoop install supabase
```

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**npm (cross-platform):**
```bash
npm install -g supabase
```

### Link Your Project

```bash
# Login to Supabase
supabase login

# Link to your project
cd callcontext
supabase link --project-ref xyzdhdcwudjjssnpabvs
```

### Apply Migrations Automatically

```bash
# Push all migrations to your database
supabase db push

# Or apply migrations one by one
supabase migration up
```

### Generate TypeScript Types

```bash
# Auto-generate types from your database
supabase gen types typescript --linked > callcontext-frontend/lib/types/database.ts
```

---

## Option 2: GitHub Actions (CI/CD Automation)

Create `.github/workflows/supabase-migrations.yml`:

```yaml
name: Deploy Supabase Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

**Setup Secrets:**
1. Go to: https://supabase.com/dashboard/account/tokens
2. Generate access token
3. Add to GitHub: Settings → Secrets → Actions
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_DB_PASSWORD`

---

## Option 3: Supabase Studio + Git Sync (Coming Soon)

Supabase is working on direct Git integration that will:
- Auto-detect migration files in your repo
- Apply them on push
- No CLI needed

This feature is in beta.

---

## Recommended Workflow

### 1. **Development:**
```bash
# Create a new migration
supabase migration new add_users_table

# Edit the file: supabase/migrations/YYYYMMDDHHMMSS_add_users_table.sql

# Apply locally (if using local dev)
supabase db reset

# Or apply to remote
supabase db push
```

### 2. **Deployment:**
```bash
# When you're ready, push to remote
git add supabase/migrations/
git commit -m "Add users table migration"
git push

# Then apply migrations
supabase db push
```

### 3. **Auto-generate Types:**
```bash
# After any schema change
supabase gen types typescript --linked > callcontext-frontend/lib/types/database.ts
```

---

## Quick Setup for Your Project

Run these commands now:

```bash
# 1. Install CLI (choose one)
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
cd c:\Users\saipr\Documents\callcontext
supabase link --project-ref xyzdhdcwudjjssnpabvs

# 4. Apply all existing migrations
supabase db push

# 5. Generate types
supabase gen types typescript --linked > callcontext-frontend/lib/types/database.ts
```

---

## Daily Workflow

### When you create a new migration:

```bash
# 1. Create migration file
supabase migration new your_migration_name

# 2. Write SQL in: supabase/migrations/TIMESTAMP_your_migration_name.sql

# 3. Apply to database
supabase db push

# 4. Regenerate types
supabase gen types typescript --linked > callcontext-frontend/lib/types/database.ts

# 5. Commit everything
git add supabase/migrations/ callcontext-frontend/lib/types/
git commit -m "Add migration: your_migration_name"
```

---

## Verify Migrations

```bash
# Check which migrations are applied
supabase migration list

# Check migration status
supabase db diff

# Rollback last migration (if needed)
supabase migration repair
```

---

## Benefits

✅ **No more copy/paste** - CLI applies migrations directly  
✅ **Version controlled** - All changes tracked in Git  
✅ **Type safety** - Auto-generated TypeScript types  
✅ **Rollback support** - Can undo migrations if needed  
✅ **Team collaboration** - Everyone uses same migrations  
✅ **CI/CD ready** - Automate with GitHub Actions  

---

## Troubleshooting

### "supabase: command not found"
Install the CLI using one of the methods above.

### "Project not linked"
Run: `supabase link --project-ref xyzdhdcwudjjssnpabvs`

### "Permission denied"
Make sure you're logged in: `supabase login`

### Migrations out of sync
Check status: `supabase migration list`  
Repair: `supabase migration repair`

---

## Next Steps

1. Install the CLI
2. Run the "Quick Setup" commands above
3. Your migrations will be applied automatically!

Then in the future, just:
```bash
supabase db push  # Push new migrations
```

That's it! 🚀
