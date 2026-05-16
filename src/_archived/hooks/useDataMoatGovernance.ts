import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────

export interface MoatMetric {
  id: string;
  pillar: string;
  metric_name: string;
  metric_value: number;
  previous_value: number;
  unit: string;
  data_points_total: number;
  data_points_30d: number;
  freshness_hours: number;
  replication_difficulty_score: number;
  competitive_advantage_score: number;
  monetization_ready: boolean;
  snapshot_date: string;
}

export interface PillarSummary {
  pillar: string;
  label: string;
  totalDataPoints: number;
  dataPoints30d: number;
  avgReplicationDifficulty: number;
  avgCompetitiveAdvantage: number;
  avgFreshness: number;
  monetizableMetrics: number;
  totalMetrics: number;
  moatDepth: number; // 0-100 composite
  trend: 'deepening' | 'stable' | 'eroding';
}

export interface MoatHealthSummary {
  overallScore: number;
  totalDataPoints: number;
  totalDataPoints30d: number;
  avgReplicationDifficulty: number;
  monetizableCount: number;
  pillars: PillarSummary[];
}

// ─── Pillar Config ───────────────────────────────────────────────────────

export const PILLAR_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  behavioral_demand: { label: 'Behavioral Demand Intelligence', icon: '🧠', color: 'text-chart-4' },
  transaction_velocity: { label: 'Transaction Velocity Dataset', icon: '⚡', color: 'text-chart-1' },
  vendor_performance: { label: 'Vendor Performance Intelligence', icon: '🏗️', color: 'text-chart-2' },
  capital_behavior: { label: 'Investor Capital Behavior', icon: '💰', color: 'text-chart-3' },
  liquidity_index: { label: 'Market Liquidity Index (ALS)', icon: '🌊', color: 'text-chart-5' },
};

// ─── Compute pillar summaries from live infrastructure ────────────────────

export function useDataMoatHealth() {
  return useQuery({
    queryKey: ['data-moat-health'],
    queryFn: async (): Promise<MoatHealthSummary> => {
      // Pull live counts from existing tables to compute moat depth
      const [behavioralRes, cacheRes, liquidityRes, vendorRes, investorRes] = await Promise.all([
        supabase.from('behavioral_events').select('id', { count: 'exact', head: true }),
        supabase.from('ai_intelligence_cache').select('id', { count: 'exact', head: true }),
        supabase.from('liquidity_signal_queue').select('id', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('investor_scores').select('id', { count: 'exact', head: true }),
      ]);

      const behavioralCount = behavioralRes.count ?? 0;
      const cacheCount = cacheRes.count ?? 0;
      const liquidityCount = liquidityRes.count ?? 0;
      const vendorCount = vendorRes.count ?? 0;
      const investorCount = investorRes.count ?? 0;

      // Also pull moat metrics if any exist
      const { data: moatMetrics } = await supabase
        .from('data_moat_metrics')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(100);

      const metrics = (moatMetrics ?? []) as unknown as MoatMetric[];

      // Build pillar summaries from live data + stored metrics
      const pillars: PillarSummary[] = Object.entries(PILLAR_CONFIG).map(([key, config]) => {
        const pillarMetrics = metrics.filter(m => m.pillar === key);

        // Use live counts as base data points
        let liveDataPoints = 0;
        if (key === 'behavioral_demand') liveDataPoints = behavioralCount;
        else if (key === 'transaction_velocity') liveDataPoints = cacheCount;
        else if (key === 'vendor_performance') liveDataPoints = vendorCount;
        else if (key === 'capital_behavior') liveDataPoints = investorCount;
        else if (key === 'liquidity_index') liveDataPoints = liquidityCount;

        const totalDataPoints = liveDataPoints + pillarMetrics.reduce((s, m) => s + m.data_points_total, 0);
        const dataPoints30d = pillarMetrics.reduce((s, m) => s + m.data_points_30d, 0) || Math.round(liveDataPoints * 0.3);
        const avgRepDiff = pillarMetrics.length > 0
          ? pillarMetrics.reduce((s, m) => s + m.replication_difficulty_score, 0) / pillarMetrics.length
          : getDefaultReplicationScore(key);
        const avgCompAdv = pillarMetrics.length > 0
          ? pillarMetrics.reduce((s, m) => s + m.competitive_advantage_score, 0) / pillarMetrics.length
          : getDefaultCompetitiveScore(key, liveDataPoints);
        const avgFreshness = pillarMetrics.length > 0
          ? pillarMetrics.reduce((s, m) => s + m.freshness_hours, 0) / pillarMetrics.length
          : 24;
        const monetizableMetrics = pillarMetrics.filter(m => m.monetization_ready).length;

        // Moat depth composite
        const dataScale = Math.min(totalDataPoints / 10000, 1) * 30;
        const repScore = avgRepDiff * 0.35;
        const compScore = avgCompAdv * 0.25;
        const freshnessScore = Math.max(0, (1 - avgFreshness / 168)) * 10; // fresher = better
        const moatDepth = Math.min(100, Math.round(dataScale + repScore + compScore + freshnessScore));

        // Trend based on data growth
        const trend: PillarSummary['trend'] = dataPoints30d > totalDataPoints * 0.05
          ? 'deepening' : dataPoints30d > 0 ? 'stable' : 'eroding';

        return {
          pillar: key,
          label: config.label,
          totalDataPoints,
          dataPoints30d,
          avgReplicationDifficulty: Math.round(avgRepDiff),
          avgCompetitiveAdvantage: Math.round(avgCompAdv),
          avgFreshness: Math.round(avgFreshness),
          monetizableMetrics,
          totalMetrics: pillarMetrics.length || 1,
          moatDepth,
          trend,
        };
      });

      const totalDataPoints = pillars.reduce((s, p) => s + p.totalDataPoints, 0);
      const totalDataPoints30d = pillars.reduce((s, p) => s + p.dataPoints30d, 0);
      const avgRepDiff = pillars.reduce((s, p) => s + p.avgReplicationDifficulty, 0) / pillars.length;
      const monetizableCount = pillars.reduce((s, p) => s + p.monetizableMetrics, 0);
      const overallScore = Math.round(pillars.reduce((s, p) => s + p.moatDepth, 0) / pillars.length);

      return { overallScore, totalDataPoints, totalDataPoints30d, avgReplicationDifficulty: Math.round(avgRepDiff), monetizableCount, pillars };
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

// ─── Intelligence API Access ─────────────────────────────────────────────

export function useIntelligenceAPIAccess() {
  return useQuery({
    queryKey: ['intelligence-api-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intelligence_api_access_log')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ─── Defaults when no stored metrics exist ───────────────────────────────

function getDefaultReplicationScore(pillar: string): number {
  const scores: Record<string, number> = {
    behavioral_demand: 85,
    transaction_velocity: 90,
    vendor_performance: 65,
    capital_behavior: 80,
    liquidity_index: 92,
  };
  return scores[pillar] ?? 50;
}

function getDefaultCompetitiveScore(pillar: string, dataPoints: number): number {
  const base: Record<string, number> = {
    behavioral_demand: 40,
    transaction_velocity: 45,
    vendor_performance: 35,
    capital_behavior: 50,
    liquidity_index: 55,
  };
  const dataBonus = Math.min(dataPoints / 5000, 1) * 30;
  return Math.min(100, Math.round((base[pillar] ?? 30) + dataBonus));
}

// ─── Display Helpers ─────────────────────────────────────────────────────

export const TREND_CONFIG: Record<string, { label: string; color: string }> = {
  deepening: { label: 'Deepening', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  stable: { label: 'Stable', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  eroding: { label: 'Eroding', color: 'text-red-600 bg-red-500/10 border-red-500/20' },
};

export const MOAT_DEPTH_TIER = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: 'Fortress', color: 'text-emerald-600' };
  if (score >= 60) return { label: 'Strong', color: 'text-blue-600' };
  if (score >= 40) return { label: 'Building', color: 'text-amber-600' };
  return { label: 'Nascent', color: 'text-red-600' };
};
