export interface ResilienceRoutine {
  time: string;
  block: string;
  activity: string;
  purpose: string;
  duration: string;
  energyType: 'focus' | 'recovery' | 'strategic' | 'social';
}

export interface StressIndicator {
  signal: string;
  severity: 'warning' | 'danger' | 'critical';
  detection: string;
  intervention: string;
  threshold: string;
}

export interface SustainabilityGuideline {
  domain: string;
  principle: string;
  practices: string[];
  antiPattern: string;
  metric: string;
}

export interface LeadershipPhase {
  phase: number;
  title: string;
  duration: string;
  focus: string;
  capabilities: string[];
  milestone: string;
  riskToManage: string;
}

const DAILY_ROUTINE: ResilienceRoutine[] = [
  { time: '06:00', block: 'Morning Calibration', activity: 'Review 3 priority metrics (revenue, pipeline, liquidity) — no email, no Slack', purpose: 'Anchor attention on highest-impact numbers before reactive inputs arrive', duration: '15 min', energyType: 'strategic' },
  { time: '06:15', block: 'Physical Reset', activity: 'Exercise, walk, or movement — non-negotiable body activation', purpose: 'Cortisol regulation and sustained cognitive performance throughout the day', duration: '30 min', energyType: 'recovery' },
  { time: '07:00', block: 'Deep Work Sprint 1', activity: 'Highest-leverage task: deal closing, investor pitch, or product decision', purpose: 'Execute the single most valuable task while willpower and focus are peak', duration: '90 min', energyType: 'focus' },
  { time: '08:30', block: 'Communication Window', activity: 'Process messages, respond to team, handle urgent escalations', purpose: 'Batch reactive work into a controlled window — prevent all-day interruption', duration: '45 min', energyType: 'social' },
  { time: '09:15', block: 'Deep Work Sprint 2', activity: 'Strategic execution: partnership outreach, automation design, content creation', purpose: 'Second high-value output block before energy naturally dips at midday', duration: '90 min', energyType: 'focus' },
  { time: '10:45', block: 'Recovery Break', activity: 'Step away from screens — hydration, brief walk, breathing exercise', purpose: 'Prevent cognitive fatigue accumulation — micro-recovery preserves afternoon capacity', duration: '15 min', energyType: 'recovery' },
  { time: '11:00', block: 'Meeting & Collaboration', activity: 'Team syncs, agent reviews, vendor coordination — all meetings batched here', purpose: 'Protect deep work blocks by consolidating all synchronous interaction', duration: '120 min', energyType: 'social' },
  { time: '13:00', block: 'Lunch & Mental Reset', activity: 'Full disconnect — eat away from desk, brief rest or mindfulness', purpose: 'Prevent burnout by enforcing a genuine midday cognitive boundary', duration: '60 min', energyType: 'recovery' },
  { time: '14:00', block: 'Deep Work Sprint 3', activity: 'Operational improvements: process optimization, data analysis, system design', purpose: 'Afternoon focus block for important-but-less-urgent strategic building', duration: '90 min', energyType: 'focus' },
  { time: '15:30', block: 'Communication Window 2', activity: 'Follow-ups, deal status checks, team unblocking', purpose: 'Second controlled reactive window — clear outstanding items before EOD', duration: '45 min', energyType: 'social' },
  { time: '16:15', block: 'Day Close Ritual', activity: 'Log 3 wins, identify tomorrow\'s #1 priority, update KPI tracker', purpose: 'Create psychological closure — prevent open loops from disrupting evening recovery', duration: '15 min', energyType: 'strategic' },
  { time: '16:30', block: 'Hard Stop', activity: 'End work — evening is for recovery, relationships, and sustained performance', purpose: 'Long-term sustainability requires genuine daily recovery — non-negotiable boundary', duration: '—', energyType: 'recovery' },
];

const STRESS_INDICATORS: StressIndicator[] = [
  { signal: 'Decision Paralysis', severity: 'warning', detection: 'Delaying decisions >24 hours on routine matters or revisiting already-made choices', intervention: 'Apply 2-minute rule: if reversible, decide now. Use scoring matrix for complex decisions', threshold: '≥3 deferred decisions in one day' },
  { signal: 'Reactive Mode Dominance', severity: 'warning', detection: 'Spending >60% of day responding to messages, fires, and unplanned requests', intervention: 'Enforce communication windows. Delegate Level-1 escalations to team leads', threshold: '<2 hours of deep work achieved per day for 3+ consecutive days' },
  { signal: 'Sleep Quality Decline', severity: 'danger', detection: 'Difficulty falling asleep, waking with work anxiety, or <6 hours consistently', intervention: 'Implement hard stop at 16:30. No screens after 21:00. Journal open loops before bed', threshold: '<6 hours sleep for 5+ days in 2 weeks' },
  { signal: 'Metric Obsession Loop', severity: 'warning', detection: 'Checking dashboards >5x daily without taking new action between checks', intervention: 'Set 2 fixed dashboard review times (morning + EOD). Remove mobile dashboard access', threshold: '>5 dashboard checks/day with no corresponding action items' },
  { signal: 'Isolation Pattern', severity: 'danger', detection: 'Canceling social interactions, avoiding team conversations, working weekends alone', intervention: 'Schedule 1 non-work social interaction per day. Weekly mentor/peer check-in', threshold: '≥3 canceled personal commitments in one week' },
  { signal: 'Physical Stress Signals', severity: 'critical', detection: 'Persistent headaches, jaw clenching, back tension, digestive issues, appetite changes', intervention: 'Immediate: 48h workload reduction. Short-term: adjust schedule. Consider professional support', threshold: 'Any persistent physical symptom lasting >5 days' },
  { signal: 'Cynicism & Detachment', severity: 'critical', detection: 'Loss of enthusiasm for wins, emotional numbness about progress, questioning mission value', intervention: 'Take 3-day complete break. Reconnect with original vision document. Talk to mentor or coach', threshold: 'Feeling indifferent about a major milestone or significant deal closure' },
  { signal: 'Perfectionism Escalation', severity: 'warning', detection: 'Delaying launches for minor improvements, rewriting completed work, micromanaging team output', intervention: 'Apply "80% shipped beats 100% planned" rule. Set hard launch deadlines with accountability partner', threshold: '≥2 launches delayed for non-critical improvements in one month' },
];

const SUSTAINABILITY_GUIDELINES: SustainabilityGuideline[] = [
  { domain: 'Energy Architecture', principle: 'Design days around energy cycles — not just time blocks', practices: ['Schedule highest-leverage work during peak cognitive hours (typically 7-11 AM)', 'Batch all meetings into a single 2-hour window to minimize context-switching cost', 'Take a genuine 60-minute midday break — eating at desk is not recovery', 'Limit deep work to 3 sprints (90 min each) per day — quality over quantity'], antiPattern: 'Working 14-hour days and expecting sustained creativity and decision quality', metric: 'Deep work hours per day (target: 4-5 hours of genuine focused output)' },
  { domain: 'Decision Hygiene', principle: 'Reduce daily decision volume to preserve quality on high-stakes choices', practices: ['Pre-decide recurring choices: meal plans, exercise schedule, meeting templates', 'Use scoring frameworks for business decisions — remove emotional deliberation', 'Delegate all decisions below Rp 10M impact threshold to team leads', 'Set a 2-minute rule: if a decision is reversible, make it immediately'], antiPattern: 'Treating every decision as equally important — decision fatigue kills strategic clarity', metric: 'High-stakes decisions per day (target: ≤3 major decisions requiring founder attention)' },
  { domain: 'Communication Boundaries', principle: 'Control information flow — don\'t let it control you', practices: ['Process messages in 2 batched windows (9:00 and 15:30) — not continuously', 'Disable all non-critical notifications during deep work blocks', 'Use async-first communication — reserve synchronous calls for genuinely urgent matters', 'Set explicit response time expectations with team: 4 hours for normal, 30 min for urgent'], antiPattern: 'Being "always available" — creates dependency and prevents team autonomy development', metric: 'Uninterrupted focus blocks per day (target: ≥3 blocks of 60+ minutes)' },
  { domain: 'Recovery Investment', principle: 'Recovery is not a reward — it\'s the foundation of sustained performance', practices: ['Take 1 full day completely offline per week — no "quick checks"', 'Schedule a 3-day reset every 6-8 weeks during intense scaling phases', 'Maintain one non-work identity: sport, hobby, creative pursuit, community involvement', 'Sleep 7+ hours — no negotiation. Sleep debt compounds faster than revenue'], antiPattern: 'Treating rest as lost productivity — burnout costs 10x more than a weekend off', metric: 'Weekly recovery quality score: sleep hours + offline days + non-work activities' },
  { domain: 'Progress Celebration', principle: 'Acknowledge wins to sustain motivation — don\'t normalize success', practices: ['Log 3 daily wins in the Day Close Ritual — even small progress counts', 'Share weekly milestone updates with team to reinforce collective momentum', 'Set quarterly personal milestones separate from business metrics', 'Review the "wins journal" monthly to counter recency bias toward problems'], antiPattern: 'Moving goalposts immediately after achieving them — creates permanent dissatisfaction', metric: 'Wins logged per week (target: ≥15 acknowledged wins across all categories)' },
];

const LEADERSHIP_ROADMAP: LeadershipPhase[] = [
  { phase: 1, title: 'Survival Discipline', duration: 'Months 1-3', focus: 'Build execution habits that prevent early-stage burnout while maintaining aggressive output', capabilities: ['Establish non-negotiable daily routine with protected deep work blocks', 'Develop decision-speed discipline — 2-minute rule for reversible choices', 'Create personal KPI dashboard limited to 5 core metrics — resist vanity tracking', 'Build first advisory relationship (mentor, coach, or peer founder)'], milestone: 'Consistent 4+ hours deep work daily with zero burnout symptoms', riskToManage: 'Hero complex — trying to do everything personally instead of building systems' },
  { phase: 2, title: 'Delegation Maturity', duration: 'Months 4-6', focus: 'Shift from doing to directing — build team capacity and reduce founder dependency', capabilities: ['Delegate all sub-Rp 10M decisions to empowered team leads', 'Train team on autonomous problem-solving with clear decision frameworks', 'Reduce meeting load to ≤2 hours/day through async-first communication culture', 'Develop strategic thinking time — 2 hours weekly for big-picture planning'], milestone: 'Business operates normally during a 3-day founder absence', riskToManage: 'Control anxiety — trusting team output quality without micromanaging' },
  { phase: 3, title: 'Strategic Leverage', duration: 'Months 7-12', focus: 'Operate as strategic leader rather than operational manager — focus on leverage', capabilities: ['Shift daily work to partnerships, fundraising, and market positioning', 'Build personal advisory board with 3-5 domain experts', 'Develop public presence: speaking, content, thought leadership', 'Create succession depth for all critical operational functions'], milestone: 'Founder time spent: 60% strategic, 30% leadership, 10% operational', riskToManage: 'Relevance anxiety — feeling disconnected from daily operations while team handles execution' },
  { phase: 4, title: 'Legacy Architecture', duration: 'Year 2+', focus: 'Build organizational culture and systems that outlast individual founder energy', capabilities: ['Institutionalize decision frameworks so the organization thinks strategically without you', 'Develop next-generation leaders who can independently drive growth initiatives', 'Balance ambition with sustainability — design a career pace you can maintain for 10+ years', 'Create impact beyond the company: mentorship, ecosystem contribution, knowledge sharing'], milestone: 'Organization achieves growth targets for a full quarter with minimal founder intervention', riskToManage: 'Identity fusion — separating personal worth from company performance metrics' },
];

export function useFounderResilienceSystem() {
  const energyTypeLabels: Record<string, string> = {
    focus: 'Deep Focus',
    recovery: 'Recovery',
    strategic: 'Strategic',
    social: 'Social/Collaborative',
  };

  return {
    dailyRoutine: DAILY_ROUTINE,
    stressIndicators: STRESS_INDICATORS,
    sustainabilityGuidelines: SUSTAINABILITY_GUIDELINES,
    leadershipRoadmap: LEADERSHIP_ROADMAP,
    energyTypeLabels,
  };
}
