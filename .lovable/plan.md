

# Footer Style Update & Mobile Optimization Plan

## Current Issues

1. **MobileFooter** has excessive padding (`paddingBottom: calc(4rem + max(env(safe-area-inset-bottom), 8px) + 3.5rem)`) making it too tall
2. MobileFooter sits above the `MobileBottomTabBar` (fixed bottom nav) but has bloated spacing
3. Decorative dots at bottom waste vertical space
4. `rounded-t-3xl` creates unnecessary visual weight
5. **ProfessionalFooter** (desktop) is reasonable but the Dock takes significant vertical space

## Changes

### 1. MobileFooter — Slim Redesign
- Remove `rounded-t-3xl` — use flat top with subtle border
- Reduce icon buttons from `w-9 h-9` to `w-7 h-7` with `h-3.5 w-3.5` icons
- Remove decorative dot divider section entirely
- Reduce padding: `px-3 pt-2 pb-1` with minimal safe-area bottom offset
- Set `paddingBottom` to just `calc(env(safe-area-inset-bottom) + 56px)` to clear bottom tab bar
- Single-row compact layout: contact icons left, social icons + copyright right
- Tighter gaps between elements (`gap-1` instead of `gap-2`)

### 2. ProfessionalFooter — Slimmer Desktop
- Reduce Dock icon sizes slightly and tighten padding
- Reduce overall footer padding from `py-3` to `py-2`
- Make the footer more compact with less whitespace

### 3. LandingFooter — Consistent Slim Style
- Reduce `py-12` to `py-6` for a slimmer look
- Tighten mobile padding

### Files Modified
- `src/components/MobileFooter.tsx` — slim mobile footer
- `src/components/ProfessionalFooter.tsx` — tighter desktop footer
- `src/components/landing/LandingFooter.tsx` — slimmer landing footer

