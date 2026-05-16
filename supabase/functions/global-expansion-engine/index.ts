import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sb() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

function ok(d: unknown) {
  return new Response(JSON.stringify(d), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params = {} } = await req.json();
    const s = sb();

    // ── Dashboard ─────────────────────────────────────────────────────────
    if (mode === "dashboard") {
      const [countries, gateways, insights, partners, escrows, permissions, fxLedger] = await Promise.all([
        s.from("platform_countries").select("*").order("launch_priority_score", { ascending: false }),
        s.from("gateway_routing_profiles").select("*"),
        s.from("global_market_insights").select("*").order("computed_at", { ascending: false }).limit(50),
        s.from("regional_partner_registry").select("*").order("reliability_score", { ascending: false }),
        s.from("crossborder_escrow_records").select("*").order("created_at", { ascending: false }).limit(50),
        s.from("investor_region_permissions").select("*", { count: "exact" }),
        s.from("fx_conversion_ledger").select("*").order("created_at", { ascending: false }).limit(30),
      ]);

      const allCountries = countries.data || [];
      const allPartners = partners.data || [];
      const allEscrows = escrows.data || [];
      const allFx = fxLedger.data || [];

      const totalFxVolume = allFx.reduce((t: number, f: any) => t + Number(f.converted_amount || 0), 0);
      const totalEscrowVolume = allEscrows.reduce((t: number, e: any) => t + Number(e.converted_amount_idr || 0), 0);

      return ok({
        total_countries: allCountries.length,
        active_countries: allCountries.filter((c: any) => c.regulatory_status === "active").length,
        pilot_countries: allCountries.filter((c: any) => c.regulatory_status === "pilot").length,
        planned_countries: allCountries.filter((c: any) => c.regulatory_status === "planned").length,
        total_partners: allPartners.length,
        active_partners: allPartners.filter((p: any) => p.onboarding_status === "active").length,
        total_gateways: (gateways.data || []).length,
        global_investors: permissions.count || 0,
        total_fx_volume: totalFxVolume,
        total_crossborder_escrow: totalEscrowVolume,
        pending_escrows: allEscrows.filter((e: any) => e.compliance_status === "pending").length,
        cleared_escrows: allEscrows.filter((e: any) => e.compliance_status === "cleared").length,
        market_cities_covered: (insights.data || []).length,
        countries: allCountries,
        gateways: gateways.data || [],
        insights: (insights.data || []).slice(0, 20),
        partners: allPartners,
        recent_fx: allFx.slice(0, 10),
      });
    }

    // ── List countries ────────────────────────────────────────────────────
    if (mode === "list_countries") {
      const { data, error } = await s.from("platform_countries").select("*").order("launch_priority_score", { ascending: false });
      if (error) throw error;
      return ok(data);
    }

    // ── Add country ───────────────────────────────────────────────────────
    if (mode === "add_country") {
      const { country_code, country_name, base_currency, regulatory_status, flag_emoji } = params;
      if (!country_code || !country_name) throw new Error("country_code and country_name required");
      const { data, error } = await s.from("platform_countries").insert({
        country_code, country_name, base_currency: base_currency || "USD",
        regulatory_status: regulatory_status || "planned", flag_emoji,
      }).select().single();
      if (error) throw error;
      return ok(data);
    }

    // ── Market insights ───────────────────────────────────────────────────
    if (mode === "market_insights") {
      const { country_code } = params;
      let query = s.from("global_market_insights").select("*").order("demand_index", { ascending: false });
      if (country_code) query = query.eq("country_code", country_code);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return ok(data);
    }

    // ── Partner management ────────────────────────────────────────────────
    if (mode === "list_partners") {
      const { country_code } = params;
      let query = s.from("regional_partner_registry").select("*").order("reliability_score", { ascending: false });
      if (country_code) query = query.eq("country_code", country_code);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return ok(data);
    }

    if (mode === "add_partner") {
      const { country_code, partner_name, partner_type, contact_email } = params;
      if (!country_code || !partner_name || !partner_type) throw new Error("country_code, partner_name, partner_type required");
      const { data, error } = await s.from("regional_partner_registry").insert({
        country_code, partner_name, partner_type, contact_email,
      }).select().single();
      if (error) throw error;
      return ok(data);
    }

    // ── FX conversion log ─────────────────────────────────────────────────
    if (mode === "fx_history") {
      const { data, error } = await s.from("fx_conversion_ledger").select("*").order("created_at", { ascending: false }).limit(params.limit || 30);
      if (error) throw error;
      return ok(data);
    }

    // ── Gateway profiles ──────────────────────────────────────────────────
    if (mode === "list_gateways") {
      const { data, error } = await s.from("gateway_routing_profiles").select("*").order("country_code");
      if (error) throw error;
      return ok(data);
    }

    // ── Cross-border escrow records ───────────────────────────────────────
    if (mode === "crossborder_escrows") {
      const { data, error } = await s.from("crossborder_escrow_records").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return ok(data);
    }

    throw new Error(`Unknown mode: ${mode}`);
  } catch (e) {
    return err(e.message);
  }
});
