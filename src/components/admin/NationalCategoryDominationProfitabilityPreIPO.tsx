import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, AlertTriangle, TrendingUp, Target, Shield, DollarSign, BarChart3, Users, Zap, Building2, Eye, Scale, LineChart, Landmark } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: National Category Domination ── */
const dominationPhases = [
  { phase: 'Phase 1 — Liquidity Density Control', icon: Building2, description: 'Secure dominant inventory position across all major markets', tactics: [
    { tactic: 'Top-10 City Inventory Dominance', detail: 'Achieve >25% listing market share in each of the 10 largest metro areas — map competitor inventory gaps and aggressively onboard agencies covering those zones' },
    { tactic: 'Exclusive Developer Pipeline', detail: 'Sign 50+ exclusive new-development partnerships — first-to-market access on 500+ new units/quarter creates supply moat competitors cannot replicate' },
    { tactic: 'Price Segment Balancing', detail: 'Maintain minimum 20% inventory in each price tier (entry/mid/premium/luxury) per city — prevents being typecast as niche platform' },
    { tactic: 'Anchor Agency Lock-In', detail: 'Top 100 agencies by volume on multi-year contracts with performance bonuses — their entire workflow runs through platform, creating structural switching costs' },
    { tactic: 'Listing Quality Superiority', detail: 'Enforce minimum quality standards (5+ photos, verified pricing, complete specs) — achieve >85% compliance making platform the most trustworthy discovery source' },
  ]},
  { phase: 'Phase 2 — Demand Authority Expansion', icon: Users, description: 'Establish platform as the default starting point for property decisions', tactics: [
    { tactic: 'National Brand Campaign', detail: '"Every property decision starts here" — coordinated TV, digital, outdoor campaign across 10 cities simultaneously; target 60%+ aided brand recall among property seekers' },
    { tactic: 'Market Intelligence Authority', detail: 'Publish monthly National Property Index cited by media — become the Bloomberg of Indonesian real estate; 100+ media mentions/quarter' },
    { tactic: 'Multi-City Synchronized Promotions', detail: 'Quarterly national property events: "National Investment Week" with simultaneous virtual tours, exclusive deals, and live market briefings across all cities' },
    { tactic: 'Strategic Content Partnerships', detail: 'Co-branded content with top 5 banks, 10 developers, and financial media — leverage partner audiences of 10M+ combined reach' },
    { tactic: 'Category Terminology Ownership', detail: 'Coin and promote "Property Liquidity Intelligence" as industry term — conference keynotes, whitepapers, media commentary establishing new category' },
  ]},
  { phase: 'Phase 3 — Competitive Barrier Reinforcement', icon: Shield, description: 'Build moats that make leadership position increasingly difficult to challenge', tactics: [
    { tactic: 'Vendor Analytics Advantage', detail: 'Free portfolio analytics suite no competitor offers — vendors depend on platform data for pricing, demand insights, and performance benchmarking' },
    { tactic: 'Personalized Discovery Engine', detail: 'AI-powered recommendation accuracy exceeding 40% engagement rate — buyers find better matches faster than anywhere else, creating habitual return behavior' },
    { tactic: 'Network Effect Compounding', detail: 'Every new listing increases buyer value → every new buyer increases vendor value → measure and accelerate this ratio quarterly, targeting >1.5x cross-side elasticity' },
    { tactic: 'Data Moat Accumulation', detail: '10M+ behavioral signals/month feeding prediction models — accuracy advantage compounds monthly; competitors starting now need 2+ years to match' },
    { tactic: 'Ecosystem Integration Depth', detail: 'Financing, legal, and property management integrations create "platform as workflow" — users complete entire property lifecycle without leaving ecosystem' },
  ]},
];

const leadershipKPIs = [
  { kpi: 'National Listings Market Share', target: '>25% in top-10 cities', description: 'Platform listings as % of total market inventory' },
  { kpi: 'Inquiries Per Listing Ratio', target: '>2x competitor average', description: 'Demand density proving platform superiority' },
  { kpi: 'Brand Search Volume Growth', target: '>25% quarterly', description: 'Direct brand name searches on Google' },
  { kpi: 'Vendor Retention Rate', target: '>90% annual', description: 'Active vendors remaining on platform year-over-year' },
  { kpi: 'Exclusive Listing Share', target: '>15%', description: 'Listings available only on platform' },
  { kpi: 'Media Citation Frequency', target: '>100/quarter', description: 'Press mentions citing platform data or insights' },
];

/* ── Section 2: Profitability Inflection ── */
const profitabilityPillars = [
  { pillar: 'Revenue Depth Optimization', icon: DollarSign, description: 'Extract maximum value from existing user base before scaling further', levers: [
    { lever: 'Vendor Subscription Penetration', detail: 'Target 40% of active vendors on paid plans — tiered packages (Boost $15/mo, Pro $40/mo, Agency $100/mo, Enterprise custom) with clear ROI demonstration at each tier' },
    { lever: 'Enterprise Promotion Bundles', detail: 'Large developers and agencies: $2K-10K/month packages bundling featured placement, market reports, lead priority, and brand advertising — target 50 enterprise accounts' },
    { lever: 'Data Intelligence Products', detail: 'Subscription analytics for investors ($50/mo), developers ($200/mo), and institutions ($1K/mo) — monetize behavioral intelligence as standalone revenue stream' },
    { lever: 'Transaction Commission Optimization', detail: 'Introduce success-fee model: 0.5-1% facilitation fee on deals closed through platform — starts with opt-in premium service including negotiation support and legal coordination' },
    { lever: 'Financing Referral Revenue', detail: 'Mortgage referral partnerships with 5+ banks — earn $200-500 per qualified lead; target 500+ qualified referrals/month at scale' },
  ]},
  { pillar: 'Cost Efficiency & Leverage', icon: Scale, description: 'Reduce cost-to-serve while maintaining quality growth', levers: [
    { lever: 'Onboarding Automation', detail: 'Self-serve vendor onboarding with AI-assisted listing creation — reduce onboarding cost from $15/vendor to <$2/vendor; target 90% self-serve rate' },
    { lever: 'Deal Coordination Automation', detail: 'Automated viewing scheduling, offer tracking, and status updates — reduce human coordination cost per deal by 60%; handle 3x volume with same team size' },
    { lever: 'Marketing Efficiency Optimization', detail: 'Shift from paid acquisition to organic/referral/brand — target <30% of traffic from paid channels; reduce blended CAC by 40% over 12 months' },
    { lever: 'Infrastructure Cost Management', detail: 'Optimize database queries, implement aggressive caching, use CDN for media — target <5% of revenue on infrastructure costs' },
    { lever: 'Support Ticket Deflection', detail: 'AI-powered help center + chatbot handling 70% of vendor/buyer queries — reduce support cost per active user by 50%' },
  ]},
  { pillar: 'Unit Economics Governance', icon: LineChart, description: 'Monitor and optimize financial health at granular level', levers: [
    { lever: 'City-Level Contribution Margin', detail: 'Track revenue minus direct costs per city — identify which markets are profitable vs subsidized; target positive contribution in 8/10 top cities within 12 months' },
    { lever: 'CAC/LTV Sustainability Dashboard', detail: 'Real-time CAC vs projected 24-month LTV by segment — maintain >4:1 ratio for vendors, >2:1 for buyers; flag segments below threshold for intervention' },
    { lever: 'Cohort Revenue Analysis', detail: 'Track revenue per cohort at 3/6/12/24 month marks — prove that user value increases with platform tenure, supporting retention investment' },
    { lever: 'Channel Profitability Ranking', detail: 'Rank acquisition channels by fully-loaded CAC including support and onboarding costs — eliminate channels with <2:1 payback ratios' },
    { lever: 'High-Yield Zone Prioritization', detail: 'Allocate growth investment proportional to contribution margin potential — stop subsidizing markets with structural profitability challenges' },
  ]},
];

const profitabilityKPIs = [
  { kpi: 'Operating Margin Trend', target: 'Improving >2% quarterly', description: 'Revenue minus all operating costs as percentage' },
  { kpi: 'Revenue Per Active Listing', target: '>$30/month avg', description: 'Total revenue / active listings showing monetization depth' },
  { kpi: 'Marketing Efficiency Ratio', target: '>5:1 revenue/spend', description: 'Revenue generated per marketing dollar spent' },
  { kpi: 'Vendor CAC Payback', target: '<4 months', description: 'Time to recover vendor acquisition cost from subscription revenue' },
  { kpi: 'Gross Margin', target: '>75%', description: 'Revenue minus direct costs of service delivery' },
  { kpi: 'Organic Revenue Share', target: '>60%', description: 'Revenue from users acquired through non-paid channels' },
];

/* ── Section 3: Pre-IPO Discipline ── */
const disciplineFrameworks = [
  { framework: 'Strategic Execution Rhythm', icon: Target, elements: [
    { element: 'Quarterly Growth Milestones', spec: 'Define 4 measurable milestones per quarter (revenue, users, listings, deals) — board-reviewed with variance analysis and corrective action plans' },
    { element: 'Expansion Pacing Protocol', spec: 'New city launches gated by: existing city profitability, available capital runway, team capacity — no more than 2 new cities per quarter to prevent overextension' },
    { element: 'Monetization Performance Reviews', spec: 'Monthly deep-dive into revenue mix, pricing effectiveness, and conversion funnel — identify and resolve monetization bottlenecks within 30-day cycles' },
    { element: 'Annual Strategic Planning Cycle', spec: '3-year rolling plan updated annually — aligns team around long-term trajectory while maintaining quarterly execution flexibility' },
    { element: 'Initiative Kill Criteria', spec: 'Clear thresholds for abandoning underperforming initiatives — if not showing traction within 90 days and 2 pivots, reallocate resources to proven channels' },
  ]},
  { framework: 'Transparency & Investor Readiness', icon: Eye, elements: [
    { element: 'Standardized KPI Reporting', spec: 'Monthly board deck with 15 core metrics in consistent format — auditable data sources, clear definitions, no vanity metrics; ready for due diligence scrutiny' },
    { element: 'Predictable Revenue Storytelling', spec: 'Demonstrate 3+ quarters of consistent growth pattern — show revenue is driven by repeatable systems, not one-time campaigns or seasonal spikes' },
    { element: 'Operational Risk Dashboard', spec: 'Real-time monitoring of 10 risk indicators: vendor concentration, geographic dependency, churn spikes, margin pressure — automatic alerts when thresholds breached' },
    { element: 'Financial Audit Readiness', spec: 'Quarterly internal audits, clean financial statements, documented revenue recognition policies — ready for Big 4 audit within 90 days of engagement' },
    { element: 'Data Room Maintenance', spec: 'Continuously updated investor data room: financials, cap table, legal documents, key contracts, team org chart — always ready for due diligence requests' },
  ]},
  { framework: 'Long-Term Stability Signals', icon: Landmark, elements: [
    { element: 'Recurring Revenue Ratio', spec: 'Target >50% of revenue from subscriptions and recurring contracts — demonstrates predictability and reduces investor perceived risk' },
    { element: 'Vendor Retention Consistency', spec: 'Maintain >90% annual vendor retention with cohort analysis — prove that vendor value perception strengthens over time, not decays' },
    { element: 'Demand Pipeline Predictability', spec: 'Develop 90-day forward-looking demand forecast with <15% variance — show platform can reliably predict and plan for growth' },
    { element: 'Team & Culture Scalability', spec: 'Documented processes, clear org structure, leadership bench strength — prove company operates as institution, not founder-dependent startup' },
    { element: 'Regulatory Compliance Framework', spec: 'Proactive compliance with data protection, financial services, and real estate regulations — no legal risks that could derail IPO timeline' },
  ]},
];

const disciplineKPIs = [
  { kpi: 'Growth Consistency Index', target: '>85/100', description: 'Composite score of revenue, user, and listing growth consistency over 4 quarters' },
  { kpi: 'Governance Credibility Score', target: 'Audit-ready', description: 'Readiness for external financial and operational audit' },
  { kpi: 'Recurring Revenue Ratio', target: '>50%', description: 'Subscription + contract revenue as share of total' },
  { kpi: 'Forward Pipeline Accuracy', target: '<15% variance', description: '90-day demand forecast vs actual performance' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Market Leadership Health', items: ['National listings share >25% in top-10 cities tracked', 'Inquiries-per-listing superiority ratio measured vs competitors', 'Brand search volume growing >25% quarterly', 'Exclusive listing partnerships pipeline maintained', 'Media citations >100/quarter sustained'] },
  { category: 'Profitability Trajectory', items: ['Operating margin improving >2% per quarter', 'Vendor subscription penetration >40% achieved or on track', 'Marketing efficiency ratio >5:1 maintained', 'City-level contribution margins reviewed monthly', 'CAC payback <4 months across all segments'] },
  { category: 'Pre-IPO Governance', items: ['Monthly board deck with 15 core KPIs delivered consistently', 'Data room updated and audit-ready at all times', 'Recurring revenue ratio >50% achieved or trending', 'Quarterly growth milestones met with <10% variance', 'Risk dashboard monitoring 10 indicators in real-time'] },
  { category: 'Organizational Readiness', items: ['Key leadership positions filled with experienced operators', 'Documented SOPs for all critical business processes', 'Financial statements prepared to external audit standard', 'Regulatory compliance framework reviewed quarterly', 'Team retention >85% annual among senior leadership'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Market share concentration illusion: strong in 2-3 cities but weak nationally, creating misleading leadership narrative', mitigation: 'Track market share per city individually; set minimum thresholds for each top-10 city; allocate resources to weakest markets first' },
  { risk: 'Profitability at the cost of growth: margin optimization slowing user/listing growth below competitive pace', mitigation: 'Define minimum growth rate floors (>10% quarterly) that cannot be sacrificed for margin; maintain growth investment in high-potential markets' },
  { risk: 'Pre-IPO metric gaming: optimizing for investor-facing KPIs rather than genuine business health', mitigation: 'Use leading indicators (engagement, retention, NPS) alongside financial metrics; ensure metrics are auditable and methodology-consistent' },
  { risk: 'Vendor dependency concentration: top 20% of vendors generating >60% of revenue creating single-point-of-failure risk', mitigation: 'Actively diversify vendor base; cap revenue concentration from any single vendor at <5%; develop mid-tier vendor monetization programs' },
  { risk: 'Regulatory surprise: new PropTech regulations or data privacy requirements disrupting operations close to IPO timeline', mitigation: 'Maintain proactive regulatory engagement; build compliance buffer into all product decisions; retain specialized legal counsel for ongoing monitoring' },
];

export default function NationalCategoryDominationProfitabilityPreIPO() {
  const [activeTab, setActiveTab] = useState('domination');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Crown className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">National Category Domination + Profitability Inflection + Pre-IPO Discipline</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Market leadership, margin expansion & governance-grade growth discipline</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">👑 National Domination</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="domination">👑 Domination</TabsTrigger>
          <TabsTrigger value="profitability">💰 Profitability</TabsTrigger>
          <TabsTrigger value="discipline">🏛️ Pre-IPO</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="domination" className="space-y-4 mt-4">
          {dominationPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.phase}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.tactics.map((t, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{t.tactic}</span>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Leadership KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{leadershipKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4 mt-4">
          {profitabilityPillars.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.pillar}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.levers.map((l, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{l.lever}</span>
                    <p className="text-xs text-muted-foreground">{l.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Profitability KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{profitabilityKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="discipline" className="space-y-4 mt-4">
          {disciplineFrameworks.map((f, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><f.icon className="h-4 w-4 text-primary" /> {f.framework}</CardTitle></CardHeader>
                <CardContent className="grid gap-2">{f.elements.map((e, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{e.element}</span>
                    <p className="text-xs text-muted-foreground">{e.spec}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Discipline KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{disciplineKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
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
