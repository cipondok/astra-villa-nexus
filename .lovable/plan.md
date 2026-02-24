

## i18n Migration — Batch 3: Core Pages & Search Components

### Current State
- **Migrated**: Analytics suite, Navigation, Footer, AuthModal, GlobalLoadingIndicator (10 files)
- **Remaining**: ~75 files still use the inline `const text = { en: ..., id: ... }` pattern

### Plan

This batch targets **high-traffic pages and search components** — the parts users interact with most.

#### Files to migrate (12 files):

**Pages (5)**
1. `src/pages/Profile.tsx` — user profile page
2. `src/pages/Contact.tsx` — contact page
3. `src/pages/About.tsx` — about page
4. `src/pages/Services.tsx` — services page
5. `src/pages/PropertySearch.tsx` — property search page

**Search Components (4)**
6. `src/components/SearchFilters.tsx` — main search filters
7. `src/components/search/SearchTabToggle.tsx` — buy/rent toggle
8. `src/components/search/EnhancedSearchFilters.tsx` — enhanced filters
9. `src/components/EnhancedModernSearchPanel.tsx` — modern search panel

**Common UI (3)**
10. `src/components/LoadingPage.tsx` — loading screen
11. `src/components/LoadingPopup.tsx` — loading popup
12. `src/components/RoleBasedNavigation.tsx` — role-based nav

#### Implementation steps:
1. Add all new translation keys to `src/i18n/translations.ts` under sections: `profile`, `contact`, `about`, `services`, `propertySearch`, `search`, `loading`, `roleNav`
2. Replace each file's inline `const text = { en: ..., id: ... }` + `text[language]` pattern with `const { t } = useTranslation()` and `t('section.key')` calls
3. Remove the now-unused `useLanguage` import from migrated files (where no other usage exists)

#### Technical note
- Each file's translations will be namespaced under a logical key (e.g., `profile.*`, `search.*`)
- The `tArray()` helper will be used where list data exists
- Fallback to English is automatic via the hook

This brings the total migrated count to ~22 files, covering the most user-facing surfaces. Approximately 63 files will remain for future batches.

