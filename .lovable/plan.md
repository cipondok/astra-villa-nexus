

## SEO Settings Hub - Complete Implementation Plan

### Current State
SEO settings are scattered across the **General Settings** tab (SEO config, Open Graph, analytics, technical SEO, webmaster verification all mixed with site name/maintenance mode). There is no dedicated SEO hub.

### Plan

**1. Create dedicated `SEOSettingsHub.tsx` component** (`src/components/admin/settings/SEOSettingsHub.tsx`)

A comprehensive SEO management center with internal tabs/accordion sections:

- **On-Page SEO**: Title templates, meta description, keywords, canonical URL settings, robots directives per page type
- **Open Graph & Social**: OG title/description/image, Twitter card type/handle, social preview simulator (live preview of how links appear on Facebook/Twitter/Google)
- **Schema Markup / Structured Data**: Organization type, name, logo, contact info; toggle JSON-LD types (RealEstateListing, BreadcrumbList, SearchAction, FAQPage); live JSON-LD preview
- **Technical SEO**: Sitemap toggle, robots.txt editor, canonical URLs toggle, hreflang settings, page speed hints
- **Analytics & Tracking**: Google Analytics ID, GTM ID, Facebook Pixel, Hotjar, cookie consent toggle
- **Webmaster Verification**: Google, Bing, Yandex, Pinterest verification codes
- **SEO Score / Audit**: Real-time SEO score algorithm that checks completeness of title (length 50-60), description (150-160 chars), keywords present, OG image set, schema enabled, sitemap enabled, analytics connected -- displays score out of 100 with color-coded badges and improvement suggestions
- **Page-Level SEO Manager**: Table listing key pages (Home, Dijual, Disewa, Search, etc.) with per-page title/description override fields

**2. Add new "SEO Hub" tab to `SystemSettings.tsx`**

Replace the current "General & SEO" combined tab with two separate tabs:
- **General** (site name, maintenance, registration only)
- **SEO Hub** (all SEO functionality consolidated)

**3. Extract SEO sections from `GeneralSettings.tsx`**

Remove SEO Configuration, Social Media Integration, Analytics & Tracking, Technical SEO, and Webmaster Verification cards. Keep only: Maintenance Mode, Basic Site Configuration, and Save button.

**4. Add SEO algorithm settings to `useSystemSettings.ts`**

New keys: `seoTitleTemplate`, `seoDefaultRobots`, `seoHreflang`, `seoPageOverrides` (JSON string for per-page meta), `seoAuditAutoRun`.

### Files to Create/Modify
- **Create**: `src/components/admin/settings/SEOSettingsHub.tsx`
- **Modify**: `src/components/admin/SystemSettings.tsx` (add SEO Hub tab)
- **Modify**: `src/components/admin/settings/GeneralSettings.tsx` (remove SEO sections)
- **Modify**: `src/hooks/useSystemSettings.ts` (add new SEO keys)

