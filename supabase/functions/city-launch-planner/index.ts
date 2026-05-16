import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CityInput {
  city: string;
  province: string;
  population: number;
  monthly_property_transactions: number;
  rental_demand_index: number;       // 0-100
  developer_count: number;
  vendor_coverage_pct: number;       // 0-100
  investor_interest_signals: number; // 0-100
}

interface CityPlan {
  city: string;
  readiness_score: number;
  readiness_tier: string;
  recommended_budget_idr: number;
  target_listings: number;
  vendor_recruitment_targets: Record<string, number>;
  revenue_ramp: { month: number; revenue_idr: number }[];
  launch_checklist: { phase: string; items: string[] }[];
  risk_factors: string[];
}

function computeCityReadiness(input: CityInput): CityPlan {
  // Population weight (0-100): >2M = 100, <200k = 20
  const popScore = Math.min(100, Math.max(20, (input.population / 2_000_000) * 100));

  // Transaction volume (0-100): >500/mo = 100
  const txScore = Math.min(100, (input.monthly_property_transactions / 500) * 100);

  // Composite readiness
  const readiness = Math.round(
    popScore * 0.15 +
    txScore * 0.25 +
    input.rental_demand_index * 0.2 +
    Math.min(100, input.developer_count * 5) * 0.15 +
    input.vendor_coverage_pct * 0.1 +
    input.investor_interest_signals * 0.15
  );

  const tier =
    readiness >= 80 ? "ready" :
    readiness >= 60 ? "promising" :
    readiness >= 40 ? "developing" : "early";

  // Budget scales with city size
  const baseBudget = 1_500_000_000; // Rp 1.5B base
  const budgetMult = readiness >= 80 ? 1.0 : readiness >= 60 ? 1.2 : 1.5;
  const recommended_budget_idr = Math.round(baseBudget * budgetMult);

  // Target listings for ignition
  const target_listings = readiness >= 80 ? 300 : readiness >= 60 ? 250 : 150;

  // Vendor recruitment by category
  const vendorBase = readiness >= 60 ? 80 : 40;
  const vendor_recruitment_targets: Record<string, number> = {
    "Interior Design": Math.round(vendorBase * 0.2),
    "Renovation": Math.round(vendorBase * 0.25),
    "Legal / Notary": Math.round(vendorBase * 0.15),
    "Moving Services": Math.round(vendorBase * 0.1),
    "Cleaning": Math.round(vendorBase * 0.1),
    "Photography": Math.round(vendorBase * 0.1),
    "Pest Control": Math.round(vendorBase * 0.05),
    "Security": Math.round(vendorBase * 0.05),
  };

  // Revenue ramp (6 months)
  const monthlyGrowth = readiness >= 80 ? 1.4 : readiness >= 60 ? 1.3 : 1.2;
  const baseRevenue = readiness >= 80 ? 80_000_000 : readiness >= 60 ? 50_000_000 : 25_000_000;
  const revenue_ramp = Array.from({ length: 6 }, (_, i) => ({
    month: i + 1,
    revenue_idr: Math.round(baseRevenue * Math.pow(monthlyGrowth, i)),
  }));

  const launch_checklist = [
    { phase: "Intelligence Prep", items: ["Seed district-level market data", "Initialize liquidity index", "Map competitor landscape"] },
    { phase: "Supply Activation", items: ["Onboard top 20 agents", `Recruit ${target_listings} listings`, "Verify developer partnerships"] },
    { phase: "Demand Activation", items: ["Launch geo-targeted ads", "Activate investor push campaigns", "Host launch event"] },
    { phase: "Transaction Kickstart", items: ["Enable deal routing for city", "Assign City GM", "Open vendor marketplace"] },
    { phase: "Social Proof", items: ["Collect first 10 testimonials", "PR coverage in local media", "Activate referral program"] },
    { phase: "Scale Trigger", items: ["Hit 12 deals/month target", "Achieve vendor 80+ network", "Reach break-even by month 9"] },
  ];

  const risk_factors: string[] = [];
  if (input.vendor_coverage_pct < 30) risk_factors.push("Low vendor supply — aggressive recruitment needed");
  if (input.monthly_property_transactions < 100) risk_factors.push("Low transaction volume — longer ramp expected");
  if (input.developer_count < 5) risk_factors.push("Limited developer presence — focus on secondary market");
  if (input.investor_interest_signals < 30) risk_factors.push("Weak investor signals — increase marketing spend");

  return {
    city: input.city,
    readiness_score: readiness,
    readiness_tier: tier,
    recommended_budget_idr,
    target_listings,
    vendor_recruitment_targets,
    revenue_ramp,
    launch_checklist,
    risk_factors,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode = "plan", cities } = body;

    if (mode === "plan" && Array.isArray(cities)) {
      const plans = cities.map((c: CityInput) => computeCityReadiness(c));
      plans.sort((a, b) => b.readiness_score - a.readiness_score);

      return new Response(JSON.stringify({ plans, total_cities: plans.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single city
    const plan = computeCityReadiness(body as CityInput);
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
