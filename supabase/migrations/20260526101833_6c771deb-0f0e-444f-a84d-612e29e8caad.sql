ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check
  CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'sold'::text, 'active'::text, 'pending'::text, 'inactive'::text, 'rented'::text]));