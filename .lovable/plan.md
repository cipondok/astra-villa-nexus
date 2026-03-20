

# Modern Language & Currency Selector — Header Update

## What's Changing

Replace the current separate Language and Currency dropdown buttons with a single, compact **combined selector** that saves header space and looks modern.

## Design

**Combined pill button**: One compact button showing `🇮🇩 ID · Rp` that opens a single dropdown with both language and currency options in organized sections.

```text
Before:  [🇮🇩 Bahasa ▾] [🇮🇩 IDR ▾]   ← two separate buttons
After:   [🇮🇩 ID · Rp ▾]                ← one compact pill
```

**Dropdown panel** — clean two-section layout:
```text
┌──────────────────────┐
│ LANGUAGE             │
│ 🇬🇧 EN  🇮🇩 ID  🇨🇳 ZH │
│ 🇯🇵 JA  🇰🇷 KO        │
│────────────────────── │
│ CURRENCY             │
│ 🇮🇩 IDR  🇺🇸 USD      │
│ 🇸🇬 SGD  🇲🇾 MYR      │
│ 🇦🇺 AUD              │
└──────────────────────┘
```

- Compact grid of pill-shaped options (not a long list)
- Active selection highlighted with primary color
- Smooth animation on open/close

## Files

1. **New: `src/components/LocaleSelector.tsx`** — combined language + currency selector component with grid-style dropdown
2. **Edit: `src/components/Navigation.tsx`** — replace `CurrencySelector` + `LanguageToggleSwitch` with single `LocaleSelector`
3. **Edit: `src/components/navigation/AuthenticatedNavigation.tsx`** — same replacement
4. **Both mobile menu sections** in each file — also use `LocaleSelector` inline

