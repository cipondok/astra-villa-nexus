import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Flame, AlertTriangle,
  Sparkles, Activity, Crown, Gauge, Store, Layers, Zap, Users, Target,
  Wallet, Timer, BarChart3, ArrowRight, Eye, Bell, Rocket, LineChart,
  CreditCard, Gift, Shield, RefreshCw, Scale,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart as RLineChart, Line,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};

/* ── Micro-components ── */
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

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — LISTING BOOST REVENUE
   ══════════════════════════════════════════════════════════════ */
const boostTiers = [
  { tier: 'Standard', price: '1.5M', daily: 42, revenue: '63M', color: 'hsl(var(--chart-2))' },
  { tier: 'Premium', price: '5M', daily: 18, revenue: '90M', color: 'hsl(var(--primary))' },
  { tier: 'Elite', price: '15M', daily: 6, revenue: '90M', color: 'hsl(var(--chart-3))' },
];

const boostForecast = [
  { month: 'M1', standard: 42, premium: 14, elite: 3 },
  { month: 'M2', standard: 58, premium: 22, elite: 5 },
  { month: 'M3', standard: 76, premium: 31, elite: 8 },
  { month: 'M4', standard: 94, premium: 42, elite: 12 },
  { month: 'M5', standard: 118, premium: 56, elite: 16 },
  { month: 'M6', standard: 148, premium: 72, elite: 21 },
];

const ListingBoostPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Rocket} title="Listing Boost Revenue Control" badge="Pricing" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Rocket} label="Active Boosts" value="66" trend="up" sub="Across 3 tiers" />
        <MetricBox icon={DollarSign} label="Boost Revenue" value="243M" trend="up" sub="IDR this month" status="ok" />
        <MetricBox icon={TrendingUp} label="Conversion Rate" value="14%" trend="up" sub="Free → Boost" />
        <MetricBox icon={Flame} label="Scarcity Promos" value="2" sub="Active campaigns" />
      </div>

      {/* Tier Pricing Cards */}
      <div className="grid grid-cols-3 gap-2">
        {boostTiers.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-3 rounded-xl border border-border/40 bg-muted/10 hover:border-primary/30 transition-all text-center">
            <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${t.color}20` }}>
              {i === 0 ? <Zap className="h-4 w-4" style={{ color: t.color }} /> :
               i === 1 ? <Crown className="h-4 w-4" style={{ color: t.color }} /> :
               <Sparkles className="h-4 w-4" style={{ color: t.color }} />}
            </div>
            <p className="text-[10px] font-black uppercase text-foreground">{t.tier}</p>
            <p className="text-lg font-black text-foreground mt-0.5">Rp {t.price}</p>
            <p className="text-[8px] text-muted-foreground">/listing/month</p>
            <div className="mt-2 pt-2 border-t border-border/20">
              <p className="text-[9px] text-muted-foreground">{t.daily} active · Rp {t.revenue}/mo</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Forecast */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">6-Month Boost Revenue Forecast (Listings)</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={boostForecast}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
            <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
            <Tooltip contentStyle={tt} />
            <Area type="monotone" dataKey="standard" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" name="Standard" />
            <Area type="monotone" dataKey="premium" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" name="Premium" />
            <Area type="monotone" dataKey="elite" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.2)" name="Elite" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <SliderControl icon={DollarSign} label="Standard Price (M IDR)" defaultVal={15} min={5} max={50} unit="00K" />
        <SliderControl icon={Crown} label="Premium Price (M IDR)" defaultVal={50} min={20} max={150} unit="00K" />
        <SliderControl icon={Sparkles} label="Elite Price (M IDR)" defaultVal={150} min={50} max={300} unit="00K" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Flame} label="Dynamic Demand-Based Pricing" defaultOn />
        <ToggleControl icon={Timer} label="Time-Limited Scarcity Promotions" />
        <ToggleControl icon={TrendingUp} label="Auto-Upgrade Suggestions" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Flame} label="Launch Flash Sale" variant="urgent"
          description="Activate a 48h boost flash sale with 30% discount on Premium and Elite tiers."
          onConfirm={() => toast.success('Flash sale activated for 48 hours')} />
        <ConfirmedAction icon={Timer} label="Create Scarcity Countdown" variant="urgent"
          description="Deploy countdown banners showing limited premium slot availability."
          onConfirm={() => toast.success('Scarcity countdown deployed')} />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — VENDOR SUBSCRIPTION REVENUE
   ══════════════════════════════════════════════════════════════ */
const vendorPlans = [
  { plan: 'Starter', price: '499K', vendors: 120, mrr: '59.9M', churn: 8 },
  { plan: 'Growth', price: '1.5M', vendors: 64, mrr: '96M', churn: 5 },
  { plan: 'Pro', price: '3.5M', vendors: 28, mrr: '98M', churn: 3 },
  { plan: 'Dominance', price: '7.5M', vendors: 8, mrr: '60M', churn: 1 },
];

const ltvData = [
  { month: 'M1', ltv: 499, cac: 380 },
  { month: 'M3', ltv: 1497, cac: 380 },
  { month: 'M6', ltv: 2994, cac: 380 },
  { month: 'M9', ltv: 4491, cac: 380 },
  { month: 'M12', ltv: 5988, cac: 380 },
  { month: 'M16', ltv: 7984, cac: 380 },
];

const upgradeFunnel = [
  { name: 'Free Vendors', value: 340, fill: 'hsl(var(--muted-foreground))' },
  { name: 'Trial Started', value: 180, fill: 'hsl(var(--chart-2))' },
  { name: 'Paid Convert', value: 98, fill: 'hsl(var(--primary))' },
  { name: 'Upgraded', value: 42, fill: 'hsl(var(--chart-1))' },
];

const VendorSubscriptionPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Store} title="Vendor Subscription Revenue" badge="MRR" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Wallet} label="Subscription MRR" value="314M" trend="up" sub="IDR/month" status="ok" />
        <MetricBox icon={Store} label="Paid Vendors" value="220" trend="up" sub="4 tiers" />
        <MetricBox icon={TrendingUp} label="Upgrade Rate" value="29%" trend="up" sub="Free → Paid" />
        <MetricBox icon={DollarSign} label="Avg LTV" value="Rp 6M" sub="16-month retention" />
      </div>

      {/* Plan Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {vendorPlans.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
            className="p-2.5 rounded-xl border border-border/40 bg-muted/10">
            <p className="text-[10px] font-black uppercase text-foreground">{p.plan}</p>
            <p className="text-sm font-black text-primary mt-0.5">Rp {p.price}<span className="text-[8px] text-muted-foreground font-normal">/mo</span></p>
            <div className="mt-1.5 pt-1.5 border-t border-border/20 space-y-0.5">
              <div className="flex justify-between text-[8px]"><span className="text-muted-foreground">Vendors</span><span className="font-bold text-foreground">{p.vendors}</span></div>
              <div className="flex justify-between text-[8px]"><span className="text-muted-foreground">MRR</span><span className="font-bold text-chart-1">Rp {p.mrr}</span></div>
              <div className="flex justify-between text-[8px]"><span className="text-muted-foreground">Churn</span><span className={`font-bold ${p.churn > 5 ? 'text-destructive' : 'text-chart-1'}`}>{p.churn}%</span></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* LTV vs CAC */}
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Vendor LTV vs CAC (K IDR)</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={ltvData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="ltv" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.15)" name="LTV (K)" />
              <Area type="monotone" dataKey="cac" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.1)" name="CAC (K)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Upgrade Funnel */}
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Upgrade Conversion Funnel</p>
          <div className="space-y-1.5">
            {upgradeFunnel.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] font-medium text-foreground w-20 truncate">{s.name}</span>
                <div className="flex-1 h-4 rounded bg-muted/20 overflow-hidden">
                  <motion.div className="h-full rounded" style={{ background: s.fill }}
                    initial={{ width: 0 }} animate={{ width: `${(s.value / 340) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                </div>
                <span className="text-[10px] font-black tabular-nums text-foreground w-8 text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Gift} label="Trial Duration" defaultVal={14} min={3} max={30} unit=" days" />
        <SliderControl icon={DollarSign} label="Performance Discount Cap" defaultVal={20} unit="%" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Gift} label="Launch Trial Campaign" variant="premium"
          description="Offer 14-day free trial to all unsubscribed vendors with active listings."
          onConfirm={() => toast.success('Trial campaign launched for 120 vendors')} />
        <ConfirmedAction icon={TrendingUp} label="Push Upgrade Nudges" variant="premium"
          description="Send targeted upgrade recommendations to vendors with high engagement."
          onConfirm={() => toast.success('Upgrade nudges sent to 64 qualifying vendors')} />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — INVESTOR MONETIZATION LOGIC
   ══════════════════════════════════════════════════════════════ */
const investorTiers = [
  { tier: 'Explorer', price: 'Free', users: 890, conv: '-', sub: 'Basic search & alerts' },
  { tier: 'Pro', price: '299K', users: 312, conv: '18%', sub: 'Deal unlock + AI insights' },
  { tier: 'Premium', price: '999K', users: 87, conv: '28%', sub: 'Full intelligence + portfolio' },
  { tier: 'Institutional', price: '5M+', users: 12, conv: '67%', sub: 'API + exclusive inventory' },
];

const segmentConversion = [
  { segment: 'Yield Focused', conv: 24, revenue: 42 },
  { segment: 'Capital Growth', conv: 31, revenue: 58 },
  { segment: 'Luxury Buyers', conv: 18, revenue: 87 },
  { segment: 'Institutional', conv: 67, revenue: 210 },
];

const InvestorMonetizationPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Users} title="Investor Monetization Logic" badge="SaaS" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Users} label="Paid Investors" value="411" trend="up" sub="3 paid tiers" />
        <MetricBox icon={CreditCard} label="Unlock Revenue" value="128M" trend="up" sub="IDR this month" />
        <MetricBox icon={DollarSign} label="ARPU" value="Rp 312K" trend="up" sub="Per active user" />
        <MetricBox icon={Crown} label="Premium Conv." value="28%" status="ok" sub="Pro → Premium" />
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {investorTiers.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`p-2.5 rounded-xl border ${i === 0 ? 'border-border/30 bg-muted/5' : 'border-primary/20 bg-primary/5'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase text-foreground">{t.tier}</p>
              {i > 0 && <Badge className="text-[7px] h-3.5 px-1 bg-primary/10 text-primary border-0">{t.conv} conv</Badge>}
            </div>
            <p className="text-sm font-black text-primary">{i > 0 ? `Rp ${t.price}` : t.price}<span className="text-[8px] text-muted-foreground font-normal">{i > 0 ? '/mo' : ''}</span></p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{t.sub}</p>
            <p className="text-[9px] font-bold text-foreground mt-1">{t.users} users</p>
          </motion.div>
        ))}
      </div>

      {/* Segment Conversion */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Conversion & Revenue by Investor Segment</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={segmentConversion}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="segment" tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }} />
            <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
            <Tooltip contentStyle={tt} />
            <Bar dataKey="conv" fill="hsl(var(--primary)/0.6)" name="Conv %" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill="hsl(var(--chart-1)/0.6)" name="Revenue (M)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <SliderControl icon={CreditCard} label="Deal Unlock Price" defaultVal={50} min={10} max={200} unit="K IDR" />
        <SliderControl icon={Crown} label="Premium Discount" defaultVal={0} max={40} unit="%" />
        <SliderControl icon={Eye} label="Exclusive Access Markup" defaultVal={25} max={100} unit="%" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={CreditCard} label="Deal Unlock Paywall" defaultOn />
        <ToggleControl icon={Eye} label="Exclusive Inventory Gate" defaultOn />
        <ToggleControl icon={Bell} label="Premium-Only Alert Channels" defaultOn />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — REVENUE FLYWHEEL ANALYTICS
   ══════════════════════════════════════════════════════════════ */
const funnelData = [
  { name: 'Visitors', value: 24800 },
  { name: 'Property Views', value: 8420 },
  { name: 'Inquiries', value: 1890 },
  { name: 'Paid Actions', value: 487 },
  { name: 'Closed Deals', value: 38 },
];

const cityRevenue = [
  { city: 'Jakarta', boost: 128, subscription: 96, unlock: 64, total: 288 },
  { city: 'Bali', boost: 87, subscription: 42, unlock: 38, total: 167 },
  { city: 'Bandung', boost: 34, subscription: 28, unlock: 18, total: 80 },
  { city: 'Surabaya', boost: 28, subscription: 22, unlock: 14, total: 64 },
  { city: 'Yogyakarta', boost: 12, subscription: 8, unlock: 6, total: 26 },
];

const velocityTrend = [
  { week: 'W1', revenue: 42, perListing: 0.28 },
  { week: 'W2', revenue: 68, perListing: 0.35 },
  { week: 'W3', revenue: 98, perListing: 0.41 },
  { week: 'W4', revenue: 142, perListing: 0.52 },
  { week: 'W5', revenue: 198, perListing: 0.61 },
  { week: 'W6', revenue: 268, perListing: 0.74 },
];

const FlywheelAnalyticsPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Activity} title="Revenue Flywheel Analytics" badge="Live" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={DollarSign} label="Total Revenue" value="625M" trend="up" sub="IDR this month" status="ok" />
        <MetricBox icon={BarChart3} label="Rev / 100 Listings" value="Rp 74M" trend="up" />
        <MetricBox icon={TrendingUp} label="Growth Velocity" value="+35%" trend="up" status="ok" sub="Week-over-week" />
        <MetricBox icon={Target} label="Inquiry → Paid" value="26%" trend="up" sub="Conversion rate" />
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue Conversion Funnel</p>
          <div className="space-y-1">
            {funnelData.map((s, i) => {
              const maxVal = funnelData[0].value;
              const pct = i > 0 ? ((s.value / funnelData[i - 1].value) * 100).toFixed(1) : '100';
              const colors = [
                'hsl(var(--muted-foreground))', 'hsl(var(--chart-2))',
                'hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-3))',
              ];
              return (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-medium text-foreground">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold tabular-nums text-foreground">{s.value.toLocaleString()}</span>
                      {i > 0 && (
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-primary/20 text-primary">{pct}%</Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-3 rounded bg-muted/20 overflow-hidden">
                    <motion.div className="h-full rounded" style={{ background: colors[i] }}
                      initial={{ width: 0 }} animate={{ width: `${(s.value / maxVal) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                  </div>
                  {i < funnelData.length - 1 && (
                    <div className="flex justify-center"><ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" /></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by City */}
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue by City (M IDR)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cityRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="city" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={tt} />
              <Bar dataKey="boost" stackId="a" fill="hsl(var(--chart-2))" name="Boost" radius={[0, 0, 0, 0]} />
              <Bar dataKey="subscription" stackId="a" fill="hsl(var(--primary))" name="Subscription" />
              <Bar dataKey="unlock" stackId="a" fill="hsl(var(--chart-1))" name="Unlock" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monetization Velocity */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Monetization Growth Velocity</p>
        <ResponsiveContainer width="100%" height={120}>
          <RLineChart data={velocityTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
            <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
            <Tooltip contentStyle={tt} />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Revenue (M)" />
            <Line yAxisId="right" type="monotone" dataKey="perListing" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Rev/Listing (M)" />
          </RLineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — AUTOMATED REVENUE OPTIMIZATION
   ══════════════════════════════════════════════════════════════ */
const automationRules = [
  { rule: 'Surge Pricing on Demand Spike', trigger: 'Inquiry velocity >2x baseline', action: '+25% boost price', status: 'active', impact: '+18% revenue' },
  { rule: 'Drought Discount Trigger', trigger: 'Inquiry <50% of 7d avg', action: '-15% boost price', status: 'active', impact: '+12% volume' },
  { rule: 'Vendor Incentive in Supply Gap', trigger: 'District supply <40% demand', action: 'Free trial + bonus', status: 'active', impact: '+8 vendors/wk' },
  { rule: 'Investor Urgency Timer', trigger: 'Property viewed 5+ times in 24h', action: 'Push notification', status: 'active', impact: '+22% unlock' },
  { rule: 'Churn Prevention Offer', trigger: 'Vendor inactive 7+ days', action: '30% discount offer', status: 'paused', impact: '-4% churn' },
  { rule: 'Cross-Sell Premium Intel', trigger: 'Investor unlocks 3+ deals', action: 'Premium upsell', status: 'active', impact: '+15% upgrade' },
];

const AutomatedOptimizationPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Sparkles} title="Automated Revenue Optimization" badge="AI Rules" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Sparkles} label="Active Rules" value="5/6" status="ok" sub="1 paused" />
        <MetricBox icon={DollarSign} label="AI Revenue Lift" value="+18%" trend="up" sub="From automation" status="ok" />
        <MetricBox icon={Zap} label="Triggers Today" value="47" sub="Auto-executed actions" />
        <MetricBox icon={Shield} label="Safety Checks" value="100%" status="ok" sub="All rules validated" />
      </div>

      {/* Rules Table */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue Automation Rules</p>
        <ScrollArea className="max-h-[240px]">
          <div className="space-y-1.5">
            {automationRules.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-2.5 rounded-xl border ${r.status === 'active' ? 'border-chart-1/20 bg-chart-1/5' : 'border-border/30 bg-muted/10'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-foreground">{r.rule}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={r.status === 'active' ? 'default' : 'secondary'} className="text-[7px] h-3.5 px-1">{r.status}</Badge>
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-chart-1/20 text-chart-1">{r.impact}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[8px] text-muted-foreground">
                  <span><strong className="text-foreground">Trigger:</strong> {r.trigger}</span>
                  <span><strong className="text-foreground">Action:</strong> {r.action}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Zap} label="Surge Pricing Engine" defaultOn />
        <ToggleControl icon={Scale} label="Demand-Supply Auto-Balancer" defaultOn />
        <ToggleControl icon={Bell} label="Investor Urgency Messaging" defaultOn />
        <ToggleControl icon={Gift} label="Churn Prevention Auto-Offers" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Zap} label="Max Surge Multiplier" defaultVal={25} min={5} max={50} unit="%" />
        <SliderControl icon={DollarSign} label="Max Discount Cap" defaultVal={30} min={5} max={50} unit="%" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={RefreshCw} label="Re-evaluate All Rules" variant="premium"
          description="Re-run all optimization rules against current market conditions and recalibrate thresholds."
          onConfirm={() => toast.success('All 6 rules re-evaluated with latest signals')} />
        <ConfirmedAction icon={Sparkles} label="Generate New Rules" variant="premium"
          description="AI will analyze recent revenue patterns and suggest new automation rules."
          onConfirm={() => toast.success('2 new rules suggested based on pattern analysis')} />
      </div>
    </CardContent>
  </Card>
);

/* ══════════════════════════════════════════════════════════════
   MAIN — MONETIZATION ENGINE CONTROL SYSTEM
   ══════════════════════════════════════════════════════════════ */
const MonetizationEngineControl: React.FC = () => {
  const navItems = [
    { key: 'boost', label: 'Listing Boost', icon: Rocket },
    { key: 'vendor', label: 'Vendor Subs', icon: Store },
    { key: 'investor', label: 'Investor', icon: Users },
    { key: 'flywheel', label: 'Flywheel', icon: Activity },
    { key: 'automation', label: 'Auto-Optimize', icon: Sparkles },
  ];

  const scrollTo = (key: string) => {
    document.getElementById(`monetize-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Command Strip */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-primary/10"><DollarSign className="h-4 w-4 text-primary" /></div>
          <h1 className="text-sm font-black tracking-tight text-foreground">MONETIZATION ENGINE CONTROL</h1>
          <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-chart-1/30 text-chart-1 animate-pulse">● LIVE</Badge>
          <div className="ml-auto flex items-center gap-2">
            <MetricBox icon={DollarSign} label="MRR" value="625M" />
            <MetricBox icon={TrendingUp} label="Growth" value="+35%" />
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
      <div id="monetize-boost"><ListingBoostPanel /></div>
      <div id="monetize-vendor"><VendorSubscriptionPanel /></div>
      <div id="monetize-investor"><InvestorMonetizationPanel /></div>
      <div id="monetize-flywheel"><FlywheelAnalyticsPanel /></div>
      <div id="monetize-automation"><AutomatedOptimizationPanel /></div>
    </div>
  );
};

export default MonetizationEngineControl;
