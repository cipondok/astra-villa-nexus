

## Connect Agent Analytics to Real Supabase Data

### Current State
- `useAgentAnalytics` hook returns **100% mock data** (hardcoded random numbers)
- `usePropertyAnalytics` hook queries `property_analytics` table correctly but it's **empty** (0 rows)
- `usePropertyLeads` hook queries `property_leads` table correctly but it's **empty** (0 rows)
- Real data exists in: `properties` (125K rows), `inquiries` (1 row), `favorites` (1 row)

### Plan

#### 1. Seed property_analytics with real data from existing tables
- Create a database function `seed_agent_analytics()` that populates `property_analytics` with realistic daily metrics derived from actual properties
- For each agent's properties, generate daily rows for the last 90 days with views/saves/contacts/shares/clicks based on property attributes (price, type, status)
- Run it once via migration to bootstrap data

#### 2. Auto-populate property_leads from inquiries
- Create a database function that converts existing `inquiries` rows (that reference a `property_id`) into `property_leads` entries, mapping `contact_name` → `lead_name`, `contact_email` → `lead_email`, etc.
- Add a trigger on `inquiries` to auto-create a lead in `property_leads` whenever a new inquiry is submitted

#### 3. Rewrite useAgentAnalytics to query real data
- Replace the `generateMockData()` function with real Supabase queries:
  - **Leads**: Query `property_leads` grouped by source, status, and date
  - **Listings**: Query `property_analytics` for views/inquiries/saves aggregated by property
  - **Conversion**: Compute funnel from `property_analytics` totals → `property_leads` by status
  - **Market**: Compare agent's avg price vs all properties in same cities
  - **ROI**: Derive from `property_analytics` engagement metrics (placeholder until real revenue data exists)
  - **Time to sell**: Calculate from properties' `created_at` to status change timestamps
  - **Insights**: Generate dynamically based on actual data patterns (e.g., price vs market avg, best performing listing times)

#### 4. Add real-time analytics tracking
- Create a database function `track_property_view(property_id)` that upserts into `property_analytics` for today's date
- Call it from the property detail page when a user views a listing
- Similarly track saves (from favorites table trigger) and contacts (from inquiries trigger)

#### 5. Wire up date range selector
- The dashboard already has a 7d/30d/90d/1y selector but it's not connected
- Pass the selected range into `useAgentAnalytics` and use it to filter queries

### Technical Details

**Database changes (migration):**
- Function: `track_property_view(uuid)` — upserts daily analytics row
- Trigger on `favorites` → increments `saves` in `property_analytics`
- Trigger on `inquiries` → increments `contacts` in `property_analytics` + creates `property_leads` row
- Seed function to bootstrap historical data for existing agents

**Files modified:**
- `src/hooks/useAgentAnalytics.ts` — full rewrite to query Supabase instead of mock data
- `src/components/agent-analytics/AgentAnalyticsDashboard.tsx` — pass dateRange to hook
- Property detail page — add `track_property_view` call on mount

**Fallback:** If an agent has no data yet, show empty states with helpful messaging instead of zeros.

