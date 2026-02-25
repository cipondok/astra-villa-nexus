

## Fix: Unexpected Loading Popups Still Appearing

### What's Happening

1. **`LoadingProgressPopup`** (bottom-right corner popup) is still rendered in `App.tsx` line 439. It fires whenever `useSystemSettings.saveSettings()` calls `startLoading()`, or when the admin test button is pressed. The once-per-day/session gate in `useGlobalLoading` is unreliable — it relies on `sessionStorage` keys that get cleared on refresh, so the popup can reappear on the next save action in a new session.

2. **`InitialLoadingScreen`** (full-screen splash) shows on every new browser session because `astra_app_loaded` is stored in `sessionStorage` (cleared on tab close). This is by design, but combined with the progress popup it creates a double-loading feel.

### Plan

#### 1. Remove `LoadingProgressPopup` from the app shell
**File:** `src/App.tsx` (line 439)

Remove the `<LoadingProgressPopup />` render. This component was designed for showing progress during long operations, but `useSystemSettings` already has its own `setLoading` state and shows toast notifications on success/error. The popup is redundant.

Also remove the lazy import on line 38.

#### 2. Remove `startLoading` / `updateProgress` / `finishLoading` from `useSystemSettings`
**File:** `src/hooks/useSystemSettings.ts`

The `saveSettings` function calls `startLoading`, `updateProgress`, and `finishLoading` from `useGlobalLoading`. These trigger the popup. Remove them — the hook already has its own `loading` state and calls `showSuccess`/`showError` toasts for feedback.

#### 3. Remove the `useQueryLoadingIntegration` import from App
**File:** `src/App.tsx` (line 27)

This hook is imported and called but does nothing (it was already neutered). Clean it up.

#### 4. Keep `LoadingPopup.tsx` and `LoadingProgressPopup.tsx` files
These components aren't deleted — they can still be used explicitly where needed (e.g., admin test button in WelcomeScreenSettings). They just won't auto-fire globally.

### Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Remove `LoadingProgressPopup` render and import; remove `useQueryLoadingIntegration` import |
| `src/hooks/useSystemSettings.ts` | Remove `useGlobalLoading` usage from `saveSettings` |

