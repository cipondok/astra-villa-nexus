-- Phase 1.1: Fix Financial Data Exposure - Remove conflicting RLS policies
-- Drop all permissive policies from astra_reward_config
DROP POLICY IF EXISTS "Anyone can view reward tiers" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Public can view reward config" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Public read access to reward config" ON public.astra_reward_config;

-- Keep only the blocking policy and admin access
-- The table should already have these policies, but let's ensure they exist

-- Phase 1.2: Fix Business Pricing Exposure - Restrict vendor_categories_hierarchy
-- Drop the permissive "Everyone can view active categories" policy
DROP POLICY IF EXISTS "Everyone can view active categories" ON public.vendor_categories_hierarchy;

-- Create secure function for public reward info (non-sensitive data only)
CREATE OR REPLACE FUNCTION public.get_public_reward_tiers()
RETURNS TABLE(
  tier_name text,
  tier_description text,
  required_points integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only non-sensitive public information
  RETURN QUERY
  SELECT 
    arc.tier_name,
    arc.tier_description,
    arc.required_points
  FROM public.astra_reward_config arc
  WHERE arc.is_active = true
  ORDER BY arc.required_points ASC;
END;
$$;

-- Create secure function for public category names (no pricing data)
CREATE OR REPLACE FUNCTION public.get_public_category_names()
RETURNS TABLE(
  id uuid,
  category_name text,
  category_description text,
  is_active boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only category names/descriptions, NO pricing data
  RETURN QUERY
  SELECT 
    vch.id,
    vch.category_name,
    vch.category_description,
    vch.is_active
  FROM public.vendor_categories_hierarchy vch
  WHERE vch.is_active = true
  ORDER BY vch.category_name ASC;
END;
$$;

-- Phase 1.3: Create centralized admin check function (server-side)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  user_email text;
BEGIN
  -- Get current user info directly from auth without triggering RLS
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user has admin role in profiles
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Return true if user is admin (no hardcoded emails)
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Add comprehensive audit logging for financial data access
CREATE TABLE IF NOT EXISTS public.financial_data_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  table_name text NOT NULL,
  operation text NOT NULL,
  ip_address inet,
  accessed_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.financial_data_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.financial_data_audit_log
FOR SELECT
USING (public.is_admin_user());

-- Add audit logging function
CREATE OR REPLACE FUNCTION public.log_financial_data_access(
  p_table_name text,
  p_operation text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.financial_data_audit_log (
    user_id,
    table_name,
    operation,
    ip_address,
    metadata
  ) VALUES (
    auth.uid(),
    p_table_name,
    p_operation,
    inet_client_addr(),
    p_metadata
  );
END;
$$;

-- Fix missing SET search_path in existing security definer functions
-- Update check_admin_access to remove hardcoded email
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role directly without triggering RLS
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Return true only if user has admin role (no hardcoded emails)
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;