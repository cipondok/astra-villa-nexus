

## Plan: Add ASTRA Token Wallet & Daily Check-in Widget to Property Owner Dashboard

### What will be added
A smart, compact ASTRA Token section on the property owner overview page — placed between the "Key Performance Metrics" card and "Aksi Cepat" section. It will show:
- Token balance (available + lifetime)
- Daily check-in button with streak info
- Streak progress bar
- Quick link to full ASTRA hub

### Implementation Steps

1. **Import `AstraTokenWidget`** into `PropertyOwnerOverview.tsx` and add it between the performance metrics card (line ~272) and the smart navigation links section (line ~274).

2. **Use the existing full-mode widget** (`<AstraTokenWidget />`) — it already contains:
   - Balance display (available + lifetime)
   - Daily check-in button with streak tracking
   - Streak progress bar with milestone info
   - Transaction bonus info
   - Quick action links to the ASTRA hub

No new components, hooks, or database changes required — the existing `AstraTokenWidget` handles everything via the `astra-token-hub` edge function.

### File Changes
- `src/components/propertyowner/PropertyOwnerOverview.tsx` — add import + render `<AstraTokenWidget />` in the overview layout

