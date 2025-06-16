
-- Add Developer-Centric Property Filters
INSERT INTO public.search_filters (filter_name, filter_type, category, filter_options, display_order, is_active) VALUES
('Developer Name', 'select', 'developer', '["Emaar Properties", "Damac Properties", "Sobha Realty", "Dubai Properties", "Nakheel", "Meraas", "Ellington Properties", "Select Group", "Danube Properties", "Azizi Developments"]', 17, true),
('Project Phase', 'checkbox', 'developer', '["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Final Phase", "Extension Phase"]', 18, true),
('Developer Rating', 'select', 'developer', '["5 Stars", "4+ Stars", "3+ Stars", "2+ Stars", "All Ratings"]', 19, true),
('Project Status', 'select', 'developer', '["Under Construction", "Ready to Move", "Off-Plan", "Handover Soon", "Completed"]', 20, true),
('Payment Plan', 'checkbox', 'developer', '["Post-Handover Payment", "During Construction", "Cash Purchase", "Bank Financing Available", "Developer Financing"]', 21, true),
('Construction Quality', 'select', 'developer', '["Premium Grade", "High Quality", "Standard Quality", "Basic Quality"]', 22, true),
('Warranty Period', 'select', 'developer', '["10+ Years", "5-10 Years", "2-5 Years", "1-2 Years", "No Warranty"]', 23, true),
('Developer Track Record', 'select', 'developer', '["Established (20+ Years)", "Experienced (10-20 Years)", "Growing (5-10 Years)", "New Developer (<5 Years)"]', 24, true);

-- Add completion date range filter (handled differently as it's a date range)
INSERT INTO public.search_filters (filter_name, filter_type, category, filter_options, display_order, is_active) VALUES
('Completion Date Range', 'range', 'developer', '["2024", "2025", "2026", "2027", "2028", "2029", "2030+"]', 25, true);
