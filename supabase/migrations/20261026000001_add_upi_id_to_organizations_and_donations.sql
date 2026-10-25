-- ============================================================
-- TogetherNow — Add UPI ID to Organizations and Donations
-- Generated: 2026-10-26
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'upi_id'
    ) THEN
        ALTER TABLE public.organizations ADD COLUMN upi_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'donation_requests' AND column_name = 'upi_id'
    ) THEN
        ALTER TABLE public.donation_requests ADD COLUMN upi_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'donations' AND column_name = 'upi_id'
    ) THEN
        ALTER TABLE public.donations ADD COLUMN upi_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'donations' AND column_name = 'upi_txn_ref'
    ) THEN
        ALTER TABLE public.donations ADD COLUMN upi_txn_ref TEXT;
    END IF;
END $$;
