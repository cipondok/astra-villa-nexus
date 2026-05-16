import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, Globe, LayoutDashboard, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Network, Eye, BarChart3, Shield, Layers } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: $500K Revenue ── */
const revenueChannels = [
  { channel: 'Transaction Commission (2.5–3%)', target: '$180K/mo', pct: 36, tactics: ['Close 70-90 deals/month across 6-8 cities at avg $300K value', 'Deploy dedicated deal coordinators per metro cluster', 'Implement tiered commission (3% for >$500K deals) to maximize high-value closures'], status: 'Core' },
  { channel: 'Enterprise & Premium Listings', target: '$120K/mo', pct: 24, tactics: ['Scale to 400+ premium vendors at $250-600/mo tiered plans', 'Launch "Agency Enterprise" at $3-5K/mo for 100+ listing portfolios', 'Dynamic pricing: 20-40% premium in high-demand districts'], status: 'Scale' },
  { channel: 'Developer Project Campaigns', target: '$85K/mo', pct: 17, tactics: ['Maintain 20-30 active developer showcases at $3-5K each', 'Offer quarterly retainers with performance-guaranteed inquiry volumes', 'Co-branded launch events generating 200+ qualified leads per project'], status: 'Scale' },
  { channel: 'Data Intelligence & Analytics', target: '$65K/mo', pct: 13, tactics: ['Scale institutional terminal to 100+ subscribers at $500-1K/mo', 'Launch developer demand forecasting reports at $2-3K/quarter', 'API access tier for PropTech integrators at $1-2K/mo'], status: 'Growth' },
  { channel: 'Ecosystem & Financing Revenue', target: '$50K/mo', pct: 10, tactics: ['Process 80-100 mortgage referrals/month at $400-600 each', 'Insurance and legal service referral commissions', 'Property management matching fees at scale'], status: 'Growth' },
];

const velocityLevers = [
  { lever: 'Cross-City Buyer Routing Engine', desc: 'Redirect serious buyers to higher-converting opportunities in adjacent cities', impact: 92 },
  { lever: 'Synchronized Urgency Promotions', desc: 'Coordinated flash campaigns across top 3 revenue cities simultaneously', impact: 85 },
  { lever: 'Dynamic Premium District Pricing', desc: 'Auto-adjust listing fees based on real-time inquiry density per zone', impact: 78 },
  { lever: 'Enterprise Lock-In Contracts', desc: 'Annual agreements with top agencies guaranteeing $50K+ recurring revenue', impact: 88 },
  { lever: 'Developer Pipeline Pre-Sales', desc: 'Sell campaign packages 60 days before project launch for predictable revenue', impact: 72 },
];

const sprintCadence = [
  { week: 'Week 1', target: '$110K', focus: 'Enterprise renewals + developer activations + early deal pipeline push' },
  { week: 'Week 2', target: '$120K', focus: 'Premium upsell blitz + cross-city urgency campaigns + negotiation acceleration' },
  { week: 'Week 3', target: '$130K', focus: 'Flash promotions + institutional analytics renewals + new city revenue seeding' },
  { week: 'Week 4', target: '$140K', focus: 'Month-end deal closures + commission collection + data product renewals' },
];

/* ── Section 2: National Liquidity Grid ── */
const gridLayers = [
  { layer: 'Supply Density Grid', desc: 'Dominant listing share in each major metro cluster', components: [
    { name: 'Metro Anchor Partnerships', detail: 'Top 3 agencies per city locked into exclusive/preferred arrangements' },
    { name: 'Developer Portfolio Integration', detail: 'Bulk onboarding of 500+ unit projects with dedicated showcase pages' },
    { name: 'Balanced Inventory Distribution', detail: 'Price segment coverage: luxury (20%), mid-market (50%), affordable (30%)' },
    { name: 'Rapid Listing Refresh Protocol', detail: 'Stale listings flagged at 45 days, auto-deprioritized at 90 days' },
  ]},
  { layer: 'Demand Flow Optimization', desc: 'Route serious buyers to highest-conversion opportunities', components: [
    { name: 'Cross-City Opportunity Matching', detail: 'Buyers searching Jakarta shown comparable opportunities in Surabaya/Bandung' },
    { name: 'Regional Investment Comparison Engine', detail: 'Side-by-side yield/growth/liquidity analysis across 8+ cities' },
    { name: 'Hotspot Discovery Alerts', detail: 'Weekly broadcasts highlighting emerging high-demand zones' },
    { name: 'Seasonal Demand Routing', detail: 'Redirect buyers based on seasonal transaction patterns per region' },
  ]},
  { layer: 'Market Dominance Signaling', desc: 'Reinforce perception as primary national discovery infrastructure', components: [
    { name: 'National Activity Dashboard', detail: 'Public-facing real-time metrics: listings, inquiries, deals per city' },
    { name: 'Transaction Momentum Narratives', detail: 'Monthly publications showing deal velocity and market leadership' },
    { name: 'Institutional Credibility Reports', detail: 'Quarterly market intelligence shared with funds and developers' },
    { name: 'Media & PR Coordination', detail: 'Proactive media placements reinforcing platform dominance narrative' },
  ]},
];

const gridMetrics = [
  { city: 'Jakarta', listings: '2,500+', inquiryVelocity: 'Very High', marketShare: '35%', status: 'Dominant' },
  { city: 'Surabaya', listings: '1,200+', inquiryVelocity: 'High', marketShare: '28%', status: 'Strong' },
  { city: 'Bandung', listings: '800+', inquiryVelocity: 'High', marketShare: '25%', status: 'Growing' },
  { city: 'Bali', listings: '600+', inquiryVelocity: 'Medium-High', marketShare: '22%', status: 'Growing' },
  { city: 'Medan', listings: '400+', inquiryVelocity: 'Medium', marketShare: '18%', status: 'Seeding' },
  { city: 'Semarang', listings: '300+', inquiryVelocity: 'Medium', marketShare: '15%', status: 'Seeding' },
  { city: 'Makassar', listings: '200+', inquiryVelocity: 'Emerging', marketShare: '12%', status: 'Launching' },
  { city: 'Yogyakarta', listings: '150+', inquiryVelocity: 'Emerging', marketShare: '10%', status: 'Launching' },
];

/* ── Section 3: Board Dashboard ── */
const boardPanels = [
  { panel: 'Growth Performance', priority: 'P0', metrics: [
    { name: 'Monthly Revenue vs $500K Target', type: 'progress' },
    { name: 'Revenue by City (% contribution)', type: 'breakdown' },
    { name: 'MRR Growth Rate (month-over-month)', type: 'trend' },
    { name: 'Revenue per Active Vendor', type: 'value' },
    { name: 'Enterprise Subscription ARR', type: 'value' },
    { name: 'Monetization Channel Mix', type: 'pie' },
  ]},
  { panel: 'Liquidity & Market Strength', priority: 'P0', metrics: [
    { name: 'National Active Listings (total + growth)', type: 'value' },
    { name: 'Deal Pipeline Health Score (0-100)', type: 'gauge' },
    { name: 'Cross-City Demand Routing Volume', type: 'value' },
    { name: 'Avg Deal Cycle Duration (days)', type: 'trend' },
    { name: 'Buyer Engagement Depth Index', type: 'value' },
    { name: 'National Inquiry Velocity (weekly)', type: 'trend' },
  ]},
  { panel: 'Capital Allocation Effectiveness', priority: 'P1', metrics: [
    { name: 'CAC by Channel (trend)', type: 'trend' },
    { name: 'LTV:CAC Ratio per City', type: 'comparison' },
    { name: 'Marketing ROI by Campaign Type', type: 'breakdown' },
    { name: 'Contribution Margin per City', type: 'heatmap' },
    { name: 'Burn Rate vs Revenue Growth', type: 'ratio' },
  ]},
  { panel: 'Strategic Risk & Opportunity Radar', priority: 'P1', metrics: [
    { name: 'Revenue Concentration Risk (max city %)', type: 'alert' },
    { name: 'Underperforming Market Alerts', type: 'alert' },
    { name: 'Competitive Threat Indicators', type: 'alert' },
    { name: 'High-Potential Expansion Zones', type: 'opportunity' },
    { name: 'Vendor Churn Early Warning', type: 'risk' },
    { name: 'Operational Efficiency Score', type: 'gauge' },
  ]},
];

/* ── Semi-Annual Monitoring ── */
const semiAnnualChecklist = [
  { category: 'Revenue Scale', items: ['$500K monthly run rate achieved or trajectory confirmed', 'No single channel >35% of total revenue', 'Enterprise ARR exceeding $1M annualized', 'Data product revenue growing >20% quarter-over-quarter', 'Contribution margin positive in 5+ cities'] },
  { category: 'National Grid Health', items: ['6+ cities with >$30K/mo revenue each', 'Cross-city demand routing converting at >8%', 'National listings market share >25% in top metros', 'Developer pipeline: 20+ active project partnerships', 'Agent retention >70% across all markets'] },
  { category: 'Board Confidence', items: ['Revenue forecast accuracy within 10%', 'Strategic initiative completion rate >70%', 'Capital efficiency improving quarter-over-quarter', 'Competitive position strengthening (market share growth)', 'Team scaling aligned with revenue growth'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Revenue plateaus at $300-400K', signal: 'Transaction volume growth slows despite listing expansion', fix: 'Diversify into enterprise data products + dynamic pricing to unlock new revenue layers' },
  { risk: 'National expansion dilutes unit economics', signal: 'New city CAC >3x established markets, slow time-to-revenue', fix: 'Enforce minimum performance gates: 50 listings + 5 deals before scaling investment' },
  { risk: 'Enterprise vendor concentration risk', signal: 'Top 10 vendors contribute >40% of premium revenue', fix: 'Diversify vendor base aggressively; cap single-vendor revenue dependency at 5%' },
  { risk: 'Cross-city routing creates friction', signal: 'Low conversion on redirected leads, buyer complaints', fix: 'Improve matching quality with behavioral scoring; add opt-in preferences' },
  { risk: 'Board misalignment on growth vs profitability', signal: 'Conflicting priorities between burn rate and expansion speed', fix: 'Present quarterly contribution margin analysis per city with clear break-even timelines' },
];

export default function Revenue500KNationalLiquidityBoardBlueprint() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <DollarSign className="h-7 w-7 text-emerald-500" />
                <div>
                  <CardTitle className="text-xl">$500K Monthly Hyper-Scale + National Liquidity Grid + Board Dashboard</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Hyper-growth monetization, coordinated national dominance & board-level strategic visibility</p>
                </div>
              </div>
              <Badge className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">🚀 $500K/mo</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">💰 $500K Engine</TabsTrigger>
          <TabsTrigger value="grid">🌐 National Grid</TabsTrigger>
          <TabsTrigger value="board">🎛️ Board Dashboard</TabsTrigger>
          <TabsTrigger value="monitor">📋 Semi-Annual</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Revenue ── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Revenue Architecture — $500K/Month</CardTitle></CardHeader>
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
                    <div className="grid gap-1">{c.tactics.map((t, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />{t}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Revenue Velocity Levers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {velocityLevers.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{d.lever}</span><Badge variant="outline" className="text-xs">Impact: {d.impact}%</Badge></div>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                    <Progress value={d.impact} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Monthly Sprint Cadence</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {sprintCadence.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3"><Badge variant="outline" className="text-xs w-16 justify-center">{w.week}</Badge><span className="text-sm">{w.focus}</span></div>
                    <Badge className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">{w.target}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── National Grid ── */}
        <TabsContent value="grid" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> National Liquidity Grid Architecture</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {gridLayers.map((l, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-3">
                    <div><span className="font-semibold text-sm">{l.layer}</span><p className="text-xs text-muted-foreground">{l.desc}</p></div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {l.components.map((c, j) => (
                        <div key={j} className="p-2 rounded border bg-background/50 space-y-0.5">
                          <span className="text-xs font-medium">{c.name}</span>
                          <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> City Grid Status</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-2">City</th><th className="text-left p-2">Listings</th><th className="text-left p-2">Inquiry Velocity</th><th className="text-left p-2">Market Share</th><th className="text-left p-2">Status</th>
                    </tr></thead>
                    <tbody>
                      {gridMetrics.map((c, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-2 font-medium">{c.city}</td>
                          <td className="p-2">{c.listings}</td>
                          <td className="p-2">{c.inquiryVelocity}</td>
                          <td className="p-2">{c.marketShare}</td>
                          <td className="p-2"><Badge variant={c.status === 'Dominant' ? 'default' : c.status === 'Strong' ? 'secondary' : 'outline'} className="text-[10px]">{c.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Board Dashboard ── */}
        <TabsContent value="board" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-primary" /> Board-Level Strategic Panels</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {boardPanels.map((p, i) => (
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

        {/* ── Semi-Annual ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {semiAnnualChecklist.map((c, i) => (
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
