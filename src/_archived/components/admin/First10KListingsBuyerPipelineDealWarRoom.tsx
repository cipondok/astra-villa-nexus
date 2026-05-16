import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Home, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Users, BarChart3, MapPin, Layers, Eye, Handshake, Search } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: 10K Listings ── */
const listingPhases = [
  { phase: 'Phase 1 — First 1,000 Listings', range: '0–1,000', duration: '0–3 months', focus: 'Establish density beachhead', tactics: [
    { tactic: 'Anchor Agency Blitz', detail: 'Identify 30 agencies with 30+ listings each — offer dedicated onboarding support, bulk upload tools, and 30-day free premium visibility' },
    { tactic: 'Bulk Upload Infrastructure', detail: 'Provide CSV/spreadsheet import, WhatsApp-based listing submission, and agent dashboard for portfolio management' },
    { tactic: 'District Concentration', detail: 'Focus 80% of supply in 3-5 highest-demand districts — density creates buyer confidence and discovery momentum' },
    { tactic: 'Quality Gate at Upload', detail: 'Minimum 5 photos, complete pricing, accurate location, and property specs required — reject incomplete submissions with guided correction' },
    { tactic: 'Early Vendor Incentives', detail: 'First 50 agents get 90-day premium visibility free + priority lead routing — creates evangelists and word-of-mouth onboarding' },
  ], kpis: ['200+ listings/month', '>80% quality compliance', '3-5 dense districts'] },
  { phase: 'Phase 2 — Listings 1,000–5,000', range: '1K–5K', duration: '3–9 months', focus: 'Scale supply engine', tactics: [
    { tactic: 'Developer Project Onboarding', detail: 'Sign 10+ active developers with new projects — each contributing 50-200 units as bulk inventory injections' },
    { tactic: 'Multi-City Supply Seeding', detail: 'Expand to 2-3 additional cities using proven anchor agency playbook — 200+ listings per city before demand marketing' },
    { tactic: 'Agent Referral Program', detail: 'Existing agents earn visibility credits for referring new agents who list 10+ properties — viral supply growth' },
    { tactic: 'Listing Refresh Automation', detail: 'Auto-prompt agents to update pricing and photos every 30 days — stale listings reduce platform credibility' },
    { tactic: 'Price Segment Balancing', detail: 'Monitor inventory mix: luxury (15-20%), mid-market (50-60%), affordable (25-30%) — fill gaps with targeted outreach' },
  ], kpis: ['500+ listings/month', '5+ active cities', '>90% listing freshness'] },
  { phase: 'Phase 3 — Listings 5,000–10,000', range: '5K–10K', duration: '9–18 months', focus: 'Achieve national inventory depth', tactics: [
    { tactic: 'National Agency Network', detail: 'Active partnerships with 200+ agencies across 8+ cities — standardized onboarding SLA (<48h to first listing live)' },
    { tactic: 'Exclusive Listing Agreements', detail: 'Offer premium analytics and lead guarantees in exchange for platform-exclusive listings from top 20 agencies' },
    { tactic: 'Automated Quality Scoring', detail: 'AI-powered listing quality score (photos, description, pricing accuracy) — surface high-quality listings, coach low-scoring agents' },
    { tactic: 'Developer Pipeline Integration', detail: 'API or dashboard integration with 20+ developer CRMs for automatic inventory sync as new units become available' },
    { tactic: 'Supply Health Dashboard', detail: 'Real-time monitoring: listings by district, freshness, quality score, engagement rate — identify gaps before they impact buyer experience' },
  ], kpis: ['800+ listings/month', '10+ cities', '>95% quality score'] },
];

const supplyKPIs = [
  { kpi: 'Net Active Listings', target: '10,000', tracking: 'Daily counter: new listings added minus expired/sold' },
  { kpi: 'Listings Growth Rate', target: '800+/month at scale', tracking: 'Weekly net additions with trend line' },
  { kpi: 'Listing Quality Score', target: '>85/100 average', tracking: 'Automated scoring: photos, pricing, completeness, freshness' },
  { kpi: 'Vendor Retention Rate', target: '>75% at 6 months', tracking: 'Agents still actively listing after initial onboarding' },
  { kpi: 'District Coverage Density', target: '>50 listings/district in top 20 zones', tracking: 'Heatmap of inventory concentration' },
  { kpi: 'Listing Freshness', target: '>90% updated within 30 days', tracking: 'Auto-detection of stale listings needing refresh' },
];

/* ── Section 2: Buyer Pipeline ── */
const buyerFunnel = [
  { stage: 'Traffic → Serious Inquiry', icon: Search, conversion: '3-5%', tactics: [
    'Run geo-targeted campaigns in high-transaction districts — emphasize specific property opportunities not generic brand messaging',
    'Partner with 5+ local property investment influencers for authentic listing showcase content',
    'Publish weekly "Top 10 Deals" content across social channels — drive traffic to curated shortlists',
    'SEO-optimized city and district landing pages: "Best investment properties in [District]" — capture organic intent',
    'WhatsApp broadcast to registered buyer database with personalized new listing alerts matching saved preferences',
  ]},
  { stage: 'Inquiry → Viewing Booked', icon: Eye, conversion: '25-35%', tactics: [
    'Auto-respond to inquiries within 5 minutes with property summary, agent contact, and 3 available viewing slots',
    'Score buyer intent: repeat inquiries, financing questions, specific district focus → prioritize for agent follow-up',
    'Segment buyers by timeline: "Buying within 30 days" vs "Exploring" — different follow-up cadence and messaging',
    'Provide comparable property insights in follow-up: "Similar properties in this area sold at X — this one is priced Y"',
    'Offer virtual tour option for out-of-city buyers — reduce friction for long-distance investors',
  ]},
  { stage: 'Viewing → Offer Submitted', icon: Handshake, conversion: '15-25%', tactics: [
    'Post-viewing follow-up within 4 hours: property highlights summary, buyer-fit analysis, and next-step suggestion',
    'Deploy ethical urgency signals: "3 other buyers viewed this property this week" (only when factually accurate)',
    'Provide structured offer guidance: realistic price range, counter-offer expectations, timeline recommendations',
    'Coordinate second viewings within 48h for interested buyers — momentum loss kills conversions after 72h',
    'Facilitate agent-buyer negotiation prep: pricing comparables, financing readiness check, decision timeline agreement',
  ]},
  { stage: 'Offer → Deal Closed', icon: Target, conversion: '40-60%', tactics: [
    'Structured negotiation cadence: initial offer → counter within 48h → final alignment within 7 days',
    'Provide real-time comparable transaction data to both parties — reduces pricing disagreement duration',
    'Assign deal coordinator for offers >$200K — dedicated support for complex negotiations',
    'Auto-detect stalled negotiations (>72h no movement) → trigger escalation: agent call + buyer re-engagement',
    'Post-acceptance: guide through closing steps, documentation, and handover — reduce drop-off before completion',
  ]},
];

const demandKPIs = [
  { kpi: 'Serious Inquiry Ratio', target: '>5% of traffic', description: 'Visitors making qualified inquiries (budget, timeline, location specified)' },
  { kpi: 'Viewing Booking Rate', target: '>30% of inquiries', description: 'Inquiries converting to confirmed viewing appointments' },
  { kpi: 'Viewing-to-Offer Rate', target: '>20%', description: 'Viewings resulting in formal offer submissions' },
  { kpi: 'Offer-to-Close Rate', target: '>50%', description: 'Submitted offers converting to completed deals' },
  { kpi: 'Buyer Pipeline Depth', target: '>500 active prospects', description: 'Buyers in viewing or negotiation stage at any time' },
  { kpi: 'Average Buyer Journey', target: '<21 days', description: 'First inquiry to deal closure duration' },
];

/* ── Section 3: Deal KPI War-Room ── */
const warRoomPanels = [
  { panel: 'Daily Deal Flow', icon: Zap, metrics: [
    { name: 'New Serious Inquiries', description: 'Qualified buyer leads received today across all markets', target: '50+/day' },
    { name: 'Viewings Scheduled', description: 'Confirmed viewing appointments for today and tomorrow', target: '20+/day' },
    { name: 'Offers Submitted', description: 'Formal purchase offers submitted by buyers today', target: '3+/day' },
    { name: 'Deals Closed', description: 'Successfully completed transactions finalized today', target: '1+/day' },
    { name: 'Pipeline Value', description: 'Total value of deals currently in negotiation stage', target: 'Growing weekly' },
  ]},
  { panel: 'Liquidity & Conversion', icon: TrendingUp, metrics: [
    { name: 'Top 5 Performing Districts', description: 'Ranked by inquiry-to-deal conversion rate this week', target: '>15% conversion' },
    { name: 'High-Probability Listings', description: 'Properties with 5+ inquiries and recent viewing activity', target: 'Flag for premium boost' },
    { name: 'Stalled Negotiation Alerts', description: 'Deals with no movement for >48 hours requiring intervention', target: '<5 at any time' },
    { name: 'Supply-Demand Balance', description: 'Districts where demand outpaces supply by >3:1 ratio', target: '<3 critical gaps' },
    { name: 'Agent Response Compliance', description: 'Percentage of agents responding to inquiries within 2h SLA', target: '>85%' },
  ]},
  { panel: 'Revenue & Performance', icon: BarChart3, metrics: [
    { name: 'Revenue Per Deal', description: 'Average platform monetization per closed transaction', target: 'Growing quarterly' },
    { name: 'Premium Upgrade Revenue', description: 'Income from vendor visibility boosts and featured listings', target: '>20% of total revenue' },
    { name: 'Agent Closing Productivity', description: 'Deals closed per active agent per month — identifies top performers', target: '>2 deals/agent/month' },
    { name: 'Deal Cycle Trend', description: 'Average days from inquiry to close — 7-day rolling average', target: 'Decreasing trend' },
    { name: 'Monetization Consistency', description: 'Weekly revenue variance — lower is better for predictability', target: '<15% variance' },
  ]},
];

/* ── Monitoring Checklist ── */
const checklist = [
  { category: 'Supply Health', items: ['Net listings added this week vs target', 'Listing quality score average maintained >85', 'District coverage gaps identified and actioned', 'Vendor retention rate at 6-month mark checked', 'Developer project pipeline reviewed for upcoming inventory'] },
  { category: 'Demand Pipeline', items: ['Serious inquiry volume trend (7-day rolling)', 'Viewing booking rate by district tracked', 'Buyer pipeline depth >500 active prospects', 'Post-viewing follow-up SLA compliance verified', 'Marketing channel ROI assessed and optimized'] },
  { category: 'Deal Velocity', items: ['Daily offer submissions vs target (3+/day)', 'Stalled negotiations count <5 with escalation actioned', 'Deal cycle duration trend decreasing', 'Agent closing productivity ranking updated', 'Revenue per deal opportunity tracked'] },
  { category: 'Platform Balance', items: ['Supply-demand ratio balanced across top districts', 'No single district >30% of total inquiries (concentration risk)', 'Price segment inventory balanced (luxury/mid/affordable)', 'Agent network diversity maintained (no >20% dependency on single agency)', 'Cross-city demand routing effectiveness measured'] },
];

/* ── Risk Indicators ── */
const riskIndicators = [
  { risk: 'Supply-demand mismatch: listings growing in low-demand areas while high-demand districts remain undersupplied', mitigation: 'Weekly supply heatmap review; redirect agent onboarding efforts to high-inquiry districts; pause low-demand zone expansion' },
  { risk: 'Listing quality erosion: rapid growth diluting average listing quality below 80/100 score', mitigation: 'Enforce quality gate at upload; auto-flag listings below 70 for improvement; offer photography and copywriting support to struggling agents' },
  { risk: 'Buyer pipeline leak: high inquiry volume but declining viewing conversion (<20%)', mitigation: 'Audit response time SLA; improve auto-response messaging; test different follow-up cadences; check listing-to-inquiry relevance matching' },
  { risk: 'Agent dependency concentration: >40% of supply from <10 agencies creating fragility', mitigation: 'Diversify agency partnerships; activate referral programs; directly recruit independent agents in underserved districts' },
  { risk: 'Stale inventory buildup: >15% of listings unchanged for 60+ days creating buyer distrust', mitigation: 'Auto-archive listings inactive for 60 days; notify agents 30 days before archival; incentivize price updates with visibility boosts' },
];

export default function First10KListingsBuyerPipelineDealWarRoom() {
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Home className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">First 10,000 Listings + Serious Buyer Pipeline + Deal KPI War-Room</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Supply expansion engine, high-intent demand generation & transaction performance command</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🏠 10K Listings</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="listings">🏠 10K Listings</TabsTrigger>
          <TabsTrigger value="buyers">👥 Buyer Pipeline</TabsTrigger>
          <TabsTrigger value="warroom">🎯 Deal War-Room</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        {/* ── 10K Listings ── */}
        <TabsContent value="listings" className="space-y-4 mt-4">
          {listingPhases.map((m, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{m.phase}</CardTitle>
                    <div className="flex gap-2"><Badge variant="outline" className="text-xs">{m.range}</Badge><Badge variant="secondary" className="text-xs">{m.duration}</Badge></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Focus: {m.focus}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">{m.tactics.map((t, j) => (
                    <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                      <span className="text-sm font-medium">{t.tactic}</span>
                      <p className="text-xs text-muted-foreground">{t.detail}</p>
                    </div>
                  ))}</div>
                  <div className="flex flex-wrap gap-2 pt-1">{m.kpis.map((k, j) => <Badge key={j} variant="outline" className="text-xs">{k}</Badge>)}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Supply KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Tracking</th></tr></thead><tbody>{supplyKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.tracking}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Buyer Pipeline ── */}
        <TabsContent value="buyers" className="space-y-4 mt-4">
          {buyerFunnel.map((s, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" /> {s.stage}</CardTitle>
                    <Badge variant="outline" className="text-xs">Conv: {s.conversion}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2">{s.tactics.map((t, j) => <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{t}</div>)}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(5)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Demand KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{demandKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Deal War-Room ── */}
        <TabsContent value="warroom" className="space-y-4 mt-4">
          {warRoomPanels.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.panel}</CardTitle></CardHeader>
                <CardContent className="grid gap-2">{p.metrics.map((m, j) => (
                  <div key={j} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                    <div className="space-y-0.5"><span className="text-sm font-medium">{m.name}</span><p className="text-xs text-muted-foreground">{m.description}</p></div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{m.target}</Badge>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Checklists ── */}
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

        {/* ── Risks ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {riskIndicators.map((r, i) => (
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
