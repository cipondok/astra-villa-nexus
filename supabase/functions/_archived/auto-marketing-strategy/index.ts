import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Marketing trigger classification ──

interface MarketingTrigger {
  city: string;
  trigger_type: string;
  action: string;
  urgency: "immediate" | "within_24h" | "weekly";
  payload: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch latest strategy signals
    const { data: strategies } = await sb
      .from("marketplace_strategy_signals")
      .select("city, supply_score, demand_score, liquidity_score, capital_flow_score, pricing_momentum_score, recommended_strategy, strategy_priority_index, confidence_level")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!strategies?.length) {
      return new Response(JSON.stringify({ message: "No strategy signals available", triggers: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate by city (latest signal only)
    const cityStrategies = new Map<string, any>();
    for (const s of strategies) {
      if (!cityStrategies.has(s.city)) cityStrategies.set(s.city, s);
    }

    const triggers: MarketingTrigger[] = [];

    for (const [city, s] of cityStrategies) {
      // Demand spike → investor notification
      if (s.demand_score > 65 && s.supply_score < 50) {
        triggers.push({
          city,
          trigger_type: "demand_spike",
          action: "investor_notification_batch",
          urgency: "immediate",
          payload: { demand: s.demand_score, supply: s.supply_score, strategy: s.recommended_strategy },
        });
      }

      // Liquidity surge → premium pricing
      if (s.liquidity_score > 70) {
        triggers.push({
          city,
          trigger_type: "liquidity_surge",
          action: "premium_placement_pricing",
          urgency: "within_24h",
          payload: { liquidity: s.liquidity_score, pricing_momentum: s.pricing_momentum_score },
        });
      }

      // Demand collapse → discount campaigns
      if (s.demand_score < 20 && s.supply_score > 50) {
        triggers.push({
          city,
          trigger_type: "demand_collapse",
          action: "discount_visibility_campaign",
          urgency: "within_24h",
          payload: { demand: s.demand_score, supply: s.supply_score },
        });
      }

      // New hotspot detection → agent outreach
      if (s.capital_flow_score > 60 && s.pricing_momentum_score > 50 && s.supply_score < 40) {
        triggers.push({
          city,
          trigger_type: "new_hotspot",
          action: "agent_acquisition_outreach",
          urgency: "immediate",
          payload: { capital_flow: s.capital_flow_score, momentum: s.pricing_momentum_score },
        });
      }
    }

    // Log triggers as strategy execution entries
    if (triggers.length > 0) {
      const execLogs = triggers.map(t => ({
        strategy_type: `auto_marketing_${t.trigger_type}`,
        city: t.city,
        region: "Indonesia",
        execution_mode: "advisory",
        action_payload_json: { trigger: t.trigger_type, action: t.action, urgency: t.urgency, ...t.payload },
        expected_impact_score: t.urgency === "immediate" ? 80 : 60,
        status: "pending",
      }));

      await sb.from("strategy_execution_log").insert(execLogs);
    }

    return new Response(JSON.stringify({
      triggers_generated: triggers.length,
      triggers,
      computed_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("auto-marketing-strategy error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
