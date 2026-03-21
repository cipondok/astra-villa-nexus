import { useState } from 'react';

export interface TimeBlock {
  time: string;
  activity: string;
  category: 'deep-work' | 'operations' | 'strategy' | 'recovery' | 'growth';
  duration: number;
  energy: 'peak' | 'sustained' | 'recovery';
  description: string;
}

export interface PriorityItem {
  action: string;
  revenueImpact: number;
  effort: number;
  urgency: number;
  compositeScore: number;
  quadrant: 'do-first' | 'schedule' | 'delegate' | 'eliminate';
  category: string;
}

export interface SustainabilityRule {
  principle: string;
  description: string;
  frequency: string;
  indicator: string;
  status: 'healthy' | 'caution' | 'burnout-risk';
}

export interface LeadershipPhase {
  phase: string;
  timeline: string;
  focus: string;
  skills: string[];
  milestones: string[];
  mindset: string;
  status: 'active' | 'upcoming' | 'future';
}

export interface WeeklyRhythm {
  day: string;
  theme: string;
  blocks: { time: string; task: string; type: string }[];
}

export interface FounderPersonalOSData {
  dailyRoutine: TimeBlock[];
  priorityMatrix: PriorityItem[];
  sustainabilityRules: SustainabilityRule[];
  leadershipRoadmap: LeadershipPhase[];
  weeklyRhythm: WeeklyRhythm[];
  osMetrics: { label: string; value: string; status: 'green' | 'yellow' | 'red' }[];
}

export function useFounderPersonalOS(): FounderPersonalOSData {
  const dailyRoutine: TimeBlock[] = [
    { time: '05:30', activity: 'Morning Clarity Ritual', category: 'recovery', duration: 30, energy: 'recovery', description: 'Meditation, journaling, intention-setting for the day' },
    { time: '06:00', activity: 'Physical Energy Activation', category: 'recovery', duration: 45, energy: 'recovery', description: 'Exercise, cold exposure, or movement — non-negotiable energy foundation' },
    { time: '06:45', activity: 'Strategic Input Block', category: 'growth', duration: 30, energy: 'sustained', description: 'Read industry reports, competitor signals, market intelligence updates' },
    { time: '07:15', activity: 'Revenue Priority Deep Work', category: 'deep-work', duration: 120, energy: 'peak', description: 'Top 1-2 revenue-impact tasks — deal acceleration, partnership closing, product decisions' },
    { time: '09:15', activity: 'Operations Pulse Check', category: 'operations', duration: 30, energy: 'sustained', description: 'Review KPI dashboard, pipeline health, team blockers — max 30 min' },
    { time: '09:45', activity: 'High-Impact Meetings', category: 'operations', duration: 90, energy: 'sustained', description: 'Investor calls, partner negotiations, key team alignment — batch all meetings here' },
    { time: '11:15', activity: 'Decision Clearance Block', category: 'strategy', duration: 45, energy: 'sustained', description: 'Clear pending decisions using priority matrix — no new inputs' },
    { time: '12:00', activity: 'Recovery & Nutrition', category: 'recovery', duration: 60, energy: 'recovery', description: 'Proper lunch, brief walk, mental reset — protect this boundary' },
    { time: '13:00', activity: 'Execution Sprint 2', category: 'deep-work', duration: 120, energy: 'peak', description: 'Product development, strategic writing, financial modeling — creative output window' },
    { time: '15:00', activity: 'Team Development & Coaching', category: 'growth', duration: 60, energy: 'sustained', description: '1:1s, mentoring, culture reinforcement — invest in team leverage' },
    { time: '16:00', activity: 'Relationship Building', category: 'growth', duration: 60, energy: 'sustained', description: 'Networking, advisor conversations, ecosystem engagement' },
    { time: '17:00', activity: 'Daily Closeout Review', category: 'strategy', duration: 30, energy: 'recovery', description: 'Review wins, capture learnings, set tomorrow\'s top 3 priorities' },
    { time: '17:30', activity: 'Transition to Personal Life', category: 'recovery', duration: 30, energy: 'recovery', description: 'Complete shutdown ritual — no work communications after this point' },
  ];

  const priorityMatrix: PriorityItem[] = [
    { action: 'Close pending high-value property deals', revenueImpact: 95, effort: 40, urgency: 90, compositeScore: 92, quadrant: 'do-first', category: 'Revenue' },
    { action: 'Negotiate developer partnership MOUs', revenueImpact: 85, effort: 50, urgency: 75, compositeScore: 82, quadrant: 'do-first', category: 'Growth' },
    { action: 'Review and approve marketing campaigns', revenueImpact: 60, effort: 20, urgency: 65, compositeScore: 58, quadrant: 'schedule', category: 'Marketing' },
    { action: 'Investor pitch deck refinement', revenueImpact: 80, effort: 60, urgency: 50, compositeScore: 68, quadrant: 'schedule', category: 'Fundraising' },
    { action: 'Agent performance review sessions', revenueImpact: 50, effort: 30, urgency: 40, compositeScore: 42, quadrant: 'delegate', category: 'Operations' },
    { action: 'Vendor onboarding coordination', revenueImpact: 35, effort: 25, urgency: 35, compositeScore: 32, quadrant: 'delegate', category: 'Operations' },
    { action: 'Social media content approval', revenueImpact: 20, effort: 15, urgency: 30, compositeScore: 20, quadrant: 'eliminate', category: 'Marketing' },
    { action: 'Respond to non-strategic meeting requests', revenueImpact: 5, effort: 20, urgency: 25, compositeScore: 10, quadrant: 'eliminate', category: 'Admin' },
    { action: 'Refine product analytics dashboard', revenueImpact: 70, effort: 55, urgency: 45, compositeScore: 60, quadrant: 'schedule', category: 'Product' },
    { action: 'Build institutional investor pipeline', revenueImpact: 90, effort: 65, urgency: 55, compositeScore: 78, quadrant: 'do-first', category: 'Fundraising' },
  ];

  const sustainabilityRules: SustainabilityRule[] = [
    { principle: 'Deep Work Minimum', description: 'Protect 4+ hours of uninterrupted deep work daily — this is where 80% of value is created', frequency: 'Daily', indicator: '≥4 hrs deep work / day', status: 'healthy' },
    { principle: 'Meeting Budget', description: 'Cap meetings at 3 hours/day max — batch into single block, decline non-essential invites', frequency: 'Daily', indicator: '≤3 hrs meetings / day', status: 'caution' },
    { principle: 'Recovery Protocol', description: 'Take 1 full day off per week — complete detachment from operations enables strategic clarity', frequency: 'Weekly', indicator: '1 full day off / week', status: 'caution' },
    { principle: 'Decision Fatigue Guard', description: 'Limit to 5 major decisions per day — delegate or defer the rest using priority matrix', frequency: 'Daily', indicator: '≤5 major decisions / day', status: 'healthy' },
    { principle: 'Physical Foundation', description: 'Exercise 5x/week minimum — physical energy directly correlates with cognitive performance', frequency: 'Weekly', indicator: '≥5 workouts / week', status: 'healthy' },
    { principle: 'Strategic Reflection', description: 'Block 2 hours every Friday for weekly review — wins, learnings, priority recalibration', frequency: 'Weekly', indicator: '2 hrs reflection / week', status: 'healthy' },
    { principle: 'Sleep Discipline', description: 'Maintain 7+ hours sleep — no screens 1 hour before bed, consistent sleep/wake schedule', frequency: 'Daily', indicator: '≥7 hrs sleep / night', status: 'caution' },
    { principle: 'Information Diet', description: 'Limit news/social media to 30 min/day — curate high-signal inputs, eliminate noise', frequency: 'Daily', indicator: '≤30 min media / day', status: 'healthy' },
    { principle: 'Quarterly Reset', description: 'Take 3-5 day retreat every quarter for deep strategic planning and personal recalibration', frequency: 'Quarterly', indicator: '1 retreat / quarter', status: 'burnout-risk' },
  ];

  const leadershipRoadmap: LeadershipPhase[] = [
    {
      phase: 'Builder',
      timeline: 'Year 0-1',
      focus: 'Product-market fit and first revenue — hands-on execution across all functions',
      skills: ['Product intuition', 'Sales execution', 'Rapid decision-making', 'Resourcefulness', 'Customer obsession'],
      milestones: ['First 100 listings', 'First Rp 500M revenue', 'Core team of 5 hired', 'Product-market fit signal'],
      mindset: 'Do what doesn\'t scale. Learn faster than competitors. Ship relentlessly.',
      status: 'active',
    },
    {
      phase: 'Architect',
      timeline: 'Year 1-3',
      focus: 'Scalable systems, team building, and fundraising — transition from doer to leader',
      skills: ['Team leadership', 'Systems thinking', 'Fundraising storytelling', 'Delegation mastery', 'Culture building'],
      milestones: ['Series-A closed', '10-city expansion', 'Team of 25+', 'Rp 5B+ ARR'],
      mindset: 'Build systems that work without you. Hire people smarter than you. Think in leverage.',
      status: 'upcoming',
    },
    {
      phase: 'Strategist',
      timeline: 'Year 3-5',
      focus: 'Market dominance, institutional relationships, and pre-IPO positioning',
      skills: ['Board management', 'Institutional negotiation', 'Strategic partnerships', 'Public speaking', 'Industry authority'],
      milestones: ['National liquidity leadership', 'Rp 50B+ ARR', 'Institutional partnerships', 'Pre-IPO governance'],
      mindset: 'Play long games with long-term people. Your competitive advantage is strategic patience.',
      status: 'future',
    },
    {
      phase: 'Visionary',
      timeline: 'Year 5-10+',
      focus: 'Global expansion, IPO execution, and legacy wealth creation',
      skills: ['Global leadership', 'Capital markets fluency', 'Legacy planning', 'Mentorship', 'Industry transformation'],
      milestones: ['IPO / major liquidity event', 'Global platform presence', '$1B+ valuation', 'Industry transformation impact'],
      mindset: 'Build something that outlasts you. Create value that compounds across generations.',
      status: 'future',
    },
  ];

  const weeklyRhythm: WeeklyRhythm[] = [
    { day: 'Monday', theme: 'Revenue Acceleration', blocks: [
      { time: '07:15', task: 'Deal pipeline deep dive', type: 'deep-work' },
      { time: '09:45', task: 'Partner negotiations', type: 'operations' },
      { time: '13:00', task: 'Product revenue features', type: 'deep-work' },
    ]},
    { day: 'Tuesday', theme: 'Growth & Expansion', blocks: [
      { time: '07:15', task: 'Market expansion strategy', type: 'deep-work' },
      { time: '09:45', task: 'Investor & advisor meetings', type: 'growth' },
      { time: '13:00', task: 'Supply acquisition execution', type: 'deep-work' },
    ]},
    { day: 'Wednesday', theme: 'Product & Innovation', blocks: [
      { time: '07:15', task: 'Product roadmap deep work', type: 'deep-work' },
      { time: '09:45', task: 'Team standups & alignment', type: 'operations' },
      { time: '13:00', task: 'Technical architecture review', type: 'deep-work' },
    ]},
    { day: 'Thursday', theme: 'Operations & People', blocks: [
      { time: '07:15', task: 'Financial review & metrics', type: 'strategy' },
      { time: '09:45', task: 'Team 1:1s & coaching', type: 'growth' },
      { time: '13:00', task: 'Process optimization', type: 'operations' },
    ]},
    { day: 'Friday', theme: 'Strategy & Reflection', blocks: [
      { time: '07:15', task: 'Strategic writing & thinking', type: 'strategy' },
      { time: '09:45', task: 'External relationship building', type: 'growth' },
      { time: '13:00', task: 'Weekly review & next week planning', type: 'strategy' },
    ]},
  ];

  const osMetrics = [
    { label: 'Deep Work Hours', value: '4.2h avg', status: 'green' as const },
    { label: 'Meeting Load', value: '2.8h avg', status: 'green' as const },
    { label: 'Decision Velocity', value: '4.5/day', status: 'green' as const },
    { label: 'Recovery Score', value: '72%', status: 'yellow' as const },
    { label: 'Strategic Alignment', value: '85%', status: 'green' as const },
  ];

  return { dailyRoutine, priorityMatrix, sustainabilityRules, leadershipRoadmap, weeklyRhythm, osMetrics };
}
