/**
 * Founder Decision Intelligence Engine
 * Automates strategic decision support using platform signals.
 */

import type { HealthReport } from '@/services/systemHealthEngine';
import type { PlatformIntelligenceReport } from '@/services/SystemIntelligenceService';
import type { GrowthTrajectory } from '@/services/growthTrajectoryEngine';

export type DecisionVerdict = 'accelerate' | 'proceed' | 'caution' | 'freeze';

export interface OpportunityScore {
  label: string;
  revenueImpact: number;   // 0-100
  riskExposure: number;    // 0-100
  feasibility: number;     // 0-100
  strategicAlignment: number; // 0-100
  composite: number;       // weighted 0-100
  verdict: DecisionVerdict;
}

export interface DecisionSignals {
  overallVerdict: DecisionVerdict;
  investorReadiness: boolean;
  featureFreezeRecommended: boolean;
  growthAccelerationSafe: boolean;
  performanceVsGrowthBalance: number; // -1 (perf focus) to +1 (growth focus)
  signals: { signal: string; type: 'positive' | 'warning' | 'critical' }[];
  recommendations: string[];
}

/**
 * Score a new feature opportunity:
 * Revenue (30%) + Feasibility (25%) + Strategic (25%) + Risk-inverted (20%)
 */
export function scoreOpportunity(
  label: string,
  revenueImpact: number,
  riskExposure: number,
  feasibility: number,
  strategicAlignment: number
): OpportunityScore {
  const composite = Math.round(
    revenueImpact * 0.30 +
    feasibility * 0.25 +
    strategicAlignment * 0.25 +
    (100 - riskExposure) * 0.20
  );

  let verdict: DecisionVerdict = 'proceed';
  if (composite >= 75 && riskExposure < 40) verdict = 'accelerate';
  else if (composite < 40 || riskExposure > 70) verdict = 'freeze';
  else if (riskExposure > 50) verdict = 'caution';

  return { label, revenueImpact, riskExposure, feasibility, strategicAlignment, composite, verdict };
}

/**
 * Generate decision signals from platform state.
 */
export function generateDecisionSignals(
  health: HealthReport | null,
  intelligence: PlatformIntelligenceReport | null,
  growth: GrowthTrajectory | null
): DecisionSignals {
  const signals: DecisionSignals['signals'] = [];
  const recommendations: string[] = [];

  const healthScore = health?.overallScore ?? 50;
  const riskLevel = intelligence?.riskLevel ?? 'medium';
  const growthScore = growth?.score ?? 0;
  const momentum = growth?.momentum ?? 'stalled';
  const scalingReady = intelligence?.scalingReadiness ?? 0;

  // ── Investor Readiness ──
  const investorReadiness = healthScore >= 70 && growthScore >= 30 && riskLevel !== 'high';
  if (investorReadiness) {
    signals.push({ signal: 'Platform ready for investor demonstrations', type: 'positive' });
  } else {
    signals.push({ signal: 'Investor demo readiness not met — resolve health/growth gaps', type: 'warning' });
  }

  // ── Feature Freeze Logic ──
  const featureFreezeRecommended = healthScore < 55 || riskLevel === 'high';
  if (featureFreezeRecommended) {
    signals.push({ signal: 'Feature freeze recommended — stability at risk', type: 'critical' });
    recommendations.push('HALT all new feature development until health index exceeds 65.');
  }

  // ── Growth Acceleration ──
  const growthAccelerationSafe = healthScore >= 70 && riskLevel === 'low' && momentum !== 'stalled';
  if (growthAccelerationSafe) {
    signals.push({ signal: 'Safe to accelerate growth — all systems stable', type: 'positive' });
    recommendations.push('Proceed with aggressive listing acquisition and marketing campaigns.');
  } else if (momentum === 'slowing') {
    signals.push({ signal: 'Growth momentum slowing — focus on conversion optimization', type: 'warning' });
    recommendations.push('Prioritize deal conversion speed over new feature development.');
  }

  // ── Performance vs Growth Balance ──
  // -1 = focus purely on performance, +1 = focus purely on growth
  let balance = 0;
  if (healthScore >= 80 && riskLevel === 'low') balance = 0.7; // safe to grow
  else if (healthScore >= 65) balance = 0.3;
  else if (healthScore >= 55) balance = -0.3; // focus on stability
  else balance = -0.8; // critical — performance first

  // ── Scaling Signals ──
  if (scalingReady >= 70) {
    signals.push({ signal: 'Infrastructure ready for multi-region deployment', type: 'positive' });
    recommendations.push('Begin regional expansion planning and CDN setup.');
  } else if (scalingReady < 30) {
    signals.push({ signal: 'Scaling infrastructure immature — single-region only', type: 'warning' });
  }

  // ── Additional Context Signals ──
  if (growthScore >= 50 && momentum === 'accelerating') {
    signals.push({ signal: 'Strong growth acceleration detected — capitalize on momentum', type: 'positive' });
  }
  if (healthScore < 65 && growthScore > 40) {
    recommendations.push('Growth outpacing infrastructure — invest in performance before scaling further.');
  }

  // ── Overall Verdict ──
  let overallVerdict: DecisionVerdict = 'proceed';
  if (featureFreezeRecommended) overallVerdict = 'freeze';
  else if (balance < -0.3) overallVerdict = 'caution';
  else if (growthAccelerationSafe && balance > 0.5) overallVerdict = 'accelerate';

  if (recommendations.length === 0) {
    recommendations.push('Platform in stable state — continue balanced execution.');
  }

  return {
    overallVerdict,
    investorReadiness,
    featureFreezeRecommended,
    growthAccelerationSafe,
    performanceVsGrowthBalance: balance,
    signals,
    recommendations,
  };
}
