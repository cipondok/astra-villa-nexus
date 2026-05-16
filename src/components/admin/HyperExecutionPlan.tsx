
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Rocket, Zap, TrendingUp, Trophy, BarChart3, CheckCircle,
  Target, Users, Search, Video, Handshake, Cpu,
  Globe, FileText, Star, ArrowUpRight, Clock, Shield
} from 'lucide-react';

interface DayTask {
  id: string;
  task: string;
  category: 'supply' | 'seo' | 'social' | 'product' | 'partnerships' | 'analytics' | 'brand';
  priority: 'critical' | 'high' | 'medium';
  outcome: string;
}

interface WeekData {
  key: string;
  week: number;
  name: string;
  theme: string;
  icon: typeof Rocket;
  color: string;
  days: { day: number; focus: string; tasks: DayTask[] }[];
  kpis: { metric: string; target: string }[];
}

const catMeta: Record<string, { label: string; color: string }> = {
  supply: { label: 'Supply', color: 'text-blue-500' },
  seo: { label: 'SEO', color: 'text-green-500' },
  social: { label: 'Social', color: 'text-pink-500' },
  product: { label: 'Product', color: 'text-purple-500' },
  partnerships: { label: 'Partners', color: 'text-orange-500' },
  analytics: { label: 'Analytics', color: 'text-amber-500' },
  brand: { label: 'Brand', color: 'text-cyan-500' },
};

const priColors: Record<string, string> = {
  critical: 'border-destructive/50 text-destructive bg-destructive/10',
  high: 'border-amber-500/50 text-amber-500 bg-amber-500/10',
  medium: 'border-muted-foreground/30 text-muted-foreground bg-muted/30',
};

const weeks: WeekData[] = [
  {
    key: 'w1', week: 1, name: 'Platform Activation', theme: 'Go live, seed inventory, validate AI, ignite social',
    icon: Rocket, color: 'text-green-500',
    days: [
      { day: 1, focus: 'Launch Day Zero', tasks: [
        { id: 'w1d1t1', task: 'Publish first 50 seed listings across 2 target cities', category: 'supply', priority: 'critical', outcome: '50 live listings' },
        { id: 'w1d1t2', task: 'Verify AI valuation scores render correctly on all listing cards', category: 'product', priority: 'critical', outcome: 'AI scores visible' },
        { id: 'w1d1t3', task: 'Submit sitemap to Google Search Console', category: 'seo', priority: 'critical', outcome: 'Indexing initiated' },
        { id: 'w1d1t4', task: 'Post launch announcement on LinkedIn, Instagram, TikTok', category: 'social', priority: 'high', outcome: 'Social launch live' },
      ]},
      { day: 2, focus: 'Agent Outreach Begins', tasks: [
        { id: 'w1d2t1', task: 'Contact 20 target agents via WhatsApp with onboarding invite', category: 'supply', priority: 'critical', outcome: '20 agents contacted' },
        { id: 'w1d2t2', task: 'Publish first 3 SEO location pages (province-level)', category: 'seo', priority: 'high', outcome: '3 SEO pages live' },
        { id: 'w1d2t3', task: 'Record and post first property tour short-form video', category: 'social', priority: 'high', outcome: '1 video published' },
        { id: 'w1d2t4', task: 'Test AI deal intelligence signals on 10 sample properties', category: 'product', priority: 'high', outcome: 'Deal signals validated' },
      ]},
      { day: 3, focus: 'Content Pipeline Start', tasks: [
        { id: 'w1d3t1', task: 'Add 20 more listings — mix of apartments, houses, land', category: 'supply', priority: 'critical', outcome: '70 total listings' },
        { id: 'w1d3t2', task: 'Publish 5 more SEO location pages (city + district level)', category: 'seo', priority: 'high', outcome: '8 total SEO pages' },
        { id: 'w1d3t3', task: 'Post 2 short-form videos (property walkthrough + AI feature demo)', category: 'social', priority: 'medium', outcome: '3 total videos' },
      ]},
      { day: 4, focus: 'First Agent Onboarding', tasks: [
        { id: 'w1d4t1', task: 'Conduct first agent onboarding session (1-on-1 walkthrough)', category: 'supply', priority: 'critical', outcome: 'First agent activated' },
        { id: 'w1d4t2', task: 'Set up Google Analytics 4 events and conversion tracking', category: 'analytics', priority: 'high', outcome: 'Analytics tracking live' },
        { id: 'w1d4t3', task: 'Publish first market insight blog post for SEO authority', category: 'seo', priority: 'medium', outcome: '1 blog post live' },
      ]},
      { day: 5, focus: 'Week 1 Sprint Close', tasks: [
        { id: 'w1d5t1', task: 'Push to 100 listings milestone', category: 'supply', priority: 'critical', outcome: '100 listings reached' },
        { id: 'w1d5t2', task: 'First developer partnership outreach (3 developers contacted)', category: 'partnerships', priority: 'high', outcome: '3 developers contacted' },
        { id: 'w1d5t3', task: 'Review Week 1 metrics and document learnings', category: 'analytics', priority: 'high', outcome: 'Week 1 report complete' },
        { id: 'w1d5t4', task: 'Schedule 5 agent onboarding sessions for Week 2', category: 'supply', priority: 'high', outcome: '5 sessions booked' },
      ]},
    ],
    kpis: [
      { metric: 'Active Listings', target: '100' },
      { metric: 'SEO Pages Published', target: '10-15' },
      { metric: 'Agents Contacted', target: '20' },
      { metric: 'Social Videos Posted', target: '5' },
      { metric: 'AI Scores Verified', target: '100% coverage' },
      { metric: 'Website Visitors', target: '500-1,000' },
    ],
  },
  {
    key: 'w2', week: 2, name: 'Supply Acceleration', theme: 'Scale agent network, grow inventory, build SEO momentum',
    icon: Zap, color: 'text-blue-500',
    days: [
      { day: 6, focus: 'Agent Pipeline Sprint', tasks: [
        { id: 'w2d1t1', task: 'Contact 30 more agents — focus on agents with 20+ listing portfolios', category: 'supply', priority: 'critical', outcome: '50 total agents contacted' },
        { id: 'w2d1t2', task: 'Conduct 3 agent onboarding sessions', category: 'supply', priority: 'critical', outcome: '3 agents onboarded' },
        { id: 'w2d1t3', task: 'Publish 10 district-level SEO pages', category: 'seo', priority: 'high', outcome: '25 total SEO pages' },
      ]},
      { day: 7, focus: 'Listing Quality Push', tasks: [
        { id: 'w2d2t1', task: 'Quality audit all 100+ listings — photos, descriptions, pricing accuracy', category: 'supply', priority: 'critical', outcome: 'Quality baseline established' },
        { id: 'w2d2t2', task: 'Implement AI-generated description suggestions for low-quality listings', category: 'product', priority: 'high', outcome: 'AI descriptions active' },
        { id: 'w2d2t3', task: 'Post 3 property videos + 1 "how to use AI features" explainer', category: 'social', priority: 'medium', outcome: '9 total videos' },
      ]},
      { day: 8, focus: 'Developer Sourcing', tasks: [
        { id: 'w2d3t1', task: 'Secure first developer project listing (10+ units from one project)', category: 'partnerships', priority: 'critical', outcome: 'First project partnership' },
        { id: 'w2d3t2', task: 'Add 50 new listings from agent uploads + developer project', category: 'supply', priority: 'critical', outcome: '150+ total listings' },
        { id: 'w2d3t3', task: 'Check Google Search Console for first indexed pages', category: 'seo', priority: 'high', outcome: 'Indexing status confirmed' },
      ]},
      { day: 9, focus: 'Community Building', tasks: [
        { id: 'w2d4t1', task: 'Host first virtual agent meetup (15-20 invited agents)', category: 'supply', priority: 'high', outcome: 'Agent community seeded' },
        { id: 'w2d4t2', task: 'Publish 15 more SEO pages (sub-district level targeting)', category: 'seo', priority: 'high', outcome: '40 total SEO pages' },
        { id: 'w2d4t3', task: 'First LinkedIn thought leadership post (founder personal brand)', category: 'brand', priority: 'medium', outcome: 'Founder brand started' },
      ]},
      { day: 10, focus: 'Week 2 Metrics Review', tasks: [
        { id: 'w2d5t1', task: 'Push to 200 listings milestone', category: 'supply', priority: 'critical', outcome: '200 listings reached' },
        { id: 'w2d5t2', task: 'Activate 8-10 agents with verified listings on platform', category: 'supply', priority: 'critical', outcome: '10 active agents' },
        { id: 'w2d5t3', task: 'Review traffic sources, bounce rates, and user behavior patterns', category: 'analytics', priority: 'high', outcome: 'Week 2 report with insights' },
      ]},
    ],
    kpis: [
      { metric: 'Active Listings', target: '200' },
      { metric: 'Active Agents', target: '10' },
      { metric: 'SEO Pages Indexed', target: '20-30' },
      { metric: 'Developer Partners', target: '1' },
      { metric: 'Social Videos Total', target: '12' },
      { metric: 'Website Visitors', target: '2,000-3,000' },
    ],
  },
  {
    key: 'w3', week: 3, name: 'Market Momentum', theme: 'Strengthen traffic signals, authority content, UX refinement',
    icon: TrendingUp, color: 'text-purple-500',
    days: [
      { day: 11, focus: 'Authority Content Sprint', tasks: [
        { id: 'w3d1t1', task: 'Publish 3 in-depth market analysis articles (1,500+ words each)', category: 'seo', priority: 'critical', outcome: 'Authority content live' },
        { id: 'w3d1t2', task: 'Create city-specific investment guide landing pages', category: 'seo', priority: 'high', outcome: 'Guide pages live' },
        { id: 'w3d1t3', task: 'Push to 250 listings with quality scores > 70%', category: 'supply', priority: 'critical', outcome: '250 quality listings' },
      ]},
      { day: 12, focus: 'UX Refinement Day', tasks: [
        { id: 'w3d2t1', task: 'Fix top 5 UX issues identified from user behavior analytics', category: 'product', priority: 'critical', outcome: 'UX friction reduced' },
        { id: 'w3d2t2', task: 'Optimize listing detail page load time to < 2 seconds', category: 'product', priority: 'high', outcome: 'Performance improved' },
        { id: 'w3d2t3', task: 'A/B test 2 different listing card layouts', category: 'product', priority: 'medium', outcome: 'A/B test running' },
      ]},
      { day: 13, focus: 'Traffic Growth Actions', tasks: [
        { id: 'w3d3t1', task: 'Publish 20 more SEO pages — target long-tail property keywords', category: 'seo', priority: 'critical', outcome: '60+ SEO pages total' },
        { id: 'w3d3t2', task: 'Launch small Google Search ad test (Rp 2M budget, 10 keywords)', category: 'analytics', priority: 'high', outcome: 'Paid test live' },
        { id: 'w3d3t3', task: 'Post daily social content (3 videos this week targeting virality)', category: 'social', priority: 'high', outcome: 'Social velocity up' },
      ]},
      { day: 14, focus: 'Agent Expansion Push', tasks: [
        { id: 'w3d4t1', task: 'Onboard 5 more agents — target different property specializations', category: 'supply', priority: 'critical', outcome: '15 active agents' },
        { id: 'w3d4t2', task: 'Contact 2 more property developers for project listings', category: 'partnerships', priority: 'high', outcome: '3 developer contacts' },
        { id: 'w3d4t3', task: 'Set up automated listing quality alerts in admin dashboard', category: 'product', priority: 'medium', outcome: 'Quality automation live' },
      ]},
      { day: 15, focus: 'Mid-Point Assessment', tasks: [
        { id: 'w3d5t1', task: 'Push to 350 listings milestone', category: 'supply', priority: 'critical', outcome: '350 listings' },
        { id: 'w3d5t2', task: 'Compile 15-day traction report with growth charts', category: 'analytics', priority: 'critical', outcome: 'Mid-point report ready' },
        { id: 'w3d5t3', task: 'Identify top 3 growth levers to double down on for Week 4', category: 'analytics', priority: 'high', outcome: 'Strategy refined' },
      ]},
    ],
    kpis: [
      { metric: 'Active Listings', target: '350' },
      { metric: 'Active Agents', target: '15' },
      { metric: 'SEO Pages Published', target: '60+' },
      { metric: 'Weekly Organic Traffic', target: '1,000-2,000' },
      { metric: 'First Buyer Inquiries', target: '10-20' },
      { metric: 'Social Followers', target: '500-1,000' },
    ],
  },
  {
    key: 'w4', week: 4, name: 'Traction Validation', theme: 'Hit milestones, prove marketplace activity, prep investor narrative',
    icon: Trophy, color: 'text-amber-500',
    days: [
      { day: 16, focus: 'Milestone Sprint Start', tasks: [
        { id: 'w4d1t1', task: 'Push aggressively to 500 listings — coordinate agent + developer uploads', category: 'supply', priority: 'critical', outcome: '500 listings in sight' },
        { id: 'w4d1t2', task: 'Publish press-style content: "500 Listings in 30 Days" narrative draft', category: 'brand', priority: 'high', outcome: 'PR content drafted' },
        { id: 'w4d1t3', task: 'Launch investor-facing KPI dashboard snapshot', category: 'analytics', priority: 'high', outcome: 'Investor metrics visible' },
      ]},
      { day: 17, focus: 'Marketplace Activity Proof', tasks: [
        { id: 'w4d2t1', task: 'Generate first 20+ buyer inquiries through platform', category: 'supply', priority: 'critical', outcome: 'Demand signal proven' },
        { id: 'w4d2t2', task: 'Track and document agent response rates to inquiries', category: 'analytics', priority: 'high', outcome: 'Response rate baseline' },
        { id: 'w4d2t3', task: 'Publish 20 more SEO pages — push past 80 total indexed', category: 'seo', priority: 'high', outcome: '80+ SEO pages' },
      ]},
      { day: 18, focus: 'Partnership Showcase', tasks: [
        { id: 'w4d3t1', task: 'Finalize first developer partnership with signed agreement', category: 'partnerships', priority: 'critical', outcome: 'Partnership signed' },
        { id: 'w4d3t2', task: 'Create partnership case study for investor deck', category: 'brand', priority: 'high', outcome: 'Case study ready' },
        { id: 'w4d3t3', task: 'Reach 20 active agents on platform', category: 'supply', priority: 'high', outcome: '20 active agents' },
      ]},
      { day: 19, focus: 'Traction Documentation', tasks: [
        { id: 'w4d4t1', task: 'Compile full 30-day growth metrics with WoW charts', category: 'analytics', priority: 'critical', outcome: 'Traction deck ready' },
        { id: 'w4d4t2', task: 'Update pitch deck with real traction data', category: 'brand', priority: 'critical', outcome: 'Pitch deck refreshed' },
        { id: 'w4d4t3', task: 'Record 3-minute product demo video with real listings + AI features', category: 'brand', priority: 'high', outcome: 'Demo video ready' },
      ]},
      { day: 20, focus: 'Day 30 — Victory Lap', tasks: [
        { id: 'w4d5t1', task: 'Confirm 500+ listings milestone reached', category: 'supply', priority: 'critical', outcome: '500 listings confirmed' },
        { id: 'w4d5t2', task: 'Publish "30-Day Launch Report" on LinkedIn + blog', category: 'brand', priority: 'critical', outcome: 'Launch story published' },
        { id: 'w4d5t3', task: 'Send first investor update email to warm pipeline', category: 'analytics', priority: 'critical', outcome: 'Investor outreach initiated' },
        { id: 'w4d5t4', task: 'Plan next 30 days — set targets for Month 2', category: 'analytics', priority: 'high', outcome: 'Month 2 roadmap set' },
      ]},
    ],
    kpis: [
      { metric: 'Active Listings', target: '500+' },
      { metric: 'Active Agents', target: '20' },
      { metric: 'SEO Pages Indexed', target: '50-80' },
      { metric: 'Monthly Organic Traffic', target: '5,000-8,000' },
      { metric: 'Buyer Inquiries', target: '30-50' },
      { metric: 'Developer Partners', target: '1-2 signed' },
    ],
  },
];

const HyperExecutionPlan = () => {
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [activeWeek, setActiveWeek] = useState('w1');

  const toggleTask = (id: string) => {
    setCheckedTasks(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const allTasks = weeks.flatMap(w => w.days.flatMap(d => d.tasks));
  const totalTasks = allTasks.length;
  const completedTasks = checkedTasks.size;
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">30-Day Hyper Execution Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          4-week launch sprint — {totalTasks} tasks across supply, SEO, social, product, and partnerships
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Launch Execution Progress</span>
            </div>
            <span className="text-sm font-bold text-foreground">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <Progress value={overallPct} className="h-3 mb-1.5" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{overallPct}% complete</span>
            <span className="text-[10px] text-muted-foreground">
              {overallPct === 100 ? '🏆 30-day sprint complete!' :
               overallPct >= 75 ? '🔥 Final stretch' :
               overallPct >= 50 ? '⚡ Momentum building' :
               overallPct >= 25 ? '🚀 Gaining speed' : '☀️ Launch sequence initiated'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Week Progress Cards */}
      <div className="grid grid-cols-4 gap-2">
        {weeks.map((w) => {
          const wTasks = w.days.flatMap(d => d.tasks);
          const wDone = wTasks.filter(t => checkedTasks.has(t.id)).length;
          const wPct = Math.round((wDone / wTasks.length) * 100);
          return (
            <button
              key={w.key}
              onClick={() => setActiveWeek(w.key)}
              className={`rounded-xl p-3 text-left transition-all border ${
                activeWeek === w.key ? 'border-primary bg-primary/10' :
                wPct === 100 ? 'border-green-500/30 bg-green-500/5' :
                'border-border/50 bg-card/40 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <w.icon className={`h-4 w-4 ${w.color}`} />
                <span className="text-[11px] font-semibold text-foreground">Week {w.week}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1.5">{w.name}</p>
              <Progress value={wPct} className="h-1 mb-0.5" />
              <span className="text-[9px] text-muted-foreground">{wDone}/{wTasks.length} tasks</span>
            </button>
          );
        })}
      </div>

      {/* Active Week Detail */}
      {(() => {
        const week = weeks.find(w => w.key === activeWeek);
        if (!week) return null;

        return (
          <div className="space-y-4">
            {/* Week Header */}
            <div className="flex items-center gap-3">
              <week.icon className={`h-6 w-6 ${week.color}`} />
              <div>
                <h2 className="text-lg font-bold text-foreground">Week {week.week}: {week.name}</h2>
                <p className="text-[11px] text-muted-foreground">{week.theme}</p>
              </div>
            </div>

            {/* KPI Targets */}
            <Card className="bg-muted/20 border-border/30">
              <CardContent className="p-3">
                <p className="text-[11px] font-medium text-foreground mb-2 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> Week {week.week} KPI Targets
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {week.kpis.map((kpi) => (
                    <div key={kpi.metric} className="text-center">
                      <p className="text-sm font-bold text-foreground">{kpi.target}</p>
                      <p className="text-[9px] text-muted-foreground">{kpi.metric}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Day-by-Day */}
            <Tabs defaultValue={`day-${week.days[0].day}`} className="w-full">
              <TabsList className="flex h-auto gap-1 bg-muted/50 p-1">
                {week.days.map((day) => {
                  const dayDone = day.tasks.filter(t => checkedTasks.has(t.id)).length;
                  return (
                    <TabsTrigger key={day.day} value={`day-${day.day}`} className="text-xs gap-1 data-[state=active]:bg-background flex-1">
                      <span>Day {day.day}</span>
                      {dayDone === day.tasks.length && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {week.days.map((day) => (
                <TabsContent key={day.day} value={`day-${day.day}`} className="mt-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-semibold text-foreground">Day {day.day} — {day.focus}</p>
                    <Badge variant="outline" className="text-[9px]">{day.tasks.length} tasks</Badge>
                  </div>

                  {day.tasks.map((task) => {
                    const checked = checkedTasks.has(task.id);
                    const cat = catMeta[task.category];
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 rounded-lg p-2.5 transition-all border ${
                          checked ? 'border-green-500/20 bg-green-500/5' : 'border-border/30 bg-card/30'
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-medium ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.task}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <Badge variant="outline" className={`text-[8px] px-1 py-0 ${priColors[task.priority]}`}>{task.priority}</Badge>
                            <span className={`text-[9px] ${cat.color}`}>{cat.label}</span>
                            <span className="text-[9px] text-muted-foreground">→ {task.outcome}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );
      })()}

      {/* 30-Day Growth Trajectory */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            30-Day Growth Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { metric: 'Listings', w1: '100', w2: '200', w3: '350', w4: '500+', icon: FileText },
              { metric: 'Agents', w1: '3-5', w2: '10', w3: '15', w4: '20', icon: Users },
              { metric: 'SEO Pages', w1: '15', w2: '40', w3: '60', w4: '80+', icon: Search },
              { metric: 'Traffic', w1: '1K', w2: '3K', w3: '5K', w4: '8K', icon: Globe },
            ].map((row) => (
              <div key={row.metric} className="border border-border/40 rounded-lg p-2.5 bg-card/40">
                <div className="flex items-center gap-1 mb-2">
                  <row.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-foreground">{row.metric}</span>
                </div>
                {[row.w1, row.w2, row.w3, row.w4].map((val, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-[9px] text-muted-foreground">W{i + 1}</span>
                    <span className="text-[10px] font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Criteria */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Day 30 Success Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Must-Hit Milestones</p>
              {[
                '500+ active property listings',
                '20+ onboarded and active agents',
                '50+ SEO pages indexed by Google',
                '30+ buyer inquiries generated',
                '1 signed developer partnership',
                'Investor traction deck updated with real data',
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
                '1,000 listings across 3+ cities',
                '10,000 monthly organic visitors',
                '100+ buyer inquiries',
                '3+ developer partnerships',
                'First revenue transaction on platform',
                'Media coverage or podcast appearance',
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

export default HyperExecutionPlan;
