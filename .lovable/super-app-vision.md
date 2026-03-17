
# ASTRA Villa — Super App Vision & Strategic Roadmap

## Status: 📋 PLANNING PHASE
## Last Updated: March 2026

---

## Vision Statement

Transform ASTRA Villa from a property marketplace and investment intelligence tool into a comprehensive **real estate lifestyle and financial ecosystem super app** — where users can discover, buy, finance, improve, manage, and optimize property assets through one integrated AI-driven digital experience.

---

## Module Architecture (7 Pillars)

### Pillar 1: Property Investment Intelligence Layer ✅ BUILT
> Core differentiator — already mature

| Feature | Status | Route |
|---------|--------|-------|
| Opportunity Ranking Engine | ✅ Live | /deal-finder |
| Autonomous Price Prediction | ✅ Live | /price-prediction |
| Market Heat Geo Intelligence | ✅ Live | /market-intelligence |
| AI Investment Advisor | ✅ Live | /investment-advisor |
| Portfolio Command Center | ✅ Live | /portfolio-dashboard |
| Super Engine (unified analysis) | ✅ Live | Property detail page |
| AI Autopilot | ✅ Live | /ai-autopilot |
| Investor DNA Personalization | ✅ Live | /investor-dna-admin |
| Wealth Simulator | ✅ Live | /wealth-simulator |
| Capital Allocation Optimizer | ✅ Live | /portfolio-optimizer |
| Liquidity Forecasting | ✅ Live | /liquidity-engine |
| Hedging Engine | ✅ Live | /hedging-engine |

**Next:** Self-learning feedback loop refinement, model drift auto-correction.

---

### Pillar 2: Transaction & Marketplace Layer 🟡 PARTIAL
> Full property transaction lifecycle

| Feature | Status | Priority |
|---------|--------|----------|
| Buy/sell marketplace | ✅ Live | — |
| Long-term rental ecosystem | ✅ Live | — |
| Short-term rental (villa stays) | 🟡 Partial | P1 |
| Developer JV project launches | ✅ Live | — |
| Unit reservation & booking | 🔲 Planned | P2 |
| Commission & agent workflows | ✅ Live | — |
| Escrow / secure transaction flow | 🔲 Planned | P3 |
| Offer negotiation system | ✅ Live | — |

**Next:** Unit reservation system, escrow integration, short-term rental calendar.

---

### Pillar 3: Property Services Ecosystem 🔲 FUTURE
> Everyday housing services as micro-merchant marketplace

| Service Category | Status | Priority |
|-----------------|--------|----------|
| Repair & maintenance booking | 🔲 Planned | P2 |
| Plumbing & electrical services | 🔲 Planned | P2 |
| Renovation & construction | 🔲 Planned | P2 |
| Interior design marketplace | 🔲 Planned | P3 |
| Furniture & appliance store | 🔲 Planned | P3 |
| Smart home installations | 🔲 Planned | P4 |
| Service provider onboarding | 🔲 Planned | P2 |
| Service ratings & reviews | 🔲 Planned | P2 |

**Architecture approach:**
- `vendor_services` table already exists — extend with category taxonomy
- Micro-merchant model: providers self-register, admin approves
- Booking flow: request → quote → accept → schedule → complete → review
- Payment: integrate with existing `payment-engine`

**Data model additions needed:**
```
service_categories (id, name, icon, parent_id)
service_requests (id, user_id, provider_id, category_id, property_id, status, scheduled_at, completed_at, rating)
service_provider_profiles (id, user_id, categories[], coverage_areas[], rating, verified)
```

---

### Pillar 4: Legal & Documentation Platform 🟡 PARTIAL
> Indonesia-focused property legal assistance

| Feature | Status | Priority |
|---------|--------|----------|
| Contract Analyzer (AI) | ✅ Live | — |
| Document Verifier (SHM, SHGB, AJB, IMB, PBB) | ✅ Live | — |
| Document Generator | ✅ Live | — |
| SHM certificate processing tracker | 🔲 Planned | P2 |
| AJB / PPJB workflow management | 🔲 Planned | P2 |
| Land title verification service | 🔲 Planned | P2 |
| Property tax consultation | 🔲 Planned | P3 |
| Balik nama (ownership transfer) tracking | 🔲 Planned | P2 |
| Notary/PPAT network integration | 🔲 Planned | P3 |

**Architecture approach:**
- Legal case tracker: `legal_cases (id, property_id, user_id, case_type, status, notary_id, documents[], timeline[])`
- Partner notary network with verified status
- Document status pipeline: Draft → Review → Notarized → Filed → Complete

---

### Pillar 5: Property Financial Services 🟡 PARTIAL
> Mortgage, financing, and lending integrations

| Feature | Status | Priority |
|---------|--------|----------|
| Mortgage eligibility advisor | ✅ Live | — |
| Mortgage comparison calculator | ✅ Live | — |
| Bank partnership leads | ✅ Live | — |
| KPR simulation engine | ✅ Live | — |
| Property investment financing | 🔲 Planned | P3 |
| Rental income advance products | 🔲 Planned | P4 |
| AI valuation-backed lending signals | 🔲 Planned | P4 |
| Insurance marketplace | 🔲 Planned | P4 |

**Next:** Deepen bank API integrations, real-time rate feeds, pre-approval workflows.

---

### Pillar 6: Investor Community & Intelligence Network 🔲 FUTURE
> Social intelligence and network effects

| Feature | Status | Priority |
|---------|--------|----------|
| Investment trend discussions | 🔲 Planned | P3 |
| Expert market insights feed | 🔲 Planned | P3 |
| Deal watchlist sharing | 🔲 Planned | P2 |
| Emerging zone intelligence reports | 🔲 Planned | P3 |
| Investor forums by city | 🔲 Planned | P3 |
| Expert AMA / webinar integration | 🔲 Planned | P4 |

**Architecture approach:**
- `community_posts (id, user_id, type, content, city, tags[], likes, replies_count)`
- `community_replies (id, post_id, user_id, content)`
- Moderation: AI content filter + admin review queue
- Gamification: investor reputation score based on contribution quality

---

### Pillar 7: Lifestyle & Home Ownership 🔲 FUTURE
> Long-term expansion — post-purchase experience

| Feature | Status | Priority |
|---------|--------|----------|
| Moving services coordination | 🔲 Planned | P4 |
| Utility activation assistance | 🔲 Planned | P4 |
| Smart home subscription services | 🔲 Planned | P5 |
| Property management automation | 🔲 Planned | P4 |
| Tenant management tools | 🔲 Planned | P3 |
| Rental collection automation | 🔲 Planned | P3 |

---

## Implementation Phases

### Phase 1: Core Excellence (Current — Q1 2026) ✅
- Investment intelligence layer mature
- Transaction marketplace operational
- Mobile investor experience enhanced
- AI automation systems running

### Phase 2: Services & Legal (Q2-Q3 2026)
- Property services marketplace MVP
- Legal document workflow tracker
- Unit reservation system
- Enhanced bank partnership integrations
- Tenant management tools

### Phase 3: Community & Financial (Q4 2026)
- Investor community forums
- Deal watchlist sharing
- Rental income advance partnerships
- Developer analytics dashboards
- Short-term rental calendar

### Phase 4: Lifestyle Ecosystem (2027)
- Moving & utility services
- Smart home integrations
- Property management automation
- Insurance marketplace
- Full super app experience

---

## Technical Architecture Principles

1. **Modular pillar isolation** — each pillar owns its tables, hooks, and edge function modes
2. **Shared identity layer** — single auth, single profile, role-based access across pillars
3. **Payment unification** — all monetary flows through `payment-engine`
4. **AI backbone** — every pillar feeds data into the intelligence layer for cross-pillar insights
5. **Vendor/provider model** — service providers, notaries, banks as platform participants
6. **Mobile-first** — every new pillar must have mobile-optimized experience from day one

---

## Success Metrics (Super App KPIs)

| Metric | Target |
|--------|--------|
| Monthly active users | 100K+ |
| Avg pillars used per user | 3+ |
| Transaction GMV | Rp 500B+ annually |
| Service bookings/month | 10K+ |
| Investor retention (90-day) | 60%+ |
| NPS | 50+ |
| Platform revenue diversification | 4+ revenue streams |

---

## Competitive Moat

1. **AI-first intelligence** — no competitor has autonomous investment scoring + prediction
2. **Full lifecycle** — discover → analyze → buy → finance → improve → manage → sell
3. **Indonesia-specific** — deep local legal, tax, and regulatory integration
4. **Network effects** — investor community + service provider marketplace creates lock-in
5. **Data flywheel** — every interaction improves AI models across all pillars
