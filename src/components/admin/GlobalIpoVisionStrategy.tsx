import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Globe, TrendingUp, Shield, DollarSign, Building2,
  BarChart3, Target, Users, Layers, CheckCircle2,
  AlertTriangle, ChevronRight, ArrowUpRight, Cpu,
  Lock, Eye, Zap, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── Roadmap Phases ──

const ROADMAP_PHASES = [
  {
    year: 'Year 1-2', phase: 'Foundation & PMF', color: 'bg-chart-1',
    valuation: '$20-60M', arr: '$4-16M', gmv: '$50-200M/yr',
    objectives: [
      'Dominate 2-8 Indonesian cities',
      'Validate unit economics at city level',
      'Close Series A + B rounds',
      'Build core data moat (100K+ behavioral events)',
    ],
    governance: ['Establish PT legal structure', 'KBLI codes + NIB licensing', 'Initial board formation (3 seats)'],
    readiness: 25,
  },
  {
    year: 'Year 3', phase: 'National Dominance', color: 'bg-chart-2',
    valuation: '$150-300M', arr: '$45M', gmv: '$1.2B/yr',
    objectives: [
      '20+ cities across Java, Bali, Sumatra',
      'Launch institutional data API (Basic + Premium)',
      'Achieve 68K active investors',
      'Begin SEA market research',
    ],
    governance: ['Expand board to 5 seats (2 independent)', 'Implement SOX-lite financial controls', 'First Big 4 audit engagement'],
    readiness: 45,
  },
  {
    year: 'Year 4', phase: 'Regional Expansion', color: 'bg-chart-3',
    valuation: '$400-700M', arr: '$80M', gmv: '$3B/yr',
    objectives: [
      'Enter Malaysia, Thailand, Vietnam',
      '35 cities across 3 countries',
      'Enterprise data licensing revenue >$8M',
      '140K active investors across region',
    ],
    governance: ['Singapore HoldCo for cross-border structure', 'Full audit committee with financial expert', 'Implement internal audit function'],
    readiness: 60,
  },
  {
    year: 'Year 5', phase: 'Pre-IPO Preparation', color: 'bg-chart-4',
    valuation: '$800M-1.2B', arr: '$100M', gmv: '$5B/yr',
    objectives: [
      '50 cities across 6 countries',
      'Achieve $100M ARR milestone',
      'Demonstrate 3+ quarters of EBITDA positivity',
      'Secure anchor institutional shareholders',
    ],
    governance: ['9-seat board (majority independent)', 'Full SOX compliance framework', 'Investor relations team operational', 'D&O insurance + legal readiness'],
    readiness: 75,
  },
  {
    year: 'Year 6', phase: 'IPO Execution', color: 'bg-chart-5',
    valuation: '$1.5-3B', arr: '$140-180M', gmv: '$8B/yr',
    objectives: [
      'Select listing venue (SGX, IDX, or dual)',
      'Complete 30-day IPO execution timeline',
      'Price at 15-25× ARR multiple',
      'Achieve 18% float with controlled distribution',
    ],
    governance: ['Quarterly earnings cadence established', 'ESG reporting framework', 'Dual-class share structure activated', 'Post-IPO stabilization protocols'],
    readiness: 90,
  },
  {
    year: 'Year 7+', phase: 'Public Market Leadership', color: 'bg-primary',
    valuation: '$3-8B', arr: '$250M+', gmv: '$15B+/yr',
    objectives: [
      'Category re-rating from Proptech → Financial Infrastructure',
      'Cross-border capital flow platform',
      'Sovereign fund strategic partnerships',
      'Expand to Middle East, Africa markets',
    ],
    governance: ['Valuation re-rating campaign (2-4× uplift)', 'Secondary liquidity programs', 'Shareholder activist defense protocols', 'Staggered board + poison pill readiness'],
    readiness: 100,
  },
];

// ── Financial Targets ──

const FINANCIAL_TRAJECTORY = [
  { year: 'Y1', arr: 4, ebitda: -3, gmv: 50, margin: -75 },
  { year: 'Y2', arr: 16, ebitda: -5, gmv: 200, margin: -31 },
  { year: 'Y3', arr: 45, ebitda: 2, gmv: 1200, margin: 4 },
  { year: 'Y4', arr: 80, ebitda: 12, gmv: 3000, margin: 15 },
  { year: 'Y5', arr: 100, ebitda: 22, gmv: 5000, margin: 22 },
  { year: 'Y6', arr: 160, ebitda: 48, gmv: 8000, margin: 30 },
  { year: 'Y7', arr: 250, ebitda: 88, gmv: 15000, margin: 35 },
];

// ── Readiness Pillars ──

const READINESS_PILLARS = [
  {
    pillar: 'Market Dominance', icon: Globe, color: 'text-chart-1',
    score: 35, target: 90,
    criteria: [
      { item: '#1 market share in 3+ Indonesian cities', status: 'in_progress' as const },
      { item: 'Exclusive developer partnerships (10+)', status: 'planned' as const },
      { item: 'Investor network effect measurable', status: 'in_progress' as const },
      { item: 'Cross-city liquidity arbitrage active', status: 'planned' as const },
    ],
  },
  {
    pillar: 'Revenue Quality', icon: DollarSign, color: 'text-chart-2',
    score: 42, target: 85,
    criteria: [
      { item: 'Recurring revenue >60% of total', status: 'in_progress' as const },
      { item: 'Net Revenue Retention >130%', status: 'planned' as const },
      { item: 'Data licensing >$12M ARR', status: 'planned' as const },
      { item: 'Transaction commission volatility <15%', status: 'planned' as const },
    ],
  },
  {
    pillar: 'Data Moat Defensibility', icon: Shield, color: 'text-chart-3',
    score: 48, target: 95,
    criteria: [
      { item: 'Proprietary liquidity index published', status: 'in_progress' as const },
      { item: 'Price prediction accuracy >90%', status: 'in_progress' as const },
      { item: 'Behavioral dataset >1M events', status: 'planned' as const },
      { item: 'Replication difficulty score >90/100', status: 'completed' as const },
    ],
  },
  {
    pillar: 'Corporate Governance', icon: Building2, color: 'text-chart-4',
    score: 22, target: 100,
    criteria: [
      { item: 'Independent board majority (5+ of 9)', status: 'planned' as const },
      { item: 'Big 4 audit engagement', status: 'planned' as const },
      { item: 'SOX compliance framework', status: 'planned' as const },
      { item: 'D&O insurance + legal readiness', status: 'planned' as const },
    ],
  },
  {
    pillar: 'Global Investor Story', icon: TrendingUp, color: 'text-chart-5',
    score: 55, target: 90,
    criteria: [
      { item: 'Positioned as infrastructure, not portal', status: 'completed' as const },
      { item: 'Cross-border capital flow demonstrated', status: 'planned' as const },
      { item: 'Institutional data client pipeline', status: 'planned' as const },
      { item: 'Category re-rating narrative ready', status: 'in_progress' as const },
    ],
  },
];

const STATUS_CONFIG = {
  completed: { label: 'Done', className: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
  in_progress: { label: 'Active', className: 'text-chart-1 bg-chart-1/10 border-chart-1/20' },
  planned: { label: 'Planned', className: 'text-muted-foreground bg-muted/50 border-border/30' },
};

// ── Risk Management ──

const PUBLIC_MARKET_RISKS = [
  {
    risk: 'Short-Seller Attack', severity: 'High', probability: 'Medium',
    protocol: '5-stage defense: Detection → Rapid Response (24hr) → Narrative Reframing → Structural Defense → Long-Game Positioning',
    mitigation: 'Maintain data room readiness, pre-brief long-only shareholders, never engage emotionally',
  },
  {
    risk: 'Activist Investor Pressure', severity: 'High', probability: 'Low',
    protocol: 'Dual-class shares (10-20× voting), staggered board, golden share veto on strategic decisions',
    mitigation: 'Proactive shareholder engagement, clear capital allocation framework, transparent governance',
  },
  {
    risk: 'Multiple Compression', severity: 'Medium', probability: 'Medium',
    protocol: 'Category re-rating from Proptech → Financial Infrastructure Platform to access higher multiple bands',
    mitigation: 'Emphasize recurring revenue growth, data licensing margins, institutional adoption metrics',
  },
  {
    risk: 'Regulatory Disruption', severity: 'Medium', probability: 'Low',
    protocol: 'Proactive regulatory engagement, position as compliance infrastructure asset',
    mitigation: 'Multi-jurisdiction holding structure (Singapore/Luxembourg), government advisory relationships',
  },
  {
    risk: 'Key Person Dependency', severity: 'Medium', probability: 'Medium',
    protocol: 'Deep bench of city GMs + VP-level leadership, documented playbooks',
    mitigation: 'Succession planning, ESOP vesting schedules, knowledge management systems',
  },
];

// ── Listing Venue ──

const LISTING_VENUES = [
  { venue: 'SGX (Singapore)', pros: 'SEA hub, institutional credibility, USD-denominated', cons: 'Smaller retail base, lower liquidity', fit: 88 },
  { venue: 'IDX (Jakarta)', pros: 'Home market, local retail demand, regulatory alignment', cons: 'Lower international visibility, IDR denomination', fit: 72 },
  { venue: 'Dual Listing (SGX + IDX)', pros: 'Maximum visibility, both audiences', cons: 'Higher compliance cost, complexity', fit: 82 },
  { venue: 'NYSE/NASDAQ (via SPAC or Direct)', pros: 'Global reach, highest multiples', cons: 'SEC compliance burden, distance from operations', fit: 45 },
];

const GlobalIpoVisionStrategy = () => {
  const overallReadiness = Math.round(READINESS_PILLARS.reduce((s, p) => s + p.score, 0) / READINESS_PILLARS.length);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Global IPO Vision Strategy</h1>
          <p className="text-sm text-muted-foreground">7-year roadmap · readiness pillars · valuation milestones · public market defense</p>
        </div>
      </div>

      {/* Readiness Score Bar */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall IPO Readiness</p>
            <span className="text-sm font-bold tabular-nums text-foreground">{overallReadiness}%</span>
          </div>
          <Progress value={overallReadiness} className="h-2.5" />
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Foundation</span>
            <span>Pre-IPO</span>
            <span>IPO Ready</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roadmap" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap">
          <TabsTrigger value="roadmap" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />7-Year Roadmap</TabsTrigger>
          <TabsTrigger value="pillars" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Readiness Pillars</TabsTrigger>
          <TabsTrigger value="financials" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Financial Targets</TabsTrigger>
          <TabsTrigger value="listing" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" />Listing Strategy</TabsTrigger>
          <TabsTrigger value="risks" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" />Risk Defense</TabsTrigger>
        </TabsList>

        {/* ── 7-Year Roadmap ── */}
        <TabsContent value="roadmap">
          <div className="space-y-3">
            {ROADMAP_PHASES.map((p, i) => (
              <Card key={p.year} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0", p.color)}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground">{p.phase}</h3>
                        <Badge variant="outline" className="text-[10px]">{p.year}</Badge>
                        <Badge variant="outline" className="text-[10px] text-chart-1 bg-chart-1/10 border-chart-1/20 font-bold tabular-nums">{p.valuation}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                        <div className="rounded bg-muted/30 px-2 py-1.5">
                          <span className="text-muted-foreground">ARR</span>
                          <p className="font-bold tabular-nums text-foreground">{p.arr}</p>
                        </div>
                        <div className="rounded bg-muted/30 px-2 py-1.5">
                          <span className="text-muted-foreground">GMV</span>
                          <p className="font-bold tabular-nums text-foreground">{p.gmv}</p>
                        </div>
                        <div className="rounded bg-muted/30 px-2 py-1.5">
                          <span className="text-muted-foreground">Readiness</span>
                          <div className="flex items-center gap-1.5">
                            <Progress value={p.readiness} className="h-1.5 flex-1" />
                            <span className="font-bold tabular-nums text-foreground">{p.readiness}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Strategic Objectives</p>
                          {p.objectives.map(o => (
                            <p key={o} className="text-foreground flex items-center gap-1 mb-0.5">
                              <ArrowUpRight className="h-2.5 w-2.5 text-chart-2 flex-shrink-0" />{o}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Governance Milestones</p>
                          {p.governance.map(g => (
                            <p key={g} className="text-foreground flex items-center gap-1 mb-0.5">
                              <Lock className="h-2.5 w-2.5 text-chart-4 flex-shrink-0" />{g}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Readiness Pillars ── */}
        <TabsContent value="pillars">
          <div className="space-y-3">
            {READINESS_PILLARS.map(p => {
              const Icon = p.icon;
              return (
                <Card key={p.pillar} className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={cn("h-4 w-4", p.color)} />
                      <h3 className="text-sm font-bold text-foreground">{p.pillar}</h3>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Progress value={p.score} className="h-2 w-24" />
                        <span className="text-xs font-bold tabular-nums text-foreground">{p.score}/{p.target}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {p.criteria.map(c => {
                        const cfg = STATUS_CONFIG[c.status];
                        return (
                          <div key={c.item} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
                            <p className="text-xs text-foreground flex-1">{c.item}</p>
                            <Badge variant="outline" className={cn("text-[9px] ml-2 flex-shrink-0 border", cfg.className)}>
                              {cfg.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Financial Targets ── */}
        <TabsContent value="financials">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  ARR & EBITDA Trajectory ($M)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={FINANCIAL_TRAJECTORY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}M`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="arr" name="ARR" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2.5} />
                    <Area type="monotone" dataKey="ebitda" name="EBITDA" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Metric Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Year</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">ARR</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">EBITDA</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">GMV</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FINANCIAL_TRAJECTORY.map(f => (
                        <tr key={f.year} className="border-b border-border/20">
                          <td className="py-2 px-2 font-medium text-foreground">{f.year}</td>
                          <td className="text-right py-2 px-2 tabular-nums text-foreground">${f.arr}M</td>
                          <td className={cn("text-right py-2 px-2 tabular-nums", f.ebitda < 0 ? "text-destructive" : "text-chart-2")}>${f.ebitda}M</td>
                          <td className="text-right py-2 px-2 tabular-nums text-foreground">${f.gmv >= 1000 ? `${(f.gmv / 1000).toFixed(1)}B` : `${f.gmv}M`}</td>
                          <td className={cn("text-right py-2 px-2 tabular-nums font-medium", f.margin < 0 ? "text-destructive" : "text-chart-2")}>{f.margin}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Valuation Milestones */}
            <div className="lg:col-span-2">
              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Valuation Milestone Staircase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { stage: 'Series A', val: '$20-60M', trigger: '$4M ARR + 2 cities profitable', multiple: '5-15× ARR' },
                      { stage: 'Series B', val: '$60-180M', trigger: '$16M ARR + 8 cities + data API', multiple: '10-20× ARR' },
                      { stage: 'Series C', val: '$300-700M', trigger: '$45-80M ARR + SEA expansion', multiple: '8-15× ARR' },
                      { stage: 'IPO', val: '$1.5-3B', trigger: '$140M+ ARR + EBITDA positive', multiple: '15-25× ARR' },
                    ].map(s => (
                      <div key={s.stage} className="rounded-lg border border-border/30 px-3 py-3">
                        <Badge variant="outline" className="text-[10px] font-bold mb-2">{s.stage}</Badge>
                        <p className="text-lg font-bold tabular-nums text-foreground">{s.val}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{s.trigger}</p>
                        <p className="text-[10px] font-medium text-primary mt-0.5">{s.multiple}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Listing Strategy ── */}
        <TabsContent value="listing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Listing Venue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LISTING_VENUES.map(v => (
                  <div key={v.venue} className="rounded-lg border border-border/30 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-foreground">{v.venue}</h4>
                      <div className="flex items-center gap-1.5">
                        <Progress value={v.fit} className="h-1.5 w-16" />
                        <span className="text-[10px] font-bold tabular-nums text-foreground">{v.fit}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-chart-2">✓ Pros</span>
                        <p className="text-muted-foreground">{v.pros}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-destructive">✗ Cons</span>
                        <p className="text-muted-foreground">{v.cons}</p>
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
                    <Users className="h-4 w-4 text-primary" />
                    IPO Allocation Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { tier: 'Anchor Sovereigns', alloc: '35%', rationale: 'Long-term holders, signal quality', examples: 'GIC, Temasek, ADIA, PIF' },
                    { tier: 'Global Long-Only', alloc: '30%', rationale: 'Fundamental investors, reduce volatility', examples: 'Capital Group, Fidelity, T. Rowe' },
                    { tier: 'Growth Crossovers', alloc: '15%', rationale: 'Bridge private-public transition', examples: 'Tiger Global, Coatue, D1' },
                    { tier: 'Strategic Tech', alloc: '10%', rationale: 'Partnership signal, product credibility', examples: 'Softbank, Grab, Sea Group' },
                    { tier: 'Public Momentum', alloc: '10%', rationale: 'Retail demand, trading liquidity', examples: 'Retail platforms, HNW networks' },
                  ].map(t => (
                    <div key={t.tier} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{t.tier}</span>
                          <Badge variant="outline" className="text-[9px] tabular-nums font-bold">{t.alloc}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{t.rationale} · {t.examples}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-chart-4" />
                    Float & Lockup Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {[
                    { item: 'Initial Float', value: '18% (60M shares)', note: 'Effective tradable <8% in 90 days' },
                    { item: 'Founder Lockup', value: '18-24 months', note: 'Signal long-term commitment' },
                    { item: 'VC Lockup', value: '6/9/12 months staggered', note: 'Prevent cliff-edge selling' },
                    { item: 'Dual-Class Voting', value: '10-20× super-voting', note: '15-year sunset period' },
                  ].map(l => (
                    <div key={l.item} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
                      <span className="font-medium text-foreground">{l.item}</span>
                      <div className="text-right">
                        <span className="font-bold tabular-nums text-foreground">{l.value}</span>
                        <p className="text-[10px] text-muted-foreground">{l.note}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Risk Defense ── */}
        <TabsContent value="risks">
          <div className="space-y-3">
            {PUBLIC_MARKET_RISKS.map(r => (
              <Card key={r.risk} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={cn("h-4 w-4", r.severity === 'High' ? 'text-destructive' : 'text-amber-500')} />
                    <h3 className="text-sm font-bold text-foreground">{r.risk}</h3>
                    <Badge variant="outline" className={cn("text-[9px] border",
                      r.severity === 'High' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'
                    )}>{r.severity}</Badge>
                    <Badge variant="outline" className="text-[9px]">P: {r.probability}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Defense Protocol</p>
                      <p className="text-foreground">{r.protocol}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Mitigation Strategy</p>
                      <p className="text-foreground">{r.mitigation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Investor Narrative Positioning */}
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Category Re-Rating Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { from: 'Proptech Portal', to: 'Financial Infrastructure', multiple: '8-12× → 15-25×', timeline: 'Year 3-5' },
                    { from: 'Regional Player', to: 'Global Data Platform', multiple: '15-25× → 25-40×', timeline: 'Year 5-7' },
                    { from: 'Growth Company', to: 'Durable Compounder', multiple: '25-40× → 30-50×', timeline: 'Year 7+' },
                  ].map(r => (
                    <div key={r.from} className="rounded-lg border border-border/30 px-3 py-3 text-center">
                      <p className="text-xs text-muted-foreground line-through">{r.from}</p>
                      <ChevronRight className="h-3 w-3 mx-auto my-1 text-primary rotate-90" />
                      <p className="text-sm font-bold text-foreground">{r.to}</p>
                      <p className="text-[10px] text-chart-2 font-medium mt-1">{r.multiple}</p>
                      <p className="text-[10px] text-muted-foreground">{r.timeline}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalIpoVisionStrategy;
