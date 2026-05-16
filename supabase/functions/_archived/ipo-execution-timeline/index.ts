import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// Full 16-month IPO timeline definition
const TIMELINE = [
  // Phase 1: IPO Foundation (M-12 to M-9)
  { phase: 1, name: 'IPO Foundation', month: -12, label: 'M-12', milestones: [
    { key: 'define_ipo_objective', desc: 'Define IPO strategic objective (capital raise vs liquidity vs brand positioning)' },
    { key: 'hire_lead_advisors', desc: 'Hire investment bank lead advisors' },
    { key: 'audit_preparation', desc: 'Begin audited financial history preparation (2-3 years)' },
    { key: 'build_taskforce', desc: 'Build internal IPO taskforce (finance, legal, strategy, product narrative)' },
  ]},
  { phase: 1, name: 'IPO Foundation', month: -11, label: 'M-11', milestones: [
    { key: 'governance_restructuring', desc: 'Governance restructuring (independent directors, committees)' },
    { key: 'reporting_systems_upgrade', desc: 'Financial reporting systems upgrade' },
    { key: 'kpi_standardization', desc: 'Investor KPI framework standardization' },
  ]},
  { phase: 1, name: 'IPO Foundation', month: -10, label: 'M-10', milestones: [
    { key: 'draft_market_narrative', desc: 'Draft long-term market narrative (category leadership thesis)' },
    { key: 'valuation_scenario_modelling', desc: 'Internal valuation scenario modelling' },
    { key: 'risk_factor_mapping', desc: 'Begin risk factor mapping' },
  ]},
  { phase: 1, name: 'IPO Foundation', month: -9, label: 'M-9', milestones: [
    { key: 'capital_structure_optimization', desc: 'Pre-IPO capital structure optimization' },
    { key: 'esop_restructuring', desc: 'ESOP restructuring / founder dilution planning' },
    { key: 'perception_testing', desc: 'Start confidential institutional perception testing' },
  ]},
  // Phase 2: Story & Demand Building (M-8 to M-4)
  { phase: 2, name: 'Story & Demand Building', month: -8, label: 'M-8', milestones: [
    { key: 'narrative_refinement', desc: 'Investor narrative refinement' },
    { key: 'soft_circles', desc: 'Begin selective institutional soft-circles' },
    { key: 'growth_metric_visibility', desc: 'Strengthen growth metric visibility (product launches / market expansion)' },
  ]},
  { phase: 2, name: 'Story & Demand Building', month: -7, label: 'M-7', milestones: [
    { key: 'analyst_education', desc: 'Analyst education phase (non-deal roadshow conceptually)' },
    { key: 'media_positioning', desc: 'Media positioning groundwork' },
    { key: 'partnership_announcements', desc: 'Strategic partnerships announcements' },
  ]},
  { phase: 2, name: 'Story & Demand Building', month: -6, label: 'M-6', milestones: [
    { key: 'readiness_audit', desc: 'IPO readiness audit review' },
    { key: 'forecast_modelling', desc: 'Forecast modelling (3-year projections)' },
    { key: 'stress_testing', desc: 'Internal stress-testing of business model assumptions' },
  ]},
  { phase: 2, name: 'Story & Demand Building', month: -5, label: 'M-5', milestones: [
    { key: 'draft_prospectus_outline', desc: 'Draft prospectus outline' },
    { key: 'sentiment_monitoring', desc: 'Market sentiment monitoring dashboard' },
    { key: 'liquidity_scenario_planning', desc: 'Begin liquidity scenario planning' },
  ]},
  { phase: 2, name: 'Story & Demand Building', month: -4, label: 'M-4', milestones: [
    { key: 'demand_temperature', desc: 'Investor demand temperature checks' },
    { key: 'listing_window_timing', desc: 'Scenario modelling for listing window timing' },
    { key: 'board_go_nogo', desc: 'Board go/no-go checkpoint' },
  ]},
  // Phase 3: Execution Window (M-3 to M0)
  { phase: 3, name: 'Execution Window', month: -3, label: 'M-3', milestones: [
    { key: 'file_draft_prospectus', desc: 'File draft prospectus confidentially' },
    { key: 'roadshow_planning', desc: 'Formal roadshow planning' },
    { key: 'pricing_simulations', desc: 'Pricing range scenario simulations' },
  ]},
  { phase: 3, name: 'Execution Window', month: -2, label: 'M-2', milestones: [
    { key: 'institutional_roadshow', desc: 'Institutional roadshow' },
    { key: 'order_book_strategy', desc: 'Order book building strategy' },
    { key: 'anchor_investor_targeting', desc: 'Anchor investor targeting' },
  ]},
  { phase: 3, name: 'Execution Window', month: -1, label: 'M-1', milestones: [
    { key: 'final_valuation_alignment', desc: 'Final valuation alignment' },
    { key: 'pricing_committee', desc: 'Pricing committee sessions' },
    { key: 'listing_logistics_pr', desc: 'Listing logistics + PR strategy' },
  ]},
  { phase: 3, name: 'Execution Window', month: 0, label: 'IPO', milestones: [
    { key: 'pricing_announcement', desc: 'Pricing announcement' },
    { key: 'listing_day_stabilization', desc: 'Listing day liquidity stabilization planning' },
    { key: 'public_market_comms', desc: 'Public market communication launch' },
  ]},
  // Phase 4: Post-IPO Stabilization (M+1 to M+6)
  { phase: 4, name: 'Post-IPO Stabilization', month: 1, label: 'M+1', milestones: [
    { key: 'earnings_guidance', desc: 'Earnings guidance discipline' },
    { key: 'investor_comm_cadence', desc: 'Investor communication cadence setup' },
  ]},
  { phase: 4, name: 'Post-IPO Stabilization', month: 3, label: 'M+3', milestones: [
    { key: 'first_quarterly_earnings', desc: 'First quarterly earnings narrative execution' },
    { key: 'liquidity_monitoring', desc: 'Liquidity monitoring dashboard' },
  ]},
  { phase: 4, name: 'Post-IPO Stabilization', month: 6, label: 'M+6', milestones: [
    { key: 'strategic_milestone_announcement', desc: 'Strategic milestone announcement' },
    { key: 'institutional_ownership_consolidation', desc: 'Long-term institutional ownership consolidation' },
  ]},
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'dashboard': {
        const [milestones, readiness, stakeholders, risks] = await Promise.all([
          sb.from('ipoex_milestones').select('*').order('month_offset', { ascending: true }),
          sb.from('ipoex_phase_readiness').select('*').order('phase', { ascending: true }),
          sb.from('ipoex_stakeholders').select('*').order('created_at', { ascending: false }).limit(20),
          sb.from('ipoex_risk_register').select('*').order('severity', { ascending: true }).limit(20),
        ]);
        const ms = milestones.data ?? [];
        const total = ms.length;
        const completed = ms.filter((m: any) => m.status === 'completed').length;
        const blocked = ms.filter((m: any) => m.status === 'blocked').length;
        return json({
          milestones: ms,
          phase_readiness: readiness.data ?? [],
          stakeholders: stakeholders.data ?? [],
          risks: risks.data ?? [],
          summary: { total, completed, blocked, completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0 },
          computed_at: new Date().toISOString(),
        });
      }

      case 'initialize_timeline': {
        const existing = await sb.from('ipoex_milestones').select('id').limit(1);
        if ((existing.data ?? []).length > 0) {
          return json({ status: 'already_initialized', message: 'Timeline already has milestones' });
        }
        const rows: any[] = [];
        for (const monthBlock of TIMELINE) {
          for (const ms of monthBlock.milestones) {
            rows.push({
              phase: monthBlock.phase,
              phase_name: monthBlock.name,
              month_offset: monthBlock.month,
              month_label: monthBlock.label,
              milestone_key: ms.key,
              milestone_description: ms.desc,
              status: 'not_started',
              completion_pct: 0,
            });
          }
        }
        const { error } = await sb.from('ipoex_milestones').insert(rows);
        if (error) throw error;
        await sb.from('ai_event_signals').insert({
          event_type: 'ipoex_engine_cycle', entity_type: 'ipoex', priority_level: 'low',
          payload: { mode: 'initialize_timeline', milestones_created: rows.length },
        });
        return json({ milestones_created: rows.length, phases: 4, months_covered: 18 });
      }

      case 'assess_phase_readiness': {
        const { data: milestones } = await sb.from('ipoex_milestones').select('*');
        const ms = milestones ?? [];
        const phases = [1, 2, 3, 4];
        const phaseNames: Record<number, string> = { 1: 'IPO Foundation', 2: 'Story & Demand Building', 3: 'Execution Window', 4: 'Post-IPO Stabilization' };
        const rows = phases.map((p) => {
          const phaseMs = ms.filter((m: any) => m.phase === p);
          const total = phaseMs.length;
          const completed = phaseMs.filter((m: any) => m.status === 'completed').length;
          const blocked = phaseMs.filter((m: any) => m.status === 'blocked').length;
          const readiness = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            phase: p,
            phase_name: phaseNames[p],
            readiness_score: readiness,
            milestones_total: total,
            milestones_completed: completed,
            milestones_blocked: blocked,
            critical_path_items: phaseMs.filter((m: any) => m.status === 'blocked').map((m: any) => m.milestone_key),
            risk_factors: blocked > 0 ? [{ risk: `${blocked} blocked milestones in ${phaseNames[p]}`, severity: 'high' }] : [],
            go_no_go_status: readiness >= 90 ? 'go' : readiness >= 60 ? 'conditional' : 'pending',
          };
        });
        const { error } = await sb.from('ipoex_phase_readiness').insert(rows);
        if (error) throw error;
        return json({ phases_assessed: rows.length, overall_readiness: Math.round(rows.reduce((s, r) => s + r.readiness_score, 0) / rows.length) });
      }

      case 'onboard_stakeholders': {
        const stakeholders = [
          { type: 'investment_bank', name: 'Goldman Sachs Asia', role: 'Lead Left Bookrunner' },
          { type: 'investment_bank', name: 'Morgan Stanley ASEAN', role: 'Co-Bookrunner' },
          { type: 'legal_counsel', name: 'Baker McKenzie Jakarta', role: 'Issuer Counsel' },
          { type: 'auditor', name: 'PricewaterhouseCoopers', role: 'External Auditor' },
          { type: 'independent_director', name: 'Board Nominee (TBD)', role: 'Audit Committee Chair' },
          { type: 'anchor_investor', name: 'GIC Real Estate', role: 'Cornerstone Investor' },
          { type: 'anchor_investor', name: 'Temasek Holdings', role: 'Strategic Anchor' },
          { type: 'pr_agency', name: 'Edelman Financial', role: 'IPO Communications' },
        ];
        const rows = stakeholders.map((s) => ({
          stakeholder_type: s.type,
          stakeholder_name: s.name,
          role_description: s.role,
          engagement_status: 'identified',
          engagement_score: Math.round(20 + Math.random() * 40),
          key_deliverables: [{ deliverable: `${s.role} engagement`, status: 'pending' }],
          sentiment: 'neutral',
        }));
        const { error } = await sb.from('ipoex_stakeholders').insert(rows);
        if (error) throw error;
        return json({ stakeholders_onboarded: rows.length });
      }

      case 'register_risks': {
        const risks = [
          { cat: 'market', name: 'IPO window closure due to macro downturn', sev: 'critical', prob: 30, phase: 3 },
          { cat: 'regulatory', name: 'OJK/IDX approval delays', sev: 'high', prob: 25, phase: 3 },
          { cat: 'financial', name: 'Revenue miss during preparation period', sev: 'high', prob: 20, phase: 2 },
          { cat: 'governance', name: 'Independent director recruitment delay', sev: 'medium', prob: 35, phase: 1 },
          { cat: 'narrative', name: 'Competitor IPO pre-empts category positioning', sev: 'high', prob: 15, phase: 2 },
          { cat: 'operational', name: 'Audit findings requiring remediation', sev: 'medium', prob: 40, phase: 1 },
          { cat: 'valuation', name: 'Comparable company multiple compression', sev: 'high', prob: 25, phase: 3 },
          { cat: 'post_listing', name: 'Lockup expiry selling pressure', sev: 'medium', prob: 60, phase: 4 },
        ];
        const rows = risks.map((r) => ({
          risk_category: r.cat,
          risk_name: r.name,
          severity: r.sev,
          probability: r.prob,
          impact_description: `Impact on Phase ${r.phase}: ${r.name}`,
          mitigation_plan: `Develop contingency for ${r.cat} risk`,
          phase_affected: r.phase,
          status: 'open',
        }));
        const { error } = await sb.from('ipoex_risk_register').insert(rows);
        if (error) throw error;
        return json({ risks_registered: rows.length, critical: rows.filter((r) => r.severity === 'critical').length, high: rows.filter((r) => r.severity === 'high').length });
      }

      case 'simulate_progress': {
        const { data: milestones } = await sb.from('ipoex_milestones').select('*');
        if (!milestones || milestones.length === 0) return json({ error: 'No milestones found. Run initialize_timeline first.' }, 400);
        const updates: any[] = [];
        for (const ms of milestones) {
          const rand = Math.random();
          let status = ms.status;
          let completion = ms.completion_pct;
          if (status === 'not_started' && rand > 0.4) { status = 'in_progress'; completion = Math.round(10 + Math.random() * 40); }
          else if (status === 'in_progress' && rand > 0.3) { status = rand > 0.85 ? 'blocked' : 'completed'; completion = status === 'completed' ? 100 : completion; }
          if (status !== ms.status || completion !== ms.completion_pct) {
            updates.push({ id: ms.id, status, completion_pct: completion, blockers: status === 'blocked' ? ['Resource constraint'] : [] });
          }
        }
        for (const u of updates) {
          await sb.from('ipoex_milestones').update({ status: u.status, completion_pct: u.completion_pct, blockers: u.blockers, updated_at: new Date().toISOString() }).eq('id', u.id);
        }
        return json({ milestones_updated: updates.length, completed: updates.filter((u) => u.status === 'completed').length, blocked: updates.filter((u) => u.status === 'blocked').length });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
