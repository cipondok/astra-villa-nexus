# ASTRAVILLA SEO Landing Page Design System Blueprint
**Date:** 2026-03-16 | **Status:** Active
**Current State:** Province page (`/province-properties`) is a data table with property counts — no SEO content, meta tags, market insights, or internal linking. No city/district/neighborhood pages exist.

---

## Architecture Gap

### Current Routes
| Route | Purpose | SEO Ready? |
|-------|---------|-----------|
| `/province-properties` | Province listing counts grid | ❌ No meta, no H1 keyword, no content |
| `/location` | Interactive SVG heatmap | ❌ Map-only, no indexable content |
| `/properties?location=X` | Filtered listing grid | ❌ Query param (not crawlable as unique page) |

### Target URL Structure (Programmatic SEO)
```
/properti/{province}/                    → Province landing
/properti/{province}/{city}/             → City landing
/properti/{province}/{city}/{kecamatan}/ → District landing
/properti/{province}/{city}/{kecamatan}/{kelurahan}/ → Neighborhood landing
```

Each level inherits the template but increases specificity. This matches the four-tier hierarchy (Province → City → Kecamatan → Kelurahan) already in the schema.

---

## 1. Scalable Landing Page Template

### Section Sequence (Top → Bottom)

| Order | Section | Purpose | SEO Value |
|-------|---------|---------|-----------|
| 1 | **Breadcrumb** | Hierarchy navigation | Internal linking, rich snippets |
| 2 | **Hero H1 + Stats Bar** | Primary keyword + trust signals | Title tag alignment, user confidence |
| 3 | **Quick Filter Chips** | Refine by property type | Reduces bounce, keeps users on page |
| 4 | **Featured Listings** (3–4 cards) | Best deals / highest AI scores | Above-fold engagement, click-through |
| 5 | **Market Intelligence Panel** | Avg price, demand heat, trends | Dwell time, E-E-A-T authority |
| 6 | **Full Listing Grid** | Paginated property cards | Core content, crawlable listings |
| 7 | **Nearby Areas Module** | Child/sibling location links | Internal linking depth |
| 8 | **SEO Content Block** | 200–300 word location description | Keyword density, topical authority |
| 9 | **FAQ Accordion** | 3–5 location-specific questions | Featured snippet eligibility |
| 10 | **JSON-LD Schema** | Structured data | Rich results |

### Responsive Behavior
- **Desktop:** 2-column layout (listings left, market intel sidebar right)
- **Tablet:** Single column, market intel collapses to horizontal cards
- **Mobile:** All sections stack; market intel becomes collapsible accordion; sticky filter bar at top

---

## 2. Location Authority Perception

### Market Intelligence Panel Spec

Data sources already exist in `investment_hotspots` table and AI scoring engines.

```
┌─────────────────────────────────────────────┐
│  📊 Market Intelligence: {Location}          │
├──────────┬──────────┬──────────┬────────────┤
│ Avg Price│ Demand   │ Growth   │ Investment │
│ Rp 2.3B  │ 🔥 High  │ +12% YoY │ Score: 78  │
├──────────┴──────────┴──────────┴────────────┤
│ 📈 Price Trend (12mo sparkline chart)        │
│ 🏘️ X active listings · Y new this month     │
│ 💰 Rental yield: 5.2% avg (Strong)          │
└─────────────────────────────────────────────┘
```

**Data mapping:**
- Avg Price → median from `properties` where location matches
- Demand → `demand_heat_score` from `investment_hotspots`
- Growth → `growth_score` from `investment_hotspots`
- Investment Score → composite from AI scoring weights (30% Growth, 25% Deal, 25% Yield, 20% Liquidity)
- Rental Yield → from `rental_yield_analysis` or computed avg

**Thresholds (from intelligence memory):**
- 🔥 High Demand: score ≥ 65
- 📈 Strong Growth: score ≥ 60
- 💰 Strong Yield: ≥ 7%

### Trust Signals in Hero
```
Properti Dijual di {Location}
{X} properti tersedia · Harga mulai Rp {min} · Skor Investasi {score}/100
```

---

## 3. Listing Grid Storytelling Density

### Card Priority System

| Position | Card Type | Selection Criteria |
|----------|-----------|--------------------|
| 1–2 | **Featured / Promoted** | `owner_subscription_type = 'enterprise'` OR highest `investment_score` |
| 3–4 | **Best Deals** | `deal_score_percent > 10` (below market value) |
| 5+ | **Standard** | Sorted by recency, then AI relevance |

### Spacing Rhythm
- Grid: `gap-5` (20px) per UI stability constraint
- Max columns: `xl:grid-cols-4` per constraint
- Featured cards: `col-span-2 row-span-1` on desktop for visual hierarchy break
- Mobile: single column for featured, 2-column for standard

### Visual Differentiation
- Featured: Gold border (`border-gold-primary/50`) + "⭐ Featured" badge
- Best Deal: "X% Below Market" badge with `.signal-glow`
- New (< 7 days): "Baru" badge with `.signal-shimmer`
- Standard: Default card treatment with `.card-hover-lift`

---

## 4. Internal Linking UX

### Breadcrumb Pattern
```
Beranda > Properti > {Province} > {City} > {Kecamatan}
```
- Each level is a clickable link to its landing page
- Use `<nav aria-label="breadcrumb">` with existing Breadcrumb component
- JSON-LD `BreadcrumbList` schema on every page

### Nearby Areas Module

```
┌──────────────────────────────────────┐
│  🗺️ Jelajahi Area Sekitar            │
├──────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │ Seminyak │ │ Canggu  │ │ Ubud   │ │
│  │ 245 prop │ │ 189 prop│ │ 312 p  │ │
│  │ Rp 3.2B  │ │ Rp 2.8B │ │ Rp 1.9B│ │
│  └─────────┘ └─────────┘ └────────┘ │
│                                      │
│  Lihat Semua Area di {Province} →    │
└──────────────────────────────────────┘
```

**Logic:**
- Province page → show top 8 cities by listing count
- City page → show all kecamatan within city
- Kecamatan page → show kelurahan + sibling kecamatan
- Each card links to the child location's landing page

### Parent Navigation
- "← Semua Properti di {Parent Location}" link at top of grid
- Province pages link back to `/province-properties` index

---

## 5. Mobile SEO Landing Readability

### Content Chunking
- Market Intelligence Panel → collapsible accordion, collapsed by default on mobile
- SEO content block → first 80 words visible, "Baca selengkapnya" expand toggle
- FAQ → native `<details>` accordion (no JS, best for Core Web Vitals)

### Sticky Search Refinement
- On scroll past hero, show sticky mini-bar: `{Location} · {X} properti · [Filter] [Sort]`
- Height: 48px, `bg-background/95 backdrop-blur-sm border-b`
- Disappears on scroll-up (reveal header), reappears on scroll-down

### Image Optimization
- Property card images: `loading="lazy"` for below-fold
- First 4 cards: `loading="eager"` + `fetchpriority="high"` for LCP
- Supabase transforms: `width=400` for card thumbnails, `quality=75`

---

## 6. SEO Technical Requirements

### Meta Tags (Per Page)
```html
<title>Properti Dijual di {Location} - {X} Listing | ASTRAVILLA</title>
<meta name="description" content="Temukan {X} properti dijual di {Location}. Harga mulai Rp {min}. AI-powered analytics, skor investasi, dan tren pasar terkini." />
<link rel="canonical" href="https://astra-villa-realty.lovable.app/properti/{slug}/" />
```

Title: < 60 chars with primary keyword. Description: < 160 chars with stats.

### JSON-LD Schema
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Properti Dijual di {Location}",
  "numberOfItems": {count},
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "RealEstateListing",
        "name": "{Property Title}",
        "price": "{Price}",
        "priceCurrency": "IDR"
      }
    }
  ]
}
```

### Sitemap Strategy
- Generate `/sitemap-locations.xml` with all location pages
- Priority: Province=0.8, City=0.7, Kecamatan=0.5, Kelurahan=0.4
- Update frequency: weekly (reflecting new listings)

---

## Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–2)
- Create `SEOLocationPage.tsx` template component with section sequencing
- Implement route structure `/properti/:province/:city?/:kecamatan?/:kelurahan?`
- Add breadcrumb navigation with JSON-LD
- Implement meta tag generation (title, description, canonical)
- Move from query-param filtering to proper URL-based routes

### Phase 2 — Intelligence Layer (Weeks 3–4)
- Build `MarketIntelPanel.tsx` consuming `investment_hotspots` data
- Add featured listing prioritization logic (enterprise + high AI score)
- Implement nearby areas module with child location cards
- Add JSON-LD `ItemList` + `BreadcrumbList` schema

### Phase 3 — Content & Mobile (Weeks 5–6)
- Integrate SEO content generator output into landing pages
- Add FAQ accordion (from keyword cluster generator data)
- Implement mobile sticky filter bar
- Add collapsible market intelligence panel for mobile
- Generate and submit `/sitemap-locations.xml`

### Phase 4 — Scale & Optimize (Weeks 7–8)
- Programmatically generate pages for all 38 provinces + top 100 cities
- A/B test featured card placement (position 1–2 vs. dedicated row)
- Monitor Core Web Vitals per page template
- Track: organic impressions → clicks → listing views → inquiries funnel
