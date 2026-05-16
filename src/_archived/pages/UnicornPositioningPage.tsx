import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Rocket, TrendingUp, Database, Layers, Cpu, DollarSign,
  ChevronRight, CheckCircle2, ArrowRight, Target, Sparkles,
  Shield, Crown, Globe, BarChart3, Users, Building2,
  Lock, Star, Zap, Eye, Activity, Award, Lightbulb,
  PieChart, Flag, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Data ─── */

const POSITIONING_PILLARS = [
  {
    id: 'data',
    title: 'Data Network Effects',
    subtitle: 'Proprietary behavioral datasets become the moat competitors cannot replicate',
    icon: Database,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    valuation_driver: 'Data asset valuation: 15-25x revenue multiplier for proptech with proprietary data',
    strategies: [
      {
        title: 'Proprietary Investment Behavior Dataset',
        description: 'Every user interaction — search, save, inquiry, offer, transaction — feeds the intelligence engine',
        milestones: [
          'Year 1: 500K behavioral events/month across search, save, and inquiry patterns',
          'Year 2: 5M events/month with cross-city correlation and investor segment profiling',
          'Year 3: 20M events/month — largest Indonesian property investment behavior dataset',
        ],
        moat: 'Competitors starting from zero would need 3+ years to match signal depth',
      },
      {
        title: 'Predictive Analytics Accuracy Loop',
        description: 'Self-learning engine measures prediction vs. outcome and auto-calibrates scoring weights',
        milestones: [
          'Price prediction accuracy: 82% → 91% → 95% (Year 1 → 2 → 3)',
          'Opportunity score correlation with actual ROI: r=0.72 → r=0.85 → r=0.92',
          'Market cycle detection lead time: 30 days → 60 days → 90 days ahead of market',
        ],
        moat: 'Each correct prediction reinforces trust and generates more data for the next cycle',
      },
    ],
  },
  {
    id: 'ecosystem',
    title: 'Platform Ecosystem Depth',
    subtitle: 'Unified environment where leaving means losing accumulated intelligence advantage',
    icon: Layers,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    valuation_driver: 'Platform companies trade at 8-15x revenue vs. 3-5x for marketplaces',
    strategies: [
      {
        title: 'Transaction-Analytics-Services Unification',
        description: 'Single platform spanning discovery → analysis → transaction → post-purchase services',
        milestones: [
          'Year 1: Core marketplace + AI analytics + basic services (legal, renovation)',
          'Year 2: Portfolio management + developer platform + institutional APIs',
          'Year 3: Full lifecycle platform — from investment DNA profiling to exit timing signals',
        ],
        moat: 'Multi-product platform creates 4x higher switching costs than single-product tools',
      },
      {
        title: 'Investor & Developer Dependency Loop',
        description: 'Investors depend on AI recommendations; developers depend on demand intelligence — both need the platform',
        milestones: [
          'Year 1: Investors use AI scoring for 40% of investment decisions',
          'Year 2: Developers use demand forecast for 60% of launch pricing decisions',
          'Year 3: Both sides consider the platform essential infrastructure — NPS >60',
        ],
        moat: 'Two-sided dependency creates marketplace lock-in that single-sided platforms lack',
      },
    ],
  },
  {
    id: 'tech',
    title: 'Technology Leadership Narrative',
    subtitle: 'AI-first identity that differentiates from traditional listing portals',
    icon: Cpu,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    valuation_driver: 'AI-native companies command 2-3x premium over traditional proptech',
    strategies: [
      {
        title: 'AI Intelligence Differentiation',
        description: 'Not a listing portal with AI features — an intelligence platform with a marketplace',
        milestones: [
          'Investor DNA Engine: 11-dimension behavioral profiling with 4 predictive scores',
          'Market Heat Cluster Engine: micro-location investment hotspot detection',
          'Global Macro Intelligence: capital flow prediction and wealth migration analysis',
        ],
        moat: 'Brand perception as "Bloomberg Terminal for Indonesian real estate" — earned, not bought',
      },
      {
        title: 'Innovation Showcase Pipeline',
        description: 'Continuous release of visible AI capabilities that reinforce technology leadership',
        milestones: [
          'Q1-Q2: Predictive price signals + exit timing alerts (visible to users)',
          'Q3-Q4: Computer vision property scoring + automated valuation model',
          'Year 2+: Natural language investment advisory + portfolio auto-rebalancing',
        ],
        moat: 'Shipping AI features faster than competitors establishes perception of technical depth',
      },
    ],
  },
  {
    id: 'capital',
    title: 'Capital Strategy Alignment',
    subtitle: 'Time fundraising to visible traction inflection points for maximum valuation',
    icon: DollarSign,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    valuation_driver: 'Fundraise at momentum peaks — 30-50% higher valuations vs. trough timing',
    strategies: [
      {
        title: 'Milestone-Timed Fundraising',
        description: 'Each round timed to a clear, demonstrable traction milestone',
        milestones: [
          'Pre-Seed (now): Product live + first 100 transactions + AI engine operational',
          'Seed ($1-2M): 2,500 listings + 1,200 investors + 35% Bali market share',
          'Series A ($5-10M): 4 cities + IDR 50B GMV + 8% paid conversion + developer platform',
          'Series B ($15-30M): Regional expansion + B2B data product + IDR 200B GMV',
        ],
        moat: 'Each round validates the next hypothesis — reduces investor risk perception progressively',
      },
      {
        title: 'Scalable Revenue Growth Curve',
        description: 'Demonstrate revenue diversification and unit economics improvement over time',
        milestones: [
          'Year 1: IDR 8B revenue — commission-dependent (65%), proving marketplace liquidity',
          'Year 2: IDR 42B revenue — subscriptions growing (30%), proving premium value',
          'Year 3: IDR 108B revenue — 5 streams, 62% recurring, proving platform economics',
        ],
        moat: 'Revenue mix shift from transactional to recurring is the #1 valuation driver for proptech',
      },
    ],
  },
];

const VALUATION_TRAJECTORY = [
  { stage: 'Pre-Seed', valuation: '$1-2M', timeline: 'Now', metric: 'Product + early traction', color: 'bg-muted/20' },
  { stage: 'Seed', valuation: '$8-15M', timeline: 'Month 12', metric: '35% city share + 100 deals', color: 'bg-chart-4/15' },
  { stage: 'Series A', valuation: '$40-80M', timeline: 'Month 24', metric: '4 cities + IDR 50B GMV', color: 'bg-primary/15' },
  { stage: 'Series B', valuation: '$150-300M', timeline: 'Month 36', metric: 'Regional + B2B data', color: 'bg-chart-5/15' },
  { stage: 'Series C / IPO', valuation: '$500M-1B', timeline: 'Month 48-60', metric: 'ASEAN platform + recurring rev', color: 'bg-chart-1/15' },
];

const COMPARABLE_EXITS = [
  { company: 'PropertyGuru', category: 'SEA Marketplace', valuation: '$1.78B (IPO 2022)', multiple: '12x revenue' },
  { company: '99.co', category: 'SG+ID Marketplace', valuation: '$350M (est.)', multiple: '8x revenue' },
  { company: 'Proptiger/Housing', category: 'India Proptech', valuation: '$300M (acquired)', multiple: '10x revenue' },
  { company: 'Zillow', category: 'US Intelligence+Marketplace', valuation: '$10B+', multiple: '6x revenue' },
];

const DEFENSIBILITY_TIMELINE = [
  { year: 'Year 1', moats: ['Liquidity density in Bali', 'AI scoring accuracy', 'First-mover behavioral data'] },
  { year: 'Year 2', moats: ['Multi-city network effects', 'Developer exclusivity contracts', 'Institutional data clients'] },
  { year: 'Year 3', moats: ['Regional brand authority', 'Portfolio data gravity', 'B2B intelligence infrastructure'] },
  { year: 'Year 5', moats: ['ASEAN property intelligence standard', 'Cross-border capital flow data', 'Industry benchmark publisher'] },
];

/* ─── Component ─── */

export default function UnicornPositioningPage() {
  const [activeTab, setActiveTab] = useState('pillars');
  const [expandedPillar, setExpandedPillar] = useState('data');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-chart-5" />
                </div>
                Unicorn Positioning Roadmap
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Strategic evolution into high-valuation proptech intelligence infrastructure
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-5/20 text-chart-5">
              <Target className="h-3 w-3 mr-1.5" />
              $500M–$1B Target
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pillars">Positioning Pillars</TabsTrigger>
            <TabsTrigger value="valuation">Valuation Path</TabsTrigger>
            <TabsTrigger value="moats">Defensibility</TabsTrigger>
          </TabsList>

          {/* ═══ PILLARS TAB ═══ */}
          <TabsContent value="pillars" className="space-y-4">
            {POSITIONING_PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              const isExpanded = expandedPillar === pillar.id;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80'
                    )}
                    onClick={() => setExpandedPillar(isExpanded ? '' : pillar.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', pillar.bgColor)}>
                          <PIcon className={cn('h-5 w-5', pillar.color)} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{pillar.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{pillar.subtitle}</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">{pillar.strategies.length} strategies</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        {/* Valuation driver */}
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-5/5 border border-chart-5/10 mb-3">
                          <TrendingUp className="h-3 w-3 text-chart-5 flex-shrink-0" />
                          <p className="text-[10px] text-chart-5 font-medium">{pillar.valuation_driver}</p>
                        </div>

                        <div className="space-y-3">
                          {pillar.strategies.map((s, si) => (
                            <div key={si} className="border border-border/30 rounded-lg p-4">
                              <p className="text-xs font-bold text-foreground mb-1">{s.title}</p>
                              <p className="text-[10px] text-muted-foreground mb-2.5">{s.description}</p>

                              <div className="space-y-1 mb-2.5">
                                {s.milestones.map((m, mi) => (
                                  <div key={mi} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground">{m}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                                <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                                <p className="text-[10px] text-primary font-medium">{s.moat}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}

            {/* Positioning equation */}
            <Card className="border border-chart-5/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Unicorn Equation</p>
                <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-foreground">
                  <Badge variant="outline" className="text-[10px]">Proprietary Data</Badge>
                  <span className="text-muted-foreground">×</span>
                  <Badge variant="outline" className="text-[10px]">Platform Lock-In</Badge>
                  <span className="text-muted-foreground">×</span>
                  <Badge variant="outline" className="text-[10px]">AI Perception</Badge>
                  <span className="text-muted-foreground">×</span>
                  <Badge variant="outline" className="text-[10px]">Revenue Growth</Badge>
                  <span className="text-muted-foreground">=</span>
                  <Badge className="text-[10px] bg-chart-5 text-chart-5-foreground">$1B Valuation</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ VALUATION TAB ═══ */}
          <TabsContent value="valuation" className="space-y-4">
            {/* Trajectory */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-5" />
                  Valuation Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {VALUATION_TRAJECTORY.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-28 flex-shrink-0">
                      <p className="text-[11px] font-bold text-foreground">{v.stage}</p>
                      <p className="text-[9px] text-muted-foreground">{v.timeline}</p>
                    </div>
                    <div className="flex-1 h-8 bg-muted/15 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(8, (i + 1) * 20)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={cn('h-full rounded-lg', v.color)}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-[10px] font-black text-foreground">{v.valuation}</span>
                        <span className="text-[9px] text-muted-foreground">{v.metric}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comparable exits */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Comparable Proptech Valuations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMPARABLE_EXITS.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/30 bg-muted/5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-foreground">{c.company}</p>
                        <Badge variant="outline" className="text-[8px]">{c.multiple}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{c.category}</p>
                      <p className="text-[10px] font-medium text-chart-5 mt-0.5">{c.valuation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Investor narrative */}
            <Card className="border border-chart-5/15 bg-chart-5/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-chart-5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Investor Narrative</p>
                    <p className="text-[11px] text-muted-foreground">
                      "ASTRA Villa is building the intelligence layer for Southeast Asian real estate — combining proprietary behavioral data, AI-powered predictive analytics, and a full-lifecycle investment platform. We're not competing with listing portals; we're building the infrastructure that makes every property decision smarter. Our data moat deepens with every transaction."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MOATS TAB ═══ */}
          <TabsContent value="moats" className="space-y-4">
            {/* Timeline */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  Defensibility Evolution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {DEFENSIBILITY_TIMELINE.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center',
                        i === 0 ? 'bg-chart-2/10' : i === 1 ? 'bg-primary/10' : i === 2 ? 'bg-chart-4/10' : 'bg-chart-5/10'
                      )}>
                        <span className="text-[9px] font-bold text-foreground">{d.year.replace('Year ', 'Y')}</span>
                      </div>
                      {i < DEFENSIBILITY_TIMELINE.length - 1 && <div className="w-px h-6 bg-border/30" />}
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-border/30 bg-card">
                      <p className="text-xs font-bold text-foreground mb-1.5">{d.year}</p>
                      <div className="space-y-1">
                        {d.moats.map((m, mi) => (
                          <div key={mi} className="flex items-center gap-2">
                            <Lock className="h-2.5 w-2.5 text-chart-2" />
                            <span className="text-[10px] text-muted-foreground">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Moat strength assessment */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Moat Strength Assessment (Year 3 Target)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-1.5">
                {[
                  { moat: 'Behavioral Data Volume', strength: 90, desc: '20M events/mo — no competitor has equivalent Indonesian property investment data' },
                  { moat: 'AI Prediction Accuracy', strength: 85, desc: '95% price accuracy + 90-day market cycle detection — self-improving with scale' },
                  { moat: 'Multi-Sided Network', strength: 80, desc: 'Investors + agents + developers + service providers — 4-sided marketplace' },
                  { moat: 'Portfolio Data Gravity', strength: 70, desc: 'Years of tracking history + personalized AI make switching costly for users' },
                  { moat: 'Brand Authority', strength: 60, desc: 'Industry benchmark reports + media presence + thought leadership positioning' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-40 flex-shrink-0">
                      <p className="text-[11px] font-medium text-foreground">{m.moat}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">{m.desc}</p>
                    </div>
                    <div className="flex-1 h-6 bg-muted/15 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.strength}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-lg bg-chart-2/15"
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-[10px] font-bold text-foreground">{m.strength}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strategic principle */}
            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Rocket className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Essential Infrastructure Positioning</p>
                    <p className="text-[11px] text-muted-foreground">
                      The ultimate defensibility is not being a tool users choose, but infrastructure they depend on. When banks use ASTRA Villa data for mortgage decisions, developers use it for launch pricing, and investors consider it essential for due diligence — the platform becomes the industry standard. That's the path from $100M to $1B.
                    </p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs flex-shrink-0">Infrastructure</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
