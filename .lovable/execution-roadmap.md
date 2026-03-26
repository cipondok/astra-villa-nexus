# ASTRA Villa — CTO Execution Roadmap
## Realistic Technical Build Plan | v1.0
## Date: 2026-03-26

---

# 1️⃣ REAL EXECUTION ROADMAP

## Phase A — Platform Stabilization (Weeks 1–3)

| Goal | Actions | Outcome |
|------|---------|---------|
| **Bundle performance** | Remove `@vladmandic/face-api` (~30MB), lazy-load Three.js/Mapbox/Recharts chunks, deduplicate React runtime | Initial bundle < 350KB |
| **Router cleanup** | Archive remaining speculative pages (254→80), enforce lazy loading on all route groups | Faster cold start, cleaner navigation |
| **Hook consolidation** | Merge 569 hooks into ~80 domain hooks (usePropertyData, useInvestorData, useDealFlow) | Reduced cognitive load, fewer re-renders |
| **Edge function triage** | Freeze 120+ speculative edge functions, consolidate active ones into ~25 domain services | Lower maintenance surface |
| **Database indexing** | Add composite indexes on hot query paths (property search, investor portfolio, deal status) | Query latency < 100ms p95 |
| **Error monitoring** | Wire admin alert system to capture edge function failures, client errors, query timeouts | Proactive issue detection |

**Expected Outcome**: Stable, performant base that doesn't break during investor demos.

## Phase B — Core Product Strengthening (Weeks 4–8)

| Goal | Actions | Outcome |
|------|---------|---------|
| **Property detail excellence** | Polish 3D viewer UX, virtual staging flow, image gallery, pricing display | Best-in-class listing experience |
| **Search & discovery** | Optimize Mapbox clustering, filter performance, saved search alerts | Users find properties in < 3 clicks |
| **Agent CRM** | Consolidate agent dashboard, lead management, inquiry response workflows | Agents close deals faster |
| **Messaging reliability** | Fix real-time message delivery, read receipts, file attachments | Trust-building communication |
| **Wallet & escrow** | Stabilize ASTRA wallet, escrow flow, transaction ledger display | Payment confidence |

**Expected Outcome**: Core marketplace functions work flawlessly end-to-end.

## Phase C — Investor Conversion Optimization (Weeks 9–14)

| Goal | Actions | Outcome |
|------|---------|---------|
| **Investor dashboard** | Consolidated portfolio view, ROI tracking, deal pipeline visualization | Single pane of glass for investors |
| **Deal room** | Streamline offer → negotiation → escrow → closing flow | Reduce deal cycle by 40% |
| **Smart CTAs** | Intent-scored inquiry prompts, trust popups, contextual signup triggers | Higher conversion rate |
| **AI recommendations** | Property matching via investor DNA profiles, behavioral scoring | Personalized deal flow |
| **Cross-border basics** | Multi-currency display, FX estimation, regional tax summaries | International investor readiness |

**Expected Outcome**: Measurable improvement in inquiry-to-deal conversion rate.

## Phase D — Scalable Intelligence Layer (Weeks 15–22)

| Goal | Actions | Outcome |
|------|---------|---------|
| **Market intelligence** | Live pricing models, area heat maps, trend forecasting | Data-driven investment decisions |
| **Copilot intelligence** | Admin AI copilot with live KPI injection, strategy recommendations | Autonomous marketplace operations |
| **Automated alerts** | Price change notifications, deal probability updates, market shift warnings | Proactive investor engagement |
| **Analytics warehouse** | Materialized views for reporting, event tracking consolidation | Scalable analytics infrastructure |

**Expected Outcome**: Platform generates proprietary intelligence that creates competitive moat.

## Phase E — Global Expansion Readiness (Weeks 23–30)

| Goal | Actions | Outcome |
|------|---------|---------|
| **Multi-country config** | Activate platform_countries framework, regional tax/legal models | Launch-ready for 2nd market |
| **Payment gateway routing** | Midtrans (Indonesia), Stripe (global), gateway routing profiles | Localized payment processing |
| **Localization** | i18n framework, RTL support prep, regional content management | Market-appropriate UX |
| **Fractional investment** | Feature-flagged fractional ownership, pooled escrow, unit tracking | New revenue stream |
| **API layer** | External API for partner integrations, data licensing prep | Platform economics |

**Expected Outcome**: Technical infrastructure supports multi-market operations.

---

# 2️⃣ BUILD PRIORITY MATRIX

## Critical Now (Phase A-B, Weeks 1–8)

| Feature | Business Impact | Complexity | Revenue Impact |
|---------|----------------|------------|----------------|
| Bundle size reduction | High — demo stability | Low | Indirect |
| Property search optimization | High — core UX | Medium | Direct |
| 3D viewer polish | High — differentiation | Medium | Direct |
| Agent CRM consolidation | High — agent retention | Medium | Direct |
| Wallet/escrow stability | Critical — trust | Medium | Direct |
| Error monitoring system | High — reliability | Low | Indirect |
| Router/hook consolidation | High — maintainability | Medium | Indirect |

## Build Next (Phase C, Weeks 9–14)

| Feature | Business Impact | Complexity | Revenue Impact |
|---------|----------------|------------|----------------|
| Investor portfolio dashboard | High | Medium | High |
| Deal room streamlining | High | Medium | High |
| Smart inquiry CTAs | Medium | Low | High |
| AI property recommendations | Medium | Medium | Medium |
| Cross-border currency display | Medium | Low | Medium |

## Later Stage (Phase D-E, Weeks 15–30)

| Feature | Business Impact | Complexity | Revenue Impact |
|---------|----------------|------------|----------------|
| Market intelligence engine | High | High | High |
| Admin AI copilot | Medium | High | Medium |
| Multi-country expansion | High | High | High |
| Fractional investment | Medium | High | High |
| External API layer | Medium | High | High |

## Freeze / Archive (Post-Funding)

| Feature | Reason |
|---------|--------|
| Blockchain/tokenization | Regulatory complexity, no immediate revenue |
| Autonomous acquisition engine | Speculative, requires massive data |
| Planetary/civilization modules | Already archived in Phase-1 |
| Browser-side ML (face-api) | Move inference server-side if needed |
| Hedge fund simulation | Niche, post-Series-A feature |

---

# 3️⃣ PLATFORM STABILIZATION PLAN

## Performance Governance

| Control | Implementation |
|---------|---------------|
| **Bundle budget** | Vite build warns if initial chunk > 300KB; CI blocks > 400KB |
| **Page weight limit** | New lazy chunk must be < 50KB compressed |
| **Dependency gate** | No new npm package without CTO approval; max 3 new deps/month |
| **Query performance** | All Supabase queries must complete in < 200ms; add `.limit()` to all list queries |
| **Re-render guard** | useMemo/useCallback on expensive computations; React DevTools profiling quarterly |

## Bundle Size Control

```
Current estimate: ~800KB initial
Target Phase A: < 350KB initial

Actions:
1. Remove @vladmandic/face-api (saves ~30MB from node_modules, reduces chunk)
2. Dynamic import Three.js only on /property/:id/immersive route
3. Dynamic import Mapbox only on /search and /map routes  
4. Dynamic import Recharts only on dashboard routes
5. Tree-shake lucide-react (import specific icons, not entire library)
6. Audit and remove unused shadcn components
```

## Dependency Discipline

```
APPROVED (no review needed):
- shadcn/ui components
- Utility < 10KB (date-fns, clsx, etc.)
- TanStack Query plugins

REQUIRES REVIEW:
- Any visualization library
- Any 3D/GL addition
- Any crypto/blockchain package

BANNED:
- Browser ML libraries (use edge functions)
- Alternative frameworks (Next.js, Vue, etc.)
- Duplicate utility libraries
```

## Database Query Optimization

```sql
-- Priority indexes to add:
CREATE INDEX idx_properties_status_city ON properties(status, city);
CREATE INDEX idx_properties_price_range ON properties(price, status) WHERE status = 'active';
CREATE INDEX idx_deals_status_updated ON deals(status, updated_at);
CREATE INDEX idx_investment_positions_user ON investment_positions(user_id, status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Query patterns to enforce:
-- Always use .limit() — default 50, max 100 for lists
-- Use .select('id, title, price, image') not .select('*')
-- Paginate with .range(from, to) for infinite scroll
-- Use count: 'exact' only when displaying total counts
```

## Monitoring & Alert Architecture

```
Layer 1: Client-side error boundary → logs to admin_alerts table
Layer 2: Edge function try/catch → logs failures with stack trace
Layer 3: Supabase dashboard → query performance monitoring
Layer 4: Admin panel → real-time alert feed with severity classification
Layer 5: Weekly automated health report (scheduled edge function)
```

---

# 4️⃣ CORE SYSTEM MODULES TO BUILD NEXT

## 1. Unified Property Intelligence Panel
**Why**: Single source of truth for property valuation, market context, and investment metrics on every listing page. Investors need data confidence before committing capital.

## 2. Streamlined Deal Orchestration Engine
**Why**: The offer → negotiation → escrow → closing pipeline is the revenue core. Reducing friction here directly increases transaction volume and platform commission.

## 3. Investor Portfolio Command Center
**Why**: Consolidated view of holdings, returns, deal pipeline, and watchlist. Investors who can track performance stay on-platform and increase deal frequency.

## 4. Agent Performance & CRM Dashboard
**Why**: Agents are the supply-side engine. Better tools = better agent retention = more listings = more investor activity. Network effect accelerator.

## 5. Smart Notification & Engagement Engine
**Why**: Automated, context-aware notifications (price drops, new matches, deal updates) keep users engaged without manual outreach. Reduces churn, increases DAU.

## 6. Market Intelligence Dashboard
**Why**: Area-level pricing trends, demand heatmaps, and forecasting create the data moat. This is what makes ASTRA a platform, not just a marketplace.

## 7. Trust & Verification System
**Why**: KYC status display, escrow protection badges, verified agent markers. In luxury real estate, trust is the conversion bottleneck. Visual trust signals reduce inquiry hesitation.

## 8. Cross-Border Investment Gateway
**Why**: International capital access multiplies total addressable market. Even basic multi-currency display and FX estimation opens global investor interest.

---

# 5️⃣ STARTUP SCALABILITY READINESS MODEL

## Stage 1 → Functional Product (Current → Month 3)

| Dimension | Requirement | Status |
|-----------|------------|--------|
| Core CRUD | Property listing, search, detail | ✅ Built |
| Auth & profiles | Email/social login, user profiles | ✅ Built |
| Basic transactions | Inquiry, offer, basic escrow | ⚠️ Needs polish |
| 3D viewer | Immersive property tours | ✅ Built |
| Admin panel | Content moderation, user management | ✅ Built |
| **Tech upgrades needed** | Bundle optimization, error monitoring, query indexing | 🔧 Phase A |

**Gate**: 10+ real listings, 50+ registered users, 0 critical bugs in demo flow.

## Stage 2 → Market Traction (Month 3–9)

| Dimension | Requirement |
|-----------|------------|
| Deal velocity | Full offer-to-close pipeline automated |
| Agent network | 20+ active agents with CRM tools |
| Investor activation | Portfolio tracking, ROI display, deal recommendations |
| Payment processing | Midtrans integration live, escrow automated |
| Data foundation | 500+ listings, behavioral tracking active |
| **Tech upgrades** | CDN for images, read replicas for search, real-time messaging stability |

**Gate**: $10K monthly GMV, 200+ active users, 5+ completed deals.

## Stage 3 → Regional Scale (Month 9–18)

| Dimension | Requirement |
|-----------|------------|
| Multi-city | 3+ cities with local agent networks |
| Market intelligence | Live pricing models, area comparisons |
| Institutional interest | Fund management tools, fractional basics |
| API layer | Partner integration endpoints |
| Compliance | Regional regulatory framework per market |
| **Tech upgrades** | Database partitioning, edge function consolidation into domain services, materialized views for analytics |

**Gate**: $100K monthly GMV, 2,000+ active users, 3+ city markets.

## Stage 4 → Global PropTech Platform (Month 18–36)

| Dimension | Requirement |
|-----------|------------|
| Multi-country | 3+ countries with localized operations |
| Cross-border deals | FX processing, international escrow |
| Data products | Market reports, API subscriptions |
| Fractional/tokenization | Regulated fractional ownership |
| Platform economics | Revenue from data + SaaS + commission |
| **Tech upgrades** | Multi-region Supabase deployment, global CDN, read replicas per region, event-driven microservices |

**Gate**: $1M monthly GMV, 20,000+ active users, institutional fund partnerships.

---

*Document Version: 1.0 | Generated: 2026-03-26 | Classification: CTO Execution Blueprint*
*Status: Ready for founder review and sprint planning*
