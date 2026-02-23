

# Add Verified Badge Settings to Branding Manager

## Overview

Currently, the verified badge settings live in a separate page (Design System Settings > Badge tab). The user wants all badge/icon configuration consolidated into the **Branding Manager** with enhanced controls for display on property posts.

## Changes

### 1. Add "Verified Badge" tab to Branding Manager

**File:** `src/components/admin/settings/BrandingSettings.tsx`

Add a 4th tab called **"Verified Badge"** alongside Assets, Live Preview, and AI Generator. This tab will contain an enhanced version of the current `BadgeSettingsPanel` functionality, plus new controls:

**General Settings Section:**
- Shield Style selector (Diamond / Classic / Minimal) -- existing
- Badge Text input -- existing
- Show Badge Text toggle -- existing  
- Text Style (Pill / Plain) -- existing
- Custom Logo URL or upload -- enhanced with file upload button (reusing existing `handleFileUpload` logic)

**Display Settings Section (NEW):**
- **Icon Size on Property Cards**: Slider or select for xs / sm / md / lg sizes
- **Show on Property Posts**: Toggle to enable/disable badge display on property listing cards
- **Badge Position**: Select (bottom-left, bottom-right, top-left, top-right) for where badge appears on property images
- **Animation Effect**: Select (none, pulse, bounce, glow, shimmer) for the badge animation
- **Shadow/Glow Intensity**: Slider (0-100%)

**Per-Level Color Settings Section:**
- All 6 levels (Diamond, Platinum, Gold, VIP, Silver, Premium) with color pickers -- existing
- Each level shows inline preview -- existing

**Live Preview Section:**
- Preview all sizes (XS, SM, MD) -- existing
- Preview all levels side by side -- existing  
- NEW: Mock property card preview showing the badge positioned as configured

**Save/Reset Actions:**
- Save Badge Settings button
- Reset to Defaults button

### 2. Update `BadgeSettings` type

**File:** `src/hooks/useBadgeSettings.ts`

Add new fields to the `BadgeSettings` interface:

```
displaySize: "xs" | "sm" | "md" | "lg"
showOnPropertyCards: boolean
badgePosition: "bottom-left" | "bottom-right" | "top-left" | "top-right"
animationEffect: "none" | "pulse" | "bounce" | "glow" | "shimmer"
glowIntensity: number  // 0-100
```

Update `DEFAULT_BADGE_SETTINGS` with sensible defaults (size: "sm", showOnPropertyCards: true, position: "bottom-left", animation: "none", glowIntensity: 50).

### 3. Update `BrandedStatusBadge` component

**File:** `src/components/ui/BrandedStatusBadge.tsx`

- Read `displaySize`, `animationEffect`, `glowIntensity` from badge settings
- Add a `"lg"` entry to `SIZE_MAP` (width: 42, height: 48, logoSize: 30, logoY: 8)
- Apply CSS animation classes based on the `animationEffect` setting (pulse uses `animate-pulse`, bounce uses `animate-bounce`, glow/shimmer use custom keyframes via inline styles)
- Allow the `size` prop to default to the `displaySize` from settings when not explicitly provided

### 4. Update property card badge rendering

**Files:**
- `src/components/property/PropertiesForSaleSection.tsx`
- `src/components/property/PropertiesForRentSection.tsx`
- `src/components/property/AIRecommendedProperties.tsx`

- Read `showOnPropertyCards` and `badgePosition` from `useBadgeSettings()`
- Conditionally render the badge based on `showOnPropertyCards`
- Position the badge using the configured `badgePosition` value (translate position classes accordingly)

### 5. Remove badge tab from Design System Settings

**File:** `src/pages/admin/DesignSystemSettings.tsx`

Remove the "Badge" tab and its `BadgeSettingsPanel` import since it's now in the Branding Manager.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useBadgeSettings.ts` | Add new display/animation fields to interface and defaults |
| `src/components/admin/settings/BrandingSettings.tsx` | Add "Verified Badge" tab with full settings UI |
| `src/components/ui/BrandedStatusBadge.tsx` | Add lg size, animation support, read display settings |
| `src/components/property/PropertiesForSaleSection.tsx` | Use badge settings for visibility and position |
| `src/components/property/PropertiesForRentSection.tsx` | Use badge settings for visibility and position |
| `src/components/property/AIRecommendedProperties.tsx` | Use badge settings for visibility and position |
| `src/pages/admin/DesignSystemSettings.tsx` | Remove Badge tab |

