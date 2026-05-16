import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CityTier = 'tier_1' | 'tier_2' | 'tier_3';
export type ExpansionStatus = 'planned' | 'seeding' | 'active' | 'scaling' | 'mature';
export type QualitySeverity = 'blocker' | 'warning' | 'suggestion';

export interface SupplyExpansionTarget {
  id: string;
  city: string;
  province: string;
  tier: CityTier;
  priority_rank: number;
  target_listings: number;
  current_listings: number;
  target_agents: number;
  current_agents: number;
  demand_score: number;
  supply_gap_score: number;
  status: ExpansionStatus;
  sourcing_channels: string[];
  notes: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QualityStandard {
  id: string;
  rule_name: string;
  rule_category: string;
  min_threshold: number;
  description: string | null;
  severity: QualitySeverity;
  is_active: boolean;
  created_at: string;
}

export interface SupplyOverviewStats {
  totalCities: number;
  activeCities: number;
  totalTargetListings: number;
  totalCurrentListings: number;
  totalTargetAgents: number;
  totalCurrentAgents: number;
  overallSupplyPct: number;
  avgDemandScore: number;
  avgSupplyGap: number;
  byTier: Record<CityTier, { count: number; listings: number; target: number }>;
}

export function useSupplyExpansionTargets(enabled = true) {
  return useQuery({
    queryKey: ['supply-expansion-targets'],
    queryFn: async (): Promise<{ targets: SupplyExpansionTarget[]; stats: SupplyOverviewStats }> => {
      const { data, error } = await supabase
        .from('supply_expansion_targets')
        .select('*')
        .order('priority_rank');
      if (error) throw error;

      const targets = (data || []) as unknown as SupplyExpansionTarget[];

      const byTier: Record<CityTier, { count: number; listings: number; target: number }> = {
        tier_1: { count: 0, listings: 0, target: 0 },
        tier_2: { count: 0, listings: 0, target: 0 },
        tier_3: { count: 0, listings: 0, target: 0 },
      };

      let totalTarget = 0, totalCurrent = 0, totalAgentTarget = 0, totalAgentCurrent = 0;
      let demandSum = 0, gapSum = 0;

      for (const t of targets) {
        totalTarget += t.target_listings;
        totalCurrent += t.current_listings;
        totalAgentTarget += t.target_agents;
        totalAgentCurrent += t.current_agents;
        demandSum += t.demand_score;
        gapSum += t.supply_gap_score;
        const tier = byTier[t.tier];
        if (tier) { tier.count++; tier.listings += t.current_listings; tier.target += t.target_listings; }
      }

      return {
        targets,
        stats: {
          totalCities: targets.length,
          activeCities: targets.filter((t) => ['active', 'scaling', 'mature'].includes(t.status)).length,
          totalTargetListings: totalTarget,
          totalCurrentListings: totalCurrent,
          totalTargetAgents: totalAgentTarget,
          totalCurrentAgents: totalAgentCurrent,
          overallSupplyPct: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
          avgDemandScore: targets.length > 0 ? Math.round(demandSum / targets.length) : 0,
          avgSupplyGap: targets.length > 0 ? Math.round(gapSum / targets.length) : 0,
          byTier,
        },
      };
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useSupplyQualityStandards(enabled = true) {
  return useQuery({
    queryKey: ['supply-quality-standards'],
    queryFn: async (): Promise<QualityStandard[]> => {
      const { data, error } = await supabase
        .from('supply_quality_standards')
        .select('*')
        .order('severity');
      if (error) throw error;
      return (data || []) as unknown as QualityStandard[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateExpansionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ExpansionStatus }) => {
      const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'active' || status === 'scaling') update.activated_at = new Date().toISOString();
      const { error } = await supabase.from('supply_expansion_targets').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supply-expansion-targets'] }),
  });
}
