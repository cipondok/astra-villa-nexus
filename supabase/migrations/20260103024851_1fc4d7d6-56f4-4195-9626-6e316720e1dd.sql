-- Add discount_percentage column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS discount_percentage numeric(5,2) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.discount_percentage IS 'Discount percentage (0-100) to show on property listing';