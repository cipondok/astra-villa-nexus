import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id ?? null;
    }

    const { action, payload } = await req.json();

    switch (action) {
      case "track_event": {
        const { stage, device_type, geo_country, amount, metadata } = payload || {};
        if (!userId || !stage) throw new Error("user_id and stage required");
        await supabase.from("wallet_funding_events").insert({
          user_id: userId,
          stage,
          device_type,
          geo_country,
          amount,
          metadata: metadata || {},
        });
        return json({ success: true });
      }

      case "funnel_analytics": {
        // Calculate funnel conversion rates
        const days = payload?.days || 30;
        const since = new Date(Date.now() - days * 86400000).toISOString();

        const { data: events } = await supabase
          .from("wallet_funding_events")
          .select("stage, user_id, amount")
          .gte("created_at", since);

        const stages = ["wallet_viewed", "funding_cta_clicked", "payment_session_started", "payment_completed", "funding_failed"];
        const stageCounts: Record<string, Set<string>> = {};
        stages.forEach((s) => (stageCounts[s] = new Set()));

        let totalFunded = 0;
        let fundedCount = 0;

        (events || []).forEach((e: any) => {
          if (stageCounts[e.stage]) stageCounts[e.stage].add(e.user_id);
          if (e.stage === "payment_completed") {
            totalFunded += Number(e.amount) || 0;
            fundedCount++;
          }
        });

        const funnel = stages.map((s) => ({
          stage: s,
          unique_users: stageCounts[s].size,
        }));

        const viewToClick = stageCounts.wallet_viewed.size > 0
          ? (stageCounts.funding_cta_clicked.size / stageCounts.wallet_viewed.size * 100).toFixed(1)
          : "0";
        const clickToSuccess = stageCounts.funding_cta_clicked.size > 0
          ? (stageCounts.payment_completed.size / stageCounts.funding_cta_clicked.size * 100).toFixed(1)
          : "0";
        const avgFundingAmount = fundedCount > 0 ? Math.round(totalFunded / fundedCount) : 0;

        return json({
          funnel,
          conversions: {
            view_to_click_pct: parseFloat(viewToClick),
            click_to_success_pct: parseFloat(clickToSuccess),
            avg_funding_amount: avgFundingAmount,
            total_funded: totalFunded,
            funded_count: fundedCount,
            failed_count: stageCounts.funding_failed.size,
          },
          period_days: days,
        });
      }

      case "generate_nudges": {
        // Find users who viewed wallet but didn't fund
        const since7d = new Date(Date.now() - 7 * 86400000).toISOString();

        const { data: viewers } = await supabase
          .from("wallet_funding_events")
          .select("user_id, stage")
          .gte("created_at", since7d);

        const viewedUsers = new Set<string>();
        const fundedUsers = new Set<string>();

        (viewers || []).forEach((e: any) => {
          if (e.stage === "wallet_viewed") viewedUsers.add(e.user_id);
          if (e.stage === "payment_completed") fundedUsers.add(e.user_id);
        });

        const unfundedViewers = [...viewedUsers].filter((u) => !fundedUsers.has(u));

        let nudgesCreated = 0;
        for (const uid of unfundedViewers.slice(0, 50)) {
          const { data: existing } = await supabase
            .from("funding_nudge_actions")
            .select("id")
            .eq("user_id", uid)
            .eq("action_status", "pending")
            .limit(1);

          if (!existing?.length) {
            await supabase.from("funding_nudge_actions").insert({
              user_id: uid,
              trigger_condition: "wallet_viewed_no_funding_7d",
              nudge_type: "dashboard_alert",
              action_status: "pending",
            });
            nudgesCreated++;
          }
        }

        return json({ nudges_created: nudgesCreated, unfunded_viewers: unfundedViewers.length });
      }

      case "get_nudges": {
        if (!userId) throw new Error("Auth required");
        const { data } = await supabase
          .from("funding_nudge_actions")
          .select("*")
          .eq("user_id", userId)
          .eq("action_status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);
        return json({ nudges: data || [] });
      }

      case "dismiss_nudge": {
        const { nudge_id } = payload || {};
        if (!userId || !nudge_id) throw new Error("Auth and nudge_id required");
        await supabase
          .from("funding_nudge_actions")
          .update({ action_status: "dismissed" })
          .eq("id", nudge_id)
          .eq("user_id", userId);
        return json({ success: true });
      }

      case "platform_stats": {
        // Real-time platform funding stats for trust signals
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayDeposits, activeInvestors] = await Promise.all([
          supabase
            .from("wallet_transaction_ledger")
            .select("amount")
            .eq("transaction_type", "deposit")
            .eq("status", "confirmed")
            .gte("created_at", today.toISOString()),
          supabase
            .from("wallet_accounts")
            .select("id", { count: "exact", head: true })
            .eq("wallet_status", "active"),
        ]);

        const totalFundedToday = (todayDeposits.data || []).reduce(
          (s: number, d: any) => s + Number(d.amount), 0
        );

        return json({
          total_funded_today: totalFundedToday,
          deposits_today: todayDeposits.data?.length || 0,
          active_investors: activeInvestors.count || 0,
        });
      }

      case "activation_dashboard": {
        // Admin dashboard data
        const days = payload?.days || 30;
        const since = new Date(Date.now() - days * 86400000).toISOString();

        const [events, nudges, experiments, firstTimers] = await Promise.all([
          supabase
            .from("wallet_funding_events")
            .select("stage, user_id, amount, created_at")
            .gte("created_at", since),
          supabase
            .from("funding_nudge_actions")
            .select("nudge_type, action_status")
            .gte("created_at", since),
          supabase
            .from("funding_experiment_metrics")
            .select("experiment_name, variant, converted, funding_amount")
            .gte("created_at", since),
          supabase
            .from("wallet_transaction_ledger")
            .select("user_id, amount, created_at")
            .eq("transaction_type", "deposit")
            .eq("status", "confirmed")
            .gte("created_at", since),
        ]);

        // First-time depositor count
        const depositorIds = new Set((firstTimers.data || []).map((t: any) => t.user_id));

        // Daily volume
        const dailyVolume: Record<string, number> = {};
        (firstTimers.data || []).forEach((t: any) => {
          const day = t.created_at.split("T")[0];
          dailyVolume[day] = (dailyVolume[day] || 0) + Number(t.amount);
        });

        // Funnel
        const stageCounts: Record<string, number> = {};
        (events.data || []).forEach((e: any) => {
          stageCounts[e.stage] = (stageCounts[e.stage] || 0) + 1;
        });

        // Success rate
        const totalAttempts = (stageCounts.payment_session_started || 0);
        const successCount = (stageCounts.payment_completed || 0);
        const successRate = totalAttempts > 0 ? ((successCount / totalAttempts) * 100).toFixed(1) : "0";

        // Nudge effectiveness
        const nudgesSent = (nudges.data || []).filter((n: any) => n.action_status === "sent").length;
        const nudgesConverted = (nudges.data || []).filter((n: any) => n.action_status === "converted").length;

        return json({
          first_time_depositors: depositorIds.size,
          daily_volume: dailyVolume,
          funnel_stages: stageCounts,
          funding_success_rate: parseFloat(successRate),
          total_funded_amount: (firstTimers.data || []).reduce((s: number, t: any) => s + Number(t.amount), 0),
          nudges_sent: nudgesSent,
          nudges_converted: nudgesConverted,
          experiments_count: (experiments.data || []).length,
          period_days: days,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err) {
    return json({ error: err.message }, 400);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
