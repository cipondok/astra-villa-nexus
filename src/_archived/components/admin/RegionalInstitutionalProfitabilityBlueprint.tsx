
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Map, Landmark, TrendingUp, AlertTriangle, ClipboardCheck, Copy, Check, Building2, DollarSign, Target, BarChart3, Globe, Users, Rocket, ArrowUpRight } from 'lucide-react';
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

const regionalExpansion = {
  selectionMatrix: [
    { factor: 'Transaction Velocity', weight: '25%', scoring: 'High (>500 deals/month in city) = 10, Med (200-500) = 6, Low (<200) = 3' },
    { factor: 'Developer Pipeline', weight: '20%', scoring: '≥10 active new projects = 10, 5-9 = 7, <5 = 4' },
    { factor: 'Digital Competition', weight: '20%', scoring: 'No dominant digital platform = 10, 1 competitor = 6, Saturated = 2' },
    { factor: 'Agent Ecosystem Size', weight: '15%', scoring: '≥500 active agents = 10, 200-499 = 7, <200 = 4' },
    { factor: 'Proximity to HQ', weight: '10%', scoring: 'Same island = 10, Adjacent = 7, Remote = 4' },
    { factor: 'Investor Demand Signal', weight: '10%', scoring: 'Cross-city searches from existing users for target city' },
  ],
  rolloutPhases: [
    { phase: 'Phase 1 — Intelligence (Week 1-2)', actions: ['Map top 20 agencies + top 5 developers in target city', 'Analyze competitive landscape and pricing', 'Identify 3 priority districts by transaction data', 'Recruit local City Lead (BD + Ops hybrid role)'], gate: 'City Lead hired + target list complete', budget: 'Rp 15M' },
    { phase: 'Phase 2 — Supply Seeding (Week 3-6)', actions: ['Onboard 5 anchor agencies (≥20 listings each)', 'Secure 2 developer project partnerships', 'Concentrate 80% of listings in 3 priority districts', 'Achieve minimum 200 quality listings live'], gate: '200+ listings live + 10+ active agents', budget: 'Rp 30M' },
    { phase: 'Phase 3 — Demand Ignition (Week 5-8)', actions: ['Launch geo-targeted Google + Meta campaigns', 'Activate 3 local property influencers', 'Email/WhatsApp blast to existing buyer database with city interest', 'Publish "Top Properties in [City]" launch content'], gate: '≥500 daily visitors + ≥20 inquiries/day', budget: 'Rp 50M' },
    { phase: 'Phase 4 — Transaction Kickstart (Week 7-12)', actions: ['Personally facilitate first 10 viewings', 'Provide deal support for every serious inquiry', 'Run 2 weekend hyper-liquidity campaigns', 'Capture and promote first deal success stories'], gate: '≥5 deals closed within 90 days', budget: 'Rp 20M' },
    { phase: 'Phase 5 — Momentum Lock (Month 4-6)', actions: ['Scale to 500+ listings across 5+ districts', 'Achieve ≥10% city listings market share', 'Establish monthly city market intelligence report', 'Launch local investor community events'], gate: 'Self-sustaining inquiry flow + positive unit economics', budget: 'Rp 40M/month' },
  ],
  cityLaunchTemplate: `🏙️ ASTRA VILLA HADIR DI [CITY]!

📍 Platform properti #1 kini tersedia di [City]

🏠 [X]+ PROPERTI SIAP EXPLORE:
• Rumah: [Y] listings
• Apartemen: [Z] listings  
• Tanah & Komersial: [W] listings
• Range harga: Rp [Min] — Rp [Max]

🔥 LAUNCH EXCLUSIVE (30 hari pertama):
• Free Premium Listing untuk 50 agent pertama
• Buyer mendapat priority viewing scheduling
• Developer project showcase gratis

📊 KENAPA [CITY]?
• Property market size: Rp [X] Triliun
• Annual transaction growth: +[Y]%
• Top districts: [District 1], [District 2], [District 3]
• Infrastructure projects: [Project 1], [Project 2]

👩‍💼 UNTUK AGENT:
• Akses buyer database nasional ASTRA
• Premium exposure ke investor serius
• Dashboard performa real-time
👉 Daftar agent: [link]

🏡 UNTUK BUYER:
• [X]+ properti terverifikasi
• Market intelligence gratis
• Instant viewing booking
👉 Mulai cari: [link]

🏗️ UNTUK DEVELOPER:
• Project showcase landing page
• Investor lead routing
• Demand analytics insights
👉 Partner program: [link]

📞 [City] Hotline: [Phone]
📧 [city]@astravilla.com`,
  kpis: [
    { metric: 'Listings in 60 Days', target: '≥300 per city', current: 'N/A' },
    { metric: 'Inquiry Velocity (Day 30)', target: '≥30/day', current: 'N/A' },
    { metric: 'Time to First Deal', target: '≤45 days', current: 'N/A' },
    { metric: 'City Break-Even', target: '≤Month 9', current: 'N/A' },
    { metric: 'Market Share (Month 6)', target: '≥10%', current: 'N/A' },
  ],
};

const institutionalPipeline = {
  segments: [
    { segment: 'Property Investment Funds', profile: 'AUM $10M-$500M, seeking yield + appreciation portfolios', dealSize: 'Rp 5B — Rp 100B per transaction', approach: 'Curated portfolio packages + quarterly performance reports', engagementCycle: '3-6 months from intro to first deal' },
    { segment: 'Family Offices & HNW Syndicates', profile: 'Net worth $5M+, seeking diversified real estate exposure', dealSize: 'Rp 2B — Rp 50B per transaction', approach: 'Personalized deal flow + exclusive access events', engagementCycle: '1-3 months from intro to first deal' },
    { segment: 'Developer JV Partners', profile: 'Seeking co-development capital or land bank partners', dealSize: 'Rp 10B — Rp 200B per project', approach: 'Project pipeline visibility + co-investment structuring', engagementCycle: '6-12 months per JV deal' },
    { segment: 'REIT & Portfolio Acquirers', profile: 'Systematic bulk acquisition for rental or flip portfolios', dealSize: 'Rp 20B — Rp 500B per portfolio', approach: 'Algorithmic deal scoring + bulk transaction facilitation', engagementCycle: '3-9 months per portfolio deal' },
  ],
  pipelineStages: [
    { stage: 'Prospect', criteria: 'Identified institutional investor matching target profile', action: 'Research + initial outreach email/LinkedIn', conversion: '20% to Qualified' },
    { stage: 'Qualified', criteria: 'Confirmed investment mandate + budget range + timeline', action: 'Schedule introductory call + send platform overview', conversion: '40% to Engaged' },
    { stage: 'Engaged', criteria: 'Active dialogue + received deal criteria + platform demo completed', action: 'Curate deal shortlist + provide market intelligence briefing', conversion: '30% to Active' },
    { stage: 'Active', criteria: 'Reviewing specific deals + requested detailed analysis', action: 'Facilitate site visits + provide due diligence support', conversion: '50% to Transaction' },
    { stage: 'Transaction', criteria: 'LOI/offer submitted or deal in negotiation', action: 'Deal coordination + legal/financing facilitation', conversion: '70% to Closed' },
    { stage: 'Closed', criteria: 'Deal completed + capital deployed', action: 'Post-deal reporting + relationship nurture for repeat deals', conversion: 'N/A — retention focus' },
  ],
  outreachTemplate: `Subject: Curated Property Investment Opportunities — [City/Region]

Dear [Name],

I'm [Founder Name], CEO of ASTRA Villa — Indonesia's fastest-growing property intelligence marketplace.

We've identified several opportunities that align with [Fund/Family Office Name]'s investment criteria:

📊 PLATFORM INTELLIGENCE:
• Active listings: [X]+  across [Y] cities
• Monthly transaction volume: Rp [Z]B facilitated
• Institutional-grade analytics on [W]+ data points

🏢 CURATED OPPORTUNITIES (matching your [criteria]):

1. [Opportunity 1] — [District], [City]
   • Type: [Property Type] | Units: [X]
   • Price: Rp [Price] | Yield: [X]%
   • Status: [Available/Pre-launch]

2. [Opportunity 2] — [District], [City]
   • Type: [Property Type] | Units: [X]  
   • Price: Rp [Price] | Yield: [X]%
   • Status: [Available/Pre-launch]

💎 INSTITUTIONAL ACCESS:
• Priority deal alerts before public listing
• Custom portfolio analytics dashboard
• Due diligence data room per opportunity
• On-ground inspection coordination

I'd welcome 20 minutes to discuss how ASTRA can serve as your deal sourcing and intelligence partner in Indonesia's Rp [X] trillion property market.

Available: [Proposed times]

Best regards,
[Founder Name]
CEO, ASTRA Villa
[Phone] | [Email]
[LinkedIn]`,
  kpis: [
    { metric: 'Institutional Inquiries', target: '≥10/quarter' },
    { metric: 'Capital Volume Influenced', target: '≥Rp 50B/quarter' },
    { metric: 'Repeat Deal Rate', target: '≥40% within 12 months' },
    { metric: 'Pipeline Value', target: '≥Rp 200B active pipeline' },
    { metric: 'Avg Deal Size', target: '≥Rp 10B per institutional deal' },
  ],
};

const profitability = {
  revenueLevers: [
    { lever: 'Premium Listing ARPU Growth', current: 'Rp 200K/vendor/month', target: 'Rp 500K/vendor/month', tactics: ['Introduce tiered premium packages (Basic/Pro/Enterprise)', 'Dynamic pricing based on district demand index', 'Bundle boost credits with subscription plans'], impact: 'High' },
    { lever: 'Subscription Recurring Revenue', current: '15% of total revenue', target: '45% of total revenue', tactics: ['Launch annual subscription with 20% discount vs monthly', 'Create "Agency Plan" for team-based subscriptions', 'Add value-adds: analytics, priority leads, co-marketing'], impact: 'Critical' },
    { lever: 'Transaction Fee Layer', current: 'Not implemented', target: '1-2% success fee on facilitated deals', tactics: ['Introduce optional "Deal Facilitation" premium service', 'Bundle with legal/financing coordination', 'Start with developer projects, expand to resale'], impact: 'High' },
    { lever: 'Data Intelligence Monetization', current: 'Not implemented', target: 'Rp 50M/month', tactics: ['Sell district-level market reports to developers/agencies', 'Offer institutional analytics subscription tier', 'License anonymized market data to research firms'], impact: 'Medium' },
  ],
  costOptimization: [
    { area: 'Customer Acquisition Cost', current: 'Rp 150K/buyer', target: 'Rp 80K/buyer', actions: ['Shift 40% of spend to organic/referral channels', 'Optimize ad targeting using lookalike from closed deals', 'Reduce reliance on paid — grow SEO + content traffic'] },
    { area: 'Vendor Onboarding Cost', current: 'Rp 300K/agent', target: 'Rp 100K/agent', actions: ['Self-service onboarding portal with video tutorials', 'Bulk upload API reducing manual assistance', 'Referral-driven agent acquisition (near-zero CAC)'] },
    { area: 'Operational Overhead', current: '45% of revenue', target: '25% of revenue', actions: ['Automate inquiry routing and follow-up reminders', 'Self-service vendor dashboard reducing support tickets', 'AI-assisted listing quality review replacing manual checks'] },
    { area: 'Marketing Spend Efficiency', current: 'ROAS 2.5x', target: 'ROAS 5x', actions: ['Kill underperforming channels weekly', 'Double down on highest-converting district campaigns', 'Attribution model linking spend → inquiry → deal'] },
  ],
  unitEconomics: {
    template: `📊 UNIT ECONOMICS DASHBOARD — [Month] [Year]

━━━━━━ REVENUE ━━━━━━
Premium Listings:     Rp [X]M  ([Y]% of total)
Subscriptions:        Rp [X]M  ([Y]% of total)
Developer Campaigns:  Rp [X]M  ([Y]% of total)
Transaction Fees:     Rp [X]M  ([Y]% of total)
Data Intelligence:    Rp [X]M  ([Y]% of total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL REVENUE:        Rp [X]M

━━━━━━ COSTS ━━━━━━
Marketing/Acquisition: Rp [X]M  ([Y]% of revenue)
Operations/Support:    Rp [X]M  ([Y]% of revenue)
Technology/Hosting:    Rp [X]M  ([Y]% of revenue)
Team/Salaries:         Rp [X]M  ([Y]% of revenue)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL COSTS:           Rp [X]M

━━━━━━ MARGINS ━━━━━━
Gross Margin:          [X]%
Contribution Margin:   [X]%
Operating Margin:      [X]%
Burn Rate:             Rp [X]M/month
Runway:                [X] months

━━━━━━ EFFICIENCY ━━━━━━
CAC (Buyer):           Rp [X]K
CAC (Vendor):          Rp [X]K
LTV (Buyer):           Rp [X]M
LTV (Vendor):          Rp [X]M
LTV/CAC Ratio:         [X]x
Payback Period:        [X] months

━━━━━━ PER-CITY P&L ━━━━━━
[City 1]: Revenue Rp [X]M | Costs Rp [Y]M | Margin [Z]%
[City 2]: Revenue Rp [X]M | Costs Rp [Y]M | Margin [Z]%
[City 3]: Revenue Rp [X]M | Costs Rp [Y]M | Margin [Z]%`,
  },
  kpis: [
    { metric: 'Revenue per Listing', target: '≥Rp 150K/month', current: 'Rp 45K' },
    { metric: 'Buyer CAC', target: '≤Rp 80K', current: 'Rp 150K' },
    { metric: 'LTV/CAC Ratio', target: '≥5x', current: '1.8x' },
    { metric: 'Subscription Revenue %', target: '≥45%', current: '15%' },
    { metric: 'Operating Margin', target: '≥20%', current: '-35%' },
  ],
};

const quarterlyChecklist = [
  { category: 'Regional Expansion', items: ['Review new city performance vs 60-day targets', 'Assess market selection pipeline for next expansion', 'Audit supply density in each city by district', 'Compare per-city unit economics and contribution margin'] },
  { category: 'Institutional Pipeline', items: ['Review pipeline value and stage progression', 'Track institutional inquiry frequency trend', 'Assess repeat deal participation from existing partners', 'Update curated opportunity shortlists'] },
  { category: 'Profitability', items: ['Analyze revenue mix shift (subscription vs transactional)', 'Review CAC trends by channel and city', 'Audit operational cost as % of revenue', 'Model path-to-profitability timeline update'] },
  { category: 'Strategic Health', items: ['Competitive positioning assessment per city', 'Team capacity vs growth rate alignment', 'Technology infrastructure scalability check', 'Fundraising runway and capital needs review'] },
];

const risks = [
  { signal: 'New city launch burning cash without reaching inquiry velocity targets', severity: 92, mitigation: 'Hard gate: kill or pause city if <15 inquiries/day by Day 60; pre-commit max burn per city at Rp 150M' },
  { signal: 'Institutional pipeline becoming window-shoppers without deal conversion', severity: 84, mitigation: 'Qualify hard on investment timeline and mandate; focus on family offices (faster decisions) before funds; track pipeline velocity not just volume' },
  { signal: 'Premature multi-city expansion weakening home market dominance', severity: 90, mitigation: 'Do not expand until home city has ≥25% market share and positive contribution margin; assign dedicated teams per city' },
  { signal: 'Revenue growth masking deteriorating unit economics', severity: 87, mitigation: 'Monthly unit economics review per city; flag any city with LTV/CAC <2x for immediate optimization; separate growth metrics from efficiency metrics' },
  { signal: 'Operational complexity scaling faster than team capacity', severity: 85, mitigation: 'Hire City Lead before launch (not after); build playbooks that 80% self-serve; centralize tech and analytics, decentralize only BD and ops' },
];

const RegionalInstitutionalProfitabilityBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Map className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Regional Expansion + Institutional Pipeline + Profitability</h2>
          <p className="text-sm text-muted-foreground">Multi-city scaling, institutional capital engagement & unit-economics optimization</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="regional" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="regional"><Map className="h-4 w-4 mr-1.5" />Regional Expansion</TabsTrigger>
        <TabsTrigger value="institutional"><Landmark className="h-4 w-4 mr-1.5" />Institutional Pipeline</TabsTrigger>
        <TabsTrigger value="profitability"><TrendingUp className="h-4 w-4 mr-1.5" />Profitability</TabsTrigger>
        <TabsTrigger value="quarterly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Quarterly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* REGIONAL TAB */}
      <TabsContent value="regional" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />City Selection Scoring Matrix</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {regionalExpansion.selectionMatrix.map((f, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{f.factor}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Weight: {f.weight}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{f.scoring}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4 text-chart-3" />5-Phase City Rollout</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {regionalExpansion.rolloutPhases.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{p.phase}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{p.budget}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {p.actions.map((a, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {a}</Badge>
                    ))}
                  </div>
                  <div className="p-1.5 rounded bg-primary/5 border border-primary/10">
                    <span className="text-[10px] text-primary font-medium">🚦 Gate: {p.gate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {regionalExpansion.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">City Launch Announcement Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={regionalExpansion.cityLaunchTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* INSTITUTIONAL TAB */}
      <TabsContent value="institutional" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" />Target Segments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {institutionalPipeline.segments.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{s.segment}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{s.dealSize}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{s.profile}</p>
                  <p className="text-[10px] text-foreground mt-0.5">🎯 {s.approach}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">⏱️ {s.engagementCycle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-3" />6-Stage Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {institutionalPipeline.pipelineStages.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-24 justify-center flex-shrink-0 mt-0.5">{s.stage}</Badge>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-foreground">{s.criteria}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">→ {s.action}</p>
                  </div>
                  <Badge className="text-[9px] bg-chart-3/10 text-chart-3 border-chart-3/20 flex-shrink-0">{s.conversion}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {institutionalPipeline.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Institutional Outreach Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={institutionalPipeline.outreachTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* PROFITABILITY TAB */}
      <TabsContent value="profitability" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-chart-3" />Revenue Growth Levers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {profitability.revenueLevers.map((l, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{l.lever}</span>
                    <Badge className={`text-[10px] ${l.impact === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{l.impact}</Badge>
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] text-destructive">{l.current}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{l.target}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {l.tactics.map((t, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {t}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Cost Optimization Areas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {profitability.costOptimization.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{c.area}</span>
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] text-destructive">{c.current}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{c.target}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.actions.map((a, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {a}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {profitability.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{k.target}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Unit Economics Dashboard Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={profitability.unitEconomics.template} /></CardContent>
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

export default RegionalInstitutionalProfitabilityBlueprint;
