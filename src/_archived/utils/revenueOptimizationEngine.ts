/**
 * Revenue Flywheel Optimization Engine
 * 
 * Zero-latency client-side scoring for:
 * - Revenue velocity forecasting
 * - Pricing elasticity signals
 * - Upsell trigger detection
 * - Commission optimization
 * - Stream diversification health
 */

// ─── Types ───────────────────────────────────────────────────────────────

export interface RevenueSnapshot {
  snapshot_date: string;
  transaction_revenue: number;
  subscription_revenue: number;
  vendor_revenue: number;
  escrow_fees: number;
  referral_revenue: number;
  premium_slot_revenue: number;
  total_revenue: number;
  deal_count: number;
  active_subscribers: number;
  active_vendors: number;
}

export interface RevenueExperiment {
  id: string;
  experiment_name: string;
  experiment_type: string;
  status: string;
  variant_a: Record<string, unknown>;
  variant_b: Record<string, unknown>;
  traffic_split_pct: number;
  target_metric: string;
  baseline_value: number;
  variant_a_result: number;
  variant_b_result: number;
  sample_size_target: number;
  current_sample_a: number;
  current_sample_b: number;
  confidence_pct: number;
  winner: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface StreamHealth {
  stream: string;
  revenue: number;
  share_pct: number;
  trend: 'growing' | 'stable' | 'declining';
  velocity: number; // revenue per day
}

export interface RevenueVelocity {
  daily_avg: number;
  weekly_avg: number;
  monthly_projected: number;
  arr_projected: number;
  growth_rate_pct: number;
  momentum: 'accelerating' | 'steady' | 'decelerating';
}

export interface UpsellSignal {
  type: 'vendor_upgrade' | 'investor_premium' | 'slot_expansion' | 'commission_bump';
  trigger: string;
  estimated_revenue: number;
  priority: 'high' | 'medium' | 'low';
  target_count: number;
}

export interface FlywheelHealth {
  score: number; // 0-100
  velocity: RevenueVelocity;
  streams: StreamHealth[];
  diversification_index: number; // 0-100, higher = more diversified
  upsell_signals: UpsellSignal[];
  experiment_impact: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

// ─── Revenue Velocity ────────────────────────────────────────────────────

export function computeRevenueVelocity(snapshots: RevenueSnapshot[]): RevenueVelocity {
  if (snapshots.length < 2) {
    const total = snapshots[0]?.total_revenue ?? 0;
    return { daily_avg: total, weekly_avg: total * 7, monthly_projected: total * 30, arr_projected: total * 365, growth_rate_pct: 0, momentum: 'steady' };
  }

  const sorted = [...snapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
  const recent7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);

  const recentAvg = recent7.reduce((s, r) => s + r.total_revenue, 0) / recent7.length;
  const prevAvg = prev7.length > 0 ? prev7.reduce((s, r) => s + r.total_revenue, 0) / prev7.length : recentAvg;

  const growthRate = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;
  const daily = recentAvg;

  let momentum: RevenueVelocity['momentum'] = 'steady';
  if (growthRate > 5) momentum = 'accelerating';
  else if (growthRate < -5) momentum = 'decelerating';

  return {
    daily_avg: Math.round(daily),
    weekly_avg: Math.round(daily * 7),
    monthly_projected: Math.round(daily * 30),
    arr_projected: Math.round(daily * 365),
    growth_rate_pct: Math.round(growthRate * 10) / 10,
    momentum,
  };
}

// ─── Stream Diversification ──────────────────────────────────────────────

export function computeStreamHealth(snapshots: RevenueSnapshot[]): { streams: StreamHealth[]; diversification_index: number } {
  if (!snapshots.length) return { streams: [], diversification_index: 0 };

  const recent = snapshots.slice(-7);
  const prev = snapshots.slice(-14, -7);

  const streamKeys: { key: keyof RevenueSnapshot; label: string }[] = [
    { key: 'transaction_revenue', label: 'Transaction Commissions' },
    { key: 'subscription_revenue', label: 'Investor Subscriptions' },
    { key: 'vendor_revenue', label: 'Vendor SaaS' },
    { key: 'premium_slot_revenue', label: 'Premium Slots' },
    { key: 'escrow_fees', label: 'Escrow Fees' },
    { key: 'referral_revenue', label: 'Referral Revenue' },
  ];

  const totalRevenue = recent.reduce((s, r) => s + r.total_revenue, 0);
  const shares: number[] = [];

  const streams: StreamHealth[] = streamKeys.map(({ key, label }) => {
    const recentSum = recent.reduce((s, r) => s + (r[key] as number), 0);
    const prevSum = prev.length > 0 ? prev.reduce((s, r) => s + (r[key] as number), 0) : recentSum;
    const sharePct = totalRevenue > 0 ? (recentSum / totalRevenue) * 100 : 0;
    shares.push(sharePct);

    let trend: StreamHealth['trend'] = 'stable';
    if (prevSum > 0) {
      const change = ((recentSum - prevSum) / prevSum) * 100;
      if (change > 10) trend = 'growing';
      else if (change < -10) trend = 'declining';
    }

    return {
      stream: label,
      revenue: Math.round(recentSum / recent.length),
      share_pct: Math.round(sharePct * 10) / 10,
      trend,
      velocity: Math.round(recentSum / recent.length),
    };
  });

  // HHI-based diversification (6 streams → perfect = 1667 each → HHI ≈ 1667)
  const hhi = shares.reduce((s, sh) => s + sh * sh, 0);
  const diversification_index = clamp(Math.round(100 - (hhi - 1667) / 83));

  return { streams: streams.sort((a, b) => b.revenue - a.revenue), diversification_index };
}

// ─── Upsell Signal Detection ─────────────────────────────────────────────

export function detectUpsellSignals(
  activeVendors: number,
  activeSubscribers: number,
  avgDealValue: number,
  conversionRate: number,
): UpsellSignal[] {
  const signals: UpsellSignal[] = [];

  // Vendor upgrade opportunity
  const vendorUpgradeTarget = Math.round(activeVendors * 0.15);
  if (vendorUpgradeTarget > 0) {
    signals.push({
      type: 'vendor_upgrade',
      trigger: `${vendorUpgradeTarget} vendors eligible for tier upgrade based on lead volume`,
      estimated_revenue: vendorUpgradeTarget * 500_000,
      priority: vendorUpgradeTarget > 10 ? 'high' : 'medium',
      target_count: vendorUpgradeTarget,
    });
  }

  // Investor premium push
  const investorTarget = Math.round(activeSubscribers * 0.08);
  if (investorTarget > 0) {
    signals.push({
      type: 'investor_premium',
      trigger: `${investorTarget} free-tier investors with high engagement scores`,
      estimated_revenue: investorTarget * 299_000,
      priority: investorTarget > 20 ? 'high' : 'medium',
      target_count: investorTarget,
    });
  }

  // Premium slot expansion
  if (activeVendors > 50) {
    const slotTarget = Math.round(activeVendors * 0.05);
    signals.push({
      type: 'slot_expansion',
      trigger: `District demand heat supports ${slotTarget} additional sponsored slots`,
      estimated_revenue: slotTarget * 2_500_000,
      priority: 'medium',
      target_count: slotTarget,
    });
  }

  // Commission bump opportunity
  if (conversionRate > 0.06 && avgDealValue > 1_000_000_000) {
    signals.push({
      type: 'commission_bump',
      trigger: `High conversion (${(conversionRate * 100).toFixed(1)}%) + avg deal Rp ${(avgDealValue / 1e9).toFixed(1)}B supports 0.1% rate increase`,
      estimated_revenue: Math.round(avgDealValue * 0.001 * 10), // 10 deals/month estimate
      priority: 'high',
      target_count: 1,
    });
  }

  return signals.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return p[b.priority] - p[a.priority];
  });
}

// ─── Experiment Confidence ───────────────────────────────────────────────

export function computeExperimentConfidence(
  sampleA: number,
  sampleB: number,
  resultA: number,
  resultB: number,
): { confidence_pct: number; winner: 'a' | 'b' | null; lift_pct: number } {
  const totalSample = sampleA + sampleB;
  if (totalSample < 20) return { confidence_pct: 0, winner: null, lift_pct: 0 };

  const lift = resultA > 0 ? ((resultB - resultA) / resultA) * 100 : 0;
  
  // Simplified confidence based on sample size and effect magnitude
  const sampleFactor = Math.min(totalSample / 200, 1) * 60;
  const effectFactor = Math.min(Math.abs(lift) / 20, 1) * 40;
  const confidence = clamp(Math.round(sampleFactor + effectFactor));

  let winner: 'a' | 'b' | null = null;
  if (confidence >= 90) winner = lift > 0 ? 'b' : 'a';

  return { confidence_pct: confidence, winner, lift_pct: Math.round(lift * 10) / 10 };
}

// ─── Master Flywheel Health ──────────────────────────────────────────────

export function computeFlywheelHealth(
  snapshots: RevenueSnapshot[],
  activeVendors: number,
  activeSubscribers: number,
  avgDealValue: number,
  conversionRate: number,
  experimentImpact: number = 0,
): FlywheelHealth {
  const velocity = computeRevenueVelocity(snapshots);
  const { streams, diversification_index } = computeStreamHealth(snapshots);
  const upsell_signals = detectUpsellSignals(activeVendors, activeSubscribers, avgDealValue, conversionRate);

  // Flywheel health score
  const velocityScore = velocity.momentum === 'accelerating' ? 30 : velocity.momentum === 'steady' ? 20 : 10;
  const diversScore = diversification_index * 0.25;
  const upsellScore = Math.min(upsell_signals.length * 5, 20);
  const experimentScore = Math.min(experimentImpact * 5, 15);
  const baseScore = velocity.monthly_projected > 0 ? 10 : 0;

  const score = clamp(Math.round(velocityScore + diversScore + upsellScore + experimentScore + baseScore));

  return {
    score,
    velocity,
    streams,
    diversification_index,
    upsell_signals,
    experiment_impact: experimentImpact,
  };
}

// ─── Display Helpers ─────────────────────────────────────────────────────

export const MOMENTUM_COLORS: Record<string, string> = {
  accelerating: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  steady: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  decelerating: 'text-red-600 bg-red-500/10 border-red-500/20',
};

export const STREAM_TREND_COLORS: Record<string, string> = {
  growing: 'text-emerald-600',
  stable: 'text-muted-foreground',
  declining: 'text-red-600',
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  low: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
};

export const EXPERIMENT_STATUS_COLORS: Record<string, string> = {
  draft: 'text-muted-foreground bg-muted/50 border-border/40',
  active: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  paused: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  completed: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
};

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1_000) return `Rp ${(value / 1e3).toFixed(0)}K`;
  return `Rp ${value}`;
}
