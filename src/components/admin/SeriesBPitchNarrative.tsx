import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Zap, TrendingUp, Database, Globe, DollarSign,
  Shield, Target, Users, BarChart3, Layers,
  ChevronRight, AlertTriangle, CheckCircle2,
  ArrowUpRight, Presentation, Brain, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

interface PitchSlide {
  id: number;
  title: string;
  headline: string;
  narrative: string;
  metrics: { label: string; value: string; context?: string }[];
  speakerNotes: string;
  category: 'thesis' | 'traction' | 'moat' | 'revenue' | 'vision';
}

const SLIDES: PitchSlide[] = [
  {
    id: 1, title: 'The Broken Market', headline: '$120B trapped in friction',
    category: 'thesis',
    narrative: 'Indonesia\'s real estate market processes $120B+ annually through fragmented portals, opaque pricing, and vendor ecosystems that add weeks to every transaction. The result: capital moves 4x slower than it should.',
    metrics: [
      { label: 'Annual RE transactions', value: '$120B+', context: 'Indonesia alone' },
      { label: 'Avg days on market', value: '127 days', context: 'Industry average' },
      { label: 'Price transparency', value: '<15%', context: 'Deals with reliable comps' },
      { label: 'Vendor fragmentation', value: '94%', context: 'No integrated service layer' },
    ],
    speakerNotes: 'Open with the pain. Every investor has experienced slow, opaque property transactions. This is not a niche problem — it is the entire market.',
  },
  {
    id: 2, title: 'Why Now', headline: 'Three forces converging',
    category: 'thesis',
    narrative: 'Digital adoption post-COVID reached 78% of property searchers. Government push for property tax transparency creates data infrastructure. And institutional capital is actively seeking exposure to Indonesian RE — but lacks reliable intelligence.',
    metrics: [
      { label: 'Digital property search', value: '78%', context: 'Up from 34% pre-COVID' },
      { label: 'Institutional demand gap', value: '$8.2B', context: 'Undeployed RE allocation SEA' },
      { label: 'Govt digitization push', value: '2024–2028', context: 'National land registry reform' },
      { label: 'Millennial buyer share', value: '62%', context: 'Digital-native decision makers' },
    ],
    speakerNotes: 'Timing justification is critical for Series B. Show this is not just a good idea — it is an inevitable shift, and ASTRA is positioned at the intersection.',
  },
  {
    id: 3, title: 'ASTRA: The Liquidity OS', headline: 'Not a portal. An operating system.',
    category: 'thesis',
    narrative: 'ASTRA replaces the fragmented stack with an AI-powered liquidity operating system: real-time pricing intelligence, automated vendor routing, investor capital matching, and transaction orchestration — all in one platform.',
    metrics: [
      { label: 'AI pricing accuracy', value: '87.3%', context: 'vs 61% industry benchmark' },
      { label: 'Avg transaction speed', value: '41 days', context: 'vs 127 industry median' },
      { label: 'Vendor response time', value: '<4 hrs', context: 'vs 72 hrs traditional' },
      { label: 'Platform integrations', value: '18+', context: 'Edge functions live' },
    ],
    speakerNotes: 'This is the "aha" slide. The key insight is that ASTRA is infrastructure, not a marketplace listing site. Infrastructure companies get higher multiples.',
  },
  {
    id: 4, title: 'Traction Explosion', headline: 'Metrics that prove product-market fit',
    category: 'traction',
    narrative: 'In 12 months, ASTRA has grown from zero to meaningful transaction volume with compounding network effects. Every metric shows acceleration, not linear growth.',
    metrics: [
      { label: 'Monthly GMV', value: 'Rp 85B', context: '+340% YoY' },
      { label: 'Deals per month', value: '48', context: '+280% from Month 1' },
      { label: 'Active investors', value: '3,200', context: '27x from launch' },
      { label: 'Vendor network', value: '310', context: '8x from launch' },
    ],
    speakerNotes: 'Lead with GMV — it is the most legible metric for real estate investors. Then show the compounding nature of growth across all dimensions.',
  },
  {
    id: 5, title: 'Revenue Engine', headline: 'Five monetization layers, all growing',
    category: 'revenue',
    narrative: 'ASTRA generates revenue from five independent streams, reducing concentration risk and creating multiple expansion paths. Transaction fees anchor the model; SaaS subscriptions provide predictability.',
    metrics: [
      { label: 'Monthly revenue', value: 'Rp 980M', context: 'Rp 11.7B ARR run-rate' },
      { label: 'Platform take-rate', value: '1.15%', context: 'Room to expand to 2%+' },
      { label: 'Subscription MRR', value: 'Rp 220M', context: 'Investor + Vendor SaaS' },
      { label: 'Revenue diversification', value: '5 streams', context: 'No single stream >45%' },
    ],
    speakerNotes: 'Emphasize the diversification. Single-stream businesses are risky. Five revenue layers with independent growth drivers is a VC dream.',
  },
  {
    id: 6, title: 'Unit Economics', headline: 'Capital efficiency that compounds',
    category: 'revenue',
    narrative: 'ASTRA\'s unit economics validate that every dollar of growth capital generates outsized returns. The flywheel nature means CAC decreases as the network grows.',
    metrics: [
      { label: 'Investor LTV/CAC', value: '60×', context: 'Blended CAC Rp 95K' },
      { label: 'Vendor LTV/CAC', value: '35×', context: 'Blended CAC Rp 380K' },
      { label: 'CAC payback', value: '<4 months', context: 'Both segments' },
      { label: 'Contribution margin', value: 'Positive', context: 'Per deal profitable' },
    ],
    speakerNotes: 'These ratios are exceptional. Industry average LTV/CAC is 3-5x. 60x means the business is organically efficient, not just growth-hacking.',
  },
  {
    id: 7, title: 'The Data Moat', headline: 'Intelligence that competitors cannot replicate',
    category: 'moat',
    narrative: 'Every transaction on ASTRA generates proprietary data that feeds five intelligence pillars. This creates a compounding advantage: the more activity, the smarter the platform, the faster deals close, the more activity.',
    metrics: [
      { label: 'Behavioral data points', value: '100K+', context: 'Growing daily' },
      { label: 'Price prediction accuracy', value: '87.3%', context: 'Improving monthly' },
      { label: 'Liquidity index coverage', value: '12 districts', context: 'Expanding to 40+' },
      { label: 'Replication difficulty', value: '92/100', context: 'Near-impossible to clone' },
    ],
    speakerNotes: 'This is the defensibility slide. VCs need to believe the moat deepens over time. The key: proprietary data + network effects = winner-take-most dynamics.',
  },
  {
    id: 8, title: 'Network Effect Flywheel', headline: 'Self-reinforcing growth loops',
    category: 'moat',
    narrative: 'ASTRA operates four interlocking flywheels: supply (listings attract investors), demand (investors attract vendors), intelligence (data improves matching), and revenue (margin funds growth). Each accelerates the others.',
    metrics: [
      { label: 'Listings per investor', value: '0.26', context: 'Improving supply density' },
      { label: 'Vendor competition index', value: '3.8×', context: 'Per category coverage' },
      { label: 'Referral-driven signups', value: '18%', context: 'Organic viral growth' },
      { label: 'Deal conversion rate', value: '6.4%', context: 'vs 2.1% industry avg' },
    ],
    speakerNotes: 'Draw the flywheel on a whiteboard if possible. The visual of four loops accelerating each other is more powerful than any chart.',
  },
  {
    id: 9, title: 'City Expansion Blueprint', headline: 'Proven playbook, ready to replicate',
    category: 'vision',
    narrative: 'ASTRA\'s city launch model is capital-efficient and repeatable. Each new city reaches near break-even by month 9-10, then becomes a liquidity hub that funds further expansion.',
    metrics: [
      { label: 'Launch capital per city', value: 'Rp 1.5B', context: '~$95K per city' },
      { label: 'Break-even timeline', value: '9-10 months', context: 'Per city economics' },
      { label: 'Target cities Year 2', value: '8-12', context: 'Java + Bali focus' },
      { label: 'Month 6 city revenue', value: 'Rp 220-300M', context: 'Per city run-rate' },
    ],
    speakerNotes: 'Series B investors want to see scalable unit economics at the city level. Show that each city is a mini-business that becomes self-sustaining.',
  },
  {
    id: 10, title: 'Regional Domination', headline: 'Southeast Asia\'s intelligence backbone',
    category: 'vision',
    narrative: 'Indonesia is the beachhead. The same liquidity infrastructure applies across SEA\'s $340B combined RE market. ASTRA becomes the Bloomberg Terminal for real estate capital flows in emerging markets.',
    metrics: [
      { label: 'SEA RE market', value: '$340B', context: 'Combined annual volume' },
      { label: 'Target markets', value: '6 countries', context: 'ID, MY, TH, VN, PH, SG' },
      { label: 'Institutional demand', value: '$8.2B', context: 'Undeployed allocation' },
      { label: 'Data licensing TAM', value: '$180M', context: 'Annual intelligence API' },
    ],
    speakerNotes: 'Paint the vision big but credible. Indonesia dominance first, then expand. The data licensing opportunity alone justifies the valuation.',
  },
  {
    id: 11, title: 'The Ask', headline: 'Series B: $15-25M to own SEA real estate intelligence',
    category: 'revenue',
    narrative: 'We are raising $15-25M to accelerate city expansion (8-12 cities), deepen the AI intelligence moat, launch institutional data APIs, and build the regional expansion team.',
    metrics: [
      { label: 'Raise target', value: '$15-25M', context: 'Series B round' },
      { label: 'Use: City expansion', value: '40%', context: '8-12 new cities' },
      { label: 'Use: AI & Data', value: '30%', context: 'Intelligence moat' },
      { label: 'Use: Team & Ops', value: '30%', context: 'Regional buildout' },
    ],
    speakerNotes: 'Be specific about use of funds. Investors want to see that capital drives measurable outcomes, not vague "growth" spending.',
  },
  {
    id: 12, title: 'Why ASTRA Wins', headline: 'The only team building real estate infrastructure',
    category: 'moat',
    narrative: 'ASTRA combines deep market expertise, proprietary AI, and first-mover advantage in the largest underserved RE market globally. The team has built 450+ database tables, 18 edge functions, and 6 autonomous AI workers — infrastructure that would take competitors 2+ years to replicate.',
    metrics: [
      { label: 'Technical moat', value: '450+ tables', context: 'Production infrastructure' },
      { label: 'AI systems', value: '6 autonomous', context: 'Self-improving engines' },
      { label: 'Time to replicate', value: '2+ years', context: 'Conservative estimate' },
      { label: 'Market position', value: '#1', context: 'AI proptech Indonesia' },
    ],
    speakerNotes: 'Close with confidence. The team slide is about conviction — investors bet on people who have already built something extraordinary.',
  },
];

const CATEGORY_CONFIG = {
  thesis: { label: 'Market Thesis', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: Zap },
  traction: { label: 'Traction Proof', color: 'bg-chart-1/10 text-chart-1 border-chart-1/20', icon: TrendingUp },
  moat: { label: 'Data Moat', color: 'bg-chart-2/10 text-chart-2 border-chart-2/20', icon: Shield },
  revenue: { label: 'Revenue', color: 'bg-chart-3/10 text-chart-3 border-chart-3/20', icon: DollarSign },
  vision: { label: 'Vision', color: 'bg-chart-4/10 text-chart-4 border-chart-4/20', icon: Globe },
};

const OBJECTIONS = [
  {
    question: 'Why isn\'t a major portal doing this?',
    angle: 'Incumbent Disruption',
    response: 'Portals monetize listing fees — they have zero incentive to speed up transactions. ASTRA monetizes transaction velocity. Different business model = different product.',
    strength: 95,
  },
  {
    question: 'Can this work outside Indonesia?',
    angle: 'Market Expansion',
    response: 'Every SEA market has the same fragmentation. Our city playbook is geography-agnostic — the intelligence layer adapts to local data. We\'ve already mapped expansion signals in 5 countries.',
    strength: 85,
  },
  {
    question: 'What if a well-funded competitor enters?',
    angle: 'Competitive Defense',
    response: 'Our moat is compounding data, not features. 100K+ behavioral events, proprietary pricing models, and vendor performance intelligence cannot be replicated with funding alone. Time-to-data is our defense.',
    strength: 90,
  },
  {
    question: 'How do you maintain quality at scale?',
    angle: 'Operational Risk',
    response: 'AI-driven vendor scoring and SLA monitoring ensure quality improves with scale. More data = better routing = higher completion rates. We\'ve built autonomous quality loops.',
    strength: 82,
  },
  {
    question: 'Is the take-rate sustainable?',
    angle: 'Revenue Durability',
    response: '1.15% is conservative — below global proptech averages of 2-3%. As we add intelligence value (pricing, matching, escrow), the platform earns a higher share of value created.',
    strength: 88,
  },
  {
    question: 'What about regulatory risk?',
    angle: 'Regulatory',
    response: 'We align with Indonesia\'s digital property initiative. Our data infrastructure actually helps regulators — transparent pricing and transaction records. We\'re a compliance asset, not a liability.',
    strength: 78,
  },
];

const VALUATION_DRIVERS = [
  { driver: 'Revenue Multiple (ARR)', current: 'Rp 11.7B', multiple: '15-25×', implied: '$11-18M', weight: 30 },
  { driver: 'GMV Multiple', current: 'Rp 85B/mo', multiple: '0.8-1.5×', implied: '$50-95M', weight: 25 },
  { driver: 'Data Asset Premium', current: '100K+ data points', multiple: '2-3× lift', implied: '+40-60%', weight: 20 },
  { driver: 'Network Effect Premium', current: '4 flywheels active', multiple: '1.5-2× lift', implied: '+30-50%', weight: 15 },
  { driver: 'Market Position Premium', current: '#1 AI proptech ID', multiple: 'Category leader', implied: '+20-30%', weight: 10 },
];

const SeriesBPitchNarrative = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const slide = SLIDES[activeSlide];
  const catConfig = CATEGORY_CONFIG[slide.category];
  const CatIcon = catConfig.icon;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Presentation className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Series B Pitch Narrative</h1>
            <p className="text-sm text-muted-foreground">12-slide investor storyline · objection handling · valuation framework</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)} className="gap-1.5 text-xs">
          <Brain className="h-3.5 w-3.5" />
          {showNotes ? 'Hide' : 'Show'} Speaker Notes
        </Button>
      </div>

      <Tabs defaultValue="storyline" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="storyline" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />Slide Storyline</TabsTrigger>
          <TabsTrigger value="objections" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" />Objection Handling</TabsTrigger>
          <TabsTrigger value="valuation" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Valuation Logic</TabsTrigger>
        </TabsList>

        {/* ── Slide Storyline ── */}
        <TabsContent value="storyline">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Slide Navigator */}
            <div className="lg:col-span-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">Slides</p>
              {SLIDES.map((s, i) => {
                const cfg = CATEGORY_CONFIG[s.category];
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlide(i)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2 transition-all duration-200 border",
                      i === activeSlide
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0",
                        i === activeSlide ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {s.id}
                      </span>
                      <span className={cn("text-xs font-medium truncate", i === activeSlide ? "text-foreground" : "text-muted-foreground")}>
                        {s.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Slide Detail */}
            <div className="lg:col-span-9 space-y-4">
              <motion.div key={slide.id} {...fadeIn}>
                {/* Slide Header */}
                <Card className="border-border/40 overflow-hidden">
                  <div className="bg-gradient-to-br from-card to-muted/30 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={cn("text-[10px] border gap-1", catConfig.color)}>
                        <CatIcon className="h-3 w-3" />
                        {catConfig.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Slide {slide.id} of 12</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1" style={{ lineHeight: '1.15' }}>
                      {slide.headline}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-3 max-w-[65ch]">{slide.narrative}</p>
                  </div>

                  <CardContent className="p-6 pt-4">
                    {/* Key Metrics */}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Key Data Points</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {slide.metrics.map((m) => (
                        <div key={m.label} className="rounded-lg border border-border/30 px-3 py-2.5 bg-muted/20">
                          <p className="text-lg font-bold tabular-nums text-foreground">{m.value}</p>
                          <p className="text-xs font-medium text-foreground mt-0.5">{m.label}</p>
                          {m.context && <p className="text-[10px] text-muted-foreground">{m.context}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Speaker Notes */}
                    {showNotes && (
                      <div className="mt-4 rounded-lg bg-amber-500/5 border border-amber-500/15 px-4 py-3">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">🎙 Speaker Notes</p>
                        <p className="text-sm text-foreground/80">{slide.speakerNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-3">
                  <Button
                    variant="outline" size="sm"
                    disabled={activeSlide === 0}
                    onClick={() => setActiveSlide(i => i - 1)}
                    className="text-xs"
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === activeSlide ? "bg-primary w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline" size="sm"
                    disabled={activeSlide === SLIDES.length - 1}
                    onClick={() => setActiveSlide(i => i + 1)}
                    className="text-xs gap-1"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        {/* ── Objection Handling ── */}
        <TabsContent value="objections">
          <div className="space-y-3">
            {OBJECTIONS.map((obj) => (
              <Card key={obj.question} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] font-medium">{obj.angle}</Badge>
                        <div className="flex items-center gap-1.5">
                          <Progress value={obj.strength} className="h-1.5 w-16" />
                          <span className="text-[10px] tabular-nums text-muted-foreground">{obj.strength}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1.5">❓ "{obj.question}"</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">→ </span>{obj.response}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Valuation Logic ── */}
        <TabsContent value="valuation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Valuation Build-Up
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {VALUATION_DRIVERS.map((v) => (
                  <div key={v.driver} className="rounded-lg border border-border/30 px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{v.driver}</span>
                      <Badge variant="outline" className="text-[10px] tabular-nums">{v.weight}% weight</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Current</span>
                        <p className="font-bold tabular-nums text-foreground">{v.current}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Multiple</span>
                        <p className="font-bold tabular-nums text-foreground">{v.multiple}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Implied</span>
                        <p className="font-bold tabular-nums text-foreground">{v.implied}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Implied Valuation Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Series B Target Valuation</p>
                    <p className="text-4xl font-bold text-foreground mt-1 tabular-nums" style={{ lineHeight: '1.1' }}>$60M – $180M</p>
                    <p className="text-sm text-muted-foreground mt-2">IDR 1T – 3T equivalent</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { label: 'Conservative (Revenue × 15)', value: '$60M', bar: 33 },
                      { label: 'Base Case (Revenue × 20 + Data Premium)', value: '$110M', bar: 61 },
                      { label: 'Upside (GMV + Network + Category Leader)', value: '$180M', bar: 100 },
                    ].map(s => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-bold tabular-nums text-foreground">{s.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/70 transition-all duration-700"
                            style={{ width: `${s.bar}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    Comparable Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { company: 'PropertyGuru (SGX)', round: 'Pre-IPO', valuation: '$1.78B', multiple: '22× revenue' },
                    { company: '99.co', round: 'Series C', valuation: '$99M', multiple: '18× revenue' },
                    { company: 'Pinhome (ID)', round: 'Series B', valuation: '$180M', multiple: '0.9× GMV' },
                    { company: 'Propseller (SG)', round: 'Series A', valuation: '$28M', multiple: '25× revenue' },
                  ].map(c => (
                    <div key={c.company} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.company}</p>
                        <p className="text-[10px] text-muted-foreground">{c.round}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">{c.valuation}</p>
                        <p className="text-[10px] text-muted-foreground">{c.multiple}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeriesBPitchNarrative;
