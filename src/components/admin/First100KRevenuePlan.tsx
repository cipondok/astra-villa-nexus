import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Target, TrendingUp, Building, Users, Zap,
  BarChart3, AlertTriangle, ArrowUpRight, CheckCircle,
  Rocket, Clock, Star, ShieldAlert, Flame, Package,
  Award, Layers, Activity, Gauge
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Revenue Projection Data ─────────────────────────────────────────────────
const weeklyRevenue = [
  { week: "W1", boost: 800, vendor: 200, unlock: 150, promo: 100, total: 1250 },
  { week: "W2", boost: 1400, vendor: 400, unlock: 300, promo: 200, total: 2300 },
  { week: "W3", boost: 2200, vendor: 800, unlock: 500, promo: 350, total: 3850 },
  { week: "W4", boost: 3000, vendor: 1200, unlock: 800, promo: 500, total: 5500 },
  { week: "W5", boost: 3800, vendor: 1800, unlock: 1100, promo: 700, total: 7400 },
  { week: "W6", boost: 4500, vendor: 2500, unlock: 1400, promo: 900, total: 9300 },
  { week: "W7", boost: 5200, vendor: 3200, unlock: 1800, promo: 1100, total: 11300 },
  { week: "W8", boost: 6000, vendor: 4000, unlock: 2200, promo: 1300, total: 13500 },
  { week: "W9", boost: 6800, vendor: 4800, unlock: 2600, promo: 1500, total: 15700 },
  { week: "W10", boost: 7500, vendor: 5500, unlock: 3000, promo: 1700, total: 17700 },
  { week: "W11", boost: 8200, vendor: 6200, unlock: 3400, promo: 1900, total: 19700 },
  { week: "W12", boost: 9000, vendor: 7000, unlock: 3800, promo: 2100, total: 21900 },
  { week: "W13", boost: 9500, vendor: 7500, unlock: 4200, promo: 2300, total: 23500 },
  { week: "W14", boost: 10000, vendor: 8000, unlock: 4500, promo: 2500, total: 25000 },
];

const dailyTargets = [
  { label: "Boost Sales", daily: "$357", monthly: "$10,000", pct: 40 },
  { label: "Vendor Subscriptions", daily: "$286", monthly: "$8,000", pct: 32 },
  { label: "Investor Unlocks", daily: "$161", monthly: "$4,500", pct: 18 },
  { label: "Featured Promos", daily: "$89", monthly: "$2,500", pct: 10 },
];

const liquidityFoundation = [
  { metric: "Active Listings", target: "2,500+", current: "1,247", pct: 50, icon: Building },
  { metric: "Active Vendors", target: "150+", current: "84", pct: 56, icon: Users },
  { metric: "Daily Inquiries", target: "200+", current: "89", pct: 45, icon: Activity },
  { metric: "Response Rate", target: "85%+", current: "72%", pct: 85, icon: Gauge },
  { metric: "Inquiry-to-View", target: "35%+", current: "28%", pct: 80, icon: TrendingUp },
  { metric: "View-to-Deal", target: "8%+", current: "5.2%", pct: 65, icon: Target },
];

const riskFactors = [
  { risk: "Vendor response rate below 80%", impact: "High", mitigation: "Automated nudges + SLA enforcement with visibility penalties" },
  { risk: "Listing quality inconsistency", impact: "High", mitigation: "AI quality scoring gate — block low-score listings from boost eligibility" },
  { risk: "Investor inquiry fatigue", impact: "Medium", mitigation: "Curated deal batches max 3/week + exclusivity framing" },
  { risk: "Price resistance on boosts", impact: "Medium", mitigation: "A/B test pricing tiers + bundle discounts for multi-listing boosts" },
  { risk: "Seasonal demand fluctuation", impact: "Low", mitigation: "Counter-seasonal promotions + investor urgency messaging" },
];

// ─── Checklist Data ──────────────────────────────────────────────────────────
interface CheckItem { label: string; done: boolean; }
interface CheckCategory { title: string; icon: React.ElementType; color: string; items: CheckItem[]; }

const initialChecklists: CheckCategory[] = [
  {
    title: "Supply Growth Actions", icon: Building, color: "text-primary",
    items: [
      { label: "Onboard 10 vendors/week via direct outreach (Bandung/Jakarta)", done: false },
      { label: "Seed 50+ new listings/week through vendor activation campaigns", done: false },
      { label: "Activate exclusivity anchoring pitch for top-tier vendors", done: false },
      { label: "Deploy AI listing quality gate — minimum score 7/10 for visibility", done: false },
      { label: "Launch vendor referral bonus program (Rp 500K per qualified referral)", done: false },
      { label: "Target 3 developer partnerships for bulk inventory injection", done: false },
      { label: "Implement automated listing refresh reminders every 14 days", done: false },
    ],
  },
  {
    title: "Demand Generation Actions", icon: Users, color: "text-emerald-500",
    items: [
      { label: "Run geo-targeted investor acquisition campaigns (CAC target: Rp 95K)", done: false },
      { label: "Send curated deal alerts to segmented investor lists 3x/week", done: false },
      { label: "Activate urgency messaging for high-demand district listings", done: false },
      { label: "Launch 'Hot Deals' AI-ranked feed with scarcity countdown timers", done: false },
      { label: "Deploy social proof notifications (X investors viewing this property)", done: false },
      { label: "Create district investment intelligence reports for content marketing", done: false },
      { label: "Activate referral program — Rp 250K credit per qualified investor referral", done: false },
    ],
  },
  {
    title: "Monetization Control Actions", icon: DollarSign, color: "text-amber-400",
    items: [
      { label: "Launch 3-tier boost pricing: Standard (Rp 1.5M), Premium (Rp 5M), Elite (Rp 15M)", done: false },
      { label: "Activate dynamic boost pricing — surge 20% in districts with demand/supply >2.5x", done: false },
      { label: "Launch vendor premium subscription: Rp 2.5M/month for visibility + analytics", done: false },
      { label: "Implement investor deal unlock pricing: Rp 150K-500K per exclusive deal access", done: false },
      { label: "Create featured promotional slots: Rp 3M/week for homepage carousel placement", done: false },
      { label: "Bundle discounts: 3-listing boost pack at 15% discount to increase AOV", done: false },
      { label: "Activate scarcity countdown on premium slots — '3 of 10 remaining'", done: false },
    ],
  },
  {
    title: "Conversion Optimization Actions", icon: Target, color: "text-cyan-400",
    items: [
      { label: "A/B test boost pricing page: anchor high then discount vs flat pricing", done: false },
      { label: "Implement charm pricing (Rp 1,499K vs Rp 1,500K) on all tiers", done: false },
      { label: "Add social proof to boost purchase: '47 vendors boosted this week'", done: false },
      { label: "Test urgency banner: 'Demand spike in your area — boost now for 3x visibility'", done: false },
      { label: "Automate vendor upgrade prompt when performance score crosses 80%", done: false },
      { label: "Deploy exit-intent popup with limited-time boost discount for abandoners", done: false },
      { label: "Track and optimize funnel: Listing → Boost CTA view → Purchase → Result", done: false },
    ],
  },
];

// ─── Weekly Tactics ──────────────────────────────────────────────────────────
const weeklyTactics = [
  { week: "Week 1-2", phase: "Foundation", focus: "Supply seeding & pricing setup", actions: ["Launch boost tier pricing", "Onboard 20 vendors", "Seed 100 quality listings", "Set up conversion tracking"] },
  { week: "Week 3-4", phase: "Activation", focus: "First revenue & demand ignition", actions: ["Activate investor campaigns", "First boost sales push", "Launch vendor subscription pilot", "A/B test pricing psychology"] },
  { week: "Week 5-6", phase: "Acceleration", focus: "Surge pricing & urgency", actions: ["Enable dynamic pricing", "Activate scarcity messaging", "Launch featured promo slots", "Scale vendor upgrades"] },
  { week: "Week 7-8", phase: "Optimization", focus: "Conversion refinement", actions: ["Optimize boost funnel", "Bundle discount launch", "Investor unlock expansion", "Vendor referral program"] },
  { week: "Week 9-10", phase: "Scale", focus: "Revenue compounding", actions: ["Premium vendor tier launch", "Developer partnership deals", "Multi-listing boost packs", "Revenue surge campaigns"] },
  { week: "Week 11-12", phase: "Momentum", focus: "Sustain & protect", actions: ["Churn prevention activation", "Loyalty pricing for repeat buyers", "Expand to adjacent districts", "Revenue leak detection"] },
  { week: "Week 13-14", phase: "Target", focus: "$25K/week velocity", actions: ["Full pricing optimization", "Cross-sell all revenue streams", "Automate re-boost reminders", "Lock $100K monthly run rate"] },
];

// ─── Component ────────────────────────────────────────────────────────────────
const First100KRevenuePlan = () => {
  const [checklists, setChecklists] = useState(initialChecklists);

  const toggleItem = (catIdx: number, itemIdx: number) => {
    setChecklists(prev => prev.map((cat, ci) =>
      ci === catIdx ? { ...cat, items: cat.items.map((it, ii) => ii === itemIdx ? { ...it, done: !it.done } : it) } : cat
    ));
  };

  const totalItems = checklists.reduce((s, c) => s + c.items.length, 0);
  const doneItems = checklists.reduce((s, c) => s + c.items.filter(i => i.done).length, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            First $100K Monthly Revenue Plan
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            14-week tactical execution plan — liquidity foundation, revenue levers, weekly tactics & conversion optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs gap-1 h-6">
            <Target className="h-3 w-3" /> Target: $100K/month
          </Badge>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Checklist</p>
            <p className="text-sm font-bold text-foreground">{doneItems}/{totalItems}</p>
          </div>
          <div className="w-20">
            <Progress value={pct} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {dailyTargets.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 bg-card/60 backdrop-blur p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground uppercase">{t.label}</span>
                <Badge variant="outline" className="text-[10px] h-4">{t.pct}%</Badge>
              </div>
              <p className="text-lg font-bold text-foreground">{t.monthly}</p>
              <p className="text-xs text-muted-foreground">{t.daily}/day target</p>
              <Progress value={t.pct} className="h-1 mt-1.5" />
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="foundation" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="foundation" className="text-xs">Liquidity Foundation</TabsTrigger>
          <TabsTrigger value="projection" className="text-xs">Revenue Projection</TabsTrigger>
          <TabsTrigger value="tactics" className="text-xs">Weekly Tactics</TabsTrigger>
          <TabsTrigger value="checklists" className="text-xs">Execution Checklists</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Risk Factors</TabsTrigger>
        </TabsList>

        {/* ─── Liquidity Foundation ─── */}
        <TabsContent value="foundation" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {liquidityFoundation.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/40 bg-card/60 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <f.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{f.metric}</span>
                  </div>
                  <div className="flex items-end justify-between mb-1.5">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-lg font-bold text-foreground">{f.current}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-lg font-bold text-primary">{f.target}</p>
                    </div>
                  </div>
                  <Progress value={f.pct} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{f.pct}% to target</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Liquidity Threshold for $100K Revenue
            </p>
            <p className="text-xs text-muted-foreground">
              Minimum marketplace liquidity requires 2,500+ active listings, 150+ active vendors with 85%+ response rate,
              200+ daily inquiries, and 35%+ inquiry-to-viewing conversion. Revenue monetization becomes sustainable when
              supply density supports 8%+ view-to-deal conversion across at least 5 high-demand districts.
            </p>
          </Card>
        </TabsContent>

        {/* ─── Revenue Projection ─── */}
        <TabsContent value="projection" className="space-y-4">
          <Card className="border-border/40 bg-card/60 p-4">
            <CardTitle className="text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Weekly Revenue Ramp — 14-Week Trajectory
            </CardTitle>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--popover-foreground))" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                />
                <Area type="monotone" dataKey="boost" stackId="1" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" strokeWidth={1.5} name="Boost Sales" />
                <Area type="monotone" dataKey="vendor" stackId="1" fill="hsl(220 70% 55%)" fillOpacity={0.25} stroke="hsl(220 70% 55%)" strokeWidth={1.5} name="Vendor Subs" />
                <Area type="monotone" dataKey="unlock" stackId="1" fill="hsl(160 60% 45%)" fillOpacity={0.2} stroke="hsl(160 60% 45%)" strokeWidth={1.5} name="Investor Unlocks" />
                <Area type="monotone" dataKey="promo" stackId="1" fill="hsl(40 80% 55%)" fillOpacity={0.2} stroke="hsl(40 80% 55%)" strokeWidth={1.5} name="Featured Promos" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Week 1 Revenue", value: "$1,250", sub: "Foundation phase" },
              { label: "Week 7 Revenue", value: "$11,300", sub: "Optimization phase" },
              { label: "Week 14 Revenue", value: "$25,000", sub: "Target velocity" },
              { label: "Cumulative 14W", value: "$175,850", sub: "Total earned" },
            ].map((m, i) => (
              <Card key={i} className="border-border/40 bg-card/60 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.sub}</p>
              </Card>
            ))}
          </div>

          <Card className="border-border/40 bg-card/60 p-4">
            <CardTitle className="text-sm mb-3">Conversion Assumptions</CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { label: "Boost Purchase Rate", value: "4.5% of active listings/week" },
                { label: "Vendor Upgrade Rate", value: "12% of free vendors/month" },
                { label: "Unlock Conversion", value: "8% of active investors/month" },
                { label: "Promo Fill Rate", value: "70% of available slots" },
              ].map((a, i) => (
                <div key={i} className="p-2 rounded bg-muted/20 border border-border/20">
                  <p className="text-muted-foreground mb-0.5">{a.label}</p>
                  <p className="font-medium text-foreground">{a.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Weekly Tactics ─── */}
        <TabsContent value="tactics" className="space-y-3">
          {weeklyTactics.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-border/40 bg-card/60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-[10px] shrink-0">{w.week}</Badge>
                    <span className="text-sm font-bold text-foreground">{w.phase}</span>
                    <span className="text-xs text-muted-foreground">— {w.focus}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {w.actions.map((a, ai) => (
                      <div key={ai} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ─── Execution Checklists ─── */}
        <TabsContent value="checklists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklists.map((cat, ci) => {
              const catDone = cat.items.filter(i => i.done).length;
              const catPct = Math.round((catDone / cat.items.length) * 100);
              return (
                <Card key={ci} className="border-border/40 bg-card/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        {cat.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{catDone}/{cat.items.length}</span>
                        <Progress value={catPct} className="h-1 w-12" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {cat.items.map((item, ii) => (
                      <label key={ii} className="flex items-start gap-2 cursor-pointer group">
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={() => toggleItem(ci, ii)}
                          className="h-3.5 w-3.5 mt-0.5"
                        />
                        <span className={`text-xs leading-relaxed ${item.done ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Risk Factors ─── */}
        <TabsContent value="risks" className="space-y-3">
          {riskFactors.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/40 bg-card/60">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${r.impact === "High" ? "text-destructive" : r.impact === "Medium" ? "text-amber-400" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{r.risk}</p>
                        <Badge className={`text-[10px] h-4 ${r.impact === "High" ? "bg-destructive/15 text-destructive" : r.impact === "Medium" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                          {r.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Mitigation:</span> {r.mitigation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default First100KRevenuePlan;
