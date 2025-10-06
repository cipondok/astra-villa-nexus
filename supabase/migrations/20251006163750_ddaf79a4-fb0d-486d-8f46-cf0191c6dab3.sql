-- Add missing fields to inquiries table for contact management
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT;

-- Update existing records to populate contact_name from user profiles where available
UPDATE public.inquiries
SET contact_name = (
  SELECT full_name 
  FROM public.profiles 
  WHERE profiles.id = inquiries.user_id
)
WHERE contact_name IS NULL AND user_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.inquiries.contact_name IS 'Name of the person submitting the inquiry (from form)';
COMMENT ON COLUMN public.inquiries.department IS 'Department the inquiry is directed to';