
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Rocket, Globe, Cpu, AlertTriangle, ClipboardCheck, Copy, Check, TrendingUp, Target, Shield, Users, Layers, Zap, BarChart3, Network, Database, ArrowUpRight } from 'lucide-react';
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

const preUnicornGrowth = {
  networkEffects: [
    { lever: 'Cross-City Demand Routing', mechanism: 'Investor in City A sees high-yield listings in City B → inquiry → transaction across cities', metric: 'Cross-city transactions as % of total', target: '≥15%', amplifier: 'AI-recommended "similar opportunities in other cities" on every listing page' },
    { lever: 'Vendor Ecosystem Lock-In', mechanism: 'CRM + lead history + performance analytics = high switching cost', metric: 'Vendor 12-month retention', target: '≥85%', amplifier: 'Add transaction management tools, client follow-up automation, deal pipeline tracker' },
    { lever: 'Data Compounding Flywheel', mechanism: 'More transactions → better pricing AI → more accurate valuations → more trust → more transactions', metric: 'Pricing prediction accuracy', target: '≥92%', amplifier: 'Every transaction improves models; publish accuracy benchmarks monthly' },
    { lever: 'Referral Network Multiplier', mechanism: 'Successful buyers refer 2-3 new buyers; agents refer partner agents', metric: 'Viral coefficient (k-factor)', target: '≥0.4', amplifier: 'Tiered referral rewards: 1st referral = Rp 500K, 3rd = Rp 1M, 10th = VIP status' },
    { lever: 'Institutional Gravity Well', mechanism: 'Institutional presence attracts more listings → attracts more institutions', metric: 'Institutional deal % of GMV', target: '≥25%', amplifier: 'Dedicated institutional portal with portfolio-level analytics and bulk deal tools' },
  ],
  monetizationDepth: [
    { product: 'Enterprise Intelligence Suite', audience: 'Large Agencies (50+ agents)', pricing: 'Rp 15-30M/month', features: ['Multi-agent performance dashboard', 'Territory analytics', 'Automated lead distribution', 'Custom reporting'], arrPotential: 'Rp 3.6B at 10 enterprise clients' },
    { product: 'Developer Launch Platform', audience: 'Property Developers', pricing: 'Rp 25-75M per project launch', features: ['Demand validation analytics', 'Pre-launch buyer matching', 'Digital showcase + virtual tours', 'Campaign performance tracking'], arrPotential: 'Rp 2.4B at 4 launches/month' },
    { product: 'Institutional Data Terminal', audience: 'Funds, Family Offices, REITs', pricing: 'Rp 50-100M/month per seat', features: ['Cross-city yield analytics', 'Capital flow intelligence', 'Deal screening algorithms', 'Portfolio optimization tools'], arrPotential: 'Rp 6B at 5 institutional seats' },
    { product: 'Transaction Services Layer', audience: 'All marketplace participants', pricing: '0.3-0.5% transaction fee', features: ['Digital escrow facilitation', 'Document verification', 'Legal template marketplace', 'Financing broker matching'], arrPotential: 'Rp 12B at Rp 200B monthly GMV' },
    { product: 'Advertising & Sponsored Placement', audience: 'Banks, Insurance, Interior Design', pricing: 'CPM/CPC model', features: ['Contextual property page ads', 'Financing calculator sponsorships', 'Post-purchase service recommendations', 'Newsletter sponsorships'], arrPotential: 'Rp 2.4B at 20% inventory fill rate' },
  ],
  scalingPlaybook: `🚀 PRE-UNICORN CITY LAUNCH PLAYBOOK (Standardized)

━━━━ PHASE 1: Intelligence (Week 1-2) ━━━━
□ Market sizing: listings volume, transaction velocity, digital penetration
□ Competitor mapping: identify top 3 digital + traditional players
□ Agent density analysis: target top 50 agents by deal volume
□ Developer pipeline: identify 5+ active projects for partnership

━━━━ PHASE 2: Supply Seeding (Week 3-4) ━━━━
□ Onboard 3 anchor agencies (20+ listings each)
□ Secure 1 developer project partnership
□ Reach 100 active listings milestone
□ Ensure ≥3 property types represented

━━━━ PHASE 3: Demand Ignition (Week 5-6) ━━━━
□ Launch geo-targeted performance marketing
□ Activate WhatsApp broadcast to buyer database
□ Publish 5 district market insight pieces
□ Run "launch week" featured listings campaign

━━━━ PHASE 4: Transaction Kickstart (Week 7-8) ━━━━
□ Close first 3 facilitated deals
□ Capture and publish success stories
□ Activate agent performance leaderboard
□ Begin premium listing upsell conversations

━━━━ PHASE 5: Momentum Lock (Week 9-12) ━━━━
□ Reach 300+ listings with ≥50 daily inquiries
□ Achieve positive unit economics
□ Establish local brand visibility presence
□ Transition from launch team to city operations team

━━━━ GATE: Do NOT launch next city until ━━━━
✓ Current city ≥15% listings market share
✓ Positive contribution margin
✓ ≥85% vendor retention rate
✓ Repeatable demand generation (≥3 channels working)`,
  kpis: [
    { metric: 'Annual Recurring Revenue', target: 'Rp 30B+ ($2M+)', phase: 'Pre-Series B' },
    { metric: 'Monthly Revenue Growth', target: '≥12% MoM', phase: 'Sustained' },
    { metric: 'Active Cities', target: '≥8 with positive unit economics', phase: '18 months' },
    { metric: 'Vendor Retention (12m)', target: '≥85%', phase: 'All cities' },
    { metric: 'GMV Facilitated (Monthly)', target: 'Rp 500B+', phase: 'Run rate' },
    { metric: 'LTV/CAC Ratio', target: '≥4x', phase: 'Blended' },
  ],
};

const globalBrandAuthority = {
  thoughtLeadership: [
    { initiative: 'ASTRA Property Intelligence Report', format: 'Quarterly publication (40-page PDF + interactive dashboard)', audience: 'Institutional investors, developers, media, regulators', content: 'National transaction trends, city-level yield analysis, demand forecasts, regulatory impact', distribution: 'Email to 5,000+ subscribers + media release + LinkedIn campaign', impact: 'Category authority as "the source" for Indonesian property intelligence' },
    { initiative: 'Global PropTech Conference Presence', format: 'Speaking slots + exhibition + hosted roundtables', audience: 'International VC, PropTech founders, institutional capital', events: 'MIPIM, PropTech Summit Asia, TechCrunch Disrupt, YC Demo Day', content: 'Network-effect marketplace model, data intelligence differentiation, emerging market thesis', impact: 'International visibility + investor pipeline + partnership opportunities' },
    { initiative: 'Executive Thought Leadership Series', format: 'LinkedIn articles + podcast appearances + op-eds', audience: 'Industry professionals, investors, founders', cadence: 'Weekly: Market Insight (Mon), Founder Journey (Wed), Vision (Fri)', topics: 'Digital property infrastructure, marketplace network effects, emerging market opportunity', impact: 'Founder personal brand → company credibility halo effect' },
  ],
  credibilityChannels: [
    { channel: 'Media Partnerships', partners: 'TechCrunch, Tech in Asia, DealStreetAsia, Kompas, Bloomberg Indonesia', format: 'Exclusive data stories, founder profiles, market trend commentary', frequency: '2-3 placements/month' },
    { channel: 'Research Collaborations', partners: 'University real estate departments, JLL, Cushman & Wakefield', format: 'Co-branded market studies, academic citation of ASTRA data', frequency: 'Quarterly research publications' },
    { channel: 'Industry Association Leadership', partners: 'REI, AREBI, PropTech Indonesia, APREA', format: 'Board positions, committee membership, event sponsorship', frequency: 'Ongoing relationship building' },
    { channel: 'Awards & Recognition', partners: 'PropTech awards, startup competitions, innovation indices', format: 'Award submissions, case study publications, ranking participation', frequency: 'Major awards cycle (quarterly)' },
  ],
  prTemplate: `📢 INSTITUTIONAL PR CAMPAIGN FRAMEWORK

━━━━ NARRATIVE ARCHITECTURE ━━━━

🎯 PRIMARY POSITIONING:
"ASTRA is building the intelligence infrastructure for 
Southeast Asia's largest property market."

📊 PROOF POINTS (update quarterly):
• [X] properties across [Y] Indonesian cities
• Rp [Z]B in facilitated transaction value
• [W]% pricing prediction accuracy
• [V] institutional investors on platform
• [U]% month-over-month growth

🏗️ NARRATIVE PILLARS:
1. MARKET INFRASTRUCTURE → "We're not a listing site. 
   We're the operating system for property transactions."
2. DATA INTELLIGENCE → "Every transaction makes our 
   platform smarter. Competitors can't replicate years 
   of compounding intelligence."
3. NETWORK EFFECTS → "The marketplace flywheel: more 
   listings → more buyers → more data → better matching 
   → more transactions → more listings."

📋 MEDIA ANGLES (rotate quarterly):
Q1: "State of Indonesian Property" data story
Q2: "PropTech Innovation" technology feature
Q3: "Institutional Capital" partnership announcement
Q4: "Growth & Impact" year-in-review narrative

🎤 SPOKESPERSON PREP:
• 3 core soundbites (memorize)
• 5 data points (always current)
• 2 customer stories (humanize)
• 1 vision statement (inspire)`,
  kpis: [
    { metric: 'Tier-1 Media Mentions (Monthly)', target: '≥5' },
    { metric: 'Institutional Inbound Inquiries', target: '≥10/quarter' },
    { metric: 'Conference Speaking Invitations', target: '≥4/year' },
    { metric: 'Industry Report Citations', target: '≥20/year' },
    { metric: 'Founder LinkedIn Followers', target: '≥25,000' },
  ],
};

const marketplaceOS = {
  intelligenceLayers: [
    { layer: 'Supply Liquidity Intelligence', components: ['Real-time listings health scoring', 'District supply density monitoring', 'Vendor activity and freshness tracking', 'Supply gap detection and alerts'], dataInputs: 'Listing events, vendor behavior, inquiry patterns', outputSignals: 'Supply health scores, gap alerts, vendor activation triggers', updateFrequency: 'Real-time (event-driven) + hourly aggregation' },
    { layer: 'Demand Behavioral Analytics', components: ['Buyer intent classification (casual/serious/institutional)', 'Search pattern analysis and preference learning', 'Cross-property interest graph', 'Decision timeline prediction'], dataInputs: 'Search queries, listing views, inquiry submissions, viewing history', outputSignals: 'Intent scores, personalized recommendations, urgency indicators', updateFrequency: 'Real-time intent scoring + daily model retraining' },
    { layer: 'Pricing & Transaction Engine', components: ['Automated comparative market analysis', 'Dynamic pricing recommendation', 'Negotiation range guidance', 'Transaction probability scoring'], dataInputs: 'Historical transactions, listing prices, market conditions, demand signals', outputSignals: 'Price recommendations, deal probability scores, market timing alerts', updateFrequency: 'Daily recalculation + real-time transaction events' },
    { layer: 'Market Intelligence Synthesis', components: ['City-level health dashboards', 'District trend detection', 'Capital flow tracking', 'Competitive landscape monitoring'], dataInputs: 'All platform data + external market signals', outputSignals: 'Market reports, investment opportunity alerts, risk indicators', updateFrequency: 'Weekly synthesis + real-time anomaly detection' },
  ],
  automationFramework: [
    { system: 'Growth Experiment Engine', description: 'Automated A/B testing for listing presentation, pricing display, and conversion flows', capabilities: ['Multi-variant testing framework', 'Statistical significance auto-detection', 'Winning variant auto-deployment', 'Experiment backlog prioritization AI'], autonomyLevel: 'Semi-autonomous (auto-detect winner, human approval for deployment)' },
    { system: 'Intelligent Lead Router', description: 'ML-driven lead scoring and distribution to optimal agents', capabilities: ['Real-time buyer intent classification', 'Agent-buyer compatibility matching', 'Performance-weighted distribution', 'Escalation triggers for high-value leads'], autonomyLevel: 'Fully autonomous with human override dashboard' },
    { system: 'Monetization Orchestrator', description: 'Automated upsell, pricing optimization, and campaign activation', capabilities: ['Dynamic premium slot pricing', 'Vendor upgrade propensity scoring', 'Automated upsell messaging triggers', 'Campaign ROI optimization'], autonomyLevel: 'Autonomous triggers, human approval for pricing changes >20%' },
    { system: 'Platform Health Monitor', description: 'Real-time detection and response to operational anomalies', capabilities: ['Conversion funnel anomaly detection', 'Supply-demand imbalance alerts', 'Revenue forecast deviation warnings', 'Vendor churn risk early warning'], autonomyLevel: 'Fully autonomous alerting, human-directed response' },
  ],
  architectureDiagram: `🏗️ MARKETPLACE OPERATING SYSTEM — ARCHITECTURE BLUEPRINT

┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                  │
│  React + Vite + Tailwind + Role-Based UI         │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐    │
│  │ Buyer    │ │ Vendor   │ │ Institutional │    │
│  │ Portal   │ │ Dashboard│ │ Terminal      │    │
│  └──────────┘ └──────────┘ └───────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ Admin Command Center + Override Controls │    │
│  └──────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│            APPLICATION LOGIC LAYER               │
│  Supabase Edge Functions + RBAC/RLS              │
│  ┌─────────┐ ┌──────────┐ ┌─────────────────┐   │
│  │ Core    │ │ AI       │ │ Monetization    │   │
│  │ Engine  │ │ Engine   │ │ Engine          │   │
│  └─────────┘ └──────────┘ └─────────────────┘   │
│  ┌─────────┐ ┌──────────┐ ┌─────────────────┐   │
│  │ Vendor  │ │ Network  │ │ Growth          │   │
│  │ Engine  │ │ Effect   │ │ Experiment      │   │
│  └─────────┘ └──────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────┤
│          INTELLIGENCE PROCESSING LAYER           │
│  Autonomous Workers + pg_cron Orchestration      │
│  ┌─────────────┐ ┌───────────┐ ┌────────────┐   │
│  │ Supply      │ │ Demand    │ │ Pricing    │   │
│  │ Liquidity   │ │ Behavioral│ │ Transaction│   │
│  │ Intelligence│ │ Analytics │ │ Engine     │   │
│  └─────────────┘ └───────────┘ └────────────┘   │
│  ┌─────────────┐ ┌───────────┐ ┌────────────┐   │
│  │ Lead        │ │ Monetize  │ │ Health     │   │
│  │ Router AI   │ │ Orchestr. │ │ Monitor    │   │
│  └─────────────┘ └───────────┘ └────────────┘   │
├─────────────────────────────────────────────────┤
│           DATA INFRASTRUCTURE LAYER              │
│  PostgreSQL + Multi-Tier Intelligence Cache      │
│  ┌──────────────────────────────────────────┐    │
│  │ Transaction Data │ Behavioral Signals    │    │
│  │ Market Indices   │ Intelligence Cache    │    │
│  │ Event Signal Bus │ Analytics Warehouse   │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ External: Mapbox │ NLP │ Payment Gateway │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

DATA FLOW: Events → Signal Bus → Workers → Cache → UI
SCALE: Horizontal edge functions + read replicas + CDN
GOVERNANCE: Admin overrides at every autonomous layer`,
  kpis: [
    { metric: 'Automation Revenue Contribution', target: '≥30% of total revenue driven by automated triggers' },
    { metric: 'Lead Response Time (Automated)', target: '<30 seconds for intent classification' },
    { metric: 'Platform Uptime', target: '≥99.9%' },
    { metric: 'Model Retraining Cycle', target: '≤24 hours for all ML models' },
    { metric: 'Manual Override Frequency', target: '<5% of automated decisions require override' },
  ],
};

const semiAnnualChecklist = [
  { category: 'Growth Velocity', items: ['Review ARR trajectory vs pre-unicorn milestones', 'Assess city-level unit economics (all active cities)', 'Evaluate network effect strength (viral coefficient, cross-city %)', 'Track monetization depth expansion (new revenue streams)'] },
  { category: 'Brand Authority', items: ['Audit media coverage quality and frequency', 'Review institutional inbound pipeline', 'Assess conference presence ROI', 'Evaluate thought leadership content engagement'] },
  { category: 'Platform Architecture', items: ['Review automation coverage and accuracy', 'Assess intelligence layer performance metrics', 'Audit infrastructure scalability headroom', 'Evaluate data pipeline freshness and reliability'] },
  { category: 'Strategic Position', items: ['Competitive landscape reassessment', 'Regulatory environment scan', 'Investor sentiment and valuation benchmark', 'Team capability gap analysis'] },
];

const risks = [
  { signal: 'Growth velocity plateau despite increasing spend', severity: 93, mitigation: 'Diversify growth channels beyond performance marketing; invest in organic/referral loops; audit conversion funnel for friction; consider market expansion vs deeper penetration trade-off' },
  { signal: 'Network effects not compounding — flat viral coefficient', severity: 90, mitigation: 'Redesign referral incentives; add social sharing hooks to listing experience; create "community" features driving natural sharing; measure and optimize each referral touchpoint' },
  { signal: 'Monetization resistance from vendors at higher price points', severity: 85, mitigation: 'Strengthen ROI visibility dashboards; introduce usage-based pricing alongside fixed tiers; create success guarantee pilots; benchmark vs competitor monetization' },
  { signal: 'Platform complexity slowing feature velocity', severity: 87, mitigation: 'Modularize architecture into independent service boundaries; establish feature flagging; create dedicated platform reliability team; implement progressive rollouts' },
  { signal: 'Brand perception lagging behind actual traction', severity: 78, mitigation: 'Increase PR investment; hire dedicated comms lead; create systematic content calendar; seek high-profile advisory board members' },
  { signal: 'Key talent retention risk during hyper-growth', severity: 88, mitigation: 'Implement competitive ESOP program; create clear career growth paths; maintain founder accessibility; build strong engineering culture' },
];

const PreUnicornGlobalBrandMarketplaceOSBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Rocket className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Pre-Unicorn Growth + Global Brand Authority + Marketplace OS</h2>
          <p className="text-sm text-muted-foreground">Hyper-growth acceleration, institutional perception & platform intelligence architecture</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="growth" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="growth"><Rocket className="h-4 w-4 mr-1.5" />Pre-Unicorn Growth</TabsTrigger>
        <TabsTrigger value="brand"><Globe className="h-4 w-4 mr-1.5" />Global Brand</TabsTrigger>
        <TabsTrigger value="os"><Cpu className="h-4 w-4 mr-1.5" />Marketplace OS</TabsTrigger>
        <TabsTrigger value="checklist"><ClipboardCheck className="h-4 w-4 mr-1.5" />Semi-Annual</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* GROWTH TAB */}
      <TabsContent value="growth" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Network className="h-4 w-4 text-primary" />Network Effect Intensification Levers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {preUnicornGrowth.networkEffects.map((n, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{n.lever}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Target: {n.target}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">⚙️ {n.mechanism}</p>
                  <p className="text-[10px] text-foreground mt-0.5">📊 Metric: {n.metric}</p>
                  <p className="text-[10px] text-primary mt-0.5">🚀 {n.amplifier}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-3" />Monetization Depth Expansion</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {preUnicornGrowth.monetizationDepth.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{p.product}</span>
                    <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">{p.arrPotential}</Badge>
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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {preUnicornGrowth.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{k.phase}</Badge>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(9)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Standardized City Launch Playbook</CardTitle></CardHeader>
            <CardContent><CopyBlock text={preUnicornGrowth.scalingPlaybook} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* BRAND TAB */}
      <TabsContent value="brand" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Thought Leadership Initiatives</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {globalBrandAuthority.thoughtLeadership.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-bold text-foreground">{t.initiative}</span>
                  <div className="flex items-center gap-2 mt-1 mb-1.5">
                    <Badge variant="outline" className="text-[10px]">{t.format}</Badge>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{t.audience}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">📋 {t.content}</p>
                  <p className="text-[10px] text-primary mt-0.5">💎 {t.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-3" />Credibility Amplification Channels</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {globalBrandAuthority.credibilityChannels.map((c, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{c.channel}</span>
                    <Badge variant="outline" className="text-[10px]">{c.frequency}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">🤝 {c.partners}</p>
                  <p className="text-[10px] text-foreground mt-0.5">📋 {c.format}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {globalBrandAuthority.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Institutional PR Campaign Framework</CardTitle></CardHeader>
            <CardContent><CopyBlock text={globalBrandAuthority.prTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* MARKETPLACE OS TAB */}
      <TabsContent value="os" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Core Intelligence Layers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {marketplaceOS.intelligenceLayers.map((l, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-bold text-foreground">{l.layer}</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {l.components.map((c, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">⚙️ {c}</Badge>
                    ))}
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">📥 Inputs: {l.dataInputs}</p>
                    <p className="text-[10px] text-foreground">📤 Outputs: {l.outputSignals}</p>
                    <p className="text-[10px] text-primary">⏱️ {l.updateFrequency}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Automation & Orchestration Systems</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {marketplaceOS.automationFramework.map((a, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{a.system}</span>
                    <Badge className="text-[10px] bg-chart-4/10 text-chart-4 border-chart-4/20">{a.autonomyLevel}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">{a.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {a.capabilities.map((c, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {c}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {marketplaceOS.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-xs font-bold text-foreground mt-1">{k.target}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Marketplace OS Architecture Blueprint</CardTitle></CardHeader>
            <CardContent><CopyBlock text={marketplaceOS.architectureDiagram} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* SEMI-ANNUAL TAB */}
      <TabsContent value="checklist" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semiAnnualChecklist.map((cat, i) => (
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

export default PreUnicornGlobalBrandMarketplaceOSBlueprint;
