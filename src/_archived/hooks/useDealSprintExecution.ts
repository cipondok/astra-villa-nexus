import { useState, useCallback } from 'react';

export interface SprintTask {
  id: string;
  phase: number;
  day: string;
  task: string;
  category: 'pipeline' | 'viewing' | 'negotiation' | 'closing';
  done: boolean;
}

export interface DealKPI {
  label: string;
  daily: string;
  weekly: string;
  sprint: string;
  formula: string;
}

export interface EscalationRule {
  trigger: string;
  severity: 'critical' | 'high' | 'medium';
  response: string;
  owner: string;
  sla: string;
}

export interface TrustMilestone {
  deals: number;
  label: string;
  signal: string;
  action: string;
  unlocks: string;
}

const PHASES = [
  { id: 1, title: 'Pipeline Density Creation', target: 'Deals 1–20', days: 'Day 1–8', color: 'blue' },
  { id: 2, title: 'Viewing Conversion Push', target: 'Deals 21–45', days: 'Day 9–16', color: 'amber' },
  { id: 3, title: 'Negotiation Acceleration', target: 'Deals 46–70', days: 'Day 17–24', color: 'emerald' },
  { id: 4, title: 'Closing Momentum Amplification', target: 'Deals 71–90', days: 'Day 25–30', color: 'purple' },
];

const SPRINT_TASKS: Omit<SprintTask, 'done'>[] = [
  // Phase 1
  { id: 'p1-1', phase: 1, day: 'Day 1-2', task: 'Audit active listings — rank top 50 by liquidity score & price competitiveness', category: 'pipeline' },
  { id: 'p1-2', phase: 1, day: 'Day 1-2', task: 'Identify 30 highest-intent buyers from inquiry data (BIS > 60)', category: 'pipeline' },
  { id: 'p1-3', phase: 1, day: 'Day 3-4', task: 'Assign top 5 agents to high-value pipeline deals (>Rp 3B)', category: 'pipeline' },
  { id: 'p1-4', phase: 1, day: 'Day 3-4', task: 'Launch buyer-property matching campaign — send curated deal alerts', category: 'pipeline' },
  { id: 'p1-5', phase: 1, day: 'Day 5-6', task: 'Onboard 20 new verified listings from developer partnerships', category: 'pipeline' },
  { id: 'p1-6', phase: 1, day: 'Day 5-6', task: 'Activate seller motivation outreach — target listings >30 days on market', category: 'pipeline' },
  { id: 'p1-7', phase: 1, day: 'Day 7-8', task: 'Review pipeline health — ensure ≥40 active qualified leads', category: 'pipeline' },
  { id: 'p1-8', phase: 1, day: 'Day 7-8', task: 'Close first 5 deals — validate commission collection workflow', category: 'pipeline' },

  // Phase 2
  { id: 'p2-1', phase: 2, day: 'Day 9-10', task: 'Schedule 15+ clustered viewings per day in high-demand districts', category: 'viewing' },
  { id: 'p2-2', phase: 2, day: 'Day 9-10', task: 'Deploy urgency messaging — "X investors viewed this week" alerts', category: 'viewing' },
  { id: 'p2-3', phase: 2, day: 'Day 11-12', task: 'Capture post-viewing intent within 2 hours — structured feedback form', category: 'viewing' },
  { id: 'p2-4', phase: 2, day: 'Day 11-12', task: 'Convert 40% of viewings to formal offers — agent coaching push', category: 'viewing' },
  { id: 'p2-5', phase: 2, day: 'Day 13-14', task: 'Activate "second viewing" fast-track for serious buyers', category: 'viewing' },
  { id: 'p2-6', phase: 2, day: 'Day 13-14', task: 'Publish 5 viewing success stories on social channels', category: 'viewing' },
  { id: 'p2-7', phase: 2, day: 'Day 15-16', task: 'Hit 25 cumulative deal milestone — celebrate team win publicly', category: 'viewing' },
  { id: 'p2-8', phase: 2, day: 'Day 15-16', task: 'Identify and rescue 10 stalled viewing-to-offer conversions', category: 'viewing' },

  // Phase 3
  { id: 'p3-1', phase: 3, day: 'Day 17-18', task: 'Deploy AI offer range guidance for all active negotiations', category: 'negotiation' },
  { id: 'p3-2', phase: 3, day: 'Day 17-18', task: 'Monitor price gap reduction — target ≤8% gap by round 2', category: 'negotiation' },
  { id: 'p3-3', phase: 3, day: 'Day 19-20', task: 'Remove documentation bottlenecks — pre-prepare closing packages', category: 'negotiation' },
  { id: 'p3-4', phase: 3, day: 'Day 19-20', task: 'Activate bank partnership fast-track for financing-dependent deals', category: 'negotiation' },
  { id: 'p3-5', phase: 3, day: 'Day 21-22', task: 'Escalate all deals stalled >48 hours — founder intervention protocol', category: 'negotiation' },
  { id: 'p3-6', phase: 3, day: 'Day 21-22', task: 'Launch counter-offer coaching for agents — reduce negotiation rounds to ≤3', category: 'negotiation' },
  { id: 'p3-7', phase: 3, day: 'Day 23-24', task: 'Hit 50 cumulative deals — trigger investor confidence press release', category: 'negotiation' },
  { id: 'p3-8', phase: 3, day: 'Day 23-24', task: 'Review negotiation win rates by agent — redistribute pipeline to top closers', category: 'negotiation' },

  // Phase 4
  { id: 'p4-1', phase: 4, day: 'Day 25-26', task: 'Publish 10 completed deal case studies with ROI data', category: 'closing' },
  { id: 'p4-2', phase: 4, day: 'Day 25-26', task: 'Activate post-close referral request — target 20% referral rate', category: 'closing' },
  { id: 'p4-3', phase: 4, day: 'Day 27-28', task: 'Reinforce seller confidence — share market position data to fence-sitters', category: 'closing' },
  { id: 'p4-4', phase: 4, day: 'Day 27-28', task: 'Launch "Deal of the Week" social proof campaign', category: 'closing' },
  { id: 'p4-5', phase: 4, day: 'Day 29', task: 'Final push — personally close remaining pipeline deals', category: 'closing' },
  { id: 'p4-6', phase: 4, day: 'Day 29', task: 'Verify all 90 transactions documented with commission records', category: 'closing' },
  { id: 'p4-7', phase: 4, day: 'Day 30', task: 'Sprint retrospective — document lessons, agent performance, and channel effectiveness', category: 'closing' },
  { id: 'p4-8', phase: 4, day: 'Day 30', task: 'Plan next 90-deal sprint with optimized playbook', category: 'closing' },
];

const DEAL_KPIS: DealKPI[] = [
  { label: 'Deals Closed', daily: '3', weekly: '15-20', sprint: '90', formula: 'Count of transactions reaching "Closed" status' },
  { label: 'Pipeline Value', daily: 'Monitor', weekly: '≥Rp 500M', sprint: '≥Rp 2B cumulative', formula: 'Sum of expected commission from active deals' },
  { label: 'Viewing-to-Offer Rate', daily: 'Track', weekly: '≥40%', sprint: '≥45%', formula: 'Offers submitted ÷ Viewings completed × 100' },
  { label: 'Offer-to-Close Rate', daily: 'Track', weekly: '≥55%', sprint: '≥60%', formula: 'Deals closed ÷ Offers submitted × 100' },
  { label: 'Avg Negotiation Rounds', daily: 'Track', weekly: '≤3', sprint: '≤2.5', formula: 'Total counter-offer exchanges ÷ Deals closed' },
  { label: 'Time-to-Close', daily: 'Track', weekly: '≤28 days', sprint: '≤25 days', formula: 'Avg days from first offer to closing completion' },
  { label: 'Agent Response SLA', daily: '<2h', weekly: '95% compliance', sprint: '97%', formula: 'Responses within SLA ÷ Total inquiries × 100' },
  { label: 'Stalled Deals', daily: '0 new', weekly: '≤5 active', sprint: '≤3 unresolved', formula: 'Deals with no stage movement >48 hours' },
  { label: 'Commission Revenue', daily: 'Rp 40M+', weekly: 'Rp 200M+', sprint: 'Rp 900M+', formula: 'Sum of all collected commission from closed deals' },
  { label: 'Referral Deals', daily: 'Track', weekly: '≥3', sprint: '≥15', formula: 'Deals originated from post-close referral introductions' },
];

const ESCALATION_RULES: EscalationRule[] = [
  { trigger: 'Deal stalled >48 hours at any stage', severity: 'critical', response: 'Founder calls buyer AND seller within 4 hours — identify blocker and propose resolution', owner: 'Founder', sla: '4 hours' },
  { trigger: 'Agent response time >4 hours', severity: 'critical', response: 'Reassign deal to backup agent immediately — notify original agent of SLA breach', owner: 'Sales Lead', sla: '1 hour' },
  { trigger: 'Price gap >15% after round 2', severity: 'high', response: 'Deploy AI pricing data to both parties — present comparable transaction evidence', owner: 'Senior Agent', sla: '6 hours' },
  { trigger: 'Financing approval delayed >5 days', severity: 'high', response: 'Escalate to bank partnership manager — request expedited processing', owner: 'Finance Ops', sla: '12 hours' },
  { trigger: 'Buyer requests 2nd price reduction', severity: 'high', response: 'Reframe negotiation — present value-add package instead of price concession', owner: 'Agent', sla: '24 hours' },
  { trigger: 'Documentation incomplete after 3 days', severity: 'medium', response: 'Ops team contacts notary + legal to expedite — provide checklist to client', owner: 'Ops Team', sla: '24 hours' },
  { trigger: 'Viewing no-show rate >20%', severity: 'medium', response: 'Implement 24h confirmation protocol + deposit for premium viewings', owner: 'Scheduling', sla: '48 hours' },
  { trigger: 'Weekly deal target missed by >30%', severity: 'critical', response: 'Emergency sprint standup — reallocate resources, extend working hours, activate backup pipeline', owner: 'Founder', sla: '2 hours' },
];

const TRUST_MILESTONES: TrustMilestone[] = [
  { deals: 10, label: 'Early Traction Signal', signal: 'First verified transaction cluster proves marketplace viability', action: 'Publish "10 Deals Closed" announcement on all channels', unlocks: 'Agent recruitment credibility + initial seller trust' },
  { deals: 25, label: 'Consistency Proof', signal: 'Sustained closing velocity demonstrates operational capability', action: 'Launch case study series featuring 5 best deal outcomes', unlocks: 'Developer partnership conversations + investor interest signals' },
  { deals: 50, label: 'Market Credibility Threshold', signal: 'Half-century milestone establishes ASTRA as serious market player', action: 'Issue press release + investor update with transaction metrics', unlocks: 'Premium pricing confidence + institutional inquiry trigger' },
  { deals: 75, label: 'Network Effect Activation', signal: 'Referral-driven deals begin compounding — organic growth visible', action: 'Highlight referral success stories + amplify social proof', unlocks: 'Reduced CAC through organic acquisition + brand authority' },
  { deals: 90, label: 'Sprint Completion Victory', signal: 'Target achieved — operational playbook validated at scale', action: 'Team celebration + sprint retrospective + next-sprint planning', unlocks: 'Series-A readiness signal + scaling confidence for city expansion' },
];

export function useDealSprintExecution() {
  const [tasks, setTasks] = useState<SprintTask[]>(
    SPRINT_TASKS.map(t => ({ ...t, done: false }))
  );

  const toggle = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const phaseProgress = useCallback((phase: number) => {
    const items = tasks.filter(t => t.phase === phase);
    if (!items.length) return 0;
    return Math.round((items.filter(t => t.done).length / items.length) * 100);
  }, [tasks]);

  const overallProgress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  return {
    tasks,
    toggle,
    phases: PHASES,
    phaseProgress,
    overallProgress,
    dealKPIs: DEAL_KPIS,
    escalationRules: ESCALATION_RULES,
    trustMilestones: TRUST_MILESTONES,
  };
}
