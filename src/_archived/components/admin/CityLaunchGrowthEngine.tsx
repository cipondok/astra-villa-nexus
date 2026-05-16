import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Rocket, TrendingUp, TrendingDown, DollarSign, Users, Target, Zap,
  ArrowUpRight, ArrowDownRight, BarChart3, Flame, AlertTriangle,
  Sparkles, Activity, MapPin, Eye, Clock, Bell, Send, Crown, Shield,
  Gauge, Globe, Store, Building2, Layers, CheckCircle, RefreshCw,
  Play, Pause, Radio, Megaphone, Scale, LineChart, Timer, Wallet,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart as RLineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

/* ── Shared micro-components ── */
const SignalDot = ({ status }: { status: 'ok' | 'warn' | 'critical' }) => (
  <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${
    status === 'ok' ? 'bg-chart-1 shadow-[0_0_6px_hsl(var(--chart-1)/0.6)]' :
    status === 'warn' ? 'bg-chart-3 shadow-[0_0_6px_hsl(var(--chart-3)/0.6)]' :
    'bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.6)] animate-pulse'
  }`} />
);

const SectionTitle = ({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-2 rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">{title}</h2>
    {badge && <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/30 text-primary ml-auto">{badge}</Badge>}
  </div>
);

const MetricBox = ({ label, value, sub, icon: Icon, status, trend }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
  status?: 'ok' | 'warn' | 'critical'; trend?: 'up' | 'down';
}) => (
  <div className="p-3 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm hover:border-primary/20 transition-all group">
    <div className="flex items-center justify-between mb-1.5">
      <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex items-center gap-1">
        {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-chart-1" />}
        {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-destructive" />}
        {status && <SignalDot status={status} />}
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
    <p className="text-lg font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const ConfirmedAction = ({ label, icon: Icon, variant = 'default', description, onConfirm }: {
  label: string; icon: React.ElementType; variant?: 'default' | 'urgent' | 'premium';
  description: string; onConfirm: () => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline" size="sm"
        className={`h-8 text-[10px] font-semibold gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] ${
          variant === 'urgent' ? 'border-destructive/30 text-destructive hover:bg-destructive/10' :
          variant === 'premium' ? 'border-primary/30 text-primary hover:bg-primary/10' : 'hover:bg-accent/60'
        }`}>
        <Icon className="h-3 w-3" />{label}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Execute</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const ToggleControl = ({ label, icon: Icon, defaultOn = false }: {
  label: string; icon: React.ElementType; defaultOn?: boolean;
}) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-foreground">{label}</span>
      </div>
      <Switch checked={on} onCheckedChange={(v) => { setOn(v); toast.success(`${label}: ${v ? 'ON' : 'OFF'}`); }} className="scale-75" />
    </div>
  );
};

const SliderControl = ({ label, icon: Icon, defaultVal = 50, min = 0, max = 100, unit = '%' }: {
  label: string; icon: React.ElementType; defaultVal?: number; min?: number; max?: number; unit?: string;
}) => {
  const [val, setVal] = useState([defaultVal]);
  return (
    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-[10px] font-black tabular-nums text-primary">{val[0]}{unit}</span>
      </div>
      <Slider value={val} onValueChange={setVal} min={min} max={max} step={1} className="h-1" />
    </div>
  );
};

const tooltipStyle = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — CITY LIQUIDITY INITIALIZATION
   ══════════════════════════════════════════════════════════════ */
const seedingData = [
  { day: 'D1', listings: 12, vendors: 4, inquiries: 3 },
  { day: 'D2', listings: 28, vendors: 9, inquiries: 8 },
  { day: 'D3', listings: 45, vendors: 14, inquiries: 18 },
  { day: 'D4', listings: 67, vendors: 21, inquiries: 34 },
  { day: 'D5', listings: 89, vendors: 28, inquiries: 52 },
  { day: 'D6', listings: 118, vendors: 35, inquiries: 71 },
  { day: 'D7', listings: 156, vendors: 43, inquiries: 94 },
];

const districtHeat = [
  { district: 'Menteng', listings: 48, demand: 92, liquidity: 87, status: 'ok' as const },
  { district: 'Kemang', listings: 34, demand: 78, liquidity: 72, status: 'ok' as const },
  { district: 'Sudirman', listings: 22, demand: 85, liquidity: 54, status: 'warn' as const },
  { district: 'Kelapa Gading', listings: 18, demand: 64, liquidity: 41, status: 'warn' as const },
  { district: 'Tangerang', listings: 9, demand: 71, liquidity: 23, status: 'critical' as const },
  { district: 'Bekasi', listings: 6, demand: 58, liquidity: 18, status: 'critical' as const },
];

const LiquidityInitPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Layers} title="City Liquidity Initialization" badge="Seeding" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Store} label="Vendors Onboarded" value="43" trend="up" sub="Week 1 total" />
        <MetricBox icon={Building2} label="Listings Seeded" value="156" trend="up" sub="+38 today" />
        <MetricBox icon={Activity} label="Inquiry Velocity" value="94/d" trend="up" sub="Accelerating" status="ok" />
        <MetricBox icon={Gauge} label="Avg Liquidity" value="49" status="warn" sub="Target: 65" />
      </div>

      {/* Seeding Progress Chart */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Seeding Velocity (Week 1)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={seedingData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="listings" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.15)" name="Listings" />
              <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" name="Inquiries" />
              <Area type="monotone" dataKey="vendors" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.1)" name="Vendors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">District Liquidity Heat</p>
          <ScrollArea className="max-h-[180px]">
            <div className="space-y-1.5">
              {districtHeat.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-[10px] font-semibold text-foreground flex-1 truncate">{d.district}</span>
                  <div className="w-16">
                    <Progress value={d.liquidity} className="h-1.5" />
                  </div>
                  <span className="text-[9px] font-bold tabular-nums text-foreground w-7 text-right">{d.liquidity}</span>
                  <SignalDot status={d.status} />
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Onboarding Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <SliderControl icon={Store} label="Daily Vendor Target" defaultVal={15} min={1} max={50} unit=" vendors" />
        <SliderControl icon={Building2} label="Min Listings/Vendor" defaultVal={5} min={1} max={20} unit=" listings" />
        <SliderControl icon={Gauge} label="Liquidity Threshold" defaultVal={65} unit=" pts" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Store} label="Bulk Vendor Invite" variant="premium"
          description="Send automated onboarding invitations to all pre-qualified vendors in this city."
          onConfirm={() => toast.success('Invitations sent to 120 vendors')} />
        <ConfirmedAction icon={Building2} label="Seed Initial Listings" variant="premium"
          description="Import scraped listing data to seed initial supply and bootstrap the marketplace."
          onConfirm={() => toast.success('250 listings seeded across 6 districts')} />
        <ConfirmedAction icon={RefreshCw} label="Recalculate Liquidity"
          description="Trigger full district-level liquidity recalculation for accurate heat scoring."
          onConfirm={() => toast.success('Liquidity scores recalculated')} />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — DEMAND GENERATION AUTOMATION
   ══════════════════════════════════════════════════════════════ */
const campaignData = [
  { name: 'Geo-Target Ads', signups: 142, inquiries: 87, status: 'active', roi: 3.2 },
  { name: 'Deal Alert Blast', signups: 89, inquiries: 56, status: 'active', roi: 4.1 },
  { name: 'Webinar Funnel', signups: 64, inquiries: 28, status: 'scheduled', roi: 2.8 },
  { name: 'Referral Bonus', signups: 37, inquiries: 22, status: 'active', roi: 5.6 },
];

const demandTrend = [
  { week: 'W1', investors: 45, inquiries: 94, deals: 2 },
  { week: 'W2', investors: 112, inquiries: 218, deals: 8 },
  { week: 'W3', investors: 198, inquiries: 387, deals: 19 },
  { week: 'W4', investors: 312, inquiries: 642, deals: 38 },
];

const DemandGenPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Megaphone} title="Demand Generation Automation" badge="Campaigns" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Users} label="Investor Signups" value="312" trend="up" sub="This month" />
        <MetricBox icon={Activity} label="Inquiry Growth" value="+68%" trend="up" status="ok" sub="vs last week" />
        <MetricBox icon={Target} label="Active Campaigns" value="3" sub="1 scheduled" />
        <MetricBox icon={DollarSign} label="Avg Campaign ROI" value="3.9x" trend="up" status="ok" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Demand Growth Trend */}
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Demand Growth Curve</p>
          <ResponsiveContainer width="100%" height={170}>
            <RLineChart data={demandTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="investors" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Investors" />
              <Line type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Inquiries" />
              <Line type="monotone" dataKey="deals" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Deals" />
            </RLineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Performance */}
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Campaign Performance</p>
          <div className="space-y-1.5">
            {campaignData.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                <Megaphone className="h-3 w-3 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-[8px] text-muted-foreground">{c.signups} signups · {c.inquiries} inquiries</p>
                </div>
                <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[7px] h-4 px-1">{c.status}</Badge>
                <span className="text-[10px] font-bold text-chart-1 tabular-nums">{c.roi}x</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Bell} label="Auto Deal Alert Broadcasts" defaultOn />
        <ToggleControl icon={Flame} label="Urgency Scarcity Messaging" />
        <ToggleControl icon={Sparkles} label="AI Hot Deals Feed Generation" defaultOn />
        <ToggleControl icon={Target} label="Geo-Targeted Acquisition Funnels" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Send} label="Broadcast Deal Alert" variant="urgent"
          description="Send curated high-value deal alerts to all registered investors in this city."
          onConfirm={() => toast.success('Deal alerts sent to 312 investors')} />
        <ConfirmedAction icon={Flame} label="Activate Scarcity Mode" variant="urgent"
          description="Enable scarcity countdown timers and urgency banners for premium listings."
          onConfirm={() => toast.success('Scarcity mode activated across 4 districts')} />
        <ConfirmedAction icon={Sparkles} label="Generate Hot Deals Feed" variant="premium"
          description="AI will rank and generate the top 20 deals based on liquidity, ROI, and demand signals."
          onConfirm={() => toast.success('Hot deals feed generated with 20 properties')} />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — LIQUIDITY BALANCE OPTIMIZER
   ══════════════════════════════════════════════════════════════ */
const balanceData = [
  { district: 'Menteng', supply: 48, demand: 92, balance: -48, action: 'Recruit 15+ vendors' },
  { district: 'Sudirman', supply: 22, demand: 85, balance: -74, action: 'Critical: seed listings urgently' },
  { district: 'Kemang', supply: 34, demand: 78, balance: -56, action: 'Activate vendor incentives' },
  { district: 'Kelapa Gading', supply: 18, demand: 64, balance: -72, action: 'Launch acquisition campaign' },
  { district: 'PIK', supply: 41, demand: 32, balance: 28, action: 'Oversupply: reduce boost' },
  { district: 'Tangerang', supply: 9, demand: 71, balance: -87, action: 'Emergency vendor drive' },
];

const pricingNudges = [
  { listing: 'Villa Menteng Elite', current: 'Rp 8.2B', suggested: 'Rp 7.5B', reason: '12% above FMV', urgency: 'high' },
  { listing: 'Apartment Sudirman', current: 'Rp 2.1B', suggested: 'Rp 1.95B', reason: '8% above comps', urgency: 'medium' },
  { listing: 'Commercial Kemang', current: 'Rp 15B', suggested: 'Rp 14.2B', reason: 'Low inquiry volume', urgency: 'high' },
];

const LiquidityBalancePanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Scale} title="Liquidity Balance Optimizer" badge="AI Engine" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={AlertTriangle} label="Oversupply Zones" value="1" status="warn" sub="PIK district" />
        <MetricBox icon={Flame} label="Supply Gaps" value="5" status="critical" sub="High demand, low inventory" />
        <MetricBox icon={Scale} label="Balance Score" value="38" status="critical" sub="Target: 70+" />
        <MetricBox icon={DollarSign} label="Price Nudges" value="3" sub="Listings above FMV" />
      </div>

      {/* Supply-Demand Balance */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">District Supply-Demand Balance</p>
        <div className="space-y-1.5">
          {balanceData.map((d, i) => {
            const isOver = d.balance > 0;
            return (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  isOver ? 'bg-chart-3/5 border-chart-3/20' : d.balance < -70 ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/10 border-border/20'
                }`}>
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span className="text-[10px] font-semibold text-foreground w-24">{d.district}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[8px] text-muted-foreground">S:{d.supply}</span>
                    <span className="text-[8px] text-muted-foreground">D:{d.demand}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div className={`h-full rounded-full ${isOver ? 'bg-chart-3' : 'bg-destructive'}`}
                      style={{ width: `${Math.min(Math.abs(d.balance), 100)}%` }} />
                  </div>
                </div>
                <span className={`text-[9px] font-bold tabular-nums w-10 text-right ${isOver ? 'text-chart-3' : 'text-destructive'}`}>
                  {d.balance > 0 ? '+' : ''}{d.balance}%
                </span>
                <Badge variant={d.balance < -70 ? 'destructive' : 'secondary'} className="text-[7px] h-4 px-1 shrink-0 max-w-[120px] truncate">
                  {d.action}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pricing Nudges */}
      <div className="p-2.5 rounded-xl bg-chart-3/5 border border-chart-3/20">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-3.5 w-3.5 text-chart-3" />
          <span className="text-[10px] font-bold text-chart-3">Pricing Competitiveness Nudges</span>
        </div>
        <div className="space-y-1">
          {pricingNudges.map((n, i) => (
            <div key={i} className="flex items-center justify-between text-[9px] p-1.5 rounded bg-background/40">
              <span className="text-foreground font-medium flex-1 truncate">{n.listing}</span>
              <span className="text-muted-foreground mx-2">{n.current} → <span className="text-chart-1 font-bold">{n.suggested}</span></span>
              <Badge variant={n.urgency === 'high' ? 'destructive' : 'secondary'} className="text-[7px] h-3.5 px-1">{n.reason}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Scale} label="Auto-Rebalance" variant="urgent"
          description="AI will automatically adjust visibility, boost, and vendor acquisition priorities based on supply-demand gaps."
          onConfirm={() => toast.success('Rebalancing executed across 6 districts')} />
        <ConfirmedAction icon={DollarSign} label="Push Price Nudges" variant="premium"
          description="Send pricing competitiveness suggestions to vendors with above-market listings."
          onConfirm={() => toast.success('Price nudges sent to 3 vendors')} />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — FOUNDER LAUNCH CONTROL PANEL
   ══════════════════════════════════════════════════════════════ */
const LaunchControlPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Rocket} title="Founder Launch Control" badge="Manual Override" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <ConfirmedAction icon={Zap} label="City-Wide Boost Promotion" variant="urgent"
          description="Activate maximum visibility boost across all districts in this city for 48 hours."
          onConfirm={() => toast.success('City-wide boost activated for 48h')} />
        <ConfirmedAction icon={Wallet} label="Vendor Incentive Campaign" variant="premium"
          description="Launch commission-free onboarding and bonus credits for new vendor signups."
          onConfirm={() => toast.success('Vendor incentive campaign launched')} />
        <ConfirmedAction icon={Users} label="Investor Webinar Funnel" variant="premium"
          description="Trigger automated investor webinar registration funnel with email/WhatsApp sequences."
          onConfirm={() => toast.success('Webinar funnel activated for 312 investors')} />
        <ConfirmedAction icon={Crown} label="Release Premium Inventory" variant="urgent"
          description="Unlock exclusive premium listings batch for high-intent investors."
          onConfirm={() => toast.success('24 premium listings released')} />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Rocket} label="Launch Mode Active" defaultOn />
        <ToggleControl icon={Shield} label="Auto-Escalation to Founder" defaultOn />
        <ToggleControl icon={Radio} label="Real-time Alert Stream" defaultOn />
        <ToggleControl icon={Timer} label="24h Rapid Response Mode" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Zap} label="Boost Budget Cap" defaultVal={50} min={10} max={200} unit="M IDR" />
        <SliderControl icon={Wallet} label="Incentive Budget" defaultVal={25} min={5} max={100} unit="M IDR" />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — LAUNCH SUCCESS METRICS
   ══════════════════════════════════════════════════════════════ */
const weeklyProgress = [
  { week: 'W1', liquidity: 18, revenue: 0, vendors: 43, retention: 95 },
  { week: 'W2', liquidity: 32, revenue: 2.4, vendors: 78, retention: 91 },
  { week: 'W3', liquidity: 49, revenue: 8.7, vendors: 112, retention: 88 },
  { week: 'W4', liquidity: 61, revenue: 18.2, vendors: 148, retention: 86 },
  { week: 'W5', liquidity: 72, revenue: 31.5, vendors: 176, retention: 84 },
  { week: 'W6', liquidity: 78, revenue: 42.8, vendors: 198, retention: 83 },
];

const radarMetrics = [
  { metric: 'Liquidity', value: 78, target: 85 },
  { metric: 'Revenue', value: 62, target: 80 },
  { metric: 'Supply', value: 71, target: 75 },
  { metric: 'Demand', value: 84, target: 80 },
  { metric: 'Retention', value: 83, target: 90 },
  { metric: 'NPS', value: 68, target: 75 },
];

const LaunchMetricsPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={LineChart} title="Launch Success Metrics" badge="Week 6" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Gauge} label="Liquidity Index" value="78" trend="up" status="ok" sub="Target: 85" />
        <MetricBox icon={DollarSign} label="Revenue (M IDR)" value="42.8" trend="up" sub="Cumulative" />
        <MetricBox icon={Store} label="Vendor Retention" value="83%" status="warn" sub="Target: 90%" />
        <MetricBox icon={Users} label="Repeat Investors" value="34%" trend="up" sub="Engagement rate" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Weekly Progression */}
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Weekly Launch Progression</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="liquidity" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.15)" name="Liquidity Index" />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" name="Revenue (M)" />
              <Area type="monotone" dataKey="retention" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.1)" name="Retention %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Health */}
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Launch Health Radar</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarMetrics} outerRadius="70%">
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} name="Current" />
              <Radar dataKey="target" stroke="hsl(var(--chart-1))" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Target" />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Emergence Timeline */}
      <div className="p-2.5 rounded-xl bg-chart-1/5 border border-chart-1/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
          <span className="text-[10px] font-bold text-chart-1">Revenue Emergence Timeline</span>
        </div>
        <div className="flex items-center gap-1">
          {['First Inquiry', 'First Paid Unlock', 'First Commission', 'Break-even', 'Profitability'].map((milestone, i) => {
            const reached = i < 3;
            return (
              <React.Fragment key={i}>
                <div className={`flex-1 text-center p-1.5 rounded-lg ${reached ? 'bg-chart-1/15' : 'bg-muted/20'}`}>
                  <div className={`mx-auto w-4 h-4 rounded-full flex items-center justify-center mb-0.5 ${
                    reached ? 'bg-chart-1 text-white' : 'bg-muted/40 text-muted-foreground'
                  }`}>
                    {reached ? <CheckCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                  </div>
                  <p className={`text-[7px] font-semibold leading-tight ${reached ? 'text-chart-1' : 'text-muted-foreground'}`}>{milestone}</p>
                </div>
                {i < 4 && <div className={`w-3 h-0.5 rounded ${reached ? 'bg-chart-1' : 'bg-muted/30'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   MAIN — CITY LAUNCH GROWTH AUTOMATION ENGINE
   ══════════════════════════════════════════════════════════════ */
const CityLaunchGrowthEngine: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('jakarta');

  const navItems = [
    { key: 'init', label: 'Liquidity Init', icon: Layers },
    { key: 'demand', label: 'Demand Gen', icon: Megaphone },
    { key: 'balance', label: 'Balance Optimizer', icon: Scale },
    { key: 'control', label: 'Launch Control', icon: Rocket },
    { key: 'metrics', label: 'Success Metrics', icon: LineChart },
  ];

  const scrollTo = (key: string) => {
    document.getElementById(`launch-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Command Strip */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-primary/10"><Rocket className="h-4 w-4 text-primary" /></div>
          <h1 className="text-sm font-black tracking-tight text-foreground">CITY LAUNCH GROWTH ENGINE</h1>
          <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-chart-1/30 text-chart-1 animate-pulse">● LIVE</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-7 w-32 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bali">Bali</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-[8px] h-5 px-1.5">Week 6</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {navItems.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.key} onClick={() => scrollTo(n.key)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                <Icon className="h-3 w-3" />{n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels */}
      <div id="launch-init"><LiquidityInitPanel /></div>
      <div id="launch-demand"><DemandGenPanel /></div>
      <div id="launch-balance"><LiquidityBalancePanel /></div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5" id="launch-control"><LaunchControlPanel /></div>
        <div className="col-span-12 lg:col-span-7" id="launch-metrics"><LaunchMetricsPanel /></div>
      </div>
    </div>
  );
};

export default CityLaunchGrowthEngine;
