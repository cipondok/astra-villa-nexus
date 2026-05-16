import type { HealthReport } from '@/services/systemHealthEngine';

export interface PlatformIntelligenceReport {
  riskLevel: 'low' | 'medium' | 'high';
  priorityActions: string[];
  optimizationTargets: string[];
  architectureWarnings: string[];
  scalingReadiness: number;
  revenueHealthSignal: 'growing' | 'stable' | 'declining' | 'unknown';
  timestamp: string;
}

interface PlatformContext {
  healthReport: HealthReport | null;
  bundleTransferKB: number;
  jsChunkCount: number;
  domReadyMs: number;
  totalProperties: number;
  totalValuations: number;
  avgSeoScore: number;
  jobFailureRate: number;
  dbResponseMs: number;
}

function detectArchitectureRisks(ctx: PlatformContext): string[] {
  const warnings: string[] = [];

  if (ctx.jsChunkCount > 80)
    warnings.push(`Chunk sprawl detected: ${ctx.jsChunkCount} JS chunks loaded — consolidate lazy boundaries.`);
  if (ctx.bundleTransferKB > 600)
    warnings.push(`Bundle transfer ${ctx.bundleTransferKB}KB exceeds 600KB threshold — audit heavy imports.`);
  if (ctx.domReadyMs > 3000)
    warnings.push(`DOM ready at ${ctx.domReadyMs}ms — investigate render-blocking resources.`);
  if (ctx.dbResponseMs > 3000)
    warnings.push(`Database latency ${ctx.dbResponseMs}ms — consider connection pooling or query optimization.`);
  if (ctx.jobFailureRate > 25)
    warnings.push(`AI job failure rate ${ctx.jobFailureRate}% — immediate investigation required.`);

  return warnings;
}

function generatePriorityActions(ctx: PlatformContext): string[] {
  const actions: string[] = [];

  if (ctx.healthReport && ctx.healthReport.overallScore < 55)
    actions.push('CRITICAL: Initiate feature freeze — health index below 55.');
  if (ctx.jobFailureRate > 15)
    actions.push('Review and fix failing AI jobs — failure rate above 15%.');
  if (ctx.avgSeoScore < 40 && ctx.avgSeoScore > 0)
    actions.push('SEO scores below 40% — run batch SEO optimization.');
  if (ctx.totalProperties < 10)
    actions.push('Listing inventory critically low — prioritize property onboarding.');
  if (ctx.dbResponseMs > 2000)
    actions.push('Optimize slow database queries — add indexes or materialized views.');
  if (ctx.bundleTransferKB > 500)
    actions.push('Reduce bundle size — audit unused dependencies and split large chunks.');

  if (actions.length === 0) actions.push('No critical actions — maintain current trajectory.');

  return actions;
}

function generateOptimizationTargets(ctx: PlatformContext): string[] {
  const targets: string[] = [];

  if (ctx.domReadyMs > 1500)
    targets.push(`DOM ready: ${ctx.domReadyMs}ms → target <1200ms`);
  if (ctx.bundleTransferKB > 300)
    targets.push(`Bundle: ${ctx.bundleTransferKB}KB → target <300KB`);
  if (ctx.dbResponseMs > 800)
    targets.push(`DB latency: ${ctx.dbResponseMs}ms → target <500ms`);
  if (ctx.avgSeoScore > 0 && ctx.avgSeoScore < 70)
    targets.push(`SEO score: ${ctx.avgSeoScore}% → target ≥70%`);
  if (ctx.jobFailureRate > 5)
    targets.push(`Job failures: ${ctx.jobFailureRate}% → target <5%`);

  return targets;
}

function computeRiskLevel(ctx: PlatformContext): PlatformIntelligenceReport['riskLevel'] {
  const score = ctx.healthReport?.overallScore ?? 70;
  if (score < 55 || ctx.jobFailureRate > 30 || ctx.dbResponseMs > 5000) return 'high';
  if (score < 70 || ctx.jobFailureRate > 15 || ctx.dbResponseMs > 2500) return 'medium';
  return 'low';
}

function assessRevenueHealth(ctx: PlatformContext): PlatformIntelligenceReport['revenueHealthSignal'] {
  if (ctx.totalProperties === 0) return 'unknown';
  if (ctx.totalProperties >= 20 && ctx.totalValuations >= 10) return 'growing';
  if (ctx.totalProperties >= 5) return 'stable';
  return 'declining';
}

export function generatePlatformIntelligence(ctx: PlatformContext): PlatformIntelligenceReport {
  return {
    riskLevel: computeRiskLevel(ctx),
    priorityActions: generatePriorityActions(ctx),
    optimizationTargets: generateOptimizationTargets(ctx),
    architectureWarnings: detectArchitectureRisks(ctx),
    scalingReadiness: computeScalingReadiness(ctx),
    revenueHealthSignal: assessRevenueHealth(ctx),
    timestamp: new Date().toISOString(),
  };
}

// ── Scaling Readiness ──

interface ScalingMilestone {
  label: string;
  met: boolean;
  weight: number;
}

function computeScalingReadiness(ctx: PlatformContext): number {
  const milestones: ScalingMilestone[] = [
    { label: 'DB latency <1s', met: ctx.dbResponseMs < 1000, weight: 20 },
    { label: 'Job failure <10%', met: ctx.jobFailureRate < 10, weight: 15 },
    { label: 'Bundle <400KB', met: ctx.bundleTransferKB < 400, weight: 15 },
    { label: 'Health score ≥70', met: (ctx.healthReport?.overallScore ?? 0) >= 70, weight: 20 },
    { label: '≥10 properties', met: ctx.totalProperties >= 10, weight: 10 },
    { label: 'SEO ≥50%', met: ctx.avgSeoScore >= 50, weight: 10 },
    { label: 'Valuations active', met: ctx.totalValuations > 0, weight: 10 },
  ];

  return milestones.reduce((score, m) => score + (m.met ? m.weight : 0), 0);
}

// ── Revenue Insights ──

export interface RevenueKPIs {
  listingConversionRate: number;
  dealCompletionVelocityDays: number;
  premiumAdoptionRate: number;
  avgRevenuePerProperty: number;
  geographicConcentration: string;
}

/**
 * Compute revenue KPIs from available platform data.
 * In early stage, returns estimates based on property/valuation counts.
 */
export function computeRevenueKPIs(
  totalProperties: number,
  totalValuations: number,
  totalDeals: number,
  premiumListings: number
): RevenueKPIs {
  return {
    listingConversionRate: totalProperties > 0
      ? Math.round((totalValuations / totalProperties) * 100)
      : 0,
    dealCompletionVelocityDays: totalDeals > 0 ? Math.round(30 / Math.max(totalDeals, 1)) : 0,
    premiumAdoptionRate: totalProperties > 0
      ? Math.round((premiumListings / totalProperties) * 100)
      : 0,
    avgRevenuePerProperty: totalDeals > 0 ? Math.round(500000 / totalDeals) : 0,
    geographicConcentration: 'Indonesia (Primary)',
  };
}

export function generateRevenueRecommendations(kpis: RevenueKPIs): string[] {
  const recs: string[] = [];

  if (kpis.listingConversionRate < 30)
    recs.push('Increase listing-to-valuation conversion — add automated valuation triggers.');
  if (kpis.premiumAdoptionRate < 20)
    recs.push('Drive premium feature adoption — implement targeted upgrade prompts.');
  if (kpis.dealCompletionVelocityDays > 14)
    recs.push('Deal velocity slow — streamline escrow and document workflows.');
  if (kpis.listingConversionRate >= 50 && kpis.premiumAdoptionRate >= 30)
    recs.push('Strong fundamentals — focus on geographic expansion.');

  if (recs.length === 0) recs.push('Revenue metrics healthy — maintain growth trajectory.');
  return recs;
}
