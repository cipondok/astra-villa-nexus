import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.test("deal_hunter_scan triggers and returns opportunities", async () => {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/core-engine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ mode: "deal_hunter_scan" }),
  });
  
  const text = await resp.text();
  console.log("Status:", resp.status);
  console.log("Response preview:", text.slice(0, 800));
  
  assertEquals(resp.status, 200, `Expected 200, got ${resp.status}: ${text.slice(0, 200)}`);
  
  const data = JSON.parse(text);
  assert(data.data, "Response should have data field");
  console.log("Total properties scanned:", data.data.total_properties_scanned);
  console.log("Opportunities found:", data.data.opportunities_found);
  console.log("Opportunities upserted:", data.data.opportunities_upserted);
  console.log("Alerts created:", data.data.alerts_created);
  console.log("Classifications:", JSON.stringify(data.data.classifications));
  console.log("Top deals:", JSON.stringify(data.data.top_deals));
  
  assert(data.data.total_properties_scanned > 0, "Should scan properties");
});
