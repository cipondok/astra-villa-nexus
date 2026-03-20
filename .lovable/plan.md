

# Footer Fix & Post-Property Mobile Optimization

## Problems Identified

1. **Double footer on mobile**: `MobileFooter` (social/contact bar) renders on ALL non-admin routes including `/post-property`, stacking above `MobileBottomTabBar` — two bars at the bottom
2. **AddProperty page** not optimized for mobile — uses desktop-style layout with `min-h-screen`, no bottom padding for tab bar clearance, header not mobile-optimized

## Changes

### 1. Hide MobileFooter on form/action pages (App.tsx)
- Add `/post-property` and `/add-property` to a list of routes where `MobileFooter` is hidden on mobile
- These are full-screen task pages where the social footer adds no value and wastes space

### 2. Mobile-optimize AddProperty page (AddProperty.tsx)
- Use `min-h-[100dvh]` instead of `min-h-screen` for proper mobile viewport
- Add `pb-20` to main content to clear bottom tab bar
- Make header slimmer on mobile: reduce padding, smaller text
- Tighten card padding and tab styling for mobile
- Reduce form card border radius and shadows for mobile-native feel

### Files Modified
- `src/App.tsx` — conditionally hide MobileFooter on post-property/add-property routes
- `src/pages/AddProperty.tsx` — mobile-first responsive styling
- `src/components/MobileFooter.tsx` — add route-based hiding logic internally

