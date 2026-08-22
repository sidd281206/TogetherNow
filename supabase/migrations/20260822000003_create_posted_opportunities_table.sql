-- Create or update opportunities table for storing posted events
CREATE TABLE IF NOT EXISTS public.opportunities (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL DEFAULT 'Organization',
    title           TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'Community',
    location        TEXT NOT NULL DEFAULT 'Local Community Center',
    is_remote       BOOLEAN DEFAULT FALSE,
    date            TEXT NOT NULL DEFAULT 'Upcoming',
    time            TEXT NOT NULL DEFAULT 'Flexible',
    spots_left      INTEGER DEFAULT 10,
    skills_needed   TEXT[] DEFAULT '{}',
    description     TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already existed from initial schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='organization_name') THEN
        ALTER TABLE public.opportunities ADD COLUMN organization_name TEXT NOT NULL DEFAULT 'Organization';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='category') THEN
        ALTER TABLE public.opportunities ADD COLUMN category TEXT NOT NULL DEFAULT 'Community';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='location') THEN
        ALTER TABLE public.opportunities ADD COLUMN location TEXT NOT NULL DEFAULT 'Local Community Center';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='is_remote') THEN
        ALTER TABLE public.opportunities ADD COLUMN is_remote BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='date') THEN
        ALTER TABLE public.opportunities ADD COLUMN date TEXT NOT NULL DEFAULT 'Upcoming';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='time') THEN
        ALTER TABLE public.opportunities ADD COLUMN time TEXT NOT NULL DEFAULT 'Flexible';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='spots_left') THEN
        ALTER TABLE public.opportunities ADD COLUMN spots_left INTEGER DEFAULT 10;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='skills_needed') THEN
        ALTER TABLE public.opportunities ADD COLUMN skills_needed TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow authenticated users to insert opportunities" ON public.opportunities;

-- RLS Policies
CREATE POLICY "Allow public read access to opportunities"
ON public.opportunities FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert opportunities"
ON public.opportunities FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
