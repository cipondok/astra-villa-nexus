

## Plan: Add "Joining Since" Duration Labels

### What will change

1. **Create a shared utility function** `formatMemberDuration(dateString)` in `src/utils/dateUtils.ts` that converts a date into a compact year-based label:
   - Less than 1 year → "< 1 Year"  
   - 1-2 years → "1 Year"  
   - 2+ years → "2 Years", "3 Years", etc.

2. **User Profile page** (`src/pages/Profile.tsx`): Add a 4th stat box in the Quick Stats grid (change `grid-cols-3` → `grid-cols-4`) showing the member duration (e.g., "2 Years") using `profile.created_at`, with a small "Bergabung" / "Member Since" label.

3. **Property cards** — update the joining date display to show the year-based duration label instead of a formatted date:
   - `src/components/property/PropertyCard.tsx` — update `formatJoiningDate` to use duration format
   - `src/components/CompactPropertyCard.tsx` — same update
   - `src/components/PropertyCard.tsx` — same update  
   - `src/components/property/ModernPropertyCard.tsx` — update `formatJoinDate` similarly
   - `src/components/property/CompactPropertyCard.tsx` — same update

4. **PropertyPosterInfo** (`src/components/property/PropertyPosterInfo.tsx`): Update the joining date display to show duration label.

### Technical details

The utility function:
```typescript
export function formatMemberDuration(dateString: string): string {
  const now = new Date();
  const joined = new Date(dateString);
  const diffYears = Math.floor((now.getTime() - joined.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (diffYears < 1) return '< 1 Year';
  return `${diffYears} Year${diffYears > 1 ? 's' : ''}`;
}
```

All property cards and profile page will import and use this single function for consistent display.

