
-- Add vendor assignment and progress tracking columns to maintenance_requests
ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS assigned_vendor_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS assigned_vendor_name TEXT,
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS owner_notes TEXT;
