import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Brain, Crosshair, Shield, Flame, Target, Eye, Zap,
  TrendingUp, Clock, Activity, BarChart3, Globe, Users,
  AlertTriangle, Radio, Gauge, ChevronRight, Swords,
  MessageSquareWarning, Crown, Sparkles, Timer, RefreshCw,
  Lock, Radar, HeartPulse, Lightbulb, ArrowUpRight
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

/* ── Mock Data ── */
const focusScore = 82;
const cognitiveLoad = 37;
const visionAlignment = 91;
const energyLevel = 74;

const priorities = [
  { label: 'Close Series B term sheet', urgency: 'critical', impact: '$48M valuation lift' },
  { label: 'Finalize Jakarta expansion playbook', urgency: 'high', impact: '3 new city activations' },
  { label: 'Sovereign fund pilot structure review', urgency: 'high', impact: 'Anchor investor pipeline' },
  { label: 'Q3 board narrative alignment', urgency: 'medium', impact: 'Governance credibility' },
];

const decisionLog = [
  { date: 'Mar 18', decision: 'Paused Surabaya launch — redirected capital to Bali density play', impact: '+$2.1M projected yield', score: 94 },
  { date: 'Mar 15', decision: 'Rejected 12x acqui-hire offer from regional portal', impact: 'Preserved 4.2x upside optionality', score: 88 },
  { date: 'Mar 12', decision: 'Accelerated AI pricing engine rollout by 6 weeks', impact: '+18% conversion lift', score: 91 },
];

const weeklyRhythm = [
  { day: 'Mon', focus: 'Strategic Capital & Investor Relations', block: '3h deep work' },
  { day: 'Tue', focus: 'Product Architecture & AI Intelligence', block: '4h deep work' },
  { day: 'Wed', focus: 'Market Expansion & Partnerships', block: '3h deep work' },
  { day: 'Thu', focus: 'Team Alignment & Execution Review', block: '2h deep work' },
  { day: 'Fri', focus: 'Narrative, Media & Thought Leadership', block: '2h deep work' },
];

const negotiationPersonas = [
  { id: 'aggressive', label: 'Aggressive Investor', icon: Swords, color: 'text-red-400', desc: 'Challenges valuation, pushes liquidation preferences, demands board seats' },
  { id: 'sovereign', label: 'Sovereign Fund', icon: Crown, color: 'text-amber-400', desc: 'Long-horizon, governance-focused, co-investment structures, patient capital' },
  { id: 'acquirer', label: 'Strategic Acquirer', icon: Target, color: 'text-blue-400', desc: 'Synergy-driven, integration timeline pressure, earn-out negotiations' },
];

const negotiationMetrics = {
  frameControl: 87, leveragePosition: 73, walkAwayStrength: 91, anchoringScore: 82,
};

const reputationMetrics = {
  authorityScore: 78, mediaVisibility: 64, thoughtLeadership: 71, marketTrust: 85, narrativeConsistency: 92,
};

const influenceZones = [
  { region: 'Southeast Asia', strength: 92, trend: 'expanding' },
  { region: 'Middle East', strength: 67, trend: 'accelerating' },
  { region: 'Europe', strength: 41, trend: 'emerging' },
  { region: 'North America', strength: 53, trend: 'stable' },
];

const crisisSignals = [
  { type: 'Market Shock', severity: 'low', status: 'Monitoring', detail: 'IDR/USD within normal band' },
  { type: 'Funding Runway', severity: 'low', status: 'Healthy', detail: '18 months at current burn' },
  { type: 'PR Sentiment', severity: 'medium', status: 'Watch', detail: 'Competitor narrative shift detected' },
  { type: 'Competitor Move', severity: 'low', status: 'Tracking', detail: 'Regional portal raising Series C' },
];

const survivalPlan = [
  { phase: 'Day 1–7', action: 'Stabilize internal communication, assess exposure depth' },
  { phase: 'Day 8–30', action: 'Execute defensive capital measures, accelerate key milestones' },
  { phase: 'Day 31–60', action: 'Launch counter-narrative, secure strategic ally commitments' },
  { phase: 'Day 61–90', action: 'Convert crisis into positioning advantage, announce catalyst' },
];

const severityColor = (s: string) => {
  if (s === 'critical') return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (s === 'high') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  if (s === 'medium') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
};

const MetricBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-xs font-mono font-bold text-foreground">{value}</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

export default function FounderPowerOSPage() {
  const [activePersona, setActivePersona] = useState('aggressive');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section
        initial="hidden" animate="visible" variants={stagger}
        className="border-b border-border bg-card/50"
      >
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">
                Strategic Execution Module
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Founder Power Operating System</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Elite decision intelligence, negotiation leverage, reputation engineering, and crisis dominance — unified into a single command interface.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6">
        <Tabs defaultValue="command" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="command" className="text-xs py-2 gap-1.5"><Brain className="h-3.5 w-3.5" /> Command Center</TabsTrigger>
            <TabsTrigger value="negotiation" className="text-xs py-2 gap-1.5"><Swords className="h-3.5 w-3.5" /> Negotiation</TabsTrigger>
            <TabsTrigger value="reputation" className="text-xs py-2 gap-1.5"><Globe className="h-3.5 w-3.5" /> Reputation</TabsTrigger>
            <TabsTrigger value="crisis" className="text-xs py-2 gap-1.5"><Shield className="h-3.5 w-3.5" /> Crisis Cockpit</TabsTrigger>
          </TabsList>

          {/* ═══════ TAB 1: COMMAND CENTER ═══════ */}
          <TabsContent value="command">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              {/* KPI Strip */}
              <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Focus Score', value: focusScore, icon: Crosshair, suffix: '/100' },
                  { label: 'Cognitive Load', value: cognitiveLoad, icon: Brain, suffix: '%', invert: true },
                  { label: 'Vision Alignment', value: visionAlignment, icon: Eye, suffix: '%' },
                  { label: 'Energy Level', value: energyLevel, icon: HeartPulse, suffix: '%' },
                ].map((kpi) => (
                  <Card key={kpi.label} className="border-border/50 bg-card">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                        <kpi.icon className="h-4 w-4 text-muted-foreground/60" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-foreground">{kpi.value}<span className="text-sm text-muted-foreground">{kpi.suffix}</span></div>
                      <Progress value={kpi.invert ? 100 - kpi.value : kpi.value} className="h-1" />
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              <div className="grid md:grid-cols-5 gap-6">
                {/* Priority Mission Panel */}
                <motion.div variants={fadeSlide} className="md:col-span-3 space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Priority Missions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {priorities.map((p, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                          <Badge variant="outline" className={`text-[9px] shrink-0 mt-0.5 ${severityColor(p.urgency)}`}>{p.urgency}</Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{p.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.impact}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Decision Impact Log */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Decision Impact Log</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {decisionLog.map((d, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground">{d.date}</span>
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Impact {d.score}</Badge>
                          </div>
                          <p className="text-sm text-foreground">{d.decision}</p>
                          <p className="text-xs text-primary/80 mt-1 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{d.impact}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Weekly Rhythm */}
                <motion.div variants={fadeSlide} className="md:col-span-2 space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Weekly Strategic Rhythm</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {weeklyRhythm.map((w, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                          <span className="text-xs font-bold text-primary w-8">{w.day}</span>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">{w.focus}</p>
                            <p className="text-[10px] text-muted-foreground">{w.block}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-primary/5">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Distraction Risk</span>
                      </div>
                      <div className="text-3xl font-bold font-mono text-foreground">Low</div>
                      <p className="text-xs text-muted-foreground">3 context switches today vs. 7 avg. Deep work ratio at 68% — above threshold.</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ═══════ TAB 2: NEGOTIATION ═══════ */}
          <TabsContent value="negotiation">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              {/* Negotiation Metrics */}
              <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/50"><CardContent className="p-4"><MetricBar label="Frame Control" value={negotiationMetrics.frameControl} icon={Crosshair} /></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4"><MetricBar label="Leverage Position" value={negotiationMetrics.leveragePosition} icon={Zap} /></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4"><MetricBar label="Walk-Away Strength" value={negotiationMetrics.walkAwayStrength} icon={Shield} /></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4"><MetricBar label="Anchoring Score" value={negotiationMetrics.anchoringScore} icon={Target} /></CardContent></Card>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Persona Selector */}
                <motion.div variants={fadeSlide} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Simulation Persona</h3>
                  {negotiationPersonas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePersona(p.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 active:scale-[0.98] ${
                        activePersona === p.id ? 'border-primary/50 bg-primary/5' : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p.icon className={`h-4 w-4 ${p.color}`} />
                        <span className="text-sm font-medium text-foreground">{p.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    </button>
                  ))}
                </motion.div>

                {/* Strategy Cards */}
                <motion.div variants={fadeSlide} className="md:col-span-2 space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Frame Control Strategy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { tactic: 'Reframe valuation as infrastructure multiple, not SaaS', timing: 'Opening' },
                        { tactic: 'Introduce scarcity — 2 competing term sheets in pipeline', timing: 'Mid-negotiation' },
                        { tactic: 'Anchor on comparable exits: $4.2B PropertyGuru, $2.8B CoStar acquisition', timing: 'Pricing discussion' },
                        { tactic: 'Deploy time pressure — board approval window closing in 14 days', timing: 'Closing' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                          <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 bg-primary/10 text-primary border-primary/20">{s.timing}</Badge>
                          <p className="text-sm text-foreground">{s.tactic}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /> Counter-Offer Scenarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { scenario: 'Investor pushes 8x', response: 'Counter with 14x + milestone ratchet', outcome: 'Likely settle 11–12x' },
                          { scenario: 'Board seat demand', response: 'Offer observer seat + quarterly briefing', outcome: 'Preserves governance control' },
                          { scenario: 'Liquidation pref 2x', response: 'Accept 1x non-participating + anti-dilution', outcome: 'Protects upside sharing' },
                        ].map((s, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">{s.scenario}</p>
                            <p className="text-xs text-foreground">{s.response}</p>
                            <Separator className="my-1" />
                            <p className="text-[10px] text-emerald-400">{s.outcome}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ═══════ TAB 3: REPUTATION ═══════ */}
          <TabsContent value="reputation">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Authority Score', value: reputationMetrics.authorityScore, icon: Crown },
                  { label: 'Media Visibility', value: reputationMetrics.mediaVisibility, icon: Radio },
                  { label: 'Thought Leadership', value: reputationMetrics.thoughtLeadership, icon: Lightbulb },
                  { label: 'Market Trust', value: reputationMetrics.marketTrust, icon: Shield },
                  { label: 'Narrative Consistency', value: reputationMetrics.narrativeConsistency, icon: Activity },
                ].map((m) => (
                  <Card key={m.label} className="border-border/50">
                    <CardContent className="p-4"><MetricBar label={m.label} value={m.value} icon={m.icon} /></CardContent>
                  </Card>
                ))}
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Influence Zones */}
                <motion.div variants={fadeSlide}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Influence Expansion Zones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {influenceZones.map((z, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{z.region}</span>
                            <Badge variant="outline" className={`text-[9px] ${
                              z.trend === 'expanding' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              z.trend === 'accelerating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              z.trend === 'emerging' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-muted text-muted-foreground border-border/30'
                            }`}>{z.trend}</Badge>
                          </div>
                          <Progress value={z.strength} className="h-1.5" />
                          <span className="text-[10px] font-mono text-muted-foreground mt-1 block">{z.strength}/100</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Content Opportunities & Associations */}
                <motion.div variants={fadeSlide} className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Thought Leadership Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { topic: 'AI-driven capital allocation in emerging markets', channel: 'Forbes Op-Ed', timing: 'This week' },
                        { topic: 'Why real estate needs liquidity infrastructure', channel: 'TechCrunch Interview', timing: 'Next month' },
                        { topic: 'Sovereign capital + proptech convergence', channel: 'WEF Panel Submission', timing: 'Q3 2026' },
                        { topic: 'Building financial infrastructure in Southeast Asia', channel: 'Bloomberg Brief', timing: 'Ongoing' },
                      ].map((o, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">{o.topic}</p>
                            <p className="text-[10px] text-muted-foreground">{o.channel} · {o.timing}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-primary/5">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Reputation Trajectory</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Authority score trending +6 pts over 90 days. Media visibility gap identified in Middle East — next high-value opportunity zone.</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ═══════ TAB 4: CRISIS COCKPIT ═══════ */}
          <TabsContent value="crisis">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              {/* Signal Grid */}
              <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {crisisSignals.map((s, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.type}</span>
                        <Badge variant="outline" className={`text-[9px] ${severityColor(s.severity)}`}>{s.severity}</Badge>
                      </div>
                      <div className="text-sm font-bold text-foreground">{s.status}</div>
                      <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 90-Day Survival Plan */}
                <motion.div variants={fadeSlide}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Timer className="h-4 w-4 text-primary" /> 90-Day Survival Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {survivalPlan.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                          <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 bg-primary/10 text-primary border-primary/20 font-mono">{s.phase}</Badge>
                          <p className="text-sm text-foreground">{s.action}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Asymmetric Opportunities + Decision Confidence */}
                <motion.div variants={fadeSlide} className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Asymmetric Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { opp: 'Distressed competitor asset acquisition at 0.4x book value', window: '30-day window' },
                        { opp: 'Talent poaching — 3 senior engineers from failing competitor', window: 'Active now' },
                        { opp: 'Accelerate sovereign fund engagement during market dislocation', window: '60-day window' },
                      ].map((o, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <p className="text-xs font-medium text-foreground">{o.opp}</p>
                          <p className="text-[10px] text-amber-400 mt-1">{o.window}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4 text-primary" /> Decision Confidence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <MetricBar label="Data Completeness" value={87} icon={BarChart3} />
                      <MetricBar label="Scenario Coverage" value={74} icon={Radar} />
                      <MetricBar label="Communication Readiness" value={91} icon={MessageSquareWarning} />
                      <MetricBar label="Execution Confidence" value={82} icon={Lock} />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
