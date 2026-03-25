
-- Set security_invoker = true on views that should respect the querying user's RLS.
-- public_properties and public_profiles are intentionally kept as security-definer
-- because they expose limited columns of public data and are referenced in the types.

ALTER VIEW public.ai_reaction_analytics SET (security_invoker = true);
ALTER VIEW public.bpjs_verifications_safe SET (security_invoker = true);
ALTER VIEW public.transaction_summary SET (security_invoker = true);
ALTER VIEW public.liquidity_hotspot_zones SET (security_invoker = true);
ALTER VIEW public.public_social_platforms SET (security_invoker = true);
ALTER VIEW public.deal_closure_training_dataset SET (security_invoker = true);
