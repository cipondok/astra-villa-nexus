-- Add extended profile fields for agents
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS years_experience TEXT,
ADD COLUMN IF NOT EXISTS specializations TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Add trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_score INTEGER := 0;
  total_weight INTEGER := 100;
BEGIN
  -- Calculate completion based on field weights
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) > 2 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone ~ '^(\+62|62|0)8[1-9][0-9]{6,9}$' THEN
    completion_score := completion_score + 20;
  END IF;
  
  IF NEW.company_name IS NOT NULL AND LENGTH(NEW.company_name) > 2 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF NEW.license_number IS NOT NULL AND LENGTH(NEW.license_number) > 5 THEN
    completion_score := completion_score + 25;
  END IF;
  
  IF NEW.avatar_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF NEW.business_address IS NOT NULL AND LENGTH(NEW.business_address) > 5 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF NEW.years_experience IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Update the completion percentage
  NEW.profile_completion_percentage := completion_score;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic profile completion calculation
DROP TRIGGER IF EXISTS calculate_profile_completion_trigger ON public.profiles;
CREATE TRIGGER calculate_profile_completion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_profile_completion();

-- Create function to format Indonesian phone numbers
CREATE OR REPLACE FUNCTION public.format_indonesian_phone(input_phone TEXT)
RETURNS TEXT AS $$
DECLARE
  digits TEXT;
  formatted_phone TEXT;
BEGIN
  -- Remove all non-digits
  digits := regexp_replace(input_phone, '\D', '', 'g');
  
  -- Handle different formats
  IF digits ~ '^628' THEN
    formatted_phone := '+' || digits;
  ELSIF digits ~ '^08' THEN
    formatted_phone := '+62' || substring(digits from 2);
  ELSIF digits ~ '^8' THEN
    formatted_phone := '+62' || digits;
  ELSE
    formatted_phone := input_phone; -- Return original if doesn't match pattern
  END IF;
  
  RETURN formatted_phone;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate Indonesian phone numbers
CREATE OR REPLACE FUNCTION public.is_valid_indonesian_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN phone_number ~ '^(\+62|62|0)8[1-9][0-9]{6,9}$';
END;
$$ LANGUAGE plpgsql;