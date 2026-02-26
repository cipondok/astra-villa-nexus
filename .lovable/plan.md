

## Owner Financial Analytics Dashboard

Build a comprehensive financial analytics component for property owners that visualizes income vs expenses, profit margins, and financial trends using data from existing `rental_invoices` and `property_expenses` tables.

### Implementation Steps

1. **Create `OwnerFinancialAnalytics.tsx`** component with:
   - **Summary cards**: Total Revenue (from `rental_invoices` with status='paid'), Total Expenses (from `property_expenses` with status='paid'), Net Profit, and Profit Margin percentage
   - **Revenue vs Expenses chart** (BarChart, monthly, last 6 months) using recharts
   - **Expense breakdown by category** (PieChart) from `property_expenses`
   - **Per-property P&L table**: each property showing revenue, expenses, and net profit
   - **Monthly trend line chart** showing profit over time
   - All data fetched via Supabase queries on existing tables — no new tables needed

2. **Add "Keuangan" tab** to `PropertyOwnerOverview.tsx` with a `DollarSign` or `TrendingUp` icon, rendering the new component

### Technical Notes
- No database migration needed — uses existing `rental_invoices` and `property_expenses` tables
- Uses `recharts` (already installed) for BarChart, LineChart, PieChart
- Uses `formatIDR` for currency formatting
- Aggregation done client-side from fetched data
- Follows existing compact UI style (small text sizes, dense cards)

