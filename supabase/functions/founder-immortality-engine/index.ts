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
    let result: unknown;

    switch (mode) {
      case 'capture_intelligence': {
        const domain = (params.domain as string) || 'strategy';
        const domains = ['strategy', 'risk_management', 'market_timing', 'innovation', 'capital_allocation'];
        const captures = domains.map((d) => {
          const riskAppetite = 30 + Math.random() * 60;
          const confidence = 40 + Math.random() * 55;
          return {
            capture_type: d === 'risk_management' ? 'risk_calibration' : d === 'innovation' ? 'innovation_heuristic' : 'decision_pattern',
            domain: d,
            decision_pattern: {
              contrarian_bias: +(Math.random() * 0.8).toFixed(2),
              data_dependency: +(0.3 + Math.random() * 0.6).toFixed(2),
              speed_vs_accuracy: d === 'market_timing' ? 'speed' : 'accuracy',
              horizon: d === 'capital_allocation' ? 'multi_decade' : 'medium_term',
            },
            risk_appetite_calibration: +riskAppetite.toFixed(2),
            market_interpretation: {
              macro_weight: +(0.2 + Math.random() * 0.5).toFixed(2),
              micro_weight: +(0.3 + Math.random() * 0.4).toFixed(2),
              sentiment_factor: +(Math.random() * 0.3).toFixed(2),
            },
            innovation_heuristic: d === 'innovation'
              ? 'First-principles decomposition → adjacent possibility scanning → rapid prototype validation'
              : null,
            confidence_level: +confidence.toFixed(2),
            source_context: `Founder pattern capture: ${d}`,
          };
        });
        const { error } = await supabase.from('afiba_intelligence_capture').insert(captures);
        if (error) throw error;
        result = { captured: captures.length, domains: domains };
        break;
      }

      case 'compound_memory': {
        const memoryTypes = ['deal_outcome', 'market_cycle', 'crisis_response', 'partnership_evolution', 'technology_pivot'];
        const rows = memoryTypes.map((mt, i) => {
          const relevance = 30 + Math.random() * 65;
          const compounding = 1 + Math.random() * 4;
          const advantage = relevance * compounding * 0.2;
          return {
            memory_type: mt,
            knowledge_domain: mt === 'deal_outcome' ? 'investment' : mt === 'market_cycle' ? 'macroeconomics' : mt === 'crisis_response' ? 'risk' : 'operations',
            memory_content: {
              pattern: `${mt} pattern from epoch ${i + 1}`,
              key_lesson: `Systematic learning from ${mt.replace('_', ' ')} across multiple cycles`,
              applicability: relevance > 60 ? 'high' : 'moderate',
            },
            compounding_factor: +compounding.toFixed(2),
            institutional_relevance_score: +relevance.toFixed(2),
            deal_outcomes_linked: Math.floor(5 + Math.random() * 50),
            decade_span: `${2020 + i * 5}-${2025 + i * 5}`,
            strategic_advantage_index: +advantage.toFixed(2),
            memory_epoch: i + 1,
          };
        });
        const { error } = await supabase.from('afiba_strategic_memory').insert(rows);
        if (error) throw error;
        result = { memories_compounded: rows.length, avg_advantage: +(rows.reduce((a, r) => a + r.strategic_advantage_index, 0) / rows.length).toFixed(2) };
        break;
      }

      case 'simulate_leadership': {
        const simType = (params.simulation_type as string) || 'scenario_planning';
        const scenarios = [
          { desc: 'Global recession with 40% property value decline', severity: 85 },
          { desc: 'Regulatory disruption in key markets', severity: 65 },
          { desc: 'Exponential growth opportunity in emerging market', severity: 30 },
          { desc: 'Technology paradigm shift requiring full pivot', severity: 70 },
        ];
        const rows = scenarios.map((s) => {
          const ethosAlign = 60 + Math.random() * 35;
          const confidence = 45 + Math.random() * 50;
          return {
            simulation_type: s.severity > 60 ? 'crisis_navigation' : 'scenario_planning',
            scenario_description: s.desc,
            crisis_severity: s.severity,
            capital_allocation_judgment: {
              defensive_allocation: s.severity > 70 ? 0.6 : 0.3,
              opportunistic_allocation: s.severity > 70 ? 0.2 : 0.5,
              reserve_maintenance: s.severity > 70 ? 0.2 : 0.2,
            },
            founder_ethos_alignment: +ethosAlign.toFixed(2),
            decision_output: {
              primary_action: s.severity > 70 ? 'defensive_consolidation' : 'strategic_expansion',
              secondary_action: s.severity > 70 ? 'selective_acquisition' : 'market_penetration',
              timeline: s.severity > 70 ? '6_months' : '18_months',
            },
            confidence_score: +confidence.toFixed(2),
            alternative_paths: 2 + Math.floor(Math.random() * 4),
            selected_path_rationale: s.severity > 70
              ? 'Capital preservation with opportunistic deployment when fear peaks'
              : 'Aggressive growth aligned with founder vision of market dominance',
            simulation_outcome: 'completed',
          };
        });
        const { error } = await supabase.from('afiba_leadership_simulation').insert(rows);
        if (error) throw error;
        result = { simulations: rows.length, crisis_scenarios: rows.filter((r) => r.simulation_type === 'crisis_navigation').length };
        break;
      }

      case 'evolve_vision': {
        const triggers = ['market_shift', 'tech_breakthrough', 'societal_shift', 'competitive_disruption'];
        const rows = triggers.map((t, i) => {
          const drift = Math.random() * 30;
          const alignment = 100 - drift;
          const magnitude = drift > 20 ? 'major' : drift > 10 ? 'moderate' : 'minor';
          return {
            evolution_trigger: t,
            market_reality: { shift_magnitude: +(Math.random() * 80).toFixed(2), affected_regions: ['SEA', 'MENA', 'LATAM'].slice(0, 1 + Math.floor(Math.random() * 3)) },
            tech_breakthrough: t === 'tech_breakthrough' ? { technology: 'quantum_computing_integration', impact: 'transformative', readiness: 'early' } : {},
            societal_shift: t === 'societal_shift' ? { trend: 'post_ownership_economy', adoption: 'accelerating' } : {},
            intelligence_refinement: {
              weights_adjusted: Math.floor(3 + Math.random() * 10),
              models_recalibrated: Math.floor(1 + Math.random() * 5),
              new_heuristics: Math.floor(Math.random() * 3),
            },
            vision_drift_score: +drift.toFixed(2),
            alignment_with_original: +alignment.toFixed(2),
            evolution_epoch: i + 1,
            evolution_magnitude: magnitude,
          };
        });
        const { error } = await supabase.from('afiba_vision_evolution').insert(rows);
        if (error) throw error;
        result = { evolutions: rows.length, avg_alignment: +(rows.reduce((a, r) => a + r.alignment_with_original, 0) / rows.length).toFixed(2) };
        break;
      }

      case 'governance_review': {
        const reviewTypes = ['ethical_review', 'strategic_consistency', 'evolution_control', 'drift_assessment'];
        const rows = reviewTypes.map((rt) => {
          const ethical = 50 + Math.random() * 50;
          const strategic = 55 + Math.random() * 45;
          const overrideNeeded = ethical < 65 || strategic < 60;
          const driftRisk = ethical < 60 ? 'critical' : ethical < 75 ? 'elevated' : 'low';
          return {
            governance_type: rt,
            ethical_alignment_score: +ethical.toFixed(2),
            strategic_consistency_score: +strategic.toFixed(2),
            evolution_control_status: ethical >= 75 && strategic >= 70 ? 'within_bounds' : 'requires_review',
            override_required: overrideNeeded,
            override_reason: overrideNeeded ? `${rt} scores below threshold` : null,
            risk_of_drift: driftRisk,
            corrective_action: overrideNeeded ? { action: 'recalibrate_to_founder_baseline', urgency: driftRisk } : {},
            audit_trail: [{ timestamp: new Date().toISOString(), action: `${rt} completed`, reviewer: 'guardian_council_ai' }],
            review_period: 'quarterly',
          };
        });
        const { error } = await supabase.from('afiba_legacy_governance').insert(rows);
        if (error) throw error;
        result = { reviews: rows.length, overrides_required: rows.filter((r) => r.override_required).length };
        break;
      }

      case 'dashboard': {
        const [captures, memories, sims, visions, governance] = await Promise.all([
          supabase.from('afiba_intelligence_capture').select('*').eq('is_active', true).order('captured_at', { ascending: false }).limit(20),
          supabase.from('afiba_strategic_memory').select('*').order('strategic_advantage_index', { ascending: false }).limit(15),
          supabase.from('afiba_leadership_simulation').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('afiba_vision_evolution').select('*').order('evolution_epoch', { ascending: false }).limit(10),
          supabase.from('afiba_legacy_governance').select('*').order('computed_at', { ascending: false }).limit(10),
        ]);

        const c = captures.data || [];
        const m = memories.data || [];
        const g = governance.data || [];

        result = {
          summary: {
            active_patterns: c.length,
            avg_confidence: c.length ? +(c.reduce((a: number, r: any) => a + (r.confidence_level || 0), 0) / c.length).toFixed(1) : 0,
            memories_compounded: m.length,
            avg_strategic_advantage: m.length ? +(m.reduce((a: number, r: any) => a + (r.strategic_advantage_index || 0), 0) / m.length).toFixed(1) : 0,
            simulations_run: (sims.data || []).length,
            vision_alignment: (visions.data || []).length ? +((visions.data || []).reduce((a: number, r: any) => a + (r.alignment_with_original || 0), 0) / (visions.data || []).length).toFixed(1) : 100,
            governance_overrides: g.filter((r: any) => r.override_required).length,
          },
          intelligence_captures: c,
          strategic_memories: m,
          leadership_simulations: sims.data || [],
          vision_evolution: visions.data || [],
          legacy_governance: g,
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
