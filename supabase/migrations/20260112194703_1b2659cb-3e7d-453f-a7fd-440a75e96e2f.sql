-- Add default location/map settings to location_admin_settings
INSERT INTO location_admin_settings (setting_key, setting_value, description, is_active)
VALUES 
  ('default_map_center', '{"latitude": -6.2088, "longitude": 106.8456, "zoom": 12, "city": "Jakarta", "province": "DKI Jakarta"}', 'Default center position for all maps in the application', true),
  ('default_province', '{"code": "31", "name": "DKI Jakarta"}', 'Default province for location selectors', true),
  ('default_city', '{"code": "3171", "name": "Jakarta Pusat", "province_code": "31"}', 'Default city for location selectors', true),
  ('location_hierarchy_levels', '{"enabled_levels": ["province", "city", "district", "subdistrict"], "required_levels": ["province", "city"]}', 'Which location hierarchy levels to show and require', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();