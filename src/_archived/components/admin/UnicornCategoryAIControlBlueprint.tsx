
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gem, Globe, Brain, AlertTriangle, ClipboardCheck, Copy, Check, TrendingUp, Target, Shield, Layers, Zap, BarChart3, Crown, Cpu, Network, ArrowUpRight } from 'lucide-react';
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

const unicornValuation = {
  narrativePillars: [
    { pillar: 'Market Infrastructure Thesis', narrative: 'ASTRA is not a listing website — it is the transaction intelligence infrastructure for Southeast Asia\'s $350B+ annual property market. We are building the Bloomberg Terminal for real estate.', evidence: ['TAM: $350B+ Indonesian property market', 'Digital penetration <5% = massive whitespace', 'No incumbent owns the intelligence layer', 'Adjacent markets (financing, insurance, services) multiply TAM 3-5x'], investorResonance: 'Infrastructure plays command 15-25x revenue multiples vs 5-8x for marketplaces' },
    { pillar: 'Network Effect Compounding', narrative: 'Every transaction makes ASTRA smarter. Our pricing accuracy improves 2-3% per quarter as data compounds. Competitors would need years of transaction history to replicate our intelligence advantage.', evidence: ['Pricing prediction accuracy: [X]% (improving quarterly)', 'Viral coefficient: [X] (self-reinforcing growth)', 'Cross-city demand routing: [X]% of inquiries', 'Vendor retention: [X]% (high switching costs)'], investorResonance: 'Network effects = defensible moat + non-linear scaling' },
    { pillar: 'Revenue Quality & Trajectory', narrative: 'Multi-stream recurring revenue with expanding unit economics. Subscription + transaction + data intelligence creates a "revenue engine" that scales with marketplace activity.', evidence: ['MRR growth: [X]% month-over-month', 'Revenue mix: [X]% recurring, [Y]% transactional', 'LTV/CAC: [X]x and improving by cohort', 'Gross margin: [X]% with operational leverage'], investorResonance: 'High-quality revenue justifies premium valuation multiple' },
    { pillar: 'Expansion Playbook Proof', narrative: 'We\'ve proven a repeatable city launch playbook: 90 days to liquidity leadership, 6 months to positive unit economics. Each new city adds to the data flywheel without proportional cost increase.', evidence: ['[X] cities launched with proven playbook', 'Average time to positive unit economics: [X] months', 'Marginal cost of expansion decreasing [X]% per city', 'Cross-city intelligence synergies demonstrated'], investorResonance: 'Repeatable expansion = predictable growth trajectory' },
    { pillar: 'Data Monetization Optionality', narrative: 'Our proprietary transaction and behavioral data is an untapped goldmine. Intelligence products (analytics, forecasting, institutional terminals) represent a second revenue engine with 80%+ gross margins.', evidence: ['[X] proprietary data points collected', 'Early data product revenue: Rp [X]M/month', 'Enterprise pipeline: [X] institutions interested', 'API partnership discussions: [X] active'], investorResonance: 'Data optionality = upside beyond core marketplace valuation' },
  ],
  valuationFramework: `💎 UNICORN VALUATION CONSTRUCTION FRAMEWORK

━━━━━━ VALUATION METHODOLOGY ━━━━━━

📊 PRIMARY: Revenue Multiple Approach
┌──────────────────────────────────────┐
│ Forward ARR × Category Multiple      │
│ = Pre-Money Valuation                │
│                                      │
│ Target: $100M+ valuation             │
│ Required ARR: $5-8M                  │
│ Target Multiple: 15-25x              │
└──────────────────────────────────────┘

📈 MULTIPLE JUSTIFICATION LEVERS:
• Infrastructure positioning → +3-5x vs pure marketplace
• Network effects proven → +2-3x vs linear growth
• Data monetization optionality → +2-4x upside
• Emerging market TAM expansion → +1-2x vs mature market
• Revenue quality (recurring %) → +1-3x vs transactional

💰 COMPARABLE BENCHMARKS:
• PropertyGuru (SGX): 8-12x revenue
• 99.co (private): 15-20x revenue  
• CoStar Group (NASDAQ): 20-30x revenue
• Zillow (NASDAQ): 8-15x revenue
• ASTRA target: 15-25x (intelligence premium)

━━━━━━ VALUATION MILESTONES ━━━━━━

🏗️ SEED/PRE-A ($3-8M valuation)
• Product-market fit demonstrated
• First city liquidity leadership
• Revenue: $50-150K ARR

🚀 SERIES A ($15-30M valuation)
• Multi-city proof with unit economics
• Revenue: $300K-1M ARR
• Network effects measurable

📈 SERIES B ($80-150M valuation)
• National leadership position
• Revenue: $2-5M ARR
• Data monetization revenue emerging

🦄 SERIES C+ ($250M-1B valuation)
• Regional expansion (SEA)
• Revenue: $8-20M ARR
• Intelligence platform fully deployed

━━━━━━ INVESTOR PITCH CALIBRATION ━━━━━━

DO say: "We're building infrastructure"
DON'T say: "We're a listing website"

DO say: "Data compounds into defensible moats"
DON'T say: "We have lots of data"

DO say: "Proven, repeatable expansion playbook"
DON'T say: "We plan to expand to many cities"

DO say: "Multi-stream revenue engine"
DON'T say: "We monetize through commissions"`,
  kpis: [
    { metric: 'Forward ARR', target: '$5-8M for unicorn trajectory', current: 'Building' },
    { metric: 'Revenue Multiple Achieved', target: '15-25x forward ARR', current: 'N/A' },
    { metric: 'Investor Meeting → Term Sheet', target: '≥15% conversion', current: 'Pre-fundraise' },
    { metric: 'Strategic Partnership Logos', target: '≥5 recognizable brands', current: '0' },
    { metric: 'Data Revenue % of Total', target: '≥20%', current: '0%' },
  ],
};

const categoryCreation = {
  categoryDefinition: {
    oldCategory: 'Property Listing Portal',
    newCategory: 'Property Liquidity Intelligence Platform',
    tagline: 'We don\'t list properties. We optimize property market liquidity through intelligence.',
    differentiators: [
      { dimension: 'Discovery', old: 'Search by filters', new: 'AI-matched opportunities based on behavioral DNA' },
      { dimension: 'Pricing', old: 'Seller sets price', new: 'Intelligence-driven fair market value with predictive analytics' },
      { dimension: 'Transaction', old: 'Connect buyer to seller', new: 'Orchestrated deal flow with negotiation intelligence' },
      { dimension: 'Data', old: 'Static listing information', new: 'Living market intelligence that compounds with every interaction' },
      { dimension: 'Value', old: 'Advertising revenue', new: 'Multi-stream: subscriptions + transactions + intelligence + services' },
    ],
  },
  authorityInitiatives: [
    { initiative: 'ASTRA Global Property Liquidity Index', description: 'Proprietary index measuring real-time property market health across Indonesian cities', format: 'Monthly publication + API access + media release', impact: 'Becomes the reference standard for property market health discussion', categoryEffect: 'Forces industry to adopt "liquidity intelligence" terminology' },
    { initiative: '"The Liquidity Standard" Thought Leadership Series', description: 'Executive content series defining what property liquidity intelligence means', format: 'White papers + keynote speeches + LinkedIn series + podcast', impact: 'Founder becomes the authoritative voice of the new category', categoryEffect: 'Educates market on why traditional listing portals are insufficient' },
    { initiative: 'Property Intelligence Summit', description: 'Annual industry event bringing together PropTech, institutional capital, and developers', format: '500+ attendees, category-defining keynotes, live intelligence demos', impact: 'Physical manifestation of category leadership', categoryEffect: 'Creates community around the new category definition' },
    { initiative: 'Academic Research Partnership', description: 'Co-author research papers with university real estate departments', format: 'Published papers + citations + conference presentations', impact: 'Academic validation of intelligence-driven property marketplace model', categoryEffect: 'Institutional credibility that competitors cannot easily replicate' },
  ],
  terminology: [
    { term: 'Property Liquidity Score™', definition: 'Real-time metric combining inquiry velocity, viewing density, and transaction probability for any listing or district' },
    { term: 'Market Intelligence Compounding™', definition: 'The phenomenon where each transaction improves platform intelligence, creating exponential accuracy advantages over time' },
    { term: 'Transaction Orchestration Engine™', definition: 'AI system that guides deals from discovery through closing with intelligent interventions at each stage' },
    { term: 'Behavioral Discovery DNA™', definition: 'Unique buyer profile constructed from search, viewing, and interaction patterns enabling predictive property matching' },
  ],
  kpis: [
    { metric: 'Media using "Property Liquidity Intelligence"', target: '≥50 articles/year' },
    { metric: 'Category term Google search volume', target: '≥1,000 monthly searches' },
    { metric: 'Competitor adopting similar positioning', target: 'Signal of category validation' },
    { metric: 'Industry award in new category', target: '≥2 awards/year' },
    { metric: 'Wikipedia / industry glossary inclusion', target: 'Category terms referenced' },
  ],
};

const autonomousAI = {
  decisionDomains: [
    { domain: 'Supply-Demand Equilibrium', decisions: ['District-level supply gap detection and vendor activation alerts', 'Demand surge identification and buyer routing optimization', 'Price sensitivity analysis and competitive positioning guidance', 'Inventory freshness management and stale listing intervention'], autonomy: 'Level 3: Auto-detect + auto-recommend + human approval for actions', dataSources: 'Listing events, inquiry patterns, viewing data, transaction history', refreshCycle: 'Real-time event processing + hourly aggregation', safetyGuard: 'No autonomous listing modifications; alerts only for supply interventions' },
    { domain: 'Pricing Intelligence', decisions: ['Automated Comparative Market Analysis (CMA) for every listing', 'Dynamic price recommendation based on demand signals', 'Negotiation range guidance for buyers and sellers', 'Market timing alerts for optimal listing or purchase windows'], autonomy: 'Level 4: Auto-generate recommendations shown to users; no forced pricing', dataSources: 'Historical transactions, current listings, market conditions, behavioral signals', refreshCycle: 'Daily full recalculation + real-time adjustments on new transactions', safetyGuard: 'Confidence threshold ≥85% before showing recommendations; human review for outliers' },
    { domain: 'Lead Routing & Prioritization', decisions: ['Buyer intent classification (casual → serious → institutional)', 'Agent-buyer compatibility matching', 'Performance-weighted lead distribution', 'High-value lead escalation triggers'], autonomy: 'Level 5: Fully autonomous with override dashboard', dataSources: 'Search behavior, inquiry patterns, viewing history, agent performance metrics', refreshCycle: 'Real-time scoring on every user interaction', safetyGuard: 'Fairness audit: no agent receives <10% of baseline lead volume; bias detection' },
    { domain: 'Monetization Optimization', decisions: ['Dynamic premium slot pricing based on demand', 'Vendor upgrade propensity scoring and upsell timing', 'Campaign ROI optimization and budget reallocation', 'Subscription tier recommendation for vendor segments'], autonomy: 'Level 3: Auto-recommend; human approval for pricing changes >15%', dataSources: 'Revenue data, vendor behavior, conversion funnels, market conditions', refreshCycle: 'Daily optimization cycle + real-time conversion tracking', safetyGuard: 'Price change caps: max ±20% per cycle; vendor notification required for changes' },
  ],
  governanceFramework: [
    { layer: 'Confidence Thresholds', description: 'Every AI decision carries a confidence score; actions below threshold require human approval', levels: ['≥95%: Full autonomy (routine decisions)', '85-94%: Auto-execute with audit log', '70-84%: Recommend only, human approval required', '<70%: Flag for manual review, no recommendation shown'] },
    { layer: 'Bias Detection & Fairness', description: 'Continuous monitoring for systematic biases in lead routing, pricing, and recommendations', mechanisms: ['Weekly fairness audit across agent segments', 'Geographic distribution analysis', 'Price recommendation accuracy by property type', 'A/B testing of model versions for bias detection'] },
    { layer: 'Transparency Dashboard', description: 'Admin command center showing all AI decisions, confidence levels, and override history', features: ['Real-time decision log with full reasoning trace', 'Override frequency and reason tracking', 'Model performance degradation alerts', 'Manual intervention tools for every automated system'] },
    { layer: 'Rollback & Safety', description: 'Automatic rollback mechanisms if AI decisions produce negative outcomes', mechanisms: ['Auto-rollback if conversion drops >10% within 24 hours', 'Model version control with instant revert capability', 'Kill switches for each autonomous domain', 'Incident response protocol for AI-caused issues'] },
  ],
  architectureDiagram: `🧠 AUTONOMOUS AI CONTROL LAYER — ARCHITECTURE

┌─────────────────────────────────────────────────────┐
│                ADMIN COMMAND CENTER                  │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Decision    │ │ Override │ │ Performance      │  │
│  │ Monitor     │ │ Controls │ │ Analytics        │  │
│  └─────────────┘ └──────────┘ └──────────────────┘  │
│  Human-in-the-loop governance for all AI systems     │
├─────────────────────────────────────────────────────┤
│              ORCHESTRATION ENGINE                    │
│  ┌──────────────────────────────────────────────┐    │
│  │ Priority Queue: Which decisions need action?  │    │
│  │ Confidence Gate: Should AI act autonomously?  │    │
│  │ Conflict Resolution: Competing optimizations  │    │
│  └──────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│           AI DECISION DOMAINS (L3-L5)                │
│  ┌────────────┐ ┌────────────┐ ┌─────────────────┐  │
│  │ Supply-    │ │ Pricing    │ │ Lead Routing    │  │
│  │ Demand     │ │ Intel.     │ │ & Matching      │  │
│  │ Equilib.   │ │ Engine     │ │ (L5 Autonomous) │  │
│  │ (L3)       │ │ (L4)       │ │                 │  │
│  └────────────┘ └────────────┘ └─────────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌─────────────────┐  │
│  │ Monetize   │ │ Growth     │ │ Health          │  │
│  │ Optimizer  │ │ Experiment │ │ Monitor         │  │
│  │ (L3)       │ │ (L4)       │ │ (L5 Autonomous) │  │
│  └────────────┘ └────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────┤
│              SAFETY & GOVERNANCE                     │
│  ┌──────────────────────────────────────────────┐    │
│  │ Confidence Thresholds │ Bias Detection       │    │
│  │ Auto-Rollback         │ Kill Switches        │    │
│  │ Audit Logs            │ Fairness Monitoring   │    │
│  │ Model Registry        │ Version Control       │    │
│  └──────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│              DATA INTELLIGENCE LAYER                 │
│  ┌──────────────────────────────────────────────┐    │
│  │ Transaction History │ Behavioral Signals     │    │
│  │ Market Indices      │ Learning Feedback Loop │    │
│  │ External Data       │ Model Training Sets    │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

AUTONOMY LEVELS:
L1: Alert only          → Human decides everything
L2: Recommend            → AI suggests, human approves
L3: Act with approval    → AI executes after human OK
L4: Act with audit       → AI executes, logged for review
L5: Fully autonomous     → AI executes, human override available

LEARNING CYCLE: 6-hour recalibration via learning-engine worker
SAFETY: ≥90% confidence for auto-scaling; HITL for high-value decisions`,
  kpis: [
    { metric: 'AI-Driven Revenue Uplift', target: '≥35% of revenue attributable to AI optimization' },
    { metric: 'Lead Routing Accuracy', target: '≥88% buyer-agent match satisfaction' },
    { metric: 'Pricing Recommendation Accuracy', target: '≥92% within 5% of actual transaction price' },
    { metric: 'Override Rate', target: '<5% of AI decisions require manual override' },
    { metric: 'Model Retraining Cycle', target: '≤6 hours for core models' },
    { metric: 'Incident Response (AI)', target: '<15 minutes to detect + rollback' },
  ],
};

const annualChecklist = [
  { category: 'Valuation Narrative', items: ['Refresh all proof points with current metrics', 'Update comparable company multiples analysis', 'Reassess TAM/SAM/SOM with latest market data', 'Review investor feedback themes and adjust narrative'] },
  { category: 'Category Leadership', items: ['Audit media adoption of category terminology', 'Assess competitor positioning shifts', 'Review thought leadership content performance', 'Evaluate industry event ROI and visibility'] },
  { category: 'AI Intelligence Systems', items: ['Full model accuracy audit across all domains', 'Fairness and bias assessment review', 'Override frequency analysis and root cause review', 'Infrastructure scalability stress testing'] },
  { category: 'Strategic Position', items: ['Board-level strategic review and direction validation', 'Regulatory landscape reassessment', 'Team capability gap analysis for next growth phase', 'Partnership and M&A opportunity pipeline review'] },
];

const risks = [
  { signal: 'Valuation narrative disconnected from actual metrics', severity: 94, mitigation: 'Gate all investor communications on verified data; never project metrics without clear assumptions; maintain "honest deck" alongside aspirational deck; board-level narrative review quarterly' },
  { signal: 'Category creation fails — market rejects new terminology', severity: 82, mitigation: 'Test terminology with target audiences before committing; ensure category definition solves a real pain point; adapt language based on adoption signals; category creation takes 2-3 years — patience required' },
  { signal: 'AI autonomy causes negative user experience', severity: 91, mitigation: 'Start at Level 2-3 autonomy, earn trust before advancing; robust A/B testing before expanding autonomy; clear rollback protocols; dedicated AI safety team member' },
  { signal: 'Over-investment in AI infrastructure before PMF depth', severity: 87, mitigation: 'Prioritize intelligence features that directly drive revenue; avoid building AI for AI\'s sake; measure every model by revenue or retention impact; pragmatic ML over cutting-edge' },
  { signal: 'Competitive response — incumbents copy positioning', severity: 79, mitigation: 'Speed of execution is the moat; data advantage compounds daily; focus on depth of intelligence vs breadth; build switching costs through workflow integration' },
  { signal: 'Key person risk — founder as sole category voice', severity: 85, mitigation: 'Develop 2-3 additional company spokespersons; build institutional brand beyond founder; create content systems not dependent on single person; hire Head of Communications' },
];

const UnicornCategoryAIControlBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Gem className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Unicorn Valuation + Category Creation + Autonomous AI Control</h2>
          <p className="text-sm text-muted-foreground">Valuation narrative, global category leadership & intelligent platform orchestration</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="valuation" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="valuation"><Gem className="h-4 w-4 mr-1.5" />Unicorn Valuation</TabsTrigger>
        <TabsTrigger value="category"><Globe className="h-4 w-4 mr-1.5" />Category Creation</TabsTrigger>
        <TabsTrigger value="ai"><Brain className="h-4 w-4 mr-1.5" />Autonomous AI</TabsTrigger>
        <TabsTrigger value="annual"><ClipboardCheck className="h-4 w-4 mr-1.5" />Annual Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* VALUATION TAB */}
      <TabsContent value="valuation" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />Narrative Pillars</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {unicornValuation.narrativePillars.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-bold text-foreground">{p.pillar}</span>
                  <p className="text-[11px] text-foreground mt-1 italic">"{p.narrative}"</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.evidence.map((e, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">📊 {e}</Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-primary mt-1">💎 Investor resonance: {p.investorResonance}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {unicornValuation.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 2)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-xs font-bold text-foreground mt-1">{k.target}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{k.current}</Badge>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(7)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Valuation Construction Framework</CardTitle></CardHeader>
            <CardContent><CopyBlock text={unicornValuation.valuationFramework} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* CATEGORY CREATION TAB */}
      <TabsContent value="category" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Category Repositioning</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-xs text-destructive border-destructive/30 line-through">{categoryCreation.categoryDefinition.oldCategory}</Badge>
                <ArrowUpRight className="h-4 w-4 text-primary" />
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{categoryCreation.categoryDefinition.newCategory}</Badge>
              </div>
              <p className="text-[11px] text-foreground italic mb-3">"{categoryCreation.categoryDefinition.tagline}"</p>
              <div className="space-y-1.5">
                {categoryCreation.categoryDefinition.differentiators.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/20">
                    <Badge variant="outline" className="text-[10px] w-20 justify-center flex-shrink-0">{d.dimension}</Badge>
                    <span className="text-[10px] text-muted-foreground line-through flex-1">{d.old}</span>
                    <ArrowUpRight className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-[10px] text-primary flex-1">{d.new}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-3" />Proprietary Terminology</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {categoryCreation.terminology.map((t, i) => (
                <div key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-bold text-foreground">{t.term}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.definition}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-4" />Authority Initiatives</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {categoryCreation.authorityInitiatives.map((a, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-bold text-foreground">{a.initiative}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>
                  <p className="text-[10px] text-foreground mt-0.5">📋 {a.format}</p>
                  <p className="text-[10px] text-primary mt-0.5">🏆 {a.categoryEffect}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {categoryCreation.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 4)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-xs font-bold text-foreground mt-1">{k.target}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* AUTONOMOUS AI TAB */}
      <TabsContent value="ai" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />AI Decision Domains</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {autonomousAI.decisionDomains.map((d, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{d.domain}</span>
                    <Badge className="text-[10px] bg-chart-4/10 text-chart-4 border-chart-4/20">{d.autonomy}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {d.decisions.map((dec, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">⚙️ {dec}</Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">📥 Data: {d.dataSources}</p>
                  <p className="text-[10px] text-foreground mt-0.5">⏱️ {d.refreshCycle}</p>
                  <p className="text-[10px] text-destructive mt-0.5">🛡️ Safety: {d.safetyGuard}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-3" />Governance Framework</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {autonomousAI.governanceFramework.map((g, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-bold text-foreground">{g.layer}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{g.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(g.levels || g.mechanisms || g.features || []).map((item, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {autonomousAI.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-xs font-bold text-foreground mt-1">{k.target}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(9)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Autonomous AI Control Architecture</CardTitle></CardHeader>
            <CardContent><CopyBlock text={autonomousAI.architectureDiagram} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* ANNUAL CHECK TAB */}
      <TabsContent value="annual" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {annualChecklist.map((cat, i) => (
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

export default UnicornCategoryAIControlBlueprint;
