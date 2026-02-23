

# Enhance 3D Shield Badge: Bigger Embossed Logo + 3D Multi-Color Text

## What Changes

### 1. Make the logo much bigger and embossed on the shield

**File:** `src/components/ui/BrandedStatusBadge.tsx`

- Increase `logoSize` in SIZE_MAP significantly (roughly 60-70% of shield width instead of current ~45%)
  - xs: 10 -> 14, sm: 12 -> 18, md: 15 -> 22, lg: 18 -> 28
- Replace the flat white filter with an **embossed effect** using SVG filters:
  - `feMorphology` to create a slight outline/edge
  - `feSpecularLighting` + `fePointLight` for a raised/embossed 3D look on the logo
  - `feComposite` to blend the embossed highlight with the white logo
- This makes the logo look stamped/pressed into the shield metal surface
- Center the logo slightly higher (y offset adjusted) so it sits in the shield's visual center

### 2. Diamond/Titanium default color scheme

**File:** `src/hooks/useBadgeSettings.ts`

- Update the `diamond` level default colors to a richer titanium-diamond palette:
  - shieldColor: `#4fc3f7` (bright diamond blue)
  - shieldLight: `#b3e5fc` (icy highlight)  
  - shieldDark: `#01579b` (deep titanium)

### 3. 3D multi-color badge text

**File:** `src/components/ui/BrandedStatusBadge.tsx`

- When badge text is shown, render it with a **3D multi-color gradient effect**:
  - Use CSS `background: linear-gradient(...)` with multiple color stops matching the shield colors (light -> main -> dark)
  - Apply `background-clip: text` + `color: transparent` for gradient text
  - Add `text-shadow` with offset for 3D depth effect
  - Add a subtle `drop-shadow` filter for the raised look
- For "pill" style: keep the gradient background but make it a metallic gradient instead of flat color

## Technical Details

### Embossed logo SVG filter
```xml
<filter id="emboss">
  <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>
  <feGaussianBlur stdDeviation="0.5" result="blur"/>
  <feSpecularLighting surfaceScale="3" specularConstant="0.8" specularExponent="20" result="spec">
    <fePointLight x="10" y="8" z="15"/>
  </feSpecularLighting>
  <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
  <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.6" k4="0"/>
</filter>
```

### 3D gradient text CSS
```css
background: linear-gradient(135deg, lightColor, color, darkColor);
-webkit-background-clip: text;
color: transparent;
text-shadow: 0px 1px 1px rgba(0,0,0,0.3);
```

### Files to modify

| File | Change |
|------|--------|
| `src/components/ui/BrandedStatusBadge.tsx` | Bigger logo sizes, embossed SVG filter, 3D gradient text |
| `src/hooks/useBadgeSettings.ts` | Updated diamond/titanium default colors |

