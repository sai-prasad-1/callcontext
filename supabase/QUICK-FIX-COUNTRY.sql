-- Quick fix: Add country column if it doesn't exist
-- Run this in Supabase SQL Editor to fix the immediate error

-- Check if column exists and add it if not
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' AND column_name = 'country'
    ) THEN
        ALTER TABLE shops ADD COLUMN country TEXT NOT NULL DEFAULT 'US';
    END IF;
END $$;
