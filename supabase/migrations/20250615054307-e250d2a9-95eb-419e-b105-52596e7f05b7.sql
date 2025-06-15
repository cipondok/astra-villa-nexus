
ALTER TABLE public.office_locations
ADD COLUMN email TEXT;

COMMENT ON COLUMN public.office_locations.email IS 'Contact email for the office location.';
