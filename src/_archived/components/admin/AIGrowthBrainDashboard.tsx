import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import {
  Brain, Activity, Zap, Target, TrendingUp, ArrowUpRight, Shield, Eye,
  Database, Sparkles, AlertTriangle, CheckCircle, Play, Users, Globe,
  BarChart3, Gauge, Lock, Bell, Timer, Layers, Crown, Flame,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};
const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.4 } });

const Metric = ({ label, value, delta, sub, icon: Icon }: {
  label: string; value: string; delta?: string; sub?: string; icon: React.ElementType;
}) => (
  <div className="p-3.5 rounded-[20px] bg-card/60 border border-border/40 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-1.5">
      <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
      {delta && (
        <Badge variant="outline" className="text-[8px] h-4 px-1.5 gap-0.5 font-bold bg-chart-1/10 text-chart-1 border-0">
          <ArrowUpRight className="h-2.5 w-2.5" />{delta}
        </Badge>
      )}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
    <p className="text-xl font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — SIGNAL INGESTION
   ══════════════════════════════════════════════════════════════ */
const signalVolume = [
  { hour: '00', browse: 120, inquiry: 34, vendor: 18, listing: 42, campaign: 8 },
  { hour: '04', browse: 45, inquiry: 12, vendor: 6, listing: 28, campaign: 3 },
  { hour: '08', browse: 340, inquiry: 86, vendor: 42, listing: 64, campaign: 22 },
  { hour: '12', browse: 520, inquiry: 142, vendor: 68, listing: 82, campaign: 38 },
  { hour: '16', browse: 480, inquiry: 128, vendor: 56, listing: 74, campaign: 34 },
  { hour: '20', browse: 620, inquiry: 168, vendor: 48, listing: 58, campaign: 42 },
  { hour: '24', browse: 180, inquiry: 48, vendor: 14, listing: 36, campaign: 12 },
];

const SignalSection = () => (
  <motion.div {...fade(0)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10"><Database className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Signal Ingestion Layer</h2>
            <p className="text-[10px] text-muted-foreground">5 behavioral data streams feeding the intelligence core</p>
          </div>
          <Badge className="ml-auto bg-chart-1/10 text-chart-1 border-0 text-[9px] font-bold animate-pulse">LIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <Metric icon={Eye} label="Browse Signals" value="22.4K" delta="+18%" sub="Today" />
          <Metric icon={Activity} label="Inquiry Events" value="3.8K" delta="+24%" sub="Interactions" />
          <Metric icon={Timer} label="Vendor Response" value="1.2K" delta="+12%" sub="Metrics" />
          <Metric icon={BarChart3} label="Listing Perf" value="2.6K" delta="+8%" sub="Indicators" />
          <Metric icon={Sparkles} label="Campaign FB" value="842" delta="+32%" sub="Engagement" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">24h Signal Volume by Stream</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={signalVolume}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="browse" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.08)" strokeWidth={2} name="Browse" />
              <Area type="monotone" dataKey="inquiry" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.06)" strokeWidth={1.5} name="Inquiry" />
              <Area type="monotone" dataKey="vendor" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.05)" strokeWidth={1.5} name="Vendor" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — INTELLIGENCE PROCESSING
   ══════════════════════════════════════════════════════════════ */
const moduleHealth = [
  { module: 'Demand Prediction', accuracy: 93, latency: '120ms', status: 'optimal', load: 72 },
  { module: 'Supply Gap Forecast', accuracy: 88, latency: '240ms', status: 'optimal', load: 58 },
  { module: 'Price Sensitivity', accuracy: 91, latency: '180ms', status: 'optimal', load: 64 },
  { module: 'Deal Success Prob.', accuracy: 86, latency: '320ms', status: 'healthy', load: 82 },
  { module: 'Investor Clustering', accuracy: 84, latency: '450ms', status: 'healthy', load: 48 },
];

const processingTrend = [
  { month: 'Jul', processed: 12, accuracy: 62 }, { month: 'Aug', processed: 28, accuracy: 68 },
  { month: 'Sep', processed: 56, accuracy: 74 }, { month: 'Oct', processed: 98, accuracy: 79 },
  { month: 'Nov', processed: 164, accuracy: 83 }, { month: 'Dec', processed: 248, accuracy: 86 },
  { month: 'Jan', processed: 380, accuracy: 89 }, { month: 'Feb', processed: 520, accuracy: 91 },
  { month: 'Mar', processed: 680, accuracy: 93 },
];

const ProcessingSection = () => (
  <motion.div {...fade(1)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-1/10"><Brain className="h-4 w-4 text-chart-1" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Intelligence Processing Engine</h2>
            <p className="text-[10px] text-muted-foreground">5 AI modules with cross-signal synthesis</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Module Health</p>
            <div className="space-y-2">
              {moduleHealth.map((m, i) => (
                <motion.div key={i} {...fade(i)} className="p-2.5 rounded-xl bg-muted/10 border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-foreground">{m.module}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-muted-foreground">{m.latency}</span>
                      <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${m.status === 'optimal' ? 'bg-chart-1/10 text-chart-1' : 'bg-chart-2/10 text-chart-2'}`}>{m.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={m.accuracy} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-black tabular-nums text-primary">{m.accuracy}%</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-muted-foreground">Load: {m.load}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Processing Volume (K) × Accuracy (%)</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={processingTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[50, 100]} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area yAxisId="left" type="monotone" dataKey="processed" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.1)" strokeWidth={1.5} name="Signals (K)" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — AUTONOMOUS ACTIONS
   ══════════════════════════════════════════════════════════════ */
const recommendations = [
  { action: 'Activate boost surge — Bali Seminyak zone', confidence: 96, impact: '+Rp 12M', type: 'boost', status: 'auto-approved' },
  { action: 'Target vendor acquisition — Surabaya East', confidence: 88, impact: '+14 vendors', type: 'vendor', status: 'recommended' },
  { action: 'Launch investor deal alert — Jakarta luxury', confidence: 92, impact: '+38 unlocks', type: 'investor', status: 'auto-approved' },
  { action: 'Rebalance inventory visibility — Bandung', confidence: 78, impact: '+8% liquidity', type: 'balance', status: 'pending' },
  { action: 'Increase premium slot pricing — High demand', confidence: 84, impact: '+Rp 6M/mo', type: 'pricing', status: 'recommended' },
  { action: 'Trigger scarcity banner — 3 cities', confidence: 91, impact: '+22% conv', type: 'campaign', status: 'auto-approved' },
];

const ActionSection = () => {
  const [autoThreshold, setAutoThreshold] = useState(90);
  return (
    <motion.div {...fade(2)}>
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-chart-2/10"><Zap className="h-4 w-4 text-chart-2" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Autonomous Action Recommendations</h2>
              <p className="text-[10px] text-muted-foreground">Confidence-gated decision modules with auto-execution</p>
            </div>
            <Badge className="ml-auto bg-primary/10 text-primary border-0 text-[9px] font-bold">Auto ≥{autoThreshold}%</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {recommendations.map((r, i) => {
            const isAuto = r.confidence >= autoThreshold;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/20"
                style={{ background: isAuto ? 'hsl(var(--chart-1)/0.03)' : 'hsl(var(--muted)/0.05)' }}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAuto ? 'bg-chart-1/10' : 'bg-muted/20'}`}>
                  {isAuto ? <CheckCircle className="h-4 w-4 text-chart-1" /> : <Timer className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground truncate">{r.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${isAuto ? 'bg-chart-1/10 text-chart-1' : 'bg-chart-3/10 text-chart-3'}`}>
                      {r.confidence}% confidence
                    </Badge>
                    <span className="text-[8px] text-muted-foreground">Impact: <span className="font-bold text-foreground">{r.impact}</span></span>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[7px] h-4 px-1.5 border-0 shrink-0 ${r.status === 'auto-approved' ? 'bg-chart-1/10 text-chart-1' : r.status === 'recommended' ? 'bg-primary/10 text-primary' : 'bg-chart-3/10 text-chart-3'}`}>
                  {r.status}
                </Badge>
                {!isAuto && <Button size="sm" variant="outline" className="h-6 text-[8px] px-2 shrink-0">Approve</Button>}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — HUMAN OVERRIDE CONTROL
   ══════════════════════════════════════════════════════════════ */
const OverrideSection = () => {
  const [mode, setMode] = useState<'auto' | 'semi' | 'manual'>('semi');
  const [autoBoost, setAutoBoost] = useState(true);
  const [autoVendor, setAutoVendor] = useState(false);
  const [autoInvestor, setAutoInvestor] = useState(true);
  const [autoLiquidity, setAutoLiquidity] = useState(false);

  return (
    <motion.div {...fade(3)}>
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-chart-3/10"><Shield className="h-4 w-4 text-chart-3" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Human Override Control</h2>
              <p className="text-[10px] text-muted-foreground">Founder governance layer — approval gates & execution mode</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Execution Mode */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Execution Mode:</span>
            {(['auto', 'semi', 'manual'] as const).map(m => (
              <Button key={m} size="sm" variant={mode === m ? 'default' : 'outline'}
                onClick={() => setMode(m)} className="h-7 text-[9px] px-3 capitalize">
                {m === 'auto' ? 'Full Auto' : m === 'semi' ? 'Semi-Auto' : 'Manual'}
              </Button>
            ))}
          </div>

          {/* Auto-execution toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Boost Promotion Auto-Execute', desc: 'AI triggers boost campaigns when confidence ≥90%', state: autoBoost, set: setAutoBoost },
              { label: 'Vendor Targeting Auto-Execute', desc: 'Auto-activate acquisition campaigns in target zones', state: autoVendor, set: setAutoVendor },
              { label: 'Investor Campaign Auto-Execute', desc: 'Auto-send deal alerts during activation windows', state: autoInvestor, set: setAutoInvestor },
              { label: 'Liquidity Balance Auto-Execute', desc: 'Auto-adjust visibility allocation for equilibrium', state: autoLiquidity, set: setAutoLiquidity },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                <div>
                  <p className="text-[10px] font-bold text-foreground">{t.label}</p>
                  <p className="text-[9px] text-muted-foreground">{t.desc}</p>
                </div>
                <Switch checked={t.state} onCheckedChange={t.set} />
              </div>
            ))}
          </div>

          {/* Performance Feedback */}
          <div className="p-3 rounded-xl bg-chart-1/5 border border-chart-1/15">
            <p className="text-[10px] font-bold text-chart-1 mb-2">Outcome Performance Loop</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Actions Executed', value: '142', sub: 'This month' },
                { label: 'Success Rate', value: '84%', sub: '+6pp vs manual' },
                { label: 'Revenue Impact', value: '+Rp 48M', sub: 'AI-driven revenue' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-black text-foreground tabular-nums">{s.value}</p>
                  <p className="text-[9px] font-semibold text-chart-1">{s.label}</p>
                  <p className="text-[8px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — SELF-LEARNING LOOP
   ══════════════════════════════════════════════════════════════ */
const accuracyTrend = [
  { month: 'Jul', demand: 62, supply: 58, pricing: 55, deal: 48, investor: 52 },
  { month: 'Sep', demand: 74, supply: 70, pricing: 68, deal: 62, investor: 64 },
  { month: 'Nov', demand: 83, supply: 78, pricing: 79, deal: 74, investor: 76 },
  { month: 'Jan', demand: 89, supply: 84, pricing: 86, deal: 82, investor: 80 },
  { month: 'Mar', demand: 93, supply: 88, pricing: 91, deal: 86, investor: 84 },
];

const experiments = [
  { name: 'Boost timing optimization', variant: 'AI-timed vs Fixed', lift: '+32%', confidence: 96, status: 'winner' },
  { name: 'Vendor targeting algorithm', variant: 'v3.2 vs v3.1', lift: '+18%', confidence: 92, status: 'winner' },
  { name: 'Investor urgency scoring', variant: 'Neural vs Rules', lift: '+8%', confidence: 78, status: 'running' },
  { name: 'Price sensitivity bands', variant: '5-tier vs 3-tier', lift: '+4%', confidence: 64, status: 'running' },
];

const actionROI = [
  { action: 'Boost Timing', aiROI: 340, manualROI: 180 },
  { action: 'Vendor Target', aiROI: 280, manualROI: 160 },
  { action: 'Investor Alert', aiROI: 420, manualROI: 220 },
  { action: 'Liquidity Bal.', aiROI: 240, manualROI: 140 },
];

const LearningSection = () => (
  <motion.div {...fade(4)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Self-Learning Optimization</h2>
            <p className="text-[10px] text-muted-foreground">Continuous refinement via outcome feedback & experimentation</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Accuracy Trend */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Model Accuracy Improvement by Module (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis domain={[40, 100]} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="demand" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Demand" />
                <Line type="monotone" dataKey="pricing" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 2 }} name="Pricing" />
                <Line type="monotone" dataKey="supply" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 2 }} name="Supply" />
                <Line type="monotone" dataKey="deal" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={{ r: 2 }} name="Deal" />
                <Line type="monotone" dataKey="investor" stroke="hsl(var(--chart-4))" strokeWidth={1.5} dot={{ r: 2 }} name="Investor" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Action ROI Comparison */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">AI vs Manual ROI (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={actionROI} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="action" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="aiROI" fill="hsl(var(--primary)/0.7)" name="AI-Driven" radius={[4, 4, 0, 0]} />
                <Bar dataKey="manualROI" fill="hsl(var(--muted-foreground)/0.2)" name="Manual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experiments */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Active Experiments</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {experiments.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/10 border border-border/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === 'winner' ? 'bg-chart-1' : 'bg-chart-3 animate-pulse'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground truncate">{e.name}</p>
                  <p className="text-[8px] text-muted-foreground">{e.variant}</p>
                </div>
                <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${e.status === 'winner' ? 'bg-chart-1/10 text-chart-1' : 'bg-chart-3/10 text-chart-3'}`}>
                  {e.lift} lift
                </Badge>
                <span className="text-[8px] tabular-nums text-muted-foreground">{e.confidence}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Cycle */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
          <p className="text-[10px] font-bold text-primary mb-2">Continuous Refinement Cycle</p>
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {['PREDICT', 'EXECUTE', 'MEASURE', 'LEARN', 'REFINE'].map((step, i) => (
              <React.Fragment key={i}>
                <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-[9px] font-bold text-primary">{step}</div>
                {i < 4 && <span className="text-muted-foreground text-[10px]">→</span>}
              </React.Fragment>
            ))}
            <span className="text-muted-foreground text-[10px] ml-1">↻</span>
          </div>
          <p className="text-[8px] text-muted-foreground text-center mt-2">Learning engine recalibrates every 6 hours based on actual outcomes</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */
const AIGrowthBrainDashboard: React.FC = () => (
  <div className="space-y-5 animate-in fade-in duration-300">
    <div className="flex items-center gap-3 flex-wrap">
      <div className="p-2.5 rounded-xl bg-primary/10"><Brain className="h-5 w-5 text-primary" /></div>
      <div>
        <h1 className="text-sm font-black tracking-tight text-foreground uppercase">Autonomous AI Growth Brain</h1>
        <p className="text-[10px] text-muted-foreground">Semi-autonomous marketplace intelligence & growth execution engine</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Mode</p>
          <p className="text-sm font-black text-primary">SEMI-AUTO</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Signals/Mo</p>
          <p className="text-sm font-black text-chart-1 tabular-nums">680K</p>
        </div>
      </div>
    </div>

    <SignalSection />
    <ProcessingSection />
    <ActionSection />
    <OverrideSection />
    <LearningSection />
  </div>
);

export default AIGrowthBrainDashboard;
