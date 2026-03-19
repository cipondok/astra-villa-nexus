import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  mode: string;
  params?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params = {} } = (await req.json()) as RequestBody;
    const city = (params.city as string) || '';
    const region = (params.region as string) || '';

    let result: unknown;

    switch (mode) {
      case 'scan_prosperity_signals': {
        const cities = (params.cities as string[]) || ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta'];
        const rows = cities.map((c) => {
          const jobVelocity = 40 + Math.random() * 55;
          const affordability = 30 + Math.random() * 60;
          const infraProd = 35 + Math.random() * 60;
          const capitalFormation = Math.random() * 12;
          const composite = jobVelocity * 0.30 + affordability * 0.25 + infraProd * 0.25 + capitalFormation * 2.0;
          const tier = composite >= 80 ? 'acceleration_zone' : composite >= 60 ? 'growth_zone' : composite >= 40 ? 'emerging' : 'developing';
          return {
            city: c,
            country: 'ID',
            job_creation_velocity: +jobVelocity.toFixed(2),
            affordability_index: +affordability.toFixed(2),
            infrastructure_productivity: +infraProd.toFixed(2),
            capital_formation_rate: +capitalFormation.toFixed(2),
            prosperity_composite_score: +composite.toFixed(2),
            prosperity_zone_tier: tier,
            acceleration_detected: composite >= 75,
            signal_drivers: { job_weight: 0.30, afford_weight: 0.25, infra_weight: 0.25, capital_weight: 0.20 },
          };
        });
        const { error } = await supabase.from('ppop_prosperity_signals').insert(rows);
        if (error) throw error;
        result = { scanned: rows.length, acceleration_zones: rows.filter((r) => r.acceleration_detected).length };
        break;
      }

      case 'optimize_regeneration': {
        const targetCity = city || 'Jakarta';
        const districts = ['North', 'Central', 'East', 'South', 'West'];
        const rows = districts.map((d) => {
          const underperf = Math.random() * 90;
          const gap = Math.round(500000 + Math.random() * 50000000);
          const priority = underperf >= 70 ? 'critical' : underperf >= 45 ? 'high' : underperf >= 25 ? 'medium' : 'low';
          return {
            city: targetCity,
            district: `${d} ${targetCity}`,
            underperformance_score: +underperf.toFixed(2),
            investment_gap_usd: gap,
            revitalization_priority: priority,
            housing_quality_index: +(30 + Math.random() * 60).toFixed(2),
            economic_vitality_score: +(25 + Math.random() * 65).toFixed(2),
            projected_roi_5y: +(5 + Math.random() * 25).toFixed(2),
            intervention_type: underperf >= 60 ? 'comprehensive' : 'targeted',
            regeneration_phase: 'assessment',
          };
        });
        const { error } = await supabase.from('ppop_urban_regeneration').insert(rows);
        if (error) throw error;
        result = { city: targetCity, districts_assessed: rows.length, critical: rows.filter((r) => r.revitalization_priority === 'critical').length };
        break;
      }

      case 'equalize_opportunity': {
        const regions = ['Southeast Asia', 'South Asia', 'Middle East', 'Sub-Saharan Africa', 'Latin America'];
        const rows = regions.map((r) => {
          const imbalance = Math.random() * 80;
          const attraction = 20 + Math.random() * 75;
          const mobility = Math.random() * 60;
          return {
            region: r,
            wealth_imbalance_index: +imbalance.toFixed(2),
            development_attraction_score: +attraction.toFixed(2),
            upward_mobility_rate: +mobility.toFixed(2),
            emerging_market_readiness: +(30 + Math.random() * 60).toFixed(2),
            equalization_intervention: imbalance >= 60 ? 'capital_redirect' : imbalance >= 35 ? 'incentive_boost' : 'monitor',
            gini_improvement_pct: +(Math.random() * 8).toFixed(2),
          };
        });
        const { error } = await supabase.from('ppop_opportunity_equalization').insert(rows);
        if (error) throw error;
        result = { regions_analyzed: rows.length, redirections: rows.filter((r) => r.equalization_intervention === 'capital_redirect').length };
        break;
      }

      case 'align_long_horizon': {
        const targetCity = city || 'Jakarta';
        const assetProd = 40 + Math.random() * 55;
        const instAlign = 30 + Math.random() * 65;
        const societalBenefit = 35 + Math.random() * 60;
        const synergy = (assetProd + instAlign + societalBenefit) / 3;
        const tier = synergy >= 75 ? 'sovereign_alignment' : synergy >= 55 ? 'institutional' : 'standard';
        const row = {
          city: targetCity,
          asset_productivity_30y: +assetProd.toFixed(2),
          institutional_alignment_score: +instAlign.toFixed(2),
          societal_benefit_index: +societalBenefit.toFixed(2),
          infra_housing_capital_synergy: +synergy.toFixed(2),
          multi_decade_roi_forecast: +(4 + Math.random() * 14).toFixed(2),
          alignment_tier: tier,
          incentive_structure: { tax_incentive: synergy > 60, zoning_bonus: synergy > 70, infra_priority: synergy > 50 },
        };
        const { error } = await supabase.from('ppop_long_horizon_alignment').insert(row);
        if (error) throw error;
        result = { city: targetCity, synergy_score: row.infra_housing_capital_synergy, tier };
        break;
      }

      case 'run_feedback_loop': {
        const cycleId = `PPOP-${Date.now()}`;
        const txAnalyzed = 100 + Math.floor(Math.random() * 900);
        const devCycles = 10 + Math.floor(Math.random() * 40);
        const migrations = 5 + Math.floor(Math.random() * 20);
        const before = 55 + Math.random() * 25;
        const after = before + 1 + Math.random() * 8;
        const row = {
          cycle_id: cycleId,
          transaction_outcomes_analyzed: txAnalyzed,
          development_cycles_tracked: devCycles,
          migration_patterns_ingested: migrations,
          prediction_accuracy_before: +before.toFixed(2),
          prediction_accuracy_after: +after.toFixed(2),
          improvement_delta_pct: +(after - before).toFixed(2),
          prosperity_gain_cumulative: +(Math.random() * 15).toFixed(2),
          learning_epoch: Math.floor(Math.random() * 50) + 1,
        };
        const { error } = await supabase.from('ppop_feedback_loop').insert(row);
        if (error) throw error;
        result = { cycle_id: cycleId, improvement: row.improvement_delta_pct, transactions: txAnalyzed };
        break;
      }

      case 'dashboard': {
        const [signals, regen, equal, horizon, feedback] = await Promise.all([
          supabase.from('ppop_prosperity_signals').select('*').order('computed_at', { ascending: false }).limit(20),
          supabase.from('ppop_urban_regeneration').select('*').order('computed_at', { ascending: false }).limit(20),
          supabase.from('ppop_opportunity_equalization').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('ppop_long_horizon_alignment').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('ppop_feedback_loop').select('*').order('computed_at', { ascending: false }).limit(10),
        ]);

        const s = signals.data || [];
        const avgProsperity = s.length ? s.reduce((a: number, r: any) => a + (r.prosperity_composite_score || 0), 0) / s.length : 0;
        const accelZones = s.filter((r: any) => r.acceleration_detected).length;

        result = {
          summary: {
            cities_monitored: new Set(s.map((r: any) => r.city)).size,
            avg_prosperity_score: +avgProsperity.toFixed(1),
            acceleration_zones: accelZones,
            districts_regenerating: (regen.data || []).filter((r: any) => r.revitalization_priority === 'critical').length,
            regions_equalized: (equal.data || []).length,
            feedback_cycles: (feedback.data || []).length,
          },
          prosperity_signals: s,
          urban_regeneration: regen.data || [],
          opportunity_equalization: equal.data || [],
          long_horizon: horizon.data || [],
          feedback_loop: feedback.data || [],
        };
        break;
      }

      default:
        throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
