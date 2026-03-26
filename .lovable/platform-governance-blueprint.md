# ASTRA Villa — Platform Governance Blueprint
## Long-Term Operating Strategy & Evolution Model | v1.0
## Date: 2026-03-26

---

# 1️⃣ PLATFORM EVOLUTION CONTROL MODEL

## Feature Lifecycle Stages

```
┌───────────┐    ┌───────────┐    ┌──────────┐    ┌──────┐    ┌────────────┐    ┌──────────┐
│  CONCEPT  │───►│ PROTOTYPE │───►│ EVALUATE │───►│ BETA │───►│ PRODUCTION │───►│ ARCHIVE  │
│           │    │           │    │          │    │      │    │            │    │          │
│ Idea doc  │    │ Feature-  │    │ Perf +   │    │ 10%  │    │ 100%       │    │ Retired  │
│ + sponsor │    │ flagged   │    │ business │    │ users│    │ rollout    │    │ to       │
│           │    │ admin-only│    │ review   │    │      │    │            │    │ _archived│
└───────────┘    └───────────┘    └──────────┘    └──────┘    └────────────┘    └──────────┘
     Gate 1           Gate 2          Gate 3        Gate 4         Gate 5          Gate 6
```

### Gate 1: Concept → Prototype
| Checkpoint | Criteria |
|-----------|---------|
| Pillar alignment | Fits within 6 core product pillars |
| Revenue signal | Revenue impact within 90 days or strategic moat value |
| Sponsor | Named owner responsible for the feature |
| No duplication | No existing component solves >70% of the need |
| **Approval**: Product lead sign-off |

### Gate 2: Prototype → Evaluate
| Checkpoint | Criteria |
|-----------|---------|
| Working code | Functional behind feature flag, admin-only |
| Component reuse | Uses existing shadcn/domain components where possible |
| No new dependencies | Or dependency approved through review |
| Chunk isolation | Lazy-loaded, not in main bundle |
| **Approval**: Tech lead review |

### Gate 3: Evaluate → Beta
| Checkpoint | Criteria |
|-----------|---------|
| Bundle impact | < 30KB compressed addition |
| No performance regression | FCP unchanged, TTI delta < 200ms |
| Database impact | Queries < 200ms, no N+1 patterns |
| Error-free build | tsc --noEmit passes, 0 warnings |
| Business case validated | Internal testing confirms user value |
| **Approval**: CTO + Product lead |

### Gate 4: Beta → Production
| Checkpoint | Criteria |
|-----------|---------|
| User feedback | Positive signal from beta cohort |
| Stability | 14 days with 0 errors in production beta |
| Performance sustained | Core Web Vitals unchanged |
| Documentation | Usage guide and rollback plan exist |
| **Approval**: CTO sign-off |

### Gate 5: Production → Archive
| Checkpoint | Criteria |
|-----------|---------|
| Usage decline | < 5% of users interact for 60+ days |
| Revenue impact | Zero or negative ROI |
| Maintenance cost | Bug fixes exceed feature value |
| **Action**: Move to src/_archived/, remove from router, exclude from build |

---

# 2️⃣ TECHNICAL STABILITY GOVERNANCE

## Measurable Thresholds

### Bundle Size Governance
| Rule | Threshold | Enforcement |
|------|-----------|-------------|
| Initial bundle maximum | 300KB compressed | Build-time warning |
| Hard limit (block deploy) | 400KB compressed | CI gate |
| Per-feature addition limit | 30KB compressed | PR review check |
| Largest lazy chunk | 200KB compressed | Vite config alert |
| Total lazy chunks combined | 1.2MB compressed | Monthly audit |

### Dependency Rules
| Category | Policy | Max per quarter |
|----------|--------|-----------------|
| UI primitives (shadcn) | Auto-approved | Unlimited |
| Utilities < 10KB | Auto-approved | 5 |
| Visualization libraries | Lazy-load required, review | 1 |
| 3D/GL additions | Must stay in viewer chunk | 1 |
| Browser ML | Rejected — use edge functions | 0 |
| New frameworks | Rejected | 0 |

### Performance Regression Detection
| Metric | Baseline | Yellow Alert | Red Alert |
|--------|----------|--------------|-----------|
| FCP | < 1.5s | > 2.0s | > 3.0s |
| TTI | < 3.0s | > 3.5s | > 5.0s |
| CLS | < 0.05 | > 0.1 | > 0.25 |
| Build time | < 30s | > 45s | > 90s |
| TypeScript errors | 0 | 1-5 | > 5 |

### Database Scaling Indicators
| Indicator | Monitor | Action Trigger |
|-----------|---------|----------------|
| Total rows (largest table) | Weekly | > 500K → add indexes review |
| Query p95 latency | Daily | > 200ms → optimize query |
| Connection pool usage | Daily | > 70% → review subscriptions |
| Storage size | Weekly | > 5GB → archive strategy |
| Realtime subscriptions | Daily | > 50 concurrent → audit necessity |

### 3D Engine Resource Rules
| Rule | Threshold |
|------|-----------|
| Three.js chunk must lazy-load | Only on /property/:id/immersive |
| Max scene polygon count | 500K triangles |
| Texture resolution cap | 2048x2048 max |
| Auto-dispose on route exit | Mandatory — geometries, materials, textures |
| Fallback for low-end devices | Static image gallery if WebGL unavailable |
| GPU memory target | < 256MB |

---

# 3️⃣ PRODUCT EXPANSION DECISION ENGINE

## Expansion Decision Matrix

### New AI Capabilities
| Signal | Readiness Indicator | Minimum Threshold |
|--------|--------------------|--------------------|
| Data volume | Training data available | > 10K property records |
| User demand | Feature requested by users | > 20% of active users |
| Revenue path | Clear monetization model | Projected ROI > 3x cost |
| Infrastructure | Edge function capacity | < 60% current utilization |
| Competitive gap | Competitors don't offer it | Verified market gap |
| **Decision**: Expand when 4/5 signals are green |

### Blockchain / Tokenization
| Signal | Readiness Indicator | Minimum Threshold |
|--------|--------------------|--------------------|
| Regulatory clarity | Legal framework exists | Licensed or sandbox approved |
| Transaction volume | Platform deal flow | > $1M monthly GMV |
| Investor demand | Institutional interest confirmed | 3+ institutional partners |
| Technical maturity | Core platform stable | Stability score > 20/25 |
| Market timing | Industry adoption curve | Early majority phase |
| **Decision**: Expand only when ALL 5 signals are green |

### Market Intelligence Systems
| Signal | Readiness Indicator | Minimum Threshold |
|--------|--------------------|--------------------|
| Data depth | Historical pricing data | > 12 months, > 5K data points |
| Model accuracy | Prediction validation | MAE < 10% on test set |
| User willingness to pay | Pricing research | > 30% would pay premium |
| Competitive advantage | Unique data sources | ≥ 2 proprietary data streams |
| **Decision**: Expand when 3/4 signals are green |

### Global Multi-Region
| Signal | Readiness Indicator | Minimum Threshold |
|--------|--------------------|--------------------|
| Home market dominance | Market share in primary city | > 15% of luxury segment |
| Operational playbook | Repeatable launch process | 2+ successful city launches |
| Capital available | Funding runway | > 18 months at expanded burn |
| Local partnerships | Agent/developer network | 5+ confirmed partners in target |
| Regulatory clearance | Legal entity and compliance | Approved or in progress |
| **Decision**: Expand when 4/5 signals are green |

---

# 4️⃣ FOUNDER STRATEGIC CONTROL DASHBOARD

## Five Strategic Indicators

### A. Platform Complexity Index (PCI)
```
PCI = (active_routes × 0.3) + (active_hooks × 0.2) + (edge_functions × 0.3) + (npm_deps × 0.2)

Normalized to 0-100 scale:
- Routes: target 60, max 120 (score = routes/120 × 30)
- Hooks: target 80, max 200 (score = hooks/200 × 20)  
- Edge functions: target 25, max 50 (score = functions/50 × 30)
- Dependencies: target 40, max 80 (score = deps/80 × 20)

Interpretation:
< 40  → LEAN: healthy, room for growth
40-60 → BALANCED: monitor closely
60-80 → HEAVY: consolidation needed
> 80  → CRITICAL: freeze features, slim down
```

### B. Feature Activation Ratio (FAR)
```
FAR = (features in Production stage) / (total features including archived)

Target: > 0.7 (70% of all built features are active and used)

If FAR < 0.5 → too much speculative building
If FAR < 0.3 → architecture chaos warning
```

### C. Investor Demo Readiness Score (IDRS)
```
Score each 1-10:

1. Landing page loads < 2s                    ___/10
2. Property search returns results instantly  ___/10
3. 3D viewer launches without errors          ___/10
4. Deal flow demo works end-to-end            ___/10
5. Portfolio dashboard shows real data        ___/10
6. No visible errors in console               ___/10
7. Mobile responsive and functional           ___/10
8. Professional visual design quality         ___/10

IDRS = total / 80 × 100

> 85% → DEMO READY
70-85% → NEEDS POLISH
< 70% → NOT READY — fix before any demo
```

### D. Performance Stability Trend (PST)
```
Track weekly over 4 weeks:

Week  | Bundle KB | FCP (s) | Errors | Build OK
  1   |    ___    |  ___    |  ___   |  Y/N
  2   |    ___    |  ___    |  ___   |  Y/N
  3   |    ___    |  ___    |  ___   |  Y/N
  4   |    ___    |  ___    |  ___   |  Y/N

Trend: IMPROVING / STABLE / DECLINING

If DECLINING for 2+ consecutive weeks → feature freeze
```

### E. Scalability Confidence Indicator (SCI)
```
Score each 1-5:

1. Database can handle 10x current load       ___/5
2. Edge functions handle concurrent requests   ___/5
3. Frontend handles 1000+ listings on map      ___/5
4. Auth system supports 10K+ users             ___/5
5. File storage within 50% of quota            ___/5
6. Codebase maintainable by new developer      ___/5

SCI = total / 30 × 100

> 80% → SCALE READY
60-80% → PREPARE for scaling
< 60% → SCALING RISK — optimize first
```

## Dashboard Summary View
```
┌─────────────────────────────────────────────┐
│         ASTRA STRATEGIC CONTROL             │
├─────────────────────────────────────────────┤
│  Complexity Index      [████░░░░░░]  42/100 │
│  Feature Activation    [███████░░░]  72%    │
│  Demo Readiness        [████████░░]  81%    │
│  Performance Trend     → STABLE             │
│  Scalability Score     [██████░░░░]  63%    │
│                                             │
│  Overall Health: 🟡 BALANCED                │
│  Recommendation: Polish core, defer new     │
└─────────────────────────────────────────────┘
```

---

# 5️⃣ LONG-TERM PLATFORM VISION ALIGNMENT

## Evolution Stages

```
STAGE 1 (Now → Month 12)
Luxury Immersive Property Platform
         │
         ▼
STAGE 2 (Month 12 → Month 24)
Intelligent Real Estate Operating System
         │
         ▼
STAGE 3 (Month 24 → Month 48)
Global Digital Asset Property Network
```

### Stage 1: Luxury Immersive Property Platform

**Focus**: Best-in-class property discovery and transaction experience for luxury market.

| Technical Component | Implementation |
|--------------------|----------------|
| Core marketplace | Property CRUD, search, filtering, map-based discovery |
| Immersive engine | Three.js 3D tours, virtual staging, photo galleries |
| Transaction layer | Offer management, escrow, multi-currency basics |
| Agent tools | CRM, lead management, listing management |
| Investor basics | Portfolio view, watchlist, ROI display |
| AI layer | Property recommendations, pricing estimates |

**Revenue**: Listing fees + transaction commission
**Technical milestone**: < 3s load, 0 critical bugs, 500+ listings

### Stage 2: Intelligent Real Estate Operating System

**Focus**: Data-driven operations that make the platform indispensable for market participants.

| Technical Component | Upgrade From Stage 1 |
|--------------------|---------------------|
| Market intelligence | Pricing models, trend forecasting, area heat maps |
| Autonomous operations | Copilot intelligence for admins, automated alerts |
| Investor matching | DNA profiling, behavioral scoring, deal flow personalization |
| Agent performance | Predictive lead scoring, automated follow-ups |
| API platform | Partner integrations, data subscriptions |
| Advanced analytics | Materialized views, real-time dashboards |

**Technical transitions**:
- Add materialized views and pg_cron for analytics aggregation
- Implement event-driven architecture with ai_event_signals bus
- Build external API layer for partner integrations
- Introduce read replicas for heavy analytical queries

**Revenue**: Commission + SaaS subscriptions + data products
**Technical milestone**: $100K monthly GMV, API partnerships, <100ms query p95

### Stage 3: Global Digital Asset Property Network

**Focus**: Platform becomes infrastructure layer that other applications build upon.

| Technical Component | Upgrade From Stage 2 |
|--------------------|---------------------|
| Multi-region deployment | Supabase in multiple regions, global CDN |
| Fractional ownership | Regulated tokenized property shares |
| Cross-border settlement | International escrow, FX automation |
| Data marketplace | Proprietary market data licensing |
| Developer platform | SDK, webhooks, embedded widgets |
| Institutional tools | Fund management, REIT structures |

**Technical transitions**:
- Multi-region Supabase with geo-routing
- Event-driven microservices for cross-border settlement
- Regulatory compliance engine per jurisdiction
- High-frequency data pipeline for institutional analytics
- SDK and widget library for partner embedding

**Revenue**: Commission + SaaS + Data licensing + API fees + Institutional services
**Technical milestone**: 3+ countries, institutional fund partners, regulated fractional trading

## Technical Transition Map

| Capability | Stage 1 | Stage 2 | Stage 3 |
|-----------|---------|---------|---------|
| Database | Single Supabase instance | + Read replicas, materialized views | Multi-region, partitioned |
| Compute | Edge functions | + Scheduled jobs, event bus | + Microservices, queues |
| Storage | Single bucket | + CDN, image optimization | + Multi-region, archival tiers |
| Auth | Email + social | + KYC, institutional profiles | + Multi-factor, regulatory compliance |
| AI | Recommendations, pricing | + Forecasting, autonomous ops | + Institutional analytics, API |
| Frontend | Monolithic React SPA | + Module federation prep | + Micro-frontends, SDK |
| Data | Transactional only | + Analytics warehouse | + Data products, licensing |

---

*Document Version: 1.0 | Generated: 2026-03-26*
*Classification: Strategic Governance — Permanent Reference*
*Review cadence: Quarterly alignment review recommended*
