-- Add construction progress columns to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS construction_phase text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estimated_completion_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS construction_phases jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS developer_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS launch_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estimated_completion_value numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_early_bird boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pre_launch boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_units integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS units_sold integer DEFAULT NULL;

-- Add index for off-plan project queries
CREATE INDEX IF NOT EXISTS idx_properties_construction_phase ON public.properties (construction_phase) WHERE construction_phase IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_completion_pct ON public.properties (completion_percentage) WHERE completion_percentage IS NOT NULL;

COMMENT ON COLUMN public.properties.construction_phase IS 'Current phase: planning, groundbreaking, structure, mep, finishing, handover';
COMMENT ON COLUMN public.properties.completion_percentage IS '0-100 construction completion';
COMMENT ON COLUMN public.properties.construction_phases IS 'JSON array of phases with name, completed, current, estimatedDate';
COMMENT ON COLUMN public.properties.estimated_completion_value IS 'Projected market value at completion in IDR';