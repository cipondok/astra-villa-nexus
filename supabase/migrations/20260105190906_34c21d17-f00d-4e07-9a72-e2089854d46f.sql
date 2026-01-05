-- Add VIP tier levels to user_levels table
INSERT INTO public.user_levels (id, name, description, privileges, max_properties, max_listings, can_feature_listings, priority_support)
VALUES 
  (gen_random_uuid(), 'Bronze VIP', 'Bronze VIP tier with basic premium features', '{"basic_access": true, "bronze_features": true}', 15, 5, true, false),
  (gen_random_uuid(), 'Silver VIP', 'Silver VIP tier with enhanced features and priority listing', '{"basic_access": true, "silver_features": true, "priority_listing": true}', 30, 15, true, true),
  (gen_random_uuid(), 'Gold VIP', 'Gold VIP tier with premium features and featured listings', '{"basic_access": true, "gold_features": true, "priority_listing": true, "featured_badge": true}', 50, 25, true, true),
  (gen_random_uuid(), 'Platinum VIP', 'Platinum VIP tier with all exclusive features and unlimited access', '{"basic_access": true, "platinum_features": true, "priority_listing": true, "featured_badge": true, "exclusive_access": true}', 200, 100, true, true)
ON CONFLICT DO NOTHING;