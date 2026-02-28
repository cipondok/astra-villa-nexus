

## Two Pending Change Sets

### 1. SmartCollectionsShowcase Gold Theme (7 edits in `src/components/home/SmartCollectionsShowcase.tsx`)

| Line | Change |
|------|--------|
| 51-56 | Add gold decorative lines flanking icon+title, Sparkles → `text-gold-primary`, Badge → `className="bg-gold-primary/10 text-gold-primary border border-gold-primary/20 text-[10px] uppercase tracking-wider"` |
| 64 | TabsTrigger: add `data-[state=active]:text-gold-primary` |
| 85 | Empty Sparkles: `opacity-40` → `text-gold-primary/40` |
| 101 | Card: add `hover:shadow-gold-primary/10 hover:border-gold-primary/40 hover:-translate-y-1`, change `transition-shadow` → `transition-all duration-300` |
| 131 | Price: `text-primary` → `text-gold-primary` |

### 2. AIPriceEstimator Mobile Responsiveness (10 edits in `src/pages/AIPriceEstimator.tsx`)

| Line | Current | Updated |
|------|---------|---------|
| 152 | `min-h-screen bg-background pt-20` | `min-h-[100dvh] bg-background pt-16 sm:pt-20` |
| 164 | `text-3xl sm:text-4xl lg:text-5xl` | `text-2xl sm:text-3xl lg:text-5xl` |
| 175 | `gap-6` | `gap-4 lg:gap-6` |
| 183 | `sticky top-24` | `lg:sticky lg:top-24 h-fit` |
| 306 & 333 | `min-h-[400px]` | `min-h-[300px] sm:min-h-[400px]` |
| 370 | `p-6 sm:p-8` | `p-4 sm:p-6 lg:p-8` |
| 394 | `text-3xl sm:text-4xl lg:text-5xl` | `text-2xl sm:text-3xl lg:text-5xl` |
| 467 & 519 | `p-5` | `p-4 sm:p-5` |
| 476 | `h-36` | `h-28 sm:h-36` |
| 528 | `h-32` | `h-28 sm:h-32` |
| 574 & 599 | `p-5` | `p-4 sm:p-5` |

All changes are Tailwind class-only. No logic or structural modifications.

