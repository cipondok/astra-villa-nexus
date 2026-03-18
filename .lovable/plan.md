

## Homepage Layout Overhaul Plan

### Current State
The homepage has **13+ sections** in the discovery flow, making it very long and cluttered:

1. **Hero** (cinematic, search panel)
2. Live Activity Ticker
3. Featured Properties Carousel + CTA divider
4. Contextual strips (WelcomeBack, RecentlyViewed, Hotspot, Urgency)
5. AI Opportunity Zone (huge block: PredictiveSearch, BehaviorBanner, AIInvestmentFeed, OpportunityStreak, DealHunter, TrendingROI, OpportunityRadar, AIJourneyGuide, SmartRecommendations, DiscoveryTrigger)
6. Smart Collections + CTA divider
7. Investor Path Selector
8. AI Tools (AstraVillaFeatures) + Price Estimator CTA + Trending Searches + CTA divider
9. Marketplace Services + Referral + Partner Logos
10. Trust Footer Strip
11. ASTRA Project Showcase
12. Early Investment CTA (final conversion)

### Proposed Simplified Layout (7 sections)

```text
┌─────────────────────────────────────────┐
│  HERO (keep as-is, cinematic + search)  │
├─────────────────────────────────────────┤
│  ASTRA PROJECT SHOWCASE (moved up)      │
│  — flagship projects deserve top spot   │
├─────────────────────────────────────────┤
│  FEATURED PROPERTIES CAROUSEL           │
│  — core content, immediate value        │
├─────────────────────────────────────────┤
│  AI OPPORTUNITY ZONE (simplified)       │
│  — keep: SmartRecommendations,          │
│    TrendingROIDeals, DealHunterHero     │
│  — remove: PredictiveSearchCanvas,      │
│    BehaviorPatternBanner, OpportunityRadar, │
│    AIJourneyGuide, DiscoveryTrigger,    │
│    OpportunityStreakCards, AIInvestmentFeed │
├─────────────────────────────────────────┤
│  SMART COLLECTIONS                      │
│  — curated property groups              │
├─────────────────────────────────────────┤
│  INVESTOR PATH + AI TOOLS (combined)    │
│  — InvestorPathSelector + AstraVillaFeatures │
│    in a single section                  │
├─────────────────────────────────────────┤
│  FINAL CTA + TRUST FOOTER              │
│  — EarlyInvestmentCTA + TrustFooterStrip│
└─────────────────────────────────────────┘
```

### What Gets Removed
- **LiveActivityTicker** -- minor visual noise
- **Contextual strips** (WelcomeBack, RecentlyViewed, Hotspot, Urgency) -- move to a sidebar or remove; they fragment the flow
- **SectionDividerCTA** blocks (3 of them) -- excessive inline CTAs
- **AI sub-components** from Opportunity Zone: PredictiveSearchCanvas, BehaviorPatternBanner, AIInvestmentFeed, OpportunityStreakCards, OpportunityRadar, AIJourneyGuide, DiscoveryTrigger -- too many overlapping AI widgets
- **Marketplace Services** section -- better suited for its own page
- **PartnerLogosMarquee** -- low priority
- **ReferralInviteStrip** -- low priority for homepage
- **AIPriceEstimatorCTA** -- move to tools page
- **TrendingSearchesWidget** -- move to search page

### What Gets Added
- A new **"Why ASTRA" trust section** between Smart Collections and the final CTA -- a compact 3-column grid showing key value props (AI Scoring, Verified Listings, Market Intelligence) similar to the LandingBenefits pattern but condensed to 3 items.

### Section Order Change
- **ASTRA Project Showcase** moves from near-bottom to position 2 (right after hero) for maximum visibility
- **Investor Path + AI Tools** merged into one combined section

### Technical Changes

**File: `src/pages/Index.tsx`**
- Remove lazy imports for: LiveActivityTicker, WelcomeBackStrip, RecentlyViewedStrip, HotspotAlertBanner, UrgencyTimerStrip, PredictiveSearchCanvas, BehaviorPatternBanner, AIInvestmentFeed, OpportunityStreakCards, OpportunityRadar, AIJourneyGuide, DiscoveryTrigger, MarketplaceServices, PartnerLogosMarquee, ReferralInviteStrip, AIPriceEstimatorCTA, TrendingSearchesWidget, SectionDividerCTA
- Restructure the discovery flow JSX (lines 820-983) to the new 7-section layout
- Add a compact "Why ASTRA" trust block (inline, no new file needed -- 3 cards with icon/title/description)
- Move AstraProjectShowcase to position 2

**No new files needed** -- all changes are in Index.tsx, reusing existing components in a streamlined order.

