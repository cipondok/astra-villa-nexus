
-- Add Lifestyle Match filters (with proper JSON formatting)
INSERT INTO public.search_filters (filter_name, filter_type, category, filter_options, display_order, is_active) VALUES
('Digital Nomad Ready', 'checkbox', 'lifestyle', '["High-speed Internet", "Co-working Spaces Nearby", "Quiet Work Environment", "Flexible Lease Terms"]', 1, true),
('Family Friendly', 'checkbox', 'lifestyle', '["Playground Nearby", "Good Schools", "Safe Neighborhood", "Family Recreation Areas"]', 2, true),
('Senior Friendly', 'checkbox', 'lifestyle', '["Step-free Access", "Hospital Proximity", "Public Transport Access", "Ground Floor Available"]', 3, true),
('Pet Friendly', 'select', 'lifestyle', '["No Pets", "Cats Only", "Dogs Only", "All Pets Welcome"]', 4, true),

-- Add Sustainability Score filters  
('Energy Efficiency Rating', 'select', 'sustainability', '["A+", "A", "B", "C", "D", "E", "F"]', 5, true),
('Green Certifications', 'checkbox', 'sustainability', '["LEED Certified", "BREEAM Certified", "Green Building Council", "Energy Star Rated"]', 6, true),
('Renewable Energy Features', 'checkbox', 'sustainability', '["Solar Panels", "Wind Power", "Geothermal Heating", "Rainwater Harvesting"]', 7, true),
('Eco-Friendly Materials', 'checkbox', 'sustainability', '["Bamboo Flooring", "Recycled Materials", "Low VOC Paint", "Sustainable Wood"]', 8, true),

-- Add Investment Potential filters
('ROI Potential', 'select', 'investment', '["High (>15%)", "Medium (8-15%)", "Stable (5-8%)", "Conservative (<5%)"]', 9, true),
('Rental Yield Estimate', 'select', 'investment', '["Excellent (>8%)", "Good (6-8%)", "Average (4-6%)", "Below Average (<4%)"]', 10, true),
('Appreciation Potential', 'select', 'investment', '["High Growth Area", "Moderate Growth", "Stable Value", "Declining Area"]', 11, true),
('Investment Type', 'select', 'investment', '["Buy to Rent", "Buy to Flip", "Long-term Hold", "Commercial Investment"]', 12, true),

-- Add Soundscape/Neighborhood filters
('Noise Level', 'select', 'neighborhood', '["Very Quiet", "Quiet", "Moderate", "Lively", "Very Lively"]', 13, true),
('Neighborhood Vibe', 'select', 'neighborhood', '["Peaceful Residential", "Family Oriented", "Young Professional", "Vibrant Nightlife", "Cultural District"]', 14, true),
('Traffic Level', 'select', 'neighborhood', '["No Traffic", "Light Traffic", "Moderate Traffic", "Heavy Traffic"]', 15, true),
('Nearby Amenities', 'checkbox', 'neighborhood', '["Shopping Mall", "Restaurants", "Parks", "Gym/Fitness", "Public Transport", "Medical Facilities", "Schools", "Entertainment"]', 16, true);
