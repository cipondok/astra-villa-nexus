import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, DollarSign, Clock, Layers, Target,
  AlertTriangle, Lightbulb, ChevronRight, BarChart3, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  optimizePricingPsychology,
  PriceSegment,
  PsychPricingOutput,
} from '@/lib/pricingPsychology';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar,
} from 'recharts';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const SCENARIOS = [
  { name: 'Hot New Listing (Menteng)', listing_price: 3_200_000_000, fair_market_value: 3_000_000_000, avg_nearby_price: 3_100_000_000, days_on_market: 5, competing_listings: 2, inquiry_count_7d: 14, segment: 'premium' as PriceSegment },
  { name: 'Stale Overpriced (Depok)', listing_price: 1_800_000_000, fair_market_value: 1_400_000_000, avg_nearby_price: 1_450_000_000, days_on_market: 95, competing_listings: 18, inquiry_count_7d: 0, segment: 'mid' as PriceSegment },
  { name: 'Luxury Villa (Seminyak)', listing_price: 15_000_000_000, fair_market_value: 14_200_000_000, avg_nearby_price: 13_500_000_000, days_on_market: 30, competing_listings: 4, inquiry_count_7d: 3, segment: 'luxury' as PriceSegment },
  { name: 'Value Apartment (Tangerang)', listing_price: 650_000_000, fair_market_value: 620_000_000, avg_nearby_price: 680_000_000, days_on_market: 18, competing_listings: 8, inquiry_count_7d: 6, segment: 'value' as PriceSegment },
];

const GRADE_COLORS: Record<string, string> = {
  A: 'hsl(var(--chart-1))',
  B: 'hsl(var(--chart-2))',
  C: 'hsl(var(--chart-3))',
  D: 'hsl(var(--chart-4))',
  F: 'hsl(var(--destructive))',
};

const SIGNAL_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  anchoring: { label: 'Price Anchoring', icon: Target },
  charm: { label: 'Charm Pricing', icon: DollarSign },
  negotiation: { label: 'Negotiation Margin', icon: TrendingUp },
  urgency: { label: 'Urgency Signal', icon: Clock },
  segment: { label: 'Segment Alignment', icon: Layers },
};

const WEIGHTS = { anchoring: 0.25, charm: 0.20, negotiation: 0.20, urgency: 0.20, segment: 0.15 };

const ROADMAP = [
  { phase: 'Phase 1 — Core Engine', weeks: '1-2', items: ['Deploy scoring logic as pure TS module', 'Integrate into listing detail page as recommendation widget', 'Show buyer perception score + grade to agents'] },
  { phase: 'Phase 2 — Agent Guidance', weeks: '3-4', items: ['Add contextual tooltips on listing edit form', 'Display charm price suggestions on pricing step', 'Alert agents when perception score drops below C'] },
  { phase: 'Phase 3 — Dynamic Alerts', weeks: '5-6', items: ['Trigger automated price review notifications when DOM > 60', 'Generate weekly pricing psychology report per listing', 'Integrate urgency messaging into buyer-facing listing cards'] },
  { phase: 'Phase 4 — Autonomous Optimization', weeks: '7-10', items: ['A/B test charm vs round pricing on visibility metrics', 'ML feedback loop: correlate perception score with actual conversion rate', 'Auto-suggest reprice actions on admin dashboard'] },
];

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const data = [{ value: score, fill: GRADE_COLORS[grade] || 'hsl(var(--primary))' }];
  return (
    <div className="relative w-40 h-40 mx-auto">
      <RadialBarChart width={160} height={160} cx={80} cy={80} innerRadius={55} outerRadius={75} startAngle={180} endAngle={0} data={data} barSize={14}>
        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--muted))' }} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-3xl font-black tabular-nums" style={{ color: GRADE_COLORS[grade] }}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium">Grade {grade}</span>
      </div>
    </div>
  );
}

export default function PricingPsychologyPage() {
  const [listingPrice, setListingPrice] = useState(2_500_000_000);
  const [fmv, setFmv] = useState(2_300_000_000);
  const [avgNearby, setAvgNearby] = useState(2_400_000_000);
  const [dom, setDom] = useState(25);
  const [competing, setCompeting] = useState(6);
  const [inquiries, setInquiries] = useState(5);
  const [segment, setSegment] = useState<PriceSegment>('mid');

  const result: PsychPricingOutput = useMemo(() => optimizePricingPsychology({
    listing_price: listingPrice,
    fair_market_value: fmv,
    avg_nearby_price: avgNearby,
    days_on_market: dom,
    competing_listings: competing,
    inquiry_count_7d: inquiries,
    segment,
  }), [listingPrice, fmv, avgNearby, dom, competing, inquiries, segment]);

  const breakdownData = Object.entries(result.signal_breakdown).map(([key, val]) => ({
    name: SIGNAL_LABELS[key]?.label ?? key,
    score: val,
    weighted: Math.round(val * (WEIGHTS[key as keyof typeof WEIGHTS] ?? 0)),
    fill: `hsl(var(--chart-${Object.keys(result.signal_breakdown).indexOf(key) + 1}))`,
  }));

  const loadScenario = (idx: number) => {
    const s = SCENARIOS[idx];
    setListingPrice(s.listing_price);
    setFmv(s.fair_market_value);
    setAvgNearby(s.avg_nearby_price);
    setDom(s.days_on_market);
    setCompeting(s.competing_listings);
    setInquiries(s.inquiry_count_7d);
    setSegment(s.segment);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div variants={FADE} initial="hidden" animate="show" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Brain className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Psychology Optimizer</h1>
            <p className="text-sm text-muted-foreground">Behavioral economics engine for listing price perception</p>
          </div>
        </motion.div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="formula">Formula</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          {/* ── Simulator ── */}
          <TabsContent value="simulator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3"><CardTitle className="text-base">Input Variables</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: 'Listing Price', value: listingPrice, set: setListingPrice, min: 300_000_000, max: 20_000_000_000, step: 100_000_000 },
                    { label: 'Fair Market Value', value: fmv, set: setFmv, min: 300_000_000, max: 20_000_000_000, step: 100_000_000 },
                    { label: 'Avg Nearby Price', value: avgNearby, set: setAvgNearby, min: 300_000_000, max: 20_000_000_000, step: 100_000_000 },
                  ].map(s => (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{fmt(s.value)}</span></div>
                      <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={s.step} />
                    </div>
                  ))}
                  {[
                    { label: 'Days on Market', value: dom, set: setDom, min: 0, max: 180, step: 1 },
                    { label: 'Competing Listings', value: competing, set: setCompeting, min: 0, max: 30, step: 1 },
                    { label: 'Inquiries (7d)', value: inquiries, set: setInquiries, min: 0, max: 30, step: 1 },
                  ].map(s => (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{s.value}</span></div>
                      <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={s.step} />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Segment</Label>
                    <Select value={segment} onValueChange={v => setSegment(v as PriceSegment)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="value">Value</SelectItem>
                        <SelectItem value="mid">Mid-Range</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="lg:col-span-2 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card><CardContent className="p-5 flex flex-col items-center"><ScoreGauge score={result.buyer_perception_score} grade={result.perception_grade} /><p className="text-xs text-muted-foreground mt-1">Buyer Perception Score</p></CardContent></Card>
                  <Card><CardContent className="p-5 space-y-3">
                    <p className="text-xs text-muted-foreground">Suggested Price</p>
                    <p className="text-lg font-bold text-foreground tabular-nums">{fmt(result.suggested_psychological_price)}</p>
                    <p className="text-xs text-muted-foreground">Charm Price</p>
                    <p className="text-base font-semibold text-primary tabular-nums">{fmt(result.charm_price)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-5 space-y-3">
                    <p className="text-xs text-muted-foreground">Negotiation Range</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">{fmt(result.negotiation_flexibility.min)} – {fmt(result.negotiation_flexibility.max)}</p>
                    <p className="text-xs text-muted-foreground">Margin: <span className="font-bold text-primary">{result.negotiation_flexibility.margin_pct}%</span> above FMV</p>
                    <Badge variant={result.urgency_level === 'critical' ? 'destructive' : result.urgency_level === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">Urgency: {result.urgency_level}</Badge>
                  </CardContent></Card>
                </div>

                {/* Signal Breakdown Chart */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Signal Contribution Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={breakdownData} layout="vertical" margin={{ left: 100 }}>
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={95} />
                          <Tooltip formatter={(v: number) => v} />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
                            {breakdownData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Tips + Urgency Messages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Agent Tips</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {result.agent_tips.length > 0 ? result.agent_tips.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{t}</span></div>
                      )) : <p className="text-sm text-muted-foreground">Pricing looks well-optimized — no immediate adjustments needed.</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-primary" />Urgency Messaging</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {result.urgency_messages.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{m}</span></div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Scenarios ── */}
          <TabsContent value="scenarios" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SCENARIOS.map((s, idx) => {
                const r = optimizePricingPsychology(s);
                return (
                  <motion.div key={s.name} variants={FADE} initial="hidden" animate="show" transition={{ delay: idx * 0.06 }}>
                    <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => loadScenario(idx)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          {s.name}
                          <Badge style={{ background: GRADE_COLORS[r.perception_grade], color: '#fff' }} className="text-xs">Grade {r.perception_grade} — {r.buyer_perception_score}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Price</span><p className="font-semibold tabular-nums">{fmt(s.listing_price)}</p></div>
                          <div><span className="text-muted-foreground">DOM</span><p className="font-semibold tabular-nums">{s.days_on_market}d</p></div>
                          <div><span className="text-muted-foreground">Inquiries</span><p className="font-semibold tabular-nums">{s.inquiry_count_7d}/wk</p></div>
                        </div>
                        <div className="space-y-1.5">
                          {Object.entries(r.signal_breakdown).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-24 truncate">{SIGNAL_LABELS[k]?.label}</span>
                              <Progress value={v} className="flex-1 h-1.5" />
                              <span className="text-[10px] font-medium tabular-nums w-6 text-right">{v}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-primary">Suggested: {fmt(r.suggested_psychological_price)}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Formula ── */}
          <TabsContent value="formula" className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Composite Buyer Perception Score</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <pre className="text-sm bg-muted/50 rounded-lg p-4 border border-border overflow-x-auto font-mono leading-relaxed">
{`BPS = Σ (signal_score × weight)

Signals:
  Anchoring Effect    × 0.25   // Price vs nearby avg
  Charm Pricing       × 0.20   // Psychological bracket
  Negotiation Margin  × 0.20   // Room to negotiate vs FMV
  Urgency Signal      × 0.20   // DOM + inquiries + competition
  Segment Alignment   × 0.15   // Price-bracket ↔ segment match

Grade:  A ≥ 85 | B ≥ 70 | C ≥ 55 | D ≥ 40 | F < 40`}
                </pre>
                <div className="space-y-3">
                  {Object.entries(SIGNAL_LABELS).map(([key, { label, icon: Icon }]) => (
                    <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">Weight: {(WEIGHTS[key as keyof typeof WEIGHTS] * 100)}%</p>
                      </div>
                      <Badge variant="outline" className="tabular-nums text-xs">{(WEIGHTS[key as keyof typeof WEIGHTS] * 100)}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Roadmap ── */}
          <TabsContent value="roadmap" className="space-y-5">
            {ROADMAP.map((phase, i) => (
              <motion.div key={phase.phase} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {phase.phase}
                      <Badge variant="outline" className="text-xs">Weeks {phase.weeks}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {phase.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
