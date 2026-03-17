import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Calendar, CheckCircle2, Circle, Clock, Target, Zap,
  Users, Building2, BarChart3, Search, Star, MessageSquare,
  TrendingUp, Eye, Megaphone, FileText, Play, BookOpen,
  Sparkles, ChevronRight, ArrowRight, Flame, PenLine,
  Phone, Send, Filter, Heart, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─── */

interface Task {
  title: string;
  category: 'product' | 'outreach' | 'content' | 'analytics';
  priority: 'critical' | 'high' | 'medium';
  owner: string;
  route?: string;
}

interface DayPlan {
  day: number;
  theme: string;
  icon: typeof Calendar;
  color: string;
  bgColor: string;
  focus: string;
  tasks: Task[];
  successMetric: string;
}

/* ─── Data ─── */

const SPRINT_DAYS: DayPlan[] = [
  {
    day: 1,
    theme: 'Foundation & First Impressions',
    icon: Zap,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    focus: 'Fix core UX friction and seed initial inventory',
    tasks: [
      { title: 'Audit listing card UI — improve price, location, and score clarity', category: 'product', priority: 'critical', owner: 'Product', route: '/properties' },
      { title: 'Test inquiry flow end-to-end — fix any friction or error states', category: 'product', priority: 'critical', owner: 'Product', route: '/properties' },
      { title: 'Add 3 new quality listings with complete media and descriptions', category: 'content', priority: 'high', owner: 'Ops', route: '/my-properties' },
      { title: 'Verify opportunity score displays correctly on all listing cards', category: 'product', priority: 'high', owner: 'Engineering', route: '/recommendations' },
    ],
    successMetric: '3 new listings live + inquiry flow tested with 0 errors',
  },
  {
    day: 2,
    theme: 'Agent Acquisition Blitz',
    icon: Users,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    focus: 'Build supply-side pipeline through direct agent outreach',
    tasks: [
      { title: 'Contact 5–7 property agents via WhatsApp/LinkedIn with platform pitch', category: 'outreach', priority: 'critical', owner: 'Growth' },
      { title: 'Onboard at least 1 serious agent — walk through listing creation flow', category: 'outreach', priority: 'critical', owner: 'Growth', route: '/my-properties' },
      { title: 'Publish 1 AI deal insight content post to Market Intelligence Feed', category: 'content', priority: 'high', owner: 'Content', route: '/market-intelligence-feed' },
      { title: 'Prepare agent onboarding kit — key features, commission structure, support', category: 'content', priority: 'medium', owner: 'Ops' },
    ],
    successMetric: '5+ agents contacted, 1 agent onboarded, 1 content post published',
  },
  {
    day: 3,
    theme: 'Search & Discovery Polish',
    icon: Search,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    focus: 'Make property discovery feel intelligent and effortless',
    tasks: [
      { title: 'Improve search filter UX — test mobile bottom sheet and sticky sidebar', category: 'product', priority: 'critical', owner: 'Product', route: '/properties' },
      { title: 'Test opportunity score ranking logic — verify elite deals surface correctly', category: 'product', priority: 'high', owner: 'Engineering', route: '/recommendations' },
      { title: 'Invite 5 potential investors to a private platform demo walkthrough', category: 'outreach', priority: 'critical', owner: 'Growth' },
      { title: 'Review AI Smart Feed recommendations for quality and relevance', category: 'analytics', priority: 'medium', owner: 'Product', route: '/recommendations' },
    ],
    successMetric: 'Search filters work flawlessly + 5 investor demo invites sent',
  },
  {
    day: 4,
    theme: 'Developer Partnerships',
    icon: Building2,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    focus: 'Open supply channel through developer project partnerships',
    tasks: [
      { title: 'Prepare developer partnership pitch deck — Launch Radar + demand forecast value prop', category: 'content', priority: 'critical', owner: 'Growth', route: '/launch-radar' },
      { title: 'Approach 1 developer project lead with partnership proposal', category: 'outreach', priority: 'critical', owner: 'Growth' },
      { title: 'Refine landing page hero messaging — sharpen value proposition copy', category: 'product', priority: 'high', owner: 'Product', route: '/landing' },
      { title: 'Test developer dashboard listing management flow', category: 'product', priority: 'medium', owner: 'Engineering', route: '/developer-dashboard' },
    ],
    successMetric: '1 developer contacted with partnership proposal + landing page refined',
  },
  {
    day: 5,
    theme: 'Engagement & Retention',
    icon: Heart,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    focus: 'Deepen investor engagement and nurture warm leads',
    tasks: [
      { title: 'Optimize watchlist UX — improve save confirmation and price alert signals', category: 'product', priority: 'high', owner: 'Product', route: '/investor-watchlist' },
      { title: 'Send personalized follow-up messages to warm investor leads from Day 3 demos', category: 'outreach', priority: 'critical', owner: 'Growth' },
      { title: 'Publish market trend content — city price analysis or investment insight article', category: 'content', priority: 'high', owner: 'Content', route: '/market-intelligence-feed' },
      { title: 'Review notification system — ensure deal alerts reach active users', category: 'product', priority: 'medium', owner: 'Engineering', route: '/notifications' },
    ],
    successMetric: 'Follow-ups sent to all demo leads + 1 market trend article published',
  },
  {
    day: 6,
    theme: 'Analytics & Optimization',
    icon: BarChart3,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    focus: 'Measure what worked, double down on signals, add more inventory',
    tasks: [
      { title: 'Review Daily Growth Monitor — check listings, users, inquiries metrics', category: 'analytics', priority: 'critical', owner: 'Product', route: '/daily-growth-monitor' },
      { title: 'Identify top conversion bottleneck and prioritize next feature improvement', category: 'analytics', priority: 'critical', owner: 'Product' },
      { title: 'Add 3 additional listings to maintain inventory growth momentum', category: 'content', priority: 'high', owner: 'Ops', route: '/my-properties' },
      { title: 'Test end-to-end flow: search → view → inquiry → response for new listings', category: 'product', priority: 'medium', owner: 'Engineering' },
    ],
    successMetric: 'Analytics reviewed + conversion bottleneck identified + 3 new listings',
  },
  {
    day: 7,
    theme: 'Demo, Learn & Plan',
    icon: Play,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    focus: 'Demonstrate progress, capture learnings, and plan next sprint',
    tasks: [
      { title: 'Run live demo session — show platform to 3–5 interested investors or agents', category: 'outreach', priority: 'critical', owner: 'Growth' },
      { title: 'Document weekly growth learnings — what worked, what needs iteration', category: 'analytics', priority: 'critical', owner: 'Product' },
      { title: 'Plan next 7-day execution sprint based on data and feedback from Week 1', category: 'analytics', priority: 'critical', owner: 'Product' },
      { title: 'Celebrate any wins — first agent onboarded, first external inquiry, first demo completed', category: 'analytics', priority: 'medium', owner: 'All' },
    ],
    successMetric: 'Live demo completed + retrospective documented + Sprint 2 planned',
  },
];

const SPRINT_KPIS = [
  { kpi: 'New Listings Added', target: '6+', icon: Building2 },
  { kpi: 'Agents Contacted', target: '5–7', icon: Phone },
  { kpi: 'Agents Onboarded', target: '1+', icon: Users },
  { kpi: 'Investor Demos', target: '5+', icon: Eye },
  { kpi: 'Content Published', target: '2+', icon: FileText },
  { kpi: 'Developer Contacted', target: '1', icon: Building2 },
];

const CATEGORY_COLORS: Record<string, string> = {
  product: 'text-primary border-primary/20',
  outreach: 'text-chart-2 border-chart-2/20',
  content: 'text-chart-4 border-chart-4/20',
  analytics: 'text-chart-1 border-chart-1/20',
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  medium: 'bg-muted text-muted-foreground border-border',
};

/* ─── Component ─── */

export default function SevenDaySprintPage() {
  const [activeTab, setActiveTab] = useState('sprint');
  const [expandedDay, setExpandedDay] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalTasks = SPRINT_DAYS.reduce((s, d) => s + d.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-chart-1" />
                </div>
                7-Day Traction Sprint
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                High-impact execution plan for visible marketplace growth signals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg font-black text-foreground">{completedCount}/{totalTasks}</p>
                <p className="text-[9px] text-muted-foreground">Tasks Done</p>
              </div>
              <div className="w-20 h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <Badge variant="outline" className="text-[10px] text-chart-2 border-chart-2/20">{progressPct}%</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="sprint">Daily Plan</TabsTrigger>
            <TabsTrigger value="kpis">Sprint KPIs</TabsTrigger>
          </TabsList>

          {/* ═══ SPRINT TAB ═══ */}
          <TabsContent value="sprint" className="space-y-3">
            {SPRINT_DAYS.map((day) => {
              const DIcon = day.icon;
              const isExpanded = expandedDay === day.day;
              const dayTasks = day.tasks.map((t, i) => `d${day.day}-t${i}`);
              const dayCompleted = dayTasks.filter(id => completedTasks.has(id)).length;
              const dayDone = dayCompleted === day.tasks.length;

              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: day.day * 0.03 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80',
                      dayDone && 'border-chart-2/20'
                    )}
                    onClick={() => setExpandedDay(isExpanded ? 0 : day.day)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', day.bgColor)}>
                          {dayDone ? (
                            <CheckCircle2 className="h-5 w-5 text-chart-2" />
                          ) : (
                            <DIcon className={cn('h-5 w-5', day.color)} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold">Day {day.day}</Badge>
                            <CardTitle className="text-sm">{day.theme}</CardTitle>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{day.focus}</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">{dayCompleted}/{day.tasks.length}</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1.5 mt-2">
                          {day.tasks.map((task, ti) => {
                            const taskId = `d${day.day}-t${ti}`;
                            const isDone = completedTasks.has(taskId);
                            return (
                              <div
                                key={ti}
                                className={cn(
                                  'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                                  isDone ? 'bg-chart-2/5 border-chart-2/10' : 'bg-card border-border/30 hover:border-border/50'
                                )}
                                onClick={() => toggleTask(taskId)}
                              >
                                <div className="mt-0.5">
                                  {isDone ? (
                                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground/30" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={cn(
                                    'text-[11px] font-medium',
                                    isDone ? 'text-muted-foreground line-through' : 'text-foreground'
                                  )}>
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Badge variant="outline" className={cn('text-[7px] px-1 py-0 h-3', CATEGORY_COLORS[task.category])}>
                                      {task.category}
                                    </Badge>
                                    <Badge variant="outline" className={cn('text-[7px] px-1 py-0 h-3', PRIORITY_STYLES[task.priority])}>
                                      {task.priority}
                                    </Badge>
                                    <span className="text-[8px] text-muted-foreground">→ {task.owner}</span>
                                    {task.route && (
                                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-3 text-primary border-primary/20">
                                        {task.route}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Success metric */}
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/10 mt-3">
                          <Target className="h-3 w-3 text-chart-2 flex-shrink-0" />
                          <p className="text-[10px] text-chart-2 font-medium">{day.successMetric}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ KPIs TAB ═══ */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {SPRINT_KPIS.map((k, i) => {
                const KIcon = k.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] text-muted-foreground font-medium">{k.kpi}</p>
                          <KIcon className="h-3.5 w-3.5 text-muted-foreground/20" />
                        </div>
                        <p className="text-lg font-black text-foreground mt-1">{k.target}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">7-day target</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Sprint principle */}
            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Sprint Execution Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      This sprint prioritizes visible traction signals over feature perfection. The goal is momentum: real listings from real agents, real investors seeing real demos, and real content building authority. Measure success by external actions (outreach sent, demos completed, listings added) — not internal metrics.
                    </p>
                  </div>
                  <Badge className="bg-chart-1 text-chart-1-foreground text-xs flex-shrink-0">Ship &gt; Perfect</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Weekly flow */}
            <Card className="border border-primary/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Weekly Rhythm</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Fix UX', 'Agent Blitz', 'Search Polish', 'Dev Pitch', 'Engage Leads', 'Analyze Data', 'Demo & Plan'].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Badge variant={i === 0 ? 'default' : 'outline'} className="text-[9px]">D{i + 1}: {step}</Badge>
                      {i < 6 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
