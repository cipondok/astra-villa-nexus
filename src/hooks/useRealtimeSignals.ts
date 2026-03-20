import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

export interface AIEventSignal {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  priority_level: string;
  payload: Record<string, unknown>;
  is_processed: boolean;
  created_at: string;
}

export interface EventSignalStats {
  priority: string;
  pending_count: number;
  oldest_at: string | null;
}

const EVENT_LABELS: Record<string, { label: string; icon: string }> = {
  property_created: { label: 'New Listing', icon: '🏠' },
  price_changed: { label: 'Price Change', icon: '💰' },
  status_changed: { label: 'Status Update', icon: '📋' },
  demand_spike: { label: 'Demand Surge', icon: '🔥' },
  portfolio_transaction: { label: 'Portfolio Event', icon: '📊' },
  cluster_shift: { label: 'Market Shift', icon: '🌐' },
  liquidity_recalculated: { label: 'Liquidity Update', icon: '💧' },
  liquidity_flywheel_trigger: { label: 'Flywheel Trigger', icon: '⚡' },
  flywheel_cycle_completed: { label: 'Flywheel Complete', icon: '🔄' },
  vendor_engine_cycle: { label: 'Vendor Engine', icon: '🏗️' },
  vendor_revenue_flywheel_cycle: { label: 'Revenue Flywheel', icon: '💎' },
  vendor_growth_orchestrator_cycle: { label: 'Growth Orchestrator', icon: '🧠' },
  capital_allocation_engine_cycle: { label: 'Capital Engine', icon: '🏦' },
  bubble_risk_critical: { label: 'Bubble Alert', icon: '🫧' },
  deal_dominance_engine_cycle: { label: 'Deal Dominance', icon: '👑' },
  deal_dominance_achieved: { label: 'Dominant Listing', icon: '🏆' },
  pricing_intelligence_engine_cycle: { label: 'Pricing Engine', icon: '📊' },
  pricing_inefficiency_detected: { label: 'Price Alert', icon: '📉' },
  network_effect_engine_cycle: { label: 'Network Engine', icon: '🕸️' },
  network_critical_mass_reached: { label: 'Critical Mass!', icon: '💥' },
  superapp_lifecycle_transition: { label: 'Lifecycle Event', icon: '🔁' },
  superapp_orchestrator_cycle: { label: 'SuperApp Engine', icon: '🏗️' },
  fund_rebalance_alert: { label: 'Fund Rebalance', icon: '⚖️' },
  fund_engine_cycle: { label: 'Fund Engine', icon: '🏛️' },
  reos_intelligence_critical: { label: 'RE-OS Intel', icon: '🌍' },
  reos_transaction_critical: { label: 'RE-OS Transaction', icon: '⚡' },
  reos_capital_critical: { label: 'RE-OS Capital', icon: '💸' },
  reos_infrastructure_critical: { label: 'RE-OS Infra', icon: '🖥️' },
  capital_gravity_magnetic_zone: { label: 'Magnetic Zone', icon: '🧲' },
  capital_gravity_engine_cycle: { label: 'Capital Gravity', icon: '🌊' },
  city_expansion_breakout: { label: 'City Breakout', icon: '🏙️' },
  city_expansion_engine_cycle: { label: 'Expansion Engine', icon: '📡' },
  wealth_risk_critical: { label: 'Wealth Risk', icon: '⚠️' },
  wealth_intelligence_engine_cycle: { label: 'Wealth Engine', icon: '💎' },
  gpi_major_movement: { label: 'Index Movement', icon: '📈' },
  gpi_index_computed: { label: 'Index Computed', icon: '🔢' },
  aab_critical_rebalance: { label: 'Rebalance Alert', icon: '⚖️' },
  aab_allocation_brain_cycle: { label: 'Allocation Brain', icon: '🧠' },
  pate_whale_trade: { label: 'Whale Trade', icon: '🐋' },
  pate_exchange_cycle: { label: 'Exchange Engine', icon: '🏛️' },
  gues_hotspot_detected: { label: 'Hotspot Found', icon: '🔥' },
  gues_simulator_cycle: { label: 'Urban Simulator', icon: '🏙️' },
  aswc_critical_deployment: { label: 'Sovereign Deploy', icon: '🏛️' },
  aswc_copilot_cycle: { label: 'Wealth Co-Pilot', icon: '👑' },
  gwsm_systemic_instability: { label: 'Systemic Alert', icon: '🌋' },
  gwsm_singularity_cycle: { label: 'Wealth Singularity', icon: '♾️' },
  ceos_equilibrium_critical: { label: 'Equilibrium Alert', icon: '⚖️' },
  ceos_engine_cycle: { label: 'Civilization OS', icon: '🌍' },
  apin_high_urgency_deal: { label: 'Urgent Deal', icon: '🚀' },
  apin_network_cycle: { label: 'Investment Network', icon: '🌐' },
  psre_artificial_scarcity: { label: 'Scarcity Alert', icon: '🏚️' },
  psre_engine_cycle: { label: 'Post-Scarcity OS', icon: '🏡' },
  gccf_crisis_activated: { label: 'Crisis Protocol', icon: '🚨' },
  gccf_governance_cycle: { label: 'Capital Governance', icon: '🏛️' },
  ppop_prosperity_acceleration: { label: 'Prosperity Surge', icon: '🌟' },
  ppop_protocol_cycle: { label: 'Prosperity Engine', icon: '🌍' },
  afiba_governance_override: { label: 'Founder AI Override', icon: '🧬' },
  afiba_engine_cycle: { label: 'Immortality Engine', icon: '♾️' },
  mpeem_frontier_breakthrough: { label: 'Frontier Breakthrough', icon: '🚀' },
  mpeem_expansion_cycle: { label: 'Multi-Planet Engine', icon: '🪐' },
  hawce_synergy_milestone: { label: 'Co-Evolution Milestone', icon: '🤝' },
  hawce_engine_cycle: { label: 'Wealth Co-Evolution', icon: '🧬' },
  mrde_tipping_point_imminent: { label: 'Tipping Point', icon: '⚡' },
  mrde_engine_cycle: { label: 'Reality Distortion', icon: '🌀' },
  gmma_fortress_moat_achieved: { label: 'Fortress Moat', icon: '🏰' },
  gmma_engine_cycle: { label: 'Monopoly Moat', icon: '🛡️' },
  ckper_phase_dominant: { label: 'Phase Dominant', icon: '🚀' },
  ckper_engine_cycle: { label: 'Category Killer', icon: '⚔️' },
  aces_extinction_tipping: { label: 'Extinction Tipping', icon: '💀' },
  aces_engine_cycle: { label: 'Competitive Extinction', icon: '🎯' },
  gcfs_singularity_reached: { label: 'Capital Singularity', icon: '🌌' },
  gcfs_engine_cycle: { label: 'Capital Flywheel', icon: '🔄' },
  amce_market_institutionalized: { label: 'Market Created', icon: '🌱' },
  amce_engine_cycle: { label: 'Market Creation', icon: '🏗️' },
  asci_sovereign_deployment: { label: 'Sovereign Deploy', icon: '🏦' },
  asci_engine_cycle: { label: 'Sovereign Capital', icon: '👑' },
  gali_critical_mass_reached: { label: 'Liquidity Critical Mass', icon: '🌐' },
  gali_engine_cycle: { label: 'Liquidity Internet', icon: '🔗' },
  auwcp_prosperity_surge: { label: 'Prosperity Surge', icon: '🏙️' },
  auwcp_engine_cycle: { label: 'Urban Wealth', icon: '🌆' },
  gcce_systemic_risk_alert: { label: 'Systemic Risk Alert', icon: '⚠️' },
  gcce_engine_cycle: { label: 'Capital Consciousness', icon: '🧠' },
  pufg_saturation_reached: { label: 'District Saturated', icon: '🏙️' },
  pufg_engine_cycle: { label: 'Urban Forecast', icon: '🗺️' },
  amens_capital_rotation_alert: { label: 'Capital Rotation', icon: '🔄' },
  amens_engine_cycle: { label: 'Multi-Asset Nervous System', icon: '🧬' },
  iees_frontier_opportunity: { label: 'Frontier Opportunity', icon: '🚀' },
  iees_engine_cycle: { label: 'Expansion Simulator', icon: '🪐' },
  cwse_systemic_risk_alert: { label: 'Systemic Risk Alert', icon: '🌋' },
  cwse_engine_cycle: { label: 'Wealth Stability', icon: '🏛️' },
  lhps_prosperity_surge: { label: 'Prosperity Surge', icon: '🌟' },
  lhps_engine_cycle: { label: 'Prosperity Strategy', icon: '🌍' },
  phes_automation_surge: { label: 'Automation Surge', icon: '🤖' },
  phes_engine_cycle: { label: 'Post-Human Economy', icon: '⚙️' },
  pgcm_critical_funding_gap: { label: 'Funding Gap Alert', icon: '💸' },
  pgcm_engine_cycle: { label: 'Planetary Governance', icon: '🌐' },
  ihwi_prosperity_breakout: { label: 'Prosperity Breakout', icon: '🌅' },
  ihwi_engine_cycle: { label: 'Infinite Horizon Wealth', icon: '♾️' },
  ccne_category_crystallized: { label: 'Category Crystallized', icon: '💎' },
  ccne_engine_cycle: { label: 'Narrative Engine', icon: '📖' },
  gipd_sentiment_extreme: { label: 'Sentiment Extreme', icon: '🧠' },
  gipd_engine_cycle: { label: 'Psychology Engine', icon: '🎯' },
  mcbm_blitz_capture: { label: 'Blitz Capture', icon: '⚡' },
  mcbm_engine_cycle: { label: 'Market Blitzkrieg', icon: '🎯' },
  newf_inescapable_gravity: { label: 'Inescapable Gravity', icon: '🕳️' },
  newf_engine_cycle: { label: 'Network Weaponization', icon: '🕸️' },
  amda_critical_threat: { label: 'Critical Threat', icon: '🚨' },
  amda_engine_cycle: { label: 'Monopoly Defense', icon: '🛡️' },
  pmne_flagship_signal: { label: 'Flagship Signal', icon: '📣' },
  pmne_engine_cycle: { label: 'Market Narrative', icon: '📈' },
  icta_trust_self_sustaining: { label: 'Trust Self-Sustaining', icon: '🏛️' },
  icta_engine_cycle: { label: 'Institutional Trust', icon: '🤝' },
  gvem_valuation_milestone: { label: 'Valuation Milestone', icon: '💎' },
  gvem_engine_cycle: { label: 'Valuation Engine', icon: '📊' },
  fcss_control_risk: { label: 'Control Risk Alert', icon: '⚠️' },
  fcss_engine_cycle: { label: 'Founder Capital', icon: '👑' },
  mfcb_fund_closed: { label: 'Fund Closed', icon: '🏦' },
  mfcb_engine_cycle: { label: 'Mega-Fund Engine', icon: '🏛️' },
  geiti_window_peak: { label: 'IPO Window Peak', icon: '🔔' },
  geiti_engine_cycle: { label: 'Exit Timing', icon: '⏰' },
  gpws_unstoppable_momentum: { label: 'Unstoppable Market', icon: '🚀' },
  gpws_engine_cycle: { label: 'PropTech War', icon: '⚔️' },
  cmppm_narrative_dominant: { label: 'Narrative Dominant', icon: '📣' },
  cmppm_engine_cycle: { label: 'Capital Positioning', icon: '🎯' },
  dmem_infrastructure_irreversible: { label: 'Infrastructure Irreversible', icon: '🏛️' },
  dmem_engine_cycle: { label: 'Decade Masterplan', icon: '🗺️' },
  gpes_tipping_point_reached: { label: 'Tipping Point Reached', icon: '⚡' },
  gpes_engine_cycle: { label: 'Endgame Simulation', icon: '🎮' },
  acecm_self_sustaining_loop: { label: 'Self-Sustaining Loop', icon: '♾️' },
  acecm_engine_cycle: { label: 'Capital Empire', icon: '🏰' },
  umtcs_cycle_inflection: { label: 'Cycle Inflection', icon: '📉' },
  umtcs_engine_cycle: { label: 'Market Timing', icon: '⏱️' },
  gpids_ipo_window_open: { label: 'IPO Window Open', icon: '🔔' },
  gpids_engine_cycle: { label: 'IPO Simulator', icon: '🏛️' },
  swfps_partnership_advancing: { label: 'SWF Partnership Advancing', icon: '🤝' },
  swfps_engine_cycle: { label: 'Sovereign Strategy', icon: '🏦' },
  psnem_tipping_point_reached: { label: 'Network Tipping Point', icon: '🔥' },
  psnem_engine_cycle: { label: 'Network Effect Model', icon: '📐' },
  gpla_infrastructure_irreplaceable: { label: 'Infrastructure Irreplaceable', icon: '🏛️' },
  gpla_engine_cycle: { label: 'Legacy Architecture', icon: '🏗️' },
  fycs_megacity_formation: { label: 'Megacity Formation', icon: '🏙️' },
  fycs_engine_cycle: { label: 'Capital Civilization', icon: '🌍' },
  fspcm_exponential_power: { label: 'Exponential Power', icon: '⚡' },
  fspcm_engine_cycle: { label: 'Founder Power Engine', icon: '👑' },
  hycb_autonomous_city: { label: 'Autonomous City', icon: '🏙️' },
  hycb_engine_cycle: { label: 'Century Blueprint', icon: '🌐' },
  ahcss_copilot_autonomous: { label: 'Copilot Autonomous', icon: '🤖' },
  ahcss_engine_cycle: { label: 'AI-Human Symbiosis', icon: '🧬' },
  pesa_critical_volatility: { label: 'Critical Volatility', icon: '🌋' },
  pesa_engine_cycle: { label: 'Planetary Stability', icon: '🌍' },
  gpewm_immediate_entry: { label: 'Immediate Entry', icon: '🚀' },
  gpewm_engine_cycle: { label: 'Execution Warmap', icon: '🗺️' },
  cdte_deploy_window: { label: 'Deploy Window', icon: '🎯' },
  cdte_engine_cycle: { label: 'Capital Timing', icon: '⏱️' },
  fscc_critical_decision: { label: 'Critical Decision', icon: '🚨' },
  fscc_engine_cycle: { label: 'Command Center', icon: '🎖️' },
  gfne_traction_milestone: { label: 'Traction Milestone', icon: '📈' },
  gfne_engine_cycle: { label: 'Narrative Engine', icon: '📖' },
  ivms_momentum_surge: { label: 'Momentum Surge', icon: '🚀' },
  ivms_engine_cycle: { label: 'Valuation Momentum', icon: '📊' },
  cmpc_sentiment_critical: { label: 'Sentiment Critical', icon: '🚨' },
  cmpc_engine_cycle: { label: 'Market Perception', icon: '📡' },
  giws_readiness_gap: { label: 'IPO Readiness Gap', icon: '⚠️' },
  giws_engine_cycle: { label: 'IPO War Strategy', icon: '⚔️' },
  icd_churn_risk: { label: 'Partner Churn Risk', icon: '🚨' },
  icd_engine_cycle: { label: 'Capital Domination', icon: '🏛️' },
};

/** Subscribe to real-time AI event signals and auto-refresh relevant queries */
export function useRealtimeSignals(options?: { showToasts?: boolean }) {
  const qc = useQueryClient();
  const showToasts = options?.showToasts ?? true;

  useEffect(() => {
    const channel = supabase
      .channel('ai-event-signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_event_signals',
        },
        (payload: RealtimePostgresInsertPayload<AIEventSignal>) => {
          const signal = payload.new;
          const meta = EVENT_LABELS[signal.event_type] ?? { label: signal.event_type, icon: '⚡' };

          // Invalidate relevant queries based on event type
          if (['property_created', 'price_changed'].includes(signal.event_type)) {
            qc.invalidateQueries({ queryKey: ['properties'] });
            qc.invalidateQueries({ queryKey: ['opportunity-score-stats'] });
            qc.invalidateQueries({ queryKey: ['price-prediction-stats'] });
          }
          if (signal.event_type === 'demand_spike') {
            qc.invalidateQueries({ queryKey: ['market-clusters'] });
            qc.invalidateQueries({ queryKey: ['market-heat-zones'] });
          }
          if (signal.event_type === 'status_changed') {
            qc.invalidateQueries({ queryKey: ['properties'] });
            qc.invalidateQueries({ queryKey: ['market-clusters'] });
          }

          // Refresh liquidity metrics on relevant signals
          if (['liquidity_recalculated', 'escrow_initiated', 'deal_closed'].includes(signal.event_type)) {
            qc.invalidateQueries({ queryKey: ['liquidity-metrics'] });
            qc.invalidateQueries({ queryKey: ['property-liquidity'] });
            qc.invalidateQueries({ queryKey: ['liquidity-hotspots'] });
            qc.invalidateQueries({ queryKey: ['liquidity-signal-queue'] });
          }

          // Always refresh signal stats and autopilot
          qc.invalidateQueries({ queryKey: ['event-signal-stats'] });
          qc.invalidateQueries({ queryKey: ['autopilot-status'] });
          qc.invalidateQueries({ queryKey: ['intelligence-worker-status'] });

          if (showToasts && signal.priority_level === 'critical') {
            toast.info(`${meta.icon} ${meta.label}`, {
              description: typeof signal.payload === 'object' && signal.payload?.city
                ? `Intelligence signal in ${signal.payload.city}`
                : 'New intelligence signal detected',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, showToasts]);
}

/** Fetch pending event signal statistics */
export function useEventSignalStats() {
  return useQuery({
    queryKey: ['event-signal-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_event_signal_stats' as any);
      if (error) throw error;
      return (data ?? []) as unknown as EventSignalStats[];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Fetch recent event signals */
export function useRecentSignals(limit = 20) {
  return useQuery({
    queryKey: ['recent-signals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_event_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as unknown as AIEventSignal[];
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

/** Manually trigger event processor */
export function useProcessEvents() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { limit?: number; priority?: string }) => {
      const { data, error } = await supabase.functions.invoke('process-ai-events', {
        body: params ?? {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['event-signal-stats'] });
      qc.invalidateQueries({ queryKey: ['recent-signals'] });
      qc.invalidateQueries({ queryKey: ['intelligence-worker-status'] });
      toast.success(`Processed ${data.signals_processed} signals → ${data.workers_dispatched?.length ?? 0} workers dispatched`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Event processing failed');
    },
  });
}

export { EVENT_LABELS };
