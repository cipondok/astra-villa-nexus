

## i18n Migration — Batch 4: Home Components, Footer, and Property Components

### Current State
- **Migrated**: 22 files across Batches 1-3 (Analytics, Navigation, Footer partial, AuthModal, Pages, Search, Loading, RoleNav)
- **Remaining**: ~63 files still use the inline `const text = { en: ..., id: ... }` pattern

### Target Files (12)

**Home Components (4)**
1. `src/components/home/InvestorPathSelector.tsx`
2. `src/components/home/HomeIntroSlider.tsx`
3. `src/components/home/MarketplaceServices.tsx`
4. `src/components/home/AstraVillaFeatures.tsx`

**Footer (3)**
5. `src/components/footer/FooterBrand.tsx`
6. `src/components/footer/FooterSellingGuide.tsx`
7. `src/components/footer/FooterVendorHelp.tsx`

**Property Components (3)**
8. `src/components/property/PropertyDetailModal.tsx`
9. `src/components/property/CompactPropertyCard.tsx`
10. `src/components/property/Property3DViewModal.tsx`

**Common UI (2)**
11. `src/components/ThemeToggleSwitch.tsx`
12. `src/components/WhatsAppInquiryButton.tsx`

### Implementation Steps
1. Add ~150 new translation keys to `src/i18n/translations.ts` under sections: `home`, `footerBrand`, `footerSelling`, `footerVendor`, `propertyDetail`, `propertyCard`, `property3D`, `themeToggle`, `whatsapp`
2. Replace each file's `const text = { en: ..., id: ... }` + `text[language]` / `t = text[language]` with `const { t } = useTranslation()` and `t('section.key')` calls
3. Remove unused `useLanguage` imports; for footer components that receive `language` as a prop, refactor to use the hook internally instead

### Technical Notes
- Footer components (`FooterSellingGuide`, `FooterVendorHelp`, `FooterBrand`) currently receive `language` as a prop — these will switch to using `useTranslation()` directly, and the prop can be removed if no other usage exists
- `InvestorPathSelector` uses a `copy` variable instead of `text` — same migration pattern applies
- After this batch: ~34 migrated files, ~51 remaining

