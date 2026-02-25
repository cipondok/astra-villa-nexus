

## Understanding

The user wants two changes:
1. **Remove** the "ASTRA Villa" text overlay from the slider (lines 587-600)
2. **Restore** the "Premium Real Estate" badge that was removed in the last diff

## Plan

### 1. Remove ASTRA Villa branding overlay (lines 587-600)
Delete the entire `ASTRA Villa Branding` block — the `<div>` containing the `<h1>` with "ASTRA" and "Villa" text.

### 2. Restore "Premium Real Estate" badge
Add back the frosted pill badge below the hero area or as a standalone overlay. Based on the diff, the original badge was:
```html
<span className="inline-block px-5 py-1.5 sm:px-8 sm:py-2 text-[10px] sm:text-xs font-semibold text-white/90 uppercase tracking-[0.35em] border border-white/15 rounded-full bg-white/5 backdrop-blur-sm">
  Premium Real Estate
</span>
```
This will be placed as a small overlay in the hero (e.g., top-center) without the large ASTRA Villa text, using the same reveal animation.

### Files to edit
- `src/pages/Index.tsx` — Remove lines 587-600 (ASTRA Villa text), replace with just the "Premium Real Estate" badge overlay.

