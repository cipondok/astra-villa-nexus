
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Database, Rocket, AlertTriangle, ClipboardCheck, Copy, Check, Globe, TrendingUp, Target, BarChart3, DollarSign, Shield, Users, Landmark, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const CopyBlock = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border border-border/40 rounded-lg p-3 whitespace-pre-wrap font-mono">{text}</pre>
      <Button size="sm" variant="ghost" className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const nationalLeadership = {
  cityTiers: [
    { tier: 'Tier 1 — Fortress Cities', cities: 'Jakarta, Surabaya, Bandung', criteria: '≥25% listings market share + positive contribution margin', strategy: 'Defend dominance, maximize monetization, deepen vendor lock-in', status: 'Dominate' },
    { tier: 'Tier 2 — Expansion Targets', cities: 'Medan, Semarang, Makassar, Yogyakarta', criteria: '≥200 listings + ≥20 inquiries/day within 90 days', strategy: 'Replicate proven playbook, secure anchor partners, seed demand', status: 'Conquer' },
    { tier: 'Tier 3 — Satellite Markets', cities: 'Bali, Balikpapan, Palembang, Malang', criteria: 'Developer project partnerships + organic demand signals', strategy: 'Lightweight launch via developer projects, minimal ops overhead', status: 'Monitor' },
  ],
  authorityInitiatives: [
    { initiative: 'National Property Index', description: 'Monthly publication: "ASTRA National Property Market Intelligence"', format: 'PDF report + social infographics + media release', impact: 'Positions ASTRA as the Bloomberg of Indonesian property', frequency: 'Monthly' },
    { initiative: 'City Liquidity Rankings', description: 'Quarterly ranking of Indonesian cities by property market health', format: 'Interactive dashboard + PR campaign', impact: 'Media coverage + vendor credibility + investor attention', frequency: 'Quarterly' },
    { initiative: 'Annual Property Summit', description: '"ASTRA Property Intelligence Summit" — national industry event', format: '500+ attendees, developer sponsors, investor networking', impact: 'Category leadership perception + partnership pipeline', frequency: 'Annual' },
    { initiative: 'National Ad Campaign', description: '"Find it first on ASTRA" coordinated brand awareness', format: 'Digital + OOH in top 5 cities + social media blitz', impact: 'National brand recall from <5% to >25%', frequency: 'Bi-annual' },
  ],
  competitiveMoats: [
    { moat: 'Data Network Effect', mechanism: 'More transactions → better pricing intelligence → more users → more transactions', defensibility: 'Competitors need years of transaction data to replicate', strengthening: 'Increase data capture points per listing and transaction' },
    { moat: 'Vendor Switching Cost', mechanism: 'CRM tools + lead history + performance analytics embedded in workflow', defensibility: 'Agents lose pipeline visibility and historical data if they leave', strengthening: 'Add more workflow tools: automated follow-up, deal tracking, client CRM' },
    { moat: 'Supply Density Advantage', mechanism: 'Most listings → most buyers → agents must list here → even more listings', defensibility: 'Winner-take-most dynamics in each city', strengthening: 'Maintain ≥2x listing density vs nearest competitor in fortress cities' },
    { moat: 'Brand Trust Accumulation', mechanism: 'Transaction history + verified listings + market intelligence = trust', defensibility: 'Trust compounds over years, cannot be bought quickly', strengthening: 'Publish transparency reports, success statistics, buyer protection guarantees' },
  ],
  kpis: [
    { metric: 'National Listings Share', target: '≥20% of digital listings', current: '3%' },
    { metric: 'Cities with ≥15% Share', target: '≥5 cities', current: '1 city' },
    { metric: 'National Brand Recall', target: '≥25% among property seekers', current: '<5%' },
    { metric: 'Monthly Inquiry Volume (National)', target: '≥15,000', current: '800' },
    { metric: 'Vendor Inbound Rate', target: '≥40% of new agents via inbound', current: '8%' },
  ],
};

const dataMonetization = {
  products: [
    { product: 'Market Intelligence Dashboard', audience: 'Agents & Small Agencies', pricing: 'Rp 299K/month (Basic) | Rp 799K/month (Pro)', features: ['District-level price trend analytics', 'Demand heatmaps by property type', 'Competitive positioning insights', 'Monthly market summary reports'], revenueTarget: 'Rp 150M/month at 500 subscribers' },
    { product: 'Developer Analytics Suite', audience: 'Property Developers', pricing: 'Rp 5M-15M/month per project', features: ['Pre-launch demand validation data', 'Price elasticity modeling', 'Buyer persona analytics for target area', 'Competitor project benchmarking'], revenueTarget: 'Rp 100M/month at 10 developer clients' },
    { product: 'Institutional Intelligence Terminal', audience: 'Funds, Family Offices, REITs', pricing: 'Rp 25M-50M/month per seat', features: ['Portfolio-level analytics dashboard', 'Cross-city yield comparison engine', 'Capital flow tracking and alerts', 'Custom deal screening criteria'], revenueTarget: 'Rp 200M/month at 5 institutional clients' },
    { product: 'API Data Feed', audience: 'FinTech, Banks, Research Firms', pricing: 'Rp 10M-30M/month per integration', features: ['Real-time listing and pricing data', 'Transaction velocity indices', 'District liquidity scores', 'Anonymized behavioral demand signals'], revenueTarget: 'Rp 150M/month at 8 API partners' },
  ],
  pricingFramework: `📊 DATA MONETIZATION PRICING FRAMEWORK

━━━━━━ TIERED ACCESS MODEL ━━━━━━

🟢 FREE TIER (Lead Generation)
• Basic district price averages
• Top 10 listings per district
• Monthly market snapshot email
→ Goal: Drive platform adoption + capture leads

🔵 PRO TIER — Rp 299K-799K/month
• Full price trend analytics (12-month history)
• Demand heatmaps + inquiry volume indicators
• Competitive listing benchmarks
• Weekly market alerts for saved districts
→ Goal: Agent/agency recurring revenue

🟣 ENTERPRISE TIER — Rp 5M-50M/month
• Custom analytics dashboards
• API access to market data feeds
• Pre-launch demand modeling
• Dedicated account manager
• Custom report generation
→ Goal: Developer + institutional revenue

💎 STRATEGIC TIER — Custom Pricing
• White-label market intelligence
• Exclusive data partnerships
• Co-branded research publications
• Advisory board participation
→ Goal: High-margin strategic relationships

━━━━━━ PRICING PRINCIPLES ━━━━━━
• Value-based: price on decision impact, not data volume
• Anchor high: start enterprise pricing high, negotiate down
• Annual lock-in: 20% discount for annual commitment
• Usage-based upside: charge per API call above base tier`,
  trustFramework: [
    { element: 'Methodology Transparency', description: 'Publish how indices and scores are calculated', action: 'Create "ASTRA Intelligence Methodology" white paper' },
    { element: 'Data Freshness Guarantees', description: 'Commit to update frequency SLAs', action: 'Display "last updated" timestamps on all data products' },
    { element: 'Accuracy Benchmarking', description: 'Track and publish prediction accuracy rates', action: 'Quarterly accuracy report: price predictions vs actual transactions' },
    { element: 'Privacy Compliance', description: 'Ensure all data products use anonymized, aggregated data', action: 'Independent privacy audit + compliance certification' },
  ],
  kpis: [
    { metric: 'Data Revenue (Monthly)', target: 'Rp 600M/month', current: 'Rp 0' },
    { metric: 'Data Revenue % of Total', target: '≥25%', current: '0%' },
    { metric: 'Paying Data Subscribers', target: '≥500', current: '0' },
    { metric: 'Enterprise Data Clients', target: '≥15', current: '0' },
    { metric: 'API Partner Integrations', target: '≥8', current: '0' },
  ],
};

const seriesAReadiness = {
  narrativeElements: [
    { element: 'Market Size Story', content: 'Indonesia property market: Rp 5,000T+ annually. Digital penetration <5%. ASTRA is building the infrastructure layer for digital property discovery and transaction intelligence.', evidence: 'TAM/SAM/SOM analysis with bottom-up transaction data' },
    { element: 'Traction Proof', content: 'From 0 to [X] listings, [Y] monthly inquiries, [Z] facilitated transactions across [W] cities in [months] since launch.', evidence: 'Growth charts showing month-over-month acceleration' },
    { element: 'Network Effect Demonstration', content: 'Each new listing generates [X] more inquiries. Each new agent brings [Y] more listings. Viral coefficient: [Z]. Supply-demand flywheel is self-reinforcing.', evidence: 'Cohort analysis showing improving unit economics over time' },
    { element: 'Revenue Quality', content: '[X]% recurring subscription revenue. [Y]% month-over-month growth. LTV/CAC ratio: [Z]x. Contribution margin positive in [W] cities.', evidence: 'Revenue waterfall + unit economics dashboard' },
    { element: 'Defensibility Narrative', content: 'Proprietary transaction data from [X] deals. [Y] agent relationships. [Z] developer partnerships. Data network effect creates compounding intelligence advantage.', evidence: 'Moat analysis + competitive gap quantification' },
    { element: 'Vision & Expansion Path', content: 'From property listings → property intelligence → property financial infrastructure. Adjacent revenue: data monetization, financing facilitation, transaction services.', evidence: 'Product roadmap + early data revenue signals' },
  ],
  dataRoomStructure: [
    { folder: '1. Company Overview', contents: ['Pitch deck (15-20 slides)', 'One-pager executive summary', 'Founder bios and team overview', 'Cap table summary'] },
    { folder: '2. Financial Data', contents: ['Monthly P&L (inception to date)', 'Revenue breakdown by product/city', 'Unit economics by cohort', 'Financial model (3-year projection)', 'Burn rate and runway analysis'] },
    { folder: '3. Growth Metrics', contents: ['GMV/transaction volume trends', 'Listings growth by city', 'Inquiry and conversion funnels', 'Retention and churn analytics', 'Viral/referral coefficient data'] },
    { folder: '4. Product & Technology', contents: ['Product demo video', 'Technology architecture overview', 'AI/ML capabilities summary', 'Product roadmap (12-month)'] },
    { folder: '5. Market & Competition', contents: ['Market size analysis (TAM/SAM/SOM)', 'Competitive landscape matrix', 'Regulatory environment summary', 'City expansion strategy'] },
    { folder: '6. Legal & Compliance', contents: ['Corporate documents', 'IP ownership documentation', 'Key contracts and partnerships', 'Privacy and data compliance'] },
  ],
  milestoneGates: [
    { milestone: 'Revenue Run Rate', gate: '≥Rp 500M MRR (≈$30K)', status: 'Pre-gate', rationale: 'Demonstrates product-market fit and monetization ability' },
    { milestone: 'Multi-City Proof', gate: '≥3 cities with positive unit economics', status: 'Pre-gate', rationale: 'Proves expansion playbook is repeatable' },
    { milestone: 'Growth Rate', gate: '≥15% month-over-month revenue growth', status: 'Pre-gate', rationale: 'Shows accelerating trajectory investors seek' },
    { milestone: 'Network Effects', gate: 'Viral coefficient ≥0.3 + improving cohort metrics', status: 'Pre-gate', rationale: 'Validates marketplace flywheel is working' },
    { milestone: 'Team Completeness', gate: 'CTO + Head of Growth + City Leads hired', status: 'Pre-gate', rationale: 'Signals operational readiness for scale capital' },
    { milestone: 'Data Room', gate: 'Complete data room with <48hr update capability', status: 'Pre-gate', rationale: 'Professional readiness accelerates investor process' },
  ],
  investorOutreach: `Subject: ASTRA Villa — Series A: Building Indonesia's Property Intelligence Infrastructure

Dear [Investor Name],

I'm reaching out because [Fund Name]'s thesis on [marketplace/fintech/SEA infrastructure] aligns closely with what we're building at ASTRA Villa.

📊 THE OPPORTUNITY:
Indonesia's Rp 5,000T property market is the largest asset class in Southeast Asia's largest economy — yet digital transaction infrastructure barely exists. ASTRA is building it.

🚀 TRACTION (as of [Date]):
• [X] active listings across [Y] cities
• [Z] monthly inquiries (growing [W]% MoM)
• Rp [Amount] MRR ([Growth]% MoM)
• [X] facilitated transactions
• [Y] active agent partners

💡 WHY NOW:
• Indonesia's property digitization is at an inflection point
• Regulatory tailwinds: [specific policy]
• First-mover data advantage compounds monthly
• Unit economics improving with each cohort

🎯 THE ASK:
We're raising $[X]M Series A to:
1. Expand from [X] to [Y] cities
2. Launch data intelligence products (Rp [Z]M ARR potential)
3. Build institutional capital gateway
4. Strengthen technology and team

📋 ATTACHED:
• Executive summary (2 pages)
• Pitch deck (15 slides)
• Key metrics dashboard

I'd welcome 30 minutes to share our vision and traction in detail.

Available: [Times]

Best regards,
[Founder Name]
CEO & Founder, ASTRA Villa
[Phone] | [Email] | [LinkedIn]`,
  kpis: [
    { metric: 'Investor Meetings Secured', target: '≥30 meetings' },
    { metric: 'Term Sheet Offers', target: '≥2 competitive offers' },
    { metric: 'Target Valuation', target: '$15-25M pre-money' },
    { metric: 'Round Size', target: '$3-5M' },
    { metric: 'Time to Close', target: '≤4 months from first meeting' },
  ],
};

const quarterlyChecklist = [
  { category: 'National Leadership', items: ['Review listings market share per city vs targets', 'Track national brand recall survey results', 'Assess competitive positioning in each active city', 'Evaluate vendor inbound rate trend'] },
  { category: 'Data Monetization', items: ['Review data product subscriber growth', 'Track enterprise client pipeline and conversions', 'Assess data revenue as % of total revenue', 'Audit data accuracy and freshness SLAs'] },
  { category: 'Series-A Readiness', items: ['Update financial model with latest actuals', 'Refresh data room with current metrics', 'Review milestone gate progress', 'Assess investor pipeline and relationship warmth'] },
  { category: 'Strategic Health', items: ['Validate unit economics improving by cohort', 'Check burn rate vs runway alignment', 'Review team hiring plan vs actual', 'Assess market timing and competitive threats'] },
];

const risks = [
  { signal: 'National expansion diluting focus from fortress city dominance', severity: 91, mitigation: 'Never expand to new city until fortress cities maintain ≥25% share; assign separate teams; track per-city P&L independently' },
  { signal: 'Data products cannibalizing core marketplace attention', severity: 82, mitigation: 'Separate data team from marketplace ops; ensure data products enhance (not replace) core listing/inquiry experience' },
  { signal: 'Series-A narrative ahead of actual traction metrics', severity: 89, mitigation: 'Gate fundraising on hitting milestone gates; do not start outreach until ≥4 of 6 gates met; be transparent about current stage' },
  { signal: 'Over-investment in brand before unit economics proven', severity: 86, mitigation: 'Cap brand spend at ≤20% of marketing budget; prioritize performance marketing with measurable ROI; brand is earned via transaction volume' },
  { signal: 'Data monetization pricing too low, training market to undervalue intelligence', severity: 83, mitigation: 'Anchor enterprise pricing high from Day 1; offer free tier strategically but protect premium value; never discount >20%' },
];

const NationalDataSeriesABlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Crown className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">National Leadership + Data Monetization + Series-A Readiness</h2>
          <p className="text-sm text-muted-foreground">National market dominance, intelligence revenue creation & venture fundraising preparation</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="national" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="national"><Crown className="h-4 w-4 mr-1.5" />National Leadership</TabsTrigger>
        <TabsTrigger value="data"><Database className="h-4 w-4 mr-1.5" />Data Monetization</TabsTrigger>
        <TabsTrigger value="seriesA"><Rocket className="h-4 w-4 mr-1.5" />Series-A Readiness</TabsTrigger>
        <TabsTrigger value="quarterly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Quarterly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* NATIONAL TAB */}
      <TabsContent value="national" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />City Tier Strategy</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {nationalLeadership.cityTiers.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{t.tier}</span>
                    <Badge className={`text-[10px] ${t.status === 'Dominate' ? 'bg-primary/10 text-primary border-primary/20' : t.status === 'Conquer' ? 'bg-chart-3/10 text-chart-3 border-chart-3/20' : 'bg-muted/50 text-muted-foreground border-border/30'}`}>{t.status}</Badge>
                  </div>
                  <p className="text-[11px] text-foreground">📍 {t.cities}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">🎯 Gate: {t.criteria}</p>
                  <p className="text-[10px] text-primary mt-0.5">→ {t.strategy}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-3" />Authority Initiatives</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {nationalLeadership.authorityInitiatives.map((a, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{a.initiative}</span>
                    <Badge variant="outline" className="text-[10px]">{a.frequency}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{a.description}</p>
                  <p className="text-[10px] text-foreground mt-0.5">📋 {a.format}</p>
                  <p className="text-[10px] text-primary mt-0.5">💎 {a.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-4" />Competitive Moats</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {nationalLeadership.competitiveMoats.map((m, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-bold text-foreground">{m.moat}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">⚙️ {m.mechanism}</p>
                  <p className="text-[10px] text-foreground mt-0.5">🛡️ {m.defensibility}</p>
                  <p className="text-[10px] text-primary mt-0.5">📈 {m.strengthening}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {nationalLeadership.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 4)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{k.target}</Badge>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* DATA MONETIZATION TAB */}
      <TabsContent value="data" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4 text-primary" />Intelligence Products</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dataMonetization.products.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{p.product}</span>
                    <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">{p.revenueTarget}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px]">{p.audience}</Badge>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{p.pricing}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.features.map((f, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {f}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-4" />Data Trust Framework</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dataMonetization.trustFramework.map((t, i) => (
                <div key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-semibold text-foreground">{t.element}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                  <p className="text-[10px] text-primary mt-0.5">→ {t.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {dataMonetization.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{k.target}</Badge>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Pricing Framework</CardTitle></CardHeader>
            <CardContent><CopyBlock text={dataMonetization.pricingFramework} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* SERIES-A TAB */}
      <TabsContent value="seriesA" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Growth Narrative Elements</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {seriesAReadiness.narrativeElements.map((n, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-bold text-foreground">{n.element}</span>
                  <p className="text-[11px] text-foreground mt-0.5">{n.content}</p>
                  <p className="text-[10px] text-primary mt-0.5">📊 Evidence: {n.evidence}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-3" />Milestone Gates</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {seriesAReadiness.milestoneGates.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-32 justify-center flex-shrink-0 mt-0.5">{m.milestone}</Badge>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-foreground">{m.gate}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.rationale}</p>
                  </div>
                  <Badge className="text-[9px] bg-chart-4/10 text-chart-4 border-chart-4/20 flex-shrink-0">{m.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-chart-4" />Data Room Structure</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {seriesAReadiness.dataRoomStructure.map((f, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-semibold text-foreground">{f.folder}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.contents.map((c, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">📄 {c}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {seriesAReadiness.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 4)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(9)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Series-A Investor Outreach Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={seriesAReadiness.investorOutreach} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* QUARTERLY CHECK TAB */}
      <TabsContent value="quarterly" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quarterlyChecklist.map((cat, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{cat.category}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-4 w-4 rounded border border-border/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* RISKS TAB */}
      <TabsContent value="risks" className="space-y-4">
        {risks.map((r, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${r.severity >= 85 ? 'text-destructive' : 'text-chart-3'}`} />
                    <span className="text-sm font-medium text-foreground">{r.signal}</span>
                  </div>
                  <Badge variant={r.severity >= 85 ? 'destructive' : 'outline'} className="text-[10px]">{r.severity}%</Badge>
                </div>
                <Progress value={r.severity} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">⚡ {r.mitigation}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>
    </Tabs>
  </div>
);

export default NationalDataSeriesABlueprint;
