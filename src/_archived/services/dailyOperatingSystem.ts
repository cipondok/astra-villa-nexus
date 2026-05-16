/**
 * Daily Operating System Engine
 * Structures founder daily routine and weekly growth targets.
 */

import type { HealthReport } from '@/services/systemHealthEngine';
import type { ExecutionPlan } from '@/services/executionIntelligenceEngine';
import type { GrowthTrajectory } from '@/services/growthTrajectoryEngine';

// ── Daily Routine ──

export type RoutinePhase = 'morning' | 'midday' | 'evening';
export type CheckItemStatus = 'pending' | 'done' | 'flagged';

export interface CheckItem {
  id: string;
  label: string;
  timeMinutes: number;
  status: CheckItemStatus;
  redFlag?: string; // shown when condition is bad
}

export interface RoutineBlock {
  phase: RoutinePhase;
  title: string;
  timeRange: string;
  totalMinutes: number;
  items: CheckItem[];
}

export function generateDailyRoutine(
  health: HealthReport,
  plan: ExecutionPlan,
  growth: GrowthTrajectory
): RoutineBlock[] {
  const healthBad = health.overallScore < 60;
  const growthStalled = growth.momentum === 'stalled';
  const hasCritical = plan.criticalAlerts.length > 0;

  return [
    {
      phase: 'morning',
      title: '🌅 Morning System Check',
      timeRange: '08:00 – 09:00',
      totalMinutes: 45,
      items: [
        { id: 'm1', label: 'Review platform health score', timeMinutes: 5, status: 'pending', redFlag: healthBad ? `Health at ${health.overallScore}/100 — investigate immediately` : undefined },
        { id: 'm2', label: 'Check critical alerts & error logs', timeMinutes: 10, status: 'pending', redFlag: hasCritical ? `${plan.criticalAlerts.length} critical alerts pending` : undefined },
        { id: 'm3', label: 'Review new inquiries & investor activity', timeMinutes: 10, status: 'pending' },
        { id: 'm4', label: 'Check listing pipeline status', timeMinutes: 5, status: 'pending' },
        { id: 'm5', label: 'Confirm top 3 daily priorities', timeMinutes: 10, status: 'pending' },
        { id: 'm6', label: 'Review blocked activities list', timeMinutes: 5, status: 'pending', redFlag: plan.blockedActivities.length > 3 ? 'Multiple activities blocked — stability focus required' : undefined },
      ],
    },
    {
      phase: 'midday',
      title: '⚡ Midday Decision Block',
      timeRange: '12:00 – 13:00',
      totalMinutes: 45,
      items: [
        { id: 'd1', label: 'Review AI development suggestions', timeMinutes: 10, status: 'pending' },
        { id: 'd2', label: 'Approve/reject feature requests (3-gate check)', timeMinutes: 10, status: 'pending' },
        { id: 'd3', label: 'Check growth momentum & conversion metrics', timeMinutes: 10, status: 'pending', redFlag: growthStalled ? 'Growth stalled — pivot acquisition strategy' : undefined },
        { id: 'd4', label: 'Review investor outreach pipeline', timeMinutes: 10, status: 'pending' },
        { id: 'd5', label: 'Validate no discipline rules breached', timeMinutes: 5, status: 'pending' },
      ],
    },
    {
      phase: 'evening',
      title: '🌙 Evening Review',
      timeRange: '18:00 – 18:30',
      totalMinutes: 30,
      items: [
        { id: 'e1', label: 'Review daily execution completion', timeMinutes: 5, status: 'pending' },
        { id: 'e2', label: 'Check growth signals & market timing', timeMinutes: 10, status: 'pending' },
        { id: 'e3', label: 'Log key decisions & reflections', timeMinutes: 10, status: 'pending' },
        { id: 'e4', label: 'Set tomorrow\'s focus intent', timeMinutes: 5, status: 'pending' },
      ],
    },
  ];
}

// ── Decision Rules ──

export interface DecisionRule {
  condition: string;
  action: 'approve' | 'reject' | 'defer';
  rationale: string;
}

export function getDecisionRules(health: HealthReport, growth: GrowthTrajectory): DecisionRule[] {
  const rules: DecisionRule[] = [
    { condition: 'New feature request', action: health.overallScore >= 65 ? 'approve' : 'reject', rationale: health.overallScore >= 65 ? 'Health stable — proceed with caution' : 'Health below threshold — stabilize first' },
    { condition: 'Investor campaign launch', action: growth.momentum !== 'stalled' ? 'approve' : 'defer', rationale: growth.momentum !== 'stalled' ? 'Growth active — campaign timing acceptable' : 'Growth stalled — fix fundamentals before spending' },
    { condition: 'New market expansion', action: health.overallScore >= 75 && growth.score >= 40 ? 'approve' : 'defer', rationale: health.overallScore >= 75 ? 'Platform ready for expansion' : 'Platform not ready — consolidate current market' },
    { condition: 'Add new dependency', action: health.overallScore >= 70 ? 'approve' : 'reject', rationale: 'Dependencies increase complexity — only when platform is healthy' },
    { condition: 'UI/UX redesign', action: growth.momentum === 'accelerating' ? 'defer' : 'approve', rationale: growth.momentum === 'accelerating' ? 'Don\'t disrupt momentum with redesigns' : 'Acceptable during steady/slow growth periods' },
  ];
  return rules;
}

// ── Weekly Growth Targets ──

export interface WeeklyTarget {
  metric: string;
  current: number;
  target: number;
  unit: string;
  progress: number; // 0-100
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}

export interface WeeklyGrowthReport {
  weekLabel: string;
  overallScore: number; // 0-100
  verdict: 'excellent' | 'good' | 'needs_work' | 'failing';
  targets: WeeklyTarget[];
}

export function computeWeeklyTargets(
  health: HealthReport,
  growth: GrowthTrajectory
): WeeklyGrowthReport {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekLabel = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const targets: WeeklyTarget[] = [
    {
      metric: 'Active Listings',
      current: growth.metrics.monthlyActiveListings,
      target: Math.max(growth.metrics.monthlyActiveListings + 3, 10),
      unit: 'listings',
      progress: 0, status: 'on_track',
    },
    {
      metric: 'Qualified Inquiries',
      current: growth.metrics.qualifiedInquiries,
      target: Math.max(growth.metrics.qualifiedInquiries + 5, 10),
      unit: 'inquiries',
      progress: 0, status: 'on_track',
    },
    {
      metric: 'Deal Velocity',
      current: growth.metrics.dealConversionVelocityDays,
      target: Math.max(Math.floor(growth.metrics.dealConversionVelocityDays * 0.9), 3),
      unit: 'days (lower is better)',
      progress: 0, status: 'on_track',
    },
    {
      metric: 'Platform Health',
      current: health.overallScore,
      target: Math.max(health.overallScore + 3, 70),
      unit: 'score',
      progress: 0, status: 'on_track',
    },
    {
      metric: 'Avg Engagement',
      current: Math.round(growth.metrics.avgEngagementMinutes * 10) / 10,
      target: Math.max(Math.round((growth.metrics.avgEngagementMinutes + 0.5) * 10) / 10, 3),
      unit: 'minutes',
      progress: 0, status: 'on_track',
    },
  ];

  // Calculate progress for each target
  targets.forEach(t => {
    if (t.metric === 'Deal Velocity') {
      // Lower is better for velocity
      t.progress = t.target > 0 ? Math.min(Math.round((t.target / Math.max(t.current, 1)) * 100), 100) : 0;
    } else {
      t.progress = t.target > 0 ? Math.min(Math.round((t.current / t.target) * 100), 100) : 0;
    }
    if (t.progress >= 100) t.status = 'achieved';
    else if (t.progress >= 70) t.status = 'on_track';
    else if (t.progress >= 40) t.status = 'at_risk';
    else t.status = 'behind';
  });

  const overallScore = Math.round(targets.reduce((s, t) => s + t.progress, 0) / targets.length);
  let verdict: WeeklyGrowthReport['verdict'] = 'needs_work';
  if (overallScore >= 85) verdict = 'excellent';
  else if (overallScore >= 65) verdict = 'good';
  else if (overallScore < 40) verdict = 'failing';

  return { weekLabel, overallScore, verdict, targets };
}
