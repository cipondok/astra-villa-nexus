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
        const [readiness, positioning, demand, timing, post] = await Promise.all([
          sb.from('giws_ipo_readiness').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('giws_market_positioning').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('giws_investor_demand').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('giws_listing_timing').select('*').order('assessed_at', { ascending: false }).limit(5),
          sb.from('giws_post_listing').select('*').order('assessed_at', { ascending: false }).limit(10),
        ]);
        return json({
          readiness: readiness.data ?? [], positioning: positioning.data ?? [],
          demand: demand.data ?? [], timing: timing.data ?? [], post_listing: post.data ?? [],
          computed_at: new Date().toISOString(),
        });
      }

      case 'assess_readiness': {
        const domains = [
          { domain: 'financial_reporting', label: 'Financial Reporting & Audit' },
          { domain: 'governance_structure', label: 'Corporate Governance' },
          { domain: 'operational_scalability', label: 'Operational Scalability' },
          { domain: 'legal_compliance', label: 'Legal & Regulatory Compliance' },
          { domain: 'technology_infrastructure', label: 'Technology Infrastructure' },
        ];
        const rows = domains.map((d) => {
          const maturity = Math.round(25 + Math.random() * 70);
          const target = 90;
          const total = Math.floor(10 + Math.random() * 20);
          const met = Math.floor(total * (maturity / 100));
          return {
            readiness_domain: d.domain, domain_label: d.label,
            maturity_score: maturity, target_score: target,
            gap_pct: Math.round(((target - maturity) / target) * 100),
            compliance_items_total: total, compliance_items_met: met,
            critical_blockers: maturity < 50 ? [`${d.domain} needs significant improvement`] : [],
            remediation_actions: [{ action: `Strengthen ${d.label}`, priority: maturity < 50 ? 'critical' : 'standard' }],
            estimated_months_to_ready: Math.max(0, Math.round((target - maturity) / 5)),
          };
        });
        const { error } = await sb.from('giws_ipo_readiness').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.maturity_score, 0) / rows.length);
        await sb.from('ai_event_signals').insert({
          event_type: 'giws_engine_cycle', entity_type: 'giws', priority_level: 'low',
          payload: { mode: 'assess_readiness', avg_maturity: avg },
        });
        return json({ domains_assessed: rows.length, avg_maturity: avg, critical: rows.filter((r) => r.maturity_score < 50).length });
      }

      case 'position_market': {
        const axes = [
          { axis: 'category_leadership', theme: 'AI-First PropTech Category Creator' },
          { axis: 'legacy_differentiation', theme: 'Next-Gen vs Traditional Portal' },
          { axis: 'technology_vision', theme: 'Intelligence Infrastructure Platform' },
          { axis: 'network_effect', theme: 'Self-Reinforcing Ecosystem Flywheel' },
          { axis: 'data_moat', theme: 'Proprietary Market Intelligence Layer' },
        ];
        const rows = axes.map((a) => ({
          positioning_axis: a.axis, narrative_theme: a.theme,
          differentiation_score: Math.round(50 + Math.random() * 45),
          legacy_gap_advantage: Math.round(20 + Math.random() * 50),
          technology_moat_depth: Math.round(40 + Math.random() * 55),
          investor_narrative_clarity: Math.round(50 + Math.random() * 45),
          comparable_company: ['Zillow', 'CoStar', 'REA Group', 'Rightmove'][Math.floor(Math.random() * 4)],
          comparable_multiple: Math.round((5 + Math.random() * 20) * 10) / 10,
          target_multiple: Math.round((10 + Math.random() * 25) * 10) / 10,
          positioning_strength: Math.random() > 0.4 ? 'established' : 'emerging',
          key_proof_points: [{ point: `${a.theme} evidence`, verified: true }],
        }));
        const { error } = await sb.from('giws_market_positioning').insert(rows);
        if (error) throw error;
        return json({ axes_positioned: rows.length, established: rows.filter((r) => r.positioning_strength === 'established').length });
      }

      case 'structure_demand': {
        const sources = [
          { src: 'institutional', name: 'Tier-1 Growth Equity Fund' },
          { src: 'sovereign_wealth', name: 'ASEAN Sovereign Fund' },
          { src: 'strategic_corporate', name: 'Global Portal Operator' },
          { src: 'crossover_fund', name: 'Public-Private Crossover Fund' },
          { src: 'family_office', name: 'Asia Pacific Family Office' },
        ];
        const rows = sources.map((s) => ({
          demand_source: s.src, source_name: s.name,
          interest_level: ['monitoring', 'engaged', 'committed'][Math.floor(Math.random() * 3)],
          coverage_status: ['none', 'initiated', 'active'][Math.floor(Math.random() * 3)],
          capital_commitment_indicative_usd: Math.round(Math.random() * 50_000_000),
          engagement_touchpoints: Math.floor(1 + Math.random() * 10),
          partnership_signal_strength: Math.round(30 + Math.random() * 65),
          ecosystem_visibility_score: Math.round(40 + Math.random() * 55),
          due_diligence_stage: ['not_started', 'preliminary', 'deep_dive', 'final'][Math.floor(Math.random() * 4)],
          sentiment_toward_sector: ['bearish', 'neutral', 'bullish', 'very_bullish'][Math.floor(Math.random() * 4)],
        }));
        const { error } = await sb.from('giws_investor_demand').insert(rows);
        if (error) throw error;
        const totalCapital = rows.reduce((s, r) => s + r.capital_commitment_indicative_usd, 0);
        return json({ sources_structured: rows.length, total_indicative_usd: totalCapital, committed: rows.filter((r) => r.interest_level === 'committed').length });
      }

      case 'optimize_timing': {
        const scenarios = ['aggressive_early', 'optimal_window', 'conservative_late'];
        const rows = scenarios.map((sc) => {
          const milestone = Math.round(40 + Math.random() * 55);
          const receptiveness = Math.round(35 + Math.random() * 60);
          const confidence = Math.round((milestone * 0.5 + receptiveness * 0.5));
          return {
            scenario_name: sc,
            macro_cycle_phase: ['expansion', 'peak', 'contraction', 'recovery'][Math.floor(Math.random() * 4)],
            sector_sentiment: ['bearish', 'neutral', 'bullish'][Math.floor(Math.random() * 3)],
            internal_milestone_readiness: milestone,
            capital_market_receptiveness: receptiveness,
            comparable_ipo_performance: Math.round(-10 + Math.random() * 60),
            optimal_window_start: sc === 'aggressive_early' ? 'Q3 2027' : sc === 'optimal_window' ? 'Q1 2028' : 'Q3 2028',
            optimal_window_end: sc === 'aggressive_early' ? 'Q4 2027' : sc === 'optimal_window' ? 'Q2 2028' : 'Q4 2028',
            timing_confidence: confidence,
            risk_if_early: 'Undervaluation due to incomplete traction evidence',
            risk_if_late: 'Market window closure or competitor pre-emption',
            recommended_action: confidence > 65 ? 'prepare_actively' : confidence > 45 ? 'monitor_closely' : 'defer',
          };
        });
        const { error } = await sb.from('giws_listing_timing').insert(rows);
        if (error) throw error;
        const best = rows.sort((a, b) => b.timing_confidence - a.timing_confidence)[0];
        return json({ scenarios_assessed: rows.length, recommended: best?.scenario_name, confidence: best?.timing_confidence });
      }

      case 'plan_post_listing': {
        const dims = ['market_confidence', 'earnings_communication', 'analyst_relations', 'shareholder_management', 'roadmap_execution'];
        const rows = dims.map((dim) => {
          const score = Math.round(45 + Math.random() * 50);
          const prev = Math.round(40 + Math.random() * 45);
          return {
            stability_dimension: dim,
            current_score: score, previous_score: prev,
            score_trend: score > prev ? 'improving' : score === prev ? 'stable' : 'declining',
            communication_cadence: ['monthly', 'quarterly'][Math.floor(Math.random() * 2)],
            analyst_coverage_count: Math.floor(3 + Math.random() * 12),
            shareholder_concentration_pct: Math.round(20 + Math.random() * 40),
            lockup_expiry_risk: Math.round(Math.random() * 50),
            roadmap_transparency_index: Math.round(50 + Math.random() * 45),
            earnings_beat_streak: Math.floor(Math.random() * 8),
            stabilization_mechanisms: [{ mechanism: `${dim} protocol`, active: true }],
          };
        });
        const { error } = await sb.from('giws_post_listing').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.current_score, 0) / rows.length);
        return json({ dimensions_planned: rows.length, avg_stability: avg, improving: rows.filter((r) => r.score_trend === 'improving').length });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
