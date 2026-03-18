

## Plan: Polish, Backend Integration, SEO & Accessibility

### 1. Backend Integration — Newsletter Subscriber Storage

Connect the `NewsletterBanner` form to Supabase so emails are persisted:

- **Create migration**: New `newsletter_subscribers` table (`id`, `email` unique, `subscribed_at`, `source` default `'homepage'`). Enable RLS with an anon insert policy (public signup) and admin-only select.
- **Update `NewsletterBanner.tsx`**: Import supabase client, insert email on submit, handle duplicate gracefully (upsert or catch unique violation), keep existing toast UX.

### 2. SEO & Accessibility Improvements

**Accessibility across homepage sections:**

- **TestimonialsCarousel**: Add `aria-label` to nav buttons (`"Previous testimonial"`, `"Next testimonial"`), `role="region"` + `aria-roledescription="carousel"` on wrapper, `aria-live="polite"` on active slide.
- **AnimatedStatsCounter**: Add `role="list"` on container, `role="listitem"` on each stat, `aria-label` with readable text (e.g., "12,500+ Properties Listed").
- **MapPreviewTeaser**: Add `aria-label` on hotspot dots (decorative → `aria-hidden="true"`), proper `alt` on any images.
- **NewsletterBanner**: Add `aria-label="Newsletter signup"` on the form, proper `label` or `aria-label` on the email input.

**SEO enhancements on Index page:**

- Add `seoSchemas.organization()` and `seoSchemas.searchAction()` JSON-LD to the homepage `<SEOHead>` (currently may only have basic meta).
- Add descriptive `id` attributes to major homepage sections for anchor linking and crawlability.

### 3. Polish Existing Features

- **TestimonialsCarousel**: Add swipe gesture support on mobile (touch events or framer-motion drag), auto-play with pause on hover.
- **AnimatedStatsCounter**: Use `Intl.NumberFormat` for locale-aware formatting instead of manual K suffix logic.
- **MapPreviewTeaser**: Add subtle hover tooltips on hotspot dots showing city name.
- **NewsletterBanner**: Add loading state on submit button while Supabase insert is in progress.

### Technical Summary

| Area | Files Changed |
|------|--------------|
| Migration | New SQL: `newsletter_subscribers` table |
| Newsletter backend | `src/components/home/NewsletterBanner.tsx` |
| Accessibility | `TestimonialsCarousel.tsx`, `AnimatedStatsCounter.tsx`, `MapPreviewTeaser.tsx`, `NewsletterBanner.tsx` |
| SEO | `src/pages/Index.tsx` (JSON-LD schemas) |
| Polish | Same 4 home components above |

All changes are additive and non-breaking. The migration creates a new table with no impact on existing data.

