

## Plan: Enhanced Currency + Language Display on Property Cards

### Changes Overview

**1. Enhance `<Price />` component** (`src/components/ui/Price.tsx`)
- Show currency flag + code inline next to the price (e.g., "🇺🇸 $620" instead of just "$620")
- Keep the IDR tooltip for non-IDR currencies
- Add a `showFlag` prop (default true) so it can be disabled in compact contexts

**2. Auto-link language to currency** (`src/contexts/CurrencyContext.tsx`)
- When user selects a language, auto-suggest/set the matching currency:
  - `en` → USD, `id` → IDR, `zh` → SGD, `ja` → USD, `ko` → USD
- Only auto-switch if user hasn't manually picked a currency (track with a `manuallySet` flag)

**3. Enhance `CurrencySelector.tsx`**
- Show full label with icon: `💱 🇺🇸 USD` instead of just icon + code
- Make flag + currency code always visible (not hidden on mobile)

**4. Migrate remaining ~35 files** still using `formatIDR`
- Replace with `<Price />` in JSX contexts
- Replace with `getCurrencyFormatter()` in non-React contexts (tooltips, charts)
- Key remaining files: `NeighborhoodInsights`, `MarketTrendsChart`, `PropertyList`, `MembershipPage`, `OwnerPaymentAutomation`, `EnhancedPropertyInsertForm`, `ReviewStep`, and ~28 others

### Files Modified
- `src/components/ui/Price.tsx` — add flag + currency code display
- `src/contexts/CurrencyContext.tsx` — add language→currency auto-linking
- `src/components/CurrencySelector.tsx` — improved visual with text + icon
- `src/stores/currencyStore.ts` — add flag/code metadata to store
- ~35 remaining files — migrate `formatIDR` → `<Price />` or `getCurrencyFormatter()`

