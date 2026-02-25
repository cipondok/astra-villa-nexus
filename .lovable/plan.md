

## Next Steps: Complete the Filter-to-Backend Pipeline and Polish

Based on the current state, the filters UI, DB columns, property form, and admin settings are all in place. Here is what should come next to make the system fully production-ready:

### 1. Add "Select All / Deselect All" buttons to Nearby Facilities filter
The nearby facilities section has 21 checkboxes but no bulk actions beyond clearing. Add "Pilih Semua" and "Hapus Semua" buttons at the top of the section for quick toggling.

**File:** `src/components/rental/RentalSidebarFilters.tsx` (lines 766-797)

### 2. Sync Mobile Filter Sheet active count with desktop
The `RentalMobileFilterSheet` only counts 9 filter types in its badge, while the desktop sidebar counts ~28. Update the mobile sheet to match.

**File:** `src/components/rental/RentalMobileFilterSheet.tsx` (lines 19-29)

### 3. Add missing property form fields for Indonesian specs
The `RoleBasedPropertyForm` has nearby_facilities and payment_methods but is missing input fields for several columns that the filter queries against:
- `land_area_sqm`, `building_area_sqm`, `floors`, `has_pool`, `garage_count`
- `view_type`, `furnishing`
- `roi_percentage`, `rental_yield_percentage`
- `legal_status`, `wna_eligible`, `payment_plan_available`, `handover_year`
- `has_vr`, `has_360_view`, `has_drone_video`, `has_interactive_floorplan`

These fields are queried by the filters but never populated via the form, meaning filters will always return empty results for them.

**File:** `src/components/property/RoleBasedPropertyForm.tsx` -- add form sections for all missing fields, grouped into collapsible sections (Specs, Investment, Technology).

### 4. Admin NearbyFacilitiesSettings -- wire to database
The settings component was created but currently uses local state. It should read/write from a `system_settings` or `filter_options` table so admins can actually persist changes to the available filter options.

**File:** `src/components/admin/settings/NearbyFacilitiesSettings.tsx`

### Technical Summary

```text
┌────────────────────────┐
│  Sidebar Filters (UI)  │ ← Add Select All/Deselect All
├────────────────────────┤
│  Mobile Filter Sheet   │ ← Sync active filter count  
├────────────────────────┤
│  Property Form         │ ← Add ~15 missing input fields
├────────────────────────┤
│  Admin Settings        │ ← Persist to DB (system_settings)
├────────────────────────┤
│  DB / Queries          │ ← Already complete ✓
└────────────────────────┘
```

### Estimated changes
- **RentalSidebarFilters.tsx**: Add 2 bulk action buttons (~10 lines)
- **RentalMobileFilterSheet.tsx**: Update active filter count (~20 lines)
- **RoleBasedPropertyForm.tsx**: Add ~200 lines of form fields for missing columns
- **NearbyFacilitiesSettings.tsx**: Add Supabase read/write integration (~50 lines)

