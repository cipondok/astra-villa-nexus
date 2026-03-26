import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  MapPin, TrendingUp, Users, Building2, Shield, Zap, Target,
  ChevronRight, CheckCircle2, AlertTriangle, Globe, BarChart3,
  Layers, ArrowUpRight, Star, Activity, Crown, Wrench, Clock,
  CircleDot, Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   EVALUATION MODEL
   ═══════════════════════════════════════════ */

interface Factor {
  name: string;
  weight: number;
  icon: typeof MapPin;
  description: string;
}

interface FactorCategory {
  category: string;
  icon: typeof MapPin;
  color: string;
  bgColor: string;
  factors: Factor[];
}

const EVAL_MODEL: FactorCategory[] = [
  {
    category: 'Investment Demand',
    icon: TrendingUp,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    factors: [
      { name: 'Population Growth Trend', weight: 15, icon: Users, description: 'Annual population growth rate and urbanization trajectory — proxy for future housing demand volume' },
      { name: 'Rental Yield Attractiveness', weight: 12, icon: BarChart3, description: 'Avg gross rental yield vs national benchmark — signals investor ROI appetite for the market' },
      { name: 'Infrastructure Momentum', weight: 13, icon: Building2, description: 'Active toll roads, MRT/LRT, airport expansion, SEZ designations — leading indicator of price uplift' },
      { name: 'Foreign Investment Interest', weight: 5, icon: Globe, description: 'Volume of foreign buyer inquiries and international developer activity in the region' },
    ],
  },
  {
    category: 'Supply Feasibility',
    icon: Layers,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    factors: [
      { name: 'Agent Network Density', weight: 12, icon: Users, description: 'Number of active licensed agents per 1,000 listings — determines listing acquisition speed at launch' },
      { name: 'Developer Pipeline Potential', weight: 10, icon: Building2, description: 'Count of upcoming project launches and active developer partnerships available for onboarding' },
      { name: 'Existing Listing Volume', weight: 8, icon: Activity, description: 'Total active property listings across all portals — baseline market size indicator' },
    ],
  },
  {
    category: 'Competitive Landscape',
    icon: Shield,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    factors: [
      { name: 'Portal Fragmentation Index', weight: 10, icon: Layers, description: 'Degree of market share fragmentation among existing portals — high fragmentation = easier entry' },
      { name: 'Intelligence Differentiation Gap', weight: 10, icon: Zap, description: 'Absence of AI-driven investment analytics in existing solutions — our primary competitive wedge' },
      { name: 'Brand Awareness Baseline', weight: 5, icon: Star, description: 'Current ASTRA Villa recognition level in the target market from organic traffic and referrals' },
    ],
  },
];

const totalWeight = EVAL_MODEL.flatMap(c => c.factors).reduce((s, f) => s + f.weight, 0);

/* ═══════════════════════════════════════════
   CANDIDATE CITIES
   ═══════════════════════════════════════════ */

interface CityCandidate {
  city: string;
  province: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  scores: Record<string, number>;
  status: 'Active' | 'Ready' | 'Evaluating' | 'Future';
  keyInsight: string;
}

const CANDIDATES: CityCandidate[] = [
  {
    city: 'Jakarta (Jabodetabek)', province: 'DKI Jakarta', tier: 'Tier 1', status: 'Active',
    keyInsight: 'Largest transaction volume — establish dominance here before expanding',
    scores: { 'Population Growth Trend': 7, 'Rental Yield Attractiveness': 7, 'Infrastructure Momentum': 9, 'Foreign Investment Interest': 9, 'Agent Network Density': 9, 'Developer Pipeline Potential': 9, 'Existing Listing Volume': 10, 'Portal Fragmentation Index': 6, 'Intelligence Differentiation Gap': 8, 'Brand Awareness Baseline': 7 },
  },
  {
    city: 'Bali (Badung/Denpasar)', province: 'Bali', tier: 'Tier 1', status: 'Active',
    keyInsight: 'Highest foreign investor concentration — premium villa market with strong rental yields',
    scores: { 'Population Growth Trend': 6, 'Rental Yield Attractiveness': 9, 'Infrastructure Momentum': 7, 'Foreign Investment Interest': 10, 'Agent Network Density': 7, 'Developer Pipeline Potential': 8, 'Existing Listing Volume': 7, 'Portal Fragmentation Index': 8, 'Intelligence Differentiation Gap': 9, 'Brand Awareness Baseline': 6 },
  },
  {
    city: 'Surabaya', province: 'Jawa Timur', tier: 'Tier 1', status: 'Ready',
    keyInsight: 'Second largest metro — underserved by intelligent analytics platforms',
    scores: { 'Population Growth Trend': 7, 'Rental Yield Attractiveness': 7, 'Infrastructure Momentum': 7, 'Foreign Investment Interest': 5, 'Agent Network Density': 7, 'Developer Pipeline Potential': 7, 'Existing Listing Volume': 7, 'Portal Fragmentation Index': 8, 'Intelligence Differentiation Gap': 9, 'Brand Awareness Baseline': 3 },
  },
  {
    city: 'Bandung', province: 'Jawa Barat', tier: 'Tier 2', status: 'Ready',
    keyInsight: 'Fast-growing tech hub with emerging premium residential demand',
    scores: { 'Population Growth Trend': 8, 'Rental Yield Attractiveness': 7, 'Infrastructure Momentum': 8, 'Foreign Investment Interest': 4, 'Agent Network Density': 6, 'Developer Pipeline Potential': 7, 'Existing Listing Volume': 6, 'Portal Fragmentation Index': 7, 'Intelligence Differentiation Gap': 9, 'Brand Awareness Baseline': 3 },
  },
  {
    city: 'Medan', province: 'Sumatera Utara', tier: 'Tier 2', status: 'Evaluating',
    keyInsight: 'Largest Sumatera metro — early mover advantage available',
    scores: { 'Population Growth Trend': 6, 'Rental Yield Attractiveness': 6, 'Infrastructure Momentum': 6, 'Foreign Investment Interest': 3, 'Agent Network Density': 5, 'Developer Pipeline Potential': 5, 'Existing Listing Volume': 5, 'Portal Fragmentation Index': 8, 'Intelligence Differentiation Gap': 10, 'Brand Awareness Baseline': 1 },
  },
  {
    city: 'Makassar', province: 'Sulawesi Selatan', tier: 'Tier 2', status: 'Evaluating',
    keyInsight: 'Eastern Indonesia gateway — infrastructure boom with new toll roads and port expansion',
    scores: { 'Population Growth Trend': 7, 'Rental Yield Attractiveness': 7, 'Infrastructure Momentum': 8, 'Foreign Investment Interest': 3, 'Agent Network Density': 4, 'Developer Pipeline Potential': 5, 'Existing Listing Volume': 4, 'Portal Fragmentation Index': 9, 'Intelligence Differentiation Gap': 10, 'Brand Awareness Baseline': 1 },
  },
  {
    city: 'Yogyakarta', province: 'DIY', tier: 'Tier 3', status: 'Future',
    keyInsight: 'Student and tourism rental market — niche but high yield potential',
    scores: { 'Population Growth Trend': 5, 'Rental Yield Attractiveness': 8, 'Infrastructure Momentum': 6, 'Foreign Investment Interest': 4, 'Agent Network Density': 4, 'Developer Pipeline Potential': 4, 'Existing Listing Volume': 4, 'Portal Fragmentation Index': 7, 'Intelligence Differentiation Gap': 9, 'Brand Awareness Baseline': 2 },
  },
  {
    city: 'Semarang', province: 'Jawa Tengah', tier: 'Tier 3', status: 'Future',
    keyInsight: 'Industrial corridor growth — affordable entry point for expansion',
    scores: { 'Population Growth Trend': 5, 'Rental Yield Attractiveness': 6, 'Infrastructure Momentum': 6, 'Foreign Investment Interest': 2, 'Agent Network Density': 4, 'Developer Pipeline Potential': 4, 'Existing Listing Volume': 4, 'Portal Fragmentation Index': 8, 'Intelligence Differentiation Gap': 10, 'Brand Awareness Baseline': 1 },
  },
];

function computeWeightedScore(scores: Record<string, number>): number {
  const allFactors = EVAL_MODEL.flatMap(c => c.factors);
  let total = 0;
  for (const f of allFactors) {
    total += (scores[f.name] || 0) * f.weight;
  }
  return Math.round((total / (totalWeight * 10)) * 100);
}

/* ═══════════════════════════════════════════
   EXPANSION PLAYBOOK
   ═══════════════════════════════════════════ */

const PLAYBOOK_PHASES = [
  {
    phase: 'Phase 1: Market Validation',
    duration: 'Months 1–2',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    icon: Target,
    steps: [
      'Run demand signal analysis using existing platform search and inquiry data',
      'Identify top 20 agents in the city through referral network and competitor listing analysis',
      'Map active developer projects and upcoming launches for partnership pipeline',
      'Assess competitive landscape fragmentation and intelligence gap opportunity',
    ],
    gate: 'Proceed if weighted score ≥ 65 and agent pipeline ≥ 10 confirmed contacts',
  },
  {
    phase: 'Phase 2: Soft Launch',
    duration: 'Months 3–4',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: Radio,
    steps: [
      'Onboard first 10 agents with white-glove training and listing upload support',
      'Secure 2–3 developer partnerships for featured project listings',
      'Activate city-specific SEO landing pages and Google Ads targeting',
      'Launch localized Market Intelligence dashboard with area price trends',
    ],
    gate: 'Proceed if 100+ active listings and 500+ monthly unique visitors achieved',
  },
  {
    phase: 'Phase 3: Growth Acceleration',
    duration: 'Months 5–8',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    icon: Zap,
    steps: [
      'Scale agent onboarding to 50+ with referral incentive program',
      'Activate premium subscription sales to local investor community',
      'Launch developer demand analytics reports as paid service',
      'Deploy AI investment recommendations calibrated with local transaction data',
    ],
    gate: 'Proceed if 500+ listings, 3+ paying subscribers, and first transaction closed',
  },
  {
    phase: 'Phase 4: Market Dominance',
    duration: 'Months 9–12',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    icon: Crown,
    steps: [
      'Achieve top-3 listing volume position in the city',
      'Build proprietary pricing dataset sufficient for AI accuracy benchmarking',
      'Establish recurring revenue from subscriptions and developer services',
      'Begin evaluating next expansion city using validated framework',
    ],
    gate: 'City is "established" when generating ≥ Rp 500M/month in platform revenue',
  },
];

/* ═══════════════════════════════════════════
   STATUS STYLES
   ═══════════════════════════════════════════ */

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  Active: { color: 'text-chart-1', bg: 'bg-chart-1/10', icon: CheckCircle2 },
  Ready: { color: 'text-chart-2', bg: 'bg-chart-2/10', icon: ArrowUpRight },
  Evaluating: { color: 'text-chart-4', bg: 'bg-chart-4/10', icon: Activity },
  Future: { color: 'text-muted-foreground', bg: 'bg-muted/30', icon: Clock },
};

const tierColors: Record<string, string> = {
  'Tier 1': 'border-chart-2/30 text-chart-2',
  'Tier 2': 'border-primary/30 text-primary',
  'Tier 3': 'border-muted-foreground/30 text-muted-foreground',
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function CityExpansionPage() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [expandedCity, setExpandedCity] = useState('Jakarta (Jabodetabek)');

  const rankedCities = useMemo(() =>
    [...CANDIDATES]
      .map(c => ({ ...c, totalScore: computeWeightedScore(c.scores) }))
      .sort((a, b) => b.totalScore - a.totalScore),
  []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-chart-4" />
                </div>
                City Expansion Framework
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Structured decision model for intelligent marketplace expansion</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">{CANDIDATES.filter(c => c.status === 'Active').length} Active</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">{CANDIDATES.filter(c => c.status === 'Ready').length} Ready</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-4/20 text-chart-4">{CANDIDATES.filter(c => c.status === 'Evaluating').length} Evaluating</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="matrix">Scoring Matrix</TabsTrigger>
            <TabsTrigger value="model">Evaluation Model</TabsTrigger>
            <TabsTrigger value="playbook">Expansion Playbook</TabsTrigger>
          </TabsList>

          {/* ═══ SCORING MATRIX ═══ */}
          <TabsContent value="matrix" className="space-y-3">
            {rankedCities.map((city, i) => {
              const isExpanded = expandedCity === city.city;
              const sc = statusConfig[city.status];
              const SIcon = sc.icon;
              const scoreColor = city.totalScore >= 75 ? 'text-chart-1' : city.totalScore >= 60 ? 'text-chart-2' : city.totalScore >= 45 ? 'text-chart-4' : 'text-muted-foreground';

              return (
                <motion.div key={city.city} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card
                    className={cn('border bg-card cursor-pointer transition-all', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedCity(isExpanded ? '' : city.city)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-sm font-black text-muted-foreground">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-sm">{city.city}</CardTitle>
                            <Badge variant="outline" className={cn('text-[7px]', tierColors[city.tier])}>{city.tier}</Badge>
                            <Badge variant="outline" className={cn('text-[7px] border-0', sc.bg, sc.color)}>
                              <SIcon className="h-2 w-2 mr-0.5" />{city.status}
                            </Badge>
                          </div>
                          <p className="text-[9px] text-muted-foreground truncate">{city.province} — {city.keyInsight}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn('text-lg font-black', scoreColor)}>{city.totalScore}</p>
                          <p className="text-[7px] text-muted-foreground">/100</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={e => e.stopPropagation()}>
                        <div className="space-y-3">
                          {EVAL_MODEL.map(cat => (
                            <div key={cat.category}>
                              <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-1.5', cat.color)}>{cat.category}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {cat.factors.map(f => {
                                  const score = city.scores[f.name] || 0;
                                  const barColor = score >= 8 ? 'bg-chart-1' : score >= 6 ? 'bg-chart-2' : score >= 4 ? 'bg-chart-4' : 'bg-muted-foreground';
                                  return (
                                    <div key={f.name} className="flex items-center gap-2 p-2 rounded bg-muted/10 border border-border/20">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-medium text-foreground truncate">{f.name}</p>
                                        <div className="h-1 rounded-full bg-muted/20 mt-1 overflow-hidden">
                                          <div className={cn('h-full rounded-full', barColor)} style={{ width: `${score * 10}%` }} />
                                        </div>
                                      </div>
                                      <span className={cn('text-xs font-black w-5 text-right', score >= 8 ? 'text-chart-1' : score >= 6 ? 'text-chart-2' : 'text-muted-foreground')}>
                                        {score}
                                      </span>
                                    </div>
                                  );
                                })}
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
          </TabsContent>

          {/* ═══ EVALUATION MODEL ═══ */}
          <TabsContent value="model" className="space-y-4">
            {/* Weight distribution */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Factor Weight Distribution (Total: {totalWeight}%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EVAL_MODEL.map(cat => {
                    const CIcon = cat.icon;
                    const catWeight = cat.factors.reduce((s, f) => s + f.weight, 0);
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', cat.bgColor)}>
                            <CIcon className={cn('h-3.5 w-3.5', cat.color)} />
                          </div>
                          <p className="text-xs font-bold text-foreground flex-1">{cat.category}</p>
                          <span className={cn('text-xs font-black', cat.color)}>{catWeight}%</span>
                        </div>
                        <div className="space-y-1.5 pl-9">
                          {cat.factors.map(f => {
                            const FIcon = f.icon;
                            return (
                              <div key={f.name} className="p-2.5 rounded-lg bg-muted/10 border border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <FIcon className={cn('h-3 w-3', cat.color)} />
                                  <p className="text-[10px] font-bold text-foreground flex-1">{f.name}</p>
                                  <Badge variant="outline" className="text-[7px] font-mono">{f.weight}%</Badge>
                                </div>
                                <p className="text-[9px] text-muted-foreground leading-relaxed">{f.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Decision thresholds */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Decision Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { range: '75–100', label: 'Strong Expansion Candidate', desc: 'Immediate priority — begin Phase 1 validation', color: 'text-chart-1', bg: 'bg-chart-1/10' },
                  { range: '60–74', label: 'Viable with Conditions', desc: 'Requires specific supply-side partnerships before committing resources', color: 'text-chart-2', bg: 'bg-chart-2/10' },
                  { range: '45–59', label: 'Monitor & Develop', desc: 'Track infrastructure and competitive signals — reassess quarterly', color: 'text-chart-4', bg: 'bg-chart-4/10' },
                  { range: '0–44', label: 'Not Ready', desc: 'Insufficient demand or supply infrastructure — revisit in 12+ months', color: 'text-muted-foreground', bg: 'bg-muted/20' },
                ].map(t => (
                  <div key={t.range} className={cn('flex items-center gap-3 p-3 rounded-lg', t.bg)}>
                    <span className={cn('text-sm font-black w-16', t.color)}>{t.range}</span>
                    <div>
                      <p className="text-[10px] font-bold text-foreground">{t.label}</p>
                      <p className="text-[9px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-primary/15 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Expansion Discipline</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Never expand to a new city until the previous city achieves "established" status (≥ Rp 500M/month platform revenue). Premature expansion dilutes marketplace density, weakens brand positioning, and fragments operational focus. One dominant city is worth more than five mediocre ones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PLAYBOOK ═══ */}
          <TabsContent value="playbook" className="space-y-4">
            {PLAYBOOK_PHASES.map((phase, i) => {
              const PIcon = phase.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', phase.bgColor)}>
                          <PIcon className={cn('h-5 w-5', phase.color)} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{phase.phase}</CardTitle>
                          <p className="text-[9px] text-muted-foreground">{phase.duration}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {phase.steps.map((step, j) => (
                        <div key={j} className="flex items-start gap-2 p-2 rounded bg-muted/10 border border-border/20">
                          <CircleDot className={cn('h-3 w-3 mt-0.5 flex-shrink-0', phase.color)} />
                          <p className="text-[10px] text-foreground">{step}</p>
                        </div>
                      ))}
                      <div className={cn('p-2.5 rounded-lg border', phase.bgColor, 'border-border/20')}>
                        <p className="text-[9px]">
                          <span className={cn('font-bold', phase.color)}>Phase Gate:</span>{' '}
                          <span className="text-foreground">{phase.gate}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
