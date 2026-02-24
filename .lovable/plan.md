

# Plan: Fix i18n Crash on Language Switch — Migrate Inline Translations

## Problem Found

Switching to Chinese, Japanese, or Korean **crashes the app with a 500 error**. The root cause: **53 files** use inline translation objects like `const text = { en: {...}, id: {...} }` with only English and Indonesian keys. When `language` is `'zh'`, `'ja'`, or `'ko'`, `text[language]` returns `undefined`, causing `Cannot read properties of undefined` errors.

Additionally, **30 files** use `language === 'en' ? 'English text' : 'Indonesian text'` ternaries, which silently show Indonesian text for all non-English languages (wrong but not a crash).

### Error Observed
```
TypeError: Cannot read properties of undefined (reading 'loginRequired')
  at AddProperty.tsx:146
```
Triggered by switching to 中文 (Chinese) from the language dropdown on any page that loads a component with inline translations.

## Solution Strategy

There are two approaches. Given the scale (53 files, hundreds of translation strings), the safest and fastest approach is:

**Add English fallback to all inline `text[language]` calls** — change `const t = text[language]` to `const t = text[language] || text.en` in all 21 files that use this pattern directly, plus add the `en` fallback in the remaining files that access text object properties inline. This prevents crashes immediately while the new languages show English text as a graceful degradation.

The full migration of all 53 files to centralized `t()` keys is a separate, larger effort.

## Files to Change (21 files with `const t = text[language]`)

All need `text[language]` changed to `text[language] || text.en`:

| # | File | Current |
|---|------|---------|
| 1 | `src/pages/AddProperty.tsx` | `text[language]` — **crashes** |
| 2 | `src/pages/ServiceCategory.tsx` | `text[language]` — crashes |
| 3 | `src/components/upgrade/UpgradeBanner.tsx` | `text[language]` — crashes |
| 4 | `src/components/search/StickyHeaderSearch.tsx` | `text[language]` — crashes |
| 5 | `src/components/SearchLoadingDialog.tsx` | `text[language]` — crashes |
| 6 | `src/components/CustomizableLoadingPage.tsx` | `text[language]` — crashes |
| 7 | `src/components/profile/RoleUpgradeSection.tsx` | `text[language]` — crashes |
| 8 | `src/components/property/TierLockedFeature.tsx` | `text[language]` — crashes |
| 9 | `src/components/property/TierFeatureBanner.tsx` | `text[language]` — crashes |
| 10 | `src/components/admin/FeedbackBugSystem.tsx` | `text[language]` — crashes |
| 11 | `src/components/admin/TransactionManagementTabs.tsx` | `text[language]` — crashes |
| 12 | `src/components/admin/TransactionManagementHub.tsx` | `text[language]` — crashes |
| 13 | `src/components/admin/TransactionAuditTrail.tsx` | `text[language]` — crashes |
| 14 | `src/components/admin/IndonesianTaxConfiguration.tsx` | `text[language]` — crashes |
| 15 | `src/components/admin/RealTimeTransactionMonitor.tsx` | `text[language]` — crashes |
| 16 | `src/components/admin/PaymentGatewaySettings.tsx` | `text[language]` — crashes |
| 17 | `src/components/payment/UnifiedPaymentSelector.tsx` | `text[language]` — crashes |
| 18 | `src/components/profile/ProfileCompletionStatus.tsx` | `text[language]` — crashes |
| 19 | `src/components/foreign-investment/UserInvestmentDashboard.tsx` | `text[language]` — crashes |
| 20 | `src/components/WhatsAppInquiryButton.tsx` | Already has `\|\| text.en` — safe |
| 21 | `src/pages/BlockchainVerification.tsx` | Already has `\|\| text.en` — safe |

## Additional Files with Inline `text = { en, id }` (no direct `t = text[language]` but access keys inline)

These 32+ files use `text[language].someKey` or `text.en` / `text.id` patterns directly in JSX. They also need the fallback or a wrapper. The fix here is to find where they destructure/access and add `|| text.en`:

Key files include:
- `src/components/footer/FooterInnovationHub.tsx`
- `src/components/LiveListingsSection.tsx`
- `src/components/dashboard/RoleDashboard.tsx`
- `src/components/search/AdvancedSearchPanel.tsx`
- `src/components/search/CollapsibleSearchPanel.tsx`
- `src/components/search/MainPageSearchFilters.tsx`
- `src/components/search/SmartSearchPanel.tsx`
- `src/components/property/EnhancedPropertyCard.tsx`
- `src/components/property/QuickFiltersChipBar.tsx`
- `src/components/property/AdvancedFiltersDialog.tsx`
- `src/components/auth/EnhancedSecureAuthModal.tsx`
- `src/components/ThemeToggleBar.tsx`
- `src/pages/partners/BecomePartner.tsx`
- `src/pages/partners/JointVentures.tsx`
- And ~18 more

## Changes Per File

Each file gets a one-line change:

**Before:**
```typescript
const t = text[language];
```

**After:**
```typescript
const t = text[language] || text.en;
```

For files that access `text[language]` inline in JSX (no intermediate variable), the pattern becomes:
```typescript
const t = (text as Record<string, typeof text.en>)[language] || text.en;
```

## The `language === 'en' ? ... : ...` Ternary Pattern (30 files, 560 occurrences)

These won't crash but will show Indonesian text for Chinese/Japanese/Korean users. This is a lower-priority cosmetic issue. The fix would be to either:
- Change to `language !== 'en' && language !== 'id' ? englishText : language === 'en' ? englishText : indonesianText` (ugly)
- Or migrate to centralized `t()` calls (proper but large effort)

**Recommendation:** Fix the crashing files first (this plan). The ternary pattern can be addressed in a follow-up migration to the centralized i18n system.

## Summary

- **18 files** get `text[language]` → `text[language] || text.en` (one-line fix each)
- **~32 files** with inline text objects get similar fallback treatment
- **3 files** already safe (WhatsAppInquiryButton, BlockchainVerification, PropertyListingsSection)
- Total: ~50 one-line edits across ~50 files
- Zero risk of breaking existing en/id functionality
- New languages gracefully fall back to English instead of crashing

