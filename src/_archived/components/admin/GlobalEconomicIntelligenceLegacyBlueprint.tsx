import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Database, Crown, BarChart3, Layers, Eye, Shield, Network, BookOpen } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: Global Economic Intelligence ── */
const intelligencePillars = [
  { pillar: 'Intelligence Signal Aggregation', icon: Network, items: [
    { item: 'Unified Signal Bus', detail: 'Consolidate listing activity, inquiry velocity, pricing movement, and transaction closure signals into a single normalized stream across all active markets' },
    { item: 'Standardized Liquidity Indicators', detail: 'Develop cross-market comparable metrics: Absorption Rate Index, Demand Pressure Score, Price Momentum Vector, and Capital Flow Intensity — published as open benchmarks' },
    { item: 'Real-Time Economic Discovery Dashboard', detail: 'Interactive global heatmap showing liquidity concentration, yield gradients, and capital rotation patterns updated every 15 minutes' },
    { item: 'Signal Quality Scoring', detail: 'Weight data by recency, volume, and source reliability — filter noise from low-activity markets to maintain institutional-grade accuracy' },
    { item: 'Historical Pattern Library', detail: 'Archive 5+ years of market cycle data enabling pattern-matching for emerging boom/correction signals across regions' },
  ]},
  { pillar: 'Capital Allocation Optimization', icon: TrendingUp, items: [
    { item: 'Emerging Opportunity Zone Detection', detail: 'Algorithmic identification of districts crossing growth inflection points — 30-60 day lead time before mainstream recognition' },
    { item: 'Information Asymmetry Reduction', detail: 'Transparent pricing analytics and comparable transaction databases reducing investor due diligence time by 60%+' },
    { item: 'Regional Growth Cycle Prediction', detail: 'ML-driven models predicting city-level expansion/contraction phases with 70%+ accuracy over 6-month horizons' },
    { item: 'Risk-Adjusted Yield Mapping', detail: 'Cross-market yield comparison accounting for currency risk, regulatory stability, and liquidity depth' },
    { item: 'Portfolio Rebalancing Signals', detail: 'Automated alerts when market conditions suggest allocation shifts — supported by scenario modeling' },
  ]},
  { pillar: 'Ecosystem Influence Pathways', icon: Globe, items: [
    { item: 'Research Institution Collaboration', detail: 'Partner with 3-5 university real estate research centers for co-published market intelligence studies' },
    { item: 'Global Property Intelligence Benchmarks', detail: 'Quarterly published indices: ASTRA Liquidity Index, Capital Flow Barometer, Digital Transaction Velocity — cited by industry media' },
    { item: 'Digital Transparency Standards', detail: 'Contribute to open-data initiatives establishing common property market reporting frameworks across emerging markets' },
    { item: 'Industry Conference Presence', detail: 'Keynote or panel participation at 4+ major real estate/fintech conferences annually — positioning as intelligence authority' },
    { item: 'Regulatory Advisory Engagement', detail: 'Provide market data and transparency insights to regulatory bodies exploring digital property market frameworks' },
  ]},
];

const intelligenceKPIs = [
  { kpi: 'Institutional Indicator Adoption', target: '50+ organizations', description: 'Number of funds, analysts, and institutions referencing ASTRA liquidity indices' },
  { kpi: 'Market Trend Prediction Accuracy', target: '>70% over 6 months', description: 'Directional accuracy of growth/contraction cycle predictions' },
  { kpi: 'Intelligence Product DAU', target: '5,000+', description: 'Daily active users of analytics dashboards and intelligence tools' },
  { kpi: 'Benchmark Citation Frequency', target: '20+/quarter', description: 'Media and research citations of published intelligence indices' },
  { kpi: 'Capital Influenced via Intelligence', target: '$200M+/year', description: 'Investment decisions directly supported by platform intelligence products' },
];

/* ── Section 2: Planet-Scale Data Coordination ── */
const dataLayers = [
  { layer: 'Global Data Layer Formation', description: 'Foundation infrastructure for multi-market intelligence', components: [
    { name: 'Multi-Market Dataset Integration', spec: 'Ingest listing, transaction, inquiry, and behavioral data from 10+ country markets into unified schema' },
    { name: 'Property Attribute Taxonomy', spec: 'Standardized classification: 200+ property attributes mapped to common ontology enabling cross-market comparison' },
    { name: 'Transaction Signal Normalization', spec: 'Currency-adjusted, PPP-normalized transaction data enabling apples-to-apples yield and pricing comparison' },
    { name: 'Scalable Analytics Pipeline', spec: 'Event-driven architecture processing 1M+ signals/day with <5min latency for intelligence propagation' },
    { name: 'Data Lineage Tracking', spec: 'Full provenance chain from raw signal to published insight — supporting audit and accuracy verification' },
  ]},
  { layer: 'Decision Support Infrastructure', description: 'Tools converting data into actionable intelligence', components: [
    { name: 'Comparative Opportunity Visualizer', spec: 'Side-by-side city/district comparison across 15+ dimensions: yield, growth, risk, liquidity, regulation' },
    { name: 'Supply-Demand Imbalance Predictor', spec: 'Forecasting models identifying districts approaching undersupply (>6 months ahead) for developer targeting' },
    { name: 'Localized-Within-Global Context', spec: 'Drill-down from global overview to district-level intelligence without losing macro positioning context' },
    { name: 'Investor Decision Workflow', spec: 'Guided discovery: risk profile → market match → property shortlist → due diligence package → offer support' },
    { name: 'API-First Intelligence Distribution', spec: 'RESTful and streaming APIs enabling institutional clients to embed intelligence into their own decision systems' },
  ]},
  { layer: 'Resilience & Governance', description: 'Trust and sustainability principles for planetary-scale data', components: [
    { name: 'Transparent Governance Framework', spec: 'Published data collection, processing, and retention policies — annual third-party governance audit' },
    { name: 'Privacy-Respecting Intelligence', spec: 'Aggregate-only analytics for public insights; PII isolated in encrypted vaults with strict access controls' },
    { name: 'Modular Market Onboarding', spec: 'Standardized 30-day integration playbook for adding new country markets to the global data layer' },
    { name: 'Data Quality SLA', spec: '99.5% accuracy target for published indices with automated anomaly detection and correction workflows' },
    { name: 'Redundancy & Continuity', spec: 'Multi-region data replication with <1h RPO and <4h RTO for intelligence service availability' },
  ]},
];

const dataKPIs = [
  { kpi: 'Global Market Signal Coverage', target: '15+ countries', description: 'Number of markets with active real-time data integration' },
  { kpi: 'Intelligence Propagation Latency', target: '<5 minutes', description: 'Time from raw signal ingestion to published insight update' },
  { kpi: 'Advanced Analytics Engagement', target: '>30% of institutional users', description: 'Percentage of institutional users actively using predictive tools' },
  { kpi: 'API Integration Partners', target: '25+', description: 'Third-party platforms consuming intelligence via API' },
  { kpi: 'Data Governance Audit Score', target: '>90/100', description: 'Annual third-party assessment of data handling practices' },
];

/* ── Section 3: Founder Legacy Narrative ── */
const narrativePillars = [
  { pillar: 'Vision Framing', icon: Eye, elements: [
    { element: 'Mission Statement', narrative: '"To make global real estate capital allocation transparent, intelligent, and accessible — reducing the friction that prevents efficient market participation across borders."' },
    { element: 'Problem-Solution Positioning', narrative: 'Real estate remains the world\'s largest asset class yet the most opaque. ASTRA transforms fragmented local data into unified global intelligence — the Bloomberg Terminal for property markets.' },
    { element: 'Societal Value Creation', narrative: 'By reducing information asymmetry, the platform democratizes access to investment intelligence previously available only to large institutions — enabling broader wealth participation in real estate growth.' },
    { element: 'Long-Term Market Impact', narrative: 'Over 20 years, ASTRA\'s intelligence layer becomes embedded infrastructure — like credit scoring transformed lending, property intelligence transforms capital allocation.' },
  ]},
  { pillar: 'Leadership Story', icon: Crown, elements: [
    { element: 'Disciplined Execution Journey', narrative: 'From first listing to global intelligence network — every expansion decision was gated by validation, every market entered only after proving unit economics in the previous one.' },
    { element: 'Resilience Through Growth Cycles', narrative: 'Navigated market corrections by doubling down on intelligence quality rather than growth speed — the slowdowns became the platform\'s competitive advantage.' },
    { element: 'Ethical Technology Commitment', narrative: 'Built with privacy-first architecture, transparent governance, and human-override safeguards — technology serves market participants, never manipulates them.' },
    { element: 'Team & Culture Legacy', narrative: 'Created a culture of "intelligence craftspeople" — data engineers, market analysts, and product builders who care about accuracy as deeply as growth.' },
  ]},
  { pillar: 'Institutional & Cultural Impact', icon: BookOpen, elements: [
    { element: 'Open Intelligence Advocacy', narrative: 'Championed open property data standards, contributing standardized taxonomies and benchmarks to the global real estate community — competitors benefit, the market benefits more.' },
    { element: 'Digital Infrastructure Evolution', narrative: 'Positioned as a case study in how emerging-market startups can build globally relevant infrastructure — inspiring next-generation PropTech founders.' },
    { element: 'Measurable Real-World Outcomes', narrative: 'Every narrative claim backed by data: capital allocated, transparency improved, transaction friction reduced, investor outcomes enhanced — storytelling rooted in evidence.' },
    { element: 'Generational Knowledge Transfer', narrative: 'Published playbooks, open research, and market methodology documentation ensuring the intelligence approach outlives any single company or founder.' },
  ]},
];

const legacyKPIs = [
  { kpi: 'Industry Direction Influence', target: '3+ standard adoptions', description: 'Data standards or methodologies adopted by industry bodies or competitors' },
  { kpi: 'Innovation Community Recognition', target: 'Top 10 global PropTech', description: 'Ranking in recognized PropTech innovation indices' },
  { kpi: 'Sustained Trust Perception', target: '>85% favorable', description: 'Annual stakeholder trust survey among institutional partners and users' },
  { kpi: 'Knowledge Contribution', target: '10+ published works/year', description: 'Research papers, playbooks, and open methodology publications' },
  { kpi: 'Founder Speaking Invitations', target: '10+/year Tier-1 events', description: 'Keynote and panel invitations at major industry and technology conferences' },
];

/* ── Monitoring Checklist ── */
const checklist = [
  { category: 'Intelligence Network Health', items: ['Liquidity indices updated and published on schedule', 'Prediction accuracy tracked against actuals', 'New research collaboration pipeline active', 'Benchmark citations monitored quarterly', 'Institutional adoption metrics reviewed'] },
  { category: 'Data Infrastructure', items: ['Signal coverage across all active markets confirmed', 'Propagation latency within SLA (<5 min)', 'Data quality audit score maintained (>90)', 'API partner integration health checked', 'Privacy governance compliance verified'] },
  { category: 'Narrative & Legacy', items: ['Quarterly thought leadership content published', 'Stakeholder trust survey conducted annually', 'Open methodology documentation updated', 'Conference participation pipeline maintained', 'Brand perception metrics reviewed'] },
  { category: 'Strategic Alignment', items: ['Vision-execution gap assessment completed', 'Resource allocation aligned with stated priorities', 'Competitive intelligence landscape reviewed', 'Long-term impact metrics trending positively', 'Team culture health assessment conducted'] },
];

/* ── Risk Indicators ── */
const riskIndicators = [
  { risk: 'Vision-execution disconnect: narrative claims significantly exceeding operational reality', mitigation: 'Quarterly "reality audit" comparing public narrative claims against measurable outcomes; adjust messaging to match demonstrated capabilities' },
  { risk: 'Data quality erosion at scale: rapid market expansion degrading intelligence accuracy below institutional standards', mitigation: 'Enforce 30-day data quality validation before publishing insights for new markets; maintain automated anomaly detection with human review' },
  { risk: 'Intelligence commoditization: competitors replicating published benchmarks and indices', mitigation: 'Maintain 6-month intelligence methodology lead through proprietary behavioral data; differentiate on real-time speed and prediction accuracy' },
  { risk: 'Over-vision syndrome: excessive strategic planning consuming resources that should drive execution', mitigation: 'Cap strategic planning at 15% of leadership time; enforce 85% execution focus with weekly outcome reviews' },
  { risk: 'Legacy narrative fatigue: stakeholders losing engagement with long-term vision storytelling', mitigation: 'Anchor every narrative update in recent measurable milestones; rotate story angles quarterly to maintain freshness' },
];

export default function GlobalEconomicIntelligenceLegacyBlueprint() {
  const [activeTab, setActiveTab] = useState('intelligence');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Global Economic Intelligence + Planet-Scale Data + Founder Legacy</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Macro intelligence network, planetary data coordination & transformative legacy narrative</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🌍 Civilization</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="intelligence">🧠 Intelligence</TabsTrigger>
          <TabsTrigger value="data">🗄️ Data Layer</TabsTrigger>
          <TabsTrigger value="legacy">👑 Legacy</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Intelligence ── */}
        <TabsContent value="intelligence" className="space-y-4 mt-4">
          {intelligencePillars.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.pillar}</CardTitle></CardHeader>
                <CardContent className="grid gap-2">
                  {p.items.map((it, j) => (
                    <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                      <span className="text-sm font-medium">{it.item}</span>
                      <p className="text-xs text-muted-foreground">{it.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Intelligence KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{intelligenceKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Data Layer ── */}
        <TabsContent value="data" className="space-y-4 mt-4">
          {dataLayers.map((l, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> {l.layer}</CardTitle><p className="text-xs text-muted-foreground mt-1">{l.description}</p></div>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {l.components.map((c, j) => (
                    <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                      <span className="text-sm font-medium">{c.name}</span>
                      <p className="text-xs text-muted-foreground">{c.spec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Data Coordination KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{dataKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Legacy ── */}
        <TabsContent value="legacy" className="space-y-4 mt-4">
          {narrativePillars.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.pillar}</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                  {p.elements.map((e, j) => (
                    <div key={j} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                      <span className="text-sm font-semibold">{e.element}</span>
                      <p className="text-xs text-muted-foreground italic">{e.narrative}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="h-4 w-4 text-primary" /> Legacy KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{legacyKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
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
