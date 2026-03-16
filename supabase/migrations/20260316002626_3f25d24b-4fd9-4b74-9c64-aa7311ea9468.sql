
-- 90-Day Growth Execution Plan tables

CREATE TABLE public.growth_execution_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 3),
  phase_name text NOT NULL,
  week_number int NOT NULL CHECK (week_number BETWEEN 1 AND 13),
  week_label text NOT NULL,
  focus_area text NOT NULL,
  target_kpi text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.growth_execution_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid REFERENCES public.growth_execution_weeks(id) ON DELETE CASCADE NOT NULL,
  task_title text NOT NULL,
  task_description text,
  category text NOT NULL CHECK (category IN ('listings','seo','marketing','agents','investors','referral','monetization','performance')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked')),
  sort_order int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.growth_execution_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_execution_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read growth weeks" ON public.growth_execution_weeks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage growth weeks" ON public.growth_execution_weeks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin read growth tasks" ON public.growth_execution_tasks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage growth tasks" ON public.growth_execution_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Seed: Phase 1 (Day 1-30) — Foundation & First Market
INSERT INTO public.growth_execution_weeks (phase_number, phase_name, week_number, week_label, focus_area, target_kpi) VALUES
(1, 'Foundation & First Market', 1, 'Week 1: Day 1-7', 'Listing Seeding & Data Foundation', '500 seed listings uploaded'),
(1, 'Foundation & First Market', 2, 'Week 2: Day 8-14', 'First-City Market Activation', '3 cities activated with 50+ listings each'),
(1, 'Foundation & First Market', 3, 'Week 3: Day 15-21', 'SEO Indexing Acceleration', '100+ pages indexed on Google'),
(1, 'Foundation & First Market', 4, 'Week 4: Day 22-30', 'Quality Assurance & Baseline', 'SEO score avg >70, all KPIs baselined');

-- Seed: Phase 2 (Day 31-60) — Growth Engine
INSERT INTO public.growth_execution_weeks (phase_number, phase_name, week_number, week_label, focus_area, target_kpi) VALUES
(2, 'Growth Engine', 5, 'Week 5: Day 31-37', 'Digital Marketing Funnel Launch', 'Google Ads live, 500 daily impressions'),
(2, 'Growth Engine', 6, 'Week 6: Day 38-44', 'Agent Partnership Blitz', '50 agents onboarded across 5 cities'),
(2, 'Growth Engine', 7, 'Week 7: Day 45-51', 'Investor Awareness Campaign', '200 investor signups, 10% engagement rate'),
(2, 'Growth Engine', 8, 'Week 8: Day 52-60', 'Funnel Optimization & Scaling', 'CPA <Rp 25K, conversion rate >3%');

-- Seed: Phase 3 (Day 61-90) — Scale & Monetize
INSERT INTO public.growth_execution_weeks (phase_number, phase_name, week_number, week_label, focus_area, target_kpi) VALUES
(3, 'Scale & Monetize', 9, 'Week 9: Day 61-67', 'Referral Growth Loop Activation', 'Referral program live, 100 invites sent'),
(3, 'Scale & Monetize', 10, 'Week 10: Day 68-74', 'Performance Optimization Sprint', 'Page load <2s, Core Web Vitals green'),
(3, 'Scale & Monetize', 11, 'Week 11: Day 75-81', 'Premium Feature Beta Launch', '20 Pro Agent trials, 10 Pro Investor trials'),
(3, 'Scale & Monetize', 12, 'Week 12: Day 82-88', 'Monetization Testing & Pricing', 'First paid subscriptions, pricing validated'),
(3, 'Scale & Monetize', 13, 'Week 13: Day 89-90', 'Review & Q2 Planning', '90-day KPI review completed');

-- Seed tasks for each week
DO $$
DECLARE
  w_id uuid;
BEGIN
  -- Week 1 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 1;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Scrape & clean 500 property listings from public sources', 'Focus on Jakarta, Surabaya, Bandung — villas, houses, apartments', 'listings', 'critical', 1),
  (w_id, 'Upload seed listings with AI-generated SEO descriptions', 'Use AI engine to generate optimized titles and descriptions', 'listings', 'critical', 2),
  (w_id, 'Run AI SEO analysis on all seeded listings', 'Trigger auto-SEO optimizer for quality scoring', 'seo', 'high', 3),
  (w_id, 'Generate province-level SEO landing pages for 10 provinces', 'Use SEO Location Blueprint for top provinces', 'seo', 'high', 4),
  (w_id, 'Submit XML sitemap to Google Search Console', 'Include property pages, location pages, and main navigation', 'seo', 'critical', 5),
  (w_id, 'Set up Google Analytics 4 and conversion tracking', 'Track property views, inquiries, agent signups', 'performance', 'high', 6);

  -- Week 2 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 2;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Activate Jakarta market — 150+ listings with location pages', 'Generate district-level SEO content for all Jakarta areas', 'listings', 'critical', 1),
  (w_id, 'Activate Surabaya market — 100+ listings', 'Focus on East Java investment corridors', 'listings', 'high', 2),
  (w_id, 'Activate Bandung market — 80+ listings', 'Target highland villa and student housing segments', 'listings', 'high', 3),
  (w_id, 'Contact 20 local agents for partnership discussions', 'Use agent registration system, offer free premium trial', 'agents', 'critical', 4),
  (w_id, 'Launch social media presence — Instagram & TikTok', 'Property showcase reels, market insight content', 'marketing', 'medium', 5),
  (w_id, 'Set up WhatsApp Business for lead capture', 'Integrate with inquiry system for instant response', 'marketing', 'high', 6);

  -- Week 3 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 3;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Generate city-level SEO pages for all 10 metro cities', 'Use Blueprint Generator for structured content', 'seo', 'critical', 1),
  (w_id, 'Build 50 kecamatan-level landing pages for Jakarta', 'District-level pages with keyword clusters', 'seo', 'high', 2),
  (w_id, 'Submit indexing requests via Google Search Console API', 'Priority index property-rich location pages', 'seo', 'high', 3),
  (w_id, 'Create 10 SEO blog articles targeting long-tail keywords', 'Topics: KPR guide, investment tips, area reviews', 'seo', 'medium', 4),
  (w_id, 'Set up internal linking between all location pages', 'Parent-child-sibling linking structure per blueprint', 'seo', 'high', 5),
  (w_id, 'Implement structured data (JSON-LD) for property pages', 'RealEstateListing schema for rich snippets', 'seo', 'critical', 6);

  -- Week 4 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 4;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Run platform-wide SEO audit — target avg score >70', 'Use Property SEO Checker for bulk analysis', 'seo', 'high', 1),
  (w_id, 'Fix all critical SEO issues (missing titles, short descriptions)', 'AI rewrite tool for batch improvement', 'seo', 'critical', 2),
  (w_id, 'Baseline all KPIs: traffic, listings, agents, leads', 'Document Day 30 metrics for comparison', 'performance', 'high', 3),
  (w_id, 'Onboard first 10 agents with guided walkthrough', 'Personal demo calls, feature tutorial videos', 'agents', 'high', 4),
  (w_id, 'Launch AI Investment Intelligence for early investors', 'Enable ROI forecasts, deal finder, market trends', 'investors', 'medium', 5),
  (w_id, 'Performance test: ensure <3s page load across all pages', 'Lighthouse audit, image optimization, lazy loading', 'performance', 'high', 6);

  -- Week 5 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 5;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Launch Google Ads — property search intent campaigns', 'Target: jual rumah [city], beli properti [area]', 'marketing', 'critical', 1),
  (w_id, 'Set up Meta Ads retargeting for property viewers', 'Pixel-based audiences, carousel ad format', 'marketing', 'high', 2),
  (w_id, 'Create landing pages for each ad campaign', 'City-specific with trust signals and CTA', 'marketing', 'high', 3),
  (w_id, 'Deploy email drip sequence for new signups', 'Welcome → Featured Properties → Investment Insights', 'marketing', 'medium', 4),
  (w_id, 'Launch agent recruitment landing page', 'Benefits: free listings, AI tools, lead distribution', 'agents', 'high', 5);

  -- Week 6 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 6;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Agent partnership blitz — target 50 agents across 5 cities', 'Jakarta, Surabaya, Bandung, Bali, Semarang', 'agents', 'critical', 1),
  (w_id, 'Host virtual agent onboarding webinar', 'Demo AI tools, listing optimization, lead management', 'agents', 'high', 2),
  (w_id, 'Launch agent leaderboard with monthly rewards', 'Gamification: badges, rankings, commission incentives', 'agents', 'medium', 3),
  (w_id, 'Activate agent-specific upgrade campaigns', 'Trigger interested_viewer and competitor_alert emails', 'agents', 'medium', 4),
  (w_id, 'Reach 1,000 active listings milestone', 'Agent-contributed + seeded listings combined', 'listings', 'high', 5);

  -- Week 7 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 7;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Launch Investor Intelligence marketing campaign', 'Highlight ROI forecasts, deal finder, market trends', 'investors', 'critical', 1),
  (w_id, 'Create investor-focused content series', '5 articles: Why Bali, Jakarta ROI, Emerging Markets, etc.', 'investors', 'high', 2),
  (w_id, 'Partner with 3 investment communities/forums', 'Facebook groups, Kaskus, Reddit r/indonesia', 'investors', 'high', 3),
  (w_id, 'Launch Investor DNA profiling for early adopters', 'Behavioral tracking → personalized recommendations', 'investors', 'medium', 4),
  (w_id, 'Host online webinar: Property Investment in Indonesia 2026', 'Lead generation event with market intelligence showcase', 'investors', 'high', 5);

  -- Week 8 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 8;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Optimize Google Ads — reduce CPA to <Rp 25,000', 'A/B test ad copy, adjust bidding, negative keywords', 'marketing', 'critical', 1),
  (w_id, 'Scale performing campaigns to new cities', 'Expand to Medan, Makassar, Yogyakarta', 'marketing', 'high', 2),
  (w_id, 'Achieve 3%+ conversion rate on property inquiries', 'CTA optimization, social proof, urgency triggers', 'marketing', 'high', 3),
  (w_id, 'Mid-point KPI review — Day 60 vs Day 30 comparison', 'Traffic growth, listing velocity, agent retention', 'performance', 'high', 4),
  (w_id, 'Generate 200+ investor signups', 'Combined organic + paid acquisition target', 'investors', 'critical', 5);

  -- Week 9 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 9;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Launch referral program with dual-sided rewards', 'Referrer: premium trial, Referee: featured listing', 'referral', 'critical', 1),
  (w_id, 'Create shareable referral links for agents', 'Track via acquisition_referrals system', 'referral', 'high', 2),
  (w_id, 'Deploy referral reminder email sequences', 'Trigger after successful inquiry or listing upload', 'referral', 'medium', 3),
  (w_id, 'Launch corporate partnership outreach', 'Target 5 companies for employee housing programs', 'referral', 'high', 4),
  (w_id, 'Activate university partnership pipeline', 'Student housing partnerships with 3 universities', 'referral', 'medium', 5);

  -- Week 10 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 10;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Core Web Vitals optimization sprint', 'LCP <2.5s, FID <100ms, CLS <0.1 across all pages', 'performance', 'critical', 1),
  (w_id, 'Image optimization — WebP conversion, lazy loading audit', 'Target 50% reduction in image payload', 'performance', 'high', 2),
  (w_id, 'Database query optimization for map and search', 'Add composite indexes, optimize viewport queries', 'performance', 'high', 3),
  (w_id, 'CDN configuration and caching strategy', 'Edge caching for static assets, API response caching', 'performance', 'medium', 4),
  (w_id, 'Mobile performance audit — test on mid-range Android', 'Samsung A series, Xiaomi Redmi — target audience devices', 'performance', 'high', 5);

  -- Week 11 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 11;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Launch Pro Agent subscription beta (Gold tier)', 'Featured listings, priority leads, analytics dashboard', 'monetization', 'critical', 1),
  (w_id, 'Launch Pro Investor subscription beta (Diamond tier)', 'AI deal finder, ROI forecasts, portfolio builder', 'monetization', 'critical', 2),
  (w_id, 'Recruit 20 agents for Pro Agent free trial', 'Personal outreach to top-performing agents', 'monetization', 'high', 3),
  (w_id, 'Recruit 10 investors for Pro Investor free trial', 'Target active users with high engagement scores', 'monetization', 'high', 4),
  (w_id, 'Set up Midtrans payment integration for subscriptions', 'Test payment flow end-to-end', 'monetization', 'critical', 5);

  -- Week 12 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 12;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'A/B test subscription pricing — 3 price points', 'Test willingness to pay across agent and investor tiers', 'monetization', 'critical', 1),
  (w_id, 'Collect beta feedback from Pro trial users', 'NPS survey, feature usage analytics, churn signals', 'monetization', 'high', 2),
  (w_id, 'Activate upgrade campaigns for free-tier users', 'Almost-there and competitor-alert trigger emails', 'monetization', 'high', 3),
  (w_id, 'Launch bank partnership pilot — mortgage lead referrals', 'Connect with 2 banks for commission-based lead flow', 'monetization', 'medium', 4),
  (w_id, 'Target first 5 paid subscriptions', 'Direct sales approach to highest-value trial users', 'monetization', 'critical', 5);

  -- Week 13 tasks
  SELECT id INTO w_id FROM public.growth_execution_weeks WHERE week_number = 13;
  INSERT INTO public.growth_execution_tasks (week_id, task_title, task_description, category, priority, sort_order) VALUES
  (w_id, 'Compile 90-day KPI report', 'Traffic, listings, agents, investors, revenue, SEO rankings', 'performance', 'critical', 1),
  (w_id, 'Calculate unit economics — CAC, LTV, payback period', 'Per channel and per user segment analysis', 'performance', 'high', 2),
  (w_id, 'Identify top 3 growth levers for Q2 scaling', 'Data-driven prioritization of highest-ROI channels', 'performance', 'high', 3),
  (w_id, 'Draft Q2 growth strategy document', 'Budget allocation, city expansion plan, feature roadmap', 'performance', 'high', 4);
END $$;
