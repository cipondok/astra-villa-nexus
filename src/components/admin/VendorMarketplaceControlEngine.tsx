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
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Store, TrendingUp, TrendingDown, DollarSign, Users,
  Target, Zap, ArrowUpRight, ArrowDownRight, BarChart3,
  Flame, AlertTriangle, Sparkles, Activity, MapPin, Eye,
  Clock, Bell, Send, Rocket, Crown, Shield, Image,
  Gauge, Route, ArrowRightLeft, Layers, Building2,
  Star, Award, CheckCircle, XCircle, RefreshCw, Globe,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ── Data Hooks ──
function useVendorControlData() {
  const vendorStats = useQuery({
    queryKey: ['vendor-control-stats'],
    queryFn: async () => {
      const [total, verified, today, pendingQuality] = await Promise.all([
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('properties').select('id', { count: 'exact', head: true }).is('ai_quality_score', null),
      ]);
      return {
        total: total.count || 0,
        verified: verified.count || 0,
        today: today.count || 0,
        pendingQuality: pendingQuality.count || 0,
        activeRate: total.count ? Math.round((verified.count || 0) / (total.count) * 100) : 0,
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const listingStats = useQuery({
    queryKey: ['vendor-control-listings'],
    queryFn: async () => {
      const [totalListings, noImages] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).is('image_url', null),
      ]);
      return {
        total: totalListings.count || 0,
        noImages: noImages.count || 0,
        imageCompleteness: totalListings.count ? Math.round(((totalListings.count - (noImages.count || 0)) / totalListings.count) * 100) : 0,
      };
    },
    staleTime: 60_000,
  });

  return { vendorStats, listingStats };
}

// ── Micro Components ──
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

// ══════════════════════════════════════════════════════════════════
// SECTION 1 — VENDOR PERFORMANCE INTELLIGENCE
// ══════════════════════════════════════════════════════════════════
const vendorLeaderboard = [
  { name: 'PT Bali Property Co', responseMin: 4, conversion: 18.2, rating: 4.9, status: 'ok' as const },
  { name: 'Jakarta Realty Group', responseMin: 7, conversion: 15.8, rating: 4.7, status: 'ok' as const },
  { name: 'Surabaya Homes Ltd', responseMin: 12, conversion: 12.4, rating: 4.5, status: 'ok' as const },
  { name: 'Bandung Estates', responseMin: 18, conversion: 9.1, rating: 4.3, status: 'warn' as const },
  { name: 'Yogya Heritage Props', responseMin: 25, conversion: 7.6, rating: 4.1, status: 'warn' as const },
  { name: 'Semarang Property Hub', responseMin: 42, conversion: 4.2, rating: 3.8, status: 'critical' as const },
];

const VendorPerformancePanel = ({ stats }: { stats: any }) => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Award} title="Vendor Performance Intelligence" badge="Leaderboard" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Store} label="Total Vendors" value={stats?.total || 0} sub={`${stats?.verified || 0} verified`} />
        <MetricBox icon={CheckCircle} label="Active Rate" value={`${stats?.activeRate || 0}%`}
          status={stats?.activeRate > 70 ? 'ok' : stats?.activeRate > 50 ? 'warn' : 'critical'} />
        <MetricBox icon={Users} label="Onboarded Today" value={stats?.today || 0} trend="up" />
        <MetricBox icon={AlertTriangle} label="Churn Risk" value="3" status="warn" sub="Inactive 14+ days" />
      </div>

      {/* Leaderboard */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Response & Conversion Leaderboard</p>
        <div className="space-y-1">
          {vendorLeaderboard.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20 hover:border-primary/20 transition-all">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                i === 0 ? 'bg-chart-1/15 text-chart-1' : i < 3 ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-foreground truncate">{v.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[8px] text-muted-foreground">Response</p>
                  <p className={`text-[10px] font-bold tabular-nums ${v.responseMin < 15 ? 'text-chart-1' : v.responseMin < 30 ? 'text-chart-3' : 'text-destructive'}`}>
                    {v.responseMin}m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-muted-foreground">Conv.</p>
                  <p className="text-[10px] font-bold tabular-nums text-foreground">{v.conversion}%</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-chart-3" />
                  <span className="text-[10px] font-bold tabular-nums text-foreground">{v.rating}</span>
                </div>
                <SignalDot status={v.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Churn Risk Alerts */}
      <div className="p-2.5 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-center gap-2 mb-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-[10px] font-bold text-destructive">Churn Risk Vendors</span>
        </div>
        <div className="space-y-1">
          {[
            { name: 'Semarang Property Hub', days: 18, listings: 3 },
            { name: 'Makassar Realty', days: 21, listings: 1 },
            { name: 'Solo Properties', days: 14, listings: 2 },
          ].map((v, i) => (
            <div key={i} className="flex items-center justify-between text-[9px]">
              <span className="text-foreground font-medium">{v.name}</span>
              <span className="text-muted-foreground">{v.days}d inactive · {v.listings} listings</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 2 — LISTING QUALITY SCORING
// ══════════════════════════════════════════════════════════════════
const qualityAlerts = [
  { title: 'Villa Bali Sunset — Missing floor plan images', score: 32, type: 'image' },
  { title: 'Jakarta CBD Apartment — Below-market pricing suspicious', score: 41, type: 'price' },
  { title: 'Surabaya Commercial — Description too short (12 words)', score: 38, type: 'content' },
  { title: 'Bandung Villa — No location coordinates', score: 45, type: 'location' },
];

const ListingQualityPanel = ({ listings }: { listings: any }) => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Sparkles} title="Listing Quality Scoring" badge="AI Review" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Clock} label="Pending Review" value={listings?.pendingQuality || 0}
          status={listings?.pendingQuality > 100 ? 'critical' : listings?.pendingQuality > 50 ? 'warn' : 'ok'} />
        <MetricBox icon={Image} label="Image Score" value={`${listings?.imageCompleteness || 0}%`}
          status={listings?.imageCompleteness > 80 ? 'ok' : 'warn'} sub="Completeness" />
        <MetricBox icon={AlertTriangle} label="Low Quality" value={qualityAlerts.length} status="warn" sub="Flagged listings" />
        <MetricBox icon={DollarSign} label="Price Accuracy" value="94%" status="ok" sub="vs AI FMV" />
      </div>

      {/* Quality Distribution Chart */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Quality Score Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              { range: '0-20', count: 12 },
              { range: '21-40', count: 28 },
              { range: '41-60', count: 67 },
              { range: '61-80', count: 234 },
              { range: '81-100', count: 487 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="range" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" name="Listings" radius={[4, 4, 0, 0]}>
                {[
                  'hsl(var(--destructive))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))',
                  'hsl(var(--chart-2))', 'hsl(var(--chart-1))',
                ].map((c, i) => <Cell key={i} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Low-Quality Alerts</p>
          <ScrollArea className="max-h-[160px]">
            <div className="space-y-1.5">
              {qualityAlerts.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-2 p-2 rounded-lg bg-chart-3/5 border border-chart-3/20">
                  <div className={`p-1 rounded shrink-0 ${
                    a.type === 'image' ? 'bg-chart-3/15' : a.type === 'price' ? 'bg-destructive/15' : 'bg-muted/30'
                  }`}>
                    {a.type === 'image' ? <Image className="h-3 w-3 text-chart-3" /> :
                     a.type === 'price' ? <DollarSign className="h-3 w-3 text-destructive" /> :
                     a.type === 'content' ? <BarChart3 className="h-3 w-3 text-muted-foreground" /> :
                     <MapPin className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-foreground font-medium leading-tight">{a.title}</p>
                  </div>
                  <Badge variant="destructive" className="text-[8px] h-4 px-1 shrink-0">Score {a.score}</Badge>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Scoring Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <SliderControl icon={Sparkles} label="Min Quality Threshold" defaultVal={60} unit="pts" />
        <SliderControl icon={Image} label="Min Image Count" defaultVal={5} min={1} max={20} unit=" imgs" />
        <SliderControl icon={DollarSign} label="Price Variance Alert" defaultVal={15} unit="%" />
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 3 — SUPPLY COVERAGE ANALYTICS
// ══════════════════════════════════════════════════════════════════
const supplyByCity = [
  { city: 'Jakarta', listings: 847, demand: 1240, gap: -32, status: 'critical' as const },
  { city: 'Bali', listings: 623, demand: 890, gap: -30, status: 'critical' as const },
  { city: 'Bandung', listings: 312, demand: 280, gap: 11, status: 'ok' as const },
  { city: 'Surabaya', listings: 278, demand: 420, gap: -34, status: 'warn' as const },
  { city: 'Yogyakarta', listings: 156, demand: 190, gap: -18, status: 'warn' as const },
];

const typeShortage = [
  { type: 'Villa', supply: 340, demand: 580, gap: -41 },
  { type: 'Apartment', supply: 520, demand: 490, gap: 6 },
  { type: 'Commercial', supply: 180, demand: 310, gap: -42 },
  { type: 'Land', supply: 290, demand: 220, gap: 32 },
  { type: 'House', supply: 410, demand: 380, gap: 8 },
];

const priceBands = [
  { band: '<500M', supply: 320, demand: 180, balance: 'oversupply' },
  { band: '500M-1B', supply: 280, demand: 340, balance: 'shortage' },
  { band: '1-3B', supply: 190, demand: 420, balance: 'critical' },
  { band: '3-10B', supply: 120, demand: 180, balance: 'shortage' },
  { band: '>10B', supply: 45, demand: 32, balance: 'oversupply' },
];

const SupplyCoveragePanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Globe} title="Supply Coverage Analytics" badge="Gap Detection" />
    </CardHeader>
    <CardContent className="p-3 space-y-4">
      {/* Geo Supply Density */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Supply vs Demand by City</p>
        <div className="space-y-2">
          {supplyByCity.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="text-[10px] font-semibold text-foreground w-20">{c.city}</span>
              <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden relative">
                <motion.div className="absolute h-full rounded-full bg-chart-1/60" initial={{ width: 0 }}
                  animate={{ width: `${(c.listings / Math.max(c.listings, c.demand)) * 100}%` }} transition={{ duration: 0.5 }} />
                <motion.div className="absolute h-full rounded-full bg-primary/30 border-r-2 border-primary" initial={{ width: 0 }}
                  animate={{ width: `${(c.demand / Math.max(c.listings, c.demand)) * 100}%` }} transition={{ duration: 0.5, delay: 0.1 }} style={{ mixBlendMode: 'multiply' }} />
              </div>
              <div className="flex items-center gap-1.5 w-24 justify-end">
                <span className="text-[9px] tabular-nums text-muted-foreground">{c.listings}/{c.demand}</span>
                <span className={`text-[9px] font-bold tabular-nums ${c.gap >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                  {c.gap >= 0 ? '+' : ''}{c.gap}%
                </span>
                <SignalDot status={c.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Property Type Shortage */}
        <div className="col-span-12 md:col-span-6">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Property Type Gap</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={typeShortage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis type="category" dataKey="type" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} width={70} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="supply" fill="hsl(var(--chart-1))" name="Supply" radius={[0, 4, 4, 0]} />
              <Bar dataKey="demand" fill="hsl(var(--primary)/0.4)" name="Demand" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Band Imbalance */}
        <div className="col-span-12 md:col-span-6">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Price Band Imbalance</p>
          <div className="space-y-2">
            {priceBands.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] font-medium text-foreground w-14">{b.band}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-2 rounded-full bg-chart-1/30 overflow-hidden">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${(b.supply / (b.supply + b.demand)) * 100}%` }} />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-primary/30 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(b.demand / (b.supply + b.demand)) * 100}%` }} />
                  </div>
                </div>
                <Badge variant={b.balance === 'critical' ? 'destructive' : 'secondary'} className="text-[7px] h-4 px-1">
                  {b.balance}
                </Badge>
              </div>
            ))}
            <div className="flex items-center gap-3 justify-center mt-1">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-1" /><span className="text-[8px] text-muted-foreground">Supply</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-[8px] text-muted-foreground">Demand</span></div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 4 — PREMIUM VISIBILITY ALLOCATION
// ══════════════════════════════════════════════════════════════════
const PremiumAllocationPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Crown} title="Premium Visibility Control" badge="Monetization" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Crown} label="Premium Slots" value="24/50" sub="48% utilization" />
        <MetricBox icon={DollarSign} label="Slot Revenue" value="$3.8K" trend="up" sub="This week" />
        <MetricBox icon={Flame} label="Scarcity Active" value="3" sub="Districts with countdown" />
        <MetricBox icon={TrendingUp} label="Upgrade Conv." value="12%" trend="up" sub="From free tier" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Crown} label="Max Premium Slots Per District" defaultVal={10} min={1} max={50} unit=" slots" />
        <SliderControl icon={DollarSign} label="Slot Base Price" defaultVal={15} min={5} max={75} unit="M IDR" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Crown} label="Dynamic Slot Pricing" defaultOn />
        <ToggleControl icon={Flame} label="Scarcity Countdown Banners" />
        <ToggleControl icon={Bell} label="Auto Upgrade Prompts" defaultOn />
        <ToggleControl icon={Sparkles} label="AI Visibility Recommendation" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Crown} label="Assign Premium Slots" variant="premium"
          description="Redistribute available premium visibility slots based on vendor performance and demand signals."
          onConfirm={() => toast.success('Premium slots assigned to top 10 vendors')} />
        <ConfirmedAction icon={Rocket} label="Activate Boost Package" variant="premium"
          description="Enable vendor boost packages across all high-demand districts."
          onConfirm={() => toast.success('Boost packages activated')} />
        <ConfirmedAction icon={Flame} label="Create Scarcity Banner" variant="urgent"
          description="Deploy countdown scarcity banners for premium slot availability."
          onConfirm={() => toast.success('Scarcity banners deployed in 5 districts')} />
        <ConfirmedAction icon={Bell} label="Push Upgrade Prompts"
          description="Send upgrade notifications to qualified free-tier vendors."
          onConfirm={() => toast.success('Upgrade prompts sent to 47 vendors')} />
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 5 — SMART LEAD ROUTING MONITOR
// ══════════════════════════════════════════════════════════════════
const LeadRoutingPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Route} title="Smart Lead Routing Monitor" badge="AI Router" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox icon={Route} label="Routed Today" value="84" status="ok" sub="Auto: 72, Manual: 12" />
        <MetricBox icon={ArrowRightLeft} label="Fairness Index" value="0.91" status="ok" sub="Target >0.85" />
        <MetricBox icon={Target} label="Avg Match Score" value="86%" trend="up" sub="AI confidence" />
        <MetricBox icon={RefreshCw} label="Reassignments" value="5" status="warn" sub="Manual overrides" />
      </div>

      {/* Lead Distribution by Vendor */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Lead Distribution Fairness</p>
        <div className="space-y-1.5">
          {[
            { vendor: 'PT Bali Property Co', leads: 18, expected: 16, prob: 94 },
            { vendor: 'Jakarta Realty Group', leads: 15, expected: 16, prob: 88 },
            { vendor: 'Surabaya Homes', leads: 12, expected: 14, prob: 82 },
            { vendor: 'Bandung Estates', leads: 8, expected: 10, prob: 71 },
            { vendor: 'Yogya Heritage', leads: 6, expected: 8, prob: 64 },
          ].map((v, i) => {
            const deviation = ((v.leads - v.expected) / v.expected * 100);
            return (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/10 border border-border/20">
                <span className="text-[10px] font-medium text-foreground flex-1 truncate">{v.vendor}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] tabular-nums text-muted-foreground">{v.leads}/{v.expected} leads</span>
                  <span className={`text-[9px] font-bold tabular-nums ${Math.abs(deviation) < 15 ? 'text-chart-1' : 'text-chart-3'}`}>
                    {deviation >= 0 ? '+' : ''}{deviation.toFixed(0)}%
                  </span>
                  <Badge variant="secondary" className="text-[8px] h-4 px-1">P:{v.prob}%</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Shield} label="Min Confidence for Auto-Route" defaultVal={75} unit="%" />
        <SliderControl icon={ArrowRightLeft} label="Max Deviation Tolerance" defaultVal={20} unit="%" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Route} label="AI Auto-Routing Active" defaultOn />
        <ToggleControl icon={ArrowRightLeft} label="Fairness Rebalancing" defaultOn />
        <ToggleControl icon={Gauge} label="Performance-Weighted Distribution" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={RefreshCw} label="Rebalance Lead Queue" variant="urgent"
          description="Redistribute all pending leads based on current vendor performance and fairness metrics."
          onConfirm={() => toast.success('Lead queue rebalanced across 12 vendors')} />
        <ConfirmedAction icon={ArrowRightLeft} label="Manual Reassignment" variant="premium"
          description="Open manual deal reassignment interface for overriding AI routing decisions."
          onConfirm={() => toast.success('Reassignment interface opened')} />
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
const VendorMarketplaceControlEngine: React.FC = () => {
  const { vendorStats, listingStats } = useVendorControlData();
  const stats = vendorStats.data;
  const listings = listingStats.data;

  const navItems = [
    { key: 'performance', label: 'Performance', icon: Award },
    { key: 'quality', label: 'Quality', icon: Sparkles },
    { key: 'supply', label: 'Supply Coverage', icon: Globe },
    { key: 'premium', label: 'Premium Slots', icon: Crown },
    { key: 'routing', label: 'Lead Routing', icon: Route },
  ];

  const scrollTo = (key: string) => {
    document.getElementById(`vendor-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Command Strip */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-primary/10"><Store className="h-4 w-4 text-primary" /></div>
          <h1 className="text-sm font-black tracking-tight text-foreground">VENDOR MARKETPLACE CONTROL ENGINE</h1>
          <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-chart-1/30 text-chart-1 animate-pulse">● LIVE</Badge>
          <div className="ml-auto flex items-center gap-2">
            <MetricBox icon={Store} label="Vendors" value={stats?.total || 0} />
            <MetricBox icon={Layers} label="Listings" value={listings?.total || 0} />
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
      <div id="vendor-performance"><VendorPerformancePanel stats={stats} /></div>
      <div id="vendor-quality"><ListingQualityPanel listings={listings} /></div>
      <div id="vendor-supply"><SupplyCoveragePanel /></div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6" id="vendor-premium"><PremiumAllocationPanel /></div>
        <div className="col-span-12 lg:col-span-6" id="vendor-routing"><LeadRoutingPanel /></div>
      </div>
    </div>
  );
};

export default VendorMarketplaceControlEngine;
