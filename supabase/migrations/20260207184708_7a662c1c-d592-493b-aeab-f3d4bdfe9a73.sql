
-- First, update the check constraint to include 'verification_request' and 'company_verification' types
ALTER TABLE public.admin_alerts DROP CONSTRAINT IF EXISTS admin_alerts_type_check;

ALTER TABLE public.admin_alerts ADD CONSTRAINT admin_alerts_type_check CHECK (
  type = ANY (ARRAY[
    'user_registration'::text, 
    'property_listing'::text, 
    'agent_request'::text, 
    'vendor_request'::text, 
    'kyc_verification'::text, 
    'system_issue'::text, 
    'customer_complaint'::text, 
    'inquiry'::text, 
    'report'::text, 
    'payment'::text, 
    'security'::text, 
    'maintenance'::text, 
    'performance'::text, 
    'abuse'::text,
    'verification_request'::text,
    'company_verification'::text
  ])
);

-- Now update the trigger function to use 'company_verification' type
CREATE OR REPLACE FUNCTION public.notify_admin_pending_company_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alert if company_name is set and company_verified is false
  IF NEW.company_name IS NOT NULL 
     AND NEW.company_name != '' 
     AND (NEW.company_verified = false OR NEW.company_verified IS NULL)
     AND (OLD.company_name IS NULL OR OLD.company_name = '' OR OLD.company_name != NEW.company_name) THEN
    
    INSERT INTO public.admin_alerts (
      type,
      title,
      message,
      priority,
      reference_id,
      reference_type,
      action_required,
      metadata,
      alert_category,
      auto_generated,
      urgency_level
    ) VALUES (
      'company_verification',
      'Company Verification Required',
      COALESCE(NEW.full_name, 'A user') || ' has submitted company "' || NEW.company_name || '" for AHU verification.',
      'medium',
      NEW.id,
      'company_verification',
      true,
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.full_name,
        'company_name', NEW.company_name,
        'ahu_search_url', 'https://ahu.go.id/pencarian/profil-pt'
      ),
      'verification',
      true,
      2
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table for company verification
DROP TRIGGER IF EXISTS trigger_notify_admin_company_verification ON public.profiles;

CREATE TRIGGER trigger_notify_admin_company_verification
  AFTER INSERT OR UPDATE OF company_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_pending_company_verification();

-- Backfill: Insert admin alerts for existing pending company verifications
INSERT INTO public.admin_alerts (
  type,
  title,
  message,
  priority,
  reference_id,
  reference_type,
  action_required,
  metadata,
  alert_category,
  auto_generated,
  urgency_level
)
SELECT 
  'company_verification',
  'Company Verification Required',
  COALESCE(p.full_name, 'A user') || ' has submitted company "' || p.company_name || '" for AHU verification.',
  'medium',
  p.id,
  'company_verification',
  true,
  jsonb_build_object(
    'user_id', p.id,
    'user_name', p.full_name,
    'company_name', p.company_name,
    'ahu_search_url', 'https://ahu.go.id/pencarian/profil-pt'
  ),
  'verification',
  true,
  2
FROM public.profiles p
WHERE p.company_name IS NOT NULL 
  AND p.company_name != ''
  AND (p.company_verified = false OR p.company_verified IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_alerts 
    WHERE reference_id = p.id
    AND reference_type = 'company_verification'
  );
