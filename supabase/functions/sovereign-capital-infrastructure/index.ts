import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params = {} } = await req.json();
    const json = (d: unknown) => new Response(JSON.stringify({ data: d }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    switch (mode) {
      case "onboard_capital": {
        const {
          institution_name = "Sovereign Fund",
          institution_type = "sovereign_fund",
          jurisdiction = "Singapore",
          capital_horizon = "long",
          risk_appetite = "moderate",
          deployment_capacity_usd = 100000000,
        } = params;

        const horizonLiquidity: Record<string, number> = { short: 60, medium: 35, long: 15, perpetual: 5 };
        const riskExposure: Record<string, number> = { conservative: 5, moderate: 10, growth: 20, aggressive: 30 };

        const { data } = await supabase.from("asci_capital_intake").insert({
          institution_name, institution_type, jurisdiction, capital_horizon, risk_appetite,
          liquidity_tolerance_pct: horizonLiquidity[capital_horizon] || 20,
          deployment_capacity_usd,
          min_ticket_usd: deployment_capacity_usd * 0.01,
          max_single_exposure_pct: riskExposure[risk_appetite] || 10,
          approved_asset_classes: ["residential", "commercial", "mixed_use", "industrial"],
          approved_geographies: ["Indonesia", "Singapore", "Malaysia", "Thailand"],
          esg_requirements: { carbon_neutral_target: true, social_impact_minimum: "moderate", governance_standard: "GRESB" },
          regulatory_constraints: [
            { type: "max_foreign_ownership", value: "49%", jurisdiction: "Indonesia" },
            { type: "repatriation_lock", value: "12_months", jurisdiction },
          ],
          onboarding_status: "due_diligence",
        }).select().single();
        return json(data);
      }

      case "compute_allocation": {
        const { region = "Southeast Asia", asset_class = "residential" } = params;

        const growth = 30 + Math.random() * 60;
        const demoExpansion = 1 + Math.random() * 5;
        const infraPipeline = 500000000 + Math.random() * 10000000000;
        const yieldDiff = 50 + Math.random() * 300;
        const riskAdjReturn = 4 + Math.random() * 12;
        const weight = (growth * 0.3 + Math.min(100, yieldDiff / 3) * 0.3 + Math.min(100, demoExpansion * 15) * 0.2 + Math.min(100, infraPipeline / 100000000) * 0.2) / 100 * 30;

        const { data } = await supabase.from("asci_macro_allocation").insert({
          region, city: params.city || null, asset_class,
          growth_momentum_score: growth,
          demographic_expansion_rate: demoExpansion,
          infrastructure_pipeline_usd: infraPipeline,
          yield_differential_bps: yieldDiff,
          allocation_weight_pct: Math.min(30, weight),
          risk_adjusted_return: riskAdjReturn,
          macro_confidence: 40 + Math.random() * 50,
          recommended_deployment_usd: weight * 1000000,
          allocation_rationale: growth > 70
            ? "High-growth region with strong infrastructure catalyst — overweight recommended"
            : growth > 45
            ? "Stable growth with attractive yield spread — market-weight allocation"
            : "Moderate fundamentals — underweight pending catalyst confirmation",
        }).select().single();
        return json(data);
      }

      case "simulate_risk": {
        const { region = "Jakarta", risk_type = "cyclical_downturn" } = params;

        const severityMap: Record<string, number> = {
          cyclical_downturn: 40 + Math.random() * 35,
          oversupply_bubble: 30 + Math.random() * 45,
          macro_shock: 50 + Math.random() * 40,
          currency_crisis: 35 + Math.random() * 40,
          political_instability: 20 + Math.random() * 50,
          liquidity_freeze: 45 + Math.random() * 35,
        };
        const severity = severityMap[risk_type] || 50;
        const probability = 0.05 + Math.random() * 0.4;
        const drawdown = severity * probability * 0.5;

        const { data } = await supabase.from("asci_risk_stabilization").insert({
          region, risk_type, severity, probability,
          potential_drawdown_pct: drawdown,
          time_horizon_months: risk_type === "macro_shock" ? 6 : 18,
          early_warning_triggered: severity > 65 && probability > 0.25,
          simulation_scenarios: [
            { scenario: "base", drawdown_pct: drawdown * 0.5, recovery_months: 12 },
            { scenario: "adverse", drawdown_pct: drawdown, recovery_months: 24 },
            { scenario: "severe", drawdown_pct: drawdown * 1.8, recovery_months: 36 },
          ],
          mitigation_strategies: [
            { strategy: "Geographic diversification", cost_pct: 0.3, effectiveness: "high" },
            { strategy: "FX hedging overlay", cost_pct: 1.2, effectiveness: "medium" },
            { strategy: "Liquidity buffer reserve", cost_pct: 0.5, effectiveness: "high" },
          ],
          hedging_cost_pct: 0.8 + Math.random() * 2,
          stress_test_result: severity > 70 && probability > 0.3 ? "fail" : severity > 50 ? "marginal" : "pass",
        }).select().single();
        return json(data);
      }

      case "orchestrate_deployment": {
        const {
          source_jurisdiction = "Singapore",
          target_jurisdiction = "Indonesia",
          deployment_tranche_usd = 25000000,
        } = params;

        const fxCost = source_jurisdiction === target_jurisdiction ? 0 : 0.5 + Math.random() * 2.5;
        const phase = params.deployment_phase || 1;

        const phaseDescs: Record<number, string> = {
          1: "Due diligence and regulatory pre-clearance",
          2: "FX hedging and capital structuring",
          3: "Initial deployment — anchor assets",
          4: "Scale-up — portfolio expansion",
          5: "Steady-state — yield optimization and rebalancing",
        };

        const { data } = await supabase.from("asci_crossborder_deployment").insert({
          source_jurisdiction, target_jurisdiction,
          deployment_tranche_usd,
          currency_pair: `${source_jurisdiction === "Singapore" ? "SGD" : "USD"}/${target_jurisdiction === "Indonesia" ? "IDR" : "USD"}`,
          fx_hedging_strategy: fxCost > 1.5 ? "Rolling 12m forward hedge" : "Natural hedge with local revenue",
          fx_cost_annual_pct: fxCost,
          deployment_phase: phase,
          phase_description: phaseDescs[phase] || "Active deployment",
          co_investment_partners: Math.floor(Math.random() * 5),
          syndication_structure: deployment_tranche_usd > 50000000 ? "Club deal with lead-follow" : "Direct bilateral",
          regulatory_clearance: phase >= 2,
          tax_treaty_benefit: source_jurisdiction !== target_jurisdiction,
          withholding_tax_pct: target_jurisdiction === "Indonesia" ? 10 : 15,
          deployment_status: phase >= 3 ? "deploying" : phase >= 2 ? "cleared" : "planning",
        }).select().single();
        return json(data);
      }

      case "generate_transparency": {
        const { institution_id, reporting_period = "2026-Q1" } = params;

        const deployed = 10000000 + Math.random() * 200000000;
        const totalReturn = 4 + Math.random() * 14;
        const benchmark = 6 + Math.random() * 4;
        const alpha = totalReturn - benchmark;

        const { data } = await supabase.from("asci_trust_transparency").insert({
          institution_id: institution_id || null,
          reporting_period,
          total_deployed_usd: deployed,
          total_return_pct: totalReturn,
          benchmark_return_pct: benchmark,
          alpha_generated_pct: alpha,
          attribution_by_region: {
            "Jakarta": { weight: 40, return: totalReturn * 1.1 },
            "Bali": { weight: 25, return: totalReturn * 0.9 },
            "Surabaya": { weight: 20, return: totalReturn * 1.05 },
            "Bandung": { weight: 15, return: totalReturn * 0.85 },
          },
          attribution_by_asset_class: {
            "Residential": { weight: 45, return: totalReturn * 0.95 },
            "Commercial": { weight: 30, return: totalReturn * 1.1 },
            "Mixed-Use": { weight: 25, return: totalReturn * 1.02 },
          },
          scenario_projections: [
            { scenario: "bull", return_12m: totalReturn * 1.4, probability: 0.25 },
            { scenario: "base", return_12m: totalReturn, probability: 0.55 },
            { scenario: "bear", return_12m: totalReturn * 0.4, probability: 0.20 },
          ],
          governance_score: 60 + Math.random() * 35,
          transparency_index: 55 + Math.random() * 40,
          decision_confidence_score: 50 + Math.random() * 45,
          compliance_status: "compliant",
        }).select().single();
        return json(data);
      }

      case "dashboard": {
        const [intake, alloc, risk, deploy, trust] = await Promise.all([
          supabase.from("asci_capital_intake").select("*").order("created_at", { ascending: false }).limit(10),
          supabase.from("asci_macro_allocation").select("*").order("computed_at", { ascending: false }).limit(15),
          supabase.from("asci_risk_stabilization").select("*").order("assessed_at", { ascending: false }).limit(10),
          supabase.from("asci_crossborder_deployment").select("*").order("created_at", { ascending: false }).limit(10),
          supabase.from("asci_trust_transparency").select("*").order("report_generated_at", { ascending: false }).limit(5),
        ]);

        const totalCapacity = (intake.data || []).reduce((s, r) => s + (r.deployment_capacity_usd || 0), 0);
        const activeInstitutions = (intake.data || []).filter(r => r.onboarding_status === "active" || r.onboarding_status === "approved").length;
        const totalDeployed = (deploy.data || []).filter(d => d.deployment_status === "deployed" || d.deployment_status === "deploying").reduce((s, d) => s + (d.deployment_tranche_usd || 0), 0);
        const criticalRisks = (risk.data || []).filter(r => r.stress_test_result === "fail").length;
        const avgAlpha = (trust.data || []).reduce((s, t) => s + (t.alpha_generated_pct || 0), 0) / Math.max(1, (trust.data || []).length);

        const summary = {
          total_capital_capacity_usd: totalCapacity,
          active_institutions: activeInstitutions,
          total_deployed_usd: totalDeployed,
          deployment_ratio_pct: totalCapacity > 0 ? Math.round(totalDeployed / totalCapacity * 100) : 0,
          critical_risks: criticalRisks,
          avg_alpha_pct: Math.round(avgAlpha * 100) / 100,
          active_deployments: (deploy.data || []).filter(d => d.deployment_status === "deploying").length,
        };

        await supabase.from("ai_event_signals").insert({
          event_type: "asci_engine_cycle",
          entity_type: "asci_dashboard",
          priority_level: "low",
          payload: summary,
        });

        return json({ summary, intake: intake.data, allocations: alloc.data, risks: risk.data, deployments: deploy.data, transparency: trust.data });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
