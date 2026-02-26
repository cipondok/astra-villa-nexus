

## Production-Ready Session System for ASTRA Villa

### Important Architecture Note
This project runs on **Supabase + React** (not Node.js/Express). Supabase already handles JWT access tokens (auto-refreshed) and refresh tokens (stored as HttpOnly cookies by the Supabase auth SDK). The plan works **within this architecture** to implement all requested behaviors.

### What Already Exists
- `useSessionMonitor.ts`: Basic 30s session checks, expiration modal, suppression during batch ops
- `AuthContext.tsx`: Sign in/out, profile fetching, basic activity tracking (click/keypress only)
- `SessionExpirationHandler.tsx` + `SessionExpirationModal.tsx`: UI for expired sessions
- Supabase handles access token (short-lived) + refresh token (long-lived) automatically

### What's Missing
- **No inactivity timeout** (user stays logged in forever if token refreshes)
- **No sliding session extension** (activity doesn't extend session)
- **No heartbeat** to server
- **No network resilience** (session expires on temp disconnect)
- **No grace period** before forced logout
- Activity tracking only covers click/keypress (missing mouse, scroll, touch, navigation)

---

### Implementation Plan

**1. Rewrite `useSessionMonitor.ts` — Core Session Engine**

- **Inactivity timeout**: Track last activity timestamp. If no activity for 30 minutes → show warning. 35 minutes (5-min grace) → force logout.
- **Sliding session**: On activity detection, call `supabase.auth.refreshSession()` silently (throttled to max once per 10 minutes to avoid API spam).
- **Activity events**: `mousemove`, `mousedown`, `keydown`, `scroll`, `touchstart`, `click`, plus route changes via a custom event.
- **Network resilience**: Use `navigator.onLine` + `online`/`offline` events. When offline, pause all session checks and token refreshes. When back online, immediately validate session and resume. Never logout on network issues alone.
- **Grace period**: 5-minute warning toast + countdown before forced logout. Any activity during grace period resets the timer.
- **Page refresh persistence**: Activity timestamp stored in `localStorage`. On page load, calculate remaining time from stored timestamp — don't reset to zero.
- **Tab visibility**: Use `visibilitychange` event. When tab becomes visible again, check elapsed time and validate session — don't expire just because tab was hidden.

**2. Create `useSessionHeartbeat.ts` — Server Heartbeat**

- Every 5 minutes while user is active, call a lightweight Supabase edge function (`session-heartbeat`) that:
  - Validates the access token
  - Updates `profiles.last_seen_at` timestamp
  - Returns session validity status
- Skip heartbeat when offline or tab is hidden
- If heartbeat returns 401/403 → trigger re-login modal

**3. Create Edge Function `supabase/functions/session-heartbeat/index.ts`**

- Accepts authenticated request (JWT in Authorization header)
- Extracts user ID from JWT
- Updates `profiles.last_seen_at = now()`
- Returns `{ valid: true, expires_at }` or 401

**4. Update `AuthContext.tsx` — Sliding Extension**

- Add throttled `extendSession` that actually calls `supabase.auth.refreshSession()` on activity
- Ensure `SIGNED_OUT` events during offline periods are ignored
- On `online` event: re-validate session before taking any action

**5. Update `SessionExpirationHandler.tsx` — Grace Period UI**

- Show countdown timer in the expiration warning (not just a toast)
- "Stay Logged In" button that immediately extends the session
- Only force logout after grace period expires with zero activity

**6. Update `NetworkStatusIndicator` integration**

- Coordinate with session monitor: when offline flag is set, suppress all session expiration logic
- When coming back online, run session validation before resuming normal checks

### Files to Create
- `src/hooks/useSessionHeartbeat.ts`
- `supabase/functions/session-heartbeat/index.ts`

### Files to Modify
- `src/hooks/useSessionMonitor.ts` (major rewrite)
- `src/contexts/AuthContext.tsx` (throttled session extension, offline handling)
- `src/components/SessionExpirationHandler.tsx` (grace period countdown)
- `src/components/SessionExpirationModal.tsx` (stay-logged-in button, countdown)

### Session Flow
```text
User Active → track activity timestamp (localStorage)
                ↓
        Every 10 min of activity → silent token refresh
        Every 5 min of activity  → heartbeat ping to server
                ↓
30 min inactivity → warning toast + countdown
35 min inactivity → force logout + clear tokens
                ↓
Network offline → pause all checks, keep local state
Network online  → validate session, resume if valid
                ↓
Token invalid/tampered → immediate re-login modal
Refresh token expired  → immediate re-login modal
Manual logout          → clear everything, redirect home
```

