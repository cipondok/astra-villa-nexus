

# Plan: Add Chinese, Japanese, and Korean Language Support

## Overview
Add three new languages (Chinese/zh, Japanese/ja, Korean/ko) to the existing i18n system. This involves updating the type system, context, translation file, and language switcher UI.

## Architecture

The current system has a `Language` type union (`"en" | "id"`), a single `translations.ts` file (~1583 lines with both EN and ID), and a toggle switch that only handles two languages. All three touchpoints need updating.

## File Structure Change

The translations file is already ~1600 lines. Adding 3 more languages (~800 lines each) would make it ~4000 lines. To keep it maintainable, translations will be split into per-language files:

```text
src/i18n/
├── translations.ts       → re-export aggregator
├── useTranslation.ts     → no changes needed
├── locales/
│   ├── en.ts             → English strings (extracted from current file)
│   ├── id.ts             → Indonesian strings (extracted from current file)
│   ├── zh.ts             → Chinese (Simplified)
│   ├── ja.ts             → Japanese
│   └── ko.ts             → Korean
```

## Changes Required

### 1. Create `src/i18n/locales/` directory with 5 locale files
- Extract existing `en` block (~798 lines) into `locales/en.ts`
- Extract existing `id` block (~780 lines) into `locales/id.ts`
- Create `locales/zh.ts` with Simplified Chinese translations for all keys
- Create `locales/ja.ts` with Japanese translations for all keys
- Create `locales/ko.ts` with Korean translations for all keys

### 2. Update `src/i18n/translations.ts`
- Import from locale files and re-export the aggregated `Record<Language, TranslationMap>`
- Update `Language` type to `'en' | 'id' | 'zh' | 'ja' | 'ko'`

### 3. Update `src/contexts/LanguageContext.tsx`
- Expand `Language` type to include `'zh' | 'ja' | 'ko'`
- Update localStorage validation to accept new language codes

### 4. Replace `src/components/LanguageToggleSwitch.tsx`
- Replace the binary toggle with a dropdown selector showing all 5 languages
- Display language names in their native script (e.g., 中文, 日本語, 한국어)
- Use a compact dropdown or popover design to fit the existing UI

### 5. Update `public/manifest.json`
- No required change (lang stays "en" as default)

## Technical Notes
- The `useTranslation` hook's fallback-to-English logic already handles missing keys, so partial translations in new languages will gracefully degrade
- All ~40 migrated components continue working with zero changes — they use `t('key')` which resolves through the same hook
- New translations will cover all existing key namespaces (common, nav, auth, property, analytics, search, footer, about, contact, services, etc.)

