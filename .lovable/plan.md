

# Plan: Wire Live Rental Data from Database to Owner & Agent Dashboards

## Current State

Both `OwnerRentalManagement.tsx` and `AgentRentalManagement.tsx` use hardcoded demo arrays for rental listings, financial summaries, special requests, and reviews. The database already has the necessary tables:

- **`rental_bookings`** -- check_in_date, check_out_date, total_amount, base_price, booking_status, payment_status, special_requests, customer_id, agent_id, property_id
- **`property_reviews`** -- rating, review_text, user_id, property_id, booking_id
- **`booking_payments`** -- amount, payment_status, booking_id
- **`properties`** -- owner_id (links to auth user)

RLS policies already allow owners to see bookings on their properties and agents to see bookings they're assigned to. All tables currently have 0 rows, so the UI will show empty states until bookings are created.

---

## Implementation Plan

### Step 1: Create `useOwnerRentalData` hook
New file: `src/hooks/useOwnerRentalData.ts`

Queries using the authenticated user's ID:

1. **Rental bookings**: Join `rental_bookings` with `properties` (where `properties.owner_id = user.id`) and `profiles` (for tenant name). Select explicit columns: `id, check_in_date, check_out_date, total_amount, base_price, booking_status, payment_status, special_requests, customer_id, property_id`. Map to `RentalDetail` interface.

2. **Payments**: Query `booking_payments` for the owner's booking IDs to calculate `paidAmount`, `dueAmount`, `serviceCharges`.

3. **Reviews**: Query `property_reviews` joined with `profiles` for the owner's property IDs to get tenant reviews with ratings.

4. **Stats derivation**: Compute `activeCount`, `upcomingCount`, `totalRevenue`, `totalDues` from the fetched data.

### Step 2: Create `useAgentRentalData` hook
New file: `src/hooks/useAgentRentalData.ts`

Same structure as owner hook but filters `rental_bookings` where `agent_id = user.id`.

### Step 3: Update `OwnerRentalManagement.tsx`
- Remove all `demoRentals`, `demoRequests`, `demoReviews` constants
- Import and use `useOwnerRentalData()` hook
- Add loading spinner state
- Map database rows to `RentalDetail` interface (calculating remaining days, payment percentages from real data)
- Pass real data to `RentalFinancialSummary`, `RentalSpecialRequests`, `RentalReviewsRankings`
- Keep existing UI structure and styling unchanged

### Step 4: Update `AgentRentalManagement.tsx`
- Same refactor as owner: remove demo data, use `useAgentRentalData()` hook
- Add loading state

### Step 5: Update `RentalReviewsRankings` data flow
- The component currently receives pre-computed props (averageRating, ratingBreakdown, etc.)
- The hooks will compute these from `property_reviews` query results before passing them as props
- No changes needed to the component itself

---

## Technical Details

### Database Query Strategy (Owner)
```sql
-- Fetch rental bookings for owner's properties
SELECT rb.*, p.title, p.thumbnail_url, p.city, p.state,
       prof.full_name as tenant_name, prof.avatar_url as tenant_avatar
FROM rental_bookings rb
JOIN properties p ON p.id = rb.property_id
LEFT JOIN profiles prof ON prof.id = rb.customer_id
WHERE p.owner_id = $user_id
ORDER BY rb.created_at DESC
LIMIT 50
```

This will be done via Supabase JS client with foreign key joins.

### Data Mapping
- `booking_status` values (`confirmed`, `active`, `completed`, `cancelled`) map to `RentalDetail.status`
- `check_in_date` / `check_out_date` map to `startDate` / `endDate`
- `base_price` maps to `monthlyRent` (derived from total_amount / total_days * 30)
- `total_amount` maps to `totalRent`
- Payment sum from `booking_payments` where `payment_status = 'completed'` maps to `paidAmount`
- `dueAmount = totalRent - paidAmount`
- Tax estimated at ~10% of revenue (or from `additional_fees` JSONB if present)

### Files Changed
| File | Action |
|------|--------|
| `src/hooks/useOwnerRentalData.ts` | Create |
| `src/hooks/useAgentRentalData.ts` | Create |
| `src/components/propertyowner/OwnerRentalManagement.tsx` | Replace demo data with hook |
| `src/components/agent/AgentRentalManagement.tsx` | Replace demo data with hook |

### No Database Changes Required
All necessary tables and RLS policies already exist.

