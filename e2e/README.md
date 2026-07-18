# E2E Tests

## Deterministic marketplace seed

The `/properties` E2E specs run against a fixed set of 30 rows tagged with
`E2E_MARKETPLACE` in the title (see `scripts/seed-e2e-marketplace.mjs`). Specs
isolate those rows via `?q=E2E_MARKETPLACE`, so they don't depend on catalog
size and won't disturb organic data.

### CI setup

Set these environment variables in the CI job:

```
VITE_SUPABASE_URL=<project url>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # required to seed / cleanup
CI=1
```

Then:

```
npm ci
npx playwright install --with-deps
npm run test:e2e:ci
```

Playwright's `globalSetup` runs `seed()` before any spec and `globalTeardown`
runs `cleanup()` after. Both no-op when `SUPABASE_SERVICE_ROLE_KEY` is missing,
so local runs without a service role key still work — specs fall back to
`test.skip(...)` when no data is present.

### Local usage

```
npm run seed:e2e         # upsert 30 deterministic properties
npm run seed:e2e:clean   # remove them
npm run test:e2e         # open Playwright and run specs
```

### Overrides

- `SKIP_E2E_SEED=1` — skip the automatic seed step (rows already present).
- `KEEP_E2E_SEED=1` — leave seeded rows in place after the run (debugging).

### Seeded rows at a glance

- Fixed UUIDs: `e2e00000-0000-4000-a000-0000000000{NN}` (NN = 01..30)
- Titles: `E2E_MARKETPLACE Villa 01 … 30`
- Cities cycle Bali / Jakarta / Bandung / Surabaya / Yogyakarta
- Prices strictly ascending (101M .. 130M IDR) → stable `sort=price-asc`
- `status='active'`, `approval_status='approved'`, backdated to 2000-01-01
  so they don't disturb `sort=newest` ordering for organic listings.
