

## Plan: Smart Currency-Aware Price Display

**Problem**: 41+ files use `formatIDR()` directly, bypassing the `CurrencyContext`. The currency selector exists but has no effect on displayed prices.

**Smart approach**: Create a `<Price />` React component + a zustand-based currency store (for non-React contexts like chart tooltips), then batch-migrate files.

### Step 1: Create `<Price />` component (`src/components/ui/Price.tsx`)
- Takes `amount` (IDR base), optional `short` (compact mode), optional `className`
- Uses `useCurrency()` internally
- When currency !== IDR, renders: **"$620"** with a subtle tooltip showing **"≈ Rp 10.000.000"**
- When currency === IDR, renders normally: **"Rp 10.000.000"**
- Tooltip via Radix `Tooltip` (already installed)

### Step 2: Create zustand currency store (`src/stores/currencyStore.ts`)
- Mirror the CurrencyContext state (currency, rates) in a zustand store
- Sync from CurrencyContext via a `<CurrencyStoreSync />` effect component
- Export `getCurrencyFormatter()` — a plain function for chart tooltip formatters and non-component contexts

### Step 3: Update `CurrencyContext.tsx`
- Add `<CurrencyStoreSync />` inside the provider to keep zustand in sync

### Step 4: Batch-migrate high-visibility files (Phase 1 — 15 key files)
Replace `formatIDR(amount)` with `<Price amount={amount} />` in:
- Property cards, listing details, search results, dashboard stats
- `PropertyOwnerOverview`, `RentalFinancialSummary`, `OwnerPropertyAnalytics`, `OwnerFinancialAnalytics`
- `PropertyCard`, `PropertyDetails`, `SmartCollectionsShowcase`
- `UserRentalDashboard`, `TenantInvoices`, `SubscriptionPlans`
- Chart tooltip formatters → use `getCurrencyFormatter()` from zustand store

### Step 5: Migrate remaining 26 files (Phase 2)
- All remaining `formatIDR` calls → `<Price />` or `getCurrencyFormatter()`
- Remove direct `formatIDR` imports once fully migrated

### Files created:
- `src/components/ui/Price.tsx`
- `src/stores/currencyStore.ts`

### Files modified:
- `src/contexts/CurrencyContext.tsx` (add store sync)
- ~41 files replacing `formatIDR()` → `<Price />` or store formatter

