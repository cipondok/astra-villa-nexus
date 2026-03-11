import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

// Use anon key - function has verify_jwt = false and the function
// validates auth internally. For deal_hunter_scan we need service role
// but since test env doesn't have it, let's test by checking the anon key
// path returns 401 (confirming auth guard works).
// The actual scan test will be via direct DB verification after manual trigger.

Deno.test("deal_hunter_scan requires service role auth", async () => {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/core-engine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ mode: "deal_hunter_scan" }),
  });
  
  const text = await resp.text();
  console.log("Status:", resp.status, "- Expected 401 (anon key cannot run admin scans)");
  // Anon key is not a valid user token so getUser fails → 401
  assertEquals(resp.status, 401);
});
