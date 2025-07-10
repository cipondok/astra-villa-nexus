-- Add discount eligibility to vendor categories
ALTER TABLE public.vendor_main_categories 
ADD COLUMN discount_eligible BOOLEAN DEFAULT true;

ALTER TABLE public.vendor_subcategories 
ADD COLUMN discount_eligible BOOLEAN DEFAULT true;

ALTER TABLE public.vendor_service_categories 
ADD COLUMN discount_eligible BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN public.vendor_main_categories.discount_eligible IS 'Whether services in this category can have discounts applied';
COMMENT ON COLUMN public.vendor_subcategories.discount_eligible IS 'Whether services in this subcategory can have discounts applied';
COMMENT ON COLUMN public.vendor_service_categories.discount_eligible IS 'Whether services in this category can have discounts applied';