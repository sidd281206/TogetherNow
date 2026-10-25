-- ==============================================================================
-- Migration: 20261025000003_cleanup_unused_tables.sql
-- Description: Clean up unused legacy boilerplate tables from Supabase.
-- 
-- The following 9 tables are completely unused by TogetherNow:
-- 1. attendance    (Replaced by event_attendance & applications.attendance_status)
-- 2. events        (Replaced by opportunities table)
-- 3. user_badges   (Badges are dynamically computed in VolunteerDashboard)
-- 4. badges        (Boilerplate badges table, unreferenced)
-- 5. certificates  (Certificates generated dynamically in UI)
-- 6. notifications (Notifications managed via src/lib/notifications.ts)
-- 7. audit_logs    (Unused boilerplate logging table)
-- 8. skills        (Skills stored as native TEXT[] in volunteer_profiles & opportunities)
-- 9. categories    (Categories stored as typed text in opportunities.category)
-- ==============================================================================

-- 1. Safely remove legacy foreign key constraint from opportunities if present
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'opportunities_category_id_fkey'
          AND table_name = 'opportunities'
    ) THEN
        ALTER TABLE public.opportunities DROP CONSTRAINT opportunities_category_id_fkey;
    END IF;
    
    -- Drop legacy category_id column if present (opportunities uses 'category TEXT')
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'opportunities' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.opportunities DROP COLUMN category_id;
    END IF;
END $$;

-- 2. Safely drop unused tables (with CASCADE to clean up any legacy constraints)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
