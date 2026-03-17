

## Plan: Remove "Properti Dijual" and "Properti Disewa" Sections from Homepage

### What Changes
Remove the two property listing sections (Sale & Rent) from the homepage while keeping them accessible via their dedicated pages (`/dijual` and `/disewa`).

### Edits in `src/pages/Index.tsx`

1. **Remove lazy imports** (lines ~53-54): Delete the `PropertiesForSaleSection` and `PropertiesForRentSection` lazy imports.

2. **Remove Section 7 content** (lines ~1037-1054): Remove the entire "Properties for Sale & Rent" section wrapper including both `ScrollReveal` blocks for sale-section and rent-section. Keep the Trending Searches widget and surrounding sections intact.

The dedicated `/dijual` and `/disewa` pages remain fully functional and unchanged.

