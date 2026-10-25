-- ── Event Manager, Organization Employees, and Attendance Migration ──────────

-- 1. Create organization_employees table
CREATE TABLE IF NOT EXISTS public.organization_employees (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id       TEXT NOT NULL UNIQUE,
    name              TEXT NOT NULL,
    phone             TEXT NOT NULL,
    email             TEXT,
    address           TEXT,
    role_title        TEXT DEFAULT 'Event Manager',
    password          TEXT NOT NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by employee_id for login
CREATE INDEX IF NOT EXISTS idx_org_employees_employee_id ON public.organization_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_org_employees_org_id ON public.organization_employees(organization_id);

-- Enable RLS
ALTER TABLE public.organization_employees ENABLE ROW LEVEL SECURITY;

-- Allow org owners to manage their own employees
DROP POLICY IF EXISTS "org_employees: owner manage" ON public.organization_employees;
CREATE POLICY "org_employees: owner manage"
    ON public.organization_employees
    FOR ALL
    USING (auth.uid() = organization_id)
    WITH CHECK (auth.uid() = organization_id);

-- Allow public read/login lookup or service role
DROP POLICY IF EXISTS "org_employees: allow employee lookup" ON public.organization_employees;
CREATE POLICY "org_employees: allow employee lookup"
    ON public.organization_employees
    FOR SELECT
    USING (true);

-- 2. Add columns to opportunities for assigned event manager codes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'assigned_employee_ids'
    ) THEN
        ALTER TABLE public.opportunities ADD COLUMN assigned_employee_ids TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Add columns to applications for attendance tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'attendance_status'
    ) THEN
        ALTER TABLE public.applications ADD COLUMN attendance_status TEXT DEFAULT 'unmarked';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'attendance_marked_at'
    ) THEN
        ALTER TABLE public.applications ADD COLUMN attendance_marked_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'attendance_marked_by'
    ) THEN
        ALTER TABLE public.applications ADD COLUMN attendance_marked_by TEXT;
    END IF;
END $$;

-- 4. Create event_attendance table for event attendance records
CREATE TABLE IF NOT EXISTS public.event_attendance (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id       TEXT NOT NULL,
    volunteer_id   TEXT NOT NULL,
    volunteer_name TEXT,
    status         TEXT NOT NULL DEFAULT 'present',
    marked_by      TEXT,
    marked_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_event_volunteer_attendance UNIQUE (event_id, volunteer_id)
);

ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_attendance: allow read" ON public.event_attendance;
CREATE POLICY "event_attendance: allow read"
    ON public.event_attendance FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "event_attendance: allow insert and update" ON public.event_attendance;
CREATE POLICY "event_attendance: allow insert and update"
    ON public.event_attendance FOR ALL
    USING (true)
    WITH CHECK (true);
