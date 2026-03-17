

## Plan: Tighten Homepage Spacing and Margins

### Problem
Multiple sections have excessive vertical padding, large margins between sections, and the SectionDividerCTA components add extra breathing room that creates a "loose" feel.

### Changes

#### 1. `src/components/home/SectionDividerCTA.tsx`
- Reduce outer padding from `py-6 sm:py-8 my-2` to `py-3 sm:py-4 my-0`
- Reduce inner padding from `px-5 sm:px-8 py-4 sm:py-5` to `px-4 sm:px-6 py-3 sm:py-3.5`

#### 2. `src/components/home/AIPriceEstimatorCTA.tsx`
- Reduce section padding from `py-10 sm:py-14` to `py-5 sm:py-6`
- Reduce inner padding from `p-6 sm:p-10 lg:p-12` to `p-5 sm:p-6 lg:p-8`

#### 3. `src/components/home/EarlyInvestmentCTA.tsx`
- Reduce section padding from `py-6 sm:py-8` to `py-3 sm:py-4`

#### 4. `src/components/home/TrustFooterStrip.tsx`
- Reduce padding from `py-5 sm:py-6` to `py-3 sm:py-4`
- Reduce heading margin from `mb-4` to `mb-2.5`
- Reduce bottom margin from `mt-4` to `mt-2.5`

#### 5. `src/pages/Index.tsx` (discovery flow sections)
- Hero-to-ticker divider: reduce `h-4 sm:h-5` to `h-2 sm:h-3` (line ~704)
- AI Opportunity Zone: reduce `py-4 sm:py-6` to `py-3 sm:py-4` (line ~862)
- Section heading `mb-4` to `mb-3` (line ~865)
- Grid margins `mt-4` to `mt-3` across AI zone grids (lines ~888, 893, 898)
- ASTRA Showcase section: reduce `py-6 sm:py-8` to `py-3 sm:py-4` (line ~964)
- Final CTA wrapper: reduce `py-3 sm:py-4` to `py-2 sm:py-3` (line ~975)
- Investor Path bg wrapper: no extra padding needed (already tight)

#### 6. `src/components/home/PartnerLogosMarquee.tsx`
- Review and tighten any excess vertical padding in the marquee wrapper

All changes are CSS-only (Tailwind classes). No logic or structural changes.

