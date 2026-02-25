

## Problem

The app has multiple overlapping loading/progress systems that create a noisy, confusing experience:

1. **InitialLoadingScreen** — A full-screen splash shown on first load. It includes a "Quick Login" button and form, which is jarring and unexpected on a loading screen. The login form belongs on the `/auth` page, not here.

2. **LoadingProgressPopup** + **useQueryLoadingIntegration** — A bottom-right popup that appears every time React Query fetches data. This fires constantly (property listings, branding settings, etc.), showing a branded progress bar for routine background fetches that don't need user attention.

3. **GlobalLoadingIndicator** — A top progress bar + corner pill that shows during navigation and fetching. This overlaps with #2.

4. **NetworkStatusIndicator** — Shows "Slow connection detected" banner. This is legitimate but compounds the visual noise.

Combined, a user sees: splash screen → login popup → network banner → top progress bar → corner spinner → bottom-right popup — all within the first few seconds.

## Plan

### 1. Remove Quick Login from InitialLoadingScreen
**File:** `src/components/ui/InitialLoadingScreen.tsx`
- Remove the `showQuickLogin` state, email/password fields, and the login form entirely
- Remove the "Quick Login" button
- Keep only the logo, brand name, progress bar, and loading text
- Remove unused imports (`LogIn`, `User`, `Mail`, `Lock`, `Eye`, `EyeOff`, `ArrowRight`, `Sparkles`, `supabase`, `useToast`, `useState` for login fields)
- This cuts ~150 lines from the component

### 2. Disable LoadingProgressPopup from firing on routine fetches
**File:** `src/hooks/useQueryLoadingIntegration.ts`
- Gut the hook body so it no longer calls `startLoading`/`updateProgress`/`finishLoading`
- The popup should only appear when explicitly triggered by long operations (e.g., file uploads), not on every React Query fetch
- Keep the hook export signature intact so nothing breaks

### 3. Reduce GlobalLoadingIndicator to just the top bar
**File:** `src/components/ui/GlobalLoadingIndicator.tsx`
- Remove the corner pill ("Loading..." / "Slow connection..." badge) — it duplicates the NetworkStatusIndicator and the top bar already communicates loading state
- Keep only the thin top progress bar for page navigation

### 4. Clean up dead code
**File:** `src/components/AppInitializer.tsx`
- This component is never imported anywhere in the app. Delete it or leave it — no functional impact.

## Summary

| Change | Effect |
|--------|--------|
| Remove login form from splash screen | No confusing login popup during loading |
| Stop LoadingProgressPopup from auto-firing | No bottom-right popup on every data fetch |
| Simplify GlobalLoadingIndicator | Just a subtle top bar on navigation |
| Dead code cleanup | Remove unused AppInitializer |

After these changes, the loading experience becomes: clean splash screen (first visit only) → subtle top bar on navigation → network banner only when truly offline/slow.

