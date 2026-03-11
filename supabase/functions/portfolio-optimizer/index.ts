import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ── City & type configs ──
const CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Bali', 'Medan', 'Semarang', 'Yogyakarta', 'Makassar'];
const PROPERTY_TYPES = ['Rumah', 'Apartemen', 'Ruko', 'Tanah', 'Villa', 'Kost'];

const cityPremium: Record<string, number> = {
  Jakarta: 1.15, Bali: 1.12, Surabaya: 1.05, Bandung: 1.03,
  Medan: 0.98, Semarang: 0.95, Yogyakarta: 0.97, Makassar: 0.96,
};
const typeYield: Record<string, number> = {
  Rumah: 5.5, Apartemen: 6.2, Ruko: 7.0, Tanah: 3.5, Villa: 5.8, Kost: 8.5,
};

function rand(min: number, max: number) { return +(min + Math.random() * (max - min)).toFixed(4); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Pipeline: Performance ──
async function runPerformance() {
  await supabase.from('portfolio_optimizer_performance').delete().neq('id', '');
  const rows = CITIES.flatMap(city =>
    PROPERTY_TYPES.map(pt => {
      const base = (typeYield[pt] || 5) * (cityPremium[city] || 1);
      return {
        city, property_type: pt,
        total_return: rand(base * 0.8, base * 1.4),
        risk_score: rand(15, 65),
        alpha: rand(-2, 5),
        beta: rand(0.4, 1.6),
        max_drawdown: rand(5, 30),
        yield_stability: rand(40, 95),
        efficiency_score: rand(30, 95),
      };
    })
  );
  const { error } = await supabase.from('portfolio_optimizer_performance').insert(rows);
  if (error) throw error;
  return rows.length;
}

// ── Pipeline: Diversification ──
async function runDiversification() {
  await supabase.from('portfolio_optimizer_diversification').delete().neq('id', '');
  const exposures = ['low', 'moderate', 'high', 'overweight'];
  const rows = CITIES.flatMap(city =>
    PROPERTY_TYPES.map(pt => ({
      city, property_type: pt,
      correlation_score: rand(-0.3, 0.9),
      diversification_benefit: rand(5, 40),
      concentration_risk: rand(5, 60),
      recommended_weight: rand(2, 20),
      sector_exposure: pick(exposures),
    }))
  );
  const { error } = await supabase.from('portfolio_optimizer_diversification').insert(rows);
  if (error) throw error;
  return rows.length;
}

// ── Pipeline: Allocations ──
async function runAllocations() {
  await supabase.from('portfolio_optimizer_allocations').delete().neq('id', '');
  const directions = ['increase', 'decrease', 'hold'];
  const rows = CITIES.flatMap(city =>
    PROPERTY_TYPES.map(pt => {
      const current = rand(2, 18);
      const optimal = rand(3, 20);
      const diff = optimal - current;
      return {
        city, property_type: pt,
        current_allocation_pct: current,
        optimal_allocation_pct: optimal,
        adjustment_direction: diff > 2 ? 'increase' : diff < -2 ? 'decrease' : 'hold',
        risk_adjusted_return: rand(3, 12),
        sharpe_ratio: rand(0.3, 2.5),
        rebalance_priority: Math.floor(rand(1, 10)),
      };
    })
  );
  const { error } = await supabase.from('portfolio_optimizer_allocations').insert(rows);
  if (error) throw error;
  return rows.length;
}

// ── Pipeline: Rebalancing ──
async function runRebalancing() {
  await supabase.from('portfolio_optimizer_rebalancing').delete().neq('id', '');
  const actions = ['buy', 'sell', 'hold', 'rotate'];
  const urgencies = ['high', 'medium', 'low'];
  const reasons = [
    'Overvalued relative to fundamentals',
    'Strong demand momentum',
    'Underweight vs optimal allocation',
    'Cycle peak approaching — reduce exposure',
    'High yield stability — maintain position',
    'Rotation opportunity into higher growth market',
    'Concentration risk exceeds threshold',
    'New supply pipeline pressuring prices',
  ];
  const rows = CITIES.flatMap(city =>
    PROPERTY_TYPES.map(pt => ({
      city, property_type: pt,
      action: pick(actions),
      reason: pick(reasons),
      expected_return_improvement: rand(0.5, 8),
      risk_reduction_pct: rand(1, 15),
      urgency: pick(urgencies),
      capital_required: rand(50, 2000) * 1_000_000,
    }))
  );
  const { error } = await supabase.from('portfolio_optimizer_rebalancing').insert(rows);
  if (error) throw error;
  return rows.length;
}

// ── Pipeline: Scenarios ──
async function runScenarios() {
  await supabase.from('portfolio_optimizer_scenarios').delete().neq('id', '');
  const scenarios = ['aggressive', 'balanced', 'conservative', 'income'];
  const rows = scenarios.flatMap(scenario =>
    CITIES.flatMap(city =>
      PROPERTY_TYPES.map(pt => {
        const mult = scenario === 'aggressive' ? 1.4 : scenario === 'balanced' ? 1.0 : scenario === 'conservative' ? 0.7 : 0.85;
        return {
          scenario_name: scenario, city, property_type: pt,
          weight_pct: rand(1, 25),
          projected_return: rand(3, 15) * mult,
          projected_risk: rand(8, 35) * (scenario === 'aggressive' ? 1.3 : scenario === 'conservative' ? 0.6 : 1),
          sharpe_ratio: rand(0.3, 2.8),
        };
      })
    )
  );
  // Insert in chunks of 50
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await supabase.from('portfolio_optimizer_scenarios').insert(rows.slice(i, i + 50));
    if (error) throw error;
  }
  return rows.length;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { pipeline = 'full_optimize' } = await req.json().catch(() => ({}));

    const results: Record<string, number> = {};

    const pipelines: Record<string, () => Promise<number>> = {
      performance: runPerformance,
      diversification: runDiversification,
      allocations: runAllocations,
      rebalancing: runRebalancing,
      scenarios: runScenarios,
    };

    if (pipeline === 'full_optimize') {
      for (const [key, fn] of Object.entries(pipelines)) {
        results[key] = await fn();
      }
    } else if (pipelines[pipeline]) {
      results[pipeline] = await pipelines[pipeline]();
    } else {
      return new Response(JSON.stringify({ error: `Unknown pipeline: ${pipeline}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, pipeline, results, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
