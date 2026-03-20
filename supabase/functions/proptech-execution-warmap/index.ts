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
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params = {} } = await req.json();

    // ── Dashboard ──
    if (mode === "dashboard") {
      const [entry, comp, flywheel, demand, network] = await Promise.all([
        sb.from("gpewm_market_entry").select("*").order("composite_priority", { ascending: false }).limit(20),
        sb.from("gpewm_competitive_landscape").select("*").order("vulnerability_score", { ascending: false }).limit(20),
        sb.from("gpewm_supply_flywheel").select("*").order("flywheel_rpm", { ascending: false }).limit(15),
        sb.from("gpewm_demand_acceleration").select("*").order("demand_growth_rate", { ascending: false }).limit(15),
        sb.from("gpewm_network_compounding").select("*").order("compounding_velocity", { ascending: false }).limit(15),
      ]);

      const entries = entry.data || [];
      const comps = comp.data || [];
      const flywheels = flywheel.data || [];
      const demands = demand.data || [];
      const networks = network.data || [];

      return json({
        summary: {
          markets_sequenced: entries.length,
          immediate_entries: entries.filter((e: any) => e.entry_timing === "immediate").length,
          competitors_mapped: comps.length,
          avg_vulnerability: comps.length ? Math.round(comps.reduce((s: number, c: any) => s + (c.vulnerability_score || 0), 0) / comps.length) : 0,
          flywheel_cities: flywheels.length,
          self_sustaining: flywheels.filter((f: any) => f.flywheel_phase === "self_sustaining" || f.flywheel_phase === "dominant").length,
          demand_channels: demands.length,
          avg_conversion: demands.length ? +(demands.reduce((s: number, d: any) => s + (d.conversion_rate_pct || 0), 0) / demands.length).toFixed(1) : 0,
          network_cities: networks.length,
          dominant_networks: networks.filter((n: any) => n.compounding_phase === "dominant" || n.compounding_phase === "monopolistic").length,
        },
        market_entries: entries,
        competitive_landscape: comps,
        supply_flywheel: flywheels,
        demand_acceleration: demands,
        network_compounding: networks,
      });
    }

    // ── Sequence Market Entry ──
    if (mode === "sequence_entry") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bandung", "Bali", "Medan", "Makassar", "Semarang", "Yogyakarta", "Palembang", "Balikpapan"];
      const rows: any[] = [];

      for (const city of cities) {
        const liq = 50 + Math.random() * 50;
        const dig = 40 + Math.random() * 60;
        const cap = 30 + Math.random() * 70;
        const reg = 50 + Math.random() * 50;
        const composite = liq * 0.3 + dig * 0.25 + cap * 0.25 + reg * 0.2;
        const timing = composite >= 80 ? "immediate" : composite >= 65 ? "next_quarter" : composite >= 50 ? "h2" : composite >= 35 ? "next_year" : "monitor";

        rows.push({
          city,
          country: params.country || "Indonesia",
          region_cluster: params.region || "Southeast Asia",
          liquidity_potential: +liq.toFixed(1),
          digital_adoption_score: +dig.toFixed(1),
          capital_inflow_intensity: +cap.toFixed(1),
          regulatory_openness: +reg.toFixed(1),
          composite_priority: +composite.toFixed(1),
          entry_timing: timing,
          entry_strategy: timing === "immediate" ? "Full market launch with supply-side blitz" : timing === "next_quarter" ? "Soft launch with agent partnerships" : "Monitor and build intelligence",
          population_millions: +(1 + Math.random() * 15).toFixed(1),
          proptech_penetration_pct: +(Math.random() * 30).toFixed(1),
        });
      }

      const { error } = await sb.from("gpewm_market_entry").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gpewm_engine_cycle", entity_type: "gpewm", priority_level: "medium", payload: { mode, markets: cities.length } });

      return json({ markets_sequenced: rows.length, top_target: rows.sort((a, b) => b.composite_priority - a.composite_priority)[0]?.city });
    }

    // ── Map Competitive Landscape ──
    if (mode === "map_competition") {
      const competitors = [
        { name: "Rumah123", type: "portal" }, { name: "OLX Property", type: "portal" },
        { name: "99.co", type: "portal" }, { name: "Lamudi", type: "portal" },
        { name: "Ray White ID", type: "brokerage" }, { name: "ERA Indonesia", type: "brokerage" },
        { name: "KreditPro", type: "fintech" }, { name: "Pinhome", type: "hybrid" },
      ];

      const rows: any[] = [];
      for (const comp of competitors) {
        const vuln = 30 + Math.random() * 60;
        const strategy = vuln >= 70 ? "displace" : vuln >= 50 ? "differentiate" : vuln >= 30 ? "bundle" : "partner";
        rows.push({
          city: params.city || "Jakarta",
          competitor_name: comp.name,
          competitor_type: comp.type,
          market_share_pct: +(Math.random() * 25).toFixed(1),
          listing_volume: Math.floor(1000 + Math.random() * 50000),
          digital_maturity_score: +(30 + Math.random() * 60).toFixed(1),
          vulnerability_score: +vuln.toFixed(1),
          response_strategy: strategy,
          displacement_timeline_months: strategy === "displace" ? Math.floor(6 + Math.random() * 18) : null,
          strategic_notes: `${strategy} strategy for ${comp.name} (${comp.type})`,
        });
      }

      const { error } = await sb.from("gpewm_competitive_landscape").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gpewm_engine_cycle", entity_type: "gpewm", priority_level: "medium", payload: { mode, competitors: rows.length } });

      const weakest = rows.sort((a, b) => b.vulnerability_score - a.vulnerability_score)[0];
      return json({ competitors_mapped: rows.length, most_vulnerable: weakest.competitor_name, vulnerability: weakest.vulnerability_score });
    }

    // ── Activate Supply Flywheel ──
    if (mode === "activate_flywheel") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bali", "Bandung", "Medan"];
      const rows: any[] = [];

      for (const city of cities) {
        const onboard = 20 + Math.random() * 80;
        const quality = 40 + Math.random() * 60;
        const vendors = Math.floor(5 + Math.random() * 50);
        const incentive = 30 + Math.random() * 70;
        const match = 30 + Math.random() * 70;
        const rpm = (onboard * 0.25 + quality * 0.2 + vendors * 0.6 + incentive * 0.15 + match * 0.25);
        const phase = rpm >= 70 ? "self_sustaining" : rpm >= 55 ? "accelerating" : rpm >= 40 ? "igniting" : "seeding";

        rows.push({
          city,
          supply_onboarding_velocity: +onboard.toFixed(1),
          listing_quality_score: +quality.toFixed(1),
          vendor_ecosystem_depth: vendors,
          incentive_effectiveness: +incentive.toFixed(1),
          demand_match_efficiency: +match.toFixed(1),
          flywheel_rpm: +rpm.toFixed(1),
          flywheel_phase: phase,
          activation_strategy: phase === "self_sustaining" ? "Scale operations, reduce incentives" : phase === "accelerating" ? "Double down on quality and vendor onboarding" : "Seed with aggressive agent incentives",
          supply_sources: JSON.stringify(["Direct owners", "Agent networks", "Developer partnerships"]),
        });
      }

      const { error } = await sb.from("gpewm_supply_flywheel").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gpewm_engine_cycle", entity_type: "gpewm", priority_level: "medium", payload: { mode, cities: cities.length } });

      return json({ cities_activated: rows.length, self_sustaining: rows.filter(r => r.flywheel_phase === "self_sustaining").length, avg_rpm: +(rows.reduce((s, r) => s + r.flywheel_rpm, 0) / rows.length).toFixed(1) });
    }

    // ── Accelerate Demand ──
    if (mode === "accelerate_demand") {
      const channels = ["SEO/Content", "Paid Search", "Social Media", "Referral Program", "Agent Network", "Developer Partnerships", "Email Marketing"];
      const rows: any[] = [];

      for (const ch of channels) {
        const funnel = 20 + Math.random() * 80;
        const content = 30 + Math.random() * 70;
        const accuracy = 40 + Math.random() * 60;
        const conversion = 1 + Math.random() * 12;
        const growth = 5 + Math.random() * 40;

        rows.push({
          city: params.city || "Jakarta",
          investor_funnel_velocity: +funnel.toFixed(1),
          content_discovery_score: +content.toFixed(1),
          recommendation_accuracy: +accuracy.toFixed(1),
          cac_current: Math.floor(50000 + Math.random() * 200000),
          cac_target: Math.floor(20000 + Math.random() * 80000),
          conversion_rate_pct: +conversion.toFixed(2),
          demand_growth_rate: +growth.toFixed(1),
          acquisition_channel: ch,
          funnel_stage: conversion >= 8 ? "conversion" : conversion >= 5 ? "evaluation" : conversion >= 3 ? "consideration" : "awareness",
          acceleration_lever: growth >= 25 ? "Scale investment aggressively" : "Optimize and test",
        });
      }

      const { error } = await sb.from("gpewm_demand_acceleration").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gpewm_engine_cycle", entity_type: "gpewm", priority_level: "medium", payload: { mode, channels: channels.length } });

      return json({ channels_modeled: rows.length, avg_conversion: +(rows.reduce((s, r) => s + r.conversion_rate_pct, 0) / rows.length).toFixed(2), top_channel: rows.sort((a, b) => b.demand_growth_rate - a.demand_growth_rate)[0]?.acquisition_channel });
    }

    // ── Compound Network Effects ──
    if (mode === "compound_network") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bali", "Bandung", "Medan", "Makassar"];
      const rows: any[] = [];

      for (const city of cities) {
        const liqDensity = 20 + Math.random() * 80;
        const dataAcc = 50 + Math.random() * 50;
        const cacReduc = 5 + Math.random() * 50;
        const netDensity = 10 + Math.random() * 90;
        const velocity = (liqDensity * 0.3 + dataAcc * 0.25 + cacReduc * 0.2 + netDensity * 0.25);
        const phase = velocity >= 75 ? "dominant" : velocity >= 60 ? "exponential" : velocity >= 45 ? "inflection" : "linear";
        const moat = velocity * 0.8 + dataAcc * 0.2;

        rows.push({
          city,
          liquidity_density: +liqDensity.toFixed(1),
          data_intelligence_accuracy: +dataAcc.toFixed(1),
          cac_reduction_pct: +cacReduc.toFixed(1),
          network_density: +netDensity.toFixed(1),
          compounding_velocity: +velocity.toFixed(1),
          compounding_phase: phase,
          time_to_dominance_months: phase === "dominant" ? 0 : Math.floor(6 + Math.random() * 36),
          moat_depth_score: +moat.toFixed(1),
          defensibility_tier: moat >= 80 ? "unassailable" : moat >= 60 ? "formidable" : moat >= 40 ? "establishing" : "emerging",
        });
      }

      const { error } = await sb.from("gpewm_network_compounding").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gpewm_engine_cycle", entity_type: "gpewm", priority_level: "medium", payload: { mode, cities: cities.length } });

      return json({ cities_modeled: rows.length, dominant: rows.filter(r => r.compounding_phase === "dominant").length, avg_velocity: +(rows.reduce((s, r) => s + r.compounding_velocity, 0) / rows.length).toFixed(1) });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
