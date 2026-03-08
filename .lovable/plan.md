

## Auto-Optimize Edge Function — Hardening Plan

### Current State
The code at lines 523–601 in `supabase/functions/ai-engine/index.ts` **already implements** chunked batching (50 IDs per chunk) and caps location property IDs at 200. The previous fix resolved the core URL overflow issue.

However, there is one remaining risk and several hardening improvements needed:

### Issues to Fix

**1. Line 580: `.in("id", ids)` can receive up to 100 IDs without chunking**
After collecting `weakRows`, the code fetches full property data with `.in("id", ids)` where `ids` can be up to 100 UUIDs. While 100 UUIDs (~3600 chars) is unlikely to overflow, it should be chunked for consistency and safety.

**2. Line 589: `normalizeText(property.id)` may lowercase UUIDs incorrectly**
If `normalizeText` lowercases strings but the `weakById` map keys are original-case UUIDs from Supabase, the lookup will fail silently, producing `currentScore = 0` for every property. This means the boost calculation is wrong.

**3. No error handling on chunk queries (line 551)**
The chunked queries inside the `for` loop ignore errors — a failing chunk silently returns no data.

### Plan

#### A. Chunk the property fetch at line 577–580
Batch the `.in("id", ids)` call into chunks of 50, accumulate results into a single `properties` array.

#### B. Fix UUID comparison at line 589
Use `property.id` directly (not `normalizeText`) when looking up in `weakById`, since UUIDs from Supabase are consistently formatted.

#### C. Add error handling to chunk queries
Log or handle errors from individual chunk queries instead of silently ignoring them.

### File to modify
- `supabase/functions/ai-engine/index.ts` (lines 523–601)

### Changes Summary
```text
Line 577-580:  Chunk .in("id", ids) into batches of 50
Line 551-558:  Add error logging for chunk query failures  
Line 589:      Replace normalizeText(property.id) with property.id
```

