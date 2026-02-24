

## Advanced Analytics Dashboard

### Current State
- An `/analytics` page already exists with basic stats (user counts, property counts by type, engagement metrics)
- `MarketInsightsTab` in the user dashboard shows city-level price averages and user preference profiles
- `recharts` is installed and used extensively across 32+ files
- The `properties` table has: `price`, `property_type`, `listing_type`, `city`, `state`, `area_sqm`, `bedrooms`, `bathrooms`, `created_at`, `status`
- Tables like `activity_logs`, `favorites`, `user_searches`, `property_visits` provide engagement data
- Existing admin analytics cover token stats, KYC, search analytics, and performance monitoring

### What We Will Build

#### 1. Market Trends Charts
Create `src/components/analytics/MarketTrendsChart.tsx`:
- Price trend line chart grouped by month (based on property `created_at` and `price`)
- Filterable by city, property type, and listing type (sale vs rent)
- Shows average price, median price, and listing count over time
- Uses recharts `LineChart` + `AreaChart`

#### 2. Price Distribution Analysis
Create `src/components/analytics/PriceDistribution.tsx`:
- Histogram showing price ranges and how many listings fall in each bucket
- Breakdown by property type using stacked bars
- Price per sqm comparison across cities using horizontal bar chart

#### 3. Neighborhood Insights
Create `src/components/analytics/NeighborhoodInsights.tsx`:
- City comparison cards with avg price, listing count, avg size, avg bedrooms
- Top neighborhoods ranked by listing density and average price
- Supply indicator (new listings this month vs last month)

#### 4. Investment ROI Projector
Create `src/components/analytics/InvestmentROICalculator.tsx`:
- Input: purchase price, down payment %, interest rate, rental yield estimate
- Output: monthly mortgage, annual rental income, cash-on-cash return, break-even timeline
- Visualization: ROI projection chart over 5/10/15/20 years using recharts `ComposedChart`
- Pre-fill with market averages from the selected city

#### 5. Enhanced Analytics Page
Update `src/pages/Analytics.tsx` to add new tabs:
- "Market Trends" tab with the trends chart
- "Price Analysis" tab with distribution and per-sqm analysis
- "Neighborhoods" tab with city/area insights
- "ROI Calculator" tab with the investment projector
- Keep existing "Overview" tab intact

### Technical Details

**Data queries** all use the existing `properties` table — no new tables needed:
```typescript
// Price trends by month
const { data } = await supabase
  .from('properties')
  .select('price, city, property_type, listing_type, created_at, area_sqm')
  .eq('status', 'active')
  .eq('approval_status', 'approved');
```

**ROI calculation** is pure client-side math:
```typescript
const monthlyMortgage = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
const annualRental = purchasePrice * (rentalYield / 100);
const cashOnCash = (annualRental - annualMortgage) / downPayment * 100;
```

**Chart components** use recharts (already installed) with `ResponsiveContainer`, matching existing patterns across the codebase.

**No database changes required** — all analytics are computed from existing property data.

### Files to Create
- `src/components/analytics/MarketTrendsChart.tsx`
- `src/components/analytics/PriceDistribution.tsx`
- `src/components/analytics/NeighborhoodInsights.tsx`
- `src/components/analytics/InvestmentROICalculator.tsx`

### Files to Edit
- `src/pages/Analytics.tsx` — add new tabs integrating the four new components

