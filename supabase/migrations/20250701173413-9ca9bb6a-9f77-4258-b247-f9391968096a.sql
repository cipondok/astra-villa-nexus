
-- Add payment_status column to vendor_bookings table
ALTER TABLE public.vendor_bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));

-- Update existing records to have a default payment status
UPDATE public.vendor_bookings 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;
