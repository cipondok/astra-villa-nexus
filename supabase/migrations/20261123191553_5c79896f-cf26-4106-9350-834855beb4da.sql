ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.properties.is_demo IS 'Sample/demo inventory: shown with a DEMO label, set to noindex and left out of the sitemap.';
-- The 648 listings bulk-imported by the platform admin between 2026-05-26 and 2026-06-01 are sample inventory.
UPDATE public.properties
SET is_demo = true
WHERE owner_id = 'ba91fae1-32df-4356-adf3-170c2d98c681'
  AND created_at >= '2026-05-26' AND created_at < '2026-06-02';
CREATE INDEX IF NOT EXISTS idx_properties_is_demo ON public.properties (is_demo) WHERE is_demo = false;