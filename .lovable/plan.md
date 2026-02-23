

# Update "Properti Dijual" Property Card Display

## Problems Found

1. **Light mode visibility issues** in `PropertiesForSaleSection.tsx`:
   - Image overlay badges use `text-primary-foreground` (white in light mode) which is invisible against light images
   - Property type badge uses `bg-background/20` which is nearly transparent white in light mode
   - Image count badge uses similar broken overlay styling
   - "JUAL" badge uses `text-primary-foreground` instead of fixed `text-white`

2. **Price section colors**: Gradient text using `chart-1`/`primary`/`chart-4` clip may lack contrast in light mode. The price container uses `chart-1/15` backgrounds that can appear washed out.

3. **Sizing**: Text is extremely small (`text-[9px]`, `text-[10px]`, `text-[11px]`) making it hard to read on mobile.

## Changes

### File: `src/components/property/PropertiesForSaleSection.tsx`

#### 1. Fix image overlay badges for both color modes
- **"JUAL" badge (line 146)**: Change to use the unified emerald gradient style (`bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md`) matching the standard established in other cards. Remove `text-primary-foreground` and `ring` styling.
- **Property type badge (line 150)**: Replace `bg-background/20 text-primary-foreground border-background/30` with fixed `bg-black/40 backdrop-blur-md text-white` for guaranteed contrast.
- **Image count badge (line 158)**: Replace `bg-background/15 text-primary-foreground border-background/25` with `bg-black/40 backdrop-blur-md text-white`.
- **Hover eye icon (line 173)**: Replace `bg-background/80 ring-chart-1/50 text-chart-1` with `bg-primary/90 backdrop-blur-sm text-white shadow-lg` for consistent visibility.

#### 2. Update price display for better contrast
- **Price container (line 182)**: Simplify from complex multi-gradient to `bg-primary/5 border-primary/15` for clean light/dark compatibility.
- **Price text (line 183)**: Change from gradient clip-text to solid `text-primary font-black` for reliable readability in both modes.
- **Price suffix (line 185)**: Change from `text-chart-1/70` to `text-primary/60`.
- **Monthly estimate (line 187)**: Simplify to `text-muted-foreground/50 bg-muted/50` removing dark-mode-only overrides.

#### 3. Improve sizing for readability
- Price main text: `text-base` to `text-sm sm:text-base` (stays responsive)
- Title: `text-[11px]` to `text-xs` for better readability
- Location: `text-[10px]` to `text-[11px]`
- Spec values: `text-[10px]` to `text-[11px]`

#### 4. Simplify location row
- Replace gradient background (`from-primary/10 via-chart-4/8 to-chart-1/10 border-primary/25`) with plain layout using `text-muted-foreground` -- no colored container needed for a simple location line.

#### 5. Simplify spec badges
- Replace colorful gradient spec containers (chart-5, chart-4, gold-primary backgrounds) with simpler `text-muted-foreground` styling using semantic tokens only, matching the cleaner approach in `ASTRAVillaPropertyCard`.

#### 6. Fix card container border
- Line 130: Replace `border-border/30 dark:border-border/15` with `border-border` for consistent visibility. Remove the complex `before:` pseudo-element gradient overlay.

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/property/PropertiesForSaleSection.tsx` | Fix overlay colors, price display, sizing, simplify specs and location styling |

