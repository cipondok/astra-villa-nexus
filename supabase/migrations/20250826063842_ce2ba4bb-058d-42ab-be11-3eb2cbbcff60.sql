-- Fix critical security vulnerability: validation_rules table exposed to public
-- This prevents fraudsters from studying validation patterns to bypass security

-- Remove the public access policy that exposes validation logic
DROP POLICY IF EXISTS "Public can view active validation rules" ON public.validation_rules;

-- Create secure policy: only admins can view validation rules
-- This prevents fraudsters from accessing regex patterns and business logic
CREATE POLICY "Only admins can view validation rules"
ON public.validation_rules FOR SELECT
USING (check_admin_access());

-- Ensure validation_logs are also properly secured
-- Keep existing policies but add additional protection
CREATE POLICY "System can insert validation logs"
ON public.validation_logs FOR INSERT
WITH CHECK (true);

-- Enable RLS on validation_logs if not already enabled
ALTER TABLE public.validation_logs ENABLE ROW LEVEL SECURITY;

-- Also secure any potential API access by creating a safe function for frontend validation
-- This allows the app to validate without exposing the actual rules
CREATE OR REPLACE FUNCTION public.validate_field_safe(
  p_field_name text,
  p_field_value text,
  p_vendor_type text DEFAULT 'general'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rule_record RECORD;
  validation_result jsonb;
  is_valid boolean := true;
  error_msg text := '';
BEGIN
  -- Only perform validation, don't expose the actual rules
  FOR rule_record IN 
    SELECT validation_type, validation_logic, error_message
    FROM validation_rules 
    WHERE field_name = p_field_name 
      AND vendor_type = p_vendor_type 
      AND is_active = true
  LOOP
    -- Perform validation based on type without exposing logic
    CASE rule_record.validation_type
      WHEN 'regex' THEN
        -- Extract regex pattern safely without exposing it
        IF NOT (p_field_value ~ (rule_record.validation_logic->>'pattern')) THEN
          is_valid := false;
          error_msg := rule_record.error_message;
          EXIT;
        END IF;
      WHEN 'length' THEN
        -- Check length constraints
        IF length(p_field_value) < (rule_record.validation_logic->>'min_length')::int OR
           length(p_field_value) > (rule_record.validation_logic->>'max_length')::int THEN
          is_valid := false;
          error_msg := rule_record.error_message;
          EXIT;
        END IF;
      WHEN 'required' THEN
        -- Check if field is required
        IF p_field_value IS NULL OR trim(p_field_value) = '' THEN
          is_valid := false;
          error_msg := rule_record.error_message;
          EXIT;
        END IF;
    END CASE;
  END LOOP;
  
  -- Return validation result without exposing rules
  validation_result := jsonb_build_object(
    'is_valid', is_valid,
    'error_message', CASE WHEN is_valid THEN null ELSE error_msg END,
    'field_name', p_field_name
  );
  
  RETURN validation_result;
END;
$$;