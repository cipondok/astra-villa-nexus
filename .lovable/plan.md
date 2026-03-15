

## Automated AI Intelligence Scheduling System

### What Exists Today

The platform already has strong foundations:
- `ai_scheduled_jobs` table with cron expressions, priority, enabled flags
- `scheduler` edge function that polls due jobs, acquires batch locks, invokes `job-worker`
- `AIBatchControlPanel` for manual triggers (investment_analysis, demand_signal_refresh, market_intelligence_update)
- `ai_batch_locks` for duplicate prevention, `claim_next_job()` for concurrency
- `get_ai_system_health` RPC returning freshness_state (FRESH/AGING/STALE)
- Existing pg_cron jobs for SEO and listing revival

### What Needs to Be Built

**1. Seed Default Scheduled Jobs** (via Supabase insert tool)

Insert 4 pre-configured schedules into `ai_scheduled_jobs`:

| Job | Cron | Priority | Description |
|-----|------|----------|-------------|
| Daily Full AI Analysis | `0 2 * * *` (2 AM UTC) | 1 | Score all active listings |
| Hourly Demand Refresh | `15 * * * *` (every hour at :15) | 3 | Lightweight buyer intent recalc |
| Weekly Market Recalibration | `0 4 * * 1` (Mon 4 AM) | 2 | Macro trend + liquidity update |
| Stale Intelligence Emergency | `*/10 * * * *` (every 10 min) | 1 | Check freshness, trigger if STALE |

**2. Enhance Scheduler Edge Function** (`supabase/functions/scheduler/index.ts`)

Add staleness detection logic after the normal job loop:
- Call `get_ai_system_health` RPC
- If `freshness_state === 'STALE'` and no `investment_analysis` job is pending/running, auto-create an emergency refresh job
- Insert an `admin_alerts` row (priority: 'high') notifying admin of the emergency trigger
- Add failure notification: when a scheduled job results in `error` status, insert an admin alert with the job type and error context

**3. Add Retry Columns to `ai_scheduled_jobs`** (migration)

```sql
ALTER TABLE ai_scheduled_jobs
  ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS last_status text DEFAULT 'idle';
```

Update the scheduler to:
- Track `last_status` ('triggered', 'skipped', 'error') on each cycle
- On error, increment `retry_count`; if `retry_count >= max_retries`, auto-disable the schedule and fire a critical admin alert
- Reset `retry_count` to 0 on successful trigger

**4. Register pg_cron for Scheduler** (via insert tool)

Register a pg_cron job to invoke the `scheduler` edge function every minute:
```sql
SELECT cron.schedule(
  'ai-scheduler-every-minute',
  '* * * * *',
  $$ SELECT net.http_post(
    url:='https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/scheduler',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{"time":"' || now() || '"}'::jsonb
  ) as request_id; $$
);
```

**5. Admin Scheduling Dashboard Card** (`src/components/admin/AISchedulingDashboard.tsx`)

A glassmorphic card showing:
- List of all 4 schedules with enabled/disabled toggles
- Next run countdown for each
- Last status badge (idle/triggered/error) with retry count
- Color-coded rows: green = healthy, orange = retrying, red = disabled due to failures
- "Staleness Guard" indicator showing current freshness state from `get_ai_system_health`

Placed in the AI Command Center section alongside existing batch control.

**6. Update `AIBatchControlPanel`**

Add a small "Auto-scheduling: Active" indicator at the bottom showing that automated scheduling is running, linking to the full scheduling dashboard.

### Technical Details

**Execution Priority Order:**
1. Emergency staleness refresh (priority 1)
2. Daily full analysis (priority 1, but scheduled for off-peak)
3. Weekly recalibration (priority 2)
4. Hourly demand refresh (priority 3, lightweight)

The existing scheduler already sorts by `priority ASC` and caps at `MAX_CONCURRENT_TRIGGERS = 3`, so priority ordering is automatic.

**Failure Recovery Flow:**
```text
Job triggers → Error
  └→ retry_count++ , last_error = message
  └→ retry_count < max_retries? → stays enabled, retries next cycle
  └→ retry_count >= max_retries? → auto-disable + critical admin alert
```

**Admin Notification Triggers:**
- Stale intelligence detected → high priority alert
- Emergency refresh auto-triggered → high priority alert
- Schedule disabled after max retries → critical alert
- Successful recovery after retries → low priority info alert

**Color State Mapping:**
- Green: schedule healthy, last_status = 'triggered', retry_count = 0
- Orange: retry_count > 0 but < max_retries
- Red: disabled due to failures or freshness = STALE

### Files Changed

| File | Action |
|------|--------|
| `supabase/migrations/new.sql` | Add retry columns to `ai_scheduled_jobs` |
| `supabase/functions/scheduler/index.ts` | Staleness detection, retry tracking, admin alerts |
| `src/components/admin/AISchedulingDashboard.tsx` | New scheduling overview card |
| `src/hooks/useScheduledJobs.ts` | Extend interface with retry fields |
| `src/components/admin/AIBatchControlPanel.tsx` | Add auto-scheduling indicator |
| `src/components/admin/AdminOverview.tsx` | Import + place scheduling dashboard |
| Data insert (via tool) | Seed 4 default schedules + pg_cron registration |

