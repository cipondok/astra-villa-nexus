# ASTRA Villa — 90-Day Execution War Plan

> From development-stage platform to credible AI real estate investment ecosystem in 90 days.

---

## Mission Statement

**By Day 90, ASTRA Villa must have**: real listings from real developers, active investors using AI intelligence daily, and first revenue from facilitated transactions. No vanity metrics — only proof points that matter to investors and the market.

---

## Phase 1 — Product Stabilization & Modern Upgrade (Days 1–30)

### Objective
Make the platform **investor-ready**: professional, fast, reliable, and demonstrable.

---

### Week 1 (Days 1–7): Foundation Hardening

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 1 | Audit all critical user flows end-to-end | QA | Bug list with severity ratings |
| 2 | Fix top 5 P0 bugs (payment, auth, navigation) | Engineering | Stable core flows |
| 3 | Optimize database queries >2s response time | Performance | All key queries <500ms |
| 4 | Implement error boundary + fallback UI globally | UX | Zero white-screen crashes |
| 5 | Mobile viewport audit — fix all broken layouts | Mobile | Clean mobile experience |
| 6 | Set up uptime monitoring + alerting | Ops | Automated health checks |
| 7 | Deploy stabilized build + smoke test all routes | Release | Stable baseline v1.0 |

**Week 1 Checklist**:
- [ ] All admin dashboard sections load without errors
- [ ] Property listing flow: create → preview → publish works
- [ ] Search + filters return correct results
- [ ] AI scoring runs without failures (`useAISystemHealth` → HEALTHY)
- [ ] Mobile bottom nav and sticky CTAs positioned correctly

---

### Week 2 (Days 8–14): Premium UI Modernization

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 8 | Finalize dark luxury theme tokens in `index.css` | Design | Consistent premium palette |
| 9 | Upgrade property listing cards (photos, scores, badges) | UI | Premium card components |
| 10 | Modernize search results page with grid/map toggle | UI | Professional search UX |
| 11 | Polish property detail page (hero, gallery, AI insights) | UI | Conversion-optimized detail |
| 12 | Upgrade dashboard landing with KPI strip + sparklines | UI | Executive-grade dashboard |
| 13 | Add Framer Motion transitions to key page navigations | Polish | Smooth, app-like feel |
| 14 | Cross-browser + device testing sweep | QA | Verified on Chrome/Safari/Mobile |

**Week 2 Checklist**:
- [ ] Playfair Display headings + Inter body consistently applied
- [ ] Intelligence Line (gold gradient accent) on key UI elements
- [ ] Signal Dot System (Yellow/Blue/Red/Green) visible on listings
- [ ] Dark mode fully functional with proper contrast ratios
- [ ] No hardcoded colors — all semantic tokens from design system

---

### Week 3 (Days 15–21): Core Flow Completion

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 15 | Complete buy flow: inquiry → contact → schedule viewing | Marketplace | End-to-end buyer journey |
| 16 | Complete sell flow: list → optimize → manage inquiries | Marketplace | Seller self-service |
| 17 | Complete rent flow: listing → application → agreement | Marketplace | Rental marketplace |
| 18 | Service provider onboarding: register → profile → activate | Marketplace | Vendor marketplace |
| 19 | Stabilize AI opportunity scoring pipeline | AI | Consistent, accurate scores |
| 20 | Optimize global search with `admin_global_search` RPC | Search | Fast fuzzy search (<300ms) |
| 21 | Integration test all flows + fix regressions | QA | Verified marketplace |

**Week 3 Metrics**:
```
Platform Health Target:
├── Database response: <500ms (usePlatformHealth.dbResponseMs)
├── AI job failure rate: <10% (usePlatformHealth.jobFailureRate)
├── AI coverage: >80% (useAISystemHealth.coverage_rate)
├── Scoring freshness: FRESH (useAISystemHealth.freshness_state)
└── All subsystems: operational (usePlatformHealth.subsystems)
```

---

### Week 4 (Days 22–30): Demo Mode & Pitch Readiness

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 22 | Polish AI Demo Mode 5-scene flow | Demo | Smooth presentation sequence |
| 23 | Prepare demo dataset (50 curated properties) | Data | Compelling sample inventory |
| 24 | Finalize Investor Pitch Dashboard slides | Pitch | Professional investor deck |
| 25 | Add live metric counters to pitch (animated KPIs) | Pitch | Dynamic data storytelling |
| 26 | Record 3-minute platform walkthrough video | Marketing | Shareable demo asset |
| 27 | Rehearse full pitch presentation (3 dry runs) | Founder | Confident delivery |
| 28 | Conduct first external demo (friendly investor/advisor) | Validation | Real feedback collected |
| 29 | Incorporate feedback — quick polish iterations | Iteration | Refined pitch |
| 30 | **Phase 1 Review**: score against all targets below | Review | Go/no-go for Phase 2 |

### Phase 1 Exit Criteria (ALL must be 🟢)

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Platform stability | Zero P0 bugs, <3 P1 bugs | Bug tracker |
| Page load performance | <2s on 4G connection | Lighthouse audit |
| AI system health | HEALTHY status | `useAISystemHealth` |
| Mobile experience | Functional on 360px–414px | Device testing |
| Demo mode | Complete 5-scene flow works | Manual walkthrough |
| Pitch deck | Ready for external presentation | Advisor feedback |
| Core flows | Buy/Sell/Rent functional | End-to-end test |

**Phase 1 Budget Allocation**:
```
Engineering time:    70% (product building)
Design:              15% (UI polish)
Content/Marketing:    5% (demo assets)
Outreach prep:       10% (partnership research)
```

---

## Phase 2 — Marketplace Supply Expansion (Days 31–60)

### Objective
Build **real inventory** and **real partnerships** — the platform must feel alive with genuine listings.

---

### Week 5 (Days 31–37): Outreach Infrastructure

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 31 | Build target list: 100 agents + 20 developers | Research | Qualified lead database |
| 32 | Create agent onboarding kit (benefits, how-to, FAQ) | Sales | Professional sales collateral |
| 33 | Set up WhatsApp Business for agent communication | Channel | Scalable outreach channel |
| 34 | Design developer JV proposal template | Partnerships | Professional partnership deck |
| 35 | Launch first 10 agent outreach messages | Outreach | Pipeline initiated |
| 36 | Identify 5 service providers per category (legal, repair, reno) | Marketplace | Vendor pipeline |
| 37 | Publish first SEO landing page (Jakarta investment guide) | SEO | Organic traffic seed |

**Daily Outreach Rhythm (start Week 5, maintain through Day 60)**:
```
09:00  — 3 new agent contacts (WhatsApp/Instagram)
10:00  — 1 developer outreach (email + follow-up call)
14:00  — 2 agent follow-ups from previous contacts
15:00  — 1 service provider onboarding conversation
16:00  — 1 social media content piece published
```

---

### Week 6 (Days 38–44): First Supply Wins

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 38 | Onboard first 5 agents with real listings | Supply | Live agent inventory |
| 39 | Publish 3 SEO city pages (Bali, Surabaya, Bandung) | SEO | Multi-city organic presence |
| 40 | Create "AI Deal Discovery" social content series | Marketing | Viral content format |
| 41 | Approach first developer for JV project discussion | Partnerships | Developer pipeline started |
| 42 | Onboard first 3 service providers | Marketplace | Vendor marketplace seeded |
| 43 | Launch investor interest waitlist landing page | Demand | Lead capture active |
| 44 | Week review: pipeline health + listing growth rate | Review | Course correction |

---

### Week 7 (Days 45–51): Acceleration Push

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 45 | Scale to 20+ active agents on platform | Supply | Critical mass forming |
| 46 | Reach 500+ real property listings | Supply | Meaningful inventory |
| 47 | Publish AI-generated market insight report (Jakarta) | Content | Authority positioning |
| 48 | Submit JV proposal to interested developer | Partnerships | Deal in pipeline |
| 49 | Launch Instagram/TikTok ad campaign (small budget) | Marketing | Paid acquisition test |
| 50 | Onboard 10+ service providers across 3 categories | Marketplace | Vendor network growing |
| 51 | Create "Featured Properties" weekly email format | Retention | Re-engagement channel |

---

### Week 8 (Days 52–60): Supply Consolidation

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 52 | Target 1,000+ total listings milestone | Supply | Credible marketplace |
| 53 | Close first developer JV agreement (or LOI) | Partnerships | Major partnership proof |
| 54 | Launch 5 additional city landing pages | SEO | Broad organic footprint |
| 55 | Publish case study: "How AI found a 25% undervalued deal" | Marketing | Trust-building content |
| 56 | Set up referral program for agent-to-agent growth | Growth | Viral supply loop |
| 57 | Optimize listing quality (photos, descriptions, scoring) | Quality | Professional inventory |
| 58 | Build investor acquisition campaign assets | Prep | Ready for Phase 3 |
| 59 | Run agent satisfaction survey | Feedback | Retention intelligence |
| 60 | **Phase 2 Review**: score against targets below | Review | Go/no-go for Phase 3 |

### Phase 2 Exit Criteria

| Criterion | Target | Status |
|-----------|--------|--------|
| Total property listings | 1,000+ real listings | 🟢/🟡/🔴 |
| Active agents on platform | 20+ agents | 🟢/🟡/🔴 |
| Developer partnerships | 1+ LOI/agreement signed | 🟢/🟡/🔴 |
| Service providers | 10+ across 3 categories | 🟢/🟡/🔴 |
| SEO city pages live | 8+ cities | 🟢/🟡/🔴 |
| Investor waitlist signups | 200+ interested investors | 🟢/🟡/🔴 |
| Social media following | 1,000+ across channels | 🟢/🟡/🔴 |
| Agent satisfaction score | 3.5+ / 5.0 | 🟢/🟡/🔴 |

**Phase 2 Budget Allocation**:
```
Engineering time:    30% (maintenance + features)
Sales/Outreach:      35% (agent + developer acquisition)
Content/Marketing:   25% (SEO, social, content creation)
Operations:          10% (vendor onboarding, quality control)
```

---

## Phase 3 — Investor Demand & Monetization Activation (Days 61–90)

### Objective
Generate **real investor engagement** and **first revenue** — prove the business model works.

---

### Week 9 (Days 61–67): Investor Activation Campaign

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 61 | Launch targeted investor acquisition campaign | Marketing | Active investor pipeline |
| 62 | Send first "Elite Deal Alert" batch to waitlist | Engagement | AI value demonstration |
| 63 | Activate premium subscription pilot (Gold tier) | Revenue | First subscription offering |
| 64 | Schedule 5 live demo presentations with investors | Sales | Direct investor engagement |
| 65 | Publish "Platform Intelligence Report" (monthly) | Authority | Thought leadership asset |
| 66 | Push notification campaign for watchlist properties | Retention | Re-engagement triggers |
| 67 | Track first-week investor activation funnel | Analytics | Conversion intelligence |

**Investor Activation Funnel**:
```
Awareness → Registration → Profile Complete → First Search → 
First Save → First Inquiry → First Deal Alert → First Transaction

Target conversion rates:
  Awareness → Registration:   8% (ads/content)
  Registration → Profile:     60%
  Profile → First Search:     80%
  First Search → First Save:  40%
  First Save → First Inquiry: 25%
  First Inquiry → Transaction: 5%
```

---

### Week 10 (Days 68–74): Revenue Proof Points

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 68 | Facilitate first property inquiry through platform | Revenue | Transaction pipeline |
| 69 | Test commission tracking workflow end-to-end | Systems | Revenue infrastructure ready |
| 70 | Conduct 3 live investor demo presentations | Sales | Direct investor feedback |
| 71 | Offer free Platinum trial to 50 high-intent investors | Growth | Premium adoption test |
| 72 | Launch "AI Investment Advisory" premium content | Content | Premium value justification |
| 73 | Approach 3 agents for commission-sharing agreement | Revenue | Revenue model validation |
| 74 | Midpoint review: investor engagement metrics | Analytics | Strategy adjustment |

---

### Week 11 (Days 75–81): Monetization Validation

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 75 | Close first platform-facilitated transaction | Revenue | **MILESTONE: First Revenue** |
| 76 | Convert 5+ investors to paid Gold subscriptions | Revenue | Subscription revenue started |
| 77 | Launch developer project showcase feature | Partnerships | JV revenue channel active |
| 78 | Run "Elite Deals" exclusive event for premium users | Engagement | Premium community building |
| 79 | Publish investor testimonial / success story | Marketing | Social proof asset |
| 80 | Optimize subscription conversion funnel | Growth | Higher conversion rate |
| 81 | Test service marketplace referral commission | Revenue | Third revenue stream tested |

---

### Week 12 (Days 82–90): Consolidation & Proof

| Day | Priority Task | Category | Deliverable |
|-----|--------------|----------|-------------|
| 82 | Compile all revenue proof points | Business | Revenue evidence package |
| 83 | Document investor engagement metrics | Analytics | Engagement evidence |
| 84 | Prepare 90-day results presentation | Strategy | Executive summary |
| 85 | Update investor pitch with real metrics | Fundraising | Data-backed pitch deck |
| 86 | Plan next 90-day cycle priorities | Planning | Q2 roadmap draft |
| 87 | Conduct team/advisor strategic review | Governance | Aligned direction |
| 88 | Publish "90 Days of ASTRA Villa" blog post | PR | Public milestone |
| 89 | Set Q2 OKRs based on validated learnings | Planning | Clear next objectives |
| 90 | **WAR PLAN COMPLETE**: Final scorecard review | Review | Full assessment |

### Phase 3 Exit Criteria (90-Day Proof Points)

| Criterion | Target | Weight |
|-----------|--------|--------|
| First revenue generated | >IDR 0 from real transactions | Critical |
| Paid subscribers | 10+ Gold/Platinum users | High |
| Active investors (weekly) | 100+ using platform weekly | High |
| Demo presentations delivered | 10+ to real investors | Medium |
| Investor inquiry conversion | >3% inquiry rate on listings | Medium |
| Platform-facilitated viewings | 20+ scheduled viewings | Medium |
| Deal alert engagement | >25% open rate | Medium |
| Developer JV revenue | At least 1 paid project showcase | Medium |

---

## Weekly War Room Ritual (Every Monday, 60 min)

### Agenda Template

```
00–10 min: Metric Review
  └── North Stars: Listings, Active Users, Revenue, AI Health
  └── Traffic light status for each

10–25 min: Pipeline Review
  └── Agent acquisition: new / contacted / onboarding / activated
  └── Developer partnerships: stage + next action
  └── Investor funnel: awareness → registration → engagement

25–40 min: Product Sprint Review
  └── What shipped last week?
  └── What's blocked?
  └── What's the #1 priority this week?

40–50 min: Growth Experiment
  └── Choose 1 experiment to run this week
  └── Define hypothesis, metric, and success criteria

50–60 min: Strategic Signal
  └── Competitor moves observed
  └── Market trend worth noting
  └── Founder energy / morale check
```

### Weekly Growth Experiment Framework

| Week | Experiment | Hypothesis | Success Metric |
|------|-----------|------------|----------------|
| 1 | Bug bounty for beta users | Users find critical bugs faster | 5+ P1 bugs found |
| 2 | Agent WhatsApp group | Community drives self-serve onboarding | 3+ agents join organically |
| 3 | AI deal post on Instagram | AI insights drive viral sharing | 50+ saves per post |
| 4 | Developer cold email campaign | Developers respond to data-driven pitch | 15% response rate |
| 5 | Investor webinar (live demo) | Live demos convert better than video | 20+ attendees, 5 signups |
| 6 | SEO content blitz (10 articles) | Content drives organic investor traffic | 500+ organic visits/week |
| 7 | Referral bonus for agents | Agents recruit other agents | 5+ referral signups |
| 8 | Premium free trial campaign | Free trial converts to paid | 10% trial → paid conversion |
| 9 | Elite deal alert email blast | Deal alerts drive platform return visits | 30% open, 10% click |
| 10 | Investor testimonial campaign | Social proof increases registration | 20% uplift in signups |
| 11 | Commission transparency report | Trust drives transaction willingness | First commission collected |
| 12 | 90-day results PR push | Public milestone drives brand awareness | 3+ media mentions |

---

## Risk Mitigation Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Agent adoption slower than expected | High | High | Offer free premium listing boost for first 3 months |
| Developer JV deals take >60 days | High | Medium | Run parallel conversations with 5+ developers |
| AI accuracy questioned by users | Medium | High | Show confidence intervals, allow manual override |
| Investor acquisition cost too high | Medium | High | Double down on organic/SEO, reduce paid spend |
| Platform stability issues during demos | Medium | Critical | Dedicated demo environment with cached data |
| Competitor launches similar AI features | Low | Medium | Move faster, depth of intelligence is the moat |
| Regulatory concerns with AI recommendations | Low | High | Add disclaimers, consult legal advisor early |

---

## Resource Allocation Across 90 Days

```
         Phase 1 (30d)    Phase 2 (30d)    Phase 3 (30d)
         ─────────────    ─────────────    ─────────────
Eng:     ████████████ 70%  ██████ 30%       ████ 20%
Sales:   ██ 10%            ████████ 35%     ████████ 35%
Mktg:    █ 5%              ██████ 25%       ████████ 30%
Ops:     ███ 15%           ██ 10%           ███ 15%

Key shift: Engineering-heavy → Sales/Marketing-heavy as product stabilizes
```

---

## 90-Day Scoreboard

### Final Assessment Framework

| Category | Weight | Metric | Target | Score |
|----------|--------|--------|--------|-------|
| Product Maturity | 25% | Stability + UX quality | Investor-ready | _/10 |
| Marketplace Supply | 25% | Listings + agents + vendors | 1,000+ listings | _/10 |
| Investor Demand | 25% | Active users + engagement | 100+ WAI | _/10 |
| Revenue Validation | 25% | First revenue + subscriptions | >IDR 0 + 10 subs | _/10 |

**Scoring**:
- 8–10: Exceptional — ready for seed fundraise
- 6–7: Good — continue iterating, fundraise in 30 days
- 4–5: Needs work — extend timeline, pivot weak areas
- <4: Strategic reassessment required

---

## The 90-Day Commitment

> "In 90 days, we will transform ASTRA Villa from a promising prototype into a living marketplace with real properties, real investors, and real revenue. Every day counts. Every listing matters. Every investor interaction is a proof point. Execute relentlessly."

**Day 1 starts now.**
