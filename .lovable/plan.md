

# Migration Plan: Secondary Components to Centralized `t()` Hook

## Scope

Migrate **8 high-visibility secondary components** from inline `const t = { en: {...}, id: {...} }` objects to `useTranslation()` + `t('namespace.key')`. These components are visible on the homepage, profile, and search flows.

## Components to Migrate (Priority Order)

| # | Component | Current Pattern | Locale Keys Exist? |
|---|-----------|----------------|---------------------|
| 1 | `ProfileCompletionStatus.tsx` | Inline `text = { en, id }` + `step.label = { en, id }` | ✅ Yes (`profileCompletion.*`) |
| 2 | `ProfileLocationSelector.tsx` | Inline `t = { en, id }` → `text = t[language]` | ❌ Need to add (`profileLocation.*`) |
| 3 | `EnhancedPropertyCard.tsx` | Inline `text = { en, id }` | ✅ Yes (`propertyCard.*`) |
| 4 | `PropertyListingsSection.tsx` | Inline `text = { en, id }` | ❌ Need to add (`propertyListings.*`) |
| 5 | `ThemeToggleBar.tsx` | Inline `text = { en, id }` | ✅ Yes (`themeToggle.*`) |
| 6 | `ModernSearchFilters.tsx` | Inline `text = { en, id }` | ✅ Partial (`searchFilters.*` — missing some keys like `filters`, `advancedFilters`, `furnishing`, `amenities`, etc.) |
| 7 | `AuthenticatedNavigation.tsx` | Inline `text = { en, id }` | ❌ Need to add (`authenticatedNav.*`) |
| 8 | `AuthModal.tsx` | Inline `text = { en, id }` | ❌ Need to add (`authModal.*` body text) |

## Technical Approach

### Step 1: Add Missing Locale Keys (all 5 locale files)

Add new namespaces to `en.ts`, `id.ts`, `zh.ts`, `ja.ts`, `ko.ts`:

- **`profileLocation`** — ~13 keys (province, city, district, subdistrict, buildingAddress, selectProvince, selectCity, selectDistrict, selectSubdistrict, selectProvinceFirst, selectCityFirst, selectDistrictFirst, loading, buildingPlaceholder, step)
- **`propertyListings`** — ~10 keys (title, subtitle, noResults, searchResults, noFeaturedProperties, showingResults, loadingProperties, tryDifferentSearch, browseAll, connectionIssue)
- **`authenticatedNav`** — ~14 keys (home, properties, myProperties, addProperty, browse, forSale, forRent, newProjects, preLaunching, dashboard, admin, profile, settings, logout, welcome)
- **`authModal`** — ~12 keys (loginTitle, registerTitle, email, password, signIn, forgotPassword, noAccount, haveAccount, register, loginSubtitle, registerSubtitle, orContinueWith)
- Extend **`searchFilters`** with missing keys: filters, advancedFilters, furnishing, amenities, clearAll, activeFilters, showingResults, furnished, unfurnished, partiallyFurnished, anyFurnishing, apartment, house, villa, condo
- Extend **`propertyCard`** with missing keys: save, share, bedrooms, bathrooms, area, parking, forLease

### Step 2: Refactor Each Component

For each component:
1. Import `useTranslation` from `@/i18n/useTranslation`
2. Replace inline `text = { en: {...}, id: {...} }` with `const { t } = useTranslation()`
3. Replace all `currentText.xyz` / `text.xyz` references with `t('namespace.xyz')`
4. For `ProfileCompletionStatus`: also migrate `step.label` from `{ en, id }` to `t('profileCompletion.addName')` etc.
5. Remove the `language` prop where it was only used for inline translations (keep if used for other purposes like formatting)

### Step 3: Update Parent Components

- `ThemeToggleBar` and `EnhancedPropertyCard` receive `language` as a prop — after migration they'll use `useTranslation()` internally, so the `language` prop can be removed from their interface (but kept for backward compatibility if other parents depend on the type)

## Files Modified

**Locale files (5):**
- `src/i18n/locales/en.ts` — add ~50 new keys across 4 new namespaces + extend 2 existing
- `src/i18n/locales/id.ts` — same structure, Indonesian translations
- `src/i18n/locales/zh.ts` — same structure, Chinese translations
- `src/i18n/locales/ja.ts` — same structure, Japanese translations
- `src/i18n/locales/ko.ts` — same structure, Korean translations

**Components (8):**
- `src/components/profile/ProfileCompletionStatus.tsx`
- `src/components/profile/ProfileLocationSelector.tsx`
- `src/components/property/EnhancedPropertyCard.tsx`
- `src/components/PropertyListingsSection.tsx`
- `src/components/ThemeToggleBar.tsx`
- `src/components/search/ModernSearchFilters.tsx`
- `src/components/navigation/AuthenticatedNavigation.tsx`
- `src/components/auth/AuthModal.tsx`

## Risk Assessment

- **Low risk**: All components already have English fallback via `text[language] || text.en`, so the migration is a pattern swap with no behavioral change
- **Backward compatibility**: Components that receive `language` as a prop will continue to accept it (unused) to avoid breaking parent call sites
- **No new dependencies**: `useTranslation` is already used project-wide

