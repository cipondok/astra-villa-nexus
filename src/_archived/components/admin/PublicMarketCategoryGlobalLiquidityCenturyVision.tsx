import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, AlertTriangle, TrendingUp, Globe, BarChart3, Brain, Shield, Eye, Layers, Crown, Landmark, Network, Compass, BookOpen } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: Category Creation ── */
const categoryPillars = [
  { pillar: 'Category Definition Logic', icon: Crown, description: 'Redefine what the market understands this platform to be', elements: [
    { element: 'From "Marketplace" to "Transaction Intelligence Infrastructure"', detail: 'Analysts and investors currently bucket the platform with listing portals (5-8x revenue multiples). Reframe as infrastructure layer (15-25x multiples) by emphasizing: platform processes decisions, not just displays listings — every interaction improves intelligence, every transaction strengthens the network' },
    { element: 'Coin "Property Liquidity Intelligence" (PLI) Category', detail: 'Define PLI as the discipline of measuring, predicting, and optimizing the speed and efficiency of real estate capital deployment. Publish the PLI Index — a proprietary metric tracking liquidity health across 50+ districts — making the platform synonymous with the measurement itself' },
    { element: 'Capital Allocation Efficiency Narrative', detail: 'Traditional RE: $47B transacted with 120-day cycles, 15% information asymmetry tax. Platform reduces cycle to 45 days and asymmetry to <5% — quantify this as "$2.3B annual efficiency value created" — infrastructure language, not marketplace language' },
    { element: 'Category Comparison Framework', detail: 'Position alongside Bloomberg (financial data infrastructure), Stripe (payment infrastructure), Palantir (intelligence infrastructure) — not alongside Zillow or Rightmove. Create investor education materials showing why PLI is a distinct, defensible category' },
    { element: 'Academic & Research Legitimacy', detail: 'Fund university research partnerships studying property liquidity dynamics — peer-reviewed papers citing PLI methodology create category legitimacy that marketing alone cannot achieve' },
  ]},
  { pillar: 'Investor Education & Narrative Amplification', icon: BookOpen, description: 'Train the market to evaluate the platform on infrastructure metrics, not marketplace comps', elements: [
    { element: 'Analyst Day & Category Deep-Dive', detail: 'Annual investor event presenting: PLI methodology evolution, global liquidity benchmarks, infrastructure revenue composition, 10-year category growth thesis — establish the event as industry calendar fixture' },
    { element: 'Comparative Efficiency Benchmarks', detail: 'Quarterly publication: "State of Property Liquidity" report comparing transaction efficiency across markets with/without platform presence — prove structural impact with third-party validated data' },
    { element: 'Data Revenue Trajectory Highlight', detail: 'Separate reporting of "Intelligence Revenue" (analytics subscriptions, institutional data products, API access) from "Marketplace Revenue" — show intelligence growing at >40% while marketplace grows at >20%, proving platform is evolving beyond marketplace' },
    { element: 'Network Effect Quantification', detail: 'Develop and publish proprietary "Network Health Score" showing cross-side elasticity, liquidity depth, and switching cost metrics — give analysts tools to evaluate network moat strength in their models' },
    { element: 'Long-Term TAM Expansion Narrative', detail: 'Current TAM: $47B Indonesian RE transactions. Year 3: $120B Southeast Asian RE. Year 7: $800B Asian RE + $50B property intelligence services — show category grows from $47B to $850B with geographic and product expansion' },
  ]},
  { pillar: 'Competitive Moat Reinforcement', icon: Shield, description: 'Make category leadership structurally unassailable', elements: [
    { element: 'Behavioral Data Compounding', detail: '50M+ annual behavioral signals feeding prediction models — every month of operation increases accuracy advantage; competitor starting today needs 3+ years and equivalent transaction volume to match current intelligence quality' },
    { element: 'Ecosystem Integration Depth', detail: 'Banks, developers, legal services, property management all integrated — users complete entire property lifecycle on platform; switching means disconnecting from 5+ integrated services simultaneously' },
    { element: 'Standard-Setting Influence', detail: 'PLI methodology adopted by industry associations, referenced in regulatory discussions, used in academic research — platform defines the measurement standard, making alternatives inherently inferior by comparison' },
    { element: 'Talent Moat', detail: 'Attract top data science and RE intelligence talent through category leadership positioning — "we invented PLI" recruitment narrative creates self-reinforcing talent advantage' },
    { element: 'Network Effect Irreversibility', detail: 'At current scale, removing platform from ecosystem would cost vendors $X million in lost inquiries and buyers Y months of search efficiency — quantify switching cost to prove structural lock-in' },
  ]},
];

const categoryKPIs = [
  { kpi: 'Analyst Category Adoption', target: '>5 sell-side analysts using PLI terminology', description: 'Research reports referencing "Property Liquidity Intelligence" category' },
  { kpi: 'Valuation Multiple Premium', target: '>15x revenue vs 5-8x marketplace comps', description: 'Infrastructure-level valuation reflecting category positioning' },
  { kpi: 'Intelligence Revenue Share', target: '>25% of total revenue', description: 'Non-marketplace revenue proving infrastructure thesis' },
  { kpi: 'PLI Index Citations', target: '>50/quarter', description: 'Media and industry references to proprietary liquidity metrics' },
  { kpi: 'Institutional Data Client Growth', target: '>30% annual', description: 'Enterprise customers paying for intelligence products' },
];

/* ── Section 2: Global Liquidity Infrastructure ── */
const infraLayers = [
  { layer: 'Global Signal Aggregation Layer', icon: Network, description: 'Unify fragmented market signals into coherent global intelligence', systems: [
    { system: 'Multi-Market Data Ingestion Pipeline', spec: 'Standardized connectors for listing data, transaction records, pricing signals, and behavioral events across 10+ markets — normalize heterogeneous data sources into unified property graph with <1 hour latency' },
    { system: 'Universal Liquidity Scoring Engine', spec: 'Composite liquidity score (0-100) computed identically across all markets: inquiry velocity (25%), transaction speed (25%), price stability (20%), inventory turnover (15%), buyer competition (15%) — enables true cross-market comparison' },
    { system: 'Real-Time Comparative Dashboards', spec: 'Institutional clients view side-by-side liquidity, yield, and momentum metrics across Jakarta, Kuala Lumpur, Bangkok, Ho Chi Minh City — platform becomes the "Bloomberg Terminal" for Asian real estate intelligence' },
    { system: 'Anomaly & Trend Detection', spec: 'Statistical models flag unusual patterns: sudden liquidity spikes, pricing bubbles, demand migrations — alerts delivered to institutional clients within 4 hours of detection' },
    { system: 'Historical Intelligence Archive', spec: '5+ years of structured behavioral and transaction data — enables backtesting investment theses, validating market cycle models, and proving platform prediction accuracy over time' },
  ]},
  { layer: 'Decision Support & Capital Routing', icon: Compass, description: 'Transform raw intelligence into actionable investment decisions', systems: [
    { system: 'Predictive Opportunity Mapper', spec: 'Machine learning models identifying districts transitioning from "emerging" to "hot" 3-6 months before consensus — institutional clients paying $1K+/month for early-signal access' },
    { system: 'Cross-Border Portfolio Discovery', spec: 'Investors define criteria (yield >8%, growth >10%, liquidity score >70) — system surfaces matching opportunities across all active markets with risk-adjusted ranking' },
    { system: 'Investment Timing Intelligence', spec: 'Market cycle phase identification (Expansion/Peak/Contraction/Recovery) per city with 12-month forward projections — helps institutional capital time entry and exit decisions' },
    { system: 'Portfolio Risk Analytics', spec: 'Geographic concentration risk, liquidity risk, cycle exposure analysis for multi-property portfolios — helps family offices and funds maintain balanced allocation across markets' },
    { system: 'Deal Flow Curation Engine', spec: 'For institutional clients: curated deal pipelines matching investment mandate criteria, pre-scored for quality, liquidity, and yield potential — platform as deal origination infrastructure' },
  ]},
  { layer: 'Resilience & Governance Foundations', icon: Shield, description: 'Build trust and durability for multi-decade infrastructure operation', systems: [
    { system: 'Transparent Data Governance', spec: 'Published methodology for all indices and scores — external audit of data quality annually; clients trust platform because methodology is transparent, reproducible, and independently validated' },
    { system: 'Modular Market Expansion Architecture', spec: 'New market onboarding in <90 days: standardized data schema, localized regulatory compliance modules, and pre-built analytics templates — designed for 50+ market coverage' },
    { system: 'Scalable Analytics Infrastructure', spec: 'Distributed compute architecture handling 100M+ events/day with sub-second query response — infrastructure scales linearly with market coverage, not exponentially with cost' },
    { system: 'Privacy-Preserving Intelligence', spec: 'Federated analytics enabling cross-market insights without raw data sharing — regulatory compliance across jurisdictions while maintaining intelligence quality' },
    { system: 'Disaster Recovery & Continuity', spec: 'Multi-region redundancy with <5 minute failover — institutional clients require infrastructure-grade reliability; platform commits to 99.95% uptime SLA for premium intelligence products' },
  ]},
];

const infraKPIs = [
  { kpi: 'Global Market Coverage', target: '10+ markets by Year 3', description: 'Cities/countries with active liquidity scoring' },
  { kpi: 'Prediction Accuracy', target: '>75% at 90-day horizon', description: 'Market trend forecasts validated against actual outcomes' },
  { kpi: 'Intelligence Product Revenue', target: '>$2M ARR by Year 3', description: 'Revenue from institutional data and analytics subscriptions' },
  { kpi: 'Data Freshness', target: '<1 hour signal latency', description: 'Time from market event to reflected intelligence' },
  { kpi: 'Institutional Client Retention', target: '>95% annual', description: 'Enterprise data clients renewing subscriptions' },
];

/* ── Section 3: Century Vision ── */
const visionArcs = [
  { arc: 'Transformational Vision Framing', icon: Sparkles, narratives: [
    { title: 'Efficient Global Capital Distribution', narrative: 'Real estate represents $326 trillion in global assets — yet capital allocation remains driven by local networks, information asymmetry, and opaque pricing. The platform\'s century mission: ensure every dollar of property capital flows to its highest-value use, guided by transparent, intelligent, and fair market signals' },
    { title: 'Eliminating Market Opacity', narrative: 'In a century, the idea that property prices were determined by guesswork and negotiation theater will seem as archaic as trading stocks without price quotes. The platform builds the infrastructure that makes property markets as transparent and efficient as modern financial markets' },
    { title: 'Generational Digital Coordination', narrative: 'Just as stock exchanges transformed capital markets over centuries, digital property intelligence infrastructure transforms how humanity allocates resources to shelter, workspace, and community development — a multi-generational mission that compounds in impact over decades' },
  ]},
  { arc: 'Leadership Journey Architecture', icon: TrendingUp, narratives: [
    { title: 'Disciplined Execution Milestones', narrative: 'From first listing to first deal, first city to first country, first $1K to first $1M monthly revenue — each milestone documented with lessons learned, pivots made, and principles reinforced. The founder story is one of systematic, compounding execution, not overnight success' },
    { title: 'Resilience Through Expansion Cycles', narrative: 'Three market downturns navigated, two failed city launches recovered from, one near-fatal cash crunch survived — resilience is the through-line. The platform is anti-fragile: each challenge made the system stronger, the team sharper, the strategy clearer' },
    { title: 'Ethical Technology Stewardship', narrative: 'Committed to never using platform intelligence for market manipulation, predatory pricing, or discriminatory routing. Published ethical AI guidelines before any regulator required them. Trust is the ultimate competitive advantage — and it is earned through consistent principled behavior, not marketing' },
  ]},
  { arc: 'Cultural & Ecosystem Influence', icon: Globe, narratives: [
    { title: 'Open Intelligence Thinking', narrative: 'Publish core liquidity methodology openly, fund academic research, contribute to open-source analytics tools — grow the category by growing understanding. A rising tide of property market transparency benefits everyone, and positions the platform as the authoritative source' },
    { title: 'Shaping Infrastructure Evolution Dialogue', narrative: 'Keynotes at global forums, advisory roles with regulatory bodies, research partnerships with universities — the platform\'s voice shapes how the world thinks about digital property infrastructure. Not just a participant in the conversation, but the one setting the agenda' },
    { title: 'Measurable Societal Outcomes', narrative: 'Track and publish: transaction costs reduced ($X billion), time-to-transaction improved (Y million hours saved), capital misallocation prevented ($Z billion) — brand storytelling anchored in quantifiable impact, not aspirational rhetoric' },
  ]},
];

const legacyKPIs = [
  { kpi: 'Institutional Trust Perception', target: 'Top-3 in industry surveys', description: 'Platform ranked among most trusted property intelligence sources' },
  { kpi: 'Industry Direction Influence', target: 'Category terminology adopted by >3 regulators', description: 'PLI framework referenced in policy or regulatory discussions' },
  { kpi: 'Brand Authority Longevity', target: 'Sustained >10 years', description: 'Consistent brand recognition and trust across leadership transitions' },
  { kpi: 'Societal Impact Metrics', target: 'Published annually', description: 'Quantified efficiency improvements and capital allocation optimization' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Category Creation Momentum', items: ['PLI Index published and updated monthly', 'Analyst Day executed annually with >50 institutional attendees', 'Intelligence revenue tracked separately in financial reporting', '5+ sell-side analysts referencing PLI category', 'Academic research partnerships active and producing papers'] },
  { category: 'Infrastructure Scale Health', items: ['10+ markets with active liquidity scoring', 'Prediction accuracy >75% validated quarterly', 'Data freshness <1 hour maintained across all markets', 'Institutional client retention >95% sustained', 'Infrastructure uptime >99.95% with documented SLA'] },
  { category: 'Vision Narrative Consistency', items: ['Founder keynote at 2+ global conferences annually', 'Societal impact report published with audited metrics', 'Ethical AI guidelines reviewed and updated annually', 'Open methodology documentation current and accessible', 'Brand storytelling aligned across all stakeholder communications'] },
  { category: 'Long-Term Governance', items: ['Board composition includes independent infrastructure expertise', 'Succession planning documented for key leadership roles', 'Multi-decade strategic plan reviewed bi-annually', 'Regulatory engagement proactive across all active jurisdictions', 'Data governance framework externally audited annually'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Category creation rejection: investors and analysts refuse to accept new category, continuing to evaluate as marketplace with lower multiples', mitigation: 'Build category proof through intelligence revenue growth — when 25%+ of revenue comes from non-marketplace sources, financial reality forces re-categorization regardless of narrative adoption' },
  { risk: 'Infrastructure over-investment: building global intelligence infrastructure ahead of institutional demand, burning capital without proportional revenue', mitigation: 'Stage infrastructure investment behind validated demand signals; require minimum 10 paying institutional clients before expanding to new market; maintain 60%+ revenue from proven marketplace operations' },
  { risk: 'Century-vision disconnecting from quarterly execution: grand narrative creating internal complacency or external credibility gap', mitigation: 'Every vision statement must link to 12-month measurable objectives; quarterly earnings reinforce vision with specific progress metrics; founder maintains hands-on execution involvement alongside strategic storytelling' },
  { risk: 'Regulatory backlash: positioning as "market infrastructure" attracting regulatory scrutiny and compliance burdens beyond current capabilities', mitigation: 'Proactive regulatory engagement; maintain compliance buffer in all product decisions; separate regulated intelligence products into dedicated entity if required; retain specialized legal counsel for each jurisdiction' },
  { risk: 'Talent dilution at scale: as organization grows beyond 500+, founding culture of innovation and urgency diluted by institutional process', mitigation: 'Codify cultural principles in hiring and onboarding; maintain small autonomous teams for innovation; founder direct involvement in senior hiring; annual culture health assessment with intervention triggers' },
];

export default function PublicMarketCategoryGlobalLiquidityCenturyVision() {
  const [activeTab, setActiveTab] = useState('category');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Public Market Category Creation + Global Liquidity Infrastructure + Century Vision</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Category leadership, planetary intelligence infrastructure & founder legacy narrative</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">✨ Century Vision</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="category">👑 Category Creation</TabsTrigger>
          <TabsTrigger value="infra">🌐 Global Infra</TabsTrigger>
          <TabsTrigger value="vision">🔮 Century Vision</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4 mt-4">
          {categoryPillars.map((p, i) => (
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Category KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{categoryKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="infra" className="space-y-4 mt-4">
          {infraLayers.map((l, i) => (
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Infrastructure KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{infraKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="vision" className="space-y-4 mt-4">
          {visionArcs.map((a, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><a.icon className="h-4 w-4 text-primary" /> {a.arc}</CardTitle></CardHeader>
                <CardContent className="grid gap-3">{a.narratives.map((n, j) => (
                  <div key={j} className="p-3 rounded border bg-muted/20 space-y-1.5">
                    <span className="text-sm font-semibold">{n.title}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.narrative}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Legacy KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{legacyKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
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
