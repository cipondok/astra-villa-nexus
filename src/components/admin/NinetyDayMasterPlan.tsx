
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Rocket, Zap, TrendingUp, Trophy, Target, Users, Search, Globe,
  FileText, Star, CheckCircle, BarChart3, Handshake, DollarSign,
  Eye, Cpu, Clock, ArrowUpRight, Layers, Shield, Megaphone
} from 'lucide-react';

interface Task {
  id: string;
  task: string;
  category: 'supply' | 'seo' | 'social' | 'product' | 'partnerships' | 'analytics' | 'monetization' | 'brand';
  priority: 'critical' | 'high' | 'medium';
  outcome: string;
}

interface WeekBlock {
  weekNum: number;
  label: string;
  focus: string;
  tasks: Task[];
}

interface PhaseData {
  key: string;
  phase: number;
  name: string;
  subtitle: string;
  dayRange: string;
  icon: typeof Rocket;
  color: string;
  bgToken: string;
  weeks: WeekBlock[];
  kpis: { metric: string; start: string; target: string }[];
  founderFocus: { area: string; allocation: string; actions: string[] }[];
}

const catMeta: Record<string, { label: string; cls: string }> = {
  supply: { label: 'Supply', cls: 'text-blue-500' },
  seo: { label: 'SEO', cls: 'text-green-500' },
  social: { label: 'Social', cls: 'text-pink-500' },
  product: { label: 'Product', cls: 'text-purple-500' },
  partnerships: { label: 'Partners', cls: 'text-orange-500' },
  analytics: { label: 'Analytics', cls: 'text-amber-500' },
  monetization: { label: 'Revenue', cls: 'text-emerald-500' },
  brand: { label: 'Brand', cls: 'text-cyan-500' },
};

const priCls: Record<string, string> = {
  critical: 'border-destructive/50 text-destructive bg-destructive/10',
  high: 'border-amber-500/50 text-amber-500 bg-amber-500/10',
  medium: 'border-muted-foreground/30 text-muted-foreground bg-muted/30',
};

const phases: PhaseData[] = [
  {
    key: 'p1', phase: 1, name: 'Marketplace Activation', subtitle: 'Seed supply, ignite visibility, prove early pull',
    dayRange: 'Day 1–30', icon: Rocket, color: 'text-green-500', bgToken: 'bg-green-500/10',
    weeks: [
      { weekNum: 1, label: 'Platform Go-Live', focus: 'First listings, AI validation, social ignition',
        tasks: [
          { id: 'p1w1t1', task: 'Publish first 50 seed listings across 2 launch cities', category: 'supply', priority: 'critical', outcome: '50 live listings' },
          { id: 'p1w1t2', task: 'Verify AI valuation & deal signal scores on all listing cards', category: 'product', priority: 'critical', outcome: 'AI signals live' },
          { id: 'p1w1t3', task: 'Submit sitemap & request indexing via Google Search Console', category: 'seo', priority: 'critical', outcome: 'Indexing started' },
          { id: 'p1w1t4', task: 'Post launch content across LinkedIn, Instagram, TikTok', category: 'social', priority: 'high', outcome: 'Social launch live' },
          { id: 'p1w1t5', task: 'Contact first 20 target agents via WhatsApp outreach', category: 'supply', priority: 'critical', outcome: '20 agents contacted' },
          { id: 'p1w1t6', task: 'Publish 10 province/city-level SEO location pages', category: 'seo', priority: 'high', outcome: '10 SEO pages live' },
        ]},
      { weekNum: 2, label: 'Supply Sprint', focus: 'Agent onboarding, listing growth, quality baseline',
        tasks: [
          { id: 'p1w2t1', task: 'Reach 150 listings — coordinate bulk uploads and agent submissions', category: 'supply', priority: 'critical', outcome: '150 listings' },
          { id: 'p1w2t2', task: 'Onboard 5 agents with verified active listings', category: 'supply', priority: 'critical', outcome: '5 active agents' },
          { id: 'p1w2t3', task: 'Quality audit all listings — photos, descriptions, pricing', category: 'product', priority: 'high', outcome: 'Quality baseline set' },
          { id: 'p1w2t4', task: 'Publish 20 district-level SEO pages with property data', category: 'seo', priority: 'high', outcome: '30 total SEO pages' },
          { id: 'p1w2t5', task: 'Post 5 property tour short-form videos', category: 'social', priority: 'medium', outcome: 'Video cadence started' },
        ]},
      { weekNum: 3, label: 'Visibility Acceleration', focus: 'Traffic growth, content authority, first inquiries',
        tasks: [
          { id: 'p1w3t1', task: 'Push to 300 listings — target 3 property types per city', category: 'supply', priority: 'critical', outcome: '300 listings' },
          { id: 'p1w3t2', task: 'Publish 3 long-form market analysis articles (1,500+ words)', category: 'seo', priority: 'high', outcome: 'Authority content live' },
          { id: 'p1w3t3', task: 'Onboard 5 more agents — target different specializations', category: 'supply', priority: 'critical', outcome: '10 active agents' },
          { id: 'p1w3t4', task: 'Launch Google Ads test campaign (10 keywords, Rp 2M budget)', category: 'analytics', priority: 'medium', outcome: 'Paid channel tested' },
          { id: 'p1w3t5', task: 'Contact first 3 property developers for partnership discussion', category: 'partnerships', priority: 'high', outcome: '3 developers contacted' },
        ]},
      { weekNum: 4, label: 'Month 1 Milestone', focus: 'Hit 500 listings, validate demand signals',
        tasks: [
          { id: 'p1w4t1', task: 'Push to 500 listings milestone across all active cities', category: 'supply', priority: 'critical', outcome: '500 listings' },
          { id: 'p1w4t2', task: 'Document first 20+ buyer inquiries and agent response rates', category: 'analytics', priority: 'critical', outcome: 'Demand validated' },
          { id: 'p1w4t3', task: 'Compile Month 1 traction report with WoW growth charts', category: 'analytics', priority: 'critical', outcome: 'Traction report ready' },
          { id: 'p1w4t4', task: 'Reach 50+ SEO pages indexed by Google', category: 'seo', priority: 'high', outcome: 'SEO indexing proven' },
          { id: 'p1w4t5', task: 'Host first virtual agent community meetup', category: 'supply', priority: 'high', outcome: 'Community seeded' },
        ]},
    ],
    kpis: [
      { metric: 'Active Listings', start: '0', target: '500' },
      { metric: 'Active Agents', start: '0', target: '15' },
      { metric: 'SEO Pages Published', start: '0', target: '50+' },
      { metric: 'Monthly Visitors', start: '0', target: '5,000–8,000' },
      { metric: 'Buyer Inquiries', start: '0', target: '30–50' },
      { metric: 'Developer Contacts', start: '0', target: '3' },
    ],
    founderFocus: [
      { area: 'Growth Execution', allocation: '40%', actions: ['Agent outreach calls daily', 'Listing quality reviews', 'Social content production'] },
      { area: 'Product Oversight', allocation: '30%', actions: ['AI signal accuracy checks', 'UX friction identification', 'Feature prioritization'] },
      { area: 'Partnerships', allocation: '20%', actions: ['Developer introductions', 'Community group networking', 'Ecosystem mapping'] },
      { area: 'Strategic Positioning', allocation: '10%', actions: ['LinkedIn thought leadership', 'Competitor monitoring', 'Investor deck prep'] },
    ],
  },
  {
    key: 'p2', phase: 2, name: 'Traction Acceleration', subtitle: 'Dominate cities, scale partnerships, build authority',
    dayRange: 'Day 31–60', icon: Zap, color: 'text-blue-500', bgToken: 'bg-blue-500/10',
    weeks: [
      { weekNum: 5, label: 'City Domination Sprint', focus: 'Deep inventory in primary cities, local SEO authority',
        tasks: [
          { id: 'p2w5t1', task: 'Reach 800 listings — focus depth over breadth in launch cities', category: 'supply', priority: 'critical', outcome: '800 listings' },
          { id: 'p2w5t2', task: 'Publish 30 sub-district SEO pages targeting long-tail keywords', category: 'seo', priority: 'critical', outcome: '80+ SEO pages total' },
          { id: 'p2w5t3', task: 'Onboard 10 more agents — prioritize 20+ portfolio agents', category: 'supply', priority: 'critical', outcome: '25 active agents' },
          { id: 'p2w5t4', task: 'Secure first signed developer partnership agreement', category: 'partnerships', priority: 'high', outcome: '1 partnership signed' },
          { id: 'p2w5t5', task: 'Launch weekly market insight newsletter', category: 'brand', priority: 'medium', outcome: 'Newsletter started' },
        ]},
      { weekNum: 6, label: 'Partnership Acceleration', focus: 'Developer pipeline, institutional outreach, co-marketing',
        tasks: [
          { id: 'p2w6t1', task: 'Contact 10 more developers — target new projects and exclusive listings', category: 'partnerships', priority: 'critical', outcome: '13 developers in pipeline' },
          { id: 'p2w6t2', task: 'Launch co-branded marketing campaign with first developer partner', category: 'brand', priority: 'high', outcome: 'Co-marketing live' },
          { id: 'p2w6t3', task: 'Push to 1,000 listings milestone', category: 'supply', priority: 'critical', outcome: '1,000 listings' },
          { id: 'p2w6t4', task: 'Publish 5 in-depth investment guide articles', category: 'seo', priority: 'high', outcome: 'Investment authority built' },
          { id: 'p2w6t5', task: 'Explore bank partnership for mortgage lead integration', category: 'partnerships', priority: 'medium', outcome: 'Bank channel explored' },
        ]},
      { weekNum: 7, label: 'Demand Generation', focus: 'Conversion optimization, lead quality, inquiry volume',
        tasks: [
          { id: 'p2w7t1', task: 'Optimize listing detail pages for inquiry conversion (CTA placement, trust signals)', category: 'product', priority: 'critical', outcome: 'Conversion rate improved' },
          { id: 'p2w7t2', task: 'Implement lead scoring system for buyer intent classification', category: 'product', priority: 'high', outcome: 'Lead scoring active' },
          { id: 'p2w7t3', task: 'Run retargeting campaign to previous site visitors', category: 'analytics', priority: 'high', outcome: 'Retargeting live' },
          { id: 'p2w7t4', task: 'Agent response time optimization — set <2hr response target', category: 'supply', priority: 'high', outcome: 'Response SLA set' },
          { id: 'p2w7t5', task: 'Reach 100+ buyer inquiries cumulative', category: 'analytics', priority: 'critical', outcome: '100 inquiries milestone' },
        ]},
      { weekNum: 8, label: 'Month 2 Consolidation', focus: 'Prove growth rate, strengthen unit economics narrative',
        tasks: [
          { id: 'p2w8t1', task: 'Hit 1,500 listings across 3+ active cities', category: 'supply', priority: 'critical', outcome: '1,500 listings' },
          { id: 'p2w8t2', task: 'Compile Month 2 growth report — highlight MoM acceleration', category: 'analytics', priority: 'critical', outcome: 'Growth report ready' },
          { id: 'p2w8t3', task: 'Reach 30 active agents with consistent listing activity', category: 'supply', priority: 'critical', outcome: '30 active agents' },
          { id: 'p2w8t4', task: 'Achieve 15,000+ monthly website visitors', category: 'seo', priority: 'high', outcome: 'Traffic milestone hit' },
          { id: 'p2w8t5', task: 'Initiate 5 warm investor conversations using traction data', category: 'brand', priority: 'high', outcome: 'Investor conversations started' },
        ]},
    ],
    kpis: [
      { metric: 'Active Listings', start: '500', target: '1,500' },
      { metric: 'Active Agents', start: '15', target: '30' },
      { metric: 'SEO Pages Indexed', start: '50', target: '120+' },
      { metric: 'Monthly Visitors', start: '8K', target: '15,000–20,000' },
      { metric: 'Cumulative Inquiries', start: '50', target: '150+' },
      { metric: 'Developer Partners', start: '1', target: '3–5 signed' },
    ],
    founderFocus: [
      { area: 'Partnerships', allocation: '35%', actions: ['Developer deal closing', 'Bank/mortgage outreach', 'Ecosystem events'] },
      { area: 'Growth Execution', allocation: '30%', actions: ['Agent pipeline management', 'Content calendar oversight', 'Conversion optimization'] },
      { area: 'Strategic Positioning', allocation: '20%', actions: ['Investor relationship building', 'PR/media outreach', 'Competitive positioning'] },
      { area: 'Product Oversight', allocation: '15%', actions: ['AI intelligence refinement', 'UX improvement cycles', 'Feature roadmap updates'] },
    ],
  },
  {
    key: 'p3', phase: 3, name: 'Growth Validation', subtitle: 'Soft monetization, investor readiness, marketplace liquidity',
    dayRange: 'Day 61–90', icon: Trophy, color: 'text-amber-500', bgToken: 'bg-amber-500/10',
    weeks: [
      { weekNum: 9, label: 'Monetization Experiments', focus: 'Featured listings, premium agent tools, revenue signals',
        tasks: [
          { id: 'p3w9t1', task: 'Launch featured listing product — Rp 50K/week test pricing', category: 'monetization', priority: 'critical', outcome: 'First revenue experiment' },
          { id: 'p3w9t2', task: 'Introduce premium agent dashboard with analytics + priority leads', category: 'monetization', priority: 'high', outcome: 'Premium tier designed' },
          { id: 'p3w9t3', task: 'Push to 2,000 listings — expand to 4th city if demand exists', category: 'supply', priority: 'critical', outcome: '2,000 listings' },
          { id: 'p3w9t4', task: 'Launch referral program for agents (bring-a-friend incentive)', category: 'supply', priority: 'high', outcome: 'Referral loop active' },
          { id: 'p3w9t5', task: 'Reach 120+ indexed SEO pages with measurable organic traffic', category: 'seo', priority: 'high', outcome: 'SEO flywheel spinning' },
        ]},
      { weekNum: 10, label: 'Investor Readiness', focus: 'Traction deck, financial model, warm pipeline activation',
        tasks: [
          { id: 'p3w10t1', task: 'Finalize investor pitch deck with 90-day real traction data', category: 'brand', priority: 'critical', outcome: 'Pitch deck investor-ready' },
          { id: 'p3w10t2', task: 'Build 18-month financial model with revenue projections', category: 'analytics', priority: 'critical', outcome: 'Financial model complete' },
          { id: 'p3w10t3', task: 'Send traction update to 20+ warm investor contacts', category: 'brand', priority: 'critical', outcome: 'Investor pipeline activated' },
          { id: 'p3w10t4', task: 'Record polished 5-minute product demo video', category: 'brand', priority: 'high', outcome: 'Demo video ready' },
          { id: 'p3w10t5', task: 'Publish founder thought leadership piece on PropTech vision', category: 'brand', priority: 'medium', outcome: 'Thought leadership live' },
        ]},
      { weekNum: 11, label: 'Marketplace Liquidity', focus: 'Match rate optimization, transaction facilitation, retention',
        tasks: [
          { id: 'p3w11t1', task: 'Achieve 200+ cumulative buyer inquiries with tracked outcomes', category: 'analytics', priority: 'critical', outcome: 'Demand proof strong' },
          { id: 'p3w11t2', task: 'Optimize buyer-to-agent matching algorithm for faster responses', category: 'product', priority: 'high', outcome: 'Matching improved' },
          { id: 'p3w11t3', task: 'Facilitate first property transaction through platform', category: 'monetization', priority: 'critical', outcome: 'First transaction!' },
          { id: 'p3w11t4', task: 'Reach 40 active agents with monthly retention > 80%', category: 'supply', priority: 'high', outcome: '40 agents, high retention' },
          { id: 'p3w11t5', task: 'Launch agent leaderboard with gamification rewards', category: 'product', priority: 'medium', outcome: 'Gamification live' },
        ]},
      { weekNum: 12, label: 'Day 90 — Validation Complete', focus: 'Full metrics review, next quarter planning, fundraise decision',
        tasks: [
          { id: 'p3w12t1', task: 'Hit 3,000+ listings across all active cities', category: 'supply', priority: 'critical', outcome: '3,000 listings confirmed' },
          { id: 'p3w12t2', task: 'Compile comprehensive 90-day growth report with all KPIs', category: 'analytics', priority: 'critical', outcome: '90-day report complete' },
          { id: 'p3w12t3', task: 'Achieve 25,000+ monthly website visitors', category: 'seo', priority: 'critical', outcome: 'Traffic milestone validated' },
          { id: 'p3w12t4', task: 'Document first revenue signals (featured listings, premium agents)', category: 'monetization', priority: 'critical', outcome: 'Revenue signal documented' },
          { id: 'p3w12t5', task: 'Make go/no-go decision on formal fundraising round', category: 'brand', priority: 'critical', outcome: 'Fundraise decision made' },
          { id: 'p3w12t6', task: 'Plan Quarter 2 roadmap — set next 90-day targets', category: 'analytics', priority: 'high', outcome: 'Q2 roadmap ready' },
        ]},
    ],
    kpis: [
      { metric: 'Active Listings', start: '1,500', target: '3,000+' },
      { metric: 'Active Agents', start: '30', target: '40–50' },
      { metric: 'SEO Pages Indexed', start: '120', target: '200+' },
      { metric: 'Monthly Visitors', start: '20K', target: '25,000–35,000' },
      { metric: 'Cumulative Inquiries', start: '150', target: '300+' },
      { metric: 'First Revenue', start: '$0', target: 'Revenue signal proven' },
    ],
    founderFocus: [
      { area: 'Strategic Positioning', allocation: '35%', actions: ['Investor meetings', 'Pitch refinement', 'PR & visibility campaigns'] },
      { area: 'Partnerships', allocation: '25%', actions: ['Developer deal expansion', 'Bank integrations', 'Institutional pipeline'] },
      { area: 'Growth Execution', allocation: '25%', actions: ['Monetization experiment oversight', 'Agent retention programs', 'City expansion'] },
      { area: 'Product Oversight', allocation: '15%', actions: ['Revenue feature UX', 'AI accuracy refinement', 'Matching optimization'] },
    ],
  },
];

const NinetyDayMasterPlan = () => {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activePhase, setActivePhase] = useState('p1');

  const toggle = (id: string) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allTasks = phases.flatMap(p => p.weeks.flatMap(w => w.tasks));
  const doneCt = checked.size;
  const totalCt = allTasks.length;
  const overallPct = totalCt > 0 ? Math.round((doneCt / totalCt) * 100) : 0;

  const phase = phases.find(p => p.key === activePhase)!;
  const phaseTasks = phase.weeks.flatMap(w => w.tasks);
  const phaseDone = phaseTasks.filter(t => checked.has(t.id)).length;
  const phasePct = Math.round((phaseDone / phaseTasks.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">90-Day Master Execution Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          3 phases · 12 weeks · {totalCt} execution tasks — from activation to growth validation
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">90-Day Execution Progress</span>
            </div>
            <span className="text-sm font-bold text-foreground">{doneCt}/{totalCt} tasks</span>
          </div>
          <Progress value={overallPct} className="h-3 mb-1.5" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{overallPct}% complete</span>
            <span className="text-[10px] text-muted-foreground">
              {overallPct === 100 ? '🏆 90-day sprint complete!' :
               overallPct >= 66 ? '🔥 Growth validation phase' :
               overallPct >= 33 ? '⚡ Traction accelerating' : '🚀 Marketplace activation'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Phase Selectors */}
      <div className="grid grid-cols-3 gap-3">
        {phases.map(p => {
          const pt = p.weeks.flatMap(w => w.tasks);
          const pd = pt.filter(t => checked.has(t.id)).length;
          const pp = Math.round((pd / pt.length) * 100);
          return (
            <button key={p.key} onClick={() => setActivePhase(p.key)}
              className={`rounded-xl p-4 text-left transition-all border ${
                activePhase === p.key ? 'border-primary bg-primary/10' :
                pp === 100 ? 'border-green-500/30 bg-green-500/5' :
                'border-border/50 bg-card/40 hover:bg-muted/50'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <p.icon className={`h-5 w-5 ${p.color}`} />
                <span className="text-xs font-semibold text-foreground">Phase {p.phase}</span>
              </div>
              <p className="text-[11px] font-medium text-foreground mb-0.5">{p.name}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{p.dayRange}</p>
              <Progress value={pp} className="h-1.5 mb-1" />
              <span className="text-[9px] text-muted-foreground">{pd}/{pt.length} tasks · {pp}%</span>
            </button>
          );
        })}
      </div>

      {/* Active Phase Detail */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <phase.icon className={`h-6 w-6 ${phase.color}`} />
          <div>
            <h2 className="text-lg font-bold text-foreground">Phase {phase.phase}: {phase.name}</h2>
            <p className="text-[11px] text-muted-foreground">{phase.subtitle} · {phase.dayRange}</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">{phaseDone}/{phaseTasks.length} done</Badge>
        </div>

        {/* KPI Targets */}
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3">
            <p className="text-[11px] font-medium text-foreground mb-2 flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Phase {phase.phase} KPI Targets
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {phase.kpis.map(kpi => (
                <div key={kpi.metric} className="text-center">
                  <p className="text-[9px] text-muted-foreground">{kpi.start}</p>
                  <ArrowUpRight className="h-3 w-3 mx-auto text-green-500" />
                  <p className="text-sm font-bold text-foreground">{kpi.target}</p>
                  <p className="text-[9px] text-muted-foreground">{kpi.metric}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Tabs */}
        <Tabs defaultValue={`w-${phase.weeks[0].weekNum}`} className="w-full">
          <TabsList className="flex h-auto gap-1 bg-muted/50 p-1">
            {phase.weeks.map(w => {
              const wd = w.tasks.filter(t => checked.has(t.id)).length;
              return (
                <TabsTrigger key={w.weekNum} value={`w-${w.weekNum}`} className="text-xs gap-1 data-[state=active]:bg-background flex-1">
                  <span>W{w.weekNum}</span>
                  {wd === w.tasks.length && <CheckCircle className="h-3 w-3 text-green-500" />}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {phase.weeks.map(w => (
            <TabsContent key={w.weekNum} value={`w-${w.weekNum}`} className="mt-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Week {w.weekNum}: {w.label}</p>
                  <p className="text-[10px] text-muted-foreground">{w.focus}</p>
                </div>
                <Badge variant="outline" className="text-[9px]">{w.tasks.length} tasks</Badge>
              </div>

              {w.tasks.map(task => {
                const done = checked.has(task.id);
                const cat = catMeta[task.category];
                return (
                  <div key={task.id} className={`flex items-start gap-3 rounded-lg p-2.5 transition-all border ${
                    done ? 'border-green-500/20 bg-green-500/5' : 'border-border/30 bg-card/30'
                  }`}>
                    <Checkbox checked={done} onCheckedChange={() => toggle(task.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="outline" className={`text-[8px] px-1 py-0 ${priCls[task.priority]}`}>{task.priority}</Badge>
                        <span className={`text-[9px] ${cat.cls}`}>{cat.label}</span>
                        <span className="text-[9px] text-muted-foreground">→ {task.outcome}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>

        {/* Founder Focus Allocation */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Founder Focus Allocation — Phase {phase.phase}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {phase.founderFocus.map(f => (
                <div key={f.area} className="border border-border/40 rounded-lg p-3 bg-card/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-foreground">{f.area}</span>
                    <Badge variant="outline" className="text-[9px]">{f.allocation}</Badge>
                  </div>
                  {f.actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-1 mb-0.5">
                      <span className="text-[8px] text-muted-foreground mt-0.5">•</span>
                      <span className="text-[10px] text-muted-foreground">{a}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 90-Day Growth Trajectory */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            90-Day Growth Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {[
              { metric: 'Listings', vals: ['100', '500', '1,500', '3,000+'], icon: FileText },
              { metric: 'Agents', vals: ['5', '15', '30', '40–50'], icon: Users },
              { metric: 'SEO Pages', vals: ['15', '50', '120', '200+'], icon: Search },
              { metric: 'Traffic/mo', vals: ['2K', '8K', '20K', '30K+'], icon: Globe },
              { metric: 'Inquiries', vals: ['10', '50', '150', '300+'], icon: Megaphone },
            ].map(row => (
              <div key={row.metric} className="border border-border/40 rounded-lg p-2.5 bg-card/40">
                <div className="flex items-center gap-1 mb-2">
                  <row.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-foreground">{row.metric}</span>
                </div>
                {['W2', 'W4', 'W8', 'W12'].map((label, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-[9px] text-muted-foreground">{label}</span>
                    <span className="text-[10px] font-medium text-foreground">{row.vals[i]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day 90 Success */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Day 90 Success Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Must-Hit Milestones</p>
              {[
                '3,000+ active property listings',
                '40+ onboarded and retained agents',
                '200+ indexed SEO pages',
                '25,000+ monthly organic visitors',
                '300+ buyer inquiries generated',
                'First revenue from featured listings or premium agents',
                'Investor pitch deck with 90 days of real traction data',
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-1.5 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground">{m}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Stretch Goals</p>
              {[
                '5,000+ listings across 5+ cities',
                '50,000 monthly visitors with 40%+ organic',
                '5+ developer partnerships signed',
                'Rp 10M+ monthly recurring revenue',
                'Term sheet from seed investor',
                'First media feature or industry award',
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-1.5 mb-1">
                  <Star className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NinetyDayMasterPlan;
