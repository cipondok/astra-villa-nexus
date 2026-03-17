

## Real-Time Revenue Alerts for Admins

### Approach

Add a configurable revenue alert system that monitors daily revenue and commission payouts, triggering admin_alerts when thresholds are breached. Two components: a backend check (SQL function + scheduled trigger) and a frontend settings/status panel embedded in the Revenue Intelligence Dashboard.

### 1. Database: `revenue_alert_config` table + check function

**New table** `revenue_alert_config` — single-row config storing admin-defined thresholds:
- `id` (int, default 1, primary key)
- `daily_revenue_min` (numeric, default 0) — minimum expected daily revenue
- `daily_commission_max` (numeric, default 0) — max commission payout budget per day
- `rental_revenue_min` (numeric, default 0) — min daily rental revenue
- `alert_cooldown_hours` (int, default 24) — prevent duplicate alerts within window
- `is_enabled` (boolean, default true)
- `updated_at` (timestamptz)

RLS: only authenticated users with admin role can read/update.

**New SQL function** `check_revenue_alerts()` — SECURITY DEFINER function that:
1. Reads thresholds from `revenue_alert_config`
2. Queries today's totals from `payment_logs` (daily revenue), `transaction_commissions` (daily commission payouts), `rental_bookings` (daily rental revenue)
3. Checks cooldown — skips if an alert with same type was created within `alert_cooldown_hours`
4. Inserts into `admin_alerts` when:
   - Daily revenue < `daily_revenue_min` → priority 'high', type 'revenue_drop'
   - Daily commission > `daily_commission_max` → priority 'high', type 'commission_overbudget'
   - Daily rental < `rental_revenue_min` → priority 'medium', type 'rental_revenue_low'

### 2. Scheduled execution

Add a pg_cron job (via SQL insert tool) to call `check_revenue_alerts()` every hour:
```sql
SELECT cron.schedule('check-revenue-alerts', '0 * * * *', 'SELECT check_revenue_alerts()');
```

### 3. Frontend: Revenue Alerts Settings Panel

**New component** `RevenueAlertSettings.tsx` — a collapsible card added as a 7th tab ("Alerts") in `AdminRevenueIntelligenceDashboard.tsx`:
- Toggle to enable/disable alerts
- Input fields for each threshold (daily revenue min, commission max, rental min, cooldown hours)
- Save button that upserts `revenue_alert_config`
- Status section showing recent revenue alerts from `admin_alerts` filtered by types `revenue_drop`, `commission_overbudget`, `rental_revenue_low`
- Real-time subscription on `admin_alerts` for these types to show live notifications via toast

**New hook** `useRevenueAlertConfig` — fetches/upserts `revenue_alert_config` row.

### 4. Integration with existing alert system

Revenue alerts flow into the existing `admin_alerts` table and appear in both:
- The Alerts section of the admin dashboard (existing)
- The new Revenue Alerts tab (filtered view)
- Real-time toast notifications via existing Supabase channel subscription

### Files
- **Create**: Migration SQL — `revenue_alert_config` table + `check_revenue_alerts()` function
- **Create**: `src/components/admin/RevenueAlertSettings.tsx`
- **Create**: `src/hooks/useRevenueAlertConfig.ts`
- **Modify**: `src/components/admin/AdminRevenueIntelligenceDashboard.tsx` — add Alerts tab
- **Execute**: pg_cron schedule via SQL insert tool

