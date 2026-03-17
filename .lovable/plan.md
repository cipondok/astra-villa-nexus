
# ASTRA Villa — Platform Architecture Analysis & Roadmap

## Status: 🔄 IN PROGRESS

## Current State Assessment (March 2026)

### Scale
| Metric | Count |
|--------|-------|
| Pages | 120+ |
| Components | 200+ directories |
| Hooks | 230+ |
| Edge Functions | 18 (consolidated from 82) |
| Database Tables | 450+ |
| RLS Policies | 1,000+ |

### Three-Layer Architecture ✅
| Layer | Key Features | Status |
|-------|-------------|--------|
| **Public Platform** | Property browse, search, map, detail pages, AI chat, mortgage tools | ✅ Mature |
| **Investor Intelligence** | ROI forecasts, deal finder, portfolio builder, market trends, location intel | ✅ Mature |
| **Admin AI Command Center** | Job queue, SEO engine, valuations, health monitor, KPI alerts | ✅ Mature |

### Edge Function Architecture ✅
| Router | Modes |
|--------|-------|
| `core-engine` | 25+ modes (investment_score, valuation, health, diagnostics, map_search) |
| `ai-engine` | 25+ modes (descriptions, NLP, recommendations, market reports) |
| `deal-engine` | deal_finder, alerts, negotiation, pricing, forecasts |
| `ai-assistant` | SSE streaming chatbot, NLP search, investment advisor |
| `notification-engine` | Email, push, campaigns |
| `payment-engine` | Midtrans, PayPal, invoices, subscriptions |
| `vendor-engine` | Vendor services, validation |

### AI Automation Systems ✅
- SEO: Daily audits (3AM UTC), 6-hour auto-optimizer, property_seo_analysis tracking
- Jobs: ai_jobs queue with claim_next_job() SKIP LOCKED, stall recovery, retry logic
- Valuations: property_valuations with auto-recalculation
- ROI: property_roi_forecast with 5-year projections
- Autonomous Agent: 6-hour market scans for opportunity detection

---

## Identified Gaps & Improvements

### 🔴 Critical Performance
1. **Map viewport debouncing** — `moveend` fires on every pan; needs 300ms debounce ✅ FIXED
2. **Spatial indexes** — Need composite indexes on (latitude, longitude, status) ✅ FIXED
3. **Platform health aggregation** — Real AI system status on admin overview ✅ FIXED (prev iteration)

### 🟡 Architecture Improvements
4. **Unified health hook** — Single hook aggregating all AI subsystem health ✅ FIXED
5. **Query deduplication** — MapBounds type duplicated across useMapSearch/useMapProperties
6. **Large file refactoring** — PropertyDetail.tsx (1544 lines), Index.tsx (1199 lines) need splitting

### 🟢 Future Expansion Ready
- AI deal finder ✅ Exists (/deal-finder)
- Predictive market analytics ✅ Exists (/market-trends, /price-prediction)
- AI recommendation engine ✅ Exists (ai-match-engine-v2)
- Location intelligence ✅ Exists (/location-intelligence)
- Knowledge graph ✅ Hook exists (useKnowledgeGraph)

### Recommended Next Steps
1. Add database indexes for map queries at scale
2. Debounce map viewport changes
3. Create unified platform health dashboard
4. Split PropertyDetail.tsx into sub-components
5. Add API response caching headers to edge functions
6. Implement property search result caching with stale-while-revalidate
