import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Users, BarChart3, MapPin, DollarSign, Flame, Search, Share2, Eye, Repeat } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: 100K Traffic ── */
const trafficPhases = [
  { phase: 'Phase 1 — Foundation (0–25K/mo)', duration: '0–4 months', focus: 'SEO + paid foundation', tactics: [
    { tactic: 'District-Level SEO Pages', detail: 'Create 50+ optimized landing pages: "Investasi properti di [District]" — target long-tail keywords with 500-2K monthly searches each' },
    { tactic: 'Google Ads — Intent Campaigns', detail: 'Run search campaigns on "jual rumah [city]", "investasi properti [area]" — $3-5K/month budget, target <$2 CPC for serious buyer keywords' },
    { tactic: 'Weekly Content Publishing', detail: 'Publish 2 articles/week: market insights, investment guides, district profiles — build organic authority over 6+ months' },
    { tactic: 'Google Business + Maps Presence', detail: 'Optimize local business profiles for each active city — capture "near me" property search traffic' },
    { tactic: 'Conversion Landing Optimization', detail: 'Each landing page shows live listing count, recent inquiry activity, and 1-click inquiry form — target >5% inquiry conversion' },
  ], kpis: ['25K visitors/month', '>3% inquiry rate', '<$2 CPC'] },
  { phase: 'Phase 2 — Acceleration (25K–60K/mo)', duration: '4–8 months', focus: 'Social + influencer + viral', tactics: [
    { tactic: 'Property Influencer Partnerships', detail: 'Partner with 10+ local property/investment influencers — monthly listing showcases, market commentary, virtual tours' },
    { tactic: 'Social Media Content Engine', detail: 'Daily Instagram/TikTok: listing spotlights, price comparisons, "Deal of the Day" — drive traffic to district landing pages' },
    { tactic: '"Top 10 Deals This Week" Series', detail: 'Curated weekly email + social post highlighting best opportunities — shareable format encouraging viral distribution' },
    { tactic: 'WhatsApp Community Activation', detail: 'Build investor WhatsApp groups per city (500+ members each) — push new listings and market alerts driving repeat visits' },
    { tactic: 'Referral Traffic Loop', detail: 'Enable easy social sharing of listings with tracking — reward buyers who share listings that generate inquiries' },
  ], kpis: ['60K visitors/month', '>40% organic traffic', '>15% returning visitors'] },
  { phase: 'Phase 3 — Scale (60K–100K/mo)', duration: '8–14 months', focus: 'Compounding + brand authority', tactics: [
    { tactic: 'SEO Content Moat', detail: '200+ indexed pages covering every major district, property type, and investment angle — dominate long-tail property search' },
    { tactic: 'PR & Media Coverage', detail: 'Monthly press releases: market data insights, platform milestones, industry commentary — build brand search volume' },
    { tactic: 'YouTube Property Channel', detail: 'Weekly video tours, market analysis, investor education — YouTube as 2nd search engine for property discovery' },
    { tactic: 'Retargeting Optimization', detail: 'Pixel-based retargeting for visitors who viewed 3+ listings but didn\'t inquire — personalized ads showing viewed properties' },
    { tactic: 'Cross-City Traffic Routing', detail: 'Visitors searching in one city shown opportunities in adjacent markets — increase pages per session and discovery breadth' },
  ], kpis: ['100K visitors/month', '>50% organic', '>5% inquiry conversion'] },
];

const trafficKPIs = [
  { kpi: 'Monthly Unique Visitors', target: '100,000', tracking: 'Weekly trend with source breakdown' },
  { kpi: 'Inquiry Conversion Rate', target: '>5%', tracking: 'Visitors making qualified inquiries' },
  { kpi: 'Organic Traffic Share', target: '>50%', tracking: 'Non-paid traffic percentage' },
  { kpi: 'Returning Visitor Ratio', target: '>20%', tracking: 'Repeat visits within 30 days' },
  { kpi: 'Cost Per Qualified Lead', target: '<$5', tracking: 'Paid spend / serious inquiries' },
  { kpi: 'Pages Per Session', target: '>3.5', tracking: 'Average browsing depth' },
];

/* ── Section 2: Vendor Monetization Flywheel ── */
const flywheelStages = [
  { stage: 'Value Demonstration', icon: Eye, description: 'Show vendors the ROI of premium visibility before asking for payment', tactics: [
    'Provide free 7-day premium trial to new vendors — track and display inquiry uplift (typically 3-5x)',
    'Send weekly "Listing Performance Report" to all vendors: views, inquiries, saves vs district average',
    'Highlight case studies: "Agent X upgraded to premium → 4x inquiries → 2 deals closed in 14 days"',
    'Show real-time demand signals: "Your listing area has 50+ active buyers searching this week"',
    'Compare vendor\'s listing performance to top-performing listings in same district — create aspiration gap',
  ]},
  { stage: 'Premium Conversion', icon: Zap, description: 'Convert demonstrated value into paid upgrades', tactics: [
    'Offer time-bound upgrade incentives: "Upgrade this week → 30% off first month" with countdown timer',
    'Trigger upgrade prompts when listings hit engagement thresholds: 10+ views but <2 inquiries → "Boost visibility"',
    'Create 3-tier premium packages: Boost ($15/listing/month), Pro ($40/5 listings), Agency ($100/unlimited)',
    'Enable 1-click upgrade directly from listing performance dashboard — minimize friction',
    'Provide instant preview: "Your listing will appear here after upgrade" with mock search result positioning',
  ]},
  { stage: 'Subscription Lock-In', icon: Repeat, description: 'Convert one-time upgrades into recurring subscriptions', tactics: [
    'Offer 20% discount for quarterly commitment vs monthly — anchor on annual savings messaging',
    'Bundle analytics dashboard access, priority lead routing, and featured placement into subscription tiers',
    'Auto-renew with 7-day notice — make cancellation possible but highlight what they\'ll lose (lead priority, analytics)',
    'Introduce "Portfolio Plan": agencies with 20+ listings get custom pricing with dedicated account support',
    'Quarterly business review calls for top-tier subscribers: performance insights, optimization suggestions, upsell opportunities',
  ]},
  { stage: 'Revenue Flywheel Reinforcement', icon: TrendingUp, description: 'Use success data to fuel more upgrades', tactics: [
    'Publish monthly "Premium Impact Report": average inquiry uplift, deal conversion improvement, ROI data',
    'Reward top-performing premium vendors with additional visibility perks (homepage featured, social media spotlight)',
    'Activate seasonal campaigns: "Ramadan Property Rush", "Year-End Investment Sprint" — time-bound premium bundles',
    'Send proactive upgrade recommendations when market conditions favor vendor\'s listing area',
    'Create vendor loyalty program: points per month subscribed → redeemable for additional visibility or analytics features',
  ]},
];

const monetizationKPIs = [
  { kpi: 'Revenue Per Active Vendor', target: '$25+/month avg', description: 'Total vendor revenue / active vendors' },
  { kpi: 'Premium Upgrade Conversion', target: '>15% of vendors', description: 'Free vendors converting to any paid tier' },
  { kpi: 'Subscription Retention', target: '>80% at 3 months', description: 'Premium subscribers still active after 90 days' },
  { kpi: 'ARPU Growth Rate', target: '>10% quarterly', description: 'Average revenue per user quarter-over-quarter increase' },
  { kpi: 'Upsell Rate', target: '>25%', description: 'Lower-tier subscribers upgrading to higher tiers' },
  { kpi: 'Vendor MRR', target: 'Growing monthly', description: 'Monthly recurring revenue from vendor subscriptions' },
];

/* ── Section 3: Liquidity Heatmap ── */
const heatmapLayers = [
  { layer: 'Signal Aggregation Engine', icon: BarChart3, components: [
    { name: 'Inquiry Volume Concentration', spec: 'Real-time count of buyer inquiries per district — normalized by listing count for fair comparison across zones' },
    { name: 'Viewing Activity Clusters', spec: 'Map scheduled and completed viewings by location — identify districts with highest physical buyer activity' },
    { name: 'Pricing Movement Trends', spec: 'Track asking price changes: districts with rising prices = demand pressure, falling = oversupply signal' },
    { name: 'Transaction Velocity', spec: 'Average days-on-market by district — faster turnover indicates higher liquidity' },
    { name: 'Search Volume Patterns', spec: 'Aggregate platform search queries by location — detect emerging interest before it shows in inquiries' },
  ]},
  { layer: 'Heatmap Visualization', icon: MapPin, components: [
    { name: 'Hot Zones (Red)', spec: 'High inquiry density + fast turnover + rising prices — strong buyer competition, premium pricing opportunity' },
    { name: 'Emerging Zones (Orange)', spec: 'Growing inquiry trends + new listing activity — early momentum, ideal for supply seeding' },
    { name: 'Stable Zones (Green)', spec: 'Consistent activity + balanced supply-demand — reliable transaction zones' },
    { name: 'Supply Shortage Overlay', spec: 'Districts where inquiry-to-listing ratio exceeds 5:1 — urgent vendor outreach required' },
    { name: 'Investment Momentum Arrows', spec: 'Directional indicators showing capital flow trends — help investors identify emerging opportunity corridors' },
  ]},
  { layer: 'Behavioral Activation', icon: Users, components: [
    { name: 'Vendor Supply Guidance', spec: '"List in [Hot Zone] — 3x more inquiries than average" — nudge vendors to upload in high-demand areas' },
    { name: 'Buyer Discovery Nudges', spec: '"Explore [Emerging Zone] — prices 20% below neighboring hot zone" — guide buyers to undervalued areas' },
    { name: 'Pricing Alignment Signals', spec: 'Show vendors how their listing price compares to recent transactions — encourage competitive pricing' },
    { name: 'Agent Territory Insights', spec: 'Performance benchmarks per district — help agents focus effort on highest-conversion zones' },
    { name: 'Investment Opportunity Alerts', spec: 'Auto-notify registered investors when a district crosses from "emerging" to "hot" status' },
  ]},
];

const heatmapKPIs = [
  { kpi: 'Heatmap Tool Engagement', target: '>30% of active users', description: 'Users interacting with liquidity intelligence weekly' },
  { kpi: 'Hot Zone Listing Growth', target: '>20% month-over-month', description: 'New listings added in identified high-demand districts' },
  { kpi: 'Deal Cycle in Hot Zones', target: '<14 days', description: 'Average transaction speed in highest-liquidity districts' },
  { kpi: 'Supply Gap Resolution', target: '<7 days', description: 'Time to vendor outreach after shortage detection' },
  { kpi: 'Pricing Alignment Rate', target: '>60%', description: 'Vendors adjusting prices after viewing market intelligence' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Traffic Growth', items: ['Monthly visitor count vs 100K target', 'Organic traffic share >50%', 'Inquiry conversion rate >5%', 'SEO page index coverage reviewed', 'Paid campaign ROI assessed and optimized'] },
  { category: 'Vendor Revenue', items: ['Premium conversion rate tracked', 'Subscription retention at 3-month mark', 'ARPU growth quarter-over-quarter', 'Vendor performance reports sent weekly', 'Seasonal campaign calendar maintained'] },
  { category: 'Liquidity Intelligence', items: ['Heatmap data freshness <24h', 'Supply shortage alerts actioned within 7 days', 'Hot/emerging zone classifications updated weekly', 'Vendor nudge campaigns activated for gap zones', 'Investment opportunity alerts engagement tracked'] },
  { category: 'Platform Balance', items: ['Traffic quality: inquiry rate not declining with volume growth', 'Vendor satisfaction: premium renewal rate stable', 'Geographic diversity: no single city >60% of traffic', 'Content pipeline: 2+ articles/week maintained', 'Referral loop health: sharing rate growing'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Traffic vanity growth: visitor count rising but inquiry conversion rate declining below 3%', mitigation: 'Audit traffic sources for quality; reduce spend on low-intent channels; increase investment in SEO and referral loops' },
  { risk: 'Vendor monetization fatigue: premium conversion rate declining after initial early-adopter wave', mitigation: 'Refresh value demonstration data; introduce new premium features; test different pricing tiers; launch seasonal promotions' },
  { risk: 'Heatmap data staleness: liquidity signals lagging >48h behind real market activity', mitigation: 'Increase data refresh frequency; add real-time inquiry signal streaming; implement anomaly detection for stale zones' },
  { risk: 'Geographic concentration: >70% of traffic and listings concentrated in single city', mitigation: 'Launch localized SEO and marketing for secondary cities; incentivize vendor onboarding in underserved markets' },
  { risk: 'Premium-free gap widening: free listings getting zero visibility creating vendor churn', mitigation: 'Ensure baseline visibility for all listings; premium = boost, not gatekeeping; maintain fair organic discovery for non-paying vendors' },
];

export default function Traffic100KVendorFlywheelLiquidityHeatmap() {
  const [activeTab, setActiveTab] = useState('traffic');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">100K Visitor Traffic + Vendor Monetization Flywheel + Liquidity Heatmap</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Traffic acquisition engine, recurring vendor revenue & intelligent liquidity visibility</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">📈 100K Traffic</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="traffic">📈 100K Traffic</TabsTrigger>
          <TabsTrigger value="flywheel">💰 Vendor Flywheel</TabsTrigger>
          <TabsTrigger value="heatmap">🗺️ Liquidity Map</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4 mt-4">
          {trafficPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{p.phase}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{p.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Focus: {p.focus}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">{p.tactics.map((t, j) => (
                    <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                      <span className="text-sm font-medium">{t.tactic}</span>
                      <p className="text-xs text-muted-foreground">{t.detail}</p>
                    </div>
                  ))}</div>
                  <div className="flex flex-wrap gap-2 pt-1">{p.kpis.map((k, j) => <Badge key={j} variant="outline" className="text-xs">{k}</Badge>)}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Traffic KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Tracking</th></tr></thead><tbody>{trafficKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.tracking}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="flywheel" className="space-y-4 mt-4">
          {flywheelStages.map((s, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" /> {s.stage}</CardTitle>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{s.tactics.map((t, j) => <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{t}</div>)}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(5)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Monetization KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{monetizationKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4 mt-4">
          {heatmapLayers.map((l, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><l.icon className="h-4 w-4 text-primary" /> {l.layer}</CardTitle></CardHeader>
                <CardContent className="grid gap-2">{l.components.map((c, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{c.name}</span>
                    <p className="text-xs text-muted-foreground">{c.spec}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Heatmap KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{heatmapKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4 mt-4">
          {checklist.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{c.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4 mt-4">
          {risks.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
                  <div className="text-xs"><strong>Mitigation:</strong> {r.mitigation}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
