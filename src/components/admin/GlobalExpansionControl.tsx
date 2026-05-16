import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
  Globe, TrendingUp, ArrowUpRight, MapPin, DollarSign, Users, Layers,
  Zap, BarChart3, Target, Rocket, Shield, Crown, Activity, Play, Building2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};
const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.35 } });

const M = ({ label, value, delta, icon: Icon }: { label: string; value: string; delta?: string; icon: React.ElementType }) => (
  <div className="p-3 rounded-[20px] bg-card/60 border border-border/40 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
      {delta && <Badge variant="outline" className="text-[8px] h-4 px-1.5 gap-0.5 font-bold bg-chart-1/10 text-chart-1 border-0"><ArrowUpRight className="h-2.5 w-2.5" />{delta}</Badge>}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
    <p className="text-xl font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
  </div>
);

/* ═══ DATA ═══ */
const marketGrid = [
  { city: 'Jakarta', country: 'ID', liquidity: 82, velocity: 340, listings: 2400, revProd: 48, tier: 'T1', segment: 'Mixed' },
  { city: 'Bali', country: 'ID', liquidity: 78, velocity: 280, listings: 1800, revProd: 62, tier: 'T1', segment: 'Luxury' },
  { city: 'Surabaya', country: 'ID', liquidity: 64, velocity: 180, listings: 920, revProd: 28, tier: 'T2', segment: 'Mixed' },
  { city: 'Bandung', country: 'ID', liquidity: 58, velocity: 140, listings: 680, revProd: 22, tier: 'T2', segment: 'Residential' },
  { city: 'Yogyakarta', country: 'ID', liquidity: 52, velocity: 120, listings: 420, revProd: 18, tier: 'T2', segment: 'Residential' },
  { city: 'Makassar', country: 'ID', liquidity: 38, velocity: 65, listings: 180, revProd: 8, tier: 'T3', segment: 'Emerging' },
  { city: 'Kuala Lumpur', country: 'MY', liquidity: 72, velocity: 220, listings: 1200, revProd: 38, tier: 'T1', segment: 'Mixed' },
  { city: 'Bangkok', country: 'TH', liquidity: 68, velocity: 200, listings: 1400, revProd: 34, tier: 'T1', segment: 'Mixed' },
  { city: 'Ho Chi Minh', country: 'VN', liquidity: 55, velocity: 110, listings: 560, revProd: 16, tier: 'T2', segment: 'Emerging' },
  { city: 'Manila', country: 'PH', liquidity: 48, velocity: 90, listings: 340, revProd: 12, tier: 'T2', segment: 'Residential' },
];

const readinessScores = [
  { city: 'Semarang', supply: 72, demand: 58, vendor: 45, monetization: 32, ops: 68, total: 55 },
  { city: 'Medan', supply: 48, demand: 42, vendor: 28, monetization: 18, ops: 52, total: 38 },
  { city: 'Makassar', supply: 55, demand: 50, vendor: 35, monetization: 22, ops: 58, total: 44 },
  { city: 'Balikpapan', supply: 42, demand: 35, vendor: 22, monetization: 12, ops: 45, total: 31 },
  { city: 'Kuala Lumpur', supply: 82, demand: 78, vendor: 68, monetization: 55, ops: 75, total: 72 },
  { city: 'Bangkok', supply: 78, demand: 74, vendor: 62, monetization: 48, ops: 70, total: 66 },
];

const capitalData = [
  { city: 'Semarang', investment: 1.2, payback: 14, revenueMonth: 4, liquidityWeek: 8 },
  { city: 'Medan', investment: 1.8, payback: 18, revenueMonth: 6, liquidityWeek: 12 },
  { city: 'KL', investment: 3.2, payback: 12, revenueMonth: 3, liquidityWeek: 6 },
  { city: 'Bangkok', investment: 2.8, payback: 14, revenueMonth: 4, liquidityWeek: 8 },
  { city: 'HCMC', investment: 2.0, payback: 20, revenueMonth: 7, liquidityWeek: 14 },
];

const rampCurve = [
  { week: 'W1', semarang: 5, medan: 3, kl: 12, bangkok: 10 },
  { week: 'W4', semarang: 18, medan: 10, kl: 38, bangkok: 32 },
  { week: 'W8', semarang: 35, medan: 22, kl: 58, bangkok: 50 },
  { week: 'W12', semarang: 52, medan: 34, kl: 72, bangkok: 64 },
  { week: 'W16', semarang: 65, medan: 45, kl: 82, bangkok: 74 },
  { week: 'W20', semarang: 74, medan: 55, kl: 88, bangkok: 80 },
];

const spillover = [
  { pair: 'Jakarta→Bandung', effect: 34, direction: 'outflow' },
  { pair: 'Bali→Surabaya', effect: 22, direction: 'outflow' },
  { pair: 'Jakarta→KL', effect: 18, direction: 'cross-border' },
  { pair: 'Bali→Bangkok', effect: 14, direction: 'cross-border' },
  { pair: 'KL→HCMC', effect: 8, direction: 'cross-border' },
];

const defensibility = [
  { month: 'Q1', dataAdvantage: 28, networkDensity: 22, brandAuth: 18, switchingCost: 12 },
  { month: 'Q2', dataAdvantage: 42, networkDensity: 35, brandAuth: 28, switchingCost: 22 },
  { month: 'Q3', dataAdvantage: 58, networkDensity: 48, brandAuth: 42, switchingCost: 38 },
  { month: 'Q4', dataAdvantage: 72, networkDensity: 62, brandAuth: 55, switchingCost: 52 },
  { month: 'Y2', dataAdvantage: 85, networkDensity: 78, brandAuth: 72, switchingCost: 68 },
];

const tierColor = (t: string) => t === 'T1' ? 'bg-chart-1/10 text-chart-1' : t === 'T2' ? 'bg-primary/10 text-primary' : 'bg-chart-3/10 text-chart-3';

/* ═══ SECTIONS ═══ */

const Section1 = () => {
  const [country, setCountry] = useState('all');
  const [tier, setTier] = useState('all');
  const filtered = marketGrid.filter(m => (country === 'all' || m.country === country) && (tier === 'all' || m.tier === tier));
  return (
    <motion.div {...fade(0)}>
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-xl bg-primary/10"><Globe className="h-4 w-4 text-primary" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Global Market Performance Grid</h2>
              <p className="text-[10px] text-muted-foreground">Cross-market liquidity, velocity & revenue comparison</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-7 text-[10px] w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="ID">Indonesia</SelectItem>
                  <SelectItem value="MY">Malaysia</SelectItem>
                  <SelectItem value="TH">Thailand</SelectItem>
                  <SelectItem value="VN">Vietnam</SelectItem>
                  <SelectItem value="PH">Philippines</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="h-7 text-[10px] w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="T1">Tier 1</SelectItem>
                  <SelectItem value="T2">Tier 2</SelectItem>
                  <SelectItem value="T3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <M icon={Globe} label="Active Markets" value={`${filtered.length}`} delta={`${marketGrid.length} total`} />
            <M icon={Activity} label="Avg Liquidity" value={`${Math.round(filtered.reduce((s, m) => s + m.liquidity, 0) / (filtered.length || 1))}`} delta="+6" />
            <M icon={BarChart3} label="Total Listings" value={`${(filtered.reduce((s, m) => s + m.listings, 0) / 1000).toFixed(1)}K`} delta="+18%" />
            <M icon={DollarSign} label="Avg Rev/Market" value={`$${Math.round(filtered.reduce((s, m) => s + m.revProd, 0) / (filtered.length || 1))}K`} delta="+22%" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border/30">
                  {['City', 'Country', 'Tier', 'Liquidity', 'Velocity', 'Listings', 'Rev/Mo', 'Segment'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-muted-foreground font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={i} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
                    <td className="py-2 px-2 font-bold text-foreground">{m.city}</td>
                    <td className="py-2 px-2 text-muted-foreground">{m.country}</td>
                    <td className="py-2 px-2"><Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${tierColor(m.tier)}`}>{m.tier}</Badge></td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <Progress value={m.liquidity} className="h-1.5 w-12" />
                        <span className="font-bold tabular-nums text-foreground">{m.liquidity}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 font-bold tabular-nums text-foreground">{m.velocity}</td>
                    <td className="py-2 px-2 tabular-nums text-foreground">{m.listings.toLocaleString()}</td>
                    <td className="py-2 px-2 font-bold tabular-nums text-chart-1">${m.revProd}K</td>
                    <td className="py-2 px-2 text-muted-foreground">{m.segment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Section2 = () => (
  <motion.div {...fade(1)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-1/10"><Target className="h-4 w-4 text-chart-1" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Expansion Readiness Scoring</h2>
            <p className="text-[10px] text-muted-foreground">5-factor readiness assessment per target city</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {readinessScores.map((c, i) => {
            const readiness = c.total >= 65 ? 'Ready' : c.total >= 45 ? 'Developing' : 'Early';
            const col = readiness === 'Ready' ? 'chart-1' : readiness === 'Developing' ? 'primary' : 'chart-3';
            return (
              <motion.div key={i} {...fade(i)} className="p-3 rounded-xl border border-border/20 bg-muted/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-foreground">{c.city}</span>
                  <Badge variant="outline" className={`text-[7px] h-3.5 px-1.5 border-0 bg-${col}/10 text-${col}`}>{readiness}</Badge>
                </div>
                <div className="text-center mb-2">
                  <span className="text-2xl font-black tabular-nums text-foreground">{c.total}</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { l: 'Supply Readiness', v: c.supply },
                    { l: 'Investor Demand', v: c.demand },
                    { l: 'Vendor Ecosystem', v: c.vendor },
                    { l: 'Monetization', v: c.monetization },
                    { l: 'Ops Infrastructure', v: c.ops },
                  ].map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <span className="text-[8px] text-muted-foreground w-20 shrink-0">{f.l}</span>
                      <Progress value={f.v} className="h-1 flex-1" />
                      <span className="text-[8px] font-bold tabular-nums text-foreground w-6 text-right">{f.v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Section3 = () => (
  <motion.div {...fade(2)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-2/10"><DollarSign className="h-4 w-4 text-chart-2" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Capital Deployment Intelligence</h2>
            <p className="text-[10px] text-muted-foreground">Investment, payback & liquidity ramp-up projections</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Launch Investment & Payback</p>
            <div className="space-y-2">
              {capitalData.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/10 border border-border/20">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-foreground">{c.city}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[8px] text-muted-foreground">Invest: <span className="font-bold text-foreground">Rp {c.investment}B</span></span>
                      <span className="text-[8px] text-muted-foreground">Payback: <span className="font-bold text-chart-1">{c.payback}mo</span></span>
                      <span className="text-[8px] text-muted-foreground">Revenue: <span className="font-bold text-primary">Mo {c.revenueMonth}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Liquidity Ramp-Up Curve (Index)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rampCurve}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="kl" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Kuala Lumpur" />
                <Line type="monotone" dataKey="bangkok" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 2 }} name="Bangkok" />
                <Line type="monotone" dataKey="semarang" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 2 }} name="Semarang" />
                <Line type="monotone" dataKey="medan" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={{ r: 2 }} name="Medan" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Section4 = () => (
  <motion.div {...fade(3)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-3/10"><Rocket className="h-4 w-4 text-chart-3" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Multi-City Growth Orchestration</h2>
            <p className="text-[10px] text-muted-foreground">Leadership execution controls for cross-market scaling</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'Launch City Sequence', desc: 'Trigger full onboarding + supply seeding for a new target city', icon: Play, action: 'Initialize Launch', impact: 'New market activation' },
            { title: 'Allocate Growth Budget', desc: 'Redistribute capital allocation across active and target regions', icon: DollarSign, action: 'Reallocate Budget', impact: '12 regions affected' },
            { title: 'Deploy Vendor Campaign', desc: 'Activate vendor acquisition funnels in undersupplied zones', icon: Users, action: 'Deploy Campaign', impact: '+180 target vendors' },
            { title: 'Investor Awareness Wave', desc: 'Launch investor geo-targeted awareness campaigns across markets', icon: Zap, action: 'Launch Wave', impact: '5 markets targeted' },
          ].map((c, i) => (
            <motion.div key={i} {...fade(i)} className="p-4 rounded-xl border border-border/20 bg-muted/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0"><c.icon className="h-4 w-4 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-foreground">{c.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{c.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[8px] text-muted-foreground">Impact: <span className="font-bold text-chart-1">{c.impact}</span></span>
                    <Button size="sm" className="h-6 text-[8px] px-3">{c.action}</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Section5 = () => (
  <motion.div {...fade(4)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Global Network Effect Visualization</h2>
            <p className="text-[10px] text-muted-foreground">Cross-market spillover, investor mobility & defensibility progression</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Cross-Market Demand Spillover</p>
            <div className="space-y-2">
              {spillover.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/15">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${s.direction === 'cross-border' ? 'bg-chart-1' : 'bg-primary'}`} />
                  <span className="text-[10px] font-bold text-foreground flex-1">{s.pair}</span>
                  <Progress value={s.effect} className="h-1.5 w-16" />
                  <span className="text-[9px] font-bold tabular-nums text-foreground w-6 text-right">{s.effect}%</span>
                  <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${s.direction === 'cross-border' ? 'bg-chart-1/10 text-chart-1' : 'bg-primary/10 text-primary'}`}>
                    {s.direction}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Marketplace Defensibility Progression</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={defensibility}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="dataAdvantage" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.08)" strokeWidth={2} name="Data Advantage" />
                <Area type="monotone" dataKey="networkDensity" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.06)" strokeWidth={1.5} name="Network Density" />
                <Area type="monotone" dataKey="brandAuth" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.05)" strokeWidth={1.5} name="Brand Authority" />
                <Area type="monotone" dataKey="switchingCost" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.04)" strokeWidth={1.5} name="Switching Cost" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══ MAIN ═══ */
const GlobalExpansionControl: React.FC = () => (
  <div className="space-y-5 animate-in fade-in duration-300">
    <div className="flex items-center gap-3 flex-wrap">
      <div className="p-2.5 rounded-xl bg-primary/10"><Globe className="h-5 w-5 text-primary" /></div>
      <div>
        <h1 className="text-sm font-black tracking-tight text-foreground uppercase">Global Expansion Control</h1>
        <p className="text-[10px] text-muted-foreground">Multi-market performance monitoring, readiness scoring & growth orchestration</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Markets</p>
          <p className="text-sm font-black text-primary tabular-nums">10</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Avg Liquidity</p>
          <p className="text-sm font-black text-chart-1 tabular-nums">62</p>
        </div>
      </div>
    </div>

    <Section1 />
    <Section2 />
    <Section3 />
    <Section4 />
    <Section5 />
  </div>
);

export default GlobalExpansionControl;
