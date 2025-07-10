-- Add discount fields to vendor_services table
ALTER TABLE public.vendor_services 
ADD COLUMN discount_percentage numeric(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN discount_start_date timestamp with time zone,
ADD COLUMN discount_end_date timestamp with time zone,
ADD COLUMN discount_description text,
ADD COLUMN is_discount_active boolean DEFAULT false;

-- Add function to automatically update discount status based on dates
CREATE OR REPLACE FUNCTION update_discount_status()
RETURNS trigger AS $$
BEGIN
  -- Update discount status based on dates
  IF NEW.discount_start_date IS NOT NULL AND NEW.discount_end_date IS NOT NULL THEN
    NEW.is_discount_active = (NOW() >= NEW.discount_start_date AND NOW() <= NEW.discount_end_date AND NEW.discount_percentage > 0);
  ELSE
    NEW.is_discount_active = (NEW.discount_percentage > 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update discount status
CREATE TRIGGER update_vendor_services_discount_status
  BEFORE INSERT OR UPDATE ON public.vendor_services
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_status();