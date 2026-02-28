

## Plan: Make "Performa Ringkas" Card Collapsible (Smart Minimum Style)

### Changes to `src/components/propertyowner/PropertyOwnerOverview.tsx`

**Lines 241-276** — Replace the static card with a collapsible version:

1. Add `useState` for `perfExpanded` (default `false`)
2. **Collapsed state**: Single row showing key stats inline (Tingkat Aktif %, Konversi %, Views count, Saved count) as compact badges
3. **Expanded state** (on click): Reveal the full grid with progress bars and details using `framer-motion` `AnimatePresence` for smooth expand/collapse
4. Add `ChevronDown` icon that rotates when expanded
5. Follow same pattern as `OwnerAstraTokenCard` — clickable header bar toggles content

### Layout
```text
COLLAPSED (default):
┌─────────────────────────────────────────────┐
│ 📊 Performa Ringkas  [68% | 3.2% | 👁124 | ♥12]  ▼ │
└─────────────────────────────────────────────┘

EXPANDED (on click):
┌─────────────────────────────────────────────┐
│ 📊 Performa Ringkas  [68% | 3.2% | 👁124 | ♥12]  ▲ │
│ ┌──────────────┐ ┌──────────────┐           │
│ │ Tingkat Aktif │ │  Konversi    │           │
│ │ 68%  ████░░  │ │  3.2% ██░░░  │           │
│ └──────────────┘ └──────────────┘           │
│ ┌──────────────┐ ┌──────────────┐           │
│ │ 👁 Views 124 │ │ ♥ Saved 12   │           │
│ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────┘
```

### File: `PropertyOwnerOverview.tsx`
- Add `perfExpanded` state
- Replace lines 241-276 with collapsible card using `motion.div` + `AnimatePresence`

