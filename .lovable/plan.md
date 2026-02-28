

## KPR Calculator Page

A dedicated `/kpr-calculator` page that serves as a full-featured mortgage calculator for Indonesian property buyers, wrapping the existing `MortgageCalculator` component and adding a hero section with gold theming.

### What already exists
- `MortgageCalculator` component — full calculator with bank selection, rate comparison table, scenario saving, and inquiry dialog
- `KPRAmortizationChart` — yearly amortization chart/table (used in property-level `KPRCalculator`)
- `KPRAffordability` — DTI analysis with income input (used in property-level `KPRCalculator`)
- `useMortgageCalculator` hook — Supabase-powered bank/rate data, PMT formula, amortization schedule generation
- `useSavedScenarios` — localStorage-based scenario management
- `KprScenariosTab` already links to `/kpr-calculator`

### Implementation Steps

**1. Create `src/pages/KprCalculatorPage.tsx`**
- Hero section with gold-themed header ("Simulasi KPR", "Smart Property Investment Platform" badge)
- Two-column layout (lg breakpoint): left = `MortgageCalculator` (full mode, not compact), right = sidebar with `KPRAffordability` and `KPRAmortizationChart` that sync with the calculator's state
- Actually, since `MortgageCalculator` already contains bank comparison + scenario saving + inquiry, the page just needs to wrap it with a hero and add the amortization chart + affordability sections below
- Layout: hero → `MortgageCalculator` (with `propertyPrice` defaulting to 1B IDR) → amortization chart section → affordability section
- Since `MortgageCalculator` manages its own state internally, the simplest approach is to render it as the main content and add supplementary content around it
- Mobile responsive with gold theme consistent with other pages

**2. Add route in `src/App.tsx`**
- Add lazy import for `KprCalculatorPage`
- Add `<Route path="/kpr-calculator" element={<KprCalculatorPage />} />`
- Add alias `/simulasi-kpr` for Indonesian URL

### Technical Details

The page will:
- Lazy-load via `React.lazy` matching the existing pattern in App.tsx
- Use the existing `MortgageCalculator` component in non-compact mode (already has bank comparison table, scenario saving, inquiry dialog)
- Add a standalone amortization + affordability section below the main calculator using shared state via a wrapper that lifts the calculation values
- Gold-themed hero matching the `SmartCollectionsShowcase` styling (`text-gold-primary`, `border-gold-primary/20`, etc.)
- Framer-motion entrance animations

**Files to create/edit:**
1. **Create** `src/pages/KprCalculatorPage.tsx` — page component
2. **Edit** `src/App.tsx` — add route + lazy import

