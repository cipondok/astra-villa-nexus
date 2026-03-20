import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'dashboard': {
        const [trust, align, lifecycle, stability, multi] = await Promise.all([
          sb.from('icd_trust_stack').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('icd_capital_alignment').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('icd_partnership_lifecycle').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('icd_stability_signaling').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('icd_multi_cycle').select('*').order('assessed_at', { ascending: false }).limit(10),
        ]);
        return json({
          trust: trust.data ?? [], alignment: align.data ?? [],
          lifecycle: lifecycle.data ?? [], stability: stability.data ?? [],
          multi_cycle: multi.data ?? [], computed_at: new Date().toISOString(),
        });
      }

      case 'build_trust': {
        const drivers = [
          { driver: 'governance_transparency', label: 'Governance Transparency' },
          { driver: 'execution_cadence', label: 'Predictable Execution Cadence' },
          { driver: 'capital_discipline', label: 'Capital Deployment Discipline' },
          { driver: 'audit_integrity', label: 'Audit Trail Integrity' },
          { driver: 'disclosure_quality', label: 'Disclosure Quality Standards' },
        ];
        const rows = drivers.map((d) => {
          const score = Math.round(45 + Math.random() * 50);
          return {
            trust_driver: d.driver, driver_label: d.label,
            trust_score: score, previous_score: Math.round(40 + Math.random() * 45),
            governance_grade: score > 80 ? 'A' : score > 65 ? 'B+' : score > 50 ? 'B' : 'C',
            execution_cadence_consistency: Math.round(50 + Math.random() * 45),
            capital_discipline_rating: Math.round(45 + Math.random() * 50),
            audit_trail_completeness: Math.round(60 + Math.random() * 38),
            board_independence_pct: Math.round(30 + Math.random() * 50),
            disclosure_quality_index: Math.round(50 + Math.random() * 45),
          };
        });
        const { error } = await sb.from('icd_trust_stack').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.trust_score, 0) / rows.length);
        await sb.from('ai_event_signals').insert({
          event_type: 'icd_engine_cycle', entity_type: 'icd', priority_level: 'low',
          payload: { mode: 'build_trust', avg_trust: avg },
        });
        return json({ drivers_assessed: rows.length, avg_trust: avg, top_grade: rows.sort((a, b) => b.trust_score - a.trust_score)[0]?.governance_grade });
      }

      case 'align_capital': {
        const types = [
          { type: 'co_investment', segment: 'growth_equity' },
          { type: 'market_expansion', segment: 'sovereign_wealth' },
          { type: 'shared_value', segment: 'strategic_corporate' },
          { type: 'ecosystem_integration', segment: 'family_office' },
          { type: 'innovation_partnership', segment: 'crossover_fund' },
        ];
        const rows = types.map((t) => ({
          alignment_type: t.type, partner_segment: t.segment,
          alignment_score: Math.round(40 + Math.random() * 55),
          shared_value_index: Math.round(30 + Math.random() * 65),
          co_investment_capacity_usd: Math.round(Math.random() * 100_000_000),
          collaboration_depth: ['exploratory', 'structured', 'deep', 'strategic'][Math.floor(Math.random() * 4)],
          market_overlap_pct: Math.round(20 + Math.random() * 60),
          strategic_fit_score: Math.round(45 + Math.random() * 50),
          narrative_coherence: Math.round(50 + Math.random() * 45),
          active_initiatives: Math.floor(Math.random() * 5),
        }));
        const { error } = await sb.from('icd_capital_alignment').insert(rows);
        if (error) throw error;
        const totalCap = rows.reduce((s, r) => s + r.co_investment_capacity_usd, 0);
        return json({ alignments: rows.length, total_capacity_usd: totalCap, deep: rows.filter((r) => r.collaboration_depth === 'deep' || r.collaboration_depth === 'strategic').length });
      }

      case 'manage_lifecycle': {
        const partners = [
          { name: 'Sequoia Capital ASEAN', type: 'venture_growth' },
          { name: 'GIC Real Estate', type: 'sovereign_wealth' },
          { name: 'Temasek Holdings', type: 'sovereign_wealth' },
          { name: 'Warburg Pincus Asia', type: 'private_equity' },
          { name: 'BlackRock Real Assets', type: 'institutional_fund' },
        ];
        const stages = ['initial_engagement', 'due_diligence', 'capital_deployment', 'scaling_participation', 'ecosystem_integration'];
        const rows = partners.map((p) => {
          const stage = stages[Math.floor(Math.random() * stages.length)];
          const stageIdx = stages.indexOf(stage);
          return {
            partner_name: p.name, partner_type: p.type, lifecycle_stage: stage,
            engagement_score: Math.round(20 + stageIdx * 15 + Math.random() * 20),
            capital_deployed_usd: Math.round(stageIdx * 5_000_000 * (0.5 + Math.random())),
            touchpoints_count: Math.floor(2 + stageIdx * 3 + Math.random() * 5),
            relationship_duration_months: Math.floor(1 + stageIdx * 6 + Math.random() * 12),
            escalation_readiness: Math.round(30 + stageIdx * 12 + Math.random() * 15),
            integration_depth: stageIdx < 2 ? 'none' : stageIdx < 4 ? 'partial' : 'full',
            next_milestone: stageIdx < 4 ? stages[stageIdx + 1] : 'strategic_renewal',
            risk_of_churn: Math.round(Math.max(0, 50 - stageIdx * 10 + Math.random() * 20)),
          };
        });
        const { error } = await sb.from('icd_partnership_lifecycle').insert(rows);
        if (error) throw error;
        return json({ partners_managed: rows.length, integrated: rows.filter((r) => r.integration_depth === 'full').length, total_deployed: rows.reduce((s, r) => s + r.capital_deployed_usd, 0) });
      }

      case 'signal_stability': {
        const dims = ['revenue_resilience', 'liquidity_durability', 'operational_risk', 'churn_management', 'recurring_revenue'];
        const rows = dims.map((dim) => {
          const score = Math.round(45 + Math.random() * 50);
          return {
            signal_dimension: dim,
            stability_score: score, previous_score: Math.round(40 + Math.random() * 45),
            revenue_predictability: Math.round(50 + Math.random() * 45),
            liquidity_durability_index: Math.round(45 + Math.random() * 50),
            operational_risk_maturity: score > 75 ? 'advanced' : score > 55 ? 'developing' : 'early',
            churn_rate_pct: Math.round(Math.random() * 15 * 10) / 10,
            recurring_revenue_pct: Math.round(40 + Math.random() * 55),
            stress_test_result: score > 65 ? 'pass' : 'conditional_pass',
            communication_effectiveness: Math.round(50 + Math.random() * 45),
          };
        });
        const { error } = await sb.from('icd_stability_signaling').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.stability_score, 0) / rows.length);
        return json({ dimensions_signaled: rows.length, avg_stability: avg, advanced: rows.filter((r) => r.operational_risk_maturity === 'advanced').length });
      }

      case 'sustain_multi_cycle': {
        const cycles = ['expansion', 'peak', 'contraction', 'recovery'];
        const rows = cycles.map((c) => {
          const conf = Math.round(40 + Math.random() * 55);
          const prev = Math.round(35 + Math.random() * 50);
          return {
            cycle_context: c,
            confidence_score: conf, previous_confidence: prev,
            confidence_trend: conf > prev + 3 ? 'improving' : conf < prev - 3 ? 'declining' : 'stable',
            positioning_strength: Math.round(45 + Math.random() * 50),
            valuation_credibility: Math.round(50 + Math.random() * 45),
            narrative_consistency: Math.round(55 + Math.random() * 40),
            resilience_demonstrated: c === 'contraction' || c === 'recovery',
            cycle_transitions_navigated: Math.floor(Math.random() * 4),
            investor_retention_pct: Math.round(70 + Math.random() * 28),
            strategic_adaptations: [{ cycle: c, adaptation: `${c}-optimized positioning`, effective: true }],
          };
        });
        const { error } = await sb.from('icd_multi_cycle').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.confidence_score, 0) / rows.length);
        return json({ cycles_modeled: rows.length, avg_confidence: avg, retention_avg: Math.round(rows.reduce((s, r) => s + r.investor_retention_pct, 0) / rows.length) });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
