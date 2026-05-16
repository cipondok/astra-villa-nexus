import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, Globe, LayoutDashboard, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, BarChart3, MapPin, Network, Eye, RefreshCw, Building } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: $250K Revenue ── */
const revenueChannels = [
  { channel: 'Transaction Commission (2.5%)', target: '$90K/mo', pct: 36, tactics: ['Close 35-45 deals/month across 3-5 cities at avg $250K', 'Deploy deal coordinators per city for negotiation acceleration', 'Implement performance bonuses for agents closing within 10 days'], status: 'Core' },
  { channel: 'Premium & Enterprise Listings', target: '$60K/mo', pct: 24, tactics: ['Scale to 200+ premium vendors at $250-500/mo tiers', 'Launch "Enterprise Agency" packages at $2,000/mo for bulk portfolios', 'Introduce performance-guaranteed packages with inquiry minimums'], status: 'Scale' },
  { channel: 'Developer Project Partnerships', target: '$45K/mo', pct: 18, tactics: ['Maintain 10-15 active developer showcases at $3-5K each', 'Offer quarterly campaign retainers with dedicated account managers', 'Create co-branded investment events driving project visibility'], status: 'Scale' },
  { channel: 'Data Intelligence Products', target: '$30K/mo', pct: 12, tactics: ['Scale agent analytics to 200+ subscribers at $100-150/mo', 'Launch institutional investor terminal at $500-1,000/mo', 'Sell district liquidity reports to developers and funds'], status: 'Growth' },
  { channel: 'Financing & Ecosystem Revenue', target: '$25K/mo', pct: 10, tactics: ['Process 40-50 mortgage referrals/month at $400-600 each', 'Launch insurance referral partnerships', 'Introduce property management service matching fees'], status: 'Growth' },
];

const sprintCadence = [
  { week: 'Week 1', target: '$55K', focus: 'Subscription renewals + developer project activations + early deal push' },
  { week: 'Week 2', target: '$60K', focus: 'Premium upsell blitz + negotiation acceleration across cities' },
  { week: 'Week 3', target: '$65K', focus: 'Flash promotion sprint + enterprise agency onboarding' },
  { week: 'Week 4', target: '$70K', focus: 'Month-end deal closures + data product renewals + commission collection' },
];

const depthExpansion = [
  { lever: 'Vendor Subscription Lock-In', desc: 'Quarterly/annual plans at 15-25% discount increasing MRR predictability', impact: 88 },
  { lever: 'Enterprise Agency Tier', desc: '$2K/mo packages for agencies with 50+ listings — priority everything', impact: 82 },
  { lever: 'Performance-Guaranteed Packages', desc: 'Refund if minimum inquiry count not met — premium pricing confidence', impact: 75 },
  { lever: 'Cross-City Bundle Promotions', desc: 'Vendors listing in 2+ cities get visibility bonuses', impact: 68 },
];

/* ── Section 2: Regional Liquidity ── */
const cityTiers = [
  { tier: 'Tier 1 — Dominant', cities: 'Jakarta, Surabaya', targets: ['500+ active listings', '15+ deals/month/city', '$80K+ revenue/city'], status: 'Established' },
  { tier: 'Tier 2 — Growing', cities: 'Bandung, Bali, Medan', targets: ['200+ active listings', '8-12 deals/month/city', '$30-50K revenue/city'], status: 'Scaling' },
  { tier: 'Tier 3 — Seeding', cities: 'Semarang, Makassar, Yogyakarta', targets: ['50+ active listings', '3-5 deals/month/city', '$5-15K revenue/city'], status: 'Launching' },
];

const crossCityRouting = [
  { mechanism: 'Buyer Opportunity Redirect', desc: 'Surface better-value properties in nearby cities to active buyers', effect: 'Increases cross-city conversion by 15-20%' },
  { mechanism: 'Regional Investment Comparison', desc: 'Side-by-side yield/growth comparisons across cities', effect: 'Guides investor capital to high-opportunity markets' },
  { mechanism: 'Liquidity Heatmap Broadcast', desc: 'Weekly regional activity reports showing demand hotspots', effect: 'Drives vendor listing uploads in high-demand zones' },
  { mechanism: 'Agent Network Cross-Pollination', desc: 'Top agents in one city onboard partner agents in expansion cities', effect: 'Accelerates supply seeding via trusted referrals' },
];

const momentumSignals = [
  { signal: 'City Activity Dashboard', desc: 'Public-facing metrics showing platform dominance per city', purpose: 'Builds vendor and buyer confidence' },
  { signal: 'Regional Deal Velocity Reports', desc: 'Monthly publications showing transaction speed and volume', purpose: 'Reinforces market leadership narrative' },
  { signal: 'Cross-City Success Stories', desc: 'Highlight investors who found opportunities across multiple markets', purpose: 'Encourages multi-city engagement' },
];

/* ── Section 3: Executive KPI Command ── */
const kpiPanels = [
  { panel: 'Revenue Performance', priority: 'P0', metrics: [
    { name: 'Monthly Revenue vs $250K Target', type: 'progress' },
    { name: 'Revenue by City (contribution %)', type: 'breakdown' },
    { name: 'Premium Conversion Rate', type: 'trend' },
    { name: 'MRR (Monthly Recurring Revenue)', type: 'value' },
    { name: 'Revenue per Active Vendor', type: 'value' },
  ]},
  { panel: 'Liquidity & Deal Flow', priority: 'P0', metrics: [
    { name: 'Active Listings (total + growth rate)', type: 'value' },
    { name: 'Viewing Pipeline (scheduled this week)', type: 'value' },
    { name: 'Offer-Stage Deals (count + value)', type: 'value' },
    { name: 'Deal Closure Rate (weekly/monthly)', type: 'trend' },
    { name: 'Avg Negotiation Cycle Duration', type: 'value' },
  ]},
  { panel: 'Expansion Health', priority: 'P1', metrics: [
    { name: 'Per-City Revenue Run Rate', type: 'breakdown' },
    { name: 'New City Activation Milestones', type: 'checklist' },
    { name: 'Cross-City Inquiry Routing Volume', type: 'value' },
    { name: 'Agent Retention Rate per City', type: 'value' },
    { name: 'Supply Density vs Benchmark', type: 'comparison' },
  ]},
  { panel: 'Strategic Risk & Opportunity', priority: 'P1', metrics: [
    { name: 'Supply Shortages (high-demand, low-listing zones)', type: 'alert' },
    { name: 'Declining Inquiry Trends (by district)', type: 'alert' },
    { name: 'Top Expansion Opportunity Signals', type: 'opportunity' },
    { name: 'Competitive Threat Indicators', type: 'alert' },
    { name: 'Revenue Concentration Risk (single city %)', type: 'risk' },
  ]},
];

/* ── Quarterly Monitoring ── */
const quarterlyChecklist = [
  { category: 'Revenue Scale', items: ['$250K monthly run rate achieved or on track', 'Revenue diversification: no channel >40%', 'MRR growth rate >15% quarter-over-quarter', 'Enterprise vendor tier adoption growing', 'Data product revenue >$25K/mo'] },
  { category: 'Regional Network', items: ['3+ cities producing >$30K/mo each', 'Cross-city demand routing active and converting', 'Tier 3 cities hitting seeding milestones on schedule', 'Agent retention >75% across all markets', 'Regional liquidity insights published monthly'] },
  { category: 'Executive Effectiveness', items: ['Decision response speed <24h on escalations', 'Strategic initiative success rate >65%', 'Expansion execution aligned with quarterly plan', 'Revenue forecast accuracy within 15%', 'Team alignment score >80%'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Revenue growth stalls at $150-180K', signal: 'Transaction volume plateau despite listing growth', fix: 'Introduce enterprise tier + performance packages to unlock higher ARPU' },
  { risk: 'Regional expansion dilutes core market', signal: 'Primary city revenue declining while new cities underperform', fix: 'Enforce minimum performance gates before allocating resources to new markets' },
  { risk: 'Premium vendor churn acceleration', signal: 'Renewal rate drops below 60%', fix: 'Implement ROI dashboards + guaranteed-inquiry packages to prove value' },
  { risk: 'Cross-city coordination complexity', signal: 'Inconsistent deal quality across markets', fix: 'Deploy city-level deal coordinators with standardized playbooks' },
  { risk: 'Executive data overload', signal: 'Too many metrics, slow decision-making', fix: 'Reduce command dashboard to 10 critical KPIs with automated alerts' },
];

export default function Revenue250KRegionalLiquidityExecutiveBlueprint() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <DollarSign className="h-7 w-7 text-green-500" />
                <div>
                  <CardTitle className="text-xl">$250K Monthly Revenue + Regional Liquidity Network + Executive Command</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Scale monetization depth, build regional dominance, sharpen executive visibility</p>
                </div>
              </div>
              <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">💰 $250K/mo</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">💰 $250K Plan</TabsTrigger>
          <TabsTrigger value="regional">🌏 Regional Network</TabsTrigger>
          <TabsTrigger value="executive">🎛️ Executive KPIs</TabsTrigger>
          <TabsTrigger value="monitor">📋 Quarterly</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Revenue ── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Revenue Architecture — $250K/Month</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {revenueChannels.map((c, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-semibold text-sm">{c.channel}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{c.target}</Badge>
                        <Badge variant="secondary" className="text-xs">{c.pct}%</Badge>
                        <Badge variant={c.status === 'Core' ? 'default' : 'outline'} className="text-[10px]">{c.status}</Badge>
                      </div>
                    </div>
                    <Progress value={c.pct * 2.5} className="h-1.5" />
                    <div className="grid gap-1">{c.tactics.map((t, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{t}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Weekly Sprint Cadence</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {sprintCadence.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3"><Badge variant="outline" className="text-xs w-16 justify-center">{w.week}</Badge><span className="text-sm">{w.focus}</span></div>
                    <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">{w.target}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Monetization Depth Levers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {depthExpansion.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{d.lever}</span><Badge variant="outline" className="text-xs">Impact: {d.impact}%</Badge></div>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                    <Progress value={d.impact} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Regional Network ── */}
        <TabsContent value="regional" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Regional City Tier Strategy</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {cityTiers.map((t, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div><span className="font-semibold text-sm">{t.tier}</span><p className="text-xs text-muted-foreground">{t.cities}</p></div>
                      <Badge variant={t.status === 'Established' ? 'default' : t.status === 'Scaling' ? 'secondary' : 'outline'} className="text-xs">{t.status}</Badge>
                    </div>
                    <div className="grid gap-1">{t.targets.map((tgt, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{tgt}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Cross-City Demand Routing</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {crossCityRouting.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{r.mechanism}</span>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                    <p className="text-xs text-primary">{r.effect}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Momentum Signaling</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {momentumSignals.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div><span className="text-sm font-medium">{s.signal}</span><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                    <Badge variant="outline" className="text-xs shrink-0 max-w-[140px] text-right">{s.purpose}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Executive KPIs ── */}
        <TabsContent value="executive" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-primary" /> Executive Command Panels</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {kpiPanels.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{p.panel}</span>
                      <Badge variant={p.priority === 'P0' ? 'destructive' : 'secondary'} className="text-[10px]">{p.priority}</Badge>
                    </div>
                    <div className="grid gap-1">{p.metrics.map((m, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2"><Eye className="h-3 w-3 text-primary shrink-0" /><span className="text-muted-foreground">{m.name}</span></div>
                        <Badge variant="outline" className="text-[9px]">{m.type}</Badge>
                      </div>
                    ))}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Quarterly Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {quarterlyChecklist.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{c.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Risks ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {risks.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
                  <div className="text-xs text-muted-foreground"><strong>Signal:</strong> {r.signal}</div>
                  <div className="text-xs"><strong>Fix:</strong> {r.fix}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
