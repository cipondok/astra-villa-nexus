
-- Add development_status to properties table to categorize them
ALTER TABLE public.properties
ADD COLUMN development_status TEXT NOT NULL DEFAULT 'completed';

-- Add a check constraint to ensure only valid values are used
ALTER TABLE public.properties
ADD CONSTRAINT properties_development_status_check
CHECK (development_status IN ('completed', 'new_project', 'pre_launching'));
