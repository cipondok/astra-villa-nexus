-- Add main category lock functionality to vendor business profiles
ALTER TABLE public.vendor_business_profiles 
ADD COLUMN main_service_category_id uuid REFERENCES public.vendor_main_categories(id),
ADD COLUMN main_category_locked boolean DEFAULT false,
ADD COLUMN main_category_locked_at timestamp with time zone,
ADD COLUMN main_category_locked_by uuid REFERENCES auth.users(id),
ADD COLUMN category_change_reason text,
ADD COLUMN can_change_main_category boolean DEFAULT true;

-- Create index for performance
CREATE INDEX idx_vendor_main_category ON public.vendor_business_profiles(main_service_category_id);
CREATE INDEX idx_vendor_category_locked ON public.vendor_business_profiles(main_category_locked);

-- Add RLS policies for main category management
CREATE POLICY "Vendors can view their main category" ON public.vendor_business_profiles
FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Only CS and Admin can unlock main category" ON public.vendor_business_profiles
FOR UPDATE USING (
  (vendor_id = auth.uid() AND can_change_main_category = true) OR 
  check_admin_access() OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer_service'))
);

-- Create function to lock main category after first selection
CREATE OR REPLACE FUNCTION public.lock_vendor_main_category()
RETURNS TRIGGER AS $$
BEGIN
  -- If main_service_category_id is being set for the first time and it's not null
  IF OLD.main_service_category_id IS NULL AND NEW.main_service_category_id IS NOT NULL THEN
    NEW.main_category_locked = true;
    NEW.main_category_locked_at = now();
    NEW.main_category_locked_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-lock main category
CREATE TRIGGER trigger_lock_vendor_main_category
  BEFORE UPDATE ON public.vendor_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_vendor_main_category();

-- Function to allow CS/Admin to change main category
CREATE OR REPLACE FUNCTION public.unlock_vendor_main_category(
  p_vendor_id uuid,
  p_reason text DEFAULT 'Category change approved by support'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow CS or Admin to unlock
  IF NOT (check_admin_access() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer_service')) THEN
    RAISE EXCEPTION 'Only customer service or admin can unlock main category';
  END IF;
  
  UPDATE public.vendor_business_profiles
  SET 
    main_category_locked = false,
    can_change_main_category = true,
    category_change_reason = p_reason,
    updated_at = now()
  WHERE vendor_id = p_vendor_id;
  
  RETURN true;
END;
$$;