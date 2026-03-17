import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Target, CheckCircle2, ArrowRight, ChevronRight, Sparkles,
  Search, Users, BarChart3, DollarSign, Clock, Star,
  Building2, Handshake, Award, Flame, Eye, TrendingUp,
  Calendar, MessageSquare, AlertTriangle, Shield, Zap,
  Activity, Flag, Filter, Layers, RefreshCw, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

/* ─── Pipeline Stages ─── */

const PIPELINE_STAGES = [
  { stage: 'Identified', color: 'bg-muted-foreground', count: 50, description: 'Listings meeting baseline criteria' },
  { stage: 'Qualified', color: 'bg-chart-4', count: 25, description: 'Pricing + demand + agent verified' },
  { stage: 'Matched', color: 'bg-primary', count: 15, description: 'Buyer-listing pairs created' },
  { stage: 'Engaged', color: 'bg-chart-2', count: 8, description: 'Viewing done or offer discussion started' },
  { stage: 'Negotiating', color: 'bg-chart-1', count: 4, description: 'Active offer/counter-offer in progress' },
  { stage: 'Closing', color: 'bg-chart-5', count: 2, description: 'Terms agreed, legal process started' },
  { stage: 'Closed', color: 'bg-chart-2', count: 0, description: 'Transaction completed, commission earned' },
];

/* ─── Steps ─── */

const STEPS = [
  {
    id: 1,
    title: 'Identify High-Potential Listings',
    subtitle: 'Build the top of the funnel with 50 listings that have real closing potential',
    icon: Search,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    criteria: [
      { label: 'Price Realism', filter: 'AI valuation gap < 15%', rationale: 'Overpriced listings waste pipeline capacity — they attract inquiries but never close' },
      { label: 'Demand Zone', filter: 'Market heat score ≥ 50', rationale: 'Properties in active demand zones have shorter time-to-close and stronger negotiation position' },
      { label: 'Agent Response', filter: 'Avg response < 12h', rationale: 'Unresponsive agents are the #1 pipeline blocker — test before investing effort' },
      { label: 'Legal Readiness', filter: 'Certificate status: verified', rationale: 'Legal issues surface late and kill deals — pre-screen eliminates wasted cycles' },
    ],
    weeklyTarget: '10 new qualified listings added to pipeline',
    toolRoute: '/properties',
  },
  {
    id: 2,
    title: 'Shortlist Serious Investors',
    subtitle: 'Match demand signals to supply — find the buyers already showing intent',
    icon: Users,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    criteria: [
      { label: 'Save Frequency', filter: '5+ listings saved in 30 days', rationale: 'High save rate = active search mode. These users are comparing options and nearing decision.' },
      { label: 'AI Feature Usage', filter: 'Used Super Engine or CMA 2+ times', rationale: 'Users who analyze properties deeply are closer to buying than casual browsers' },
      { label: 'Demo Attendance', filter: 'Attended live demo session', rationale: 'Demo attendees have seen platform value firsthand — warmest possible leads' },
      { label: 'Inquiry History', filter: 'Submitted 2+ inquiries', rationale: 'Multiple inquiries = active buyer searching for the right match, not just browsing' },
    ],
    weeklyTarget: '5 new qualified investors matched to pipeline listings',
    toolRoute: '/agent-crm',
  },
  {
    id: 3,
    title: 'Assign Deal Priority Score',
    subtitle: 'Not all deals are equal — score each match to focus effort on highest-probability closures',
    icon: Target,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    criteria: [
      { label: 'Urgency Level (40%)', filter: 'Buyer timeline < 60 days', rationale: 'Time-pressured buyers close. "Someday" buyers don\'t. Weight urgency highest.' },
      { label: 'Negotiation Flexibility (25%)', filter: 'Seller willing to negotiate ≥ 5%', rationale: 'Rigid pricing kills deals. Flexible sellers enable creative deal structuring.' },
      { label: 'Investor Readiness (20%)', filter: 'Financing confirmed or cash buyer', rationale: 'Financing uncertainty is the most common late-stage deal killer.' },
      { label: 'Property Score (15%)', filter: 'Opportunity score ≥ 70', rationale: 'Higher-scoring properties are easier to sell — data backs the investment thesis.' },
    ],
    weeklyTarget: 'Re-score all active matches every Monday',
    toolRoute: '/deal-finder',
  },
  {
    id: 4,
    title: 'Active Deal Facilitation',
    subtitle: 'Don\'t wait for deals to happen — make them happen through structured facilitation',
    icon: Handshake,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    criteria: [
      { label: 'Viewing Coordination', filter: 'Schedule within 48h of match', rationale: 'Speed creates momentum. Delayed viewings lose buyer enthusiasm and allow competitor capture.' },
      { label: 'Offer Structuring', filter: 'AI-guided price range provided', rationale: 'Buyers who know the fair range submit better offers — fewer rejections, faster convergence.' },
      { label: 'Follow-Up Discipline', filter: '72h max between touchpoints', rationale: 'Silence kills deals. Regular contact maintains psychological commitment from both parties.' },
      { label: 'Objection Handling', filter: 'Document and address within 24h', rationale: 'Every unanswered objection becomes a reason to walk away. Surface and resolve proactively.' },
    ],
    weeklyTarget: '3+ active facilitation conversations per week',
    toolRoute: '/my-offers',
  },
  {
    id: 5,
    title: 'Weekly Pipeline Review',
    subtitle: 'Every Monday: what moved, what\'s stuck, what needs to change',
    icon: RefreshCw,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    criteria: [
      { label: 'Stage Movement', filter: 'Track deals advancing or stalling', rationale: 'Deals that don\'t move forward for 2 weeks are dying — intervene or deprioritize.' },
      { label: 'Blockage Identification', filter: 'Flag deals with no activity > 7 days', rationale: 'Most deals die silently. Proactive identification prevents invisible pipeline leakage.' },
      { label: 'Strategy Adjustment', filter: 'Reallocate effort to highest-probability deals', rationale: 'Sunk cost bias keeps you working dead deals. Ruthless prioritization closes more.' },
      { label: 'New Pipeline Intake', filter: 'Replenish top-of-funnel weekly', rationale: 'Pipeline attrition is natural. Consistent top-of-funnel refill maintains closing velocity.' },
    ],
    weeklyTarget: '30-min structured review every Monday 09:00',
    toolRoute: '/agent-crm',
  },
];

/* ─── Conversion Math ─── */

const CONVERSION_MATH = [
  { from: 'Identified', to: 'Qualified', rate: '50%', math: '50 → 25' },
  { from: 'Qualified', to: 'Matched', rate: '60%', math: '25 → 15' },
  { from: 'Matched', to: 'Engaged', rate: '53%', math: '15 → 8' },
  { from: 'Engaged', to: 'Negotiating', rate: '50%', math: '8 → 4' },
  { from: 'Negotiating', to: 'Closing', rate: '50%', math: '4 → 2' },
  { from: 'Closing', to: 'Closed', rate: '80%', math: '2 → 1.6' },
];

/* ─── Weekly Cadence ─── */

const WEEKLY_CADENCE = [
  { day: 'Monday', focus: 'Pipeline Review + Priority Scoring', tasks: ['Review all active deals by stage', 'Re-score deal priorities', 'Identify stuck deals and plan interventions', 'Set 3 focus deals for the week'], icon: BarChart3, color: 'text-primary' },
  { day: 'Tuesday', focus: 'New Supply Intake', tasks: ['Add 10 new qualified listings to pipeline', 'Test agent responsiveness on new listings', 'Update market heat data for target zones'], icon: Building2, color: 'text-chart-1' },
  { day: 'Wednesday', focus: 'Investor Outreach', tasks: ['Contact 5 matched investors with property insights', 'Follow up on pending viewing requests', 'Send AI analysis reports to warm leads'], icon: Users, color: 'text-chart-2' },
  { day: 'Thursday', focus: 'Active Facilitation', tasks: ['Coordinate viewings for engaged deals', 'Guide offer structuring for ready buyers', 'Handle objections on in-progress negotiations'], icon: Handshake, color: 'text-chart-4' },
  { day: 'Friday', focus: 'Follow-Up & Documentation', tasks: ['Follow up all open conversations', 'Document deal progress and learnings', 'Prepare next week\'s pipeline targets'], icon: MessageSquare, color: 'text-chart-5' },
];

export default function DealPipelinePage() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [expandedStep, setExpandedStep] = useState(1);

  const totalTarget = 10;
  const currentClosed = 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-chart-1" />
                </div>
                Deal Pipeline: First 10 Closures
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Structured pipeline management for early transaction velocity</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">
                <Target className="h-3 w-3 mr-1.5" />
                {currentClosed} / {totalTarget} deals closed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pipeline">Pipeline Funnel</TabsTrigger>
            <TabsTrigger value="playbook">5-Step Playbook</TabsTrigger>
            <TabsTrigger value="cadence">Weekly Cadence</TabsTrigger>
          </TabsList>

          {/* ═══ PIPELINE FUNNEL ═══ */}
          <TabsContent value="pipeline" className="space-y-4">
            {/* Visual funnel */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Pipeline Funnel — Path to 10 Deals
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">To close 10 deals, you need ~50 qualified listings and ~25 matched investors entering the funnel</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {PIPELINE_STAGES.map((s, i) => {
                    const widthPct = Math.max(15, (s.count / 50) * 100);
                    return (
                      <div key={s.stage} className="flex items-center gap-3">
                        <p className="text-[9px] font-bold text-muted-foreground w-20 text-right flex-shrink-0">{s.stage}</p>
                        <div className="flex-1">
                          <div className="relative h-7 rounded-md bg-muted/10 border border-border/20 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPct}%` }}
                              transition={{ delay: i * 0.08, duration: 0.4 }}
                              className={cn('absolute inset-y-0 left-0 rounded-md', s.color, 'opacity-20')}
                            />
                            <div className="absolute inset-0 flex items-center px-3 justify-between">
                              <span className="text-[10px] font-bold text-foreground">{s.count} deals</span>
                              <span className="text-[8px] text-muted-foreground">{s.description}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Conversion math */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-chart-2" />
                  Conversion Rate Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONVERSION_MATH.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/10 border border-border/20">
                      <div className="flex items-center gap-1 mb-1">
                        <Badge variant="outline" className="text-[6px] px-1 py-0 h-3">{c.from}</Badge>
                        <ArrowRight className="h-2 w-2 text-muted-foreground" />
                        <Badge variant="outline" className="text-[6px] px-1 py-0 h-3">{c.to}</Badge>
                      </div>
                      <p className="text-sm font-black text-foreground">{c.rate}</p>
                      <p className="text-[8px] text-muted-foreground">{c.math}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Pipeline Math</p>
                    <p className="text-[11px] text-muted-foreground">
                      At a 3.2% overall conversion rate (Identified → Closed), you need ~310 identified listings to close 10 deals. But with active facilitation improving each stage by 10–15%, you can close 10 from ~200 identified listings. The playbook below maximizes each conversion step.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ 5-STEP PLAYBOOK ═══ */}
          <TabsContent value="playbook" className="space-y-3">
            {/* Step nav */}
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STEPS.map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedStep(s.id)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-bold transition-all',
                            expandedStep === s.id ? cn(s.bgColor, s.color) : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
                          )}
                        >
                          <SIcon className="h-3 w-3" />
                          Step {s.id}
                        </button>
                        {i < STEPS.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {STEPS.map((step) => {
              const SIcon = step.icon;
              const isExpanded = expandedStep === step.id;
              return (
                <motion.div key={step.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: step.id * 0.04 }}>
                  <Card
                    className={cn('border bg-card transition-all cursor-pointer', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedStep(isExpanded ? 0 : step.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', step.bgColor)}>
                          <SIcon className={cn('h-5 w-5', step.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn('text-[7px] font-bold', step.color)}>Step {step.id}</Badge>
                            <CardTitle className="text-sm">{step.title}</CardTitle>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.subtitle}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 mb-3">
                          {step.criteria.map((c, ci) => (
                            <div key={ci} className="p-2.5 rounded-lg border border-border/30 bg-card">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-bold text-foreground">{c.label}</p>
                                <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">{c.filter}</Badge>
                              </div>
                              <p className="text-[9px] text-muted-foreground">{c.rationale}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/10 flex-1">
                            <Target className="h-3.5 w-3.5 text-chart-2 flex-shrink-0" />
                            <p className="text-[10px] text-chart-2 font-medium">{step.weeklyTarget}</p>
                          </div>
                          <Badge variant="outline" className="text-[8px] text-primary border-primary/20 flex-shrink-0">{step.toolRoute}</Badge>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ WEEKLY CADENCE ═══ */}
          <TabsContent value="cadence" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Consistent weekly rhythm creates compounding pipeline momentum. Every day has a primary focus — don't mix activities.</p>

            {WEEKLY_CADENCE.map((d, i) => {
              const DIcon = d.icon;
              return (
                <motion.div key={d.day} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                          <DIcon className={cn('h-4 w-4', d.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-xs font-black text-foreground">{d.day}</p>
                            <Badge variant="outline" className={cn('text-[7px]', d.color)}>{d.focus}</Badge>
                          </div>
                          <div className="space-y-1">
                            {d.tasks.map((t, ti) => (
                              <div key={ti} className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground">{t}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Compounding Rhythm</p>
                    <p className="text-[11px] text-muted-foreground">
                      Week 1 feels slow — you're loading the funnel. By Week 4, earlier-stage deals start reaching negotiation. By Week 8, you should see 1–2 closings per week. The cadence doesn't change — the pipeline density does. Trust the rhythm.
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">8-Week Arc</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
