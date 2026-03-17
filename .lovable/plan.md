

## Admin Revenue Tracking & Commission Analytics Dashboard

### Current State
The admin dashboard already has:
1. **`AdminRevenueCommissionDashboard`** — basic KPI cards from `get_admin_revenue_stats` RPC (total revenue, commissions, transactions, mortgage pipeline) — registered as `revenue-commissions`
2. **`RevenueAnalyticsDashboard`** — daily revenue trend (AreaChart), revenue by transaction type (BarChart), status pie chart from `transaction_summary` view — registered as `revenue-analytics`
3. **`RevenueForecasting`** and **`CommissionTracker`** — already registered in the section registry

Existing database tables available:
- `payment_logs` — all payment transactions with amount, status, booking_id
- `transaction_summary` — materialized view grouping by day/type
- `affiliate_commissions` — commission tracking with status
- `rental_bookings` — rental transactions with total_amount, booking_status
- `vendor_bookings` — service marketplace bookings with total_amount, status
- `user_subscriptions` — premium plan subscriptions with status, billing_cycle
- `transaction_commissions` — commission rates and amounts per transaction
- `properties` — city field for geographic breakdown

### Problem
The existing dashboards are fragmented — revenue-commissions shows flat KPIs, revenue-analytics shows basic charts, but there's no unified view covering all 5 revenue streams (sales commissions, rental fees, vendor marketplace, subscriptions, developer JV). No city performance heat table or top-agent ranking exists.

### Plan

**1. Create a new comprehensive `AdminRevenueIntelligenceDashboard.tsx`**

A single unified dashboard component with tabbed sections covering all revenue streams:

- **Overview Tab** — Hero KPI row (Total Revenue, MRR, Commission Earned, Transaction Count, Growth %) with MoM growth badges. Below: Recharts AreaChart for 30/60/90-day revenue trend, and a Recharts stacked BarChart breaking revenue by source (sales, rental, vendor, subscription).

- **Sales Commission Tab** — Total property transaction value, commission earned, commission rate. Top 5 performing agents table (from `transaction_commissions` joined with `profiles`). Transaction volume trend.

- **Rental Revenue Tab** — Total rental booking revenue from `rental_bookings`, active rental contracts count, average booking value, monthly trend chart.

- **Service Marketplace Tab** — Total vendor bookings from `vendor_bookings`, provider earnings vs platform fee split, booking completion rate.

- **Subscription Revenue Tab** — Active premium subscribers count from `user_subscriptions`, MRR calculation, plan distribution donut chart, churn indicator.

- **City Performance Tab** — Heat table showing revenue by city using data from `properties` + `payment_logs`. Columns: City, Transactions, Revenue, Avg Value, Growth. Color-coded rows by performance.

**2. Create `get_admin_revenue_intelligence` RPC**

A new SQL function (admin-only, SECURITY DEFINER) that returns all 5 revenue stream metrics in a single call:
- Sales commissions from `transaction_commissions`
- Rental revenue from `rental_bookings` (completed)
- Vendor marketplace revenue from `vendor_bookings` (completed)
- Subscription MRR from `user_subscriptions` (active)
- Top agents by commission from `transaction_commissions` + `profiles`
- City breakdown from `payment_logs` + `rental_bookings`
- 30-day daily revenue series for trend chart

**3. Create `useAdminRevenueIntelligence` hook**

Calls the new RPC with 60s refetch interval.

**4. Register in admin section registry**

Replace the existing `revenue-commissions` render with the new comprehensive dashboard. Keep `revenue-analytics` as-is for backward compatibility.

### Files
- **Create**: `src/components/admin/AdminRevenueIntelligenceDashboard.tsx`
- **Create**: `src/hooks/useAdminRevenueIntelligence.ts`
- **Create**: Migration SQL for `get_admin_revenue_intelligence` RPC
- **Modify**: `src/components/admin/adminSectionRegistry.tsx` — swap renderer for `revenue-commissions`

### Visual Components
- Recharts AreaChart (revenue trend)
- Recharts stacked BarChart (by source)
- Recharts PieChart (subscription plan distribution)
- Heat table with color-coded rows (city performance)
- Trend arrows and growth badges on all KPIs
- Top agents ranked table with avatar + commission amount

