/**
 * Execution Intelligence Engine
 * Converts platform signals into actionable founder execution plans.
 */

import type { HealthReport } from '@/services/systemHealthEngine';
import type { DecisionSignals } from '@/services/decisionIntelligenceService';
import type { MarketTimingAssessment } from '@/services/capitalNetworkService';
import type { GrowthTrajectory } from '@/services/growthTrajectoryEngine';
import type { CapitalNetworkSnapshot } from '@/services/capitalNetworkService';

// ── Types ──

export type ActionUrgency = 'critical' | 'high' | 'medium' | 'low';
export type ActionCategory = 'growth' | 'stability' | 'optimization' | 'expansion' | 'compliance';

export interface ExecutionAction {
  action: string;
  urgency: ActionUrgency;
  category: ActionCategory;
  rationale: string;
}

export interface DisciplineRule {
  rule: string;
  triggered: boolean;
  severity: 'block' | 'warn' | 'info';
  consequence: string;
}

export interface WeeklyPlan {
  topPriorities: string[];
  technicalTasks: string[];
  growthActions: string[];
  optimizationTasks: string[];
}

export interface ExecutionPlan {
  priorityActions: ExecutionAction[];
  executionFocus: string[];
  blockedActivities: string[];
  growthOpportunities: string[];
  doNotDoList: string[];
  disciplineRules: DisciplineRule[];
  weeklyPlan: WeeklyPlan;
  criticalAlerts: string[];
  thisWeekFocus: string;
}

// ── Discipline Rules Engine ──

function evaluateDiscipline(
  healthScore: number,
  featureActivation: number,
  performanceTrend: 'improving' | 'stable' | 'declining',
  growthMomentum: string,
  timingVerdict: string
): DisciplineRule[] {
  return [
    {
      rule: 'Health Gate: Score < 60 → block new features',
      triggered: healthScore < 60,
      severity: 'block',
      consequence: 'All new feature development halted until health restored above 65.',
    },
    {
      rule: 'Feature Activation < 50% → reduce expansion scope',
      triggered: featureActivation < 50,
      severity: 'warn',
      consequence: 'Defer market expansion — focus on activating existing features first.',
    },
    {
      rule: 'Performance declining → enforce optimization sprint',
      triggered: performanceTrend === 'declining',
      severity: 'block',
      consequence: 'Dedicate next sprint entirely to performance and stability fixes.',
    },
    {
      rule: 'Growth stalled → pivot to acquisition fundamentals',
      triggered: growthMomentum === 'stalled',
      severity: 'warn',
      consequence: 'Reassess product-market fit and core acquisition channels.',
    },
    {
      rule: 'Timing = wait → no capital raise or major launches',
      triggered: timingVerdict === 'wait',
      severity: 'info',
      consequence: 'Focus on internal metrics improvement before external initiatives.',
    },
    {
      rule: 'Health > 80 + Growth accelerating → authorize expansion',
      triggered: healthScore >= 80 && growthMomentum === 'accelerating',
      severity: 'info',
      consequence: 'Green light for new market entry and feature launches.',
    },
  ];
}

// ── Action Generation ──

function generateActions(
  health: HealthReport,
  decisions: DecisionSignals,
  timing: MarketTimingAssessment,
  growth: GrowthTrajectory,
  capital: CapitalNetworkSnapshot
): { actions: ExecutionAction[]; blocked: string[]; opportunities: string[] } {
  const actions: ExecutionAction[] = [];
  const blocked: string[] = [];
  const opportunities: string[] = [];

  // Health-based actions
  if (health.overallScore < 55) {
    actions.push({ action: 'Execute emergency stability sprint', urgency: 'critical', category: 'stability', rationale: `Health at ${health.overallScore}/100 — below safe operating threshold.` });
    blocked.push('New feature development');
    blocked.push('Market expansion activities');
    blocked.push('Major marketing campaigns');
  } else if (health.overallScore < 70) {
    actions.push({ action: 'Prioritize performance optimization', urgency: 'high', category: 'optimization', rationale: `Health at ${health.overallScore}/100 — needs improvement before scaling.` });
    blocked.push('Aggressive growth campaigns');
  }

  // Capital-based actions
  const surgingRegions = capital.topRegions.filter(r => r.capitalReadiness === 'surging');
  if (surgingRegions.length > 0) {
    actions.push({ action: `Expand listings in ${surgingRegions.map(r => r.region).join(', ')}`, urgency: 'high', category: 'expansion', rationale: 'Regional liquidity surging — capture market share.' });
    opportunities.push(`High liquidity in ${surgingRegions.map(r => r.region).join(', ')} — listing expansion opportunity.`);
  }
  const activeRegions = capital.topRegions.filter(r => r.capitalReadiness === 'active');
  if (activeRegions.length > 0) {
    opportunities.push(`Active capital in ${activeRegions.map(r => r.region).join(', ')} — investor engagement opportunity.`);
  }

  // Timing-based actions
  if (timing.verdict === 'accelerate') {
    actions.push({ action: 'Launch investor acquisition campaign', urgency: 'high', category: 'growth', rationale: 'Market timing optimal — maximize growth investment.' });
    actions.push({ action: 'Deploy queued growth features', urgency: 'medium', category: 'growth', rationale: 'Platform stable and timing favorable.' });
    opportunities.push('Optimal timing window — pursue capital raise conversations.');
  } else if (timing.verdict === 'execute') {
    actions.push({ action: 'Execute planned growth activities', urgency: 'medium', category: 'growth', rationale: 'Timing conditions favorable for controlled expansion.' });
  } else if (timing.verdict === 'wait') {
    blocked.push('Capital raise activities');
    blocked.push('New market launches');
  }

  // Growth momentum actions
  if (growth.momentum === 'stalled') {
    actions.push({ action: 'Audit and fix acquisition funnel', urgency: 'critical', category: 'growth', rationale: 'Growth stalled — immediate intervention required.' });
  } else if (growth.momentum === 'slowing') {
    actions.push({ action: 'Optimize conversion funnel', urgency: 'high', category: 'optimization', rationale: 'Growth momentum slowing — prevent stall.' });
  } else if (growth.momentum === 'accelerating') {
    opportunities.push('Growth accelerating — scale acquisition spend for maximum impact.');
  }

  // Decision-based actions
  if (decisions.featureFreezeRecommended) {
    actions.push({ action: 'Enforce feature freeze', urgency: 'critical', category: 'stability', rationale: 'Decision engine recommends freeze — platform at risk.' });
    blocked.push('All new feature development');
  }
  if (decisions.investorReadiness) {
    opportunities.push('Platform investor-demo ready — schedule investor presentations.');
  }
  if (decisions.growthAccelerationSafe) {
    opportunities.push('All systems clear for aggressive listing acquisition.');
  }

  // Always ensure at least one action
  if (actions.length === 0) {
    actions.push({ action: 'Maintain balanced execution cadence', urgency: 'low', category: 'growth', rationale: 'Platform stable — continue steady progress.' });
  }

  return { actions: actions.sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency)), blocked: [...new Set(blocked)], opportunities: [...new Set(opportunities)] };
}

function urgencyRank(u: ActionUrgency): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[u];
}

// ── Weekly Plan Generator ──

function generateWeeklyPlan(
  actions: ExecutionAction[],
  health: HealthReport,
  growth: GrowthTrajectory,
  timing: MarketTimingAssessment
): WeeklyPlan {
  const topPriorities: string[] = [];
  const technicalTasks: string[] = [];
  const growthActions: string[] = [];
  const optimizationTasks: string[] = [];

  // Top 3 priorities from highest urgency actions
  actions.slice(0, 3).forEach(a => topPriorities.push(a.action));
  if (topPriorities.length === 0) topPriorities.push('Maintain current execution velocity.');

  // Technical tasks based on health
  if (health.overallScore < 70) technicalTasks.push('Run performance profiling and fix bottlenecks.');
  if (health.metrics.platformComplexity < 60) technicalTasks.push('Reduce codebase complexity — archive unused modules.');
  technicalTasks.push('Review and update dependency security patches.');
  if (technicalTasks.length < 2) technicalTasks.push('Code review pending PRs and merge stable branches.');

  // Growth actions based on timing and momentum
  if (timing.verdict !== 'wait') growthActions.push('Create and distribute property showcase content.');
  if (growth.metrics.monthlyActiveListings < 20) growthActions.push('Onboard 5+ new property listings this week.');
  if (growth.metrics.qualifiedInquiries < 10) growthActions.push('Launch targeted investor outreach campaign.');
  growthActions.push('Follow up with all active inquiry leads.');
  if (growthActions.length < 2) growthActions.push('Maintain regular social media and content cadence.');

  // Optimization
  if (health.metrics.performanceStability < 70) optimizationTasks.push('Optimize database queries and API response times.');
  optimizationTasks.push('Review analytics dashboards and refine KPI tracking.');
  if (growth.metrics.avgEngagementMinutes < 3) optimizationTasks.push('Improve property detail page engagement and 3D viewer UX.');
  if (optimizationTasks.length < 2) optimizationTasks.push('Audit and clean up unused CSS and components.');

  return { topPriorities, technicalTasks, growthActions, optimizationTasks };
}

// ── Main Computation ──

export function computeExecutionPlan(
  health: HealthReport,
  decisions: DecisionSignals,
  timing: MarketTimingAssessment,
  growth: GrowthTrajectory,
  capital: CapitalNetworkSnapshot
): ExecutionPlan {
  const performanceTrend = health.overallScore >= 70 ? 'improving' as const : health.overallScore >= 50 ? 'stable' as const : 'declining' as const;
  const featureActivation = health.metrics.featureActivation;

  const disciplineRules = evaluateDiscipline(
    health.overallScore,
    featureActivation,
    performanceTrend,
    growth.momentum,
    timing.verdict
  );

  const { actions, blocked, opportunities } = generateActions(health, decisions, timing, growth, capital);
  const weeklyPlan = generateWeeklyPlan(actions, health, growth, timing);

  // Critical alerts
  const criticalAlerts: string[] = [];
  const triggeredBlocks = disciplineRules.filter(r => r.triggered && r.severity === 'block');
  triggeredBlocks.forEach(r => criticalAlerts.push(r.consequence));
  if (health.overallScore < 55) criticalAlerts.push(`⚠ Platform health critical: ${health.overallScore}/100`);
  if (growth.momentum === 'stalled') criticalAlerts.push('⚠ Growth momentum stalled — immediate action required.');
  if (decisions.featureFreezeRecommended) criticalAlerts.push('⚠ Feature freeze recommended by decision engine.');

  // Do not do list
  const doNotDoList = [...blocked];
  if (timing.verdict === 'wait') doNotDoList.push('Initiate fundraising conversations.');
  if (health.overallScore < 65) doNotDoList.push('Add new npm dependencies.');
  if (growth.momentum === 'stalled' || growth.momentum === 'slowing') doNotDoList.push('Expand to new geographic markets.');
  doNotDoList.push('Build speculative features without revenue validation.');

  // This week focus
  let thisWeekFocus = 'Balanced execution — growth and stability in parallel.';
  if (criticalAlerts.length > 0) thisWeekFocus = 'STABILITY FIRST — resolve critical issues before any growth activity.';
  else if (timing.verdict === 'accelerate' && decisions.growthAccelerationSafe) thisWeekFocus = 'GROWTH SPRINT — maximize investor acquisition and listing expansion.';
  else if (timing.verdict === 'execute') thisWeekFocus = 'EXECUTION MODE — proceed with planned expansion activities.';

  const executionFocus = actions.filter(a => a.urgency === 'critical' || a.urgency === 'high').map(a => a.action);
  if (executionFocus.length === 0) executionFocus.push('Steady-state operations — no urgent actions.');

  return {
    priorityActions: actions,
    executionFocus,
    blockedActivities: [...new Set(doNotDoList)],
    growthOpportunities: opportunities,
    doNotDoList: [...new Set(doNotDoList)],
    disciplineRules,
    weeklyPlan,
    criticalAlerts,
    thisWeekFocus,
  };
}
