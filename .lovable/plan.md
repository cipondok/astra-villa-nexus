

## Fix remaining local `formatPrice` helpers — redirect to currency store

### Scope

~25 files define their own `formatPrice` / `formatCurrency` / `fmt` helpers with hardcoded IDR formatting, bypassing the global currency store. Each will be replaced with a one-liner delegating to `getCurrencyFormatter()` or `getCurrencyFormatterShort()`.

### Files to migrate

**Pages:**
1. `src/pages/BookingPage.tsx` — `formatPrice` → `getCurrencyFormatter()`
2. `src/pages/VRTourShowcase.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
3. `src/pages/Disewa.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
4. `src/pages/Services.tsx` — `formatPrice` with range handling → use `getCurrencyFormatter()` internally

**Property components:**
5. `src/components/property/SharePropertyButton.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
6. `src/components/property/Property3DViewerModal.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
7. `src/components/property/SocialShareDialog.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
8. `src/components/property/PropertySlideSection.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
9. `src/components/property/AdvancedFiltersDialog.tsx` — `formatPrice` → `getCurrencyFormatterShort()`

**Search components:**
10. `src/components/search/PropertyListView.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
11. `src/components/search/PropertyGridView.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
12. `src/components/search/PropertyMapView.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
13. `src/components/search/LiveSearchAutocomplete.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
14. `src/components/search/SavedSearchesPanel.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
15. `src/components/EnhancedSearchFilters.tsx` — `formatPrice` → `getCurrencyFormatterShort()`

**Dashboard / Profile:**
16. `src/components/dashboard/InvestorPropertiesSection.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
17. `src/components/profile/PreferenceDashboard.tsx` — `formatPrice` → `getCurrencyFormatterShort()`

**AI / Agent / Analytics:**
18. `src/components/ai/AIPropertyRecommendations.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
19. `src/components/agent-analytics/metrics/MarketComparison.tsx` — `formatPrice` → `getCurrencyFormatterShort()`

**Admin:**
20. `src/components/admin/UserAcquisitionManagement.tsx` — `formatCurrency` → `getCurrencyFormatter()`
21. `src/components/admin/PropertyManagementAdvanced.tsx` — `formatPrice` → `getCurrencyFormatterShort()`
22. `src/components/admin/SocialCommerceManagement.tsx` — `formatCurrency` → `getCurrencyFormatter()`

**Other:**
23. `src/components/friction/SmartPaymentFlow.tsx` — `formatPrice` → `getCurrencyFormatter()`
24. `src/components/vendor/VendorListings.tsx` — `formatPrice` → `getCurrencyFormatter()`
25. `src/components/mortgage/ScenarioComparison.tsx` — `fmt` → `getCurrencyFormatter()`
26. `src/components/rental/RentalSidebarFilters.tsx` — `formatPriceLabel` → `getCurrencyFormatterShort()`

### Pattern

Each file follows the same transformation:

```typescript
// Before:
const formatPrice = (price: number) => {
  if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}B`;
  // ...
};

// After:
import { getCurrencyFormatterShort } from "@/stores/currencyStore";
const formatPrice = getCurrencyFormatterShort();
```

For files needing full formatting (no abbreviation), use `getCurrencyFormatter()` instead.

### Excluded
- `src/pages/Dijual.tsx` — already uses `getCurrencyFormatterShort()`
- `src/components/property/PropertyDetailModal.tsx` — already uses `useCurrency()` context
- `src/components/admin/PropertyEditModal.tsx` — formats a string input for display, not a price conversion
- `src/components/admin/OrderTracking.tsx` — uses USD formatting intentionally

### Implementation approach
Will batch these in groups of ~8 files per step to stay within edit limits.

