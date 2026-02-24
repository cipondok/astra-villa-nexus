

# Dynamic SEO Meta Tags Based on Selected Language

## Problem

All 12+ pages using `<SEOHead>` pass hardcoded Indonesian strings for `title` and `description`. When a user switches to Chinese, Japanese, Korean, or English, the meta tags (page title, OG tags, Twitter cards, canonical) remain in Indonesian.

## Approach

Add a `seo` namespace to all 5 locale files with per-page titles and descriptions, then update each page's `<SEOHead>` call to use `t('seo.pageName.title')` / `t('seo.pageName.description')`.

## Step 1: Add `seo` namespace to locale files

Add translated titles and descriptions for each page:

```
seo: {
  home: { title, description },
  properties: { title, description },
  dijual: { title, description },
  disewa: { title, description },
  about: { title, description },
  contact: { title, description },
  help: { title, description },
  auth: { title, description },
  investment: { title, description },
  community: { title, description },
  agentDirectory: { title, description },
  buy: { title, description },
  rent: { title, description },
  preLaunching: { title, description },
}
```

That is ~28 keys per locale file, across 5 files = 140 translated strings.

## Step 2: Update pages to use `t()` for SEOHead props

Each page that renders `<SEOHead>` will:
1. Import `useTranslation` (if not already)
2. Replace hardcoded `title="Tentang Astra Villa"` with `title={t('seo.about.title')}`
3. Replace hardcoded `description="..."` with `description={t('seo.about.description')}`
4. Keep `keywords` as-is (keywords meta tag is largely ignored by search engines and not user-visible)

Pages to update:
- `Index.tsx` — `seo.home`
- `Properties.tsx` — `seo.properties`
- `Dijual.tsx` — `seo.dijual`
- `Disewa.tsx` — `seo.disewa`
- `About.tsx` — `seo.about`
- `Contact.tsx` — `seo.contact`
- `Help.tsx` — `seo.help`
- `Auth.tsx` — `seo.auth`
- `Investment.tsx` — `seo.investment`
- `Community.tsx` — `seo.community`
- `AgentDirectory.tsx` — `seo.agentDirectory`
- `PropertyDetail.tsx` — keeps dynamic property title (no change needed)

## Step 3: Update `<html lang>` attribute

Already done in the previous commit — `LanguageContext` sets `document.documentElement.lang` on language change.

## Files Modified

**Locale files (5):**
- `src/i18n/locales/en.ts` — add `seo` namespace (~28 keys)
- `src/i18n/locales/id.ts` — same, Indonesian
- `src/i18n/locales/zh.ts` — same, Chinese
- `src/i18n/locales/ja.ts` — same, Japanese
- `src/i18n/locales/ko.ts` — same, Korean

**Page files (11):**
- `src/pages/Index.tsx`
- `src/pages/Properties.tsx`
- `src/pages/Dijual.tsx`
- `src/pages/Disewa.tsx`
- `src/pages/About.tsx`
- `src/pages/Contact.tsx`
- `src/pages/Help.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Investment.tsx`
- `src/pages/Community.tsx`
- `src/pages/AgentDirectory.tsx`

## Risk

- **Low**: `SEOHead` already accepts string props — swapping hardcoded strings for `t()` calls is a safe pattern swap
- **PropertyDetail.tsx** is excluded because it uses the actual property title/description from the database, which is correct behavior

