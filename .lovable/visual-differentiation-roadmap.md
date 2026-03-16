# ASTRAVILLA Visual Differentiation Execution Roadmap
**Date:** 2026-03-16 | **Phase:** Growth-Stage Leadership Projection
**Core insight:** At early stage, the interface IS the product. Users judge platform scale by visual energy, not listing count.

---

## 1. Marketplace Energy — Make It Feel Alive

### 1.1 Trending Opportunity Strip
Horizontal scroll strip above the main property grid, auto-populated from SmartCollectionsV2 data:

```
🔥 Trending Minggu Ini
[Card] [Card] [Card] [Card] [Card] →
```

- Source: Top 8 properties by 30-day save count (already computed)
- Badge per card: "🔥 Disimpan X kali" with save count
- Entrance animation: staggered fade-in (framer-motion, 80ms delay per card)
- Horizontal snap-scroll with `scroll-snap-type: x mandatory`

### 1.2 Dynamic Section Narratives
Replace static headers with data-aware copy:

| Current | Proposed |
|---------|----------|
| "Properti Dijual" | "X properti · Y baru minggu ini · Z harga turun 📉" |
| "Best Investment" | "X properti AI Score > 75 · rata-rata yield Y%" |
| "Explore by Location" | "38 provinsi · tren naik di X lokasi 📈" |

Implementation: Compute counts from existing query data, render inline with section title.

### 1.3 Relative Timestamps on Cards
- `< 24h`: "Baru X jam lalu" with shimmer badge
- `1-7 days`: "Baru X hari lalu" static badge
- `> 30 days`: No timestamp (avoid stale perception)
- Token: `bg-accent text-accent-foreground text-[10px] font-bold rounded-md px-2 py-0.5`

### 1.4 Homepage Trust Counter Bar
Full-width strip below hero:

```
🏠 X Properti    👤 Y Agen Terverifikasi    🤖 AI Analytics    📊 38 Provinsi
```

- Count-up animation on first viewport entry
- `bg-card border-y border-border` styling
- Numbers from `useTotalPropertyCount` or static seed values

---

## 2. Intelligence Leadership Cues

### 2.1 Three-Tier AI Signal System

| Tier | Badge | Criteria | Visual Treatment |
|------|-------|----------|-----------------|
| **AI Analyzed** | "🤖 AI" | All properties with scores | `bg-muted text-muted-foreground border-border` |
| **AI Recommended** | "⭐ AI Pick" | Match score > 80% for logged-in user | `bg-gold-primary/10 text-gold-primary border-gold-primary/20` |
| **AI Verified** | "✓ Verified" | Human + AI validated listings | `bg-emerald-500/10 text-emerald-500 border-emerald-500/20` |

Each tier uses the Intelligence Line (1px gold gradient) above its panel. Tiers are additive — a property can be Analyzed + Recommended.

### 2.2 Sparkline Price Trends
90-day price trend micro-chart on property cards (investor mode):

- SVG path element, < 1KB per chart
- Green stroke if trending up, red if down, muted if flat
- Dimensions: 60×20px, positioned below price
- Data: `property_price_history` table
- Only render when data available (≥ 3 data points)

### 2.3 Confidence Range Display
FMV estimates show range instead of single number:

```
FMV: Rp 4.8M – 5.4M (±8%)
```

- Range calculated from model confidence
- Narrower range = higher confidence (visual: tighter bar)
- "Bagaimana AI menghitung ini?" link → expandable methodology

### 2.4 AI Narrative Sentences
Every score accompanied by one-sentence explanation:

```
Skor 84 — harga 18% di bawah rata-rata area dengan permintaan naik 23%
```

- `text-[11px] text-muted-foreground italic` styling
- Generated from score components (growth weight, deal gap, yield)
- Displayed below score badge on detail pages and expanded card views

---

## 3. Premium Authority Perception

### 3.1 Typography Discipline

| Element | Font | Weight | Size | Usage |
|---------|------|--------|------|-------|
| Hero headline | Playfair Display | 700 | `text-3xl md:text-5xl` | Homepage hero, section emotional headers |
| Section title | Inter | 700 | `text-lg md:text-xl` | Content section headers |
| Card title | Inter | 600 | `text-sm md:text-base` | Property name on cards |
| Price | Inter | 900 (`font-black`) | `text-lg` min + `drop-shadow-sm` | All price displays |
| Metadata | Inter | 400 | `text-[10px]` min | Labels, timestamps, specs |
| AI narrative | Inter | 400 italic | `text-[11px]` | AI explanation sentences |

**Rule:** Playfair appears maximum 2 times per page. Overuse dilutes premium signal.

### 3.2 Gold Accent Discipline
`--gold-primary` reserved exclusively for:
- Intelligence Line (1px gradient above AI panels)
- AI score badges and investment widget accents
- "AI Est." / "AI Pick" badge backgrounds (at 10% opacity)

**Prohibited:** Decorative borders, background fills, non-AI icons, marketing badges.

### 3.3 Card Presentation Hierarchy

Three card tiers with distinct elevation:

| Tier | When | Shadow | Border | Hover |
|------|------|--------|--------|-------|
| Standard | Default listings | `shadow-sm` | `border-border/50` | `scale-[1.02] shadow-md` |
| Featured | Paid promotion | `shadow-md` | `border-gold-primary/15` + Intelligence Line | `scale-[1.02] shadow-lg` |
| AI Pick | AI recommended | `shadow-md` | `border-primary/20` + glow pulse | `scale-[1.02] shadow-lg` |

All cards: `rounded-xl`, `will-change-transform`, 16:10 image aspect ratio.

---

## 4. Viral Discovery Behavior

### 4.1 Share Message Enhancement
Existing `SocialShareDialog` enhanced with AI context:

```
"Villa 3BR Canggu — Rp 4.2M
🤖 AI Score: 84/100 · 18% di bawah pasar
Lihat di ASTRAVILLA →"
```

- Pre-filled message includes AI insight (differentiates from generic listing shares)
- Every share is a brand impression communicating intelligence

### 4.2 Social Proof on Cards
When `property_shares` count > 3:

```
"Dibagikan 12 kali" — subtle text below card actions
```

- `text-[10px] text-muted-foreground`
- Creates bandwagon effect without feeling manufactured

### 4.3 Save-to-Compare Loop

```
Save 1st property → "Simpan 1 lagi untuk membandingkan"
Save 2nd property → "Bandingkan 2 properti →" CTA appears
Save 3rd property → Comparison workspace auto-suggested
```

Each save deepens engagement and moves user toward conversion.

### 4.4 Return Visitor Hook
For users with `ai_behavior_tracking` history returning after 2+ days:

```
┌─────────────────────────────────────────────────┐
│ Selamat datang kembali — X properti baru sejak  │
│ kunjungan terakhir Anda    [Lihat Properti Baru] │
└─────────────────────────────────────────────────┘
```

- Banner at top of homepage, dismissable
- Counts new listings since last `user_sessions` timestamp
- Creates urgency and rewards return behavior

---

## 5. Stagnation Risk Mitigation

| Risk | Detection Signal | Mitigation |
|------|-----------------|------------|
| **"No Image" cards visible** | Properties without images in first 2 grid rows | Enforce image requirement for homepage visibility; branded "Coming Soon" placeholder for others |
| **Static section headers** | No dynamic counts or recency signals | Implement data-aware narratives (Section 1.2) |
| **No above-fold social proof** | Trust counter bar missing | Deploy counter bar (Section 1.4) — highest single-impact fix |
| **Identical card weights** | All cards look the same regardless of quality | Implement card hierarchy tiers (Section 3.3) |
| **Empty collections** | SmartCollections strip shows < 3 properties | Hide collection strip entirely if < 4 items; show next qualifying collection |
| **Silent loading** | Spinner with no messaging | Skeleton screens + "ASTRA AI menganalisis..." loading text |
| **Stale "Trending"** | Same properties trending for weeks | Rotate trending source: week 1 = saves, week 2 = views, week 3 = inquiry rate |
| **No activity timestamps anywhere** | Every listing feels equally old | Relative timestamps on all cards < 30 days old (Section 1.3) |

---

## Implementation Priority

### Sprint 1: Energy Perception (High Impact, Low Effort)
1. Trust counter bar on homepage
2. "Baru" badges with relative timestamps
3. Dynamic section header narratives
4. Replace loading spinners with branded skeletons

### Sprint 2: Intelligence Surface (High Impact, Medium Effort)
5. Three-tier AI badge system on cards
6. AI narrative sentences on detail pages
7. Share message enhancement with AI context
8. Social proof share counts on cards

### Sprint 3: Premium Polish (Medium Impact, Low Effort)
9. Card hierarchy tiers (Standard/Featured/AI Pick)
10. Typography audit and Playfair discipline enforcement
11. Gold accent audit — remove non-AI decorative usage
12. Return visitor welcome banner

### Sprint 4: Engagement Loops (Medium Impact, Medium Effort)
13. Save-to-compare progressive CTA
14. Trending strip with staggered animation
15. Sparkline price trends (investor mode)
16. Empty collection fallback logic
