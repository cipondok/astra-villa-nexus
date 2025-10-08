-- Insert popular rental property facilities/amenities filters
INSERT INTO public.property_filter_configurations 
  (filter_name, filter_category, filter_type, filter_options, listing_type, is_active, display_order)
VALUES
  ('Non-smoking rooms', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 1),
  ('Airport shuttle', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 2),
  ('Facilities for disabled guests', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 3),
  ('Free WiFi', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 4),
  ('Family rooms', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 5),
  ('24-hour front desk', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 6),
  ('Terrace', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 7),
  ('Laundry', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 8),
  ('Lift', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 9),
  ('Garden', 'facilities', 'checkbox', '["available", "not_available"]'::jsonb, 'rent', true, 10)
ON CONFLICT DO NOTHING;