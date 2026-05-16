import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, ChevronRight, Activity, Clock,
  MessageSquare, FileText, Phone, DollarSign, TrendingDown, Zap, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { detectDealRisk, DealStage, DealRiskOutput } from '@/lib/dealRiskDetection';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar,
} from 'recharts';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const RISK_COLORS: Record<string, string> = {
  LOW: 'hsl(var(--chart-1))',
  MEDIUM: 'hsl(var(--chart-3))',
  HIGH: 'hsl(var(--chart-4))',
  CRITICAL: 'hsl(var(--destructive))',
};

const SIGNAL_META: Record<string, { label: string; icon: React.ElementType; weight: string }> = {
  stage_inactivity: { label: 'Stage Inactivity', icon: Clock, weight: '25%' },
  negotiation_gap: { label: 'Negotiation Gap', icon: DollarSign, weight: '20%' },
  engagement_decline: { label: 'Engagement Decline', icon: TrendingDown, weight: '20%' },
  documentation_delay: { label: 'Documentation Delay', icon: FileText, weight: '15%' },
  cancellation_pattern: { label: 'Cancellation Pattern', icon: Phone, weight: '10%' },
  financing_risk: { label: 'Financing Risk', icon: AlertTriangle, weight: '10%' },
};

const SCENARIOS = [
  { name: 'Healthy Deal (Pondok Indah)', deal_value: 3_500_000_000, current_stage: 'negotiation' as DealStage, days_in_current_stage: 5, total_days_in_pipeline: 18, viewing_cancellations: 0, viewings_completed: 3, ask_price: 3_500_000_000, latest_offer: 3_350_000_000, buyer_messages_7d: 10, buyer_messages_prev_7d: 8, docs_submitted: 4, docs_required: 5, financing_preapproved: true, financing_applied: true, is_high_value: false },
  { name: 'Stalling Negotiation (Kemang)', deal_value: 5_200_000_000, current_stage: 'negotiation' as DealStage, days_in_current_stage: 25, total_days_in_pipeline: 55, viewing_cancellations: 2, viewings_completed: 4, ask_price: 5_200_000_000, latest_offer: 4_200_000_000, buyer_messages_7d: 2, buyer_messages_prev_7d: 9, docs_submitted: 2, docs_required: 6, financing_preapproved: false, financing_applied: true, is_high_value: true },
  { name: 'Ghost Buyer (BSD City)', deal_value: 1_800_000_000, current_stage: 'offer' as DealStage, days_in_current_stage: 12, total_days_in_pipeline: 40, viewing_cancellations: 3, viewings_completed: 1, ask_price: 1_800_000_000, latest_offer: 1_500_000_000, buyer_messages_7d: 0, buyer_messages_prev_7d: 7, docs_submitted: 0, docs_required: 4, financing_preapproved: false, financing_applied: false, is_high_value: false },
  { name: 'Financing Crisis (Menteng)', deal_value: 12_000_000_000, current_stage: 'payment' as DealStage, days_in_current_stage: 18, total_days_in_pipeline: 65, viewing_cancellations: 0, viewings_completed: 5, ask_price: 12_000_000_000, latest_offer: 11_500_000_000, buyer_messages_7d: 3, buyer_messages_prev_7d: 6, docs_submitted: 3, docs_required: 8, financing_preapproved: false, financing_applied: true, is_high_value: true },
];

const ROADMAP = [
  { phase: 'Phase 1 — Core Engine', weeks: '1-2', items: ['Deploy risk scoring as pure TS module', 'Add risk badge to deal detail page', 'Show signal breakdown to assigned agent'] },
  { phase: 'Phase 2 — Automated Alerts', weeks: '3-4', items: ['Trigger WhatsApp/email alerts when risk crosses HIGH threshold', 'Auto-assign escalation to senior agent for CRITICAL deals', 'Daily pipeline risk digest for admin dashboard'] },
  { phase: 'Phase 3 — Intervention Automation', weeks: '5-7', items: ['Auto-send re-engagement messages for engagement decline signals', 'Suggest follow-up scripts based on detected failure cause', 'Track intervention effectiveness — did risk score decrease after action?'] },
  { phase: 'Phase 4 — Predictive Learning', weeks: '8-12', items: ['Correlate risk scores with actual deal outcomes for weight recalibration', 'ML model: predict deal failure probability at each stage transition', 'Auto-generate "Deal Save" playbooks based on historical rescue patterns'] },
];

function RiskGauge({ score, level }: { score: number; level: string }) {
  const data = [{ value: score, fill: RISK_COLORS[level] || 'hsl(var(--primary))' }];
  return (
    <div className="relative w-36 h-36 mx-auto">
      <RadialBarChart width={144} height={144} cx={72} cy={72} innerRadius={48} outerRadius={66} startAngle={180} endAngle={0} data={data} barSize={14}>
        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--muted))' }} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-2xl font-black tabular-nums" style={{ color: RISK_COLORS[level] }}>{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium">{level}</span>
      </div>
    </div>
  );
}

export default function DealRiskDetectionPage() {
  const [stage, setStage] = useState<DealStage>('negotiation');
  const [daysInStage, setDaysInStage] = useState(10);
  const [totalDays, setTotalDays] = useState(30);
  const [cancelledViewings, setCancelledViewings] = useState(1);
  const [completedViewings, setCompletedViewings] = useState(3);
  const [askPrice, setAskPrice] = useState(3_000_000_000);
  const [offerPrice, setOfferPrice] = useState(2_700_000_000);
  const [msgs7d, setMsgs7d] = useState(5);
  const [msgsPrev, setMsgsPrev] = useState(8);
  const [docsSub, setDocsSub] = useState(3);
  const [docsReq, setDocsReq] = useState(6);
  const [preapproved, setPreapproved] = useState(false);
  const [applied, setApplied] = useState(true);
  const [highValue, setHighValue] = useState(false);

  const result: DealRiskOutput = useMemo(() => detectDealRisk({
    deal_value: askPrice, current_stage: stage, days_in_current_stage: daysInStage, total_days_in_pipeline: totalDays,
    viewing_cancellations: cancelledViewings, viewings_completed: completedViewings,
    ask_price: askPrice, latest_offer: offerPrice, buyer_messages_7d: msgs7d, buyer_messages_prev_7d: msgsPrev,
    docs_submitted: docsSub, docs_required: docsReq, financing_preapproved: preapproved, financing_applied: applied, is_high_value: highValue,
  }), [stage, daysInStage, totalDays, cancelledViewings, completedViewings, askPrice, offerPrice, msgs7d, msgsPrev, docsSub, docsReq, preapproved, applied, highValue]);

  const breakdownData = Object.entries(result.signal_breakdown).map(([key, val]) => ({
    name: SIGNAL_META[key]?.label ?? key, score: val,
    fill: val >= 70 ? 'hsl(var(--destructive))' : val >= 40 ? 'hsl(var(--chart-4))' : 'hsl(var(--chart-1))',
  }));

  const loadScenario = (idx: number) => {
    const s = SCENARIOS[idx];
    setStage(s.current_stage); setDaysInStage(s.days_in_current_stage); setTotalDays(s.total_days_in_pipeline);
    setCancelledViewings(s.viewing_cancellations); setCompletedViewings(s.viewings_completed);
    setAskPrice(s.ask_price); setOfferPrice(s.latest_offer);
    setMsgs7d(s.buyer_messages_7d); setMsgsPrev(s.buyer_messages_prev_7d);
    setDocsSub(s.docs_submitted); setDocsReq(s.docs_required);
    setPreapproved(s.financing_preapproved); setApplied(s.financing_applied); setHighValue(s.is_high_value);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div variants={FADE} initial="hidden" animate="show" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-destructive/10"><ShieldAlert className="h-7 w-7 text-destructive" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deal Pipeline Risk Detection</h1>
            <p className="text-sm text-muted-foreground">Predictive risk intelligence for active transactions</p>
          </div>
        </motion.div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          {/* ── Simulator ── */}
          <TabsContent value="simulator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3"><CardTitle className="text-base">Deal Variables</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Current Stage</Label>
                    <Select value={stage} onValueChange={v => setStage(v as DealStage)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['inquiry','viewing','offer','negotiation','payment','legal','closing'] as DealStage[]).map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {[
                    { label: 'Days in Stage', value: daysInStage, set: setDaysInStage, min: 0, max: 60 },
                    { label: 'Ask Price', value: askPrice, set: setAskPrice, min: 500_000_000, max: 20_000_000_000, step: 100_000_000, isCurrency: true },
                    { label: 'Latest Offer', value: offerPrice, set: setOfferPrice, min: 500_000_000, max: 20_000_000_000, step: 100_000_000, isCurrency: true },
                    { label: 'Buyer Messages (7d)', value: msgs7d, set: setMsgs7d, min: 0, max: 20 },
                    { label: 'Buyer Messages (prev 7d)', value: msgsPrev, set: setMsgsPrev, min: 0, max: 20 },
                    { label: 'Docs Submitted', value: docsSub, set: setDocsSub, min: 0, max: 10 },
                    { label: 'Docs Required', value: docsReq, set: setDocsReq, min: 1, max: 10 },
                    { label: 'Cancelled Viewings', value: cancelledViewings, set: setCancelledViewings, min: 0, max: 10 },
                    { label: 'Completed Viewings', value: completedViewings, set: setCompletedViewings, min: 0, max: 10 },
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{(s as any).isCurrency ? fmt(s.value) : s.value}</span></div>
                      <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={(s as any).step || 1} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between"><Label className="text-xs">Financing Pre-approved</Label><Switch checked={preapproved} onCheckedChange={setPreapproved} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">Financing Applied</Label><Switch checked={applied} onCheckedChange={setApplied} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">High-Value Deal (&gt;5B)</Label><Switch checked={highValue} onCheckedChange={setHighValue} /></div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-5">
                {/* Score + Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card><CardContent className="p-5 flex flex-col items-center"><RiskGauge score={result.risk_score} level={result.risk_level} /><p className="text-xs text-muted-foreground mt-1">Deal Risk Score</p></CardContent></Card>
                  <Card><CardContent className="p-5 space-y-2">
                    <p className="text-xs text-muted-foreground">Intervention</p>
                    <Badge variant={result.intervention_urgency === 'rescue' ? 'destructive' : result.intervention_urgency === 'escalate' ? 'destructive' : 'secondary'} className="text-sm">{result.intervention_urgency.toUpperCase()}</Badge>
                    <p className="text-xs text-muted-foreground mt-3">Est. Delay</p>
                    <p className="text-lg font-bold text-foreground tabular-nums">{result.estimated_delay_days} days</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-2">Liquidity Impact</p>
                    <p className="text-sm text-foreground leading-relaxed">{result.liquidity_impact}</p>
                  </CardContent></Card>
                </div>

                {/* Signal Breakdown */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Signal Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={breakdownData} layout="vertical" margin={{ left: 120 }}>
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
                          <Tooltip formatter={(v: number) => `${v}/100`} />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
                            {breakdownData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Causes + Interventions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Failure Causes</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {result.failure_causes.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{c}</span></div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Recommended Interventions</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {result.interventions.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /><span className="text-foreground">{m}</span></div>
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
                const r = detectDealRisk({ ...s, deal_value: s.ask_price });
                return (
                  <motion.div key={s.name} variants={FADE} initial="hidden" animate="show" transition={{ delay: idx * 0.06 }}>
                    <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => loadScenario(idx)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          {s.name}
                          <Badge style={{ background: RISK_COLORS[r.risk_level], color: '#fff' }} className="text-xs">{r.risk_level} — {r.risk_score}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Value</span><p className="font-semibold tabular-nums">{fmt(s.ask_price)}</p></div>
                          <div><span className="text-muted-foreground">Stage</span><p className="font-semibold capitalize">{s.current_stage}</p></div>
                          <div><span className="text-muted-foreground">Days</span><p className="font-semibold tabular-nums">{s.days_in_current_stage}d in stage</p></div>
                        </div>
                        <div className="space-y-1.5">
                          {Object.entries(r.signal_breakdown).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-28 truncate">{SIGNAL_META[k]?.label}</span>
                              <Progress value={v} className="flex-1 h-1.5" />
                              <span className="text-[10px] font-medium tabular-nums w-6 text-right">{v}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Top cause: {r.failure_causes[0]?.slice(0, 60)}…</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Model ── */}
          <TabsContent value="model" className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Composite Risk Score Formula</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <pre className="text-sm bg-muted/50 rounded-lg p-4 border border-border overflow-x-auto font-mono leading-relaxed">
{`Risk Score = Σ (signal_risk × weight)

Signals (0-100, higher = MORE risk):
  Stage Inactivity     × 0.25   // days vs SLA per stage
  Negotiation Gap      × 0.20   // ask-offer spread %
  Engagement Decline   × 0.20   // message activity drop
  Documentation Delay  × 0.15   // docs submitted / required
  Cancellation Pattern × 0.10   // cancelled / total viewings
  Financing Risk       × 0.10   // approval status vs stage

Risk Level:  CRITICAL ≥ 75 | HIGH ≥ 55 | MEDIUM ≥ 35 | LOW < 35

Intervention: rescue | escalate | nudge | monitor`}
                </pre>
                <div className="space-y-3">
                  {Object.entries(SIGNAL_META).map(([key, { label, icon: Icon, weight }]) => (
                    <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">Weight: {weight}</p>
                      </div>
                      <Badge variant="outline" className="tabular-nums text-xs">{weight}</Badge>
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
                    <CardTitle className="text-base flex items-center justify-between">{phase.phase}<Badge variant="outline" className="text-xs">Weeks {phase.weeks}</Badge></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {phase.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{item}</span></div>
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
