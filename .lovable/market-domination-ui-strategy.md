# ASTRAVILLA Market Domination UI Strategy
**Date:** 2026-03-16 | **Status:** Growth-Phase Execution Plan
**Core principle:** Perception of activity drives actual activity. A marketplace that looks busy becomes busy.

---

## Stagnation Perception Risks (Fix First)

These patterns currently make the platform feel static or low-activity:

| Risk | Where | Why It Hurts | Mitigation |
|------|-------|-------------|------------|
| **"No Image Available" on most cards** | Homepage property grid | Looks like an empty/test marketplace | Enforce image requirements; design premium empty state |
| **Static section headers** | "Properti Dijual — 12 properti tersedia" | No energy, no movement signal | Dynamic: "12 properti · 3 baru minggu ini · 2 harga turun" |
| **No timestamp signals** | Property cards show no recency | Every listing feels like it could be months old | "Baru 2 hari" badge on listings < 7 days; "Diperbarui hari ini" on refreshed listings |
| **Generic loading spinner** | Center-page spinner on initial load | Feels like a slow app, not a busy marketplace | Replace with branded skeleton + "Memuat properti terbaru..." |
| **Identical marketplace service cards** | 8 grey icon cards with notification dots | Looks like placeholder UI, not real services | Add category images, service counts, and remove fake notification dots |
| **No above-fold social proof** | Homepage hero area | No evidence the platform is used by anyone | Trust bar: "X properti · Y agen terverifikasi · Z inquiry minggu ini" |
| **Footer shows before content loads** | Page load sequence | Footer visible with empty content area = "is this all there is?" | Ensure content skeletons fill viewport before footer renders |

---

## Strategy 1: Perceived Marketplace Activity

### 1.1 Homepage Trust Counter Bar
**Priority:** P0 — Single highest-impact missing element

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 5,200+ Properti   👤 340+ Agen   🤖 AI Analytics   📊 38 Provinsi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Full-width strip below hero, above search
- Numbers count-up animate on first viewport entry (ScrollReveal + CSS counter)
- Data: static initially (from `useTotalPropertyCount`), later real-time
- Design: `bg-card border-y border-border`, `text-sm font-semibold`

### 1.2 "Baru" (New) Listing Badges
**Priority:** P0

- Properties where `created_at > NOW() - 7 days` get a "Baru" badge
- Position: top-left of card image, `bg-accent text-accent-foreground rounded-md px-2 py-0.5 text-[10px] font-bold`
- First 24 hours: badge uses `.signal-shimmer` animation
- After 24h but < 7 days: static badge

### 1.3 Dynamic Activity Indicators
**Priority:** P1

Replace static section headers with data-aware narratives:

| Section | Static (Current) | Dynamic (Proposed) |
|---------|-----------------|-------------------|
| Properti Dijual | "12 properti tersedia" | "12 properti · 3 baru · 2 harga turun 📉" |
| Properti Disewa | "8 properti tersedia" | "8 properti sewa · mulai Rp 15M/tahun" |
| Investment Opportunities | "6 off-plan projects" | "6 proyek · avg ROI 36% · 2 hampir habis" |
| Location section | "Explore by Province" | "38 provinsi · 156 kota · tren naik di 12 lokasi 📈" |

### 1.4 Relative Timestamps
**Priority:** P1

Add human-readable timestamps to cards and listings:
- "Baru 2 jam lalu" (< 24h)
- "Baru 3 hari lalu" (1-7 days)
- "2 minggu lalu" (7-30 days)
- No timestamp for older listings (avoid "stale" perception)

---

## Strategy 2: Discovery Excitement

### 2.1 Curated Opportunity Strips

Horizontal scrollable strips with themed collections. Infrastructure exists (SmartCollectionsV2 with 5 categories) — needs prominent homepage placement.

| Strip | Data Source | Badge Style |
|-------|-----------|-------------|
| 🔥 Trending Minggu Ini | Top 8 by 30-day saves | Save count badge |
| 💰 Undervalued Deals | `deal_score_percent > 10` | "X% di bawah pasar" green badge |
| 📈 Top Investment Score | `investment_score > 75` | Gold score badge with `.signal-glow` |
| 🏗️ Proyek Baru Developer | New development projects | "Pre-Launch" amber badge |
| 🏠 Pilihan Keluarga | 3BR+, < city avg price | "Family Friendly" blue badge |

**Design:** Each strip has a themed header with icon + "Lihat Semua →" link. Cards use horizontal scroll with `snap-x`. Stagger entrance animation with `.stagger-fade-in`.

### 2.2 Hotspot Carousel

Location intelligence cards showing trending areas:

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 📍 Canggu, Bali   │ │ 📍 BSD, Tangerang │ │ 📍 Ubud, Bali     │
│ ████████░░ 82/100 │ │ ██████░░░░ 65/100 │ │ █████████░ 91/100 │
│ 📈 +15% growth    │ │ 🏗️ 12 new projects│ │ 🔥 High demand    │
│ 🏠 245 properties │ │ 🏠 189 properties │ │ 🏠 312 properties │
│ [Jelajahi →]      │ │ [Jelajahi →]      │ │ [Jelajahi →]      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

- Data from `investment_hotspots` table (demand, growth, score already computed)
- Score bar uses gold gradient fill
- Auto-scroll every 5s with pause on hover/touch
- Links to location SEO landing pages (when built)

### 2.3 "AI Menemukan" Discovery Banner

Periodic contextual discovery banner between sections:

```
┌─ 🤖 ──────────────────────────────────────────────────────┐
│  ASTRA AI menemukan 3 properti undervalued di Jakarta     │
│  minggu ini. Harga rata-rata 18% di bawah pasar.          │
│                                    [Lihat Deals →]         │
└───────────────────────────────────────────────────────────┘
```

- Gold Intelligence Line at top
- Rotates content weekly based on actual data
- Uses `.skeleton-reveal` entrance animation
- One per homepage scroll (not repetitive)

---

## Strategy 3: Competitive Positioning Cues

### 3.1 Intelligence-First Messaging

Subtle copy throughout the interface reinforcing AI differentiation:

| Location | Current Copy | Proposed Copy |
|----------|-------------|---------------|
| Search placeholder | "Kos-kosan dekat kampus..." | "Cari properti... didukung AI 🤖" |
| Empty state | "No properties found" | "AI sedang mencari properti yang cocok untuk Anda" |
| Loading skeleton | (silent) | "ASTRA AI menganalisis pasar..." |
| Card footer | (specs only) | "AI Score: 82 · Demand: Tinggi" |
| Filter section | "Filter" | "Filter Cerdas — didukung AI" |

### 3.2 Methodology Transparency

Show scoring methodology to build trust and differentiate from "trust me" competitors:

- "Bagaimana AI menghitung skor ini?" link on every AI badge
- Expandable panel: "Skor 82/100 = Pertumbuhan (30%) + Deal (25%) + Yield (25%) + Likuiditas (20%)"
- This transparency IS the differentiator — no Indonesian competitor shows their work

### 3.3 Platform Authority Signals

- "Didukung oleh data dari 38 provinsi" in footer
- "Diperbarui setiap 3 jam" on market data sections
- "X properti dianalisis oleh AI" counter on analytics pages
- Version badge: "ASTRA AI v2.0" on intelligence panels (versioning signals continuous improvement)

---

## Strategy 4: Viral Exploration Behavior

### 4.1 Share Optimization

Sharing infrastructure exists (`SharePropertyButton`, `SocialShareDialog`, `property_shares` tracking). Optimization:

- **Pre-fill share message** with AI insight: "Properti ini dinilai 18% di bawah pasar oleh ASTRA AI 🤖"
- **Share count on cards** when count > 3: "Dibagikan 12 kali" with subtle social proof
- **Post-share CTA:** "Lihat properti serupa?" recommendation panel after sharing
- **OG image enhancement:** Include AI score badge in OG image for social previews

### 4.2 Repeat Visit Hooks

| Trigger | Notification/UI Element |
|---------|------------------------|
| Saved property price drops | Email + in-app: "Harga properti yang Anda simpan turun Rp 200M" |
| New listing in saved search area | Push: "3 properti baru di Bali minggu ini" |
| AI score change on saved property | In-app: "Skor investasi naik 72 → 85 — permintaan meningkat" |
| Return visit after 3+ days | Homepage banner: "Selamat datang kembali — 8 properti baru sejak kunjungan terakhir" |

### 4.3 Engagement Loops

```
Browse → Save/Shortlist → Compare → Share → Get notified → Return → Browse deeper
```

Each step has a UI touchpoint:
1. **Browse:** AI signals encourage deeper exploration
2. **Save:** Heart icon + "Tambahkan ke shortlist" prompt
3. **Compare:** Shortlist workspace with side-by-side data
4. **Share:** Pre-filled social share with AI insight
5. **Notify:** Smart notification on price/score/demand changes
6. **Return:** "Welcome back" banner with new listings count
7. **Browse deeper:** Personalized recommendations based on behavior

---

## Implementation Priority

### Sprint 1: Activity Perception (Week 1–2)
| Item | Impact | Effort | Depends On |
|------|--------|--------|-----------|
| Homepage trust counter bar | 🔴 Critical | Low | `useTotalPropertyCount` hook |
| "Baru" badges on new listings | 🔴 Critical | Low | `created_at` field |
| Dynamic section headers with counts | 🟡 High | Low | Existing query data |
| Relative timestamps on cards | 🟡 High | Low | `created_at` field |

### Sprint 2: Discovery Energy (Week 3–4)
| Item | Impact | Effort | Depends On |
|------|--------|--------|-----------|
| Curated opportunity strips (5 themes) | 🔴 Critical | Medium | SmartCollectionsV2 data |
| Hotspot carousel | 🟡 High | Medium | `investment_hotspots` data |
| "AI Menemukan" discovery banner | 🟡 High | Low | Edge function data |
| Intelligence-first messaging updates | 🟢 Medium | Low | Copy changes only |

### Sprint 3: Engagement Loops (Week 5–6)
| Item | Impact | Effort | Depends On |
|------|--------|--------|-----------|
| Enhanced share messages with AI insights | 🟡 High | Low | `SharePropertyButton` exists |
| "Welcome back" returning visitor banner | 🟡 High | Medium | `ai_behavior_tracking` |
| Price drop notifications for saved properties | 🟡 High | Medium | Smart Notification System |
| Share count display on cards | 🟢 Medium | Low | `property_shares` table |

### Sprint 4: Stagnation Mitigation (Week 7–8)
| Item | Impact | Effort | Depends On |
|------|--------|--------|-----------|
| Remove fake notification dots from marketplace grid | 🟡 High | Low | Code change |
| Replace loading spinner with branded skeleton | 🟡 High | Low | Skeleton component exists |
| Enforce property image requirements | 🟡 High | Medium | Form validation |
| Add methodology transparency panels | 🟢 Medium | Medium | Content creation |
