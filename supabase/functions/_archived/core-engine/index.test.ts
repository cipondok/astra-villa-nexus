import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const FACTORS = ['location', 'price', 'feature', 'investment', 'popularity', 'collaborative'];

Deno.test("auto_tune_ai_weights - service role returns full response", async () => {
  if (!SERVICE_ROLE_KEY) {
    console.log("⚠️ SUPABASE_SERVICE_ROLE_KEY not set, skipping authenticated test");
    return;
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/core-engine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ mode: "auto_tune_ai_weights" }),
  });

  const body = await res.json();
  assertEquals(res.status, 200);

  // Verify response structure
  assertEquals(body.mode, "auto_tune_ai_weights");
  assertExists(body.old_weights);
  assertExists(body.new_weights);
  assertExists(body.adjustments);
  assertExists(body.model_health);

  // Verify all 6 factors present
  for (const f of FACTORS) {
    assertExists(body.old_weights[f], `old_weights missing factor: ${f}`);
    assertExists(body.new_weights[f], `new_weights missing factor: ${f}`);
  }

  // Verify weights sum to 100
  const newSum = Object.values(body.new_weights as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
  assertEquals(newSum, 100, `new_weights should sum to 100, got ${newSum}`);

  // Verify no factor below 5
  for (const f of FACTORS) {
    const w = body.new_weights[f] as number;
    assertEquals(w >= 5, true, `Factor ${f} weight ${w} is below minimum 5`);
  }

  // Verify adjustments within ±3
  for (const f of FACTORS) {
    const adj = body.adjustments[f] as number;
    assertEquals(Math.abs(adj) <= 3, true, `Factor ${f} adjustment ${adj} exceeds ±3`);
  }

  // Verify model_health fields
  assertExists(body.model_health.total_events);
  assertExists(body.model_health.data_sufficiency);
  assertExists(body.model_health.confidence);

  console.log("✅ Response:", JSON.stringify(body, null, 2));
});

Deno.test("auto_tune_ai_weights - anon key returns 401", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/core-engine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ mode: "auto_tune_ai_weights" }),
  });

  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});
