

## AI-Powered Property Investment Analytics & Report Generator

### Current State
- `PropertyAnalyticsReportPage.tsx` exists at `/investment-report` with basic metrics (price, rental yield, cap rate, market trend, scores) via the `get_property_investment_report` RPC
- Multiple investment hooks exist: `useInvestmentScoreV2` (detailed breakdown), `useROIForecast` (projections), `usePropertyValuationReport` (AI valuation), `useInvestmentReport` (basic report)
- `PropertyDetailModal.tsx` sidebar has contact buttons but no "Generate Investment Report" button
- No shareable report page or buy-vs-rent comparison exists

### Plan

**1. Create comprehensive `InvestmentReportPage` (`src/pages/InvestmentReportPage.tsx`)**

A new dedicated page at `/investment-report/:propertyId` that aggregates data from multiple existing hooks into a single rich report view:

- **Data sources**: `useInvestmentReport`, `useInvestmentScoreV2`, `useROIForecast`
- **Report sections**:
  - Hero header with property info, overall score badge, grade, and AI recommendation
  - **ROI Projection**: estimated ROI, 3yr/5yr value projections using ROI forecast data, mini bar chart showing yearly projections
  - **Rental Yield**: gross yield %, estimated monthly rent, annual income, cap rate
  - **Price Appreciation**: growth rate, price vs market avg, trend arrows (up/down/stable), confidence indicator bar
  - **Opportunity Score Breakdown**: 5 scored dimensions from InvestmentScoreV2 (location demand, price fairness, rental yield, market growth, liquidity) — each as a labeled progress bar with score/max
  - **Market Heat Insight**: market trend classification with colored badge, supply/demand ratio, similar listings count
  - **Risk Classification**: risk level badge (low/medium/high) from ROI forecast, confidence score gauge, warning factors
  - **Buy vs Rent Comparison**: side-by-side card — buying cost (mortgage estimate at 8.5% / 20yr), vs renting (estimated monthly rent × 12), net position after 5 years
  - **AI Recommendation Summary**: grade-colored card with narrative recommendation text

- **Visual components**: Progress bars for score breakdowns, colored badges for risk/trend, trend arrows (TrendingUp/Down), confidence gauge bar, mini projection chart (simple CSS bar chart for yearly projections)

**2. Add "Generate Investment Report" button to `PropertyDetailModal.tsx`**

In the sidebar (around line 420, after share button), add a button that navigates to `/investment-report/{property.id}`.

**3. Create shareable report route**

Register `/investment-report/:propertyId` in `App.tsx` as a protected route. The page reads `propertyId` from URL params, making it shareable by link.

**4. Update existing `PropertyAnalyticsReportPage`**

Redirect the property selection on the existing `/investment-report` page to navigate to `/investment-report/:id` when a property is selected, keeping backward compatibility.

### Files to Create/Modify
- **Create**: `src/pages/InvestmentReportPage.tsx` — full report view with all sections
- **Modify**: `src/components/property/PropertyDetailModal.tsx` — add report button in sidebar
- **Modify**: `src/App.tsx` — add `/investment-report/:propertyId` route
- **Modify**: `src/pages/PropertyAnalyticsReportPage.tsx` — redirect selection to new route

### No database changes needed
All data comes from existing hooks/RPCs/edge functions.

