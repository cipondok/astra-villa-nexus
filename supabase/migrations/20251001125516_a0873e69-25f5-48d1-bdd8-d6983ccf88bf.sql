-- Fix astra_reward_config public exposure by removing ALL permissive public policies
-- Issue: Multiple permissive policies still allow public/authenticated access

-- Drop all remaining public access policies
DROP POLICY IF EXISTS "Anyone can view active reward configs" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Anyone can view reward config" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Authenticated users can view reward config" ON public.astra_reward_config;

-- Verify only admin-only and blocking policies remain
-- These should be the only policies left:
-- 1. "block_all_direct_access_to_reward_config" (blocks all direct access)
-- 2. Admin-only policies using check_admin_access()
-- 3. super_admin_only_reward_config_access using can_access_financial_reward_config_strict()

-- Public access should ONLY be through the secure function:
-- get_public_reward_tiers() which returns non-sensitive data only