import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, payload } = await req.json();

    switch (action) {
      case "dashboard": {
        // Funnel metrics
        const { data: events } = await supabase
          .from("investor_growth_events")
          .select("funnel_stage, source_channel, geo_country, created_at");

        const stages = ["visit", "signup", "verify", "wallet_view", "wallet_funded", "escrow_started", "repeat_investment"];
        const funnelCounts: Record<string, number> = {};
        stages.forEach(s => funnelCounts[s] = 0);
        const channelCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};

        (events ?? []).forEach((e: any) => {
          if (funnelCounts[e.funnel_stage] !== undefined) funnelCounts[e.funnel_stage]++;
          channelCounts[e.source_channel] = (channelCounts[e.source_channel] || 0) + 1;
          if (e.geo_country) countryCounts[e.geo_country] = (countryCounts[e.geo_country] || 0) + 1;
        });

        // Conversion rates
        const conversionRates = stages.slice(1).map((stage, i) => ({
          from: stages[i],
          to: stage,
          rate: funnelCounts[stages[i]] > 0
            ? Math.round((funnelCounts[stage] / funnelCounts[stages[i]]) * 100)
            : 0,
        }));

        // Active experiments
        const { data: experiments } = await supabase
          .from("growth_experiment_metrics")
          .select("*")
          .eq("is_active", true)
          .limit(10);

        // Referral stats
        const { count: totalReferrals } = await supabase
          .from("investor_referrals")
          .select("*", { count: "exact", head: true });

        const { count: settledReferrals } = await supabase
          .from("investor_referrals")
          .select("*", { count: "exact", head: true })
          .eq("reward_settled", true);

        // Pending nudges
        const { count: pendingActions } = await supabase
          .from("investor_growth_actions")
          .select("*", { count: "exact", head: true })
          .eq("action_status", "pending");

        return new Response(JSON.stringify({
          funnel: funnelCounts,
          conversionRates,
          channelDistribution: channelCounts,
          countryDistribution: countryCounts,
          experiments: experiments ?? [],
          totalReferrals: totalReferrals ?? 0,
          settledReferrals: settledReferrals ?? 0,
          pendingActions: pendingActions ?? 0,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "score_investor": {
        const userId = payload?.user_id;
        if (!userId) throw new Error("user_id required");

        // Gather signals
        const { data: events } = await supabase
          .from("investor_growth_events")
          .select("funnel_stage")
          .eq("user_id", userId);

        const evts = events ?? [];
        const stageWeights: Record<string, number> = {
          visit: 5, signup: 10, verify: 15, wallet_view: 20,
          wallet_funded: 35, escrow_started: 25, repeat_investment: 30,
        };

        let rawScore = 0;
        const seen = new Set<string>();
        evts.forEach((e: any) => {
          if (!seen.has(e.funnel_stage)) {
            rawScore += stageWeights[e.funnel_stage] || 0;
            seen.add(e.funnel_stage);
          }
        });

        // Count behavioral depth
        const repeatBonus = evts.filter((e: any) => e.funnel_stage === "repeat_investment").length;
        rawScore += Math.min(repeatBonus * 5, 20);

        const score = Math.min(100, rawScore);
        const probability = Math.round(score * 0.85) / 100;

        return new Response(JSON.stringify({
          user_id: userId,
          activation_score: score,
          capital_ready_probability: probability,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "generate_nudges": {
        // Find high-score users without wallet funding
        const { data: walletViewers } = await supabase
          .from("investor_growth_events")
          .select("user_id")
          .eq("funnel_stage", "wallet_view")
          .limit(50);

        const { data: funded } = await supabase
          .from("investor_growth_events")
          .select("user_id")
          .eq("funnel_stage", "wallet_funded")
          .limit(200);

        const fundedSet = new Set((funded ?? []).map((f: any) => f.user_id));
        const nudgeTargets = [...new Set((walletViewers ?? []).map((v: any) => v.user_id))]
          .filter(uid => !fundedSet.has(uid))
          .slice(0, 20);

        let created = 0;
        for (const uid of nudgeTargets) {
          const { data: existing } = await supabase
            .from("investor_growth_actions")
            .select("action_id")
            .eq("user_id", uid)
            .eq("action_type", "wallet_bonus_offer")
            .eq("action_status", "pending")
            .limit(1);

          if (!existing?.length) {
            await supabase.from("investor_growth_actions").insert({
              user_id: uid,
              action_type: "wallet_bonus_offer",
              trigger_reason: "Viewed wallet but not funded",
            });
            created++;
          }
        }

        return new Response(JSON.stringify({ nudges_created: created }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "track_event": {
        const { user_id, funnel_stage, source_channel, campaign_tag, geo_country, device_type, session_id } = payload;
        const { error } = await supabase.from("investor_growth_events").insert({
          user_id, funnel_stage, source_channel, campaign_tag, geo_country, device_type, session_id,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
