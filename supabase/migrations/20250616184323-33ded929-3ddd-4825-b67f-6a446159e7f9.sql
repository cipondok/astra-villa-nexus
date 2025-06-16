
-- Add the missing approval_status column to properties table
ALTER TABLE public.properties 
ADD COLUMN approval_status text DEFAULT 'pending';

-- Add a check constraint to ensure only valid values are used
ALTER TABLE public.properties
ADD CONSTRAINT properties_approval_status_check
CHECK (approval_status IN ('pending', 'approved', 'rejected', 'under_review'));
