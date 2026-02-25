

## Plan: ASTRA Villa Rental Page Overhaul — Booking-Style Layout & User Dashboard

This is a large-scope update touching the `/disewa` rental page layout, user dashboard, and related control panels. The work is broken into 4 phases.

---

### Phase 1: Left Sidebar Filter Panel on `/disewa`

**Current state**: Filters are stacked on top of results (collapsible panels). The layout is single-column.

**Target**: Two-column desktop layout — persistent left sidebar (280px) with all filters visible, results on the right. On mobile, filters collapse into a drawer/sheet.

#### New component: `src/components/rental/RentalSidebarFilters.tsx`
A sticky left sidebar containing all filter controls in a scrollable panel:
- Search input
- Location selector (province + city)
- Property type chips (apartment, house, villa, kios, office, etc.)
- Price range slider (dual-handle)
- Rental period checkboxes (daily, weekly, monthly, yearly)
- Check-in / Check-out date pickers
- Bedrooms selector (1, 2, 3, 4, 5+)
- Bathrooms selector (1, 2, 3, 4+)
- Area range slider (min/max sqm)
- Online booking toggle
- Furnishing filter (furnished, semi, unfurnished)
- "Clear all" and "Apply" buttons
- Active filter count badge

#### Changes to `src/pages/Disewa.tsx`
- Restructure layout to `flex` with sidebar + main content area
- Desktop: sidebar fixed left (280px, sticky, scrollable), results grid on right
- Mobile: sidebar hidden, replaced by a Sheet/Drawer trigger button in the header
- Results grid changes from 4-col to 3-col on desktop (since sidebar takes space)
- Add result count header with sort dropdown above results
- Property cards remain the same

```text
┌─────────────────────────────────────────────────┐
│  Header: "Properti Disewa" | Sort | View Toggle │
├──────────┬──────────────────────────────────────┤
│ FILTERS  │  Results Grid (3-col desktop)        │
│          │                                      │
│ Search   │  ┌─────┐ ┌─────┐ ┌─────┐           │
│ Location │  │Card │ │Card │ │Card │           │
│ Type     │  └─────┘ └─────┘ └─────┘           │
│ Price    │  ┌─────┐ ┌─────┐ ┌─────┐           │
│ Period   │  │Card │ │Card │ │Card │           │
│ Dates    │  └─────┘ └─────┘ └─────┘           │
│ Rooms    │                                      │
│ Area     │  Pagination                          │
│ Options  │                                      │
├──────────┴──────────────────────────────────────┤
│  Rental Tips                                    │
└─────────────────────────────────────────────────┘
```

---

### Phase 2: Enhanced Results Display

#### Changes to property cards on `/disewa`
- Show rental period badge (Harian/Bulanan/Tahunan) prominently
- Show "Instant Booking" badge for online-bookable properties
- Add "Book Now" quick-action button on hover
- Show availability dates if set
- Rating/review count placeholder

#### Result header bar
- Total results count with active filter summary chips
- Sort options: Terbaru, Harga Terendah, Harga Tertinggi, Terpopuler
- View mode toggle (grid / list / map)
- "Save search" button

---

### Phase 3: User Rental Dashboard

#### New page: `src/pages/UserRentalDashboard.tsx` (route: `/my-rentals`)

A dedicated user dashboard for rental activity, with sidebar navigation:

**Sidebar tabs / sections:**
1. **Current Bookings** — Active/upcoming rental bookings with status (pending, confirmed, check-in today)
2. **Booking History** — Past completed/cancelled bookings with details
3. **Favourites** — Saved rental properties (reuses existing `useFavorites` hook, filtered to rentals)
4. **Cancel & Refund** — View cancelled bookings, request refunds, track refund status
5. **Settings** — Notification preferences, rental preferences, payment methods

Each section as a tab or sidebar nav item. Reuses existing `usePropertyBooking` hook for booking data and `useFavorites` for saved properties.

#### Database considerations
- Existing `property_bookings` table handles bookings
- Existing `favorites` table handles saved properties
- May need a `refund_requests` table for cancel/refund tracking (new migration)

#### New migration: `refund_requests` table
```sql
CREATE TABLE public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.property_bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  amount NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','processed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refund requests"
  ON public.refund_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create refund requests"
  ON public.refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

---

### Phase 4: Agent/Owner Rental Control Panel & Admin Updates

#### Agent Dashboard updates (`src/pages/AgentDashboard.tsx`)
- Add "Rental Listings" tab showing agent's rental properties
- Booking requests received (pending confirmations)
- Rental calendar view showing occupancy
- Quick stats: active rentals, pending bookings, revenue

#### Property Owner Dashboard updates (`src/pages/PropertyOwnerDashboard.tsx`)
- Add rental management section
- View all booking requests for owned properties
- Approve/reject bookings
- Set availability calendar
- Rental income tracking

#### Admin Dashboard updates
- Rental bookings overview (all bookings across platform)
- Refund request management (approve/reject refunds)
- Rental analytics (occupancy rates, revenue, popular locations)

---

### Files to Create
1. `src/components/rental/RentalSidebarFilters.tsx` — Left sidebar filter panel
2. `src/components/rental/RentalMobileFilterSheet.tsx` — Mobile drawer version
3. `src/pages/UserRentalDashboard.tsx` — User rental dashboard page
4. `src/components/rental/UserBookingsList.tsx` — Current/history bookings component
5. `src/components/rental/RefundRequestPanel.tsx` — Cancel & refund section
6. `src/components/rental/RentalSettingsPanel.tsx` — User rental settings

### Files to Modify
1. `src/pages/Disewa.tsx` — Major restructure for sidebar layout
2. `src/App.tsx` — Add route for `/my-rentals`
3. `src/pages/AgentDashboard.tsx` — Add rental management tab
4. `src/pages/PropertyOwnerDashboard.tsx` — Add rental section
5. `src/components/Navigation.tsx` — Add "My Rentals" link for logged-in users

### Implementation Order
Phase 1 and 2 first (the /disewa page overhaul), then Phase 3 (user dashboard), then Phase 4 (agent/owner/admin). Each phase will be implemented incrementally to keep changes reviewable.

