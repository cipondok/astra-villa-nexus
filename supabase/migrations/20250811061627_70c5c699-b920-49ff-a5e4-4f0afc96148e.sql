-- Seed default ASTRA reward configurations if missing
WITH roles AS (
  SELECT unnest(ARRAY['general_user','property_owner','agent','vendor','admin','customer_service']::public.user_role[]) AS role
)
INSERT INTO public.astra_reward_config (reward_type, user_role, reward_amount, percentage_rate, conditions, is_active)
SELECT 'welcome_bonus', role, 100, 0, '{}'::jsonb, true FROM roles
ON CONFLICT (reward_type, user_role, is_active) DO NOTHING;

INSERT INTO public.astra_reward_config (reward_type, user_role, reward_amount, percentage_rate, conditions, is_active)
SELECT 'daily_checkin', role, 10, 0, jsonb_build_object('streak_bonus', jsonb_build_object('7', 1.5, '30', 2.0)), true FROM roles
ON CONFLICT (reward_type, user_role, is_active) DO NOTHING;

INSERT INTO public.astra_reward_config (reward_type, user_role, reward_amount, percentage_rate, conditions, is_active)
SELECT 'transaction_percentage', role, 0, 0.02, jsonb_build_object('min_amount', 0, 'max_reward', 1000), true FROM roles
ON CONFLICT (reward_type, user_role, is_active) DO NOTHING;

INSERT INTO public.astra_reward_config (reward_type, user_role, reward_amount, percentage_rate, conditions, is_active)
SELECT 'referral_bonus', role, 50, 0, jsonb_build_object('referred_bonus', 25), true FROM roles
ON CONFLICT (reward_type, user_role, is_active) DO NOTHING;

SELECT 'ASTRA reward config seeded' AS status;