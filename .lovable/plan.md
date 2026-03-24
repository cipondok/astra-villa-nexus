

# Fix: Daily Check-in "Edge Function returned non-2xx" Error

## Root Cause

The `core-engine` edge function has `astra_token` listed as a valid mode and in `NO_PROPERTY_ID_MODES`, but **there is no handler implemented for it**. Every call with `mode: 'astra_token'` falls through to the catch-all at line 11309 returning `400: "Unknown mode or unhandled request"`.

This affects:
- **Daily check-in** (AstraTokenHub calls `core-engine` with `{ mode: 'astra_token', action: 'daily_checkin' }`)
- **Balance queries** (`useAstraToken` hook calls `core-engine` with `action: 'get_balance'`) — causes the `"Query data cannot be undefined"` console errors
- **Transaction queries** (`action: 'get_transactions'`)
- **Check-in status** (`action: 'get_checkin_status'`)

## Two Affected Flows

| Flow | Location | Method |
|------|----------|--------|
| DailyLoginReward popup | `useGamification.ts` | `supabase.rpc('process_daily_login')` — works (DB function exists) |
| AstraTokenHub check-in button | `AstraTokenHub.tsx` + `useAstraToken.ts` | `supabase.functions.invoke('core-engine', { mode: 'astra_token' })` — **BROKEN** |

## Fix Plan

### Step 1: Add `astra_token` handler to `core-engine` edge function

Add a handler block before the final fallback that processes these actions by querying the database directly (no AI needed):

- `get_balance` — query `astra_token_balances` for user
- `get_transactions` — query `astra_token_transactions` for user (last 50)
- `get_checkin_status` — query `astra_daily_checkins` for today's date
- `daily_checkin` — insert into `astra_daily_checkins`, update streak, credit tokens via `astra_token_transactions` + `astra_token_balances`
- `get_transfers` — query transfers for user
- `welcome_bonus` / `award_tokens` / `transfer` — existing mutation actions

### Step 2: Fix `useAstraToken` query functions to return fallback values

Ensure `queryFn` returns a default value (not `undefined`) when the edge function fails, preventing the React Query "data cannot be undefined" error.

### Step 3: Redeploy the edge function

The function will auto-deploy after code changes.

## Technical Details

The handler will be ~150 lines of Supabase client queries using the service role client (already available in core-engine). Each action reads/writes to existing `astra_*` tables. No new tables or migrations needed.

