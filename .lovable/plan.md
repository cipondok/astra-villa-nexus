

## Off-Plan / New Project Investment Section

### What We're Building
A dedicated "Early Investment Opportunities" section — a new page at `/early-investment` and a CTA component on the homepage — focused on off-plan/under-construction projects with investment-grade data: progress timelines, completion %, ROI forecasts, and developer profiles.

### Implementation Plan

**1. Create `OffPlanProjectCard` component** (`src/components/investment/OffPlanProjectCard.tsx`)
- Visual card with: project image, title, developer name + rating, location
- Progress timeline bar showing construction phases (Land Prep → Foundation → Structure → Finishing → Handover) with current phase highlighted
- Completion % with animated progress ring
- ROI forecast mini-widget (estimated appreciation at completion, rental yield post-completion)
- Price range badge (starting from), launch date, estimated completion date
- "Early Bird" / "Pre-Launch Price" badges for urgency

**2. Create `DeveloperProfileCard` component** (`src/components/investment/DeveloperProfileCard.tsx`)
- Developer logo, name, rating (stars), total projects count
- Track record: completed projects, on-time delivery %, average appreciation of past projects
- Badges: "Trusted Developer", "REI Member", etc.
- Link to developer's project portfolio

**3. Create `ConstructionTimeline` component** (`src/components/investment/ConstructionTimeline.tsx`)
- Horizontal stepper showing phases: Planning → Groundbreaking → Structure → MEP → Finishing → Handover
- Current phase highlighted with animation, past phases checked
- Estimated dates per phase, days remaining to next milestone

**4. Create `OffPlanROICalculator` component** (`src/components/investment/OffPlanROICalculator.tsx`)
- Inputs: purchase price, estimated completion value, rental yield post-completion, holding period
- Outputs: capital gain %, annualized ROI, break-even rental period
- Uses existing `CITY_RATES` and `TYPE_YIELDS` from `PropertyInvestmentWidget`
- Comparison: off-plan price vs estimated market price at completion

**5. Create Early Investment page** (`src/pages/EarlyInvestment.tsx`)
- Hero section: "Early Investment Opportunities" with stats (total projects, avg ROI, avg completion)
- Filter bar: city, property type, completion %, price range, developer
- Grid of `OffPlanProjectCard` components
- Sidebar or tab for `OffPlanROICalculator`
- Developer spotlight section with `DeveloperProfileCard` carousel
- Data source: `properties` table filtered by `development_status IN ('new_project', 'pre_launching', 'off-plan')` + demo data fallback

**6. Create homepage CTA** (`src/components/home/EarlyInvestmentCTA.tsx`)
- Compact banner: "🏗 Early Investment Opportunities" with 2-3 featured off-plan projects
- Mini stats: projects available, avg projected ROI, earliest handover date
- CTA button linking to `/early-investment`

**7. Wire up routing and navigation**
- Add route `/early-investment` in `App.tsx`
- Add to navigation menu under property listings
- Add CTA component to `Index.tsx` homepage

### Technical Notes
- Demo project data will include construction progress fields (phase, completion_percentage, estimated_completion_date) since the `properties` table may not have these columns yet
- ROI calculations reuse existing `CITY_RATES`/`TYPE_YIELDS` constants
- All components use existing UI primitives (Card, Badge, Progress, motion)
- No new database columns required initially — construction metadata stored in demo objects, can be migrated to DB later

