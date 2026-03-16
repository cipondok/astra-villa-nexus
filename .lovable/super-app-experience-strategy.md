# ASTRAVILLA Super-App Experience Evolution Strategy
**Date:** 2026-03-16 | **Horizon:** 18-Month Ecosystem Expansion
**Core tension:** Every feature added makes the platform more powerful AND more confusing. This strategy resolves that tension.

---

## 1. Modular Experience Architecture

### Hub-and-Spoke Navigation Model

Replace the current flat nav (20+ top-level items) with a **3-hub model** where each hub serves a distinct user intent:

```
┌─────────────────────────────────────────────────────┐
│                    ASTRAVILLA                        │
├──────────┬──────────────────┬────────────────────────┤
│  EXPLORE │     INVEST       │     MANAGE             │
│  (Hub 1) │     (Hub 2)      │     (Hub 3)            │
├──────────┼──────────────────┼────────────────────────┤
│ Search   │ Market Intel     │ My Properties          │
│ Browse   │ Deal Finder      │ Portfolio Tracker       │
│ Map View │ Price Prediction  │ Agent Dashboard        │
│ Trending │ Investment Advisor│ Seller Tools           │
│ New Dev  │ Rental Yield Opt  │ Transaction History    │
│          │ Portfolio Builder │ Documents              │
│          │ Location Intel    │ Notifications          │
└──────────┴──────────────────┴────────────────────────┘
```

**Implementation approach:**
- Desktop: Sidebar with 3 collapsible groups (using existing `Sidebar` component with `collapsible="icon"`)
- Mobile: Bottom tab bar with 3 icons + "More" overflow
- Each hub has its own visual accent: Explore (primary blue), Invest (gold), Manage (neutral)

### Contextual Feature Layering

Features surface based on where you are, not where they live in the nav:

| Context | Surfaced Features |
|---------|-------------------|
| Viewing a property | Investment widget, FMV comparison, mortgage calculator, similar properties |
| Browsing a location | Area price trends, hotspot score, demand indicators, nearby listings |
| On portfolio page | Rebalancing suggestions, exit timing alerts, performance benchmarks |
| After saving 3+ properties | Comparison workspace prompt, shortlist CTA |
| After 5+ sessions | Investor DNA panel, personalized recommendations |

**Rule:** No feature requires the user to know it exists. Context triggers its visibility.

### Progressive Disclosure Tiers

```
Tier 1 (Everyone sees):     Price, photos, location, basic specs
Tier 2 (Scroll/tap):        AI score, FMV gap, rental yield estimate
Tier 3 (Authenticated):     Full investment analysis, portfolio fit score
Tier 4 (Subscription):      Predictive forecasts, deal alerts, PDF reports
```

Each tier has a visual gate:
- Tier 2: Revealed by scroll or "Show AI Insights" toggle
- Tier 3: Soft login prompt with value preview ("Login to see full ROI analysis")
- Tier 4: Gold-bordered premium badge with sample data preview

---

## 2. Cross-Journey Continuity

### Persistent Intelligence Surfaces

Three persistent UI elements that follow users across all sections:

#### 2.1 Opportunity Watchlist (Bottom Bar / Side Rail)

```
┌─ 👁 Watchlist (3) ──────────────────────────┐
│ Villa Canggu    Rp 4.2M  AI: 84  ▲ demand  │
│ Apt BSD         Rp 1.8M  AI: 72  ● stable  │
│ Land Ubud       Rp 2.1M  AI: 91  ▲ price   │
│                        [Bandingkan →]        │
└──────────────────────────────────────────────┘
```

- Desktop: Collapsible rail on right side (persistent across routes)
- Mobile: Floating pill "👁 3" → expands to bottom sheet
- Updates in real-time: price changes, demand shifts, new AI signals
- One-tap compare launches side-by-side workspace

#### 2.2 AI Alert Strip (Top of Page)

```
━━ 🤖 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Harga turun Rp 200M di properti yang Anda simpan  [Lihat →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Contextual to current page (market alerts on browse, portfolio alerts on dashboard)
- Maximum 1 alert visible at a time (priority queue managed server-side)
- Gold intelligence line above strip signals AI origin
- Dismissable with "Don't show this type" option

#### 2.3 Mini Portfolio Summary (Header Widget)

For authenticated investors with saved properties:

```
[📊 Portfolio: Rp 42.8B  ↑ 2.1% bulan ini  |  3 alerts]
```

- Collapsed: Single line in header area
- Expanded: Dropdown with portfolio snapshot + link to full dashboard
- Only appears for users with 2+ saved/owned properties

### Journey State Persistence

The platform remembers where you are in a decision process:

| Signal | Persisted State | Re-entry UI |
|--------|----------------|-------------|
| Mid-search | Last search filters + results position | "Lanjutkan pencarian terakhir?" banner |
| Property detail viewed | Scroll position, expanded sections | "Terakhir dilihat" strip on homepage |
| Comparison started | Selected properties + compared metrics | Watchlist auto-populates compare view |
| Report generated | PDF link + generation parameters | "Laporan terakhir" in Manage hub |

---

## 3. Personalization Experience

### Adaptive UI Based on Investor DNA

The existing Investor DNA engine (Conservative/Balanced/Aggressive/Luxury/Flipper) drives interface adaptation:

#### Card-Level Adaptation

| Persona | Primary Metric Shown | Secondary Signal | Card Accent |
|---------|---------------------|-----------------|-------------|
| Conservative | Rental yield % | Tenant demand stability | Green stability indicator |
| Growth Hunter | 5-year appreciation forecast | Area growth trend | Blue trajectory arrow |
| Yield Optimizer | Monthly rental estimate | Occupancy rate | Gold yield badge |
| Luxury | Price per sqm vs premium avg | Exclusivity score | Platinum border |
| Flipper | FMV gap % | Days on market | Red urgency pulse |

#### Page-Level Adaptation

Homepage sections reorder based on persona:
- **Conservative:** "Stabil & Terpercaya" collection first, volatility warnings prominent
- **Growth Hunter:** "Trending Naik" collection first, appreciation forecasts prominent
- **Flipper:** "Undervalued Deals" collection first, time-to-sell estimates prominent

#### Navigation Adaptation

Sidebar items reorder by usage frequency per user (most-used tools float to top). Unused tools after 30 days move to "More Tools" submenu.

### Behavioral Intent Detection

Real-time signals that trigger UI changes mid-session:

| Behavior Pattern | Detected Intent | UI Response |
|-----------------|----------------|-------------|
| 3+ views in same area | Location-focused buyer | Surface area analytics card |
| Comparing prices frequently | Price-sensitive | Show FMV gap prominently |
| Viewing rental yield on every listing | Investor mindset | Activate investment mode overlay |
| Rapid browsing (< 10s per listing) | Early exploration | Simplify cards, show overview only |
| Deep engagement (60s+ on listing) | Serious consideration | Surface comparison tools, agent CTA |

---

## 4. Simplicity vs Capability Balance

### Visual Grouping Strategy: "Calm Surface, Deep Ocean"

#### Surface Layer (Default View)
- Maximum 3 sections visible above fold on any page
- Cards show maximum 3 data points at rest
- Actions limited to 2 primary buttons per card
- Navigation shows maximum 5 items per group (rest in overflow)

#### Depth Layer (On Demand)
- "Lihat analisis lengkap" expands full investment panel
- "Filter lanjutan" reveals advanced search facets
- "Mode investor" toggle activates data-dense view across all pages
- Keyboard shortcut `I` toggles investor mode (power user feature)

#### Density Modes

```
┌─ Mode Toggle ──────────────────────────┐
│  [Sederhana]  [Standar]  [Investor]    │
└────────────────────────────────────────┘
```

| Mode | Cards | Data Density | Target User |
|------|-------|-------------|-------------|
| Sederhana | Large images, minimal text | 3 data points | First-time visitors, casual browsers |
| Standar | Balanced image + data | 6 data points + AI badge | Regular users |
| Investor | Compact, data-rich | 12+ data points, sparklines, scores | Professional investors |

Mode preference persisted in user settings. Default: Standar for authenticated, Sederhana for anonymous.

### Information Hierarchy Rules

1. **One primary action per screen.** Every page has exactly one thing it wants you to do.
2. **Numbers need context.** "Rp 4.2M" alone is data. "Rp 4.2M — 18% below market" is intelligence.
3. **Groups of 3.** No more than 3 items in any visual cluster before a separator.
4. **Escape hatches.** Every deep view has a one-tap path back to overview.

---

## 5. Ecosystem Complexity Risks

### Risk 1: Navigation Overload

**Symptom:** Users can't find features they've used before.
**Current exposure:** 20+ navigation items, growing with each feature addition.

**Mitigation:**
- Hub-and-spoke model (Section 1) caps visible nav to 5 items per hub
- Command palette (Cmd+K / Ctrl+K) for power users to jump to any feature
- Recent pages strip in sidebar footer: last 3 visited sections
- Search-in-nav: typing in sidebar filters nav items

### Risk 2: Feature Fragmentation

**Symptom:** Similar features exist in different places with different UI patterns.
**Current exposure:** Investment data appears in PropertyInvestmentWidget, PropertyInvestmentInsights, InvestorDNAPanel, and PortfolioBuilderPanel — each with different visual treatment.

**Mitigation:**
- **Unified Intelligence Card** component: One base component with variants for all AI insight surfaces
- Shared design tokens: All AI outputs use `--gold-primary` accent, Intelligence Line header, methodology link footer
- Component audit every quarter: identify and merge duplicated patterns
- Storybook (or equivalent) documenting approved component variants

### Risk 3: Inconsistent Design Language

**Symptom:** New features look like they belong to a different product.
**Current exposure:** Market Intelligence page uses different header patterns than property detail page.

**Mitigation:**
- Page template system: 3 approved page layouts (Browse, Detail, Dashboard)
- Section header component: Standardized icon + title + subtitle + action pattern
- Card system: 3 card variants (Content Card, Metric Card, Intelligence Card) used everywhere
- Color discipline: New feature categories get ONE new accent token, approved at design review

### Risk 4: Mobile Experience Degradation

**Symptom:** Desktop-first features become unusable on mobile.
**Current exposure:** Comparison workspace, radar charts, and multi-column dashboards have no mobile-specific design.

**Mitigation:**
- Mobile-first rule: Every new feature spec must include mobile wireframe
- Complex visualizations get mobile alternatives (radar chart → horizontal bar list)
- Bottom sheet pattern for all contextual tools on mobile
- Thumb-zone audit: Primary actions must be reachable with one thumb

### Risk 5: Onboarding Overwhelm

**Symptom:** New users see the full super-app complexity on first visit.
**Current exposure:** No progressive onboarding; all features visible immediately.

**Mitigation:**
- **Session-gated disclosure:** Features unlock visually over first 5 sessions
  - Session 1-2: Explore hub only, Sederhana mode
  - Session 3-4: Invest hub appears, AI badges activate
  - Session 5+: Full platform, Standar mode default
- Contextual tooltips on first encounter with each feature (not a tour — in-context hints)
- "What's this?" icon on every AI badge linking to 2-sentence explanation

---

## Implementation Phasing

### Phase 1: Foundation (Month 1-3)
- Implement hub-and-spoke sidebar navigation
- Build Unified Intelligence Card component
- Add density mode toggle (Sederhana/Standar/Investor)
- Deploy command palette (Cmd+K)

### Phase 2: Continuity (Month 4-6)
- Build persistent Watchlist rail/pill
- Implement AI Alert Strip
- Add journey state persistence (last search, last viewed)
- Deploy session-gated feature disclosure

### Phase 3: Personalization (Month 7-9)
- Activate persona-adaptive card rendering
- Implement behavioral intent detection
- Deploy navigation reordering by usage
- Add homepage section reordering by persona

### Phase 4: Ecosystem Integration (Month 10-18)
- Integrate financing tools into Invest hub
- Deploy portfolio intelligence dashboard
- Build cross-feature linking (property → portfolio impact)
- Implement cross-market comparison views

---

## Success Metrics

| Metric | Current (Est.) | Phase 1 Target | Phase 4 Target |
|--------|---------------|----------------|----------------|
| Features discoverable without nav | ~20% | 50% | 80% |
| Avg pages per session | 3-4 | 5-6 | 8-10 |
| Return visit rate (7-day) | ~15% | 25% | 40% |
| Feature adoption (% users using 3+ tools) | ~10% | 25% | 50% |
| Mobile task completion parity | ~60% | 80% | 95% |
