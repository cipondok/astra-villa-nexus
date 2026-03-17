import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Map, Globe, Building2, Users, TrendingUp, Target,
  ChevronRight, CheckCircle2, ArrowRight, Clock, Sparkles,
  Shield, Layers, Zap, Crown, BarChart3, MapPin,
  Handshake, Lock, Star, Activity, Repeat, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Data ─── */

const EXPANSION_PHASES = [
  {
    phase: 1,
    title: 'City Dominance',
    timeline: 'Month 1–9',
    subtitle: 'Win one city completely before expanding — liquidity concentration creates defensibility',
    icon: MapPin,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    targetCity: 'Bali (Badung, Denpasar, Gianyar)',
    kpis: [
      { label: 'Active Listings', target: '2,500+', current: '840' },
      { label: 'Market Share', target: '35%', current: '12%' },
      { label: 'Active Investors', target: '1,200', current: '380' },
      { label: 'Developer Partners', target: '15', current: '4' },
    ],
    strategies: [
      {
        title: 'Supply Inventory Dominance',
        description: 'Aggregate 35%+ of active listings in primary city through agent onboarding blitz and developer partnerships',
        tactics: [
          'Agent acquisition pipeline: target top 50 agents by listing volume in Bali',
          'Developer exclusivity deals: 15 projects with pre-launch listing rights',
          'Owner direct-listing campaign via WhatsApp groups and property communities',
          'Competitor listing scraping → targeted outreach to unrepresented owners',
        ],
        milestone: '2,500 active listings in Bali by Month 9',
      },
      {
        title: 'Investor Network Density',
        description: 'Build concentrated buyer network creating natural demand pressure on listings',
        tactics: [
          'HNW investor acquisition: private demos + tailored insight packages (see /hnw-investor-strategy)',
          'Investor DNA profiling: personalize every recommendation within 48 hours of signup',
          'Referral program targeting 25% viral coefficient among active investors',
          'Monthly investor meetups in Bali for community building and deal flow visibility',
        ],
        milestone: '1,200 active investor accounts with 60%+ monthly activity rate',
      },
      {
        title: 'Liquidity Proof Points',
        description: 'Generate enough transactions to prove marketplace liquidity — the critical trust signal',
        tactics: [
          'Flash deals and auction events to accelerate first 100 closed transactions',
          'Transaction success stories published weekly for social proof (see /brand-trust-strategy)',
          'Agent leaderboard incentivizing deal closure speed and volume',
          'AI matching accuracy tracking: measure recommendation-to-inquiry conversion',
        ],
        milestone: '100+ closed transactions, <30 day avg. time-to-close',
      },
    ],
  },
  {
    phase: 2,
    title: 'Adjacent Expansion',
    timeline: 'Month 10–18',
    subtitle: 'Replicate the playbook in high-demand adjacent cities with proven operational model',
    icon: Map,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    targetCity: 'Jakarta, Surabaya, Bandung',
    kpis: [
      { label: 'Cities Active', target: '4', current: '1' },
      { label: 'Total Listings', target: '8,000+', current: '840' },
      { label: 'Developer Partners', target: '40', current: '4' },
      { label: 'Cross-city Investors', target: '35%', current: '0%' },
    ],
    strategies: [
      {
        title: 'City-by-City Replication',
        description: 'Launch each new city with pre-seeded supply (500+ listings) and demand (200+ investors) before going live',
        tactics: [
          'Jakarta: commercial + luxury residential focus — largest investor pool',
          'Surabaya: emerging market positioning — higher yields, lower entry price',
          'Bandung: lifestyle + rental yield play — student housing + villa market',
          'Each city gets dedicated City Manager with agent recruitment KPIs',
        ],
        milestone: '2,000+ listings per city within 4 months of launch',
      },
      {
        title: 'Developer Partnership Framework',
        description: 'Standardized partnership tiers (Standard → Preferred → Exclusive) replicated in each city',
        tactics: [
          'Developer onboarding kit: launch radar placement + demand forecast dashboard access',
          'Tiered pricing: Standard (free listing), Preferred (featured + analytics), Exclusive (pre-launch + investor alert)',
          'City-specific developer events for partnership acquisition',
          'Joint venture revenue model for exclusive project launches',
        ],
        milestone: '10 developer partners per city within 6 months',
      },
      {
        title: 'Cross-City Intelligence Network',
        description: 'Enable investors in one city to discover opportunities in others — platform network effect',
        tactics: [
          'Market Intelligence Feed covers all active cities with comparative analysis',
          'Investor DNA engine recommends cross-city properties matching investment strategy',
          'City investment trend reports rank cities by yield, growth, and liquidity',
          'Portfolio diversification alerts: "your portfolio is 100% Bali — consider Jakarta exposure"',
        ],
        milestone: '35% of investors actively exploring properties in 2+ cities',
      },
    ],
  },
  {
    phase: 3,
    title: 'Ecosystem Depth',
    timeline: 'Month 19–30',
    subtitle: 'Deepen per-user revenue through services and data — making the platform indispensable',
    icon: Layers,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    targetCity: 'All active cities + Yogyakarta, Makassar, Medan',
    kpis: [
      { label: 'Cities Active', target: '7+', current: '1' },
      { label: 'Service Attach Rate', target: '40%', current: '8%' },
      { label: 'ARPU', target: 'IDR 520K', current: 'IDR 45K' },
      { label: 'Data Intelligence Clients', target: '50', current: '0' },
    ],
    strategies: [
      {
        title: 'Property Service Ecosystem Integration',
        description: 'Every transaction triggers service marketplace cross-sell: legal, renovation, management, insurance',
        tactics: [
          'Post-transaction automated service recommendations based on property type and age',
          'Legal services: SHM processing, AJB preparation, tax consultation — bundled packages',
          'Renovation marketplace with verified vendors in each active city',
          'Property management referral network for rental investors',
        ],
        milestone: '40% of closed transactions generate at least one service booking',
      },
      {
        title: 'Data Intelligence Authority',
        description: 'Monetize aggregated market data as B2B intelligence product — the long-term moat',
        tactics: [
          'Monthly city intelligence reports published for brand authority and SEO',
          'Institutional analytics API for banks, developers, and investment funds',
          'Market heat cluster data licensing for urban planning consultants',
          'Annual Indonesia Property Intelligence Report — definitive industry benchmark',
        ],
        milestone: '50 B2B data intelligence clients generating IDR 5B+ annual revenue',
      },
      {
        title: 'Platform Lock-In Mechanisms',
        description: 'Create switching costs through portfolio tracking, historical data, and AI personalization',
        tactics: [
          'Portfolio Command Center becomes indispensable: years of performance data',
          'Investor DNA engine improves with every interaction — recommendations get smarter over time',
          'Transaction history and legal document archive create data gravity',
          'VIP tier progression: Diamond members have too much to lose by leaving',
        ],
        milestone: 'Net revenue retention rate >120% (expansion exceeds churn)',
      },
    ],
  },
];

const LONG_TERM_HORIZON = [
  {
    title: 'Cross-Border Investor Attraction',
    timeline: 'Year 3–4',
    description: 'Position as the gateway for international investors (Singapore, Australia, Middle East) entering Indonesian property market',
    actions: [
      'Multi-language platform (English, Mandarin, Arabic) for international investor segments',
      'Foreign investment legal guidance: PMA structure, nominee arrangements, KITAS requirements',
      'Cross-border capital flow intelligence from Global Macro Intelligence engine',
      'Partnership with international property portals for demand acquisition',
    ],
    icon: Globe,
  },
  {
    title: 'Regional Intelligence Infrastructure',
    timeline: 'Year 4–5',
    description: 'Expand AI property intelligence platform to Southeast Asian markets: Malaysia, Thailand, Vietnam, Philippines',
    actions: [
      'White-label intelligence platform for regional property portals',
      'Cross-market investment comparison: "Bali vs Phuket vs Langkawi" yield analysis',
      'Regional market cycle detection spanning multiple economies',
      'ASEAN property investment conference and annual intelligence report',
    ],
    icon: Crown,
  },
];

const NETWORK_EFFECTS = [
  { effect: 'More Listings', arrow: '→', result: 'More Investors Browse', type: 'direct' },
  { effect: 'More Investors', arrow: '→', result: 'More Agents List', type: 'direct' },
  { effect: 'More Transactions', arrow: '→', result: 'Better AI Accuracy', type: 'data' },
  { effect: 'Better AI', arrow: '→', result: 'Higher Conversion Rate', type: 'data' },
  { effect: 'Higher Conversion', arrow: '→', result: 'More Agent Trust', type: 'trust' },
  { effect: 'More Trust', arrow: '→', result: 'More Exclusive Listings', type: 'trust' },
];

/* ─── Component ─── */

export default function GeographicExpansionPage() {
  const [activeTab, setActiveTab] = useState('phases');
  const [expandedPhase, setExpandedPhase] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                Geographic Expansion Strategy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                City-by-city liquidity dominance before broad scaling
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/20 text-primary">
              <Flag className="h-3 w-3 mr-1.5" />
              30-Month Roadmap
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="phases">Expansion Phases</TabsTrigger>
            <TabsTrigger value="longterm">Long-Term Horizon</TabsTrigger>
            <TabsTrigger value="network">Network Effects</TabsTrigger>
          </TabsList>

          {/* ═══ PHASES TAB ═══ */}
          <TabsContent value="phases" className="space-y-4">
            {EXPANSION_PHASES.map((phase) => {
              const PIcon = phase.icon;
              const isExpanded = expandedPhase === phase.phase;
              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: phase.phase * 0.05 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80'
                    )}
                    onClick={() => setExpandedPhase(isExpanded ? 0 : phase.phase)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', phase.bgColor)}>
                          <PIcon className={cn('h-5 w-5', phase.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold">Phase {phase.phase}</Badge>
                            <CardTitle className="text-sm">{phase.title}</CardTitle>
                            <Badge variant="secondary" className="text-[8px]">{phase.timeline}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{phase.subtitle}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        {/* Target & KPIs */}
                        <div className="mb-3 p-3 rounded-lg bg-muted/10 border border-border/20">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary">Target: {phase.targetCity}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {phase.kpis.map((kpi, ki) => (
                              <div key={ki} className="text-center p-2 rounded-lg bg-card border border-border/20">
                                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                                <p className="text-xs font-black text-foreground">{kpi.target}</p>
                                <p className="text-[8px] text-muted-foreground">Now: {kpi.current}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Strategies */}
                        <div className="space-y-3">
                          {phase.strategies.map((s, si) => (
                            <div key={si} className="border border-border/30 rounded-lg p-4">
                              <p className="text-xs font-bold text-foreground mb-1">{s.title}</p>
                              <p className="text-[10px] text-muted-foreground mb-2">{s.description}</p>
                              <div className="space-y-1 mb-2.5">
                                {s.tactics.map((t, ti) => (
                                  <div key={ti} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground">{t}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-chart-2/5 border border-chart-2/10">
                                <Target className="h-3 w-3 text-chart-2 flex-shrink-0" />
                                <p className="text-[10px] text-chart-2 font-medium">{s.milestone}</p>
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

            {/* Expansion flow */}
            <Card className="border border-primary/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Expansion Principle</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Dominate 1 City', 'Prove Liquidity', 'Replicate Playbook', 'Deepen Ecosystem', 'Go Regional'].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Badge variant={i === 0 ? 'default' : 'outline'} className="text-[9px]">{step}</Badge>
                      {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ LONG-TERM TAB ═══ */}
          <TabsContent value="longterm" className="space-y-4">
            {LONG_TERM_HORIZON.map((h, i) => {
              const HIcon = h.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border border-border bg-card">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <HIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-foreground">{h.title}</p>
                            <Badge variant="secondary" className="text-[8px]">{h.timeline}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-3">{h.description}</p>
                          <div className="space-y-1">
                            {h.actions.map((a, ai) => (
                              <div key={ai} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground">{a}</p>
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

            {/* Vision */}
            <Card className="border border-chart-5/15 bg-chart-5/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-chart-5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">5-Year Vision</p>
                    <p className="text-[11px] text-muted-foreground">
                      ASTRA Villa becomes the regional AI property intelligence infrastructure — the "Bloomberg Terminal for Southeast Asian real estate." Platform data becomes the industry standard for pricing, market timing, and investment decisions across 5+ countries.
                    </p>
                  </div>
                  <Badge className="bg-chart-5 text-chart-5-foreground text-xs flex-shrink-0">ASEAN #1</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ NETWORK EFFECTS TAB ═══ */}
          <TabsContent value="network" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  Marketplace Network Effects
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Each cycle strengthens the moat — competitors can't replicate accumulated network density</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {NETWORK_EFFECTS.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/20"
                  >
                    <Badge variant="outline" className={cn(
                      'text-[8px] w-12 justify-center',
                      n.type === 'direct' ? 'text-chart-1 border-chart-1/30' :
                      n.type === 'data' ? 'text-primary border-primary/30' :
                      'text-chart-2 border-chart-2/30'
                    )}>
                      {n.type}
                    </Badge>
                    <span className="text-[11px] font-medium text-foreground flex-1">{n.effect}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-foreground flex-1">{n.result}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Defensibility layers */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  Defensibility Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-1.5">
                  {[
                    { layer: 'Liquidity Density', desc: 'Concentrated supply+demand in each city creates switching cost — investors go where listings are', strength: 85 },
                    { layer: 'AI Data Moat', desc: 'Every transaction improves scoring accuracy — competitors start with zero training data', strength: 70 },
                    { layer: 'Developer Exclusives', desc: 'Pre-launch access agreements create supply-side lock-in that takes years to replicate', strength: 60 },
                    { layer: 'Investor Portfolio Gravity', desc: 'Years of tracking data, performance history, and AI personalization make leaving costly', strength: 45 },
                    { layer: 'Brand Intelligence Authority', desc: 'Market reports and intelligence brand become industry reference — earned over time', strength: 35 },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-44 flex-shrink-0">
                        <p className="text-[11px] font-medium text-foreground">{l.layer}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{l.desc}</p>
                      </div>
                      <div className="flex-1 h-6 bg-muted/15 rounded-lg overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${l.strength}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-lg bg-chart-2/15"
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-[10px] font-bold text-foreground">{l.strength}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic insight */}
            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Concentration Before Scale</p>
                    <p className="text-[11px] text-muted-foreground">
                      The critical insight: a marketplace with 35% share in 1 city is 10x more valuable than 3% share in 10 cities. Liquidity creates trust, trust creates transactions, transactions create data, data creates intelligence advantage. Expand only when the current city is self-sustaining.
                    </p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs flex-shrink-0">35% first</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
