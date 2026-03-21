import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import {
  Zap, TrendingUp, ArrowUpRight, DollarSign, Users, Activity, Globe,
  BarChart3, Target, Shield, Brain, Eye, Timer, Gauge, Bell, Flame,
  AlertTriangle, CheckCircle, Play, Radio, Radar, Layers, Crown,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, RadarChart,
  Radar as RRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};
const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.35 } });

const KPI = ({ label, value, delta, icon: Icon, pulse }: { label: string; value: string; delta?: string; icon: React.ElementType; pulse?: boolean }) => (
  <div className="p-3 rounded-[20px] bg-card/60 border border-border/40">
    <div className="flex items-center justify-between mb-1">
      <div className={`p-1.5 rounded-lg bg-primary/10 ${pulse ? 'animate-pulse' : ''}`}><Icon className="h-3.5 w-3.5 text-primary" /></div>
      {delta && <Badge variant="outline" className="text-[8px] h-4 px-1.5 gap-0.5 font-bold bg-chart-1/10 text-chart-1 border-0"><ArrowUpRight className="h-2.5 w-2.5" />{delta}</Badge>}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
    <p className="text-xl font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
  </div>
);

/* ═══ DATA ═══ */
const liquidityPulse = [
  { t: '00:00', demand: 42, supply: 38, liquidity: 78 },
  { t: '04:00', demand: 28, supply: 35, liquidity: 72 },
  { t: '08:00', demand: 65, supply: 42, liquidity: 80 },
  { t: '12:00', demand: 88, supply: 48, liquidity: 84 },
  { t: '16:00', demand: 78, supply: 52, liquidity: 82 },
  { t: '20:00', demand: 92, supply: 45, liquidity: 86 },
  { t: '24:00', demand: 55, supply: 40, liquidity: 79 },
];

const revenueTrend = [
  { day: 'Mon', revenue: 42, target: 48 }, { day: 'Tue', revenue: 56, target: 48 },
  { day: 'Wed', revenue: 38, target: 48 }, { day: 'Thu', revenue: 72, target: 48 },
  { day: 'Fri', revenue: 64, target: 48 }, { day: 'Sat', revenue: 88, target: 48 },
  { day: 'Sun', revenue: 52, target: 48 },
];

const forceField = [
  { hour: '06', vendors: 12, investors: 8, listings: 24, deals: 2 },
  { hour: '09', vendors: 45, investors: 28, listings: 68, deals: 8 },
  { hour: '12', vendors: 72, investors: 52, listings: 94, deals: 14 },
  { hour: '15', vendors: 64, investors: 68, listings: 82, deals: 18 },
  { hour: '18', vendors: 48, investors: 82, listings: 72, deals: 12 },
  { hour: '21', vendors: 22, investors: 45, listings: 38, deals: 6 },
];

const aiActions = [
  { action: 'Activate Bali boost surge — Seminyak zone', confidence: 96, impact: '+Rp 12M', status: 'auto-approved' },
  { action: 'Target vendor acquisition — Surabaya East', confidence: 88, impact: '+14 vendors', status: 'recommended' },
  { action: 'Launch investor deal alert — Jakarta luxury', confidence: 92, impact: '+38 unlocks', status: 'auto-approved' },
  { action: 'Rebalance inventory visibility — Bandung', confidence: 78, impact: '+8% liquidity', status: 'pending' },
  { action: 'Trigger scarcity banner — 3 cities', confidence: 91, impact: '+22% conv', status: 'auto-approved' },
];

const expansionRadar = [
  { city: 'Supply', kl: 82, bkk: 78, smg: 72, mdn: 48 },
  { city: 'Demand', kl: 78, bkk: 74, smg: 58, mdn: 42 },
  { city: 'Vendors', kl: 68, bkk: 62, smg: 45, mdn: 28 },
  { city: 'Revenue', kl: 55, bkk: 48, smg: 32, mdn: 18 },
  { city: 'Ops', kl: 75, bkk: 70, smg: 68, mdn: 52 },
];

const alerts = [
  { title: 'Demand surge — Bali Seminyak', desc: '340% inquiry spike, monetization window open', type: 'opportunity', icon: TrendingUp },
  { title: 'Liquidity drought — Makassar D3', desc: 'Supply below threshold, vendor action needed', type: 'critical', icon: AlertTriangle },
  { title: 'Vendor imbalance — Surabaya East', desc: 'Coverage gap at 65%, acquisition campaign suggested', type: 'warning', icon: Users },
  { title: 'Investor spike — Jakarta luxury', desc: '28 high-intent signals active, deal alert ready', type: 'opportunity', icon: Crown },
  { title: 'Pricing resistance — Bandung premium', desc: 'Elasticity threshold reached, adjustment recommended', type: 'warning', icon: DollarSign },
];

const alertColor = (t: string) => t === 'critical' ? 'chart-3' : t === 'opportunity' ? 'chart-1' : 'chart-2';

/* ═══ SECTIONS ═══ */

const LiquidityCore = () => (
  <motion.div {...fade(0)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 animate-pulse"><Radio className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Master Liquidity Intelligence Core</h2>
            <p className="text-[10px] text-muted-foreground">Real-time demand vs supply equilibrium & opportunity detection</p>
          </div>
          <Badge className="ml-auto bg-chart-1/10 text-chart-1 border-0 text-[9px] font-bold animate-pulse">LIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <KPI icon={Gauge} label="Global Liquidity" value="82" delta="+6" pulse />
          <KPI icon={TrendingUp} label="Demand Index" value="92" delta="+18%" />
          <KPI icon={Layers} label="Supply Density" value="45" delta="+8%" />
          <KPI icon={Target} label="Opportunity Zones" value="3" delta="Active" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">24h Demand vs Supply Pulse</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={liquidityPulse}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="t" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="demand" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.08)" strokeWidth={2} name="Demand" />
              <Area type="monotone" dataKey="supply" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.06)" strokeWidth={2} name="Supply" />
              <Line type="monotone" dataKey="liquidity" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Liquidity Index" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Hot zones */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { zone: 'Bali Seminyak', score: 94, signal: 'HIGH DEMAND' },
            { zone: 'Jakarta Selatan', score: 88, signal: 'MOMENTUM' },
            { zone: 'Yogyakarta', score: 76, signal: 'EMERGING' },
          ].map((z, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-chart-1/5 border border-chart-1/15">
              <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
              <span className="text-[9px] font-bold text-foreground">{z.zone}</span>
              <span className="text-[8px] tabular-nums text-chart-1 font-bold">{z.score}</span>
              <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-0 bg-chart-1/10 text-chart-1">{z.signal}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const RevenueCommand = () => (
  <motion.div {...fade(1)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-2/10"><DollarSign className="h-4 w-4 text-chart-2" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Revenue Command Band</h2>
            <p className="text-[10px] text-muted-foreground">Monetization velocity, surge detection & instant action controls</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <KPI icon={DollarSign} label="Today" value="Rp 48.2M" delta="+18%" />
          <KPI icon={BarChart3} label="This Week" value="Rp 284M" delta="+24%" />
          <KPI icon={TrendingUp} label="MTD" value="Rp 1.12B" delta="+32%" />
          <KPI icon={Flame} label="Velocity" value="2.4x" delta="Surge" pulse />
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Daily Revenue vs Target (Rp M)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={revenueTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="revenue" fill="hsl(var(--primary)/0.6)" name="Revenue" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="target" stroke="hsl(var(--chart-3))" strokeDasharray="5 5" strokeWidth={1.5} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-12 md:col-span-5 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Instant Actions</p>
            {[
              { label: 'Launch Flash Campaign', desc: 'Activate monetization surge across top 3 cities', icon: Zap },
              { label: 'Pricing Pressure +15%', desc: 'Increase premium slot pricing in high-demand zones', icon: TrendingUp },
              { label: 'Premium Inventory Burst', desc: 'Release 24 exclusive listings to investor pipeline', icon: Play },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/10 border border-border/20">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><a.icon className="h-3.5 w-3.5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground">{a.label}</p>
                  <p className="text-[8px] text-muted-foreground">{a.desc}</p>
                </div>
                <Button size="sm" className="h-6 text-[8px] px-2 shrink-0">Execute</Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const MarketplaceForce = () => (
  <motion.div {...fade(2)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-1/10"><Activity className="h-4 w-4 text-chart-1" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Marketplace Force Field</h2>
            <p className="text-[10px] text-muted-foreground">Vendor density, investor momentum & deal routing flow</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forceField}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
            <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
            <Tooltip contentStyle={tt} />
            <Area type="monotone" dataKey="listings" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.06)" strokeWidth={1.5} name="Listings" />
            <Area type="monotone" dataKey="investors" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.06)" strokeWidth={2} name="Investors" />
            <Area type="monotone" dataKey="vendors" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.04)" strokeWidth={1.5} name="Vendors" />
            <Line type="monotone" dataKey="deals" stroke="hsl(var(--chart-3))" strokeWidth={2.5} dot={{ r: 3 }} name="Deals" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-1 mt-3 text-[9px] text-muted-foreground">
          <span className="font-bold text-primary">VENDOR</span> → <span className="font-bold text-chart-1">LISTING</span> → <span className="font-bold text-chart-2">INVESTOR</span> → <span className="font-bold text-chart-3">DEAL</span> → <span className="font-bold text-foreground">REVENUE</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AIBrainStream = () => {
  const [autoThreshold] = useState(90);
  return (
    <motion.div {...fade(3)}>
      <Card className="border-border/30 bg-card/80 rounded-[20px]">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10"><Brain className="h-4 w-4 text-primary" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">AI Growth Brain Signal Stream</h2>
              <p className="text-[10px] text-muted-foreground">Autonomous action queue with confidence-gated execution</p>
            </div>
            <Badge className="ml-auto bg-primary/10 text-primary border-0 text-[9px] font-bold">Auto ≥{autoThreshold}%</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {aiActions.map((a, i) => {
            const isAuto = a.confidence >= autoThreshold;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/20"
                style={{ background: isAuto ? 'hsl(var(--chart-1)/0.03)' : 'hsl(var(--muted)/0.05)' }}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isAuto ? 'bg-chart-1/10' : 'bg-muted/20'}`}>
                  {isAuto ? <CheckCircle className="h-3.5 w-3.5 text-chart-1" /> : <Timer className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground truncate">{a.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${isAuto ? 'bg-chart-1/10 text-chart-1' : 'bg-chart-3/10 text-chart-3'}`}>
                      {a.confidence}%
                    </Badge>
                    <span className="text-[8px] text-muted-foreground">Impact: <span className="font-bold text-foreground">{a.impact}</span></span>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[7px] h-4 px-1.5 border-0 shrink-0 ${a.status === 'auto-approved' ? 'bg-chart-1/10 text-chart-1' : a.status === 'recommended' ? 'bg-primary/10 text-primary' : 'bg-chart-3/10 text-chart-3'}`}>
                  {a.status}
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

const ExpansionRadarPanel = () => (
  <motion.div {...fade(4)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-2/10"><Globe className="h-4 w-4 text-chart-2" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Global Expansion Radar</h2>
            <p className="text-[10px] text-muted-foreground">City readiness comparison & capital efficiency mapping</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={expansionRadar}>
                <PolarGrid className="stroke-border" />
                <PolarAngleAxis dataKey="city" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <PolarRadiusAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }} domain={[0, 100]} />
                <RRadar name="KL" dataKey="kl" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                <RRadar name="Bangkok" dataKey="bkk" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.06)" strokeWidth={1.5} />
                <RRadar name="Semarang" dataKey="smg" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.04)" strokeWidth={1.5} />
                <Tooltip contentStyle={tt} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Readiness Scorecards</p>
            <div className="space-y-2">
              {[
                { city: 'Kuala Lumpur', score: 72, tier: 'Ready', investment: 'Rp 3.2B', payback: '12mo' },
                { city: 'Bangkok', score: 66, tier: 'Ready', investment: 'Rp 2.8B', payback: '14mo' },
                { city: 'Semarang', score: 55, tier: 'Developing', investment: 'Rp 1.2B', payback: '14mo' },
                { city: 'Medan', score: 38, tier: 'Early', investment: 'Rp 1.8B', payback: '18mo' },
              ].map((c, i) => {
                const col = c.tier === 'Ready' ? 'chart-1' : c.tier === 'Developing' ? 'primary' : 'chart-3';
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/10 border border-border/20">
                    <div className="text-center w-10 shrink-0">
                      <p className="text-lg font-black tabular-nums text-foreground">{c.score}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground">{c.city}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 bg-${col}/10 text-${col}`}>{c.tier}</Badge>
                        <span className="text-[8px] text-muted-foreground">{c.investment} · Payback {c.payback}</span>
                      </div>
                    </div>
                    <Progress value={c.score} className="h-1.5 w-16" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AlertSkyline = () => (
  <motion.div {...fade(5)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-3/10"><Bell className="h-4 w-4 text-chart-3" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Execution Alert Skyline</h2>
            <p className="text-[10px] text-muted-foreground">Real-time operational signals requiring founder attention</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {alerts.map((a, i) => {
          const col = alertColor(a.type);
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-${col}/3`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-${col}/10`}>
                <a.icon className={`h-4 w-4 text-${col}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-foreground">{a.title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
              <Badge variant="outline" className={`text-[7px] h-4 px-1.5 border-0 shrink-0 bg-${col}/10 text-${col} uppercase`}>
                {a.type}
              </Badge>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══ MAIN ═══ */
const FounderWarRoom: React.FC = () => (
  <div className="space-y-5 animate-in fade-in duration-300">
    <div className="flex items-center gap-3 flex-wrap">
      <div className="p-2.5 rounded-xl bg-primary/10 animate-pulse"><Shield className="h-5 w-5 text-primary" /></div>
      <div>
        <h1 className="text-sm font-black tracking-tight text-foreground uppercase">Founder War-Room Command</h1>
        <p className="text-[10px] text-muted-foreground">Unified operational intelligence — liquidity, revenue, marketplace, AI & expansion</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Liquidity</p>
          <p className="text-sm font-black text-primary tabular-nums">82</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Rev MTD</p>
          <p className="text-sm font-black text-chart-1 tabular-nums">Rp 1.12B</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">AI Mode</p>
          <p className="text-sm font-black text-chart-2">SEMI-AUTO</p>
        </div>
      </div>
    </div>

    <LiquidityCore />
    <RevenueCommand />
    <MarketplaceForce />
    <AIBrainStream />
    <ExpansionRadarPanel />
    <AlertSkyline />
  </div>
);

export default FounderWarRoom;
