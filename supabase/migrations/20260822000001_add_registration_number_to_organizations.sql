-- Migration: Add registration_number column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS registration_number TEXT;

COMMENT ON COLUMN public.organizations.registration_number IS 'NGO/Organization official registration number or tax registration ID.';
