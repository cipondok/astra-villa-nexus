

## Problem Analysis

The **List view** in the property search results is not working because of a critical bug in `PropertyListView.tsx`:

**The Card component has no `onClick` handler.** The `onPropertyClick` callback is passed as a prop but never wired to any element. When a user switches to list view and clicks a property card, nothing happens — no navigation occurs.

By contrast, the Grid view (`PropertyGridView`) likely has `onClick` handlers properly connected.

## Plan

### Fix: `src/components/search/PropertyListView.tsx`

1. **Add `onClick` handler to the Card** (line 60) — wire `onPropertyClick` so clicking the card navigates to the property detail page:
   ```tsx
   <Card 
     key={property.id} 
     className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-background rounded-xl border border-border/50 cursor-pointer"
     onClick={() => onPropertyClick(property)}
   >
   ```

2. **Add a "View Details" button** in the action buttons section (around line 194) so there's also an explicit button to view the property, alongside the existing Share and WhatsApp buttons:
   ```tsx
   <Button 
     variant="outline"
     onClick={(e) => {
       e.stopPropagation();
       onPropertyClick(property);
     }}
     className="flex-shrink-0"
   >
     <Eye className="h-4 w-4 mr-2" />
     Details
   </Button>
   ```

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/search/PropertyListView.tsx` | Add `onClick` to Card + add Details button |

This is a one-file fix. The root cause is simply that `onPropertyClick` was never called anywhere in the list view component.

