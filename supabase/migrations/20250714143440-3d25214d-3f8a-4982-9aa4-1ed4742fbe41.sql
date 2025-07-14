-- Add rental-specific fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rental_periods TEXT[] DEFAULT ARRAY['monthly'],
ADD COLUMN IF NOT EXISTS minimum_rental_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'astra_villa', -- 'astra_villa', 'owner_only', 'both'
ADD COLUMN IF NOT EXISTS advance_booking_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS rental_terms JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_from DATE,
ADD COLUMN IF NOT EXISTS available_until DATE;