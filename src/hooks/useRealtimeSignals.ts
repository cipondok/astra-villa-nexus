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
