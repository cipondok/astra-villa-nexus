import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params = {} } = await req.json();

    // ── Dashboard ──
    if (mode === "dashboard") {
      const [signals, decisions, scenarios, org, vision] = await Promise.all([
        sb.from("fscc_strategic_signals").select("*").order("detected_at", { ascending: false }).limit(25),
        sb.from("fscc_priority_decisions").select("*").order("impact_score", { ascending: false }).limit(15),
        sb.from("fscc_scenario_simulations").select("*").order("simulated_at", { ascending: false }).limit(10),
        sb.from("fscc_org_alignment").select("*").order("alignment_score", { ascending: false }).limit(10),
        sb.from("fscc_vision_tracking").select("*").order("progress_pct", { ascending: false }).limit(10),
      ]);

      const s = signals.data || []; const d = decisions.data || []; const sc = scenarios.data || [];
      const o = org.data || []; const v = vision.data || [];

      return json({
        summary: {
          active_signals: s.length,
          critical_signals: s.filter((x: any) => x.severity === "critical").length,
          action_required: s.filter((x: any) => x.requires_action).length,
          pending_decisions: d.filter((x: any) => x.status === "pending").length,
          critical_decisions: d.filter((x: any) => x.urgency === "critical").length,
          active_scenarios: sc.filter((x: any) => x.simulation_status === "running" || x.simulation_status === "completed").length,
          avg_alignment: o.length ? +(o.reduce((sum: number, x: any) => sum + (x.alignment_score || 0), 0) / o.length).toFixed(1) : 0,
          goals_on_track: v.filter((x: any) => x.trajectory === "on_track" || x.trajectory === "ahead").length,
          goals_at_risk: v.filter((x: any) => x.trajectory === "at_risk" || x.trajectory === "behind" || x.trajectory === "critical").length,
        },
        strategic_signals: s,
        priority_decisions: d,
        scenario_simulations: sc,
        org_alignment: o,
        vision_tracking: v,
      });
    }

    // ── Aggregate Strategic Signals ──
    if (mode === "aggregate_signals") {
      const domains = ["market_expansion", "liquidity_growth", "ecosystem_health", "competitive", "regulatory", "talent"];
      const signalTemplates: Record<string, string[]> = {
        market_expansion: ["City activation velocity", "New market pipeline depth", "Cross-border readiness"],
        liquidity_growth: ["Transaction volume growth", "Absorption rate trend", "Capital inflow momentum"],
        ecosystem_health: ["Vendor marketplace GMV", "Agent retention rate", "Developer partner pipeline"],
        competitive: ["Market share delta", "Feature parity gap", "Brand awareness score"],
        regulatory: ["Licensing compliance status", "Policy change risk", "Government relations index"],
        talent: ["Engineering velocity", "Key hire pipeline", "Culture alignment score"],
      };

      const rows: any[] = [];
      for (const domain of domains) {
        const templates = signalTemplates[domain] || [];
        for (const name of templates) {
          const value = 20 + Math.random() * 80;
          const trend = value >= 70 ? "surging" : value >= 55 ? "rising" : value >= 40 ? "stable" : value >= 25 ? "declining" : "critical";
          const severity = value <= 30 ? "critical" : value <= 45 ? "warning" : value >= 75 ? "positive" : "info";

          rows.push({
            signal_domain: domain,
            signal_name: name,
            signal_value: +value.toFixed(1),
            signal_trend: trend,
            severity,
            city: params.city || null,
            country: params.country || "Indonesia",
            requires_action: severity === "critical" || severity === "warning",
            action_deadline: severity === "critical" ? new Date(Date.now() + 48 * 3600000).toISOString() : null,
            context_data: { source: "automated_scan", domain },
          });
        }
      }

      const { error } = await sb.from("fscc_strategic_signals").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "fscc_engine_cycle", entity_type: "fscc", priority_level: "medium", payload: { mode, signals: rows.length } });

      return json({ signals_generated: rows.length, critical: rows.filter(r => r.severity === "critical").length, action_required: rows.filter(r => r.requires_action).length });
    }

    // ── Surface Priority Decisions ──
    if (mode === "surface_decisions") {
      const decisionTemplates = [
        { category: "bottleneck", title: "Supply onboarding velocity below target in Tier-2 cities", action: "Deploy dedicated agent activation team" },
        { category: "opportunity", title: "Emerging demand cluster detected in new district", action: "Fast-track listing acquisition in target area" },
        { category: "capital_efficiency", title: "CAC trending above threshold on paid channels", action: "Shift budget to organic and referral channels" },
        { category: "risk_mitigation", title: "Competitor launching aggressive pricing in core market", action: "Activate retention program and value-add features" },
        { category: "strategic_pivot", title: "Cross-border investor interest exceeding projections", action: "Accelerate international platform capabilities" },
        { category: "opportunity", title: "Developer partnership pipeline at capacity", action: "Expand BD team or implement self-serve onboarding" },
        { category: "bottleneck", title: "Data pipeline latency affecting real-time scoring", action: "Invest in infrastructure optimization sprint" },
      ];

      const rows: any[] = [];
      for (const tmpl of decisionTemplates) {
        const impact = 40 + Math.random() * 60;
        const urgency = impact >= 80 ? "critical" : impact >= 65 ? "high" : impact >= 45 ? "medium" : "low";

        rows.push({
          decision_category: tmpl.category,
          title: tmpl.title,
          urgency,
          impact_score: +impact.toFixed(1),
          confidence: +(60 + Math.random() * 35).toFixed(1),
          recommended_action: tmpl.action,
          alternative_actions: JSON.stringify([`Monitor for 2 weeks`, `Escalate to board`]),
          affected_cities: params.cities || ["Jakarta", "Surabaya", "Bali"],
          affected_metrics: ["GMV", "retention", "NPS"],
          estimated_roi_pct: +(5 + Math.random() * 30).toFixed(1),
          deadline: new Date(Date.now() + (urgency === "critical" ? 7 : 30) * 86400000).toISOString(),
          status: "pending",
        });
      }

      const { error } = await sb.from("fscc_priority_decisions").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "fscc_engine_cycle", entity_type: "fscc", priority_level: "medium", payload: { mode, decisions: rows.length } });

      return json({ decisions_surfaced: rows.length, critical: rows.filter(r => r.urgency === "critical").length });
    }

    // ── Run Scenario Simulation ──
    if (mode === "simulate_scenario") {
      const scenarios = [
        { type: "geographic_expansion", name: "ASEAN Expansion — Vietnam & Thailand Entry" },
        { type: "pricing_adjustment", name: "Premium Tier Launch — 3x Revenue per Enterprise" },
        { type: "partnership", name: "Strategic Bank Integration — 5 Major Lenders" },
        { type: "acquisition", name: "Competitor Acquisition — Consolidate Market Share" },
        { type: "product_pivot", name: "B2B SaaS Pivot — Developer Intelligence Platform" },
      ];

      const rows: any[] = [];
      for (const sc of scenarios) {
        const baseRev = 1e6 + Math.random() * 5e6;
        const bullMult = 1.5 + Math.random() * 1.5;
        const bearMult = 0.4 + Math.random() * 0.3;
        const ev = baseRev * 0.5 + baseRev * bullMult * 0.25 + baseRev * bearMult * 0.25;

        rows.push({
          scenario_type: sc.type,
          scenario_name: sc.name,
          base_case: { revenue_usd: Math.floor(baseRev), growth_pct: +(10 + Math.random() * 20).toFixed(1), market_share_pct: +(5 + Math.random() * 15).toFixed(1) },
          bull_case: { revenue_usd: Math.floor(baseRev * bullMult), growth_pct: +(25 + Math.random() * 40).toFixed(1), market_share_pct: +(15 + Math.random() * 25).toFixed(1) },
          bear_case: { revenue_usd: Math.floor(baseRev * bearMult), growth_pct: +(-5 + Math.random() * 10).toFixed(1), market_share_pct: +(2 + Math.random() * 8).toFixed(1) },
          probability_base: 50,
          probability_bull: 25,
          probability_bear: 25,
          expected_value_usd: Math.floor(ev),
          risk_adjusted_return: +(ev / baseRev * 100 - 100).toFixed(1),
          time_horizon_months: Math.floor(6 + Math.random() * 30),
          key_assumptions: ["Market conditions stable", "Execution team at capacity", "Regulatory environment favorable"],
          sensitivity_factors: { market_growth: 0.3, execution_speed: 0.25, capital_availability: 0.25, competition: 0.2 },
          simulation_status: "completed",
          result_summary: `Expected value: $${Math.floor(ev / 1000)}K over ${Math.floor(12 + Math.random() * 18)} months`,
        });
      }

      const { error } = await sb.from("fscc_scenario_simulations").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "fscc_engine_cycle", entity_type: "fscc", priority_level: "medium", payload: { mode, scenarios: rows.length } });

      return json({ scenarios_simulated: rows.length, total_ev: rows.reduce((s, r) => s + r.expected_value_usd, 0) });
    }

    // ── Assess Org Alignment ──
    if (mode === "assess_alignment") {
      const teams = [
        { name: "Core Engineering", area: "engineering" },
        { name: "Product & Design", area: "product" },
        { name: "Growth Marketing", area: "growth" },
        { name: "Operations", area: "operations" },
        { name: "Finance & Legal", area: "finance" },
        { name: "Partnerships & BD", area: "partnerships" },
        { name: "Data Science & AI", area: "data_science" },
        { name: "UX/UI Design", area: "design" },
      ];

      const rows: any[] = [];
      for (const team of teams) {
        const velocity = 30 + Math.random() * 70;
        const sprint = 50 + Math.random() * 50;
        const resource = 40 + Math.random() * 55;
        const hcCurrent = Math.floor(3 + Math.random() * 20);
        const hcTarget = hcCurrent + Math.floor(Math.random() * 8);
        const alignment = (velocity * 0.3 + sprint * 0.25 + resource * 0.2 + (hcCurrent / hcTarget * 100) * 0.25);

        rows.push({
          team_name: team.name,
          function_area: team.area,
          execution_velocity: +velocity.toFixed(1),
          sprint_completion_pct: +sprint.toFixed(1),
          resource_utilization_pct: +resource.toFixed(1),
          headcount_current: hcCurrent,
          headcount_target: hcTarget,
          hiring_gap: hcTarget - hcCurrent,
          alignment_score: +alignment.toFixed(1),
          blockers: velocity < 50 ? [{ type: "resource", description: "Understaffed for current sprint load" }] : [],
          key_milestones: [{ name: "Q1 deliverable", status: sprint >= 70 ? "on_track" : "at_risk" }],
          cross_team_dependencies: ["engineering", "product"].filter(a => a !== team.area).slice(0, 2),
          velocity_trend: velocity >= 60 ? "accelerating" : velocity >= 40 ? "stable" : velocity >= 25 ? "decelerating" : "stalled",
        });
      }

      const { error } = await sb.from("fscc_org_alignment").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "fscc_engine_cycle", entity_type: "fscc", priority_level: "medium", payload: { mode, teams: rows.length } });

      return json({ teams_assessed: rows.length, avg_alignment: +(rows.reduce((s, r) => s + r.alignment_score, 0) / rows.length).toFixed(1), total_hiring_gap: rows.reduce((s, r) => s + r.hiring_gap, 0) });
    }

    // ── Track Vision Goals ──
    if (mode === "track_vision") {
      const goals = [
        { name: "10K Monthly Active Investors", category: "growth", target: 10000, horizon: "1_year" },
        { name: "IDR 50B Annual Revenue", category: "revenue", target: 50e9, horizon: "3_year" },
        { name: "30% Market Share Jakarta Premium", category: "market_share", target: 30, horizon: "3_year" },
        { name: "Series A Close — $5M", category: "fundraising", target: 5e6, horizon: "1_year" },
        { name: "5 Country Expansion", category: "expansion", target: 5, horizon: "5_year" },
        { name: "Top 3 PropTech Brand Indonesia", category: "brand", target: 3, horizon: "3_year" },
        { name: "AI Intelligence Platform Launch", category: "product", target: 100, horizon: "1_year" },
        { name: "50 Engineer Team", category: "talent", target: 50, horizon: "3_year" },
      ];

      const rows: any[] = [];
      for (const g of goals) {
        const progress = Math.random() * 100;
        const current = g.target * (progress / 100);
        const trajectory = progress >= 80 ? "ahead" : progress >= 55 ? "on_track" : progress >= 35 ? "at_risk" : progress >= 15 ? "behind" : "critical";
        const milestones = Math.floor(3 + Math.random() * 8);

        rows.push({
          goal_name: g.name,
          goal_category: g.category,
          time_horizon: g.horizon,
          target_value: g.target,
          current_value: +current.toFixed(0),
          progress_pct: +progress.toFixed(1),
          trajectory,
          milestones_total: milestones,
          milestones_completed: Math.floor(milestones * progress / 100),
          narrative_summary: `${g.name}: ${progress.toFixed(0)}% complete — ${trajectory.replace("_", " ")}`,
          investor_talking_points: [`${progress.toFixed(0)}% toward ${g.name}`, trajectory === "ahead" ? "Exceeding plan" : "On strategic timeline"],
          risk_factors: progress < 40 ? ["Execution velocity", "Market conditions"] : ["Competition"],
        });
      }

      const { error } = await sb.from("fscc_vision_tracking").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "fscc_engine_cycle", entity_type: "fscc", priority_level: "medium", payload: { mode, goals: rows.length } });

      return json({ goals_tracked: rows.length, on_track: rows.filter(r => r.trajectory === "on_track" || r.trajectory === "ahead").length, at_risk: rows.filter(r => r.trajectory === "at_risk" || r.trajectory === "behind" || r.trajectory === "critical").length });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
