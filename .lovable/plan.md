

# ASTRA Main Page — Autonomous Growth Layout Upgrade

## Summary

Transform the Index.tsx homepage from a static discovery page into a living PropTech intelligence dashboard with 10 new/upgraded sections, real-time data pulses, and multi-persona CTAs — all while preserving existing search, property grid, and navigation logic.

## Current State

The homepage (Index.tsx, 1078 lines) already has a solid foundation:
- Hero with parallax, AI badge, personalized headlines, search panel
- 8-section discovery flow: QuickActions → FeaturedCarousel → MarketHeat + ProjectShowcase → StatsCounter → AI Feed (DealHunter + TrendingROI + SmartRecommendations) → MapPreview → SmartCollections → InvestorPath + Features → Testimonials → WhyASTRA → Newsletter → EarlyInvestmentCTA → TrustFooter
- Lazy loading, ScrollReveal, StaggeredReveal, SectionWrapper patterns already in place

The `/landing` route is a separate marketing page — this upgrade targets `/` (Index.tsx).

## Architecture Approach

**Preserve everything existing.** Add new sections as lazy-loaded components inserted between existing sections. Upgrade the Hero with live counters and smart CTA switcher. Create a data hook for real-time marketplace metrics.

## Implementation Plan

### Phase 1: Data Layer — `useHomepageLiveMetrics` Hook
Create `src/hooks/useHomepageLiveMetrics.ts`:
- Query Supabase for live stats: total property volume, active investor count, avg rental yield, transaction velocity
- Use `refetchInterval: 30000` for 30-second auto-refresh (the "alive" feel)
- Fallback to cached/static values if query fails

### Phase 2: Hero Section Upgrade
Modify the hero in Index.tsx:
- Add **live counter strip** below the search panel showing 4 animated metrics (total liquidity volume, active investors, avg yield %, transaction velocity)
- Add **Smart CTA Switcher** — 4-button row: "Invest Now" | "Buy Property" | "Rent Instantly" | "List as Vendor" replacing or augmenting the existing SocialProofStrip area
- Counters use `useHomepageLiveMetrics` with number animation on mount

### Phase 3: New Section Components (6 new lazy-loaded components)

1. **`InvestorIntelligencePanel`** — Glassmorphism card with ROI heatmap summary by city, AI forecast badges, institutional trust icons, "Start Portfolio" CTA. Inserted after QuickActionsRow.

2. **`BuySaleConversionEngine`** — Grid of high-velocity sale listings with urgency score badge, price movement indicator (▲/▼), instant booking button. Replaces/augments FeaturedPropertiesCarousel section.

3. **`RentalCashflowZone`** — Horizontal carousel of rental-optimized properties showing monthly passive income estimate, occupancy AI score, furnished/smart-home tags, 1-click viewing reserve. New section after MarketHeat.

4. **`MarketplaceLiquidityStream`** — Live feed UI showing recently sold, new listings, investor syndication openings. Uses real Supabase data with auto-scroll animation. New section after AI Feed.

5. **`VendorEcosystemHub`** — Segmented cards for Developers, Interior Designers, Smart Home, Legal/Financing with reputation score and join CTA. Replaces/augments existing AstraVillaFeatures.

6. **`TechnologyAuthorityStrip`** — Scrolling credibility marquee: "AI Valuation Engine • Global Demand Heatmap • Autonomous Deal Matching • Smart Contract Ready". New section before final CTA.

### Phase 4: Upgrade Existing Sections

- **AnimatedStatsCounter** — Connect to `useHomepageLiveMetrics` for real data instead of static numbers
- **EarlyInvestmentCTA** → **FinalConversionZone** — Multi-path CTA matrix: [Invest] [Buy] [Rent] [List Property] [Become Vendor]
- **SocialProofStrip** — Add transaction milestone timeline and expansion cities count

### Phase 5: Visual Polish (Obsidian Signal Design)

- Glassmorphism cards: `bg-white/5 backdrop-blur-xl border border-white/10`
- AI pulse glow on live metrics: `animate-pulse` with cyan/gold accents
- Depth shadow cards: `shadow-[0_8px_32px_rgba(0,0,0,0.3)]`
- Micro-animations on data change using framer-motion `AnimatePresence`
- Gold accent dividers between sections

### Phase 6: Index.tsx Integration

Insert new sections into the discovery flow in this order:
1. Hero (upgraded with live counters + CTA switcher)
2. QuickActionsRow (existing)
3. **InvestorIntelligencePanel** (NEW)
4. BuySaleConversionEngine (upgraded FeaturedCarousel)
5. MarketHeat + ProjectShowcase (existing)
6. **RentalCashflowZone** (NEW)
7. StatsCounter (upgraded with live data)
8. AI Feed — DealHunter + TrendingROI + SmartRecommendations (existing)
9. **MarketplaceLiquidityStream** (NEW)
10. MapPreview (existing)
11. SmartCollections (existing)
12. **VendorEcosystemHub** (NEW, replaces AstraVillaFeatures)
13. InvestorPath (existing)
14. Testimonials (existing)
15. WhyASTRA (existing)
16. **TechnologyAuthorityStrip** (NEW)
17. Newsletter (existing)
18. **FinalConversionZone** (upgraded EarlyInvestmentCTA)
19. TrustFooter (existing)

## Files to Create
- `src/hooks/useHomepageLiveMetrics.ts`
- `src/components/home/InvestorIntelligencePanel.tsx`
- `src/components/home/BuySaleConversionEngine.tsx`
- `src/components/home/RentalCashflowZone.tsx`
- `src/components/home/MarketplaceLiquidityStream.tsx`
- `src/components/home/VendorEcosystemHub.tsx`
- `src/components/home/TechnologyAuthorityStrip.tsx`
- `src/components/home/FinalConversionZone.tsx`
- `src/components/home/HeroLiveCounters.tsx`
- `src/components/home/HeroSmartCTAs.tsx`

## Files to Modify
- `src/pages/Index.tsx` — Import new components, insert into discovery flow, upgrade hero section

## Performance Rules
- All new components lazy-loaded with `React.lazy()`
- `useHomepageLiveMetrics` uses 30s `refetchInterval` for live feel
- No new external dependencies
- All components wrapped in existing `SectionWrapper` + `ScrollReveal` patterns

## Technical Details
- Live metrics query: `supabase.from('properties').select('*', { count: 'exact', head: true })` + aggregation RPCs
- Liquidity stream: query recent `properties` ordered by `updated_at` with status changes
- Rental zone: filter `listing_type = 'rent'` with highest opportunity scores
- All new components follow Obsidian Signal palette: navy dark base, gold accents, cyan glow, glassmorphism

