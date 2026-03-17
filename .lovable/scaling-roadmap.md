
# ASTRA Villa — Technology & Market Scaling Roadmap

## Status: 📋 STRATEGIC PLANNING
## Last Updated: March 2026

---

## Mission

Scale ASTRA Villa from a local intelligent property marketplace into a globally trusted AI-powered real estate investment intelligence ecosystem.

---

## Phase 1: Local Market Dominance — Indonesia Foundation

**Timeline:** Q1–Q4 2026 (Current Phase)

### Technology Priorities

| Initiative | Status | Details |
|-----------|--------|---------|
| Core AI engine stabilization | ✅ Done | 7 consolidated edge function routers, job queue with stall recovery |
| Database optimization (50K–100K listings) | ✅ Done | Composite spatial indexes, 300ms map debounce, GPU-accelerated Mapbox layers |
| Opportunity scoring accuracy | ✅ Done | Weighted algorithm (demand 40%, growth 35%, price index 25%), self-learning feedback loop |
| Service provider marketplace | 🟡 In Progress | `vendor_services` table exists; needs category taxonomy and booking flow |
| Mobile investor experience | ✅ Done | Enhanced MobileInvestorDashboard with portfolio hero, AI alerts, heat summary |
| Real-time event pipeline | ✅ Done | Trigger-based `ai_event_signals`, 2-min deduplication, Supabase Realtime broadcast |
| AI job queue reliability | ✅ Done | `claim_next_job()` SKIP LOCKED, watchdog stall recovery, 10 tasks/cycle |

### Business Priorities

| Initiative | Status | Target |
|-----------|--------|--------|
| Developer JV partnerships | 🟡 Active | 10+ developer partners by Q3 2026 |
| Investor user base growth | 🟡 Active | Jakarta, Bali, Bandung, Surabaya — 10K active investors |
| Legal service network | 🟡 Partial | AI doc tools live; notary/PPAT network planned |
| Monetization validation | 🔲 Planned | Commission model + premium intelligence subscription tier |
| Agent acquisition pipeline | ✅ Live | `agent_acquisition_pipeline` with stage tracking |

### Key Metrics

| KPI | Current | Target |
|-----|---------|--------|
| Active listings | ~10K | 50K+ |
| Monthly active investors | ~1K | 10K+ |
| AI prediction accuracy | ~75% | 85%+ |
| Platform uptime | 99.5% | 99.9% |
| Avg page load (mobile) | <2s | <1.5s |

### Technical Debt to Resolve

- [ ] Split `PropertyDetail.tsx` (1544 lines) into sub-components
- [ ] Deduplicate `MapBounds` type across map hooks
- [ ] Add API response caching headers to edge functions
- [ ] Implement stale-while-revalidate for search results

---

## Phase 2: Regional Expansion — Southeast Asia Growth

**Timeline:** Q1–Q4 2027

### Technology Requirements

| Initiative | Complexity | Architecture Notes |
|-----------|-----------|-------------------|
| Multi-country data architecture | High | Add `country_code` to properties, regions, market data tables; partition by country |
| Country-specific market heat | Medium | Parameterize heat scoring by country benchmarks; separate calibration datasets |
| Multi-currency support | Medium | `currencies` table, exchange rate feed, display currency preference per user |
| Regulatory data models | High | Country-specific legal document types, tax rules, ownership structures |
| Cross-border cloud infra | Medium | Supabase regional replicas or edge caching; CDN for static assets |
| Localized AI models | High | Per-country price prediction weights; transfer learning from Indonesia baseline |

### Data Model Extensions

```sql
-- Country dimension
ALTER TABLE properties ADD COLUMN country_code TEXT DEFAULT 'ID';
CREATE INDEX idx_properties_country ON properties(country_code, status);

-- Currency support
CREATE TABLE currencies (
  code TEXT PRIMARY KEY,        -- IDR, THB, VND, MYR
  name TEXT,
  symbol TEXT,
  exchange_rate_to_usd NUMERIC,
  updated_at TIMESTAMPTZ
);

-- Country-specific configs
CREATE TABLE country_configs (
  country_code TEXT PRIMARY KEY,
  currency_code TEXT REFERENCES currencies(code),
  legal_document_types JSONB,   -- SHM→Chanote, etc.
  tax_rules JSONB,
  scoring_weights JSONB,        -- country-calibrated AI weights
  regulatory_notes TEXT
);
```

### Target Markets

| Country | Property Market Size | Investment Appeal | Priority |
|---------|---------------------|-------------------|----------|
| Thailand | $30B+ | Villa/resort, foreign ownership zones | P1 |
| Vietnam | $25B+ | Rapid urbanization, high growth | P1 |
| Malaysia | $20B+ | MM2H program, stable regulations | P2 |
| Philippines | $15B+ | BPO-driven demand, condo market | P3 |

### Business Priorities

- Partner with 5+ regional developers per target country
- Localize platform UI (Thai, Vietnamese, Malay)
- Enable cross-border property discovery (e.g., Indonesian investor → Bali + Phuket)
- Regional investor events and content marketing

### Key Metrics

| KPI | Target |
|-----|--------|
| Countries active | 3–4 |
| Cross-border transactions | 500+ annually |
| Regional active investors | 50K+ |
| Listings per country | 20K+ |

---

## Phase 3: Institutional Intelligence Platform

**Timeline:** 2028

### Technology Requirements

| Initiative | Complexity | Architecture Notes |
|-----------|-----------|-------------------|
| Institutional analytics dashboards | High | Fund-level portfolio views, LP reporting, benchmark comparisons |
| Cross-market predictive models | High | Ensemble models trained on multi-country datasets; A/B model testing |
| Fund portfolio analytics | High | Multi-asset allocation, vintage year tracking, IRR/MOIC calculations |
| Enhanced event pipeline | Medium | Sub-second signal processing; webhook integrations for fund systems |
| API-first intelligence layer | High | REST/GraphQL API for third-party consumption; rate limiting, API keys |
| White-label capabilities | Medium | Theming, custom domains, brand isolation for enterprise clients |

### New Product Tiers

| Tier | Audience | Features | Pricing Model |
|------|----------|----------|--------------|
| **Explorer** | Individual investors | Basic search, 5 AI analyses/month | Free |
| **Pro Investor** | Active investors | Unlimited AI, portfolio tools, alerts | Subscription |
| **Institutional** | Funds, family offices | Fund dashboards, API access, custom models | Enterprise contract |
| **Developer SaaS** | Property developers | Demand forecasting, launch analytics, buyer insights | Per-project pricing |

### Data Pipeline Architecture

```
┌─────────────────────────────────────────────────┐
│                DATA SOURCES                      │
│  Properties │ Transactions │ Market Feeds │ Users│
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│            EVENT PIPELINE (Real-time)            │
│  ai_event_signals → process-ai-events Edge Fn   │
│  Supabase Realtime broadcast                     │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│           INTELLIGENCE ENGINES                   │
│  core-engine │ ai-engine │ deal-engine           │
│  Scoring │ Prediction │ Matching │ Advisory      │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│           DELIVERY LAYER                         │
│  Web App │ Mobile │ API │ Webhooks │ Reports     │
└─────────────────────────────────────────────────┘
```

### Business Priorities

- Onboard 3+ real estate investment funds
- Launch Developer SaaS product
- Strategic bank/mortgage partnerships (2+ national banks)
- Publish quarterly market intelligence reports for brand authority

### Key Metrics

| KPI | Target |
|-----|--------|
| Institutional clients | 10+ |
| API monthly calls | 1M+ |
| AUM tracked on platform | $500M+ |
| Developer SaaS clients | 20+ |
| Annual platform revenue | $2M+ |

---

## Phase 4: Global AI Property Investment Network

**Timeline:** 2029+

### Technology Vision

| Initiative | Architecture Notes |
|-----------|-------------------|
| Global geo-cluster intelligence | Continental heat models; cross-market correlation detection |
| Large-scale valuation datasets | Integration with global property data providers (CoreLogic, etc.) |
| Self-learning scoring at scale | Reinforcement learning with millions of data points; auto-weight evolution |
| AI asset allocation advisory | Multi-asset class (residential, commercial, REITs); MPT-based optimization |
| Natural language intelligence | "Find me undervalued 3BR villas in emerging Southeast Asian markets under $200K" |
| Predictive developer analytics | Pre-construction demand forecasting using demographic + infrastructure signals |

### Global Expansion Criteria

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| Foreign investor accessibility | 30% | Can non-residents buy? |
| Data availability | 25% | Property transaction data quality |
| Market growth rate | 20% | Emerging > mature for alpha |
| Regulatory clarity | 15% | Clear ownership and tax rules |
| Platform demand signals | 10% | Existing user search behavior |

### Target Regions (Post-SEA)

| Region | Markets | Appeal |
|--------|---------|--------|
| Middle East | Dubai, Abu Dhabi | High foreign investment, digital-first |
| Southern Europe | Portugal, Spain, Greece | Golden visa programs, lifestyle investment |
| East Africa | Kenya, Rwanda | Frontier market growth, urbanization |
| Central Asia | Georgia, Uzbekistan | Emerging, low entry price, high growth |

### Business Vision

- Position as "Bloomberg Terminal for Real Estate" — the default intelligence layer
- Revenue model: SaaS subscriptions + transaction fees + data licensing
- Strategic partnerships with global real estate networks (CBRE, JLL, Knight Frank)
- Annual Global Real Estate Intelligence Conference

### Key Metrics

| KPI | Target |
|-----|--------|
| Countries covered | 15+ |
| Global active users | 500K+ |
| Cross-border transaction volume | $1B+ annually |
| AI model accuracy (global avg) | 90%+ |
| Annual revenue | $10M+ |

---

## Cross-Phase Technical Principles

1. **Modular engine architecture** — each intelligence module independently deployable
2. **Country-agnostic core, locale-specific config** — scoring weights, legal rules, currencies as config
3. **Event-driven pipeline** — real-time signals, not batch polling
4. **API-first delivery** — every intelligence output consumable via API
5. **Self-learning models** — continuous accuracy improvement via outcome tracking
6. **Privacy by design** — GDPR/PDPA compliance from Phase 2 onward
7. **Edge-optimized** — compute close to users via edge functions and regional caching

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Data quality in new markets | Start with verified developer listings; crowdsource validation |
| Regulatory complexity | Country-specific legal module; local legal partners |
| AI model drift across markets | Shadow model testing; per-country calibration datasets |
| Scaling infrastructure costs | Tiered compute; cache aggressively; optimize query patterns |
| Competition from incumbents | Speed of AI innovation; vertical depth > horizontal breadth |
| Currency/FX volatility | Display in local + USD; real-time exchange rate feeds |

---

## Current Architecture Readiness Assessment

| Phase Requirement | Readiness | Gap |
|------------------|-----------|-----|
| AI intelligence engines | ✅ Ready | Accuracy refinement ongoing |
| Database at 100K scale | ✅ Ready | Indexed, partitioned |
| Real-time event pipeline | ✅ Ready | Trigger-based, deduplicated |
| Mobile experience | ✅ Ready | Enhanced investor dashboard |
| Multi-country support | 🔲 Not started | Schema extensions needed |
| API layer | 🔲 Not started | Edge functions exist but no public API |
| Institutional dashboards | 🔲 Not started | Fund-level views needed |
| Multi-currency | 🔲 Not started | Currency table + preference system |
| Localization (i18n) | 🔲 Not started | Currently Indonesian + English |

---

*This roadmap is a living document. Review quarterly and adjust based on market signals, user feedback, and technical learnings.*
