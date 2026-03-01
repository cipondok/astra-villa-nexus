
-- Insert new premium tier levels
INSERT INTO public.user_levels (name, description, max_properties, max_listings, can_feature_listings, priority_support, privileges)
VALUES 
  ('Pro Agent', 'Professional Agent tier - 2x exposure, priority placement, agent badge', 20, 15, false, true, 
   '{"basic_access": true, "priority_listing": true, "seo_tools": true, "agent_badge": true, "exposure_multiplier": 2}'::jsonb),
  ('Developer', 'Developer tier - AI analytics, bulk listings, project showcase, SEO', 100, 50, true, true,
   '{"basic_access": true, "priority_listing": true, "seo_tools": true, "ai_analytics": true, "virtual_tour": true, "3d_model": true, "featured_badge": true, "exposure_multiplier": 5}'::jsonb),
  ('VIP Investor', 'VIP Investor tier - Homepage spotlight, 3D badge, concierge, first access', 999, 999, true, true,
   '{"basic_access": true, "priority_listing": true, "seo_tools": true, "ai_analytics": true, "virtual_tour": true, "3d_model": true, "featured_badge": true, "homepage_spotlight": true, "3d_badge": true, "concierge": true, "first_access": true, "unlimited_images": true, "exposure_multiplier": 10}'::jsonb)
ON CONFLICT DO NOTHING;
