import type { PlatformHealthSummary } from '@/hooks/usePlatformHealth';

export interface HealthMetrics {
  platformComplexity: number;
  performanceStability: number;
  featureActivation: number;
  investorDemoReadiness: number;
  scalabilityConfidence: number;
}

export interface HealthReport {
  overallScore: number;
  status: 'strong' | 'stable' | 'risk' | 'critical';
  metrics: HealthMetrics;
  recommendations: string[];
}

/**
 * Platform Complexity Score (PCS)
 * Lower complexity = higher score. Based on DB response, job failure rate.
 */
function computePlatformComplexity(health: PlatformHealthSummary): number {
  let score = 100;
  // Penalize slow DB
  if (health.dbResponseMs > 3000) score -= 30;
  else if (health.dbResponseMs > 1500) score -= 15;
  else if (health.dbResponseMs > 800) score -= 5;

  // Penalize high failure rate
  score -= Math.min(health.jobFailureRate * 2, 40);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Performance Stability Score (PSS)
 * Based on DB latency and subsystem statuses.
 */
function computePerformanceStability(health: PlatformHealthSummary): number {
  const operational = health.subsystems.filter(s => s.status === 'operational').length;
  const total = health.subsystems.length || 1;
  const subsystemRatio = (operational / total) * 60;

  let latencyScore = 40;
  if (health.dbResponseMs > 5000) latencyScore = 0;
  else if (health.dbResponseMs > 3000) latencyScore = 10;
  else if (health.dbResponseMs > 1500) latencyScore = 25;

  return Math.round(subsystemRatio + latencyScore);
}

/**
 * Feature Activation Score (FAS)
 * Measures how many subsystems are actively producing data.
 */
function computeFeatureActivation(health: PlatformHealthSummary): number {
  let active = 0;
  if (health.totalProperties > 0) active++;
  if (health.totalJobs > 0) active++;
  if (health.avgSeoScore > 0) active++;
  if (health.totalValuations > 0) active++;

  return Math.round((active / 4) * 100);
}

/**
 * Investor Demo Readiness Score (IDRS)
 * Can the platform be demoed to investors right now?
 */
function computeInvestorDemoReadiness(health: PlatformHealthSummary): number {
  let score = 0;
  // Properties available
  if (health.totalProperties >= 5) score += 25;
  else if (health.totalProperties > 0) score += 15;
  // System healthy
  if (health.overall === 'healthy') score += 30;
  else if (health.overall === 'warning') score += 15;
  // SEO working
  if (health.avgSeoScore >= 50) score += 20;
  else if (health.avgSeoScore > 0) score += 10;
  // Fast response
  if (health.dbResponseMs < 1000) score += 25;
  else if (health.dbResponseMs < 2000) score += 15;
  else score += 5;

  return Math.min(100, score);
}

/**
 * Scalability Confidence Score (SCS)
 * Can the platform handle growth?
 */
function computeScalabilityConfidence(health: PlatformHealthSummary): number {
  let score = 50; // baseline
  // Low failure rate is good
  if (health.jobFailureRate < 5) score += 20;
  else if (health.jobFailureRate < 15) score += 10;
  // Fast DB
  if (health.dbResponseMs < 800) score += 20;
  else if (health.dbResponseMs < 2000) score += 10;
  // No critical subsystems
  if (health.overall === 'healthy') score += 10;

  return Math.min(100, Math.round(score));
}

function getStatus(score: number): HealthReport['status'] {
  if (score >= 80) return 'strong';
  if (score >= 65) return 'stable';
  if (score >= 55) return 'risk';
  return 'critical';
}

function getRecommendations(metrics: HealthMetrics, health: PlatformHealthSummary): string[] {
  const recs: string[] = [];

  if (metrics.platformComplexity < 60)
    recs.push('Reduce system complexity — review job queue failures and optimize DB queries.');
  if (metrics.performanceStability < 65)
    recs.push('Improve performance — database response times exceed acceptable thresholds.');
  if (metrics.featureActivation < 75)
    recs.push('Activate dormant features — some subsystems have no data yet.');
  if (metrics.investorDemoReadiness < 70)
    recs.push('Increase demo readiness — add more property listings and improve SEO scores.');
  if (metrics.scalabilityConfidence < 60)
    recs.push('Scalability risk — optimize job failure rates and database performance.');
  if (health.dbResponseMs > 2000)
    recs.push('Database latency is high — consider indexing or connection pooling.');
  if (health.jobFailureRate > 20)
    recs.push('Job failure rate exceeds 20% — investigate failing AI jobs immediately.');

  if (recs.length === 0) recs.push('All systems nominal — maintain current performance levels.');

  return recs;
}

export function computeHealthReport(health: PlatformHealthSummary): HealthReport {
  const metrics: HealthMetrics = {
    platformComplexity: computePlatformComplexity(health),
    performanceStability: computePerformanceStability(health),
    featureActivation: computeFeatureActivation(health),
    investorDemoReadiness: computeInvestorDemoReadiness(health),
    scalabilityConfidence: computeScalabilityConfidence(health),
  };

  const overallScore = Math.round(
    metrics.platformComplexity * 0.15 +
    metrics.performanceStability * 0.25 +
    metrics.featureActivation * 0.20 +
    metrics.investorDemoReadiness * 0.20 +
    metrics.scalabilityConfidence * 0.20
  );

  return {
    overallScore,
    status: getStatus(overallScore),
    metrics,
    recommendations: getRecommendations(metrics, health),
  };
}
