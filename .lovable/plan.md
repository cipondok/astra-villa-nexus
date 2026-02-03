
# Fix Plan: Search Panel Tooltips & Light Mode Hover States

## Problem Analysis

After reviewing the code, I identified **two critical issues**:

1. **Nested Trigger Conflict**: The `TooltipTrigger` wraps `PopoverTrigger`, causing tooltips to never display properly. When you hover, the tooltip should appear, but clicking immediately opens the popover and dismisses the tooltip - making it seem like tooltips don't work.

2. **Light Mode Hover Text Visibility**: The hover text colors (amber-700, blue-700, etc.) may not have sufficient contrast against the light backgrounds.

---

## Technical Solution

### Issue 1: Fix Tooltip Positioning for Property Type, Location, Filters

**Current Structure (Broken)**:
```text
TooltipProvider
  Tooltip
    TooltipTrigger (asChild)
      PopoverTrigger (asChild)    <-- Nested trigger conflict
        button
    TooltipContent
```

**Fixed Structure**:
```text
TooltipProvider
  Tooltip
    TooltipTrigger asChild
      button (with Popover separate)
    TooltipContent (side="top", avoidCollisions={false}, z-index higher)
  Popover (triggered by same button state, not nested)
```

The fix will:
- Remove the nesting of PopoverTrigger inside TooltipTrigger
- Use button onClick to control Popover open state directly
- Keep Tooltip separate so it shows on hover without interference
- Add `z-[100000]` to TooltipContent to ensure it appears above everything

### Issue 2: Fix Light Mode Hover Colors

Update hover text to use darker, high-contrast colors:
- Property Type: `text-blue-800` (instead of blue-700)
- Location: `text-purple-800` (instead of purple-700)  
- Filters: `text-emerald-800` (instead of emerald-700)
- Hover background: Keep `hover:bg-amber-300/10` (subtle yellow)

### Issue 3: Equal Tab Button Sizes

The tabs already have `min-w-[70px]` applied. Will verify all four tabs (All, Buy, Rent, New Project) have consistent sizing.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/AstraSearchPanel.tsx` | Fix tooltip/popover structure, update hover colors |
| `src/components/ui/tooltip.tsx` | Increase default z-index to ensure tooltips appear on top |

---

## Code Changes Summary

### 1. Tooltip Component (tooltip.tsx)
Add higher z-index default:
```tsx
className={cn(
  "z-[100000] overflow-hidden rounded-lg glass-tooltip px-3 py-2 text-sm shadow-xl",
  // ... rest
)}
```

### 2. Property Type Button Fix (AstraSearchPanel.tsx)
Restructure to separate Tooltip from Popover:
```tsx
<TooltipProvider delayDuration={0}>
  <Tooltip>
    <TooltipTrigger asChild>
      <button 
        onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
        className="p-1.5 ... group hover:bg-amber-300/10"
      >
        <Building className="... group-hover:text-blue-800 dark:group-hover:text-blue-400" />
      </button>
    </TooltipTrigger>
    <TooltipContent 
      side="top" 
      sideOffset={8} 
      avoidCollisions={false}
      className="z-[100000]"
    >
      <p className="text-xs font-medium">Property Type</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

<Popover open={isPropertyTypeOpen} onOpenChange={setIsPropertyTypeOpen}>
  <PopoverContent ...>
    {/* content */}
  </PopoverContent>
</Popover>
```

### 3. Same Pattern for Location & Filters
Apply identical restructuring to Location button and Filters button.

---

## Expected Result

After these changes:
- Hovering over Property Type / Location / Filters icons will show tooltip text **above** the icon
- Tooltip appears instantly (delayDuration={0})
- Tooltip stays on top (z-index 100000)
- Clicking the icon opens the popover (tooltip disappears as expected)
- Light mode hover shows dark readable text (blue-800, purple-800, emerald-800)
- Tab buttons remain equal width at 70px minimum
