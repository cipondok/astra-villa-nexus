export interface DecisionCriterion {
  id: string;
  name: string;
  weight: number;
  question: string;
  scoringGuide: { low: string; mid: string; high: string };
}

export interface DecisionTier {
  score: string;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
  action: string;
  timeframe: string;
  founderInvolvement: string;
}

export interface RiskRewardProfile {
  archetype: string;
  riskLevel: string;
  rewardPotential: string;
  decision: string;
  example: string;
}

export interface DailyRitual {
  time: string;
  activity: string;
  duration: string;
  output: string;
}

export interface ExecutionChecklist {
  phase: string;
  items: string[];
}

export interface ClarityPhase {
  phase: number;
  title: string;
  duration: string;
  focus: string;
  practices: string[];
  successMetric: string;
}

const CRITERIA: DecisionCriterion[] = [
  { id: 'c1', name: 'Revenue Impact Potential', weight: 30, question: 'Will this decision directly increase revenue within 30 days?', scoringGuide: { low: 'No measurable revenue impact — purely operational or exploratory', mid: 'Indirect revenue contribution — enables future monetization or reduces friction', high: 'Direct revenue generation — accelerates deal closings, activates new revenue stream, or increases ARPU' } },
  { id: 'c2', name: 'Liquidity Growth Contribution', weight: 25, question: 'Does this increase marketplace transaction velocity or listing density?', scoringGuide: { low: 'No effect on supply/demand dynamics or transaction flow', mid: 'Moderate impact — improves one side of marketplace (supply OR demand)', high: 'Strong flywheel activation — increases both supply density and buyer engagement simultaneously' } },
  { id: 'c3', name: 'Execution Feasibility', weight: 25, question: 'Can the team execute this within 7 days with current resources?', scoringGuide: { low: 'Requires new hires, external dependencies, or >30 days to implement', mid: 'Achievable in 14-21 days with some resource reallocation', high: 'Executable within 7 days using existing team and infrastructure' } },
  { id: 'c4', name: 'Strategic Alignment', weight: 20, question: 'Does this strengthen long-term competitive moat and platform positioning?', scoringGuide: { low: 'One-time tactical gain with no lasting strategic value', mid: 'Builds incremental capability that supports future growth', high: 'Deepens data moat, network effects, or brand authority — compounding advantage' } },
];

const TIERS: DecisionTier[] = [
  { score: '85-100', label: 'Execute Immediately', color: 'emerald', action: 'Deploy within 24-48 hours — allocate best resources and founder attention', timeframe: '24-48 hours', founderInvolvement: 'Direct ownership — daily check-in until completion' },
  { score: '65-84', label: 'Schedule This Week', color: 'blue', action: 'Plan execution within current sprint — assign clear owner and deadline', timeframe: '3-7 days', founderInvolvement: 'Delegate with milestone review — check progress at daily standup' },
  { score: '40-64', label: 'Queue for Review', color: 'amber', action: 'Add to backlog for next planning cycle — gather more data before committing', timeframe: '1-3 weeks', founderInvolvement: 'Light oversight — review during weekly strategic reflection' },
  { score: '0-39', label: 'Decline or Defer', color: 'red', action: 'Say no or park indefinitely — protect focus from low-impact distractions', timeframe: 'Not scheduled', founderInvolvement: 'None — document reasoning and move on' },
];

const RISK_PROFILES: RiskRewardProfile[] = [
  { archetype: 'High Reward / Low Risk', riskLevel: 'Minimal downside — worst case is wasted effort', rewardPotential: 'Significant upside — direct revenue or liquidity acceleration', decision: 'ALWAYS EXECUTE — these are the golden opportunities that build momentum', example: 'Activating premium listing upsells to high-traffic sellers already on platform' },
  { archetype: 'High Reward / High Risk', riskLevel: 'Material resource commitment or reputation exposure', rewardPotential: 'Transformative impact — could unlock new revenue tier or market position', decision: 'EXECUTE WITH GUARDRAILS — set kill criteria and review checkpoints at 25% and 50% completion', example: 'Launching investor subscription tier with 14-day free trial and aggressive pricing' },
  { archetype: 'Low Reward / Low Risk', riskLevel: 'Negligible downside — minimal resource requirement', rewardPotential: 'Incremental improvement — small efficiency or experience gains', decision: 'DELEGATE OR AUTOMATE — do not spend founder time on these', example: 'Optimizing email template formatting or minor UI polish iterations' },
  { archetype: 'Low Reward / High Risk', riskLevel: 'Significant resource drain or strategic distraction', rewardPotential: 'Marginal improvement that does not move key metrics', decision: 'ALWAYS DECLINE — these are the traps that destroy startup velocity', example: 'Building complex enterprise features before achieving product-market fit' },
];

const DAILY_RITUAL: DailyRitual[] = [
  { time: '07:00', activity: 'Revenue & Pipeline Scan', duration: '10 min', output: 'Identify top 3 revenue-impacting decisions for the day' },
  { time: '07:15', activity: 'Decision Scoring Session', duration: '15 min', output: 'Score each pending decision using 4-criteria matrix — classify tier' },
  { time: '07:30', activity: 'Execute-or-Kill Commitment', duration: '5 min', output: 'Commit to max 2 "Execute Immediately" decisions — decline everything else' },
  { time: '12:00', activity: 'Mid-Day Progress Pulse', duration: '5 min', output: 'Verify morning decisions are on track — escalate blockers immediately' },
  { time: '18:00', activity: 'Decision Outcome Review', duration: '10 min', output: 'Assess results of today\'s decisions — log learnings for pattern recognition' },
  { time: 'Weekly (Friday)', activity: 'Strategic Decision Audit', duration: '30 min', output: 'Review week\'s decisions against revenue/liquidity KPIs — recalibrate scoring weights if needed' },
];

const CHECKLISTS: ExecutionChecklist[] = [
  { phase: 'Before Deciding', items: ['Score against 4 criteria (Revenue, Liquidity, Feasibility, Strategic)', 'Classify into decision tier (Execute / Schedule / Queue / Decline)', 'Identify risk-reward archetype and apply corresponding protocol', 'Estimate time-to-impact and resource requirement', 'Check: does this conflict with any current Execute Immediately priority?'] },
  { phase: 'During Execution', items: ['Assign single clear owner with explicit deadline', 'Define measurable success metric before starting', 'Set kill criteria — what conditions would make you stop?', 'Schedule first checkpoint at 25% completion', 'Remove all blockers within first 2 hours of commitment'] },
  { phase: 'After Completion', items: ['Measure actual outcome against projected impact', 'Log decision quality score (Was the tier classification correct?)', 'Extract one reusable insight for future similar decisions', 'Update scoring calibration if prediction was significantly off', 'Share outcome with team to build organizational decision muscle'] },
];

const CLARITY_ROADMAP: ClarityPhase[] = [
  { phase: 1, title: 'Decision Discipline Installation', duration: 'Weeks 1-2', focus: 'Build the habit of structured scoring before every significant decision', practices: ['Use 4-criteria scoring matrix for every decision taking >30 minutes of thought', 'Implement strict 2-decision daily limit for Execute Immediately tier', 'Practice 5-minute "decline or defer" ritual for all sub-40 score items', 'Log every decision with predicted vs actual outcome for calibration data'], successMetric: '100% of significant decisions scored before execution commitment' },
  { phase: 2, title: 'Pattern Recognition Acceleration', duration: 'Weeks 3-4', focus: 'Develop intuition shortcuts by analyzing decision outcome patterns', practices: ['Review 2-week decision log — identify which criteria most accurately predicted success', 'Adjust criteria weights based on actual correlation with revenue/liquidity outcomes', 'Build personal "decision shortcut" library for recurring decision types', 'Reduce average decision time from 30 min to 10 min through pattern matching'], successMetric: 'Decision-to-action cycle time reduced by 50%' },
  { phase: 3, title: 'Delegation Architecture', duration: 'Weeks 5-8', focus: 'Systematize decision delegation to free founder bandwidth for strategic-only decisions', practices: ['Define clear decision authority matrix — which decisions require founder, which don\'t', 'Train team leads on 4-criteria scoring for their domain decisions', 'Implement async decision approval for Schedule tier items', 'Reserve founder decision energy exclusively for >Rp 100M impact decisions'], successMetric: 'Founder personally makes ≤5 decisions per day (down from 15+)' },
  { phase: 4, title: 'Strategic Clarity Compounding', duration: 'Months 3-6', focus: 'Transform decision framework into organizational operating system', practices: ['Quarterly decision quality audit — measure prediction accuracy trend', 'Evolve scoring criteria as business matures (add new signals, retire obsolete ones)', 'Build decision case study library for team training and onboarding', 'Integrate decision scoring with company OKR and revenue planning cycles'], successMetric: 'Organization-wide decision quality score ≥80% accuracy' },
];

export function useFounderFastDecision() {
  const totalWeight = CRITERIA.reduce((s, c) => s + c.weight, 0);
  return {
    criteria: CRITERIA,
    tiers: TIERS,
    riskProfiles: RISK_PROFILES,
    dailyRitual: DAILY_RITUAL,
    checklists: CHECKLISTS,
    clarityRoadmap: CLARITY_ROADMAP,
    totalWeight,
  };
}
