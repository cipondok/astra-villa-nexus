import { useState } from 'react';

export interface DayTask {
  day: number;
  week: number;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium';
  completed: boolean;
}

export interface WeeklyMilestone {
  week: number;
  title: string;
  kpis: { label: string; target: string }[];
  theme: string;
}

export interface RiskItem {
  risk: string;
  mitigation: string;
  week: number;
  severity: 'high' | 'medium' | 'low';
}

const DAILY_TASKS: Omit<DayTask, 'completed'>[] = [
  // Week 1
  { day: 1, week: 1, title: 'Finalize listing data standards & upload workflow', category: 'Supply', priority: 'critical' },
  { day: 1, week: 1, title: 'Identify top 20 target agents for outreach', category: 'Supply', priority: 'critical' },
  { day: 2, week: 1, title: 'Onboard first 10 verified property listings', category: 'Supply', priority: 'critical' },
  { day: 2, week: 1, title: 'Set up agent onboarding fast-track flow', category: 'Supply', priority: 'high' },
  { day: 3, week: 1, title: 'Launch agent recruitment WhatsApp campaign', category: 'Supply', priority: 'high' },
  { day: 3, week: 1, title: 'Begin vendor outreach for legal & inspection services', category: 'Supply', priority: 'medium' },
  { day: 4, week: 1, title: 'Review listing quality — photos, pricing, descriptions', category: 'Supply', priority: 'critical' },
  { day: 4, week: 1, title: 'Prepare marketing landing pages for launch', category: 'Demand', priority: 'high' },
  { day: 5, week: 1, title: 'Reach 25 verified listings milestone', category: 'Supply', priority: 'critical' },
  { day: 5, week: 1, title: 'Finalize ad creative and campaign targeting', category: 'Demand', priority: 'high' },
  { day: 6, week: 1, title: 'Recruit first 5 agent partners confirmed', category: 'Supply', priority: 'high' },
  { day: 6, week: 1, title: 'Set up deal alert infrastructure for investors', category: 'Tech', priority: 'high' },
  { day: 7, week: 1, title: 'Week 1 review — supply metrics assessment', category: 'Review', priority: 'critical' },
  { day: 7, week: 1, title: 'Refine listing upload process based on feedback', category: 'Ops', priority: 'medium' },

  // Week 2
  { day: 8, week: 2, title: 'Launch Google Ads campaign (property search keywords)', category: 'Demand', priority: 'critical' },
  { day: 8, week: 2, title: 'Begin Instagram/social media content publishing', category: 'Demand', priority: 'high' },
  { day: 9, week: 2, title: 'Start investor lead outreach via email sequences', category: 'Demand', priority: 'critical' },
  { day: 9, week: 2, title: 'Coordinate first property viewing schedules', category: 'Conversion', priority: 'high' },
  { day: 10, week: 2, title: 'Monitor ad performance — adjust targeting', category: 'Demand', priority: 'high' },
  { day: 10, week: 2, title: 'Reach 50 verified listings milestone', category: 'Supply', priority: 'critical' },
  { day: 11, week: 2, title: 'Collect early user feedback on search experience', category: 'Product', priority: 'high' },
  { day: 11, week: 2, title: 'Activate WhatsApp inquiry channel', category: 'Demand', priority: 'medium' },
  { day: 12, week: 2, title: 'Track first 10 qualified investor inquiries', category: 'Demand', priority: 'critical' },
  { day: 12, week: 2, title: 'Begin referral program soft launch', category: 'Growth', priority: 'medium' },
  { day: 13, week: 2, title: 'Complete first 5 property viewings', category: 'Conversion', priority: 'high' },
  { day: 13, week: 2, title: 'Recruit 5 additional agents (10 total target)', category: 'Supply', priority: 'high' },
  { day: 14, week: 2, title: 'Week 2 review — demand metrics & funnel analysis', category: 'Review', priority: 'critical' },
  { day: 14, week: 2, title: 'Optimize landing page based on conversion data', category: 'Product', priority: 'medium' },

  // Week 3
  { day: 15, week: 3, title: 'Deploy negotiation support workflows for active deals', category: 'Conversion', priority: 'critical' },
  { day: 15, week: 3, title: 'Launch AI pricing recommendation for top listings', category: 'Tech', priority: 'high' },
  { day: 16, week: 3, title: 'Track inquiry-to-offer conversion KPIs daily', category: 'Conversion', priority: 'critical' },
  { day: 16, week: 3, title: 'Scale ad budget on best-performing channels', category: 'Demand', priority: 'high' },
  { day: 17, week: 3, title: 'Close first verified transaction', category: 'Conversion', priority: 'critical' },
  { day: 17, week: 3, title: 'Draft first transaction success story content', category: 'Growth', priority: 'high' },
  { day: 18, week: 3, title: 'Reach 75 verified listings milestone', category: 'Supply', priority: 'high' },
  { day: 18, week: 3, title: 'Publish transaction success story on social channels', category: 'Growth', priority: 'high' },
  { day: 19, week: 3, title: 'Implement urgency signals on high-demand listings', category: 'Tech', priority: 'medium' },
  { day: 19, week: 3, title: 'Review agent performance — response time & close rate', category: 'Ops', priority: 'high' },
  { day: 20, week: 3, title: 'Expand vendor network — notary, renovation, insurance', category: 'Supply', priority: 'medium' },
  { day: 20, week: 3, title: 'Activate stalled-deal escalation protocol', category: 'Conversion', priority: 'high' },
  { day: 21, week: 3, title: 'Week 3 review — conversion momentum assessment', category: 'Review', priority: 'critical' },
  { day: 21, week: 3, title: 'Prepare premium listing upsell offer materials', category: 'Revenue', priority: 'high' },

  // Week 4
  { day: 22, week: 4, title: 'Launch premium listing upgrade offers to top agents', category: 'Revenue', priority: 'critical' },
  { day: 22, week: 4, title: 'Activate investor subscription trial (Pro plan)', category: 'Revenue', priority: 'critical' },
  { day: 23, week: 4, title: 'Review campaign ROI — cost per lead, per viewing, per offer', category: 'Growth', priority: 'critical' },
  { day: 23, week: 4, title: 'Reach 100 verified listings milestone', category: 'Supply', priority: 'critical' },
  { day: 24, week: 4, title: 'Close 3+ total verified transactions', category: 'Conversion', priority: 'critical' },
  { day: 24, week: 4, title: 'Track first premium listing revenue', category: 'Revenue', priority: 'high' },
  { day: 25, week: 4, title: 'Run investor retention engagement campaign', category: 'Growth', priority: 'high' },
  { day: 25, week: 4, title: 'Collect agent NPS and improvement feedback', category: 'Product', priority: 'medium' },
  { day: 26, week: 4, title: 'Validate unit economics — CAC vs LTV signals', category: 'Revenue', priority: 'critical' },
  { day: 26, week: 4, title: 'Finalize referral program incentive structure', category: 'Growth', priority: 'high' },
  { day: 27, week: 4, title: 'Prepare Month 2 scaling action plan', category: 'Strategy', priority: 'critical' },
  { day: 27, week: 4, title: 'Document learnings — what worked, what to drop', category: 'Review', priority: 'high' },
  { day: 28, week: 4, title: 'Set Month 2 KPI targets based on validated data', category: 'Strategy', priority: 'critical' },
  { day: 28, week: 4, title: 'Expand to next priority district listings', category: 'Supply', priority: 'high' },
  { day: 29, week: 4, title: 'Launch success validation report', category: 'Review', priority: 'critical' },
  { day: 29, week: 4, title: 'Present launch results to team/stakeholders', category: 'Review', priority: 'high' },
  { day: 30, week: 4, title: 'Execute Month 2 Day 1 action items', category: 'Strategy', priority: 'critical' },
  { day: 30, week: 4, title: 'Celebrate wins and recognize top contributors', category: 'Culture', priority: 'medium' },
];

const WEEKLY_MILESTONES: WeeklyMilestone[] = [
  {
    week: 1, title: 'Supply Activation', theme: 'Build credible inventory foundation',
    kpis: [
      { label: 'Verified listings', target: '25+' },
      { label: 'Agents recruited', target: '5+' },
      { label: 'Vendor partners contacted', target: '10+' },
      { label: 'Landing page live', target: 'Yes' },
    ],
  },
  {
    week: 2, title: 'Demand Generation', theme: 'Attract and qualify first investor cohort',
    kpis: [
      { label: 'Verified listings', target: '50+' },
      { label: 'Qualified inquiries', target: '10+' },
      { label: 'Property viewings completed', target: '5+' },
      { label: 'Ad CTR', target: '>2%' },
    ],
  },
  {
    week: 3, title: 'Conversion Momentum', theme: 'Close first deals and prove demand',
    kpis: [
      { label: 'Verified listings', target: '75+' },
      { label: 'Verified transactions', target: '1+' },
      { label: 'Inquiry-to-offer rate', target: '>15%' },
      { label: 'Success stories published', target: '1+' },
    ],
  },
  {
    week: 4, title: 'Revenue Validation', theme: 'Prove monetization and prepare scaling',
    kpis: [
      { label: 'Verified listings', target: '100+' },
      { label: 'Verified transactions', target: '3+' },
      { label: 'Premium listing revenue', target: '>Rp 0' },
      { label: 'Month 2 plan ready', target: 'Yes' },
    ],
  },
];

const RISKS: RiskItem[] = [
  { risk: 'Insufficient listing quality at launch', mitigation: 'Manual QA review of every listing before publishing', week: 1, severity: 'high' },
  { risk: 'Slow agent recruitment pace', mitigation: 'Offer early-partner visibility incentives and fee waivers', week: 1, severity: 'high' },
  { risk: 'Low ad conversion rates', mitigation: 'A/B test 3+ creatives in first 48h, pause underperformers', week: 2, severity: 'medium' },
  { risk: 'Investor inquiries but no viewings', mitigation: 'Activate viewing coordination assistance and reminders', week: 2, severity: 'high' },
  { risk: 'Deals stalling in negotiation', mitigation: 'Deploy escalation protocol + AI counter-offer suggestions', week: 3, severity: 'high' },
  { risk: 'No transactions by end of Week 3', mitigation: 'Fast-track top 3 deals with founder direct involvement', week: 3, severity: 'high' },
  { risk: 'Premium upsell rejection', mitigation: 'Offer 7-day free trial for premium visibility', week: 4, severity: 'medium' },
  { risk: 'Unit economics unsustainable', mitigation: 'Adjust CAC channels, double down on referral/organic', week: 4, severity: 'medium' },
];

export function useFirst30DaysCalendar() {
  const [tasks, setTasks] = useState<DayTask[]>(
    DAILY_TASKS.map(t => ({ ...t, completed: false }))
  );

  const toggle = (day: number, title: string) => {
    setTasks(prev => prev.map(t =>
      t.day === day && t.title === title ? { ...t, completed: !t.completed } : t
    ));
  };

  const weekProgress = (week: number) => {
    const wt = tasks.filter(t => t.week === week);
    const done = wt.filter(t => t.completed).length;
    return { total: wt.length, done, pct: wt.length > 0 ? Math.round((done / wt.length) * 100) : 0 };
  };

  const overallProgress = {
    total: tasks.length,
    done: tasks.filter(t => t.completed).length,
    pct: Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100),
  };

  return { tasks, toggle, weekProgress, overallProgress, milestones: WEEKLY_MILESTONES, risks: RISKS };
}
