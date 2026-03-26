# ASTRA Villa — Core Product Architecture Blueprint
## Post Phase-1 Stabilization | v2.0

---

## 1. PRIMARY PRODUCT PILLARS

| # | Pillar | Purpose | User Value |
|---|--------|---------|------------|
| 1 | **Property Discovery** | Search, browse, filter luxury properties | Find the right property fast |
| 2 | **Immersive Experience** | 3D tours, virtual staging, digital twins | Feel the property before visiting |
| 3 | **Investor Intelligence** | Portfolio analytics, deal feeds, market data | Make data-driven investment decisions |
| 4 | **Deal Execution** | Offers, negotiation, escrow, contracts | Close deals with confidence |
| 5 | **Community & Services** | Agents, vendors, messaging, referrals | Connected marketplace ecosystem |
| 6 | **Platform Operations** | Admin dashboard, analytics, system health | Manage and scale the platform |

---

## 2. MODULE STRUCTURE PER PILLAR

### PILLAR 1: Property Discovery
| Layer | Items |
|-------|-------|
| **Core Pages** | `Search`, `PropertyDetail`, `PropertyList`, `PropertyMapSearch`, `AIMapSearchPage`, `Dijual/Disewa`, `ProvinceProperties`, `AdvancedSearchPage`, `PropertyComparison`, `NeighborhoodInsightsPage` |
| **Domain Hooks** | `useAdvancedPropertySearch`, `useMapSearch`, `useMapProperties`, `useAdvancedPropertyFilters`, `useFilterPresets`, `useNLPSearch`, `useImageSearch`, `useLocationData`, `useLocationIntelligence`, `useCentralLocation` |
| **Edge Services** | `core-engine` (property queries), `predict-property-prices`, `compute-pricing-signals`, `price-intelligence` |
| **Shared Components** | `PropertyCard`, `PropertyGrid`, `SearchFilters`, `MapView`, `PriceTag`, `PropertyBadges` |

### PILLAR 2: Immersive Experience
| Layer | Items |
|-------|-------|
| **Core Pages** | `VRTourShowcase`, `VirtualStagingPage`, `VirtualPropertyExplorer`, `DigitalTwinPage`, `AIImageEnhancePage`, `PropertyVideoTourPage`, `AIInteriorDesignPage` |
| **Domain Hooks** | `use3DOptimization`, `useDigitalTwin`, `useImageOptimization`, `useAIImageEnhance`, `useImageQualityAnalyzer` |
| **Edge Services** | `ai-image-enhance`, `image-generation-worker`, `image-intelligence`, `property-video-gen`, `visual-search` |
| **Shared Components** | `PropertyViewer3D`, `ImageGallery`, `VirtualTourPlayer`, `BeforeAfterSlider` |

### PILLAR 3: Investor Intelligence
| Layer | Items |
|-------|-------|
| **Core Pages** | `InvestorDashboard`, `PortfolioDashboard`, `PortfolioCommandCenter`, `InvestorIntelligenceTerminal`, `InvestmentPerformanceTracker`, `MarketIntelligence`, `InvestorWatchlist`, `FractionalInvestmentPage`, `InvestmentMapExplorerPage`, `WealthSimulatorPage`, `CityInvestmentPage` |
| **Domain Hooks** | `useInvestorProfile`, `useInvestorProperties`, `useInvestorWatchlist`, `useInvestorAlerts`, `useFractionalInvestment`, `useInvestmentScores`, `useInvestmentRanking`, `useMarketIntelligence`, `useMarketCycle`, `usePortfolioROITracker`, `usePricePrediction`, `useGlobalIntelligence` |
| **Edge Services** | `core-engine` (investor modes), `portfolio-optimizer`, `portfolio-roi-tracker`, `fund-management-engine`, `fractional-investment-engine`, `compute-opportunity-scores`, `forecast-market-trends`, `market-intelligence-engine` |
| **Shared Components** | `PortfolioChart`, `ROICalculator`, `MarketHeatmap`, `InvestmentCard`, `DealFeed`, `RiskGauge` |

### PILLAR 4: Deal Execution
| Layer | Items |
|-------|-------|
| **Core Pages** | `DealRoom`, `OfferNegotiationPage`, `MyOffersPage`, `NegotiationAssistantPage`, `MortgageFinancingPage`, `PreQualificationPage`, `WalletPage`, `BookingPage`, `ContractAnalyzerPage` |
| **Domain Hooks** | `useDealWorkflow`, `useDealTransactions`, `useDealHealth`, `useEscrowTransactions`, `useEscrowReadiness`, `useNegotiationAssistant`, `useMortgageCalculator`, `useAstraToken`, `useAstraWalletStats`, `useMidtransPayment` |
| **Edge Services** | `deal-engine`, `deal-state-engine`, `deal-transaction-engine`, `escrow-automation`, `initiate-escrow`, `escrow-readiness-scorer`, `negotiation-ai-assistant`, `compute-deal-probability`, `payment-engine`, `payment-webhook`, `wallet-funding-engine` |
| **Shared Components** | `DealTimeline`, `EscrowPanel`, `OfferForm`, `NegotiationChat`, `PaymentFlow`, `WalletCard` |

### PILLAR 5: Community & Services
| Layer | Items |
|-------|-------|
| **Core Pages** | `AgentDashboard`, `AgentDirectory`, `AgentRegistration`, `AgentCRMDashboard`, `MessagesPage`, `VendorDashboard`, `VendorRegistration`, `Services`, `Marketplace`, `CommunityHub`, `ReferralAffiliatePage` |
| **Domain Hooks** | `useAgentAnalytics`, `useAgentCRM`, `useAgentPerformance`, `useMessaging`, `useLeadGeneration`, `useLeadDistribution`, `useVendorDashboard`, `useReferralTracking` |
| **Edge Services** | `vendor-engine`, `vendor-marketplace-engine`, `referral-engine`, `notification-engine`, `send-transactional-email`, `schedule-viewing` |
| **Shared Components** | `AgentCard`, `MessageThread`, `VendorCard`, `LeadCard`, `ServiceCard` |

### PILLAR 6: Platform Operations
| Layer | Items |
|-------|-------|
| **Core Pages** | `AdminDashboard`, `AdminAnalytics`, `AdminListingReview`, `UserDashboardPage`, `PropertyOwnerDashboard`, `SecurityActivityPage`, `Settings` |
| **Domain Hooks** | `useAdminCheck`, `useAdminOverviewData`, `useAdminRevenue`, `useAllSystemSettings`, `useAlerts`, `useActivityLogs`, `useJobQueueHealth`, `useAISystemHealth` |
| **Edge Services** | `core-engine` (admin modes), `health-monitor`, `intelligence-cron`, `scheduler`, `job-worker`, `kpi-alert-monitor`, `auth-engine`, `auth-email-hook` |
| **Shared Components** | `AdminSidebar`, `StatsCard`, `DataTable`, `AlertSystem`, `SystemHealthIndicator` |

---

## 3. USER JOURNEY ARCHITECTURE

### 🏠 Buyer Journey
```
Landing → Search/Map Browse → Property Detail → 3D Tour → Inquiry/Booking
→ Pre-Qualification → Offer → Negotiation → Escrow → Closing
```

### 💰 Investor Journey
```
Investor Landing → Onboarding Wizard → Market Intelligence → Deal Feed
→ Property Analysis → Portfolio Builder → Fractional/Full Investment
→ Deal Room → Escrow → Portfolio Dashboard → ROI Tracking
```

### 🤝 Agent Journey
```
Registration → KYC → Agent Dashboard → Lead Management → CRM
→ Listing Management → Deal Pipeline → Commission Tracking
```

### ⚙️ Admin Journey
```
Login → Admin Dashboard → Listing Review → User Management
→ Analytics → System Health → Settings → Alert Management
```

---

## 4. PERFORMANCE-FIRST STRUCTURE

### Must Preload (Critical Path)
| Module | Reason |
|--------|--------|
| `Navigation` | Every page needs it |
| `Auth/AuthContext` | Session validation |
| `PropertyCard` | Most viewed component |
| `Search filters` | Primary user action |

### Must Lazy-Load (Heavy / Conditional)
| Module | Strategy |
|--------|----------|
| **3D/Three.js viewer** | `React.lazy()` + dynamic import, isolate in separate chunk |
| **Map components** | `React.lazy()`, load only on map pages |
| **Admin dashboard** | Entire admin module lazy-loaded |
| **Recharts/Charts** | Dynamic import per dashboard |
| **AI Chat Widget** | Already lazy, keep isolated |
| **PDF/Document generators** | Dynamic import on action |

### Heavy Engine Isolation
```
┌─────────────────────────────────────────────┐
│  Main Bundle (~200KB target)                │
│  Auth, Navigation, PropertyCard, Search     │
├─────────────────────────────────────────────┤
│  Chunk: three-viewer (~150KB)               │
│  Three.js + Drei + R3F                      │
├─────────────────────────────────────────────┤
│  Chunk: mapbox (~120KB)                     │
│  mapbox-gl + map components                 │
├─────────────────────────────────────────────┤
│  Chunk: admin (~100KB)                      │
│  AdminDashboard + all admin panels          │
├─────────────────────────────────────────────┤
│  Chunk: charts (~80KB)                      │
│  Recharts + dashboard visualizations        │
├─────────────────────────────────────────────┤
│  Chunk: investor (~90KB)                    │
│  Portfolio + Intelligence + Deal Room       │
└─────────────────────────────────────────────┘
```

---

## 5. FEATURE FREEZE STRATEGY

### 🟢 LIVE NOW (Core MVP)
- Property search, listing, detail
- Auth + user profiles
- Agent/admin dashboards
- Messaging + inquiries
- Wallet + basic escrow
- AI image enhance + listing generator

### 🟡 FEATURE-FLAG (Post-Seed)
| Module | Gate |
|--------|------|
| Fractional Investment | `ff_fractional_investment` |
| Property Tokenization | `ff_tokenization` |
| Blockchain Verification | `ff_blockchain` |
| Hedge Fund Mode | `ff_institutional` |
| Cross-Border Gateway | `ff_cross_border` |
| Autonomous Deal Alerts | `ff_auto_deals` |
| Global Deal Flow Network | `ff_global_network` |

### 🔴 FROZEN (Post-Series A)
| Module | Reason |
|--------|--------|
| Self-Learning Valuation Core | Needs massive training data |
| Autonomous Acquisition Engine | Regulatory complexity |
| Global Property Exchange | Multi-jurisdiction compliance |
| IPO Roadshow tools | Pre-revenue distraction |
| Smart City integration | Partnership-dependent |

---

## 6. TARGET ARCHITECTURE SIZE

### Current vs Target

| Metric | Current (Post Phase-1) | Target (Phase-2) | Target (Phase-3) |
|--------|----------------------|-------------------|-------------------|
| **Active Pages** | 254 | ~80 | ~50 |
| **Active Hooks** | 569 | ~120 | ~80 |
| **Edge Functions** | 188 | ~40 | ~25 |
| **Components** | 1,829 | ~400 | ~250 |
| **Routes** | 286 | ~90 | ~60 |
| **Initial Bundle** | ~800KB | ~300KB | ~200KB |
| **Total Chunks** | ~2MB | ~1.2MB | ~800KB |

### Edge Function Consolidation Target (188 → ~25)

| Domain Service | Merges | Current Functions |
|---------------|--------|-------------------|
| `property-service` | 8→1 | core-engine property modes, predict-property-prices, compute-pricing-signals, price-intelligence, seed-sample-properties |
| `ai-service` | 7→1 | ai-engine, ai-assistant, ai-content-generator, ai-description-generator, ai-image-enhance, visual-search, image-intelligence |
| `deal-service` | 8→1 | deal-engine, deal-state-engine, deal-transaction-engine, compute-deal-probability, negotiation-ai-assistant, scan-deal-opportunities, advance-deal-stage |
| `escrow-service` | 4→1 | escrow-automation, initiate-escrow, escrow-readiness-scorer, custody-settlement-engine |
| `payment-service` | 4→1 | payment-engine, payment-webhook, wallet-funding-engine, wallet-topup |
| `investor-service` | 6→1 | core-engine investor modes, generate-investor-matches, analyze-investor-portfolios, compute-intent-scores, investor-copilot, generate-recommendations |
| `portfolio-service` | 5→1 | portfolio-optimizer, portfolio-roi-tracker, portfolio-wealth-engine, fund-management-engine, fractional-investment-engine |
| `market-intelligence` | 6→1 | market-intelligence-engine, forecast-market-trends, aggregate-market-heat, compute-opportunity-scores, compute-liquidity-metrics, recompute-liquidity |
| `vendor-service` | 5→1 | vendor-engine, vendor-marketplace-engine, vendor-job-router, vendor-growth-orchestrator, vendor-supply-optimizer |
| `notification-service` | 4→1 | notification-engine, send-transactional-email, process-email-queue, handle-email-unsubscribe |
| `auth-service` | 2→1 | auth-engine, auth-email-hook |
| `scheduler-service` | 4→1 | scheduler, intelligence-cron, seo-scheduler, job-worker |
| `content-service` | 3→1 | seo-content-pipeline, sitemap, ai-content-generator |
| `health-service` | 2→1 | health-monitor, kpi-alert-monitor |
| `referral-service` | 2→1 | referral-engine, track-behavior |
| **DEPRECATE** | ~100+ | All planetary/civilization/monopoly/singularity/founder/IPO-war functions |

---

## 7. PHASE-2 EXECUTION ROADMAP

### Immediate (Week 1-2)
1. Archive remaining ~170 speculative pages
2. Consolidate duplicate dashboard wrappers (AdminDashboardPage→AdminDashboard)
3. Merge single-query hooks into domain hooks
4. Remove `@vladmandic/face-api` + `EmotionTracker`
5. Feature-flag institutional/blockchain modules

### Short-term (Week 3-4)
1. Begin edge function consolidation (property-service, deal-service first)
2. Implement route-level code splitting groups
3. Consolidate admin section registry (~1800 lines → ~400)
4. Create shared component library extraction

### Medium-term (Month 2)
1. Complete edge function consolidation to ~25 services
2. Implement feature flag system (Supabase-backed)
3. Performance audit: target <300KB initial bundle
4. Component deduplication pass

---

*Generated: 2026-03-26 | Architecture Version: 2.0 | Status: APPROVED FOR PHASE-2*
