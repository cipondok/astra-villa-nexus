# ASTRA Villa Property — Project Master Blueprint

> Single source of truth. Documents the project **as it currently exists**.
> No design changes, no code changes, no schema changes are implied by this document.
> Purpose: synchronize Lovable (implementation) with ChatGPT (strategy/review).
>
> Generated: 2026-07-11

---

## 1. Executive Summary

**Project name:** ASTRA Villa Property (astravilla.com)
**Type:** Multi-sided proptech super-app for Indonesia, with cross-border investor rails.
**Primary language / locale:** Indonesian (`id` / `id-ID`), IDR base currency (`Rp`).
**Vision:** Become the operating system for property in Indonesia — end-to-end discovery, transaction, financing, fractional investment, tokenization, and AI-driven advisory.
**Mission:** Compress every step of the property lifecycle (search → deal → escrow → ownership → yield → exit) into a single AI-augmented platform for buyers, sellers, tenants, agents, developers, vendors, investors, funds, and institutional partners.
**Current status:** Live in preview and production (`astravilla.lovable.app`, `astravilla.com`). Large surface area shipped: 277 pages, 200 edge functions, 865 database migrations, ~186 top-level component directories. Actively iterating on UX polish (segmented search, iPhone-style pill), branding sync, and support center productization.
**Tech stack (frozen):**
- Frontend: React 18, Vite 5, TypeScript 5, TailwindCSS v3, shadcn/radix UI, Framer Motion, TanStack Query, Zustand.
- 3D / immersive: React Three Fiber, @react-three/drei.
- Maps: mapbox-gl + @mapbox/mapbox-gl-draw.
- Media / AI-side FE: @huggingface/transformers, @vladmandic/face-api, browser-image-compression, jspdf, html2pdf.
- Backend: Supabase (Postgres + Auth + Storage + Realtime + Edge Functions on Deno).
- AI: Lovable AI Gateway (Google Gemini + OpenAI models via hosted gateway).
- Payments: Midtrans (IDR domestic) + PayPal (cross-border) — webhook-verified.
- Web3: WalletConnect / wagmi-style hooks, BSC network, ASTRA token contract integration.
- Mobile shell: Capacitor (`capacitor.config.json`).
- Deployment: Lovable Cloud + Vercel-compatible; custom domain `astravilla.com`.

**Development progress (rough):**
- Core marketplace: shipped.
- Investor / fund / fractional layer: shipped, expanding.
- AI intelligence layer (200 edge functions): shipped, continually tuned.
- Escrow / KYC / AML / payments: shipped with 9-state escrow FSM.
- Support / CRM / concierge: shipped and being upgraded to enterprise SaaS support center.
- Branding sync (favicon/OG/PWA/JSON-LD): recently wired to Settings → Branding.

---

## 2. Project Structure

### Top-level

```
astra-villa/
├── src/
│   ├── pages/                  # 277 route components
│   ├── components/             # 186 feature directories (ui, dashboard, admin, property, investor, agent, vendor, chat, branding, support, layout, …)
│   ├── contexts/               # 11 React contexts
│   ├── stores/                 # Zustand stores (property, investor, currency, location, aiAssistant, designSystem, overlay)
│   ├── services/               # API/AI/business services (aiService, propertyService, investorService, emailService, kycProviderAdapter, systemHealthEngine, …)
│   ├── lib/                    # utilities (blockchain, cacheHeaders, pricingPsychology, seoDefaults, sitemapGenerator, safeStorage, deviceFingerprint, …)
│   ├── hooks/                  # reusable hooks
│   ├── i18n/                   # translations.ts, useLocalization, useTranslation
│   ├── integrations/
│   │   ├── supabase/           # generated client + types
│   │   └── realty-supabase/    # secondary/legacy client
│   ├── styles/                 # admin-compact, mobile-first-responsive, mobile-optimizations
│   ├── utils/                  # currency, sanitize, phone/uuid validation, whatsapp, share, image compression, PDF generators
│   ├── assets/                 # static SVG (verified-shield, …)
│   ├── data/                   # demo datasets (off-plan projects, sample properties)
│   ├── _archived/              # deprecated pages/hooks kept for reference
│   ├── App.tsx / App.css / main.tsx / vite-env.d.ts
├── supabase/
│   ├── functions/              # 200 Deno edge functions
│   ├── migrations/             # 865 SQL migration files
│   └── config.toml             # per-function JWT verification
├── public/                     # manifest.json, sw.js, sitemap.xml, robots.txt, icons
├── docs/                       # cron-schedule-setup, bundle guide, PWA testing
├── e2e/                        # Playwright specs
├── dashboard/                  # internal ops dashboard (static)
├── scripts/                    # bundle/lighthouse/dashboard scripts
├── .github/workflows/          # ci, cd, e2e-tests, accessibility, bundle-size, coverage, visual-baseline, scheduled-tests
├── .lovable/                   # audits and blueprints (this file lives here)
├── capacitor.config.json       # mobile shell
├── vite.config.ts / vitest.config.ts / playwright.config.ts
```

### Main modules
- **Marketplace** — property listing, search, filters, detail pages, comparison, favorites.
- **Investor OS** — DNA scoring, portfolio, watchlists, fractional units, REIT/fund, secondary exchange.
- **Agent CRM** — leads, pipeline, deal room, leaderboard, productivity intelligence.
- **Vendor Marketplace** — services, quotations, bookings, revenue flywheel.
- **Concierge** — packages, tasks, requests, vendors, team.
- **Admin Console** — dashboard, KYC panel, listing review, analytics, content management, alert rules.
- **AI Center** — 40+ AI feature pages (valuation, staging, doc verifier, tenant matching, wealth advisor, etc.).
- **Autonomous Engines** — acquisition, closing, deal alerts, global property exchange, wealth singularity, monopoly moat, IPO simulation, etc.
- **Support Center** — enterprise-style Contact page, ticketing, live chat, AI self-healing support.
- **Branding & Theme** — DynamicBrandingSync + design-system store.

### Component hierarchy (representative)
- `layout/AppSidebar` → grouped nav (Workspace, Property, Ecosystem, Account)
- `ProtectedRoute` → gates authenticated routes, mounts `EmailVerificationBanner`
- `branding/DynamicBrandingSync` → runtime sync of favicon, OG, PWA icons, JSON-LD logo from `system_settings`
- `dashboard/chat/*` → chat sessions, messages, participants (see `types/chatTypes.ts`)
- `orders/*` → `useOrders`, `useCreateOrder`, `useOrderStats`, `useOrderById`
- `support/*` → ticket types + hooks feeding `support_tickets`
- `property/*`, `investor/*`, `agent/*`, `vendor/*`, `admin/*` — mirroring page groups.

---

## 3. Features

### Completed / shipped
- Property discovery: search, filters, map, AI map search, area guides, neighborhood guides, off-plan projects, auctions & flash deals.
- Property detail: 3D viewer (ASTRA Immersive), 360° panoramas, drone video, AI staging, virtual tours.
- Listings: add/edit property, listing automation, expiry schedule, syndication networks, quality signals, watermarks.
- Deals: deal pipeline, deal room, deal CRM, escrow (9-state FSM), commissions (2.5% platform, 70% agent), disputes.
- Investor: DNA, feed, follows, watchlists, portfolios, positions, allocations, fractional units, REIT/fund infrastructure, secondary liquidity exchange, cross-border gateway.
- AI suite: valuation, price prediction, ROI/yield forecast, tenant matching, staging, contract analyzer, negotiation agents, wealth advisor, mortgage advisor, lead scoring, image enhance/generation, visual search, autonomous acquisition/closing, autopilot workers.
- Cross-border: FX (Frankfurter), currency store, gateway routing profiles, custody & settlement.
- Payments: Midtrans + PayPal integration, wallet (IDR), wallet top-up, payout requests/settings, invoices, refund flow.
- KYC/AML: kyc-engine, provider adapter, BPJS verification, AML screenings, fraud-guard.
- Communications: live chat, in-app notifications, push subscriptions, email templates + transactional pipeline, WhatsApp utilities.
- Community: events, leaderboard, moderators, contributions.
- SEO: SEO landing pages, keyword tracking, competitor keywords, publish queue, sitemap generator + regenerator, structured data.
- Admin: dashboard, KYC panel, listing review, analytics, content management, alert rules, admin edge auth (x-cron-secret + user_roles).
- Branding sync: favicon, Apple touch, PWA, OG/Twitter image, JSON-LD logo (via `DynamicBrandingSync`).
- Support: enterprise Contact page routing into `support_tickets` (auth) or `notification-engine` (guest), storage bucket `support-attachments`, live chat event bridge.

### In-progress
- iPhone-style segmented search pill (`AstraReosHome.tsx`) — DOM-measured drag/snap animation.
- Support center productization (`Contact.tsx` recently rebuilt).
- Ongoing AI weight tuning (`ai_weight_config`, `ai_weight_history`).
- Continuous learning loops (`ai_learning_cycles`, `ai_learning_events`, `ai_learning_snapshots`).
- Load-testing and performance monitoring (`load_test_results`, `system_health_metrics`).

### Planned (visible in schema / audits)
- Web3 rent payments and on-chain deeds (contracts wired but full flow pending).
- Interplanetary / civilization-scale strategic engines (aspirational modules already scaffolded).
- Mortgage marketplace maturity (banks, rates, pre-approval refinements).
- Additional payment providers per `mem://infrastructure/idr-financial-payout-providers`.

### Disabled / archived
- `src/_archived/` — `FeatureImpactMatrixPage`, `InvestorKPIFrameworkPage`, `MarketplaceLaunchPlaybookPage`, and archived hooks.
- Feature flags gated via `innovation_feature_flags` and `astra_feature_controls` (kill switches).

---

## 4. UI / UX

### Pages (277 in `src/pages`) — grouped
- **Public / marketing:** `AstraReosHome`, `About`, `Blog`, `Careers`, `Contact`, `AreaGuides`, `Community`, `CommunityHub`.
- **Discovery:** `Buy`, `AdvancedSearchPage`, `AIMapSearchPage`, `AISearchAssistantPage`, `AuctionFlashDealsPage`, `AstraDevelopment`, `AstraImmersiveViewer`.
- **AI (40+):** `AIAutopilotPage`, `AIContentGenerator`, `AIDocumentGeneratorPage`, `AIDocumentVerifierPage`, `AIImageEnhancePage`, `AIInteriorDesignPage`, `AIInvestmentAdvisorChat`, `AILeadScoringPage`, `AIListingGenerator`, `AIMortgageAdvisorPage`, `AIOptimizationDashboard`, `AIPriceEstimator`, `AIPropertyValuationPage`, `AIRecommendationsPage`, `AIRentalYieldPage`, `AISmartPricingPage`, `AISocialCopyPage`, `AITenantMatchingPage`, `AIWealthAdvisor`, etc.
- **Investor:** `AutonomousDealAlerts`, `AutonomousGlobalPropertyExchange`, `CapitalAllocationOptimizer`, `CrossBorderInvestorGateway`, `DealSyndicationHub`.
- **Agent:** `AgentCRMDashboard`, `AgentDashboard(Page)`, `AgentDirectory`, `AgentLeaderboardPage`, `AgentProductivityIntelligencePage`, `AgentRegistration`.
- **Deals:** `DealCRMPage`, `DealFinderPage`, `DealHunterBotPage`, `DealPipelinePage`, `DealRiskDetectionPage`, `DealRoom`, `DealSyndicationHub`.
- **Admin:** `AdminAnalytics`, `AdminDashboard(Page)`, `AdminKYCPanel`, `AdminListingReview`, `ContentManagement`, `CustomerServiceDashboard`.
- **Autonomous:** `AutonomousAcquisitionEngine`, `AutonomousAgentPage`, `AutonomousClosingSystem`, `ContinuousLearningDashboard`.
- **Booking / rental:** `BookingPage`, `BookingsPage`, `BookingSuccessPage`.
- **Auth:** `Auth`.

### Navigation
- **AppSidebar** groups: Workspace (Dashboard, Analytics) · Property (My Properties, Saved) · Ecosystem (Investment, Legal, Vendors, AI Center) · Account (Profile, Settings, Admin). Collapsible icon-rail via shadcn `Sidebar`.
- **Top-level app routing** in `App.tsx` (329 route path declarations).
- **Protected routes** via `ProtectedRoute` → redirects to `/?auth=true`.

### Layout
- Desktop: sidebar + main content, glassmorphism cards, Bloomberg-style enterprise density in admin surfaces.
- Mobile: 56px bottom tab, 44px min touch targets, min font `text-[10px]`.

### Design system
- **Palette (Obsidian Signal):** Black `#0B0B0B`, Gold `#C8A96A`.
- **Typography:** Inter / SF Pro body, Americana / Geist Mono display, Indonesian first.
- **Tokens:** Tailwind `astra-1` … `astra-6`, default radius 12px (feature memories reference 20px for listings), 120px grid spacing, 0.4s motion.
- **Component library:** shadcn (radix primitives) + custom feature components.
- **Standards:** WCAG 2.1 AA, no local hex, no ad-hoc overrides (enforced by governance memory).

### Theme
- Dark-first, light supported via `next-themes` and `ThemeSettingsContext`. Data visualization uses CSS token-driven Recharts.

### Key user flows
- **Buyer:** browse → filter → detail (3D/360°) → save/compare → contact/offer → deal room → escrow → close.
- **Tenant:** rental listing → viewing schedule → booking → contract → payments.
- **Seller / Owner:** add property → verify → syndication → offers → close.
- **Investor:** DNA quiz → recommendations → fractional purchase / fund allocation → portfolio tracking → secondary exit.
- **Agent:** registration → CRM leads → deals → commissions → leaderboard.
- **Vendor:** onboarding → services → quotations → bookings → payouts.
- **Admin:** KYC review → listing approval → alert triage → analytics.
- **Support:** Contact page → ticket in `support_tickets` → chat/email thread → resolution.

---

## 5. Database

- **Postgres via Supabase.** ~800+ public tables (partial index shown in `<supabase-tables>`), 865 migrations.
- **Naming convention:** functional prefixes (`aab_`, `acecm_`, `ai_`, `investor_`, `property_`, `mobile_`, `mortgage_`, `escrow_`, `fund_`, `fscc_`, etc.) mapped to the "unified intelligence architecture" memory.
- **Ownership keys:** standardized `user_id`, `owner_id`, `agent_id`, `created_by`.
- **Relationships:** foreign keys to `auth.users` are avoided — mirror via `profiles.id`. `user_roles` separated from `profiles`.
- **Indexes:** per-table indexes created in migrations (search, listing filters, escrow queues, deal pipelines, ML feature datasets).
- **RLS:** enabled on virtually every `public` table. `has_role(_user_id, _role app_role)` SECURITY DEFINER function used to avoid recursion. Views use `security_invoker = true`.
- **Grants:** every table has explicit `GRANT` to `authenticated` and `service_role`, `anon` only for public-read tables.

### Key domain groupings
- **Identity & security:** `profiles`, `user_roles`, `admin_roles`, `admin_users`, `account_lockouts`, `login_attempts`, `login_activity_log`, `mfa_settings`, `otp_codes`, `blocked_ips`, `country_blocks`, `disposable_email_domains`, `signup_*`.
- **Property core:** `properties` (80 cols), `property_images`, `property_categories`, `property_facilities`, `property_features`, `property_reviews`, `property_ratings`, `property_price_history`, `property_valuations`, `property_verification_badges`, `property_watermark_settings`.
- **Marketplace ops:** `favorites`, `inquiries`, `leads`, `property_leads`, `property_offers`, `property_visits`, `property_viewings`, `property_service_bookings`.
- **Deals / escrow:** `deal_transactions`, `deal_pipeline_events`, `deal_state_log`, `escrow_transactions`, `escrow_ledger_entries`, `escrow_payout_queue`, `deposit_escrows`, `pooled_escrow_records`, `dispute_cases`.
- **Investor / fund:** `investor_profiles`, `investor_dna`, `investor_portfolios`, `investor_positions`, `investor_watchlist_*`, `fund_*` (nav, distributions, redemptions, rebalancing), `fractional_offers`, `spv_investor_units`.
- **Astra token:** `astra_token_balances/transactions/transfers`, `astra_referrals`, `astra_reward_*`, `astra_daily_checkins`, `astra_exchange_rates`, `astra_feature_controls`.
- **AI / ML:** `ai_*` (jobs, tasks, prediction_log, model_registry, weight_config, learning cycles, feature datasets, surface rules, training specialists), `ml_valuation_*`.
- **Intelligence prefixes:** `aab_`, `acecm_`, `aces_`, `afiba_`, `ahcss_`, `amce_`, `amda_`, `amens_`, `apin_`, `asci_`, `astra_*`, `aswc_`, `auwcp_`, `ccne_`, `cdte_`, `ceos_`, `cwse_`, `dmem_`, `fcss_`, `fspcm_`, `fycs_`, `gali_`, `gcce_`, `gccf_`, `geiti_`, `gfne_`, `gipd_`, `giws_`, `gmma_`, `gpes_`, `gpi_*`, `gpids_`, `gpla_`, `gpws_`, `gues_`, `gvem_`, `gwsm_`, `hawce_`, `hycb_`, `icd_`, `icta_`, `iees_`, `ihwi_`, `ivms_`, `lhps_`, `mcbm_`, `mfcb_`, `mpeem_`, `mrde_`, `newf_`, `pate_`, `pesa_`, `pgcm_`, `phes_`, `pmlg_`, `pmne_`, `ppop_`, `psnem_`, `psre_`, `pufg_`, `swfps_` — strategic simulation & intelligence surfaces.
- **Support / CRM:** `support_tickets`, `customer_support_tickets`, `customer_service_tickets`, `customer_complaints`, `live_chat_*`, `chat_messages`, `chatbot_*`, `cs_*`.
- **Payments:** `payment_transactions`, `payment_gateway_profiles`, `payment_webhook_logs`, `payment_refunds`, `payment_disputes`, `payment_automation_settings`, `payout_*`, `invoices`, `subscription_plans`, `subscription_invoices`, `billing_plans`.
- **Concierge / vendors:** `concierge_*`, `local_service_providers`, `service_*`, `vendor_*` (via edge functions), `business_partners`.
- **Media & content:** `articles`, `article_*`, `media_*`, `cms_content`, `blog` support tables, `press_coverage`, `podcast_appearances`, `pr_*`.
- **SEO:** `seo_ai_actions`, `seo_competitor_keywords`, `seo_internal_searches`, `seo_keywords`, `seo_landing_pages`, `seo_publish_queue`, `seo_trend_data`, `sitemap_cache`.
- **Geo / market:** `locations`, `indonesian_locations`, `platform_countries`, `global_regions`, `market_*`, `district_*`, `city_*`.

### Storage buckets (Supabase Storage)
- `support-attachments` (referenced in support ticket flow)
- Property media buckets (images, 3D models, panoramas, drone) — RLS per memory `mem://security/storage-and-realtime-governance`
- Branding assets bucket (backing `system_settings` logo fields)

### RLS policies
- `has_role(auth.uid(), 'admin' | 'moderator' | 'user')` gates admin surfaces.
- Owner-scoped policies on user-owned tables (`user_id = auth.uid()`).
- Public read on marketing / catalog tables (`properties`, `articles`, `neighborhood_guides`).
- `service_role` bypasses RLS for edge functions.

---

## 6. Authentication

- **Provider:** Supabase Auth (email/password + email verification banner via `EmailVerificationBanner`).
- **Session:** managed by `AuthContext`; loading state guards prevent redirect loops (per `mem://architecture/auth-session-stability-and-role-mapping`).
- **Registration:** `Auth.tsx`, `AgentRegistration.tsx`; rate-limited via `signup_rate_limits`, tracked in `signup_attempts` and `signup_conversion_events`.
- **Password policy:** 10-char complex minimum, disposable-domain block, IP lockouts (`account_lockouts`, `server_lockouts`, `login_attempts`, `server_login_attempts`).
- **MFA / OTP:** `mfa_settings`, `otp_codes`, `verify-2fa`, `generate-otp`, `verify-otp` edge functions.
- **Roles:** `app_role` enum (`admin`, `moderator`, `user`) stored in `user_roles` (separated from `profiles`). Additional business roles inferred from `profiles` (agent, investor, vendor, developer).
- **Permissions:** `role_permissions` table, admin-only edge functions require `x-cron-secret` or verified admin role.
- **Protected routing:** `ProtectedRoute` component in `src/components/ProtectedRoute.tsx`.
- **KYC gates:** `kyc_verifications`, `kyc_provider_config`, BPJS verification, AML screenings.

---

## 7. Backend

### Edge functions (200 total, Deno, `npm:` specifiers)
Grouped:
- **Core / kernel:** `core-engine`, `re-os-kernel`, `superapp-orchestrator`, `scheduler`, `intelligence-cron`, `health-monitor`.
- **AI assistants:** `ai-assistant`, `ai-engine`, `ai-content-generator`, `ai-description-generator`, `ai-property-studio`, `ai-image-enhance`, `investment-advisor`, `investment-advisor-chat`, `copilot-intelligence`, `founder-copilot`, `investor-copilot`, `sovereign-wealth-copilot`, `negotiation-agent`, `negotiation-ai-assistant`.
- **Valuation & pricing:** `calculate-property-value`, `calculate-roi-forecast`, `predict-property-price(s)`, `price-intelligence`, `pricing-intelligence-engine`, `compute-pricing-signals`, `valuation-expansion`.
- **Deals & escrow:** `deal-engine`, `deal-state-engine`, `deal-transaction-engine`, `deal-velocity-engine`, `deal-dominance-engine`, `advance-deal-stage`, `initiate-escrow`, `escrow-automation`, `escrow-readiness-scorer`, `custody-settlement-engine`.
- **Investor & fund:** `investor-capital-engine`, `investor-growth-engine`, `investor-psychology-domination`, `institutional-fund-engine`, `institutional-fund-manager`, `fund-intelligence`, `fund-management-engine`, `fractional-investment-engine`, `mega-fund-blueprint`, `portfolio-optimizer`, `portfolio-roi-tracker`, `portfolio-wealth-engine`.
- **Market intelligence:** `market-intelligence-engine`, `market-intelligence-feed`, `market-creation-engine`, `market-capture-blitzkrieg`, `market-reality-distortion`, `market-timing-crisis`, `aggregate-market-heat`, `forecast-market-trends`, `forecast-liquidity`, `forecast-capital-flow`, `compute-liquidity-metrics`, `compute-capital-allocation`, `compute-planetary-signals`.
- **Growth & expansion:** `city-expansion-intelligence`, `city-launch-planner`, `global-expansion-engine`, `launch-radar`, `smart-city-engine`, `urban-economic-simulator`, `urbanization-forecast-grid`, `urban-wealth-creation`, `detect-growth-opportunities`, `supply-growth-engine`.
- **Autonomous / strategic:** `capital-*` (civilization-strategy, consciousness-engine, deployment-timing, empire-control, flywheel-singularity, governance-framework, gravity-engine, market-perception, market-positioning), `category-creator-narrative`, `category-killer-engine`, `civilization-economic-os`, `civilizational-wealth-stability`, `competitive-extinction-engine`, `decade-monopoly-expansion`, `monopoly-defense`, `monopoly-moat-engine`, `network-effect-engine`, `network-effect-weaponization`, `interplanetary-expansion-simulator`, `multiplanet-expansion`, `post-human-economic-systems`, `post-scarcity-economy`, `planetary-*`, `proptech-*`, `sovereign-*`, `wealth-*`.
- **KYC / risk / fraud:** `kyc-engine`, `fraud-guard`, `risk-score-engine`, `stress-test-engine`, `hedging-engine`.
- **Payments / wallet:** `payment-engine`, `payment-webhook`, `wallet-funding-engine`, `wallet-topup`, `custody-settlement-engine`, `asset-tokenization-exchange`.
- **Support / CRM:** `notification-engine`, `support-intelligence`, `process-email-queue`, `send-transactional-email`, `preview-transactional-email`, `handle-email-suppression`, `handle-email-unsubscribe`.
- **Media / content:** `image-generation-worker`, `image-intelligence`, `property-video-gen`, `visual-search`, `seo-content-pipeline`, `seo-scheduler`, `regenerate-sitemap`, `sitemap`, `update-sitemap-schedule`.
- **Workers / jobs:** `job-worker`, `autopilot-worker`, `learning-engine`, `continuous-learning`, `process-ai-events`, `track-behavior`, `intelligence-brain`, `global-intelligence`.
- **Vendor:** `vendor-engine`, `vendor-growth-orchestrator`, `vendor-job-router`, `vendor-marketplace-engine`, `vendor-revenue-flywheel`, `vendor-revenue-optimizer`, `vendor-supply-optimizer`.
- **Special ops:** `seed-sample-properties`, `schedule-viewing`, `auction-flash-deals`, `referral-engine`.

### JWT verification
- Public (`verify_jwt = false`): `ai-assistant`, `visual-search`, `image-intelligence`, `investment-advisor-chat`, `deal-engine`, `rental-negotiator`, `listing-reviver`, `algorithm-analytics`, etc.
- Authenticated: `neighborhood-simulator`, `generate-otp`, `verify-otp`, `verify-2fa`, and the majority of write/admin endpoints.

### Cron jobs (see `docs/cron-schedule-setup.sql`)
- `astra_opportunity_scoring` — every 10 min → `compute-opportunity-scores`
- `astra_deal_scanner` — every 5 min → `scan-deal-opportunities`
- `astra_market_heat` — every 30 min → `aggregate-market-heat`
- `astra_price_prediction` — hourly → `predict-property-prices`
- `astra_portfolio_analyzer` — every 2h → `analyze-investor-portfolios`
- `check_revenue_alerts` — hourly → `check_revenue_alerts()` SQL function
- Additional interval workers per `mem://infrastructure/scheduled-intelligence-cron-architecture`.

### APIs & integrations
- Supabase JS SDK (`@/integrations/supabase/client`) is the sole client entry.
- Partner API keys (`partner_api_keys`, SHA-256 hashed) + `b2b_api_keys`, `b2b_api_usage` for external consumers.
- Data licensing (`data_licensing_agreements`) + `data_exchange_api_logs`.

---

## 8. AI

### AI features (surfaced as pages)
Valuation, price estimator, smart pricing, rental yield, ROI forecast, investment advisor chat, wealth advisor, mortgage advisor, tenant matching, lead scoring, listing generator, content generator, social copy, document generator, document verifier, contract analyzer, image enhance, interior design, staging, map search, search assistant, recommendations, negotiation, autopilot, optimization dashboard, continuous learning dashboard.

### Prompt flows
- Central client: `src/services/aiService.ts` calls `ai-assistant` (`mode: investment_assistant`) and `core-engine` (`mode: property_valuation | digital_twin`).
- Conversation history capped to last 10 messages.
- Modes are switched server-side via the `mode` field on the request body.

### AI services (Lovable AI Gateway)
- Google Gemini + OpenAI models; no user-provided keys.
- Embeddings, chat, image gen, TTS/STT available via gateway; project uses chat + image gen predominantly.
- Local ML: `@huggingface/transformers` (browser), `@vladmandic/face-api` for face features.

### Automation
- `ai_jobs`, `ai_job_tasks`, `ai_job_logs`, `ai_batch_locks`, `ai_scheduled_jobs` orchestrate background work.
- `ai_learning_cycles/events/snapshots`, `ai_model_training_logs`, `ai_model_performance_history`, `ai_prediction_accuracy` for self-improvement loop.
- `ai_weight_config` + `ai_weight_history` — tunable scoring weights (per `mem://ai/scoring-weights-and-autonomous-safety`).
- `autopilot_worker_runs`, `autonomous_agent_scans`, `intelligence_worker_runs` — worker telemetry.
- Max 3 concurrent AI triggers per orchestration policy.

---

## 9. Business Logic

### Property workflow
Add → verify (docs, ownership) → categorize → syndicate → surface via search/ranking → inquiry/offer → viewing → deal room → escrow → close → post-close analytics.

### Vendor workflow
Onboard (`concierge_vendors`, `local_service_providers`) → publish services → receive quotation requests (`service_quotation_requests`) → book (`property_service_bookings`) → deliver → review → payout.

### Investor workflow
Signup → KYC → DNA scoring (`investor_dna`) → recommendations (`investor_recommendations`, `ai_investment_recommendations`) → fractional purchase or fund allocation → portfolio tracking → liquidity/exit via secondary exchange (`liquidity_*`).

### CRM workflow
Agent leads (`agent_crm_leads`, `partner_leads`, `b2b_leads`) → stage rules (`deal_stage_rules`) → pipeline events → follow-up cadence (24h/3d/7d per `mem://strategy/lead-engagement-follow-up-cadence`) → conversion metrics.

### Marketplace workflow
Search → filter → surface deals (`deal_visibility_ranking`, `flash_deals`) → group deals (`group_deals`, `group_deal_participants`) → featured ads → conversion scores.

### Commissions
Platform fee 2.5%, agent split 70%, Elite tier bonuses (per `mem://architecture/centralized-deal-orchestration`). Secondary market fee 2%.

---

## 10. Payments

### Integrations
- **Midtrans** — IDR domestic, SHA512 webhook signature verification (`payment-webhook`).
- **PayPal** — cross-border, header-based verification.
- **Wallet** — IDR wallet with `wallet-funding-engine`, `wallet-topup`, Frankfurter FX conversion.
- **Astra token economy** — daily rewards, referrals, transfers (`astra_token_*`).
- **Web3** — WalletConnect + BSC; ASTRA token contract; rental payments contract (integration scaffolded).

### Subscription model
- `subscription_plans`, `subscription_invoices`, `billing_plans` — tiered subscriptions for agents, developers, B2B.
- `b2b_credit_packages`, `b2b_credit_transactions` — B2B credits.
- `partner_packages` — partner tiers.

### Billing / payouts
- `invoices`, `payment_transactions`, `payment_refunds`, `payment_disputes`, `payment_automation_settings`.
- `payout_requests`, `payout_settings`, `payout_transactions`, `partner_payouts`, `affiliate_payouts`.
- Withdrawal-only providers per `mem://infrastructure/idr-financial-payout-providers`.

---

## 11. SEO

- **Static metadata:** `index.html` head with app-specific title/description, OG, Twitter, viewport, canonical.
- **Dynamic sync:** `DynamicBrandingSync` updates favicon, apple-touch, OG/Twitter image, and JSON-LD `logo` at runtime from `system_settings` (Settings → Branding).
- **Per-page SEO:** `SEOHead` component + `src/lib/seoDefaults.ts`.
- **Sitemap:** `public/sitemap.xml`, `src/lib/sitemapGenerator.ts`, edge functions `sitemap`, `regenerate-sitemap`, `update-sitemap-schedule`; cached in `sitemap_cache`.
- **Robots:** `public/robots.txt`.
- **Structured data:** JSON-LD Organization with dynamic logo; property/article schemas per page.
- **Content pipeline:** `seo-content-pipeline`, `seo-scheduler`, `seo_publish_queue`, `seo_landing_pages`.
- **Analytics:** `seo_internal_searches`, `keyword_rank_history`, `seo_competitor_keywords`, `seo_trend_data`, `share_analytics`.
- **Canonical domain:** `astravilla.com` per `mem://infrastructure/production-domain-and-seo-config`.

---

## 12. Security

- **Auth:** Supabase Auth + email verification + MFA/OTP.
- **Authorization:** `user_roles` + `has_role()` SECURITY DEFINER; admin edge functions require `x-cron-secret` header or verified admin role.
- **RLS:** enabled on virtually all `public` tables; views use `security_invoker = true`.
- **Rate limiting:** `rate_limit_*` tables + `signup_rate_limits`.
- **IP / geo controls:** `blocked_ips`, `country_blocks`, `ip_blocks`.
- **Disposable email block:** `disposable_email_domains`.
- **Fraud:** `fraud-guard`, `fraud_patterns`, `fraud_signals`, `risk_*` tables and edge functions, AI risk engine 0-100 blocking escrow.
- **KYC/AML:** `kyc-engine`, `aml_screenings`, BPJS.
- **API keys:** encrypted at rest per `mem://security/api-key-encryption-standard`; partner keys SHA-256 hashed.
- **Payment webhooks:** signature verification (Midtrans SHA512, PayPal headers).
- **Storage:** bucket-specific RLS per governance memory.
- **Audit:** `activity_logs`, `login_activity_log`, `financial_data_audit_log`, `profit_audit_log`, `cloudflare_audit_log`, `document_audit_trail`.
- **Sensitive credentials:** flagged debt in `mem://security/credential-storage-debt` (Vault migration pending).

---

## 13. Infrastructure

### Environment variables
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (auto-populated).
- Edge function secrets accessed via `Deno.env.get(...)`: `SUPABASE_SERVICE_ROLE_KEY`, gateway keys, provider secrets.
- Mandatory production secrets per `mem://infrastructure/launch-readiness-and-config`: Midtrans keys, Mapbox token.
- Web3 (Vercel deployment): WalletConnect project id, ASTRA/rental contract addresses, BSC RPC (see `src/lib/deployment-checklist.md`).

### Deployment
- Lovable Cloud (preview + published).
- Preview: `id-preview--587b095c-681f-4e0c-8a42-457ae72c28e9.lovable.app`
- Published: `astravilla.lovable.app`
- Custom domains: `astravilla.com`, `www.astravilla.com`
- CI/CD: GitHub Actions (`ci`, `cd`, `e2e-tests`, `accessibility`, `bundle-size`, `test-coverage`, `visual-baseline-update`, `scheduled-tests`, `dashboard`).

### Storage
- Supabase Storage buckets (property media, branding assets, support attachments).

### External services
- Supabase (Postgres, Auth, Storage, Edge, Realtime)
- Lovable AI Gateway (Gemini, OpenAI)
- Midtrans, PayPal
- Mapbox
- Frankfurter FX
- WalletConnect + BSC
- Custom email domain via `mem://infrastructure/email-domain-setup`
- Semrush (available via connector for SEO)

---

## 14. Third-party Services (currently connected)

- Supabase (project `zymrajuuyyfkzdmptebl`)
- Lovable AI Gateway
- Midtrans (IDR payments/webhooks)
- PayPal (cross-border)
- Mapbox GL
- Frankfurter (FX)
- WalletConnect (Web3)
- BSC (ASTRA token contract)
- Hugging Face Transformers (in-browser inference)
- @vladmandic/face-api
- Capacitor (mobile shell)
- html2pdf.js / jspdf (document export)
- Email provider (per email-domain memory — astravilla.com sending domain)
- Cloudflare (settings + audit log tables imply configuration)
- Semrush (available via `standard_connectors`)

---

## 15. Current Problems / Known Issues / Technical Debt

- **Segmented search pill** on `AstraReosHome.tsx` — multiple UX iterations, still tuning iPhone-style drag physics.
- **Credential storage debt** — legacy plaintext credentials awaiting Vault migration (`mem://security/credential-storage-debt`).
- **Massive migration count (865)** — cumulative complexity; no consolidation baseline.
- **~800 tables** — schema sprawl across strategic prefixes; naming grouped but discovery hard without the memory index.
- **277 pages / 200 edge functions** — heavy code surface; risk of dead/duplicate routes (`_archived/` present; likely more).
- **Duplicate/overlapping domains:** `support_tickets` vs `customer_support_tickets` vs `customer_service_tickets`; `predict-property-price` vs `predict-property-prices`; `ai-engine` vs `ai-assistant` vs `core-engine`.
- **Web3 rent-payment flow** partially scaffolded, not fully end-to-end verified.
- **Multiple aspirational "civilization / interplanetary" modules** — schema present, product value unclear.
- **Personal contact info** was previously exposed on the Contact page (now replaced).
- **Bundle size** — governed by size-limit + workflow; risks with 3D and ML libraries in-browser.
- **Health / performance thresholds** — freeze at 55, warning at 65 (per governance memory); relies on active monitoring.

---

## 16. Future Roadmap (already identified in-project)

- Finish iPhone-style segmented picker interaction polish.
- Complete enterprise Support Center + AI self-healing integrations.
- Mature Web3 flows: on-chain deeds, rental payments, tokenized offerings.
- Expand mortgage marketplace (banks, rates, pre-approval).
- Consolidate overlapping support ticket tables and AI engine functions.
- Continue continuous-learning cycles for AI weights.
- Vault migration for credential debt.
- Additional payout providers (per IDR providers memory).
- Deeper cross-border investor gateway (custody, settlement, FX).
- Expansion sequencing per `city_expansion_*`, `expansion_*` tables.

---

## 17. Change History (major milestones)

- **Design foundation** — Obsidian Signal palette (Black/Gold), Tailwind astra tokens standardized.
- **I18n baseline** — Indonesian default, IDR base, `id-ID` formatting.
- **Escrow FSM** — 9-state fintech-grade escrow with Midtrans + PayPal webhook integrity.
- **AI Risk Engine** — 0–100 risk score blocking escrow progression.
- **Continuous learning loop** — `ai_learning_*` tables + workers.
- **Astra token economy** — daily check-ins, referrals, transfers, feature controls.
- **Fund / REIT infrastructure** — NAV, distributions, fractional units, secondary exchange.
- **Cron intelligence workers** — opportunity scoring, deal scanner, market heat, price prediction, portfolio analyzer, revenue alerts.
- **Branding sync** — runtime propagation from `system_settings` to favicon, PWA, OG, JSON-LD.
- **Contact page redesign** — personal contact removed, routed into `support_tickets` and `notification-engine`.
- **Search UX iterations** — segmented control rebuilt with DOM-measured drag/snap physics.
- **Governance memories** — 50+ memory files under `mem://` codify design, security, infra, and product rules.

---

## 18. Recommendations (NOT current implementation — proposals for review)

> These are ChatGPT-style planner suggestions. None of these are shipped.

1. **Consolidate ticketing** — merge `support_tickets`, `customer_support_tickets`, `customer_service_tickets` into one canonical table with a `channel` discriminator.
2. **Deduplicate AI engines** — collapse `ai-engine`, `ai-assistant`, `core-engine` into a single dispatcher with clear mode contracts; deprecate `predict-property-price` in favor of `predict-property-prices`.
3. **Migration baseline** — squash 865 migrations into a baseline snapshot to speed onboarding.
4. **Archive aspirational modules** — move `interplanetary-*`, `civilization-*`, `post-human-*`, `multiplanet-*` into an `experimental/` namespace behind kill switches until they have product owners.
5. **Route inventory** — audit 277 pages, retire orphans, move remaining archived pages into a versioned deprecation folder.
6. **Vault migration** — retire plaintext credentials as flagged in the credential-storage-debt memory.
7. **Bundle discipline** — lazy-load 3D (`@react-three/fiber`), face-api, and transformers behind route-level splits; enforce size-limit budgets per route.
8. **Domain-driven folder layout** — consider splitting `src/pages` into `pages/marketplace`, `pages/investor`, `pages/agent`, `pages/admin`, `pages/ai`, `pages/autonomous`.
9. **Feature governance dashboard** — surface `innovation_feature_flags` and `astra_feature_controls` in one admin console for kill-switch discipline.
10. **Blueprint sync automation** — regenerate this document on schedule via an edge function that reads schema, edge functions list, routes, and memories.

---

*End of blueprint.*
