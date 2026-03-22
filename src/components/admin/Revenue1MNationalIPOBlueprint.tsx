import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Eye, Layers, Building, Shield, BarChart3, Landmark, Crown } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: $1M Revenue ── */
const revenueChannels = [
  { channel: 'Transaction Commission (2.5–3.5%)', target: '$350K/mo', pct: 35, tactics: ['Close 120-150 deals/month across 8-10 cities at avg $350K', 'Tiered commission: 3.5% for luxury deals >$1M driving high-value focus', 'Regional deal coordination teams with 48-hour closure SLAs'], status: 'Core' },
  { channel: 'Enterprise & Premium Listings', target: '$250K/mo', pct: 25, tactics: ['800+ premium vendors across tiered plans ($300-$2K/mo)', 'Enterprise Agency contracts: 50+ agencies at $3-5K/mo with performance guarantees', 'Dynamic district-level pricing with 30-50% surge premiums in hot zones'], status: 'Scale' },
  { channel: 'Developer Mega-Project Programs', target: '$170K/mo', pct: 17, tactics: ['40-60 active developer showcases at $3-5K each', 'Quarterly campaign retainers with dedicated account managers per developer', 'Co-branded launch events generating 500+ qualified leads per project'], status: 'Scale' },
  { channel: 'Data Intelligence & Analytics', target: '$130K/mo', pct: 13, tactics: ['Institutional terminal: 200+ subscribers at $500-1.5K/mo', 'Developer demand forecasting API at $2-5K/quarter', 'City-level liquidity indices licensed to funds and banks'], status: 'Growth' },
  { channel: 'Ecosystem Revenue (Finance/Legal/PM)', target: '$100K/mo', pct: 10, tactics: ['150+ mortgage referrals/month at $400-600 each', 'Legal and notary service matching commissions', 'Property management and insurance referral layer at scale'], status: 'Growth' },
];

const nationalSprints = [
  { phase: 'Week 1-2', target: '$450K', focus: 'Enterprise renewals + developer activations + Tier 1 city deal acceleration' },
  { phase: 'Week 2-3', target: '$300K', focus: 'National flash promotions + cross-city routing campaigns + Tier 2 city push' },
  { phase: 'Week 3-4', target: '$250K', focus: 'Month-end closures + data product renewals + new city revenue seeding' },
];

const dominationLevers = [
  { lever: 'National Synchronized Promotions', desc: 'Coordinated urgency campaigns across all 8+ cities simultaneously for maximum deal velocity', impact: 95 },
  { lever: 'Enterprise Lock-In Contracts (Annual)', desc: '$50-100K annual agreements with top 20 agencies guaranteeing predictable MRR', impact: 92 },
  { lever: 'Developer Pipeline Pre-Sales', desc: 'Sell campaign packages 90 days before project launch, securing $500K+ in forward revenue', impact: 88 },
  { lever: 'Dynamic District Premium Pricing', desc: 'Auto-adjust listing fees in real-time based on inquiry density — capture 30-50% more in hot zones', impact: 85 },
  { lever: 'Institutional Data Licensing', desc: 'Annual contracts with funds/banks for proprietary market intelligence access', impact: 80 },
];

/* ── Section 2: Institutional Capital ── */
const capitalTiers = [
  { tier: 'Tier 1 — Strategic Anchors', segment: 'Sovereign Wealth & Pension Funds', engagement: ['Quarterly market intelligence briefings', 'Co-branded research publications', 'Priority access to mega-project deal flow'], volume: '$50M+ influenced/quarter', status: 'Building' },
  { tier: 'Tier 2 — Active Deployers', segment: 'Property Investment Funds & Family Offices', engagement: ['Monthly curated deal pipeline reports', 'Bulk transaction facilitation support', 'Performance analytics dashboards'], volume: '$20-50M influenced/quarter', status: 'Active' },
  { tier: 'Tier 3 — Growth Partners', segment: 'Developer JV Partners & REIT Teams', engagement: ['Project-level demand forecasting', 'Co-investment opportunity matching', 'Market entry advisory support'], volume: '$10-20M influenced/quarter', status: 'Active' },
  { tier: 'Tier 4 — Network Amplifiers', segment: 'HNW Syndicates & Angel Networks', engagement: ['Curated investment opportunity alerts', 'Fractional ownership access', 'Community events and networking'], volume: '$5-10M influenced/quarter', status: 'Scaling' },
];

const capitalGovernance = [
  { mechanism: 'Executive Outreach Cadence', desc: 'Quarterly face-to-face + monthly written updates for Tier 1-2 partners', metric: 'Meeting completion rate >90%' },
  { mechanism: 'Institutional Performance Reporting', desc: 'Standardized quarterly reports: deal flow, returns, market positioning', metric: 'Report delivery within 15 days of quarter close' },
  { mechanism: 'Co-Investment Pipeline Curation', desc: 'Pre-vetted deal packages with standardized data sheets for rapid evaluation', metric: '10+ institutional-grade deals/quarter' },
  { mechanism: 'Transparency & Analytics Portal', desc: 'Self-service dashboard for institutional partners showing real-time market data', metric: 'Portal DAU >50 institutional users' },
];

/* ── Section 3: IPO Metrics ── */
const ipoPanels = [
  { panel: 'Financial Strength', priority: 'P0', metrics: [
    { name: 'Revenue Growth Rate (YoY)', target: '>80% YoY', type: 'trend' },
    { name: 'Monthly Recurring Revenue (MRR)', target: '>$400K MRR', type: 'value' },
    { name: 'Gross Margin', target: '>65%', type: 'trend' },
    { name: 'Contribution Margin by Region', target: 'Positive in 6+ cities', type: 'heatmap' },
    { name: 'Net Revenue Retention (NRR)', target: '>120%', type: 'value' },
    { name: 'Rule of 40 Score', target: '>40', type: 'gauge' },
  ]},
  { panel: 'Market Leadership', priority: 'P0', metrics: [
    { name: 'National Listings Market Share', target: '>30% top metros', type: 'breakdown' },
    { name: 'Deal Pipeline Health Score', target: '>80/100', type: 'gauge' },
    { name: 'Transaction Volume (monthly)', target: '120+ deals/mo', type: 'trend' },
    { name: 'Cross-City Demand Routing Efficiency', target: '>12% conversion', type: 'value' },
    { name: 'Brand Authority Index', target: 'Top 2 in category', type: 'ranking' },
  ]},
  { panel: 'Operational Discipline', priority: 'P1', metrics: [
    { name: 'CAC Payback Period', target: '<8 months', type: 'trend' },
    { name: 'LTV:CAC Ratio', target: '>5:1', type: 'ratio' },
    { name: 'Vendor Retention Rate', target: '>75%', type: 'value' },
    { name: 'Deal Cycle Duration', target: '<25 days avg', type: 'trend' },
    { name: 'Operational Efficiency Ratio', target: 'Improving QoQ', type: 'trend' },
  ]},
  { panel: 'Governance & Risk', priority: 'P1', metrics: [
    { name: 'Revenue Concentration (max city)', target: '<30%', type: 'alert' },
    { name: 'Revenue Concentration (max channel)', target: '<35%', type: 'alert' },
    { name: 'Regulatory Compliance Score', target: '100%', type: 'gauge' },
    { name: 'Audit Trail Completeness', target: '100%', type: 'value' },
    { name: 'Board Reporting Timeliness', target: '<10 days post-quarter', type: 'value' },
  ]},
];

/* ── Annual Monitoring ── */
const annualChecklist = [
  { category: 'Revenue Domination', items: ['$1M monthly run rate achieved and stabilized for 3+ months', 'Revenue diversification: no channel >35%, no city >30%', 'Enterprise ARR exceeding $3M annualized', 'Data intelligence revenue >$1.5M annualized', 'Contribution margin positive in 8+ cities'] },
  { category: 'Institutional Capital', items: ['10+ active institutional partnerships with signed agreements', '$100M+ capital influenced through platform annually', 'Quarterly institutional reports published on schedule', 'Co-investment pipeline generating 10+ deals/quarter', 'Institutional portal DAU >50 users'] },
  { category: 'IPO Readiness', items: ['Rule of 40 score consistently >40', 'Audited financials ready (Big 4 or equivalent)', 'Board composition includes 2+ independent directors', 'Governance frameworks documented and operational', 'Investor relations team and data room established'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Revenue stalls at $600-800K monthly', signal: 'Transaction volume plateaus despite national presence', fix: 'Unlock institutional data licensing + dynamic pricing to add $200K+ in high-margin revenue' },
  { risk: 'Institutional partnerships remain superficial', signal: 'Low deal participation despite signed agreements', fix: 'Assign dedicated relationship managers + deliver institutional-grade deal packages monthly' },
  { risk: 'IPO metrics inconsistency', signal: 'Quarter-to-quarter volatility in key financial metrics', fix: 'Strengthen recurring revenue to >40% of total; implement 13-week rolling forecasts' },
  { risk: 'National expansion creates governance gaps', signal: 'Compliance issues or audit findings in expansion markets', fix: 'Centralize compliance monitoring; hire regional compliance officers for Tier 1-2 cities' },
  { risk: 'Key vendor concentration risk', signal: 'Top 5 vendors contribute >25% of premium revenue', fix: 'Aggressive mid-tier vendor acquisition; cap single-vendor revenue at 3% of total' },
];

export default function Revenue1MNationalIPOBlueprint() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Crown className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">$1M Monthly National Domination + Institutional Capital + IPO Metrics</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">National revenue dominance, institutional capital control & pre-IPO governance readiness</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">👑 $1M/mo</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">👑 $1M Engine</TabsTrigger>
          <TabsTrigger value="capital">🏛️ Institutional</TabsTrigger>
          <TabsTrigger value="ipo">📊 IPO Metrics</TabsTrigger>
          <TabsTrigger value="monitor">📋 Annual</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Revenue ── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Revenue Architecture — $1M/Month</CardTitle></CardHeader>
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
                    <div className="grid gap-1">{c.tactics.map((t, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{t}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> National Domination Levers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dominationLevers.map((d, i) => (
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Monthly Sprint Framework</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {nationalSprints.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3"><Badge variant="outline" className="text-xs w-20 justify-center">{w.phase}</Badge><span className="text-sm">{w.focus}</span></div>
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/30">{w.target}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Institutional Capital ── */}
        <TabsContent value="capital" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Institutional Capital Tier Strategy</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {capitalTiers.map((t, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div><span className="font-semibold text-sm">{t.tier}</span><p className="text-xs text-muted-foreground">{t.segment}</p></div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{t.volume}</Badge>
                        <Badge variant={t.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{t.status}</Badge>
                      </div>
                    </div>
                    <div className="grid gap-1">{t.engagement.map((e, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{e}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Relationship Governance Mechanisms</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {capitalGovernance.map((g, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{g.mechanism}</span>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                    <p className="text-xs text-primary">{g.metric}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── IPO Metrics ── */}
        <TabsContent value="ipo" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> IPO-Readiness Strategic Panels</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {ipoPanels.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{p.panel}</span>
                      <Badge variant={p.priority === 'P0' ? 'destructive' : 'secondary'} className="text-[10px]">{p.priority}</Badge>
                    </div>
                    <div className="grid gap-1">{p.metrics.map((m, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2"><Eye className="h-3 w-3 text-primary shrink-0" /><span className="text-muted-foreground">{m.name}</span></div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-[9px]">{m.target}</Badge>
                          <Badge variant="secondary" className="text-[9px]">{m.type}</Badge>
                        </div>
                      </div>
                    ))}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Annual Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {annualChecklist.map((c, i) => (
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
