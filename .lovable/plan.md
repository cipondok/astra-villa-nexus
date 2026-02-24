

# Improve Language Switcher UX

## Current State

- **localStorage persistence**: Already implemented in `LanguageContext.tsx` (line 17 reads, line 26 writes). This already works and survives page refreshes.
- **Browser auto-detection**: Not implemented. When no saved language exists, it defaults to `"en"` unconditionally (line 19).
- **Uses raw `localStorage`** instead of the project's `safeLocalStorage` wrapper, which could throw in privacy mode.

## Changes

### 1. Auto-detect browser language on first visit (`LanguageContext.tsx`)

Add a `detectBrowserLanguage()` helper that reads `navigator.languages` / `navigator.language` and maps browser locale prefixes to supported languages:

- `zh` → `"zh"`
- `ja` → `"ja"`  
- `ko` → `"ko"`
- `id` / `ms` → `"id"` (Malay is close enough to default Indonesian)
- Everything else → `"en"`

This runs only when no saved language exists in localStorage (first visit).

### 2. Use `safeLocalStorage` instead of raw `localStorage`

Replace `localStorage.getItem`/`localStorage.setItem` with the project's `safeLocalStorage` from `@/lib/safeStorage` to prevent crashes in privacy/incognito modes.

### 3. Set `lang` attribute on `<html>` element

When language changes, update `document.documentElement.lang` for accessibility and SEO.

## File Changes

**`src/contexts/LanguageContext.tsx`** — Single file edit:
- Import `safeLocalStorage` from `@/lib/safeStorage`
- Add `detectBrowserLanguage()` function (~15 lines)
- In the `useState` initializer: if no saved language, call `detectBrowserLanguage()` instead of defaulting to `"en"`
- In the `useEffect`: use `safeLocalStorage.setItem` and also set `document.documentElement.lang`
- Replace `localStorage.getItem` with `safeLocalStorage.getItem`

## Risk

- **Very low**: Only changes the default for brand-new visitors. Returning visitors keep their saved preference. The `safeLocalStorage` swap is strictly safer than the current raw access.

