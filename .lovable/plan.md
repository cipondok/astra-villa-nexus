

# Audit Results: Inline Translation Objects with English Fallbacks

## Finding

All **41 components** using `text[language] || text.en` and all **17 components** using `copy[language] || copy.en` already have English fallbacks in place. **No component will crash** when switching to Chinese, Japanese, or Korean — the fallback to `text.en` / `copy.en` ensures they render English text instead of erroring.

## Complete Inventory (58 components with inline translations)

### Group A: `text[language] || text.en` pattern (41 files) — All safe
These components define `en` and `id` keys only, but fall back to English for zh/ja/ko:

| Category | Components |
|----------|-----------|
| **Search** (10) | `StickySearchPanel`, `AstraSearchPanel`, `ModernSearchPanel`, `SlimEnhancedSearchPanel`, `SmartSearchPanel`, `CollapsibleSearchPanel`, `MainPageSearchFilters`, `AdvancedFilters`, `PropertyAdvancedFilters`, `AdvancedSearchPanel` |
| **Search results** (3) | `PropertySearchResults`, `StickyHeaderSearch`, `AdvancedFiltersDialog` |
| **Admin** (6) | `TransactionManagementHub`, `TransactionManagementTabs`, `TransactionAuditTrail`, `RealTimeTransactionMonitor`, `IndonesianTaxConfiguration`, `FeedbackBugSystem` |
| **Auth** (2) | `AuthModal`, `SecureAuthModal` |
| **Profile** (1) | `RoleUpgradeSection` |
| **Property** (4) | `TierLockedFeature`, `TierFeatureBanner`, `PropertyDetailsStep`, `PropertyInsertForm` (hardcoded ID) |
| **Pages** (6) | `BlockchainVerification`, `ServiceCategory`, `PartnerBenefits`, `PartnerNetwork`, `BecomePartner`, `JointVentures` |
| **Footer** (2) | `FooterInnovationHub`, `FooterVendorServices` |
| **Other** (7) | `LiveListingsSection`, `CustomizableLoadingPage`, `SearchLoadingDialog`, `WhatsAppInquiryButton`, `UserInvestmentDashboard`, `UnifiedPaymentSelector`, `RoleDashboard` |

### Group B: `copy[language] || copy.en` pattern (17 files) — All safe, intentionally exempt
These are WNA/WNI investment components that use `copy` objects containing React elements (icons, styled spans). Per architecture rules, these must remain as local objects:

`WNAPage`, `WNAFaqHelp`, `WNACitizenshipInfo`, `WNARulesRegulations`, `WNAProcessingTime`, `WNAProcessProcedure`, `WNAInvestmentFacilities`, `WNAPropertyTypes`, `WNAEligibilityChecker`, `WNAFamilyBenefits`, `WelcomingCountriesList`, `WNIPage`, `KPREligibilityChecker`, `KPRRequirementsChecklist`, `KPRPaymentMethods`, `SLIKCreditChecker`, `EligibleCountriesSelector`

### Group C: Ternary chain pattern (1 file) — Safe
`SearchLoadingAnimation` uses `language === 'zh' ? ... : language === 'ja' ? ...` with English default at the end.

## Conclusion

**No action is required.** Every component using inline translation objects already has an English fallback (`|| text.en` or `|| copy.en`). Switching to Chinese, Japanese, or Korean will show English text for unmigrated components rather than crashing.

### Recommended next steps (no urgency — zero crash risk):
1. **Batch-migrate Group A** to `useTranslation()` over time for full 5-language support (currently they show English for zh/ja/ko)
2. **Group B (WNA/WNI)** should stay as-is per the architecture exception rule
3. **Group C** (`SearchLoadingAnimation`) is already fully translated inline for all 5 languages

