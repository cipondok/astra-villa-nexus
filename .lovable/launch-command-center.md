# ASTRAVILLA Launch Design Command Center
**Date:** 2026-03-16 | **Phase:** Pre-Launch → Soft Launch → Public Launch
**Purpose:** Single reference for managing visual execution quality during the highest-stakes phase of the platform.

---

## 1. Final UI Readiness Checkpoints

### Checkpoint 1: Homepage Hierarchy (Gate: Must Pass Before Launch)

| # | Verification Item | Pass Criteria | How to Verify |
|---|------------------|---------------|---------------|
| H1 | Hero section has ONE clear CTA | Single primary button visible above fold | Screenshot at 1366x768 and 390x844 |
| H2 | Search bar is dominant UI element | Largest interactive element above fold, placeholder text visible | Visual inspection |
| H3 | Trust counter bar present | Listing count, agent count, province count visible below hero | Page load check |
| H4 | Property cards render with images | No grey placeholder boxes in first visible row | Load homepage with 4G throttle |
| H5 | "Baru" badges on recent listings | Properties < 7 days old show badge | Cross-reference with created_at |
| H6 | Mobile bottom nav renders correctly | 4 tabs visible, 72px clearance, no overlap with content | Device test: iPhone SE, Samsung A series |
| H7 | First Contentful Paint < 2.5s | Measured on 4G connection | Lighthouse mobile audit |
| H8 | No horizontal scroll on any viewport | Page fits within viewport at all breakpoints | Test at 320px, 375px, 768px, 1366px, 1920px |

### Checkpoint 2: Listing Card Consistency (Gate: Must Pass)

| # | Verification Item | Pass Criteria |
|---|------------------|---------------|
| C1 | All cards use same border-radius | `rounded-xl` consistently applied |
| C2 | Price uses `font-black` + `drop-shadow-sm` + min `text-lg` | Per UI stability constraints |
| C3 | Card hover uses `will-change-transform` | No janky hover animations |
| C4 | Font minimum 10px (`text-[10px]`) on all labels | KT/KM/LB labels, metadata text |
| C5 | Grid max 4 columns with min `gap-5` | At `xl` breakpoint |
| C6 | Image aspect ratio consistent | 16:10 on all listing cards |
| C7 | Empty state branded | "Coming Soon" placeholder, not grey box |

### Checkpoint 3: Inquiry CTA Dominance (Gate: Must Pass)

| # | Verification Item | Pass Criteria |
|---|------------------|---------------|
| Q1 | Property detail has sticky CTA | WhatsApp + Call buttons visible at all scroll positions |
| Q2 | CTA buttons min 44px height | Thumb-zone compliant |
| Q3 | CTA contrast ratio ≥ 4.5:1 | WCAG AA on both light/dark mode |
| Q4 | No competing CTAs at same visual weight | Inquiry CTA is the only `variant="default"` button in viewport |
| Q5 | Mobile: CTA in bottom 20% of screen | Within thumb reach zone |
| Q6 | CTA loads without delay | No lazy-loading on conversion buttons |

### Checkpoint 4: Cross-Page Consistency (Gate: Should Pass)

| # | Verification Item | Pass Criteria |
|---|------------------|---------------|
| X1 | Navigation bar height fixed | `h-12 md:h-13 lg:h-14` regardless of scroll |
| X2 | Page transitions opacity-only | No vertical offset on route change |
| X3 | Gold accent only on AI elements | Audit: no decorative `--gold-primary` usage |
| X4 | Section spacing `mb-6` (24px) | Consistent vertical rhythm |
| X5 | Dark mode fully functional | No white flashes, no unreadable text, no missing borders |
| X6 | Loading states use skeleton, not spinner | All data-fetching components |

---

## 2. Visual Issue Escalation Workflow

### Severity Classification

| Severity | Definition | Response Time | Example |
|----------|-----------|---------------|---------|
| **P0 — Blocker** | Prevents conversion or breaks trust | Fix within 4 hours | CTA button not clickable, price showing wrong currency, layout broken on popular device |
| **P1 — Critical** | Degrades premium perception significantly | Fix within 24 hours | Card images not loading, dark mode text unreadable, horizontal scroll on mobile |
| **P2 — Important** | Noticeable but doesn't block user tasks | Fix within 3 days | Inconsistent spacing, wrong icon, animation jank on scroll |
| **P3 — Minor** | Cosmetic issue noticed only on close inspection | Fix in next weekly cycle | 1px alignment, subtle color inconsistency, font weight variance |

### Escalation Decision Tree

```
Issue Detected
    │
    ├── Does it block inquiry/conversion? → P0 (fix now)
    │
    ├── Does it look broken/unprofessional? → P1 (fix today)
    │
    ├── Would a competitor screenshot this to mock us? → P2 (fix this week)
    │
    └── Only a designer would notice? → P3 (batch in weekly cycle)
```

### Issue Tracking Template

```
ISSUE: [One-line description]
SEVERITY: P0/P1/P2/P3
DEVICE: [Device + viewport]
PAGE: [URL path]
SCREENSHOT: [Attached]
EXPECTED: [What it should look like]
ACTUAL: [What it looks like]
IMPACT: [User flow affected]
```

---

## 3. Real-Time Experience Monitoring

### Core Metrics Dashboard (Build with existing `ai_behavior_tracking` + `property_analytics`)

#### Engagement Health Signals

| Metric | Source | Healthy Range | Alert Threshold |
|--------|--------|---------------|-----------------|
| **Scroll depth (homepage)** | `ai_behavior_tracking.event_type = 'scroll'` | >60% reach mid-page | <40% = content above fold failing |
| **Listing card click rate** | `event_type = 'property_click'` / impressions | 8–15% | <5% = cards not compelling |
| **Search-to-results rate** | Search events / result page views | >85% | <70% = search UX friction |
| **Detail page bounce rate** | Single-page sessions on `/property/*` | <45% | >60% = detail page failing |
| **Inquiry CTA tap rate** | `event_type = 'inquiry_click'` / detail views | 3–8% | <2% = CTA not visible/compelling |
| **Save/favorite rate** | `event_type = 'property_saved'` / detail views | 5–12% | <3% = save button not discoverable |

#### Mobile-Specific Friction Signals

| Signal | What It Means | Response |
|--------|--------------|----------|
| High rage-tap rate (3+ taps same spot in 2s) | Button not responding or tap target too small | Increase tap target, check z-index |
| Pinch-zoom events on text | Font too small to read | Increase base font size for that section |
| Rapid back-navigation (< 3s on page) | Content didn't match expectation | Review card-to-detail information parity |
| Horizontal scroll events | Layout overflow | Fix container width at that breakpoint |

#### Conversion Funnel

```
Homepage Visit → Search/Browse → Card Click → Detail View → Inquiry CTA → Contact Sent
   100%      →     65%       →    12%     →    10%      →     3%      →     1.5%
```

Track daily. Any stage dropping >20% from baseline triggers investigation.

---

## 4. Design-Growth Coordination

### Campaign-Interface Alignment Calendar

| Week | Marketing Action | Required UI State | Design Task |
|------|-----------------|-------------------|-------------|
| Launch -2 | Teaser social posts | Landing page live with email capture | Polish hero section, mobile screenshot-ready |
| Launch -1 | Agent onboarding push | Agent dashboard functional, listing flow tested | Verify agent listing form UX on mobile |
| Launch Day | PR + social blast | Homepage, search, detail pages production-ready | All P0/P1 issues resolved, monitoring active |
| Launch +1 | Influencer property tours | Property detail pages must look premium with real photos | Verify image gallery, share button, AI insights visible |
| Launch +2 | Investor content marketing | Market Intelligence + Investment pages polished | Verify chart rendering, data loading states |
| Launch +4 | Paid acquisition starts | Landing pages optimized for ad traffic | A/B test hero CTA copy, verify mobile load time |

### Feature Release Coordination Rules

1. **No feature launches on marketing push days.** Visual stability during traffic spikes
2. **New features ship behind feature flags.** Activate after 24h stability window
3. **Design review before every feature release.** 15-minute screenshot review at key breakpoints
4. **Rollback plan for every visual change.** Git revert path documented before merge

---

## 5. Rapid Iteration Protocols

### Weekly Visual Improvement Cycle

```
Monday:    Review weekend metrics + user feedback → identify top 3 issues
Tuesday:   Design fixes (code changes, no new components)
Wednesday: Internal review at 3 breakpoints (mobile/tablet/desktop)
Thursday:  Deploy to preview → 24h soak test
Friday:    Push to production (morning, never Friday afternoon)
```

### Safe Change Categories (Ship Without Extended Review)

| Category | Examples | Risk Level |
|----------|----------|-----------|
| **Copy changes** | Button text, placeholder text, error messages | Minimal — ship same day |
| **Spacing/padding** | Adjusting `gap`, `p-`, `m-` values within ±8px | Low — verify at 3 breakpoints |
| **Color token adjustments** | Tweaking HSL values in `index.css` | Low — verify light + dark mode |
| **Component variant additions** | New `variant` prop on existing component | Medium — verify no regressions |
| **New components** | Any new `.tsx` component file | High — full review cycle |
| **Layout structure changes** | Grid columns, flex direction, page template | High — full review + A/B test |

### Change Safety Rules

1. **Never modify `index.css` token values and component code in the same commit.** Isolate design system changes from feature changes
2. **Screenshot before and after at 390px (mobile), 768px (tablet), 1366px (desktop).** Visual diff is the review
3. **No global CSS selectors on `*`.** Per UI stability constraints — scope transitions to interactive elements only
4. **Test dark mode for every change.** Both modes must pass simultaneously
5. **Preserve scroll behavior.** No `scroll-behavior: smooth`, no scroll locking. Per layout stability standards

### Design System Protection Rules

| Rule | Rationale |
|------|-----------|
| No new color values in components | All colors through semantic tokens |
| No new font families without review | Typography consistency is brand equity |
| No z-index above 50 without documentation | Stacking context conflicts are invisible until they break |
| No `!important` in component styles | Specificity wars destroy maintainability |
| Max 3 new components per week | Prevents component proliferation |

---

## 6. Launch Day Runbook

### T-minus 2 Hours
- [ ] Run all readiness checkpoints (Section 1)
- [ ] Verify homepage loads < 2.5s on mobile
- [ ] Confirm dark mode renders correctly
- [ ] Test inquiry flow end-to-end (card → detail → WhatsApp)
- [ ] Verify OG meta tags render correct preview on WhatsApp/Twitter/LinkedIn

### T-minus 30 Minutes
- [ ] Clear any stale cache / CDN purge
- [ ] Monitoring dashboard open with alert thresholds set
- [ ] Team communication channel active for P0 escalation

### Launch (T=0)
- [ ] Publish frontend update
- [ ] Monitor error console for first 15 minutes
- [ ] Check first 10 real user sessions for unexpected behavior
- [ ] Verify analytics events firing correctly

### T-plus 1 Hour
- [ ] Review conversion funnel — any stage < 50% of expected?
- [ ] Check mobile vs desktop split — mobile metrics healthy?
- [ ] Screenshot homepage on 3 real devices

### T-plus 24 Hours
- [ ] Full metrics review against baselines
- [ ] Collect first user feedback (structured + unstructured)
- [ ] Prioritize P0/P1 issues for immediate fix cycle
- [ ] Document lessons learned for next launch
