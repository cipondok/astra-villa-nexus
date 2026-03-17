import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home, TrendingUp, Wrench, FileText, DollarSign, Bell, Calendar, Shield,
  ArrowUpRight, ArrowDownRight, RefreshCw, Lightbulb, ChevronRight, Clock,
  Landmark, PiggyBank, Hammer, Scale, Receipt, BellRing, Sparkles, Target,
  Activity, BarChart3, AlertTriangle, CheckCircle2, Circle, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, addMonths, addYears, isPast, isBefore, addDays } from 'date-fns';

// ─── Mock Data (replace with real queries when tables exist) ─────────
const OWNED_PROPERTIES = [
  {
    id: 'p1', title: 'The Riviera Unit 12A', city: 'BSD City', type: 'Apartment',
    purchasePrice: 1_800_000_000, currentValue: 2_150_000_000, purchaseDate: '2022-06-15',
    monthlyRental: 18_000_000, occupancyRate: 92, marketHeat: 78,
    thumbnail: null,
  },
  {
    id: 'p2', title: 'Villa Harmony Bali', city: 'Canggu', type: 'Villa',
    purchasePrice: 3_500_000_000, currentValue: 4_200_000_000, purchaseDate: '2021-03-20',
    monthlyRental: 45_000_000, occupancyRate: 85, marketHeat: 91,
    thumbnail: null,
  },
];

const MILESTONES = [
  { date: '2021-03-20', label: 'Purchased Villa Harmony', icon: Home, status: 'done' as const },
  { date: '2021-04-10', label: 'SHM Certificate Processed', icon: FileText, status: 'done' as const },
  { date: '2022-01-15', label: 'First Rental Income', icon: DollarSign, status: 'done' as const },
  { date: '2022-06-15', label: 'Purchased Riviera 12A', icon: Home, status: 'done' as const },
  { date: '2023-09-01', label: 'Renovation Completed (Villa)', icon: Hammer, status: 'done' as const },
  { date: '2024-06-01', label: 'PBB Tax Renewal', icon: Receipt, status: 'done' as const },
  { date: '2025-03-20', label: 'SHGB Renewal Due', icon: FileText, status: 'upcoming' as const },
  { date: '2025-06-01', label: 'PBB Tax Due', icon: Receipt, status: 'upcoming' as const },
  { date: '2025-09-01', label: 'AC Maintenance (Riviera)', icon: Wrench, status: 'upcoming' as const },
];

const AI_ADVISORIES = [
  { type: 'sell', title: 'Consider Selling Riviera 12A', message: 'Market heat at 78 with 19.4% appreciation. Current cycle peak detected — optimal exit window within 3 months.', urgency: 'high' as const, property: 'p1' },
  { type: 'refinance', title: 'Refinance Opportunity', message: 'BI rate drop expected Q3. Refinancing Villa Harmony could save Rp 4.2M/month on mortgage.', urgency: 'medium' as const, property: 'p2' },
  { type: 'rental', title: 'Adjust Rental Pricing', message: 'Canggu demand surging +15% MoM. Increase Villa Harmony rent by 8-12% to match market.', urgency: 'medium' as const, property: 'p2' },
  { type: 'renovation', title: 'Kitchen Renovation ROI', message: 'Riviera kitchen upgrade (est. Rp 85M) could increase value by Rp 180M based on comps.', urgency: 'low' as const, property: 'p1' },
];

const REMINDERS = [
  { title: 'PBB Tax Payment', due: '2025-06-01', property: 'Villa Harmony', category: 'tax' },
  { title: 'SHGB Certificate Renewal', due: '2025-03-20', property: 'Villa Harmony', category: 'legal' },
  { title: 'AC Unit Service', due: '2025-09-01', property: 'Riviera 12A', category: 'maintenance' },
  { title: 'Insurance Renewal', due: '2025-12-15', property: 'Both Properties', category: 'legal' },
  { title: 'Plumbing Inspection', due: '2025-07-10', property: 'Villa Harmony', category: 'maintenance' },
];

// ─── Helpers ─────────────────────────────────────────────────────────
function formatIDR(n: number) {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function appreciation(purchase: number, current: number) {
  return ((current - purchase) / purchase * 100).toFixed(1);
}

// ─── Property Value Card ─────────────────────────────────────────────
function PropertyValueCard({ p }: { p: typeof OWNED_PROPERTIES[0] }) {
  const appr = parseFloat(appreciation(p.purchasePrice, p.currentValue));
  const navigate = useNavigate();
  return (
    <Card className="bg-card/60 border-border/40 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{p.title}</h4>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city} · {p.type}</p>
          </div>
          <Badge variant="outline" className={`text-[10px] ${p.marketHeat >= 80 ? 'text-amber-400 border-amber-400/30' : 'text-primary border-primary/30'}`}>
            Heat {p.marketHeat}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Purchase</p>
            <p className="text-xs font-semibold text-foreground">{formatIDR(p.purchasePrice)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Current Value</p>
            <p className="text-xs font-bold text-foreground">{formatIDR(p.currentValue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Appreciation</p>
            <p className={`text-xs font-bold flex items-center justify-center gap-0.5 ${appr > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {appr > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {appr}%
            </p>
          </div>
        </div>
        <Separator className="my-3 opacity-20" />
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Monthly Rental</p>
            <p className="text-xs font-semibold text-foreground">{formatIDR(p.monthlyRental)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Occupancy</p>
            <div className="flex items-center gap-1.5 justify-center">
              <Progress value={p.occupancyRate} className="h-1.5 w-16" />
              <span className="text-xs font-semibold text-foreground">{p.occupancyRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────
function OwnershipTimeline() {
  const sorted = [...MILESTONES].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return (
    <div className="relative pl-6 space-y-4">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/40" />
      {sorted.map((m, i) => {
        const Icon = m.icon;
        const isUpcoming = m.status === 'upcoming';
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative flex items-start gap-3">
            <div className={`absolute left-[-24px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center border ${isUpcoming ? 'bg-primary/10 border-primary/40' : 'bg-muted/30 border-border/40'}`}>
              {isUpcoming ? <Circle className="h-2 w-2 text-primary fill-primary" /> : <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${isUpcoming ? 'text-foreground' : 'text-muted-foreground'}`}>{m.label}</p>
                <span className="text-[10px] text-muted-foreground">{format(new Date(m.date), 'MMM yyyy')}</span>
              </div>
              {isUpcoming && (
                <p className="text-[10px] text-primary mt-0.5">{formatDistanceToNow(new Date(m.date), { addSuffix: true })}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Reminders Panel ─────────────────────────────────────────────────
function RemindersPanel() {
  const sorted = [...REMINDERS].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const catIcon: Record<string, typeof Wrench> = { tax: Receipt, legal: FileText, maintenance: Wrench };
  const catColor: Record<string, string> = { tax: 'text-amber-400', legal: 'text-sky-400', maintenance: 'text-rose-400' };

  return (
    <div className="space-y-2">
      {sorted.map((r, i) => {
        const Icon = catIcon[r.category] || Bell;
        const dueDate = new Date(r.due);
        const overdue = isPast(dueDate);
        const soon = !overdue && isBefore(dueDate, addDays(new Date(), 30));
        return (
          <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${overdue ? 'bg-destructive/5 border-destructive/30' : soon ? 'bg-amber-400/5 border-amber-400/20' : 'bg-card/30 border-border/30'}`}>
            <Icon className={`h-4 w-4 shrink-0 ${catColor[r.category] || 'text-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{r.title}</p>
              <p className="text-[10px] text-muted-foreground">{r.property}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground">{format(dueDate, 'dd MMM yyyy')}</p>
              {overdue && <Badge variant="destructive" className="text-[9px] h-4">Overdue</Badge>}
              {soon && !overdue && <Badge variant="outline" className="text-[9px] h-4 text-amber-400 border-amber-400/30">Soon</Badge>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI Advisory Cards ───────────────────────────────────────────────
function AIAdvisoryPanel() {
  const navigate = useNavigate();
  const urgencyStyle: Record<string, { bg: string; badge: string }> = {
    high: { bg: 'bg-rose-400/5 border-rose-400/20', badge: 'text-rose-400 border-rose-400/30' },
    medium: { bg: 'bg-amber-400/5 border-amber-400/20', badge: 'text-amber-400 border-amber-400/30' },
    low: { bg: 'bg-sky-400/5 border-sky-400/20', badge: 'text-sky-400 border-sky-400/30' },
  };
  const typeIcon: Record<string, typeof TrendingUp> = {
    sell: TrendingUp, refinance: Landmark, rental: PiggyBank, renovation: Hammer,
  };

  return (
    <div className="space-y-3">
      {AI_ADVISORIES.map((a, i) => {
        const Icon = typeIcon[a.type] || Lightbulb;
        const style = urgencyStyle[a.urgency];
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border ${style.bg} hover:scale-[1.005] transition-transform cursor-pointer`} onClick={() => navigate(`/property/${a.property}`)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-card/50 border border-border/20 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-semibold text-foreground">{a.title}</h4>
                      <Badge variant="outline" className={`text-[9px] ${style.badge}`}>{a.urgency}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Service Request Buttons ─────────────────────────────────────────
function ServiceQuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: 'Request Repair', icon: Wrench, path: '/legal-services', color: 'text-rose-400' },
    { label: 'Legal Documents', icon: Scale, path: '/documents', color: 'text-sky-400' },
    { label: 'Tax Consultation', icon: Receipt, path: '/legal-services', color: 'text-amber-400' },
    { label: 'Renovation Quote', icon: Hammer, path: '/vendor-marketplace', color: 'text-emerald-400' },
    { label: 'Insurance Review', icon: Shield, path: '/legal-services', color: 'text-purple-400' },
    { label: 'Property Valuation', icon: BarChart3, path: '/price-prediction', color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((a) => (
        <Button key={a.label} variant="outline" className="h-auto flex-col gap-1.5 py-3 border-border/30 hover:border-primary/30" onClick={() => navigate(a.path)}>
          <a.icon className={`h-4 w-4 ${a.color}`} />
          <span className="text-[10px] text-foreground">{a.label}</span>
        </Button>
      ))}
    </div>
  );
}

// ─── Portfolio Summary KPIs ──────────────────────────────────────────
function PortfolioKPIs() {
  const totalValue = OWNED_PROPERTIES.reduce((s, p) => s + p.currentValue, 0);
  const totalPurchase = OWNED_PROPERTIES.reduce((s, p) => s + p.purchasePrice, 0);
  const totalRental = OWNED_PROPERTIES.reduce((s, p) => s + p.monthlyRental, 0);
  const avgOccupancy = Math.round(OWNED_PROPERTIES.reduce((s, p) => s + p.occupancyRate, 0) / OWNED_PROPERTIES.length);
  const totalAppreciation = ((totalValue - totalPurchase) / totalPurchase * 100).toFixed(1);

  const kpis = [
    { label: 'Portfolio Value', value: formatIDR(totalValue), icon: Home, color: 'text-primary' },
    { label: 'Total Appreciation', value: `+${totalAppreciation}%`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Monthly Rental', value: formatIDR(totalRental), icon: PiggyBank, color: 'text-amber-400' },
    { label: 'Avg Occupancy', value: `${avgOccupancy}%`, icon: Activity, color: 'text-sky-400' },
    { label: 'Properties', value: OWNED_PROPERTIES.length.toString(), icon: Landmark, color: 'text-purple-400' },
    { label: 'Pending Actions', value: REMINDERS.filter(r => isBefore(new Date(r.due), addDays(new Date(), 60))).length.toString(), icon: AlertTriangle, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-6 gap-2">
      {kpis.map((k) => (
        <Card key={k.label} className="bg-card/40 border-border/30">
          <CardContent className="p-3 text-center">
            <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
            <p className="text-sm font-bold text-foreground">{k.value}</p>
            <p className="text-[9px] text-muted-foreground">{k.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function OwnershipLifecyclePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/30 bg-gradient-to-br from-background via-card/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--gold-primary)/0.06),transparent_60%)]" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Ownership Lifecycle</h1>
              <p className="text-sm text-muted-foreground">Manage, optimize, and grow your property investments</p>
            </div>
          </div>
          <div className="mt-6">
            <PortfolioKPIs />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="h-9 mb-4">
                <TabsTrigger value="overview" className="text-xs h-8">Overview</TabsTrigger>
                <TabsTrigger value="optimize" className="text-xs h-8">AI Optimization</TabsTrigger>
                <TabsTrigger value="services" className="text-xs h-8">Services</TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs h-8">
                  Reminders
                  <span className="ml-1 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5">
                    {REMINDERS.filter(r => isBefore(new Date(r.due), addDays(new Date(), 60))).length}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-primary" /> Your Properties</h3>
                  {OWNED_PROPERTIES.map((p) => <PropertyValueCard key={p.id} p={p} />)}
                </div>

                {/* Value Appreciation Chart Placeholder */}
                <Card className="bg-card/40 border-border/30">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" /> Portfolio Value Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="h-40 flex items-center justify-center rounded-lg bg-muted/10 border border-border/20">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Value appreciation chart</p>
                        <p className="text-[10px] text-muted-foreground">Updates with real portfolio data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Optimization */}
              <TabsContent value="optimize" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">AI Investment Advisories</h3>
                  </div>
                  <AIAdvisoryPanel />
                </div>
              </TabsContent>

              {/* Services */}
              <TabsContent value="services" className="mt-0 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Quick Service Requests</h3>
                </div>
                <ServiceQuickActions />

                <Card className="bg-card/40 border-border/30">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-medium">Recent Service Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {[
                        { action: 'AC Maintenance', property: 'Riviera 12A', date: '2024-11-15', status: 'Completed' },
                        { action: 'Plumbing Repair', property: 'Villa Harmony', date: '2024-10-02', status: 'Completed' },
                        { action: 'PBB Tax Filing', property: 'Both', date: '2024-06-01', status: 'Completed' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                          <div>
                            <p className="text-xs text-foreground">{s.action}</p>
                            <p className="text-[10px] text-muted-foreground">{s.property} · {format(new Date(s.date), 'dd MMM yyyy')}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-400/30">{s.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reminders */}
              <TabsContent value="reminders" className="mt-0">
                <div className="flex items-center gap-2 mb-3">
                  <BellRing className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Upcoming Reminders</h3>
                </div>
                <RemindersPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Timeline */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Ownership Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <OwnershipTimeline />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> Rental Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {OWNED_PROPERTIES.map((p) => {
                  const annualYield = (p.monthlyRental * 12 / p.currentValue * 100).toFixed(1);
                  return (
                    <div key={p.id}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground truncate mr-2">{p.title}</span>
                        <span className="text-foreground font-mono shrink-0">{annualYield}% yield</span>
                      </div>
                      <Progress value={parseFloat(annualYield) * 10} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Market Heat */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Market Heat Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {OWNED_PROPERTIES.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs text-foreground">{p.city}</p>
                      <p className="text-[10px] text-muted-foreground">{p.title}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${p.marketHeat >= 80 ? 'text-amber-400 border-amber-400/30' : p.marketHeat >= 60 ? 'text-emerald-400 border-emerald-400/30' : 'text-muted-foreground border-border/30'}`}>
                      🔥 {p.marketHeat}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
