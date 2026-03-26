# ASTRA Villa — Founder Execution Playbook
## Operational Guide for Platform Stabilization & Scale | v1.0
## Date: 2026-03-26

---

# 1️⃣ DAILY FOUNDER ACTION SYSTEM

## Daily Routine (30 min total)

### Morning System Check (10 min) — Before 9 AM
```
□ Open Admin Dashboard → System Health panel
□ Check error alert count (target: 0 critical, < 5 warnings)
□ Check edge function failure rate (target: < 1%)
□ Verify preview site loads in < 3 seconds
□ Review overnight user signups and inquiries
□ Scan admin alerts for action-required items
```

### Midday Product Pulse (10 min) — 1 PM
```
□ Check active deal pipeline status (any stuck deals?)
□ Review agent response times to inquiries
□ Check messaging system delivery status
□ Verify wallet/escrow transactions processed correctly
□ Note any user-reported issues from support channels
```

### Evening Decision Log (10 min) — 6 PM
```
□ Log decisions made today in changelog
□ Flag any feature requests received → classify as Core / Later / Never
□ Review AI-generated code changes → approved or needs revision?
□ Update task board for tomorrow's priorities
□ Record one metric that improved and one that needs attention
```

## Weekly Routine

### Monday — Architecture Clarity Review (45 min)
```
□ Review current active page count (target: trending toward 80)
□ Review hook count (target: trending toward 80)
□ Check bundle size from last build (target: < 350KB initial)
□ Review any new dependencies added — were they approved?
□ Check for TypeScript build errors (tsc --noEmit)
□ Decision: What is the ONE feature priority this week?
```

### Wednesday — Performance & Data Review (30 min)
```
□ Review database query performance (any > 200ms?)
□ Check Supabase dashboard for storage usage growth
□ Review TanStack Query cache hit rates
□ Check real-time subscription count (too many = performance risk)
□ Verify lazy loading works on heavy routes (3D, Map, Charts)
```

### Friday — Product & Growth Review (30 min)
```
□ Count: new users, new listings, new inquiries, deals moved forward
□ Review investor funnel: views → signups → inquiries → offers
□ Check agent activity: listings posted, inquiries responded
□ Identify #1 conversion bottleneck this week
□ Set next week's single most important goal
```

## Monthly Routine

### Product Positioning Review (2 hours, 1st Monday)
```
□ Compare current feature set against core architecture blueprint
□ Audit: did any speculative features creep back in?
□ Review competitive landscape — any new proptech threats?
□ Update investor narrative if significant milestones achieved
□ Review and update feature flag states (promote, freeze, archive)
□ Performance budget audit: are we within targets?
```

## AI Development Supervision Process

### Before Any AI-Generated Feature
```
□ Does it fit within the 6 core product pillars?
□ Does it reuse existing domain hooks?
□ Bundle impact < 30KB?
□ Is it behind a feature flag if experimental?
□ No new npm dependencies without review?
→ If all YES: approve generation
→ If any NO: reject or redesign scope
```

### After AI-Generated Feature
```
□ Build passes without errors?
□ No new TypeScript warnings?
□ Preview loads and functions correctly?
□ No regression in existing features?
□ Code follows component reuse patterns?
→ If all YES: merge
→ If any NO: revert and iterate
```

---

# 2️⃣ SYSTEM CONTROL DASHBOARD LOGIC

## Dashboard Sections & Data Sources

### A. Platform Health Overview
| Metric | Source | Target | Alert Threshold |
|--------|--------|--------|-----------------|
| Active users (24h) | profiles + activity_logs | Growing | < previous week avg |
| Error rate | admin_alerts (type=error) | 0 critical | Any critical |
| Edge function success rate | edge function logs | > 99% | < 95% |
| API response time p95 | Supabase dashboard | < 200ms | > 500ms |
| Uptime | health check endpoint | 99.9% | < 99% |

### B. Feature Status Tracker
| Column | Purpose |
|--------|---------|
| Feature name | What it is |
| Lifecycle stage | Concept / Prototype / Beta / Production / Archived |
| Feature flag key | How to toggle it |
| Owner | Who is responsible |
| Last updated | Staleness detection |
| Performance impact | Low / Medium / High |

*Source: feature_flags table (to be created)*

### C. Performance Metrics
| Metric | How to Measure | Target |
|--------|---------------|--------|
| Initial bundle size | Vite build output | < 300KB |
| Largest lazy chunk | Vite build output | < 200KB |
| FCP | Lighthouse / Web Vitals | < 1.5s |
| TTI | Lighthouse / Web Vitals | < 3.0s |
| CLS | Web Vitals API | < 0.1 |
| Total active routes | Router config count | < 80 |
| Total active hooks | File system count | < 100 |

### D. Database Health
| Metric | Source | Target |
|--------|--------|--------|
| Table row counts | Supabase dashboard | Monitored |
| Slowest queries | pg_stat_statements | All < 200ms |
| Storage usage | Supabase storage API | < 80% quota |
| Active connections | Supabase dashboard | < 80% pool |
| RLS policy coverage | Database linter | 100% tables |

### E. Business Intelligence
| Metric | Why It Matters |
|--------|---------------|
| Listings added (week) | Supply growth |
| Inquiries sent (week) | Demand signal |
| Deals in pipeline | Revenue forecast |
| Signup → inquiry rate | Conversion health |
| Inquiry → offer rate | Deal funnel efficiency |
| Agent response time | Service quality |
| Wallet transaction volume | Payment system health |

### F. Risk Alerts
| Signal | Severity | Auto-Action |
|--------|----------|-------------|
| Build failure | Critical | Block deploy |
| Edge function error spike | High | Admin notification |
| Bundle size exceeded | Medium | Warning in dashboard |
| Unused dependency detected | Low | Weekly report |
| Database approaching limits | High | Admin notification |
| Security scan finding | Varies | Classified alert |

---

# 3️⃣ INVESTOR TECH POSITIONING FRAMEWORK

## The 60-Second Pitch (Technical)

> "ASTRA is a **real estate intelligence infrastructure** — not a listing portal. We combine immersive 3D property visualization with AI-driven investment analytics to transform how luxury real estate is discovered, evaluated, and transacted globally."

## Five Pillars of Technical Differentiation

### Pillar 1: Immersive-First Architecture
**What**: Three.js-powered 3D property tours, virtual staging, and digital twins built into the core platform — not bolted on.

**Why it matters**: 3-5x engagement versus photo galleries. Luxury buyers expect immersive experiences. This is our UX moat — competitors would need to rebuild their entire frontend to match.

**Proof point**: "Our 3D viewer renders at 60fps with < 3 second load time, supporting walk-through navigation, material switching, and virtual staging."

### Pillar 2: Compounding Data Intelligence
**What**: Every search, viewing, offer, and transaction feeds proprietary models that continuously improve pricing accuracy and deal matching.

**Why it matters**: The more users interact, the smarter the platform becomes. This creates a self-reinforcing data moat that compounds over time — late entrants can never catch up on data depth.

**Proof point**: "Our AI scoring engine processes investor behavior profiles across 30+ signals to match properties with 85%+ relevance accuracy."

### Pillar 3: Modular Global Architecture
**What**: Domain-isolated services (property, deal, investor, market) with regional configuration framework supporting multi-country deployment without codebase fragmentation.

**Why it matters**: We can launch in a new country by configuring tax models, currencies, and regulatory rules — not by rebuilding the platform.

**Proof point**: "Our platform_countries configuration framework manages jurisdiction-specific settings, FX conversion, and localized payment routing."

### Pillar 4: AI-Accelerated Development
**What**: AI-assisted code generation with governance framework — architecture review gates, performance budgets, dependency discipline.

**Why it matters**: 10x feature velocity versus traditional engineering teams, while maintaining institutional-grade code quality through automated guardrails.

**Proof point**: "We ship features 10x faster with a governance framework that enforces < 300KB bundle budgets and mandatory architecture review before every merge."

### Pillar 5: Transaction Infrastructure
**What**: Full deal orchestration from discovery through escrow settlement, with smart contract logic, multi-currency support, and regulatory compliance built in.

**Why it matters**: We don't just list properties — we close deals. End-to-end transaction capability means we capture commission revenue, not just advertising fees.

**Proof point**: "Our escrow system processes secure transactions with automated settlement, multi-currency support, and complete audit trails."

## Milestone Framework for Investors

| Milestone | Metric | Timeline | What It Proves |
|-----------|--------|----------|---------------|
| Platform stable | 0 critical bugs, < 3s load | Month 1 | Technical competence |
| First 10 deals | Completed transactions | Month 3 | Product-market fit |
| Agent network | 20+ active agents | Month 4 | Supply-side traction |
| 500 listings | Active property inventory | Month 6 | Marketplace liquidity |
| $100K GMV | Monthly transaction volume | Month 9 | Revenue validation |
| 2nd city launch | Multi-market operations | Month 12 | Scalability proof |
| Institutional interest | Fund partnership signed | Month 15 | Market positioning |
| $1M GMV | Monthly transaction volume | Month 18 | Growth trajectory |

---

# 4️⃣ PRODUCT FOCUS LOCK STRATEGY

## Core Feature Boundary — The "Iron Ring"

These features are CORE. They get priority resources, bug fixes within 24 hours, and performance optimization first:

```
┌─────────────────────────────────────────────┐
│              THE IRON RING                  │
│                                             │
│  1. Property listing & search               │
│  2. 3D immersive viewer                     │
│  3. User authentication & profiles          │
│  4. Investor portfolio & watchlist           │
│  5. Deal room (offer → escrow → close)      │
│  6. Messaging & notifications               │
│  7. Agent CRM & dashboard                   │
│  8. Admin operations panel                  │
│  9. Wallet & payment processing             │
│ 10. Map-based property discovery            │
│                                             │
│  RULE: Nothing enters this ring without     │
│  removing something or proving 10x impact.  │
└─────────────────────────────────────────────┘
```

## Expansion Timing Rules

### The "3 Gates" Before Any New Feature

```
Gate 1: REVENUE GATE
  → Will this feature generate or protect revenue within 90 days?
  → If NO → freeze it.

Gate 2: STABILITY GATE
  → Is the current platform stable? (0 critical bugs, bundle < target)
  → If NO → fix stability first, no new features.

Gate 3: CAPACITY GATE
  → Can we build this without degrading existing core features?
  → If NO → defer until capacity exists.

ALL THREE gates must pass before building anything new.
```

### Expansion Timing Calendar

| Period | Rule |
|--------|------|
| Weeks 1–8 | NO new features. Stabilize and polish only. |
| Weeks 9–14 | ONE new module per sprint, behind feature flag. |
| Weeks 15–22 | Controlled expansion with performance budget enforcement. |
| Week 23+ | Feature additions tied to market expansion plan. |

## Experimental Feature Sandboxing

```
Every experimental feature MUST:

1. Have a feature_flags entry with lifecycle_stage = 'prototype'
2. Be accessible only to admin role initially
3. Lazy-load in a separate chunk (no impact on core bundle)
4. Have a defined "promote or kill" deadline (max 30 days)
5. Include rollback plan (archive path documented)

If not promoted to beta within 30 days → auto-archive.
```

## Performance-First Decision Philosophy

### The Decision Hierarchy
```
When conflicts arise, this is the priority order:

1. STABILITY     — Does it work reliably?
2. PERFORMANCE   — Does it load fast?
3. USABILITY     — Can users complete their task?
4. AESTHETICS    — Does it look premium?
5. FEATURES      — Does it do more things?

Never sacrifice a higher-priority item for a lower one.
Example: Never add a feature that breaks performance.
Example: Never add animation that hurts usability.
```

## Avoiding Future Architecture Chaos

### The "5 Never" Rules
```
1. NEVER add a speculative page without a feature flag
2. NEVER create a new hook when an existing domain hook can be extended
3. NEVER add a new npm dependency without checking bundle impact
4. NEVER create a new edge function when an existing domain service covers it
5. NEVER skip the build check after any code change
```

### Architecture Chaos Early Warning Signs
```
⚠️ More than 100 active routes → consolidation needed
⚠️ More than 120 hooks → domain merge needed
⚠️ Bundle size > 400KB → dependency audit needed
⚠️ More than 30 edge functions → service consolidation needed
⚠️ Build time > 60 seconds → code splitting review needed
⚠️ TypeScript errors > 0 → stop features, fix types
```

### Monthly Architecture Health Score
```
Score each 1-5, total /25:

1. Bundle size vs target        ___/5
2. Active route count vs target ___/5
3. Build error count (0 = 5)    ___/5
4. Core feature stability       ___/5
5. Performance metrics vs target ___/5

Score 20+  → GREEN: continue building
Score 15-19 → YELLOW: stabilize before adding
Score < 15 → RED: freeze all features, fix architecture
```

---

*Document Version: 1.0 | Generated: 2026-03-26*
*Status: Ready for daily operational use*
*Review cadence: Monthly update recommended*
