import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Landmark, CheckCircle, AlertTriangle, TrendingUp, Target, Globe, DollarSign, BarChart3, Users, Zap, Brain, Shield, Eye, Cpu, MapPin, Banknote, Layers } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: IPO Roadshow ── */
const roadshowPillars = [
  { pillar: 'Market Opportunity Framing', icon: Globe, description: 'Position the platform as essential digital infrastructure, not just another listing portal', elements: [
    { element: '$47B Indonesian Real Estate Transaction TAM', detail: 'Property transactions generate $47B annually with <5% digital penetration — platform captures value by reducing friction, improving price discovery, and accelerating deal velocity across the entire transaction lifecycle' },
    { element: 'Intelligence Services TAM Expansion', detail: 'Beyond transactions: $2B addressable market in property analytics, investment intelligence, and data products — platform monetizes behavioral data that no competitor is collecting at this scale' },
    { element: 'Structural Inefficiency Thesis', detail: 'Average property transaction takes 120+ days with 7+ intermediaries — platform reduces to 45 days with 2-3 touchpoints; every basis point of friction reduction unlocks billions in latent market activity' },
    { element: 'Platform Infrastructure Positioning', detail: '"We are not a listing site. We are the transaction coordination layer for the largest asset class in Southeast Asia" — shift investor mental model from marketplace to infrastructure' },
    { element: 'Category Leadership Proof', detail: 'First mover in "Property Liquidity Intelligence" — coined the category, defined the metrics, set the industry benchmarks; competitors are followers, not innovators' },
  ]},
  { pillar: 'Growth Proof Narrative', icon: TrendingUp, description: 'Demonstrate that growth is systematic, repeatable, and accelerating', elements: [
    { element: 'City Domination Playbook Replication', detail: 'Show identical growth curves across 10+ cities: supply seeding → demand activation → network effect → monetization → profitability — each city follows the same 9-month arc with improving efficiency' },
    { element: 'Network Effect Acceleration Metrics', detail: 'Cross-side elasticity >1.5x: every 10% increase in listings drives 15%+ increase in buyer engagement — this ratio is improving quarterly, proving strengthening network effects' },
    { element: 'Revenue Compounding Evidence', detail: 'MRR growing at >15% MoM with >50% from recurring subscriptions — demonstrate that revenue growth is driven by systematic monetization expansion, not one-time deals' },
    { element: 'Liquidity Flywheel Visualization', detail: 'Interactive slide showing: More listings → More buyers → More transactions → Better data → Better matching → More listings — with real metrics at each node proving the flywheel is spinning' },
    { element: 'Unit Economics Maturity', detail: 'Vendor CAC payback <4 months, LTV/CAC >5:1, gross margin >75% — prove that growth spending generates profitable, predictable returns' },
  ]},
  { pillar: 'Investor Confidence Signals', icon: Shield, description: 'Remove perceived risk and build conviction through proof points', elements: [
    { element: 'Retention & Engagement Depth', detail: 'Vendor retention >90% annual, buyer 30-day return rate >35%, average session depth >4 pages — users are not just visiting, they are building workflows around the platform' },
    { element: 'Institutional Partnership Traction', detail: '50+ exclusive developer partnerships, 5+ bank integrations, 3+ institutional investor data clients — platform is embedded in the professional property ecosystem' },
    { element: 'Margin Expansion Trajectory', detail: 'Operating margin improving >2% quarterly for 6+ consecutive quarters — demonstrate path to 25%+ operating margin at scale within 24 months' },
    { element: 'Governance & Audit Readiness', detail: 'Big 4 audited financials, independent board members, SOC 2 compliance roadmap — institutional-grade governance eliminating operational risk perception' },
    { element: 'Management Team Credibility', detail: 'Highlight key hires with relevant scale experience — CTO from [tech company], CFO with IPO experience, COO with marketplace scaling track record' },
  ]},
];

const roadshowKPIs = [
  { kpi: 'Investor Meeting Conversion', target: '>30% to follow-up', description: 'First meetings converting to deep-dive or term sheet discussions' },
  { kpi: 'Valuation Premium Signal', target: '>15x ARR multiple', description: 'Target valuation reflecting infrastructure positioning vs marketplace comps' },
  { kpi: 'Roadshow Efficiency', target: '<60 meetings to close', description: 'Total investor meetings needed to complete allocation' },
  { kpi: 'Anchor Investor Commitment', target: '>40% from top-3 investors', description: 'Concentration of book from high-conviction institutional anchors' },
  { kpi: 'Oversubscription Target', target: '>3x', description: 'Total demand vs shares offered indicating strong market appetite' },
];

/* ── Section 2: Capital Allocation ── */
const allocationFrameworks = [
  { framework: 'Market Prioritization Logic', icon: MapPin, description: 'Allocate capital to highest-return markets using data-driven scoring', strategies: [
    { strategy: 'Liquidity Readiness Score', detail: 'Score each potential market (0-100) on: existing inquiry volume (25%), vendor onboarding pipeline (20%), competitor weakness (20%), demographic demand signals (20%), regulatory ease (15%) — only launch markets scoring >65' },
    { strategy: 'Demand-Supply Signal Density', detail: 'Before committing capital, validate with 30-day signal test: seed 50 listings, measure organic inquiry rate — markets generating >5 inquiries/listing/week within 30 days get full investment' },
    { strategy: 'Revenue Activation Timing', detail: 'Stage capital deployment: Month 1-2 supply seeding ($20K), Month 3-4 demand activation ($30K), Month 5-6 monetization push ($15K) — total $65K per city with breakeven target at month 9' },
    { strategy: 'Adjacent Market Clustering', detail: 'Launch cities in geographic clusters (e.g., Greater Jakarta, then Bandung-Semarang corridor) — shared marketing, cross-city demand routing, and operational efficiency from proximity' },
    { strategy: 'Retreat Criteria', detail: 'If market does not achieve 100+ active listings and 500+ monthly inquiries within 6 months, pause investment and reallocate — disciplined capital preservation over sunk-cost expansion' },
  ]},
  { framework: 'Capital Efficiency Governance', icon: Banknote, description: 'Maximize return on every expansion dollar deployed', strategies: [
    { strategy: 'Payback Period Tracking', detail: 'Every city launch has a 12-month capital recovery target — track monthly revenue vs cumulative investment; flag markets not on track by month 6 for intervention or exit' },
    { strategy: 'Scalable Channel Prioritization', detail: 'Rank acquisition channels by fully-loaded ROI per market: SEO (highest long-term), referral loops, local partnerships, paid digital — allocate 60% to channels with >5:1 payback' },
    { strategy: 'Growth vs Profitability Balance', detail: 'Maintain portfolio-level rule: 60% of cities must be contribution-positive, 30% in investment phase, 10% in pilot — never have >40% of markets burning cash simultaneously' },
    { strategy: 'Centralized vs Local Spend Split', detail: 'Target 70% centralized (tech, national brand, shared services) / 30% local (city marketing, agent teams) — maximize leverage from shared infrastructure' },
    { strategy: 'Quarterly Reallocation Reviews', detail: 'Every quarter, redistribute 15-20% of expansion budget from underperforming to outperforming markets — dynamic capital allocation, not static annual budgets' },
  ]},
  { framework: 'Strategic Portfolio Diversification', icon: Layers, description: 'Build geographic and segment resilience into expansion portfolio', strategies: [
    { strategy: 'Mature vs Emerging Mix', detail: 'Maintain 60% revenue from established cities (Jakarta, Surabaya, Bandung), 30% from growth cities, 10% from new markets — ensures stability while funding expansion' },
    { strategy: 'Concentration Risk Limits', detail: 'No single city >30% of total revenue, no single vendor >5% of revenue, no single channel >40% of traffic — systematic diversification reducing single-point-of-failure risk' },
    { strategy: 'Cross-Region Demand Routing', detail: 'Active investors searching in Jakarta shown opportunities in Bali, Bandung, Semarang — increase geographic discovery breadth and reduce demand concentration' },
    { strategy: 'Segment Diversification', detail: 'Ensure revenue from residential (60%), commercial (25%), and development (15%) segments — reduces exposure to any single property cycle' },
    { strategy: 'International Readiness Assessment', detail: 'By Year 3 post-IPO, evaluate Southeast Asian expansion (Malaysia, Thailand, Vietnam) — prepare playbook localization, regulatory analysis, and capital requirements' },
  ]},
];

const capitalKPIs = [
  { kpi: 'Revenue Per Expansion Dollar', target: '>$3 annual revenue / $1 invested', description: 'Total city revenue vs cumulative expansion investment' },
  { kpi: 'Time to Breakeven', target: '<9 months per city', description: 'Average months to contribution-positive in new markets' },
  { kpi: 'Expansion Success Rate', target: '>80%', description: 'Cities achieving profitability target within 12 months' },
  { kpi: 'Geographic Revenue Diversity', target: 'No city >30%', description: 'Revenue concentration limit per market' },
  { kpi: 'Capital Deployment Efficiency', target: '>70% to proven channels', description: 'Share of spend going to channels with demonstrated >3:1 ROI' },
];

/* ── Section 3: Autonomous OS ── */
const osLayers = [
  { layer: 'Core Intelligence Engines', icon: Brain, description: 'Self-improving algorithms optimizing marketplace fundamentals', systems: [
    { system: 'Supply Liquidity Optimizer', spec: 'Continuously monitors listing density, quality scores, and engagement rates per district — auto-triggers vendor outreach when supply drops below demand-weighted thresholds; target <24h supply gap resolution' },
    { system: 'Demand Behavior Predictor', spec: 'Models buyer intent from search patterns, save behavior, inquiry timing, and viewing history — predicts purchase probability with >70% accuracy at 30-day horizon; feeds lead scoring and prioritization' },
    { system: 'Monetization Recommendation Engine', spec: 'Analyzes vendor performance data to generate personalized upgrade suggestions — "Upgrade to Pro: similar listings saw 3.2x more inquiries" — auto-triggered when listing underperforms district average by >30%' },
    { system: 'Pricing Intelligence Layer', spec: 'Real-time fair market value estimation using comparable transactions, demand signals, and district trends — powers vendor pricing guidance and buyer negotiation confidence indicators' },
    { system: 'Transaction Probability Scorer', spec: 'Predicts deal closure probability at each pipeline stage — prioritizes platform intervention resources on deals with >60% probability and >$50K potential commission' },
  ]},
  { layer: 'Growth Orchestration Framework', icon: Zap, description: 'Automated systems that execute growth playbooks without manual intervention', systems: [
    { system: 'Campaign Activation Triggers', spec: 'When district inquiry velocity exceeds 2x rolling average → auto-launch "Hot Market" promotion, vendor upgrade offers, and buyer urgency notifications — fully automated within 4-hour detection window' },
    { system: 'Adaptive Lead Router', spec: 'Routes inquiries to agents based on real-time scoring: response speed (30%), conversion rate (25%), listing expertise (25%), availability (20%) — continuously learns from outcomes to improve routing accuracy' },
    { system: 'Vendor Lifecycle Revenue Intelligence', spec: 'Tracks vendor journey from free → trial → basic → pro → enterprise — auto-triggers upgrade nudges, churn prevention interventions, and success story sharing at optimal moments' },
    { system: 'Content Generation Pipeline', spec: 'Auto-generates district market reports, listing descriptions, and SEO pages using real-time data — 50+ content pieces/week with human editorial review for quality assurance' },
    { system: 'Experiment Prioritization Engine', spec: 'Maintains backlog of growth experiments ranked by expected impact × confidence × effort — auto-allocates 15% of traffic to experiments; promotes winners to production within 7 days of statistical significance' },
  ]},
  { layer: 'Governance & Founder Control', icon: Eye, description: 'Human oversight ensuring AI serves business strategy, not the reverse', systems: [
    { system: 'Executive Command Dashboard', spec: 'Single-screen view: revenue trajectory, liquidity health, deal pipeline, risk alerts — updated real-time with drill-down capability to city/district/listing level; designed for <60 second daily review' },
    { system: 'AI Decision Audit Trail', spec: 'Every automated action logged with reasoning, input signals, and outcome — weekly audit report highlighting unusual patterns, edge cases, and false positives for human review' },
    { system: 'Strategic Override Controls', spec: 'Founder/C-suite can override any automated decision with one click — pausing campaigns, adjusting routing weights, changing pricing thresholds — override history tracked for learning' },
    { system: 'Ethical Guardrails Framework', spec: 'Hard limits on automated actions: no predatory urgency messaging, no discriminatory routing, no price manipulation — compliance checked before every automated action executes' },
    { system: 'Degradation Protocol', spec: 'If AI accuracy drops below thresholds or anomalous behavior detected, system gracefully degrades to rule-based defaults — prevents AI failures from impacting user experience' },
  ]},
];

const osKPIs = [
  { kpi: 'Automation Revenue Contribution', target: '>30% of total revenue', description: 'Revenue directly attributable to automated actions (upsells, routing, campaigns)' },
  { kpi: 'Deal Cycle Efficiency Gain', target: '>25% faster than manual', description: 'Transaction speed improvement from AI-assisted coordination' },
  { kpi: 'Prediction Accuracy', target: '>70% at 30-day horizon', description: 'Demand and transaction probability prediction reliability' },
  { kpi: 'Override Frequency', target: '<5% of automated decisions', description: 'Low override rate indicates AI alignment with business strategy' },
  { kpi: 'System Uptime', target: '>99.5%', description: 'Intelligence systems availability for critical marketplace operations' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'IPO Narrative Strength', items: ['Roadshow deck tested with 5+ practice investor meetings', 'TAM/SAM/SOM analysis validated with third-party data', 'Network effect metrics quantified and visualized', 'Unit economics audited and stress-tested', 'Management team bios and track records polished'] },
  { category: 'Capital Allocation Discipline', items: ['All active cities tracked on payback timeline', 'No single city exceeds 30% revenue concentration', 'Quarterly reallocation review completed', 'Expansion pipeline scored and ranked by readiness', 'Retreat criteria documented and enforced'] },
  { category: 'Autonomous OS Performance', items: ['AI prediction accuracy >70% maintained', 'Automated campaign triggers firing within SLA', 'Lead routing improving agent conversion rates', 'Audit trail reviewed weekly with no anomalies', 'Degradation protocols tested quarterly'] },
  { category: 'Governance Readiness', items: ['Financial statements audit-ready at all times', 'Board reporting cadence maintained monthly', 'Risk dashboard monitoring all 10 critical indicators', 'Regulatory compliance framework reviewed quarterly', 'Data room continuously updated and accessible'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Roadshow narrative disconnect: impressive metrics but investors sense "growth at all costs" without clear path to profitability', mitigation: 'Lead with unit economics and margin trajectory; show profitability timeline with quarterly milestones; emphasize capital efficiency discipline in every conversation' },
  { risk: 'Capital misallocation: expanding into too many cities simultaneously, diluting focus and extending payback periods beyond targets', mitigation: 'Enforce maximum 2 new city launches per quarter; require profitability in 60% of existing markets before new launches; implement strict retreat criteria' },
  { risk: 'AI over-reliance: automated systems making decisions that humans should review, leading to user trust erosion', mitigation: 'Maintain <5% override target but review all edge cases; implement ethical guardrails as hard constraints; conduct quarterly AI impact audits with external advisors' },
  { risk: 'Market timing risk: IPO window closing due to macro conditions while platform is mid-preparation', mitigation: 'Maintain dual-track readiness: IPO-ready but also prepared for private round if window closes; keep 18+ months runway at all times; build profitability as insurance against market timing' },
  { risk: 'Key person dependency: founder/CEO as sole narrative carrier creating succession and governance concerns for institutional investors', mitigation: 'Build strong C-suite with public-facing credibility; document all strategic frameworks and playbooks; demonstrate institutional decision-making processes beyond founder' },
];

export default function IPORoadshowCapitalAllocationAutonomousOS() {
  const [activeTab, setActiveTab] = useState('roadshow');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Landmark className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">IPO Roadshow + Global Capital Allocation + Autonomous OS</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Investor storytelling, disciplined capital deployment & intelligent platform architecture</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🏛️ IPO Stage</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="roadshow">🎤 Roadshow</TabsTrigger>
          <TabsTrigger value="capital">💰 Capital Allocation</TabsTrigger>
          <TabsTrigger value="os">🤖 Autonomous OS</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="roadshow" className="space-y-4 mt-4">
          {roadshowPillars.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.pillar}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.elements.map((e, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{e.element}</span>
                    <p className="text-xs text-muted-foreground">{e.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Roadshow KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{roadshowKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="capital" className="space-y-4 mt-4">
          {allocationFrameworks.map((f, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><f.icon className="h-4 w-4 text-primary" /> {f.framework}</CardTitle>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{f.strategies.map((s, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{s.strategy}</span>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Capital KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{capitalKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="os" className="space-y-4 mt-4">
          {osLayers.map((l, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><l.icon className="h-4 w-4 text-primary" /> {l.layer}</CardTitle>
                  <p className="text-xs text-muted-foreground">{l.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{l.systems.map((s, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{s.system}</span>
                    <p className="text-xs text-muted-foreground">{s.spec}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> OS Performance KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{osKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
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
