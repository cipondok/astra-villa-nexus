# ASTRA Villa — Success Metrics & Performance Measurement Framework

> Transform platform management from intuition-driven decisions into data-driven execution.

---

## Dashboard Philosophy

Every metric must answer one question: **"Are we winning?"**

Metrics are organized into **6 categories** mapped to the platform's strategic pillars. Each category has **North Star metrics** (reviewed daily), **Health indicators** (reviewed weekly), and **Deep diagnostics** (reviewed monthly).

**Traffic Light System**:
- 🟢 **On Track**: Meeting or exceeding target
- 🟡 **Watch**: Within 80% of target — needs attention
- 🔴 **Alert**: Below 80% of target — requires immediate action

---

## Category 1 — Marketplace Supply Metrics

> Measure platform inventory power and supply-side network effects.

### North Star: Total Active Listings

| Metric | Data Source | Query Pattern | Month 3 | Month 6 | Month 12 |
|--------|------------|---------------|---------|---------|----------|
| **Total active listings** | `properties` WHERE status='active' | `usePlatformStats.activeProperties` | 5,000 | 25,000 | 100,000 |
| New listings/week | `properties` created_at >= 7d ago | `usePlatformStats.newPropertiesWeek` | 200 | 1,000 | 4,000 |
| Listing activation rate | New listings → active within 48h | Custom query | 70% | 80% | 90% |

### Health Indicators

| Metric | Source Table | Target |
|--------|-------------|--------|
| Active developer project launches | `properties` with developer metadata | 10/month → 50/month |
| Service providers onboarded | `vendor_business_profiles` count | 50 → 500 |
| Active service providers (30d) | Vendors with activity in 30 days | 60% of total |
| Geographic coverage (cities) | Distinct cities in `properties` | 15 → 38 provinces |
| Listing quality score (avg) | `property_seo_analysis.seo_score` avg | 60 → 80 |
| Photo completeness rate | Properties with ≥5 images | 50% → 85% |
| Stale listing rate | Active listings with no update >90d | <15% |

### Deep Diagnostics (Monthly)

| Diagnostic | Purpose |
|------------|---------|
| Supply concentration by city | Identify over/under-served markets |
| Listing type distribution | Balance rent vs. sale vs. new project |
| Price range coverage gaps | Ensure inventory across all price segments |
| Developer vs. agent vs. owner ratio | Track supply source diversification |
| Time-to-first-inquiry by listing | Measure listing attractiveness |

### Data Sources & Hooks
```
usePlatformStats       → totalProperties, activeProperties, newPropertiesWeek
usePlatformHealth      → totalProperties (active)
useCustomPeriodKPIs    → newProperties (with sparkline)
useAISystemHealth      → coverage_rate, scored_listings
```

---

## Category 2 — Investor Demand Metrics

> Measure demand-side traction and habit formation.

### North Star: Weekly Active Investors (WAI)

| Metric | Data Source | Month 3 | Month 6 | Month 12 |
|--------|------------|---------|---------|----------|
| **Weekly active investors** | `activity_logs` distinct users (7d) | 500 | 3,000 | 15,000 |
| New registrations/week | `profiles` created_at >= 7d | 100 | 500 | 2,000 |
| DAU/MAU ratio | Daily vs monthly active | 15% | 25% | 35% |

### Health Indicators

| Metric | Source | Target |
|--------|--------|--------|
| Watchlist saves/week | `user_favorites` created (7d) | 200 → 5,000 |
| Property inquiry rate | Inquiries / listing views | 3% → 8% |
| Inquiry → viewing conversion | Viewing bookings / inquiries | 10% → 25% |
| Repeat session frequency | Avg sessions/user/week | 1.5 → 3.5 |
| Session duration (avg) | `user_sessions` duration | 4min → 8min |
| AI query usage rate | `ai_property_queries` / active users | 0.5 → 2.0/user/week |
| Push notification open rate | Notification engagement | 15% → 30% |
| Onboarding completion rate | Profile + preferences completed | 40% → 75% |

### Deep Diagnostics (Monthly)

| Diagnostic | Purpose |
|------------|---------|
| User cohort retention curves | Week 1, 4, 8, 12 retention |
| Activation funnel drop-offs | Register → profile → first search → first save → first inquiry |
| Power user identification | Top 10% by engagement patterns |
| Geographic demand distribution | Where are investors searching? |
| Search query analysis | What are investors looking for vs. what we have? |

### Demand-Supply Health Index
```
DSI = (Weekly Inquiries / Active Listings) × 100

Healthy:   DSI 5–15 (balanced marketplace)
Oversupply: DSI < 3 (need more demand)
Undersupply: DSI > 20 (need more listings)
```

---

## Category 3 — AI Intelligence Performance Metrics

> Validate platform intelligence credibility and competitive moat.

### North Star: AI Accuracy Composite Score

| Metric | Calculation | Month 3 | Month 6 | Month 12 |
|--------|------------|---------|---------|----------|
| **AI Composite Accuracy** | Weighted avg of sub-scores | 65% | 78% | 88% |
| Deal detection precision | True deals / flagged deals | 60% | 75% | 85% |
| Price forecast accuracy | Actual vs predicted (±10%) | 55% | 70% | 85% |

### Intelligence Sub-Scores

| Metric | Weight | Source | Measurement Method |
|--------|--------|--------|-------------------|
| Elite deal detection accuracy | 25% | `deal_score_results` | Flagged deals that sell within 30d at ≥90% of asking |
| Opportunity score success ratio | 25% | `ai_opportunity_scores` | High-scored properties with positive ROI at exit |
| Price forecast accuracy | 20% | `property_valuations` | Predicted vs actual transaction price (±10% band) |
| Market heat trend correctness | 15% | `market_clusters` | Predicted heat direction vs actual 90-day outcome |
| Recommendation adoption rate | 15% | `ai_property_queries` | User action taken on AI suggestions |

### System Health Indicators

| Metric | Source | Target |
|--------|--------|--------|
| AI coverage rate | `useAISystemHealth.coverage_rate` | 85% → 98% |
| Scoring freshness | `useAISystemHealth.freshness_state` | FRESH (always) |
| AI job success rate | `usePlatformHealth.jobFailureRate` | <5% failure |
| Avg scoring latency | `ai_jobs` processing time | <30s per property |
| Model retraining frequency | Self-learning loop cycle | Weekly → Daily |

### AI Trust Score (User-Facing)
```
Trust Score = (
  Deal Accuracy × 0.3 +
  Price Accuracy × 0.3 +
  Recommendation Adoption × 0.2 +
  System Uptime × 0.2
) × 100

Display: "AI Confidence: 82%" on investor dashboard
Target: Maintain ≥75% to preserve user trust
```

---

## Category 4 — Revenue & Monetization Metrics

> Measure business viability and scaling readiness.

### North Star: Monthly Recurring Revenue (MRR)

| Metric | Source | Month 3 | Month 6 | Month 12 |
|--------|--------|---------|---------|----------|
| **MRR (IDR)** | Subscription + recurring | 5M | 50M | 300M |
| ARR run rate | MRR × 12 | 60M | 600M | 3.6B |
| Revenue growth rate (MoM) | Month-over-month | 30% | 25% | 20% |

### Revenue Stream Breakdown

| Stream | Source Table | Month 6 Target | Month 12 Target |
|--------|-------------|----------------|-----------------|
| Property sale commissions | Transaction records | IDR 100M | IDR 500M |
| Rental commissions | Transaction records | IDR 30M | IDR 150M |
| Premium subscriptions | `user_subscriptions` | IDR 25M | IDR 200M |
| Service marketplace fees | `vendor_services` transactions | IDR 10M | IDR 80M |
| Developer JV packages | Custom agreements | IDR 50M | IDR 300M |
| Advertising / featured listings | `acquisition_analytics` | IDR 5M | IDR 50M |

### Unit Economics

| Metric | Calculation | Target |
|--------|------------|--------|
| Customer Acquisition Cost (CAC) | Total marketing spend / new users | <IDR 50K |
| Lifetime Value (LTV) | Avg revenue/user × avg lifespan | IDR 600K+ |
| LTV:CAC ratio | LTV / CAC | 12:1+ |
| Average Revenue Per User (ARPU) | Total revenue / active users | IDR 15K → 50K/month |
| Payback period | CAC / monthly ARPU | <4 months |
| Gross margin | (Revenue - COGS) / Revenue | 75%+ |

### Subscription Funnel

```
Free Users → Trial Activation → Gold → Platinum → Diamond

Conversion targets:
  Free → Gold:     5% (Month 6) → 10% (Month 12)
  Gold → Platinum:  15% → 25%
  Platinum → Diamond: 8% → 15%
  Monthly churn:    <5% (Gold), <3% (Platinum), <2% (Diamond)
```

---

## Category 5 — Portfolio Outcome Metrics (Investor Success)

> Ensure platform delivers real financial value to investors.

### North Star: Average Investor ROI Improvement

| Metric | Measurement | Month 6 | Month 12 |
|--------|-------------|---------|----------|
| **ROI improvement vs. market avg** | Platform investor returns vs. regional benchmark | +5% | +12% |
| Successful exits facilitated | Properties sold at profit through platform | 20 | 200 |
| Avg holding period optimization | AI-recommended vs. actual exit timing | 15% faster | 25% faster |

### Investor Success Indicators

| Metric | Source | Target |
|--------|--------|--------|
| Rental yield vs forecast accuracy | Actual rental / predicted rental | ±8% variance |
| Portfolio diversification score | Allocation intelligence metrics | 70+ avg score |
| Risk alert response rate | Users acting on risk warnings | 40% → 65% |
| Capital appreciation tracking | Property value change over time | +8% annual avg |
| Deal alert conversion | Alerts → property acquired | 5% → 15% |

### Investor Satisfaction Tracking

| Metric | Source | Target |
|--------|--------|--------|
| Investor NPS | Quarterly survey | 40 → 60 |
| Platform recommendation rate | Survey + referral data | 30% → 50% |
| Support ticket resolution time | `support_tickets` avg close time | <24h → <4h |
| Feature satisfaction score | In-app feedback | 4.0 → 4.5 / 5.0 |

### Success Story Pipeline
```
Track monthly:
- Number of investors with >15% annual ROI
- Number of investors who found deals via AI alerts
- Number of investors who avoided losses via risk warnings
- Testimonials collected for marketing use
```

---

## Category 6 — Platform Growth Momentum Signals

> Track strategic scaling health and market position.

### North Star: Monthly Platform Growth Rate

| Metric | Calculation | Month 3 | Month 6 | Month 12 |
|--------|------------|---------|---------|----------|
| **Compound monthly growth rate** | (Current MAU / Previous MAU) - 1 | 25% | 30% | 20% |
| Market share (target cities) | Our listings / total market listings | 2% | 8% | 20% |

### Expansion Milestones

| Milestone | Timeline | Status Indicator |
|-----------|----------|-----------------|
| Jakarta dominant (>10K listings) | Month 6 | 🟢 / 🟡 / 🔴 |
| Bali coverage (>5K listings) | Month 8 | 🟢 / 🟡 / 🔴 |
| 10 cities with >1K listings | Month 12 | 🟢 / 🟡 / 🔴 |
| 38 province presence | Month 18 | 🟢 / 🟡 / 🔴 |
| First international market | Month 24 | 🟢 / 🟡 / 🔴 |

### Network Effects Health

| Metric | Source | Target |
|--------|--------|--------|
| Developer partnership pipeline | `agent_acquisition_pipeline` | 20 → 100 active |
| Agent activation rate | Registered → first listing | 30% → 60% |
| Investor retention (30-day) | Cohort analysis | 40% → 65% |
| Investor retention (90-day) | Cohort analysis | 20% → 45% |
| Referral-driven acquisition | `acquisition_referrals` / total signups | 10% → 30% |
| Viral coefficient (K-factor) | Invites sent × conversion rate | 0.3 → 0.8 |
| Organic traffic share | SEO-driven / total traffic | 20% → 50% |

### Competitive Moat Indicators

| Signal | Measurement | Strength |
|--------|-------------|----------|
| Data advantage | Unique data points not available elsewhere | Growing |
| AI accuracy gap | Our accuracy vs. manual analysis | Widening |
| Switching cost | Avg investor portfolio value on platform | Increasing |
| Brand recognition | Branded search volume trend | Rising |
| Developer exclusivity | % of JV projects exclusive to platform | 5% → 25% |

---

## Executive Dashboard Layout

### Daily View (Founder Morning Check)
```
┌─────────────────────────────────────────────────────┐
│  ASTRA Villa — Daily Pulse                          │
├──────────────┬──────────────┬───────────────────────┤
│ 🏠 Listings  │ 👥 Users     │ 💰 Revenue            │
│ Active: 24K  │ DAU: 3,200   │ Today: IDR 12.5M     │
│ New (24h):+85│ New (24h):+42│ MRR: IDR 180M        │
│ Trend: 🟢↑   │ Trend: 🟢↑   │ Trend: 🟢↑            │
├──────────────┼──────────────┼───────────────────────┤
│ 🤖 AI Health │ 📊 Quality   │ 🚨 Alerts             │
│ Accuracy: 82%│ Avg SEO: 74  │ Critical: 0          │
│ Coverage: 96%│ Photos: 78%  │ Open tickets: 12     │
│ Status: 🟢   │ Status: 🟢   │ Status: 🟢            │
└──────────────┴──────────────┴───────────────────────┘
```

### Weekly View (Leadership Review)
```
┌─────────────────────────────────────────────────────┐
│  Weekly Growth Summary                              │
├─────────────────────────────────────────────────────┤
│ Supply:  +580 listings (+12% WoW)          🟢       │
│ Demand:  +320 investors (+8% WoW)          🟡       │
│ AI:      82% accuracy (target: 80%)        🟢       │
│ Revenue: IDR 45M (+15% WoW)               🟢       │
│ Retention: 58% 30-day                      🟡       │
│ Referrals: 18% of signups                  🟡       │
├─────────────────────────────────────────────────────┤
│ Top Actions This Week:                              │
│ 1. Fix demand gap in Surabaya (DSI: 2.1)           │
│ 2. Improve onboarding completion (currently 52%)    │
│ 3. Follow up with 3 developer leads                │
└─────────────────────────────────────────────────────┘
```

### Monthly View (Strategic Review)
```
Full category breakdown with:
- Sparkline trends for all North Stars
- Cohort retention waterfall
- Revenue stream pie chart
- City-by-city expansion heatmap
- AI accuracy trend over time
- Competitor position mapping
```

---

## Implementation Priority

### Phase 1 — Available Now (existing hooks)
These metrics can be displayed immediately using current data:
- Total/active listings, new listings/week
- User counts, activity metrics
- AI system health, job success rates
- Platform health subsystems

### Phase 2 — Needs Tracking Infrastructure (Month 1–2)
- Inquiry → viewing → transaction conversion funnel
- Revenue event tracking per stream
- Cohort retention calculation
- Deal detection accuracy validation loop

### Phase 3 — Needs Analytics Pipeline (Month 3–6)
- Price forecast accuracy backtesting
- ROI improvement measurement
- Market share estimation
- Competitive benchmarking
- Investor success story tracking

---

## Metric Review Cadence

| Cadence | Who | Metrics | Duration |
|---------|-----|---------|----------|
| Daily | Founder | North Stars (6 metrics) | 15 min |
| Weekly | Founder + Tech Lead | All health indicators | 45 min |
| Monthly | Leadership team | Full framework + diagnostics | 2 hours |
| Quarterly | Leadership + Advisors | Strategic review + target reset | Half day |

---

## Anti-Vanity Metric Rules

1. **Never celebrate total signups** — only active users matter
2. **Never report page views alone** — always pair with conversion
3. **Revenue = recognized revenue only** — not pipeline or projections
4. **AI accuracy = validated accuracy** — not self-reported scores
5. **Growth rate > absolute numbers** — trajectory matters more than position

> "If a metric doesn't change a decision, it doesn't belong on the dashboard."
