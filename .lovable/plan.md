

## Add Investment Tab to Property Comparison

The property comparison tool already exists at `/property-comparison` with 4 tabs (Specs, KPR, Neighborhood, Charts). It supports up to 4 properties. The request is essentially fulfilled, but it's missing **investment metrics** (ROI, rental yield, appreciation) for side-by-side comparison.

### Changes

**Edit `src/pages/PropertyComparison.tsx`**

1. Add a 5th tab "Investment" (with `TrendingUp` icon) to the `TabsList` — change grid-cols-4 to grid-cols-5
2. Reuse the `CITY_RATES` and `TYPE_YIELDS` maps from `PropertyInvestmentWidget` to compute per-property investment metrics (annual growth, rental yield, monthly rent estimate, 5-year projected value, break-even years)
3. Add `TabsContent value="investment"` containing:
   - Investment metrics comparison cards (one per property, similar to KPR cards) showing annual growth %, rental yield %, monthly rental income, 5-year value projection, and break-even period — with winner badges for best yield/growth/fastest break-even
   - A bar chart comparing rental yields and appreciation rates side by side
   - A 10-year appreciation projection line chart showing property value growth over time for each property

### No new files needed — single file edit to `PropertyComparison.tsx`

