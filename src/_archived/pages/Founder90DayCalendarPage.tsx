import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar, Target, Flame, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Zap, BarChart3, Rocket, Users, Building2,
  DollarSign, FileText, Megaphone, MessageSquare, Star,
  ChevronRight, ArrowUpRight, Shield, Eye, RefreshCw,
  Layers, Brain, ListChecks, CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Animation ── */

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

/* ── Types ── */

interface WeeklyBlock {
  week: number;
  month: number;
  monthLabel: string;
  phaseColor: string;
  theme: string;
  dailyPriorities: string[];
  kpiTargets: { metric: string; target: string }[];
  rituals: string[];
  decisionPoints: string[];
}

/* ── Calendar Data ── */

const WEEKLY_CALENDAR: WeeklyBlock[] = [
  // MONTH 1 — MARKET IGNITION
  {
    week: 1, month: 1, monthLabel: 'Market Ignition', phaseColor: 'text-chart-4',
    theme: 'Foundation Setup & First Inventory',
    dailyPriorities: [
      'Finalize platform launch checklist — verify all critical flows work',
      'Begin outreach to 3 developer partners for inventory pipeline',
      'Set up analytics tracking — install event capture for all key user actions',
      'Draft first 5 property listings with professional descriptions',
      'Configure vendor onboarding workflow and prepare first pitch deck',
    ],
    kpiTargets: [
      { metric: 'Listings published', target: '10+' },
      { metric: 'Developer contacts made', target: '5' },
      { metric: 'Platform uptime', target: '99.5%' },
    ],
    rituals: ['Morning: review overnight signup data', 'Evening: log 3 learnings from the day'],
    decisionPoints: ['Go/No-Go on soft launch timing', 'Prioritize developer vs. agent-sourced inventory'],
  },
  {
    week: 2, month: 1, monthLabel: 'Market Ignition', phaseColor: 'text-chart-4',
    theme: 'Vendor Partner Onboarding Wave',
    dailyPriorities: [
      'Send vendor outreach scripts to 20 renovation + legal providers',
      'Conduct 3 vendor onboarding calls per day',
      'Launch basic Google Ads campaign targeting "[city] property investment"',
      'Set up referral tracking system with unique codes',
      'Schedule 2 user feedback interviews with early visitors',
    ],
    kpiTargets: [
      { metric: 'Vendors contacted', target: '40+' },
      { metric: 'Vendor signups', target: '8' },
      { metric: 'Ad campaign live', target: 'Yes' },
    ],
    rituals: ['Daily: 30min vendor follow-up calls', 'Friday: weekly KPI review ritual'],
    decisionPoints: ['Which vendor categories convert fastest?', 'Adjust ad targeting based on first click data'],
  },
  {
    week: 3, month: 1, monthLabel: 'Market Ignition', phaseColor: 'text-chart-4',
    theme: 'Demand Activation & First Traffic',
    dailyPriorities: [
      'Launch social media content — 2 property highlights per day',
      'Activate investor early-access landing page with lead capture',
      'Publish 3 SEO blog articles targeting long-tail property keywords',
      'Begin WhatsApp group for early investor community (target 50 members)',
      'Conduct 3 agent outreach meetings — present listing partnership terms',
    ],
    kpiTargets: [
      { metric: 'Daily site visitors', target: '50+' },
      { metric: 'Lead captures', target: '25' },
      { metric: 'SEO articles published', target: '3' },
    ],
    rituals: ['Monitor ad spend vs. leads daily', 'Weekly: content performance review'],
    decisionPoints: ['Scale best-performing ad channel', 'First agent partnership terms finalized'],
  },
  {
    week: 4, month: 1, monthLabel: 'Market Ignition', phaseColor: 'text-chart-4',
    theme: 'First Inquiry Generation & Feedback Loop',
    dailyPriorities: [
      'Follow up with all captured leads — personalized outreach',
      'Conduct 5 user feedback sessions — document pain points',
      'Optimize listing pages based on bounce rate data',
      'Push first curated deal alert to investor WhatsApp group',
      'Month 1 retrospective — document wins, misses, and pivots',
    ],
    kpiTargets: [
      { metric: 'Property inquiries', target: '10+' },
      { metric: 'User interviews completed', target: '10' },
      { metric: 'Listings live', target: '30+' },
    ],
    rituals: ['Daily: inquiry response within 2 hours', 'Month-end: full KPI retrospective meeting'],
    decisionPoints: ['Which districts generate highest inquiry density?', 'Product UX changes needed from feedback?'],
  },
  // MONTH 2 — TRANSACTION MOMENTUM
  {
    week: 5, month: 2, monthLabel: 'Transaction Momentum', phaseColor: 'text-primary',
    theme: 'Deal Pipeline Activation',
    dailyPriorities: [
      'Set up deal pipeline tracker — every inquiry mapped to funnel stage',
      'Assign top 5 leads to dedicated agent follow-up',
      'Launch viewing scheduling automation for high-intent buyers',
      'Create negotiation support templates for agent partners',
      'Start tracking inquiry-to-viewing conversion rate',
    ],
    kpiTargets: [
      { metric: 'Pipeline value', target: 'Rp 10B+' },
      { metric: 'Viewings scheduled', target: '8' },
      { metric: 'Inquiry-to-viewing rate', target: '>20%' },
    ],
    rituals: ['Daily: pipeline review — move or kill stale leads', 'Wednesday: agent performance sync'],
    decisionPoints: ['Are agents responding fast enough? Implement SLA?', 'Which property types convert to viewings fastest?'],
  },
  {
    week: 6, month: 2, monthLabel: 'Transaction Momentum', phaseColor: 'text-primary',
    theme: 'Conversion Funnel Optimization',
    dailyPriorities: [
      'Analyze full funnel: impression → click → inquiry → viewing → offer',
      'A/B test property listing formats (photo-first vs. data-first)',
      'Deploy urgency signals on high-demand listings',
      'Improve mortgage calculator integration for buyer decision support',
      'Expand vendor network — onboard 5 more service providers',
    ],
    kpiTargets: [
      { metric: 'Funnel conversion rate', target: '>3%' },
      { metric: 'Viewing-to-offer rate', target: '>15%' },
      { metric: 'Active vendors', target: '20+' },
    ],
    rituals: ['Daily: review hottest 3 leads', 'Friday: funnel metrics deep-dive'],
    decisionPoints: ['Which funnel stage has the biggest drop-off?', 'Invest in better photos or better data?'],
  },
  {
    week: 7, month: 2, monthLabel: 'Transaction Momentum', phaseColor: 'text-primary',
    theme: 'First Transaction Push',
    dailyPriorities: [
      'Focus all energy on closing first 1-3 deals in pipeline',
      'Provide white-glove support — founder personally assists top deal',
      'Deploy negotiation support tools for active offers',
      'Remove documentation/legal bottlenecks with vendor partners',
      'Prepare case study template for first successful transaction',
    ],
    kpiTargets: [
      { metric: 'Offers submitted', target: '3+' },
      { metric: 'First deal closed', target: '1' },
      { metric: 'Deal cycle time', target: '<30 days' },
    ],
    rituals: ['Daily: 1-on-1 with agent handling top deal', 'Daily: remove one blocker from deal pipeline'],
    decisionPoints: ['Is legal/documentation the biggest friction point?', 'First commission structure validated?'],
  },
  {
    week: 8, month: 2, monthLabel: 'Transaction Momentum', phaseColor: 'text-primary',
    theme: 'Trust Signal Publishing & Momentum',
    dailyPriorities: [
      'Publish first successful transaction case study',
      'Create social proof content — testimonial from buyer + seller',
      'Share deal story in investor WhatsApp community',
      'Expand listing inventory to adjacent high-demand districts',
      'Month 2 retrospective — revenue, pipeline, and conversion analysis',
    ],
    kpiTargets: [
      { metric: 'Case studies published', target: '1+' },
      { metric: 'Total deals closed', target: '2-3' },
      { metric: 'Listings live', target: '60+' },
    ],
    rituals: ['Daily: share one win publicly', 'Month-end: investor update draft'],
    decisionPoints: ['Double down on working district or expand?', 'Is agent model scalable or need direct team?'],
  },
  // MONTH 3 — REVENUE STABILIZATION
  {
    week: 9, month: 3, monthLabel: 'Revenue Stabilization', phaseColor: 'text-chart-1',
    theme: 'Subscription Monetization Launch',
    dailyPriorities: [
      'Launch premium listing visibility tier — test pricing at Rp 500K/month',
      'Introduce investor subscription trial — 30-day free then Rp 299K/month',
      'Set up subscription analytics dashboard for tracking MRR',
      'Begin upselling existing active users to premium features',
      'Create comparison page: Free vs. Premium value proposition',
    ],
    kpiTargets: [
      { metric: 'Premium listing subscribers', target: '5+' },
      { metric: 'Investor trial signups', target: '15' },
      { metric: 'MRR', target: 'Rp 5M+' },
    ],
    rituals: ['Daily: monitor subscription conversion events', 'Wednesday: pricing experiment review'],
    decisionPoints: ['Is Rp 500K/month the right price point?', 'Which premium features drive most upgrades?'],
  },
  {
    week: 10, month: 3, monthLabel: 'Revenue Stabilization', phaseColor: 'text-chart-1',
    theme: 'Pricing Strategy Refinement',
    dailyPriorities: [
      'Analyze price sensitivity — survey 20 users on willingness to pay',
      'Test commission structure: 1.5% vs. 2% on next 3 deals',
      'Launch vendor subscription tier (Basic → Growth at Rp 750K/month)',
      'Optimize ad spend — cut underperforming channels, scale winners',
      'Begin investor acquisition campaign targeting HNW individuals',
    ],
    kpiTargets: [
      { metric: 'Revenue per deal', target: 'Rp 30M+' },
      { metric: 'CAC payback', target: '<90 days' },
      { metric: 'Vendor subscriptions', target: '3+' },
    ],
    rituals: ['Daily: revenue tracking ritual', 'Friday: unit economics review'],
    decisionPoints: ['Commission or subscription — which grows faster?', 'Can vendor SaaS reach Rp 10M MRR in 6 months?'],
  },
  {
    week: 11, month: 3, monthLabel: 'Revenue Stabilization', phaseColor: 'text-chart-1',
    theme: 'Investor Pipeline Strengthening',
    dailyPriorities: [
      'Host first virtual property showcase event for qualified investors',
      'Launch referral program with Rp 200K credit per successful referral',
      'Publish market insight report — position ASTRA as intelligence authority',
      'Begin conversations with 2 institutional investor contacts',
      'Prepare city expansion readiness analysis for next target market',
    ],
    kpiTargets: [
      { metric: 'Event attendees', target: '30+' },
      { metric: 'Referral signups', target: '10' },
      { metric: 'Institutional leads', target: '2' },
    ],
    rituals: ['Daily: investor relationship nurturing', 'Weekly: content authority publishing'],
    decisionPoints: ['Ready for second city launch? What signals say yes?', 'Hire first dedicated sales person?'],
  },
  {
    week: 12, month: 3, monthLabel: 'Revenue Stabilization', phaseColor: 'text-chart-1',
    theme: 'Scaling Readiness Assessment',
    dailyPriorities: [
      'Compile full 90-day performance report for investors',
      'Conduct city expansion feasibility analysis — rank next 3 cities',
      'Document all playbooks: listing acquisition, vendor onboarding, deal closing',
      'Set 6-month OKRs based on 90-day learnings',
      'Plan team hiring roadmap — identify first 3 critical hires',
    ],
    kpiTargets: [
      { metric: 'Total deals closed', target: '8-15' },
      { metric: 'Total MRR', target: 'Rp 15M+' },
      { metric: 'Playbooks documented', target: '3+' },
    ],
    rituals: ['Full-day 90-day retrospective', 'Create next quarter OKR document'],
    decisionPoints: ['Raise seed round now or bootstrap further?', 'Which city is the best second market?'],
  },
];

/* ── Milestone Data ── */

interface Milestone {
  day: number;
  label: string;
  category: 'supply' | 'demand' | 'revenue' | 'team';
  icon: React.ElementType;
}

const MILESTONES: Milestone[] = [
  { day: 7, label: 'First 10 listings live', category: 'supply', icon: Building2 },
  { day: 14, label: 'First vendor partners onboarded', category: 'supply', icon: Users },
  { day: 21, label: 'First 50 daily visitors', category: 'demand', icon: Eye },
  { day: 30, label: 'First 10 property inquiries', category: 'demand', icon: MessageSquare },
  { day: 45, label: 'First property viewing scheduled', category: 'demand', icon: Calendar },
  { day: 55, label: 'First deal closed', category: 'revenue', icon: CheckCircle2 },
  { day: 60, label: 'First case study published', category: 'revenue', icon: FileText },
  { day: 70, label: 'Premium subscriptions launched', category: 'revenue', icon: DollarSign },
  { day: 80, label: 'Referral program activated', category: 'demand', icon: Users },
  { day: 90, label: '90-day investor report completed', category: 'team', icon: BarChart3 },
];

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  supply: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/20' },
  demand: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  revenue: { color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20' },
  team: { color: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20' },
};

/* ── Scaling Readiness Checklist ── */

interface ReadinessItem {
  category: string;
  icon: React.ElementType;
  color: string;
  items: { label: string; criteria: string }[];
}

const READINESS_CHECKLIST: ReadinessItem[] = [
  {
    category: 'Product-Market Fit Signals', icon: Target, color: 'text-chart-1',
    items: [
      { label: 'Organic inquiry growth', criteria: 'Inquiries growing 15%+ week-over-week without ad spend increase' },
      { label: 'Repeat user behavior', criteria: '20%+ of users return within 7 days' },
      { label: 'Deal completion rate', criteria: '>5% of inquiries convert to closed deals' },
      { label: 'User satisfaction score', criteria: 'NPS > 40 from first 50 transacting users' },
    ],
  },
  {
    category: 'Unit Economics Health', icon: DollarSign, color: 'text-chart-4',
    items: [
      { label: 'CAC payback period', criteria: 'Customer acquisition cost recovered within 90 days' },
      { label: 'Gross margin positive', criteria: 'Revenue per transaction exceeds variable cost per transaction' },
      { label: 'LTV/CAC ratio', criteria: 'Projected lifetime value > 3x customer acquisition cost' },
      { label: 'Revenue diversification', criteria: 'At least 2 revenue streams generating income' },
    ],
  },
  {
    category: 'Operational Readiness', icon: RefreshCw, color: 'text-primary',
    items: [
      { label: 'Playbook documentation', criteria: 'Listing acquisition, vendor onboarding, deal closing playbooks written' },
      { label: 'Process repeatability', criteria: 'New team member can execute core process within 1 week' },
      { label: 'Technology stability', criteria: 'Platform uptime >99.5%, no critical bugs in 14 days' },
      { label: 'Support responsiveness', criteria: 'Average inquiry response time <2 hours' },
    ],
  },
  {
    category: 'Market Expansion Signals', icon: Rocket, color: 'text-chart-2',
    items: [
      { label: 'Supply density achieved', criteria: '>50 active listings in primary district cluster' },
      { label: 'Cross-district demand', criteria: 'Inquiries coming from 3+ distinct geographic areas' },
      { label: 'Agent/vendor pipeline', criteria: '10+ vendors and 5+ agents waiting to onboard in next city' },
      { label: 'Competitive gap identified', criteria: 'Clear differentiation vs. existing platforms in target city' },
    ],
  },
];

/* ── Productivity Framework ── */

interface ProductivityBlock {
  time: string;
  activity: string;
  type: 'deep' | 'execution' | 'review' | 'recovery';
  icon: React.ElementType;
}

const DAILY_FRAMEWORK: ProductivityBlock[] = [
  { time: '06:00–07:00', activity: 'Morning review — overnight metrics, inbox zero, day priorities', type: 'review', icon: Eye },
  { time: '07:00–09:00', activity: 'Deep work — strategy, product decisions, investor materials', type: 'deep', icon: Brain },
  { time: '09:00–11:00', activity: 'Outbound execution — vendor calls, agent meetings, partner outreach', type: 'execution', icon: Zap },
  { time: '11:00–12:00', activity: 'Pipeline management — lead follow-ups, deal status updates', type: 'execution', icon: ListChecks },
  { time: '12:00–13:00', activity: 'Lunch + industry reading / competitor monitoring', type: 'recovery', icon: RefreshCw },
  { time: '13:00–15:00', activity: 'User feedback — interviews, support review, product improvements', type: 'deep', icon: MessageSquare },
  { time: '15:00–17:00', activity: 'Growth execution — content, campaigns, community engagement', type: 'execution', icon: Megaphone },
  { time: '17:00–18:00', activity: 'Day close — log results, update pipeline, prep tomorrow priorities', type: 'review', icon: FileText },
];

const TYPE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  deep: { color: 'text-primary', bg: 'bg-primary/10', label: 'Deep Work' },
  execution: { color: 'text-chart-1', bg: 'bg-chart-1/10', label: 'Execution' },
  review: { color: 'text-chart-4', bg: 'bg-chart-4/10', label: 'Review' },
  recovery: { color: 'text-chart-3', bg: 'bg-chart-3/10', label: 'Recovery' },
};

/* ── Main Page ── */

export default function Founder90DayCalendarPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredWeeks = useMemo(() => {
    if (selectedMonth === 0) return WEEKLY_CALENDAR;
    return WEEKLY_CALENDAR.filter(w => w.month === selectedMonth);
  }, [selectedMonth]);

  const totalReadiness = READINESS_CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const checkedReadiness = READINESS_CHECKLIST.reduce(
    (s, c) => s + c.items.filter(i => checkedItems.has(`readiness-${c.category}-${i.label}`)).length, 0
  );

  const headerMetrics = [
    { label: 'Duration', value: '90 Days', sub: '12 execution weeks', icon: Calendar },
    { label: 'Phases', value: '3', sub: 'Ignite → Momentum → Stabilize', icon: Layers },
    { label: 'Milestones', value: '10', sub: 'Critical checkpoints', icon: Target },
    { label: 'Readiness', value: `${Math.round((checkedReadiness / totalReadiness) * 100)}%`, sub: `${checkedReadiness}/${totalReadiness} criteria met`, icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Execution Discipline</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">First 90-Day Founder Execution Calendar</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Week-by-week operational calendar across 3 phases — from marketplace ignition through transaction momentum to revenue stabilization.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* KPI Bar */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {headerMetrics.map((m) => (
            <motion.div key={m.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><m.icon className="h-3 w-3" />{m.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="h-9">
            <TabsTrigger value="calendar" className="text-xs px-4">Weekly Calendar</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs px-4">Milestone Tracker</TabsTrigger>
            <TabsTrigger value="productivity" className="text-xs px-4">Daily Framework</TabsTrigger>
            <TabsTrigger value="readiness" className="text-xs px-4">Scaling Readiness</TabsTrigger>
          </TabsList>

          {/* ── Calendar Tab ── */}
          <TabsContent value="calendar" className="mt-4 space-y-4">
            {/* Month filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { val: 0, label: 'All Weeks', color: '' },
                { val: 1, label: 'Month 1 — Ignition', color: 'text-chart-4' },
                { val: 2, label: 'Month 2 — Momentum', color: 'text-primary' },
                { val: 3, label: 'Month 3 — Revenue', color: 'text-chart-1' },
              ].map((f) => (
                <Badge
                  key={f.val}
                  variant={selectedMonth === f.val ? 'default' : 'outline'}
                  className={cn('cursor-pointer text-[10px] px-3 py-1 transition-colors', selectedMonth !== f.val && f.color)}
                  onClick={() => setSelectedMonth(f.val)}
                >
                  {f.label}
                </Badge>
              ))}
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger} className="space-y-4">
              {filteredWeeks.map((week) => (
                <motion.div key={week.week} variants={fadeSlide}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] h-5 px-2 font-bold text-foreground bg-muted/20">
                          Week {week.week}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5', week.phaseColor,
                          week.phaseColor === 'text-chart-4' ? 'bg-chart-4/10 border-chart-4/30' :
                          week.phaseColor === 'text-primary' ? 'bg-primary/10 border-primary/30' :
                          'bg-chart-1/10 border-chart-1/30')}>
                          {week.monthLabel}
                        </Badge>
                        <CardTitle className="text-sm">{week.theme}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Daily Priorities */}
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-chart-1 block mb-2">Daily Priorities</span>
                          <div className="space-y-1.5">
                            {week.dailyPriorities.map((p, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                                <CircleDot className="h-3 w-3 text-chart-1 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* KPI Targets */}
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">KPI Targets</span>
                            <div className="space-y-1">
                              {week.kpiTargets.map((kpi, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
                                  <span className="text-xs text-muted-foreground">{kpi.metric}</span>
                                  <span className="text-xs font-bold font-mono text-foreground">{kpi.target}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rituals */}
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-chart-4 block mb-1">Rituals</span>
                            {week.rituals.map((r, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5 shrink-0" /> {r}
                              </div>
                            ))}
                          </div>

                          {/* Decision Points */}
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-destructive/80 block mb-1">Decision Points</span>
                            {week.decisionPoints.map((d, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground">
                                <AlertTriangle className="h-2.5 w-2.5 text-destructive/50 shrink-0" /> {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ── Milestones Tab ── */}
          <TabsContent value="milestones" className="mt-4 space-y-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-chart-1" />
                    90-Day Milestone Timeline
                  </CardTitle>
                  <CardDescription className="text-xs">
                    10 critical checkpoints from platform launch to scaling readiness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Progress bar */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Month 1', range: 'Days 1-30', color: 'text-chart-4' },
                      { label: 'Month 2', range: 'Days 31-60', color: 'text-primary' },
                      { label: 'Month 3', range: 'Days 61-90', color: 'text-chart-1' },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <span className={cn('text-[10px] font-bold', m.color)}>{m.label}</span>
                        <Progress value={100} className="h-1.5 mt-1" />
                        <span className="text-[8px] text-muted-foreground">{m.range}</span>
                      </div>
                    ))}
                  </div>

                  {MILESTONES.map((ms) => {
                    const key = `milestone-${ms.day}`;
                    const checked = checkedItems.has(key);
                    const style = CATEGORY_STYLES[ms.category];
                    const Icon = ms.icon;
                    return (
                      <div
                        key={ms.day}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-all',
                          checked ? 'bg-chart-1/5 border-chart-1/20' : 'border-border/20 bg-card/80'
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleCheck(key)} />
                        <Badge variant="outline" className="text-[9px] h-5 px-2 font-mono text-foreground bg-muted/20 shrink-0">
                          Day {ms.day}
                        </Badge>
                        <div className={cn('h-6 w-6 rounded-md flex items-center justify-center shrink-0', style.bg)}>
                          <Icon className={cn('h-3 w-3', style.color)} />
                        </div>
                        <span className={cn('text-xs flex-1', checked ? 'line-through text-muted-foreground' : 'text-foreground font-medium')}>
                          {ms.label}
                        </span>
                        <Badge variant="outline" className={cn('text-[7px] h-4 px-1.5 capitalize', style.color, style.bg, style.border)}>
                          {ms.category}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Productivity Tab ── */}
          <TabsContent value="productivity" className="mt-4 space-y-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Founder Daily Execution Framework
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Structured 12-hour day optimized for deep work, execution, review, and recovery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Time allocation summary */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {Object.entries(TYPE_STYLES).map(([key, style]) => {
                      const count = DAILY_FRAMEWORK.filter(b => b.type === key).length;
                      return (
                        <div key={key} className={cn('p-2.5 rounded-lg text-center', style.bg)}>
                          <span className={cn('text-lg font-bold font-mono block', style.color)}>{count}</span>
                          <span className="text-[9px] text-muted-foreground">{style.label} blocks</span>
                        </div>
                      );
                    })}
                  </div>

                  {DAILY_FRAMEWORK.map((block, i) => {
                    const style = TYPE_STYLES[block.type];
                    const Icon = block.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/20 bg-card/80">
                        <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', style.bg)}>
                          <Icon className={cn('h-3.5 w-3.5', style.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono font-bold text-foreground">{block.time}</span>
                            <Badge variant="outline" className={cn('text-[7px] h-4 px-1.5', style.color, style.bg)}>
                              {style.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{block.activity}</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Weekly rituals */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block mb-2">Weekly Ritual Schedule</span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        { day: 'Monday', ritual: 'Set 5 weekly priorities + review last week OKR progress' },
                        { day: 'Wednesday', ritual: 'Pipeline deep-dive — review every active deal status' },
                        { day: 'Friday', ritual: 'KPI review — 30min metrics analysis + experiment decisions' },
                        { day: 'Sunday', ritual: 'Strategic reflection — journal insights, plan next week themes' },
                      ].map((r) => (
                        <div key={r.day} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                          <span className="text-xs font-bold text-foreground">{r.day}</span>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{r.ritual}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decision loop */}
                  <div className="p-4 rounded-xl bg-chart-4/5 border border-chart-4/10">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-chart-4 block mb-2">Rapid Experiment Decision Loop</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['Hypothesis', 'Execute (≤3 days)', 'Measure', 'Decide: Scale / Kill / Iterate'].map((step, i) => (
                        <React.Fragment key={step}>
                          <Badge variant="outline" className="text-[9px] px-2 py-1 text-foreground bg-chart-4/5 border-chart-4/20">
                            {step}
                          </Badge>
                          {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Never run an experiment longer than 3 days without measurement. Kill fast, double down faster.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Scaling Readiness Tab ── */}
          <TabsContent value="readiness" className="mt-4 space-y-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
              {/* Overall progress */}
              <Card className="border-border/50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">Scaling Readiness Score</span>
                    <span className="text-lg font-bold font-mono text-chart-1">
                      {Math.round((checkedReadiness / totalReadiness) * 100)}%
                    </span>
                  </div>
                  <Progress value={(checkedReadiness / totalReadiness) * 100} className="h-2" />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{checkedReadiness} of {totalReadiness} criteria met</span>
                    <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5',
                      checkedReadiness / totalReadiness >= 0.75 ? 'text-chart-1 bg-chart-1/10 border-chart-1/20' :
                      checkedReadiness / totalReadiness >= 0.5 ? 'text-chart-4 bg-chart-4/10 border-chart-4/20' :
                      'text-destructive bg-destructive/10 border-destructive/20'
                    )}>
                      {checkedReadiness / totalReadiness >= 0.75 ? 'Ready to Scale' :
                       checkedReadiness / totalReadiness >= 0.5 ? 'Approaching Readiness' : 'Building Foundation'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {READINESS_CHECKLIST.map((section) => {
                const Icon = section.icon;
                const sectionChecked = section.items.filter(i => checkedItems.has(`readiness-${section.category}-${i.label}`)).length;
                return (
                  <Card key={section.category} className="border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', section.color)} />
                          {section.category}
                        </CardTitle>
                        <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-mono text-muted-foreground">
                          {sectionChecked}/{section.items.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {section.items.map((item) => {
                        const key = `readiness-${section.category}-${item.label}`;
                        const checked = checkedItems.has(key);
                        return (
                          <div
                            key={item.label}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                              checked ? 'bg-chart-1/5 border-chart-1/20' : 'border-border/20 hover:bg-muted/5'
                            )}
                            onClick={() => toggleCheck(key)}
                          >
                            <Checkbox checked={checked} className="mt-0.5" />
                            <div className="flex-1">
                              <span className={cn('text-xs font-semibold block', checked ? 'line-through text-muted-foreground' : 'text-foreground')}>
                                {item.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground">{item.criteria}</span>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
