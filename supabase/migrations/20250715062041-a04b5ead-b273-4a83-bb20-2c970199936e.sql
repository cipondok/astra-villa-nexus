-- Add NPWP and tax withholding fields to payout_settings table
ALTER TABLE public.payout_settings 
ADD COLUMN npwp_number text,
ADD COLUMN tax_withholding_enabled boolean DEFAULT true;