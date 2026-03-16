# ASTRAVILLA Post-Launch UI Optimization Strategy
**Date:** 2026-03-16 | **Status:** Active Roadmap
**Baseline:** UI Conversion Score 63/100 (pre-optimization)

---

## Strategic Context

The platform has **extensive backend intelligence** (125-point recommendation engine, deal scoring, market cycle detection, spatial analytics) but **most of it is invisible to users**. The gap isn't capability — it's surfacing. Post-launch optimization should focus on **making existing intelligence visible** rather than building new features.

### Built vs. Visible Gap Analysis

| Capability | Backend Status | Frontend Visibility |
|-----------|---------------|-------------------|
| AI Match Scoring (0-100%) | ✅ Edge function live | ⚠️ Only in SmartAIFeed (logged-in) |
| Deal Score / Fairness | ✅ 0-100 scoring with thresholds | ⚠️ Only in SocialProofWidget (1 component) |
| Investment Attractiveness | ✅ 4-factor weighted model | ❌ Not on listing cards |
| Recently Viewed Tracking | ✅ `ai_behavior_tracking` table | ❌ No "Recently Viewed" UI component |
| Demand Heat Score | ✅ City-level scoring | ⚠️ Only in admin dashboards |
| Social Proof Metrics | ✅ SocialProofWidget exists | ⚠️ Simulated data, not on all cards |
| Saved/Favorites | ✅ Favorites table exists | ⚠️ Heart icon present but no saved collection page prominent |
| Smart Collections | ✅ 5 AI-curated collections | ⚠️ SmartCollectionsV2 exists but adoption unclear |
| "X people viewing" | ❌ Only in blueprint docs | ❌ Not implemented |
| Trust bar (platform stats) | ❌ Only in HomepageBlueprint | ❌ Not implemented |

---

## Cycle 1: Exploration Momentum (Weeks 1–2)

### 1.1 Surface AI Intelligence on Listing Cards
**Impact:** High | **Effort:** Low (data exists, need UI badges)

Currently, PropertyCard shows price + location + specs. The AI deal score, investment attractiveness, and demand heat are computed but hidden.

**Proposed changes:**
- Add `DealScoreBadge` to PropertyCard when `deal_score > 0` — use existing `.signal-glow` animation for scores ≥ 75
- Show "X% below market" badge when `deal_score_percent > 10` (data from SmartCollectionsV2 criteria)
- Use gold color for AI badges per brand identity rule ("Gold = Intelligence")

**Trigger:** If avg. listing card CTR < 3%, escalate badge visibility.

### 1.2 Dynamic "Continue Exploring" Panel
**Impact:** High | **Effort:** Medium (needs new component, data exists in `ai_behavior_tracking`)

No "Recently Viewed" UI exists despite tracking being live. Users who return have no continuity.

**Proposed component:** Horizontal scroll strip below hero:
- "Continue where you left off" — last 6 viewed properties
- Only shown for returning visitors (check `ai_behavior_tracking` count > 0)
- Uses `stagger-fade-in` animation for progressive reveal

**Trigger:** If bounce rate > 60% for returning visitors, add this component.

### 1.3 Smart Collection Discovery Tiles
**Impact:** Medium | **Effort:** Low (SmartCollectionsV2 exists)

Ensure the 5 AI-curated collections (Best Investment, Luxury Villas, Undervalued Deals, Trending, Family Homes) are prominently positioned on homepage with visual differentiation.

**Proposed placement:** After search section, before general listing grid. Each collection gets a distinctive icon + gradient accent card.

**Trigger:** If collection click-through < 2%, redesign tile visual treatment.

---

## Cycle 2: Repeat Visit Engagement (Weeks 3–4)

### 2.1 Search Memory & Saved Filters
**Impact:** Medium | **Effort:** Medium

No search history or saved filter functionality is visible. Users must re-enter search criteria each visit.

**Proposed patterns:**
- Show last 3 searches as chips below search bar: "Bali Villas < 3B" | "Kost Jakarta" | "Land Maninjau"
- Persist in localStorage; upgrade to server-side for logged-in users
- "Clear search history" link for privacy

**Trigger:** If search-to-result conversion < 40%, implement search suggestions.

### 2.2 Personalized Homepage State
**Impact:** High | **Effort:** Medium

Currently, logged-in users see SmartAIFeed but the rest of the homepage is identical to guest view. Personalization should extend beyond one section.

**Proposed changes:**
- Replace "Properti Dijual" generic grid with "Recommended for You" (AI-ranked)
- Show "Your Saved Properties" strip if favorites count > 0
- Show "Price Drops on Your Saves" if any saved property's price changed

**Trigger:** If logged-in user session depth < 3 pages, increase personalization density.

### 2.3 Smart Notification Nudges
**Impact:** Medium | **Effort:** Low (Smart Notification System exists)

The notification system generates Indonesian-language variants (Urgency, Curiosity, Investment) but delivery timing isn't behavior-linked in the UI.

**Proposed pattern:** After 3rd property view in a session, show a subtle slide-in: "Properties like this are selling 2x faster than average in [City]" — using existing demand data.

**Trigger:** If notification engagement < 5%, reduce frequency and test copy variants.

---

## Cycle 3: Conversion Micro-Flows (Weeks 5–6)

### 3.1 Contextual Inquiry Prompts
**Impact:** High | **Effort:** Medium

Current inquiry CTA is always-visible (sticky bar on mobile). But there's no contextual timing — the CTA doesn't respond to browsing signals.

**Proposed behavioral triggers:**
- After 30s on detail page → subtle highlight pulse on inquiry button
- After scrolling past specs section → show "Have questions about this property?" slide-up
- After 2nd visit to same listing → show "Schedule a viewing" as primary CTA (elevated from secondary)
- After viewing 5+ properties without inquiry → show "Need help choosing?" AI assistant prompt

**Trigger:** If inquiry rate < 1% of detail page views, activate all prompts simultaneously.

### 3.2 Urgency & Scarcity Signals
**Impact:** High | **Effort:** Low (data exists)

The platform computes demand heat, deal closing speed, and view counts but doesn't surface them as urgency cues.

**Proposed signals (use sparingly — max 2 per listing):**
- "Fast-moving" badge when Deal Closing Window = FAST_CLOSE (Score ≥ 65)
- "X inquiries this week" when inquiry count > 3
- "Price reduced Rp X" when price drop detected
- "Only X units left" for developer projects (manual field)

**Color rule:** Urgency signals use `destructive` (red); investment signals use `gold`.

**Trigger:** If conversion rate doesn't improve within 2 weeks, A/B test signal density (1 vs 2 per card).

### 3.3 Inquiry Form Optimization
**Impact:** Medium | **Effort:** Low

Current inquiry flow should minimize friction:
- Pre-fill user name/phone if logged in
- Single-tap WhatsApp with pre-written message including property title + price
- Show "Free, no obligation" trust text below CTA (per HomepageBlueprint spec)
- Add "Your data is secure" micro-copy with lock icon

**Trigger:** If form abandonment > 50%, reduce form fields to name + phone only.

---

## Cycle 4: Marketplace Activity Perception (Weeks 7–8)

### 4.1 Homepage Trust Bar
**Impact:** High | **Effort:** Low

No trust signals exist above the fold. This is the single highest-impact missing element per the conversion scoring framework (Homepage Engagement: 58/100).

**Proposed implementation:**
```
[🏠 5,000+ Listings] [👤 500+ Verified Agents] [🤖 AI-Powered Analytics] [⭐ 4.8 Rating]
```
- Full-width strip below hero, above search
- Numbers animate on scroll-reveal (count-up animation)
- Data can be static initially, later connected to real counts

**Trigger:** Always show. If scroll-past rate > 90%, make it sticky for 3 seconds.

### 4.2 "New Listing" Badges
**Impact:** Medium | **Effort:** Low

Properties listed within 7 days should show a "Baru" (New) badge to create a sense of active marketplace.

**Logic:** `created_at > NOW() - 7 days` → show badge
**Placement:** Top-left of card image, using `accent` color
**Animation:** `.signal-shimmer` for first 24 hours, then static badge

### 4.3 Activity Counters on Location Pages
**Impact:** Medium | **Effort:** Medium

The geospatial heatmap shows property density but not activity. Add "X properties listed this month" and "X inquiries in [Province]" to province tooltips.

**Trigger:** If location page engagement < 2 min avg session, add activity counters.

---

## Cycle 5: Performance Perception (Weeks 9–10)

### 5.1 Skeleton-to-Content Crossfade
**Impact:** Medium | **Effort:** Low (`.skeleton-reveal` class exists, 0 adoptions)

Content currently pops in abruptly replacing skeletons. Apply the existing `.skeleton-reveal` utility (200ms blur-to-clear crossfade) to all data-loading states.

**Priority components:** PropertyCard grid, SmartAIFeed, investment panels.

### 5.2 Progressive Image Loading
**Impact:** Medium | **Effort:** Medium

Property images should load with a blur-up pattern:
1. Show shimmer skeleton during fetch
2. Load tiny thumbnail (Supabase transforms: `width=20`)
3. Crossfade to full resolution

**Trigger:** If LCP > 2.5s, prioritize above-fold image optimization.

### 5.3 Content Prioritization on Slow Connections
**Impact:** Medium | **Effort:** Medium

The platform already detects slow connections (1.5 Mbps banner visible in audit). Use this signal to:
- Reduce homepage sections from 22+ to 8 on slow connections
- Disable `.signal-glow` and `.signal-shimmer` animations
- Use lower-resolution image transforms (Supabase `quality=60`)

---

## Measurement Framework

| Metric | Baseline (Estimate) | Cycle 1 Target | Cycle 3 Target |
|--------|---------------------|----------------|----------------|
| Listing card CTR | ~2-3% | 5% | 8% |
| Avg. session depth | ~3 pages | 5 pages | 7 pages |
| Detail page → Inquiry rate | ~0.5-1% | 2% | 4% |
| Returning visitor bounce rate | ~60% | 45% | 35% |
| Homepage scroll depth (≥50%) | ~40% | 55% | 65% |
| UI Conversion Score | 63/100 | 72/100 | 82/100 |

---

## Implementation Dependencies

| Cycle | Requires Backend | Requires New Component | Uses Existing System |
|-------|-----------------|----------------------|---------------------|
| 1 | No | DealScoreBadge, RecentlyViewed strip | ai_behavior_tracking, SmartCollectionsV2 |
| 2 | localStorage + optional server | SearchHistory chips | Smart Notification System |
| 3 | No | BehavioralCTAManager | demand_heat_score, deal closing windows |
| 4 | Static data initially | TrustBar, NewListingBadge | created_at field, geospatial analytics |
| 5 | No | BlurUpImage | Supabase transforms, .skeleton-reveal |
