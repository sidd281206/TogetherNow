-- ============================================================
-- TogetherNow — Donor Feature Migration
-- Generated: 2026-10-25
-- ============================================================

-- ── 1. donor_profiles ─────────────────────────────────────────────────────────
-- 1-to-1 with profiles where role = 'donor'. Mirrors volunteer_profiles pattern.

CREATE TABLE IF NOT EXISTS public.donor_profiles (
    id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    phone         TEXT,
    address       TEXT,
    city          TEXT,
    pincode       TEXT,
    pan_number    TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    total_donated NUMERIC(10, 2) DEFAULT 0.00,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.donor_profiles IS 'Extended profile data for users with role=donor.';

-- ── 2. donation_requests ──────────────────────────────────────────────────────
-- Organizations raise fund requests here. Donors can browse and donate to them.

CREATE TABLE IF NOT EXISTS public.donation_requests (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organization_name TEXT NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL,
    cause_category    TEXT NOT NULL DEFAULT 'Community',
    goal_amount       NUMERIC(10, 2) NOT NULL,
    raised_amount     NUMERIC(10, 2) DEFAULT 0.00,
    currency          TEXT DEFAULT 'INR',
    deadline          DATE,
    image_url         TEXT,
    status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.donation_requests IS 'Fund-raising campaigns posted by organizations. Donors browse and contribute here.';

-- ── 3. Alter donations — add donation_request_id FK ───────────────────────────

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'donations' AND column_name = 'donation_request_id'
    ) THEN
        ALTER TABLE public.donations
            ADD COLUMN donation_request_id UUID REFERENCES public.donation_requests(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ── 4. Trigger: auto-update raised_amount whenever a donation is inserted ──────

CREATE OR REPLACE FUNCTION public.update_raised_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.donation_request_id IS NOT NULL THEN
        UPDATE public.donation_requests
        SET raised_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.donations
            WHERE donation_request_id = NEW.donation_request_id
              AND status = 'completed'
        ),
        updated_at = NOW()
        WHERE id = NEW.donation_request_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_raised_amount ON public.donations;
CREATE TRIGGER trg_update_raised_amount
    AFTER INSERT OR UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION public.update_raised_amount();

-- ── 5. Trigger: auto-update donor total_donated ───────────────────────────────

CREATE OR REPLACE FUNCTION public.update_donor_total_donated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.donor_id IS NOT NULL THEN
        UPDATE public.donor_profiles
        SET total_donated = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.donations
            WHERE donor_id = NEW.donor_id
              AND status = 'completed'
        ),
        updated_at = NOW()
        WHERE id = NEW.donor_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_donor_total ON public.donations;
CREATE TRIGGER trg_update_donor_total
    AFTER INSERT OR UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION public.update_donor_total_donated();

-- ── 6. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_donation_requests_org_id  ON public.donation_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status  ON public.donation_requests(status);
CREATE INDEX IF NOT EXISTS idx_donations_request_id      ON public.donations(donation_request_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_id         ON public.donor_profiles(id);

-- ── 7. Enable RLS ─────────────────────────────────────────────────────────────

ALTER TABLE public.donor_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

-- ── 8. RLS Policies: donor_profiles ──────────────────────────────────────────

DROP POLICY IF EXISTS "donor_profiles: owner or admin can select" ON public.donor_profiles;
CREATE POLICY "donor_profiles: owner or admin can select"
    ON public.donor_profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "donor_profiles: donor can insert own" ON public.donor_profiles;
CREATE POLICY "donor_profiles: donor can insert own"
    ON public.donor_profiles FOR INSERT
    WITH CHECK (auth.uid() = id AND public.get_my_role() = 'donor');

DROP POLICY IF EXISTS "donor_profiles: owner or admin can update" ON public.donor_profiles;
CREATE POLICY "donor_profiles: owner or admin can update"
    ON public.donor_profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "donor_profiles: only admin can delete" ON public.donor_profiles;
CREATE POLICY "donor_profiles: only admin can delete"
    ON public.donor_profiles FOR DELETE
    USING (public.is_admin());

-- ── 9. RLS Policies: donation_requests ───────────────────────────────────────

DROP POLICY IF EXISTS "donation_requests: all authenticated can read" ON public.donation_requests;
CREATE POLICY "donation_requests: all authenticated can read"
    ON public.donation_requests FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "donation_requests: org can create own" ON public.donation_requests;
CREATE POLICY "donation_requests: org can create own"
    ON public.donation_requests FOR INSERT
    WITH CHECK (
        public.get_my_role() = 'organization'
        AND auth.uid() = organization_id
    );

DROP POLICY IF EXISTS "donation_requests: owner org or admin can update" ON public.donation_requests;
CREATE POLICY "donation_requests: owner org or admin can update"
    ON public.donation_requests FOR UPDATE
    USING (auth.uid() = organization_id OR public.is_admin())
    WITH CHECK (auth.uid() = organization_id OR public.is_admin());

DROP POLICY IF EXISTS "donation_requests: owner org or admin can delete" ON public.donation_requests;
CREATE POLICY "donation_requests: owner org or admin can delete"
    ON public.donation_requests FOR DELETE
    USING (auth.uid() = organization_id OR public.is_admin());
