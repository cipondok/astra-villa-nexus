-- Add NPWP (Indonesian Tax ID) field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN npwp_number text;