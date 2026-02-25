

## Plan: Restyle Search Panel to Match Luxury Gold Theme

### Problem
The search panel on the hero slider uses blue-themed tab indicators and generic white/glass styling that doesn't match the premium gold branding ("ASTRA Villa Property") above it. The tab slider uses blue gradients (`hsl(205-215, 100%, 50-55%)`), hover states reference blue colors, and the overall panel lacks the gold-accent cohesion.

### Changes Required

**File 1: `src/index.css` (lines 986-1052) — Restyle search tabs from blue to gold**

- **Tab slider gradient** (lines 994-997): Change from blue (`hsl(205-215)`) to gold (`hsl(38-45)`) gradient
- **Tab slider box-shadow** (lines 1000-1003): Change blue shadows to gold-primary shadows
- **Tab button focus ring** (line 1020): Change `focus-visible:ring-blue-400/50` to `focus-visible:ring-gold-primary/50`
- **Inactive tab hover** (line 1028): Change `text-blue-400 dark:text-blue-300` to gold-primary tones
- **Active tab text**: Keep white but ensure gold glow text-shadow

**File 2: `src/components/AstraSearchPanel.tsx` — Gold-themed container and input**

- **Container border** (line 2367): Change `border-white/20 dark:border-white/10` to `border-white/20 dark:border-white/10` with a subtle gold accent — use `border-gold-primary/15`
- **Top shine line** (line 2369): Change `via-white/40` to `via-gold-primary/30` for a gold shine effect
- **Search input** (lines 2481-2484): Already uses `border-gold-primary/15` — keep as is
- **Search icon** (line 2446): Change `text-primary/70` to `text-gold-primary/70` so it matches the gold theme

**File 3: `src/pages/Index.tsx` — Gold-themed hero search area**

- **"AI-Powered Search" badge** (lines 718-729): Change the badge styling from `bg-white/10 border-white/20` to `bg-gold-primary/10 border-gold-primary/20` with gold sparkle icons
- **"Find Your Dream Property" heading** (line 731): Add a subtle gold text-shadow or gradient accent
- **Subtitle search icon and text** (lines 734-737): Tint the search icon gold

### Specific Changes

#### `src/index.css`
```css
/* Tab slider: blue → gold */
.search-tab-slider {
  background: linear-gradient(135deg, 
    hsl(45, 90%, 50%) 0%, 
    hsl(38, 85%, 45%) 50%, 
    hsl(45, 90%, 50%) 100%);
  box-shadow: 
    0 4px 15px hsl(45 80% 50% / 0.4),
    0 2px 8px hsl(45 80% 50% / 0.3),
    inset 0 1px 0 hsl(0 0% 100% / 0.3);
}

/* Inactive hover: blue → gold */
.search-tab-btn:not(.active):hover {
  @apply text-gold-primary;
}

/* Focus ring: blue → gold */
.search-tab-btn {
  @apply focus-visible:ring-gold-primary/50;
}
```

#### `src/components/AstraSearchPanel.tsx`
- Line 2367: Add `border-gold-primary/15` to container
- Line 2369: Change shine line to gold: `via-gold-primary/30`
- Line 2446: Change search icon to `text-gold-primary/70`

#### `src/pages/Index.tsx`
- Lines 721-722: Badge → `bg-gold-primary/10 border-gold-primary/25`
- Line 731: Add gold drop-shadow to heading

### Visual Result
- Tab slider glows gold instead of blue
- Tab hover states use gold tones
- Container has subtle gold border shimmer
- Top shine line is gold-tinted
- "AI-Powered Search" badge matches the gold aesthetic
- Everything coheres with the "ASTRA" gold branding above

