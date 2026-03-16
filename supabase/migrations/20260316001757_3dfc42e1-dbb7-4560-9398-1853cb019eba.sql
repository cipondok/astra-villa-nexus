
INSERT INTO public.launch_roadmap_phases (phase_key, phase_name, phase_order, target_start_date, target_end_date, status, description) VALUES
('pre_launch', 'Pre-Launch Preparation', 1, '2026-04-01', '2026-05-15', 'not_started', 'Foundation building — listing seeding, SEO content rollout, performance testing, and infrastructure hardening across 10+ Indonesian cities.'),
('soft_launch', 'Soft Launch', 2, '2026-05-16', '2026-06-30', 'not_started', 'Targeted city activation with agent onboarding campaigns and early investor acquisition across all major metros simultaneously.'),
('growth_acceleration', 'Growth Acceleration', 3, '2026-07-01', '2026-08-31', 'not_started', 'Digital marketing funnels, organic SEO traffic scaling, referral programs, and partnership expansion to drive marketplace liquidity.'),
('platform_maturity', 'Platform Maturity', 4, '2026-09-01', '2026-09-30', 'not_started', 'Premium subscription monetization, data authority positioning, and institutional partnership development.')
ON CONFLICT (phase_key) DO NOTHING;

-- Seed tasks for Phase 1: Pre-Launch
INSERT INTO public.launch_roadmap_tasks (phase_id, task_title, task_description, priority, sort_order) VALUES
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Seed 500+ listings across 10 cities', 'Jakarta, Surabaya, Bandung, Semarang, Medan, Makassar, Bali, Yogyakarta, Malang, Palembang — minimum 50 listings per city with photos, pricing, and investment scores', 'critical', 1),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Generate SEO content: Province → City pages', 'Roll out province-level and city-level SEO landing pages with 300-400 word Indonesian content, meta titles, and keyword clusters', 'critical', 2),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Generate SEO content: District → Area pages', 'Expand district and area-level micro-location pages for top 5 cities first (Jakarta, Surabaya, Bandung, Bali, Medan)', 'high', 3),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Run AI batch scoring on all listings', 'Execute investment scoring, deal probability, spatial heat, and market cycle analysis across all seeded properties', 'critical', 4),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Performance load testing', 'Simulate 1000+ concurrent users — test map rendering, search filtering, and AI endpoint latency < 800ms', 'high', 5),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Mobile responsiveness audit', 'Test all pages on 5 device sizes (320px-1920px) — fix critical layout issues', 'high', 6),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Setup Google Search Console & Analytics', 'Connect domain, submit sitemaps, configure GA4 events for key conversions (inquiry, save, signup)', 'medium', 7),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'pre_launch'), 'Legal compliance: Terms of Service & Privacy Policy', 'Indonesian language ToS and privacy policy compliant with UU PDP (Personal Data Protection)', 'critical', 8);

-- Seed tasks for Phase 2: Soft Launch  
INSERT INTO public.launch_roadmap_tasks (phase_id, task_title, task_description, priority, sort_order) VALUES
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Activate Jakarta pilot with 10 partner agents', 'Recruit top-performing agents in Jakarta, provide onboarding training, and set up agent dashboards', 'critical', 1),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Activate Surabaya + Bandung simultaneously', 'Mirror Jakarta playbook — agent recruitment, listing quality audit, local SEO activation', 'critical', 2),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Launch Bali investor acquisition campaign', 'Target international and domestic investors with Bali premium property showcases and ROI calculators', 'high', 3),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Activate remaining 6 cities', 'Medan, Makassar, Yogyakarta, Semarang, Malang, Palembang — lighter touch with organic agent signups', 'high', 4),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Agent onboarding campaign: WhatsApp + Email', 'Automated 7-day drip campaign for new agents — listing tips, dashboard walkthrough, success stories', 'medium', 5),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Early investor acquisition via LinkedIn + Property forums', 'Content marketing targeting property investors on LinkedIn Indonesia and Kaskus/UrbanIndo forums', 'medium', 6),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Collect first 50 user reviews/testimonials', 'Incentivize early users to leave reviews — feature testimonials on landing pages', 'medium', 7),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'soft_launch'), 'Monitor marketplace health metrics daily', 'Track listing-to-inquiry ratio, agent response rates, and deal conversion funnel daily', 'high', 8);

-- Seed tasks for Phase 3: Growth Acceleration
INSERT INTO public.launch_roadmap_tasks (phase_id, task_title, task_description, priority, sort_order) VALUES
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'Launch Google Ads campaigns for top 5 cities', 'High-intent keywords: "jual rumah [city]", "investasi properti [city]" — target CPA < Rp 50,000', 'critical', 1),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'Scale organic SEO to 1000+ indexed pages', 'Programmatic SEO pages for all district/area combinations — monitor indexing rate and click-through', 'critical', 2),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'Launch referral program: 3x rewards', 'Agent-to-agent and user-to-user referral program with triple commission for first 3 months', 'high', 3),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'Instagram + TikTok content strategy', 'Property showcase reels, market insight carousels, agent success stories — target 100K impressions/month', 'high', 4),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'Bank partnership pilot: 2 banks', 'Secure mortgage referral partnerships with 2 national banks — integrate lead handoff workflow', 'high', 5),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'Corporate housing partnership: 3 companies', 'Target tech companies and multinationals for employee housing benefit programs', 'medium', 6),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'University partnership: 2 universities', 'Student housing pipeline with top Jakarta and Bandung universities', 'medium', 7),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'growth_acceleration'), 'A/B test conversion funnels', 'Test listing detail CTA variants, inquiry form layouts, and pricing display formats', 'high', 8);

-- Seed tasks for Phase 4: Platform Maturity
INSERT INTO public.launch_roadmap_tasks (phase_id, task_title, task_description, priority, sort_order) VALUES
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Launch Premium Agent subscription tier', 'Featured listings, priority placement, advanced analytics dashboard, and lead priority — Rp 500K/month', 'critical', 1),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Launch Pro Investor subscription tier', 'Market intelligence access, portfolio analytics, deal timing signals, and capital flow data — Rp 300K/month', 'critical', 2),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Publish Indonesia Property Market Report Q3', 'Data-driven market report establishing platform as national property data authority — press release', 'high', 3),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Secure 2 institutional data partnerships', 'Partner with research firms or media for licensed property data insights and co-branded reports', 'high', 4),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Developer partnership: 5 property developers', 'Primary market new launch partnerships with exclusive listings and early-access investor events', 'high', 5),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Enterprise API for property data', 'B2B data API for banks, insurers, and valuers — usage-based pricing model', 'medium', 6),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Regional expansion assessment: Kalimantan + Sulawesi', 'Evaluate market readiness for secondary region expansion based on organic demand signals', 'medium', 7),
((SELECT id FROM launch_roadmap_phases WHERE phase_key = 'platform_maturity'), 'Achieve 10,000 MAU milestone', 'Consolidated growth target — measure through GA4 and internal analytics', 'critical', 8);
