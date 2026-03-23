import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

/**
 * DEAL ENGINE — Centralized router for all deal, pricing, and negotiation modes.
 * Proxies to core-engine/ai-engine for backward compatibility while providing
 * a clean API surface for deal-related features.
 * 
 * Modes handled:
 *   deal_finder, deal_alerts, deal_detector, negotiation_assist,
 *   price_suggestion, price_suggestion_inline, price_forecast,
 *   price_adjustment_strategy, off_market_deals, smart_pricing
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEAL_MODES_CORE = new Set([
  "deal_finder",
  "deal_alerts",
  "deal_detector",
  "negotiation_assist",
  "price_suggestion",
  "price_suggestion_inline",
  "price_forecast",
  "price_adjustment_strategy",
  "off_market_deals",
]);

const DEAL_MODES_AI = new Set(["smart_pricing"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode = body.mode || body.payload?.mode;

    if (!mode) {
      return new Response(
        JSON.stringify({ error: "mode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allModes = new Set([...DEAL_MODES_CORE, ...DEAL_MODES_AI]);
    if (!allModes.has(mode)) {
      return new Response(
        JSON.stringify({ error: `Invalid deal-engine mode: ${mode}. Valid: ${[...allModes].join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine target engine
    const targetEngine = DEAL_MODES_AI.has(mode) ? "ai-engine" : "core-engine";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Forward the authorization header if present
    const authHeader = req.headers.get("authorization") || `Bearer ${Deno.env.get("SUPABASE_ANON_KEY") || serviceKey}`;

    const targetUrl = `${supabaseUrl}/functions/v1/${targetEngine}`;
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("deal-engine error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
