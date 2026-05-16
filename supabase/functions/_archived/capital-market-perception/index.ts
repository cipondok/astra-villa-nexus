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
        const [comm, rep, cat, trust, sent] = await Promise.all([
          sb.from('cmpc_strategic_communication').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('cmpc_reputation_signals').select('*').order('measured_at', { ascending: false }).limit(10),
          sb.from('cmpc_category_leadership').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('cmpc_institutional_trust').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('cmpc_sentiment_adaptive').select('*').order('monitored_at', { ascending: false }).limit(10),
        ]);
        return json({
          communication: comm.data ?? [],
          reputation: rep.data ?? [],
          leadership: cat.data ?? [],
          trust: trust.data ?? [],
          sentiment: sent.data ?? [],
          computed_at: new Date().toISOString(),
        });
      }

      case 'architect_communication': {
        const pillars = [
          { pillar: 'mission_clarity', theme: 'Transforming Real Estate Intelligence' },
          { pillar: 'execution_discipline', theme: 'Consistent Quarterly Delivery' },
          { pillar: 'growth_trajectory', theme: 'Sustainable Compounding Growth' },
          { pillar: 'market_vision', theme: 'Bloomberg for Property Vision' },
          { pillar: 'stakeholder_value', theme: 'Multi-Stakeholder Value Creation' },
        ];
        const rows = pillars.map((p) => ({
          pillar: p.pillar,
          message_theme: p.theme,
          target_audience: ['venture_capital', 'institutional', 'sovereign', 'retail'][Math.floor(Math.random() * 4)],
          clarity_score: Math.round(55 + Math.random() * 40),
          consistency_index: Math.round(50 + Math.random() * 45),
          resonance_score: Math.round(40 + Math.random() * 55),
          delivery_channel: ['investor_relations', 'earnings_call', 'press_release', 'conference'][Math.floor(Math.random() * 4)],
          frequency: ['weekly', 'monthly', 'quarterly'][Math.floor(Math.random() * 3)],
          key_messages: [p.theme, `Evidence-backed ${p.pillar.replace(/_/g, ' ')}`],
          effectiveness_rating: Math.round(50 + Math.random() * 45),
        }));
        const { error } = await sb.from('cmpc_strategic_communication').insert(rows);
        if (error) throw error;
        await sb.from('ai_event_signals').insert({
          event_type: 'cmpc_engine_cycle', entity_type: 'cmpc', priority_level: 'low',
          payload: { mode: 'architect_communication', pillars: rows.length },
        });
        return json({ pillars_architected: rows.length, avg_clarity: Math.round(rows.reduce((s, r) => s + r.clarity_score, 0) / rows.length) });
      }

      case 'manage_reputation': {
        const types = [
          { type: 'milestone', name: 'ARR Growth 150% YoY' },
          { type: 'product_launch', name: 'AI Valuation Engine V3 Release' },
          { type: 'partnership', name: 'Strategic Bank Integration' },
          { type: 'market_expansion', name: 'New City Launch: Surabaya' },
          { type: 'governance', name: 'Independent Board Member Appointed' },
        ];
        const rows = types.map((t) => {
          const visibility = Math.round(40 + Math.random() * 55);
          return {
            signal_type: t.type,
            signal_name: t.name,
            visibility_score: visibility,
            credibility_weight: Math.round((0.8 + Math.random() * 1.5) * 100) / 100,
            sentiment_impact: visibility > 70 ? 'strong_positive' : visibility > 50 ? 'positive' : 'neutral',
            media_amplification: Math.round(Math.random() * 100),
            analyst_pickup_count: Math.floor(Math.random() * 15),
            narrative_alignment: Math.round(50 + Math.random() * 45),
            risk_of_misinterpretation: Math.round(Math.random() * 30),
            recommended_framing: `Lead with ${t.type} evidence and quantified impact`,
          };
        });
        const { error } = await sb.from('cmpc_reputation_signals').insert(rows);
        if (error) throw error;
        return json({ signals_managed: rows.length, high_visibility: rows.filter((r) => r.visibility_score > 70).length });
      }

      case 'position_leadership': {
        const dimensions = [
          { dim: 'innovation', label: 'PropTech AI Innovation Leader' },
          { dim: 'scalability', label: 'Multi-Market Platform Scalability' },
          { dim: 'data_intelligence', label: 'Proprietary Data Moat' },
          { dim: 'ecosystem', label: 'Ecosystem Network Density' },
          { dim: 'market_creation', label: 'Category Creator Positioning' },
        ];
        const rows = dimensions.map((d) => ({
          category_dimension: d.dim,
          position_label: d.label,
          leadership_score: Math.round(45 + Math.random() * 50),
          competitor_gap_pct: Math.round(10 + Math.random() * 40),
          scalability_credibility: Math.round(50 + Math.random() * 45),
          market_relevance_index: Math.round(55 + Math.random() * 40),
          innovation_velocity: Math.round(30 + Math.random() * 65),
          ecosystem_depth_score: Math.round(40 + Math.random() * 55),
          thought_leadership_index: Math.round(35 + Math.random() * 60),
          positioning_status: Math.random() > 0.4 ? 'established' : 'emerging',
        }));
        const { error } = await sb.from('cmpc_category_leadership').insert(rows);
        if (error) throw error;
        return json({ dimensions_positioned: rows.length, established: rows.filter((r) => r.positioning_status === 'established').length });
      }

      case 'develop_trust': {
        const dims = ['governance_transparency', 'capital_discipline', 'roadmap_visibility', 'audit_compliance', 'board_credibility'];
        const rows = dims.map((dim) => {
          const score = Math.round(45 + Math.random() * 50);
          const prev = Math.round(40 + Math.random() * 45);
          return {
            trust_dimension: dim,
            trust_score: score,
            previous_score: prev,
            governance_rating: score > 75 ? 'strong' : score > 55 ? 'developing' : 'early',
            capital_discipline_index: Math.round(50 + Math.random() * 45),
            roadmap_visibility_score: Math.round(45 + Math.random() * 50),
            audit_compliance_pct: Math.round(60 + Math.random() * 38),
            board_credibility: Math.round(50 + Math.random() * 45),
            stakeholder_feedback_score: Math.round(40 + Math.random() * 55),
            trust_building_actions: [{ action: `Strengthen ${dim.replace(/_/g, ' ')}`, priority: 'high' }],
          };
        });
        const { error } = await sb.from('cmpc_institutional_trust').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.trust_score, 0) / rows.length);
        return json({ dimensions_assessed: rows.length, avg_trust: avg, strong: rows.filter((r) => r.governance_rating === 'strong').length });
      }

      case 'monitor_sentiment': {
        const sources = ['investor_survey', 'analyst_reports', 'media_coverage', 'social_listening', 'conference_feedback'];
        const rows = sources.map((src) => {
          const curr = Math.round(30 + Math.random() * 60);
          const prev = Math.round(35 + Math.random() * 55);
          const trend = curr > prev + 5 ? 'improving' : curr < prev - 5 ? 'declining' : 'stable';
          return {
            sentiment_source: src,
            current_sentiment: curr,
            previous_sentiment: prev,
            sentiment_trend: trend,
            volatility_level: Math.abs(curr - prev) > 15 ? 'high' : Math.abs(curr - prev) > 7 ? 'medium' : 'low',
            recommended_tone: curr < 40 ? 'reassuring' : curr < 60 ? 'balanced' : 'confident',
            messaging_adjustment: trend === 'declining' ? 'Increase transparency and milestone communication' : 'Maintain current narrative cadence',
            confidence_reinforcement_needed: curr < 40,
            key_concerns: curr < 50 ? ['market_uncertainty', 'growth_sustainability'] : [],
            response_urgency: curr < 30 ? 'immediate' : curr < 50 ? 'elevated' : 'standard',
            effectiveness_feedback: Math.round(40 + Math.random() * 55),
          };
        });
        const { error } = await sb.from('cmpc_sentiment_adaptive').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.current_sentiment, 0) / rows.length);
        return json({ sources_monitored: rows.length, avg_sentiment: avg, declining: rows.filter((r) => r.sentiment_trend === 'declining').length });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
