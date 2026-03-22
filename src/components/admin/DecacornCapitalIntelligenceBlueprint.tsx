
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Landmark, Brain, AlertTriangle, ClipboardCheck, Copy, Check, TrendingUp, Target, Shield, Layers, Zap, BarChart3, Crown, ArrowUpRight, Network } from 'lucide-react';
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

const financialEngine = {
  revenueStreams: [
    { stream: 'Marketplace Transactions', model: '0.3–0.8% facilitation fee on closed deals', currentContrib: '35%', decacornContrib: '25%', arrTarget: '$25M', scaleMechanism: 'GMV growth × take-rate optimization; expand to rental + commercial transactions', marginProfile: '85% gross margin — pure digital facilitation' },
    { stream: 'Enterprise SaaS', model: 'Subscription bundles for agencies, developers, institutional clients', currentContrib: '20%', decacornContrib: '30%', arrTarget: '$30M', scaleMechanism: 'Land-and-expand: basic CRM → analytics → full operating system; annual contracts', marginProfile: '90%+ gross margin — pure software delivery' },
    { stream: 'Data Intelligence Products', model: 'Tiered analytics subscriptions + API feeds + institutional terminals', currentContrib: '5%', decacornContrib: '25%', arrTarget: '$25M', scaleMechanism: 'Data compounds with zero marginal cost; pricing power increases with accuracy', marginProfile: '92%+ gross margin — highest margin business line' },
    { stream: 'Financial Services Layer', model: 'Mortgage referral fees + insurance commissions + escrow services', currentContrib: '5%', decacornContrib: '15%', arrTarget: '$15M', scaleMechanism: 'Embed financing into transaction flow; capture 2–4% of loan origination value', marginProfile: '60–70% gross margin — partner revenue share' },
    { stream: 'Advertising & Sponsored Placement', model: 'CPM/CPC from banks, insurance, interior design, moving services', currentContrib: '10%', decacornContrib: '5%', arrTarget: '$5M', scaleMechanism: 'High-intent contextual ads on property pages; performance-based pricing', marginProfile: '80%+ gross margin — limited content moderation cost' },
  ],
  marginExpansion: [
    { lever: 'Automation of Onboarding', currentCost: '40% of ops budget', targetCost: '12% of ops budget', mechanism: 'Self-serve vendor onboarding + AI listing quality checker + automated verification', timeline: '12–18 months', impact: '28pp ops cost reduction' },
    { lever: 'Performance Marketing Efficiency', currentCost: 'CAC $45', targetCost: 'CAC $18', mechanism: 'ML-optimized bidding + organic/referral channel growth + brand-driven inbound', timeline: '18–24 months', impact: '60% CAC reduction' },
    { lever: 'Support Automation', currentCost: '15% of ops budget', targetCost: '4% of ops budget', mechanism: 'AI chatbot handling 80%+ of tier-1 inquiries; self-serve knowledge base', timeline: '12 months', impact: '11pp ops cost reduction' },
    { lever: 'Infrastructure Optimization', currentCost: '$8 per 1K requests', targetCost: '$2 per 1K requests', mechanism: 'Edge caching + query optimization + tiered compute allocation', timeline: '6–12 months', impact: '75% infrastructure cost reduction per unit' },
  ],
  financialRoadmap: `💰 DECACORN FINANCIAL ENGINE ROADMAP

━━━━ PHASE 1: Foundation ($0–$5M ARR) ━━━━
🎯 Focus: Product-market fit + unit economics proof
📊 Revenue mix: 60% transaction + 30% subscription + 10% ads
📈 Growth: 15–25% MoM revenue growth
💸 Burn multiple: <3x (every $3 burned = $1 new ARR)
🏁 Gate: Positive unit economics in ≥3 cities

━━━━ PHASE 2: Scale ($5M–$25M ARR) ━━━━
🎯 Focus: Multi-city dominance + enterprise monetization
📊 Revenue mix: 35% transaction + 35% SaaS + 20% data + 10% finserv
📈 Growth: 10–15% MoM revenue growth
💸 Burn multiple: <2x (improving capital efficiency)
🏁 Gate: ≥8 cities profitable; data revenue ≥15% of total

━━━━ PHASE 3: Dominance ($25M–$100M ARR) ━━━━
🎯 Focus: Regional expansion + financial services + IPO prep
📊 Revenue mix: 25% transaction + 30% SaaS + 25% data + 15% finserv + 5% ads
📈 Growth: 8–12% MoM revenue growth
💸 Burn multiple: <1.5x (approaching profitability)
🏁 Gate: Contribution margin ≥60%; LTV/CAC ≥6x

━━━━ PHASE 4: Decacorn ($100M+ ARR) ━━━━
🎯 Focus: Platform ecosystem + cross-border + adjacent verticals
📊 Revenue mix: Diversified across 5+ streams; no single stream >30%
📈 Growth: 50–80% YoY at scale
💸 Free cash flow positive
🏁 Gate: $10B+ valuation justified by fundamentals

━━━━ VALUATION MATH ━━━━
$100M ARR × 15–25x multiple = $1.5B–$2.5B
$100M ARR × 40–60x (infrastructure premium) = $4B–$6B
$100M ARR × 80–100x (category leader premium) = $8B–$10B+

Key: Infrastructure positioning + data moat + network effects
     = premium multiple justification`,
  kpis: [
    { metric: 'ARR Trajectory', target: '$100M+ for decacorn', phase: '5–7 years' },
    { metric: 'Gross Margin', target: '≥78% blended', phase: 'At scale' },
    { metric: 'LTV/CAC', target: '≥6x blended', phase: 'All segments' },
    { metric: 'Net Revenue Retention', target: '≥130%', phase: 'Enterprise cohorts' },
    { metric: 'Rule of 40', target: 'Growth % + Margin % ≥ 60', phase: 'Series C+' },
    { metric: 'Free Cash Flow Margin', target: '≥15%', phase: 'At $50M+ ARR' },
  ],
};

const capitalDominance = {
  positioning: [
    { narrative: 'Liquidity Infrastructure Thesis', message: 'ASTRA is not a marketplace — it is the liquidity intelligence infrastructure for the world\'s largest emerging property markets. We make $350B+ in annual transactions more efficient, transparent, and data-driven.', targetAudience: 'Sovereign wealth funds, global PE, crossover investors', proofPoints: ['$[X]B GMV facilitated', 'Pricing accuracy ≥92%', 'Present in [X] cities across [Y] countries', 'Institutional clients include [logos]'], valuationImpact: 'Infrastructure positioning commands 3–5x multiple premium over pure marketplace' },
    { narrative: 'Data Moat Compounding', message: 'Every transaction on ASTRA makes our intelligence 0.3% more accurate. After [X] transactions, our data advantage is mathematically unreplicable. Competitors would need [Y] years of transaction history to match our current accuracy.', targetAudience: 'Technology-focused growth equity, data-centric investors', proofPoints: ['[X]M proprietary data points', 'Model accuracy: [X]% (improving [Y]% quarterly)', 'Data products generating $[Z]M ARR', 'API partnerships with [X] institutions'], valuationImpact: 'Data network effects = permanent competitive moat narrative' },
    { narrative: 'Financial Services Expansion', message: 'We sit at the point of maximum intent in the largest financial decision most people ever make. Embedding financing, insurance, and transaction services into our flow creates a fintech-grade revenue engine on top of marketplace infrastructure.', targetAudience: 'Fintech-focused investors, banking sector strategic investors', proofPoints: ['[X]% of transactions use embedded financing', 'Mortgage referral revenue: $[X]M/year', 'Insurance attach rate: [X]%', 'Escrow volume: $[X]B/year'], valuationImpact: 'Fintech adjacency adds 20–40% to total addressable revenue' },
  ],
  engagementFramework: [
    { tier: 'Tier 1 — Strategic Anchors', investors: 'Sovereign wealth funds (GIC, Temasek, ADIA, PIF)', engagement: 'Board-level relationship; quarterly strategic briefings; co-investment opportunities', capitalTarget: '$50–200M per relationship', approach: 'Long-term infrastructure thesis; patient capital narrative; governance alignment' },
    { tier: 'Tier 2 — Growth Equity', investors: 'Tiger Global, Coatue, General Atlantic, Warburg Pincus', engagement: 'Monthly metrics updates; product demos; market intelligence sharing', capitalTarget: '$25–100M per round', approach: 'Growth metrics + unit economics proof; clear path to profitability; category leadership' },
    { tier: 'Tier 3 — Regional Champions', investors: 'East Ventures, AC Ventures, Sequoia SEA, GGV', engagement: 'Quarterly business reviews; local market intelligence; portfolio synergies', capitalTarget: '$10–50M per round', approach: 'Southeast Asia expertise; regulatory navigation; local market proof points' },
    { tier: 'Tier 4 — Strategic Corporate', investors: 'PropertyGuru, Zillow Group, CoStar, banking groups', engagement: 'Partnership discussions; data sharing pilots; potential M&A conversations', capitalTarget: 'Strategic value > capital value', approach: 'Ecosystem synergies; technology licensing; market access exchange' },
  ],
  narrativeTemplate: `🏛️ GLOBAL INSTITUTIONAL CAPITAL NARRATIVE

━━━━ THE INFRASTRUCTURE THESIS ━━━━

"Real estate is the world's largest asset class at $326T 
globally. Yet property transactions remain stuck in the 
analog era — opaque, slow, and data-poor.

ASTRA is building the intelligence infrastructure that 
makes property markets work like capital markets: 
transparent, efficient, and data-driven.

We are to property what Bloomberg is to financial markets, 
what Stripe is to payments, what Shopify is to commerce — 
the invisible infrastructure layer that makes the entire 
ecosystem more efficient."

━━━━ THE NUMBERS THAT MATTER ━━━━

📊 SCALE METRICS:
• GMV facilitated: $[X]B (growing [Y]% YoY)
• Active in [X] cities across [Y] countries
• [X] institutional clients on platform
• [X]M data points powering intelligence

💰 FINANCIAL QUALITY:
• ARR: $[X]M (growing [Y]% YoY)
• Gross margin: [X]%
• Net revenue retention: [X]%
• LTV/CAC: [X]x

🏗️ MOAT DEPTH:
• Pricing prediction accuracy: [X]%
• [X] years of proprietary transaction data
• [X] API integrations with financial institutions
• Vendor retention: [X]% (12-month)

━━━━ THE ASK ━━━━

"We're raising $[X]M to:
1. Expand infrastructure to [X] new markets
2. Scale data intelligence products to $[X]M ARR
3. Launch embedded financial services layer
4. Build the team to support $[X]M ARR operations

This is an infrastructure investment in the digitization 
of the world's largest asset class. The market is $326T. 
Our current penetration is <0.01%. The opportunity is 
generational."`,
  kpis: [
    { metric: 'Institutional AUM Influenced', target: '$1B+ annually' },
    { metric: 'Tier-1 Investor Relationships', target: '≥15 active' },
    { metric: 'Capital Raised (Cumulative)', target: '$50M+ across rounds' },
    { metric: 'Strategic Partnership Logos', target: '≥10 recognizable brands' },
    { metric: 'Investor NPS', target: '≥75 (existing investors)' },
  ],
};

const selfEvolvingIntelligence = {
  learningLoops: [
    { loop: 'Pricing Intelligence Evolution', inputSignals: ['Listed prices vs actual transaction prices', 'Time-on-market patterns', 'Demand intensity signals (views, inquiries, viewings)', 'Comparable transaction outcomes'], learningMechanism: 'Regression model retrained every 6 hours on latest transaction data; shadow model testing before production deployment', accuracyTrajectory: 'Target: 85% → 92% → 96% accuracy over 18 months', compoundingEffect: 'Each 1% accuracy improvement increases buyer trust → more transactions → more training data → faster improvement' },
    { loop: 'Buyer Intent Prediction', inputSignals: ['Search query patterns and evolution', 'Listing interaction depth and frequency', 'Cross-property comparison behavior', 'Time-of-day and session duration patterns'], learningMechanism: 'Classification model (casual/serious/institutional) with reinforcement learning from actual conversion outcomes', accuracyTrajectory: 'Target: 70% → 85% → 93% intent classification accuracy', compoundingEffect: 'Better intent prediction → more relevant lead routing → higher agent satisfaction → more agent participation' },
    { loop: 'Vendor Performance Optimization', inputSignals: ['Response time to inquiries', 'Listing quality scores and engagement rates', 'Deal closure rates by property type', 'Customer satisfaction feedback'], learningMechanism: 'Multi-armed bandit for lead distribution; vendors with improving performance get progressively more leads', accuracyTrajectory: 'Target: 15% → 30% → 45% inquiry-to-deal conversion platform-wide', compoundingEffect: 'Better vendors get more leads → marketplace quality improves → buyer trust increases → more inquiries' },
    { loop: 'Market Timing Intelligence', inputSignals: ['Transaction velocity changes by district', 'Price momentum and mean-reversion signals', 'Supply-demand ratio shifts', 'External economic indicators (interest rates, GDP, regulation)'], learningMechanism: 'Time-series forecasting with ensemble methods; backtested against 24+ months of historical data', accuracyTrajectory: 'Target: 60% → 75% → 85% directional accuracy on quarterly price movements', compoundingEffect: 'Accurate timing advice → investors trust platform → more institutional capital → larger transactions → better data' },
  ],
  autonomousGrowth: [
    { system: 'Experiment Prioritization Engine', description: 'AI ranks growth experiments by expected impact × confidence × effort, auto-allocating traffic', capabilities: ['Bayesian optimization for variant selection', 'Auto-termination of underperforming experiments', 'Cross-experiment interference detection', 'Cumulative learning across experiment history'], autonomyLevel: 'L4: Auto-execute experiments; human approval for >10% traffic allocation' },
    { system: 'Adaptive Campaign Orchestrator', description: 'Dynamic budget allocation across marketing channels based on real-time performance signals', capabilities: ['Cross-channel attribution modeling', 'Diminishing returns detection per channel', 'Seasonal pattern recognition and pre-positioning', 'Budget reallocation within ±20% autonomously'], autonomyLevel: 'L3: Recommend reallocation; human approval for budget changes >20%' },
    { system: 'Churn Prevention Engine', description: 'Predictive model identifying at-risk vendors and buyers before they disengage', capabilities: ['30-day churn probability scoring', 'Automated re-engagement trigger sequences', 'Personalized retention offer optimization', 'Root cause analysis for churn patterns'], autonomyLevel: 'L4: Auto-trigger retention campaigns; human review for high-value accounts' },
    { system: 'Revenue Optimization Controller', description: 'Dynamic pricing and packaging optimization for premium products', capabilities: ['Price elasticity testing per vendor segment', 'Bundle recommendation optimization', 'Upsell timing optimization based on usage patterns', 'Discount depth optimization (minimize revenue leakage)'], autonomyLevel: 'L3: Recommend pricing changes; human approval for adjustments >15%' },
  ],
  governanceLayers: [
    { layer: 'Model Registry & Versioning', description: 'Every production model versioned with full lineage tracking', controls: ['Automated A/B comparison: new model must beat incumbent by ≥2% on primary metric', 'Rollback within 5 minutes if degradation detected', 'Model cards documenting training data, biases, and limitations', 'Quarterly external audit of model fairness'] },
    { layer: 'Confidence-Gated Autonomy', description: 'Autonomy level scales with model confidence and historical accuracy', controls: ['≥95% confidence: full autonomy with audit logging', '80–94%: auto-execute with human notification', '60–79%: recommend only, await human decision', '<60%: suppress recommendation, flag for review'] },
    { layer: 'Ethical Guardrails', description: 'Hard constraints preventing AI from harmful optimization', controls: ['No discriminatory pricing based on protected characteristics', 'Vendor fairness: minimum lead allocation regardless of performance tier', 'Transparency: users can request explanation of any AI recommendation', 'No dark patterns: urgency signals must reflect genuine market conditions'] },
    { layer: 'Strategic Override Console', description: 'Admin command center with full visibility and instant control', controls: ['Kill switch per autonomous domain (response time <1 minute)', 'Decision audit trail with full reasoning chain', 'A/B traffic allocation manual controls', 'Model weight adjustment interface for domain experts'] },
  ],
  architectureDiagram: `🧬 SELF-EVOLVING INTELLIGENCE ARCHITECTURE

┌──────────────────────────────────────────────────────┐
│              STRATEGIC OVERRIDE CONSOLE               │
│  Kill switches │ Decision audit │ Weight adjustment   │
│  Full human control over every autonomous system      │
├──────────────────────────────────────────────────────┤
│           CONFIDENCE-GATED ORCHESTRATOR               │
│  ┌─────────────────────────────────────────────────┐  │
│  │ For each decision:                              │  │
│  │   1. Compute confidence score                   │  │
│  │   2. Check autonomy level threshold             │  │
│  │   3. Execute OR escalate to human               │  │
│  │   4. Log decision + outcome for learning        │  │
│  └─────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│            LEARNING LOOP ENGINES                      │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────┐  │
│  │ Pricing    │ │ Buyer      │ │ Market Timing     │  │
│  │ Evolution  │ │ Intent     │ │ Intelligence      │  │
│  │ Loop       │ │ Prediction │ │ Loop              │  │
│  │ (6hr cycle)│ │ (realtime) │ │ (daily cycle)     │  │
│  └────────────┘ └────────────┘ └───────────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────┐  │
│  │ Vendor     │ │ Churn      │ │ Revenue           │  │
│  │ Performance│ │ Prevention │ │ Optimization      │  │
│  │ Loop       │ │ Engine     │ │ Controller        │  │
│  │ (daily)    │ │ (daily)    │ │ (weekly cycle)    │  │
│  └────────────┘ └────────────┘ └───────────────────┘  │
├──────────────────────────────────────────────────────┤
│            MODEL LIFECYCLE MANAGEMENT                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Registry │ Shadow Testing │ Auto-Rollback       │  │
│  │ Version Control │ Drift Detection │ Retraining  │  │
│  │ Fairness Audit │ Bias Monitoring │ Model Cards  │  │
│  └─────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│            DATA INTELLIGENCE SUBSTRATE               │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Transaction   │ Behavioral    │ Market Signals  │  │
│  │ History       │ Streams       │ (External)      │  │
│  │               │               │                 │  │
│  │ Feature Store │ Training Sets │ Feedback Logs   │  │
│  │ (real-time)   │ (versioned)   │ (outcome data)  │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

EVOLUTION CYCLE:
Data → Model Training → Shadow Test → Promote → Monitor
→ Detect Drift → Retrain → Shadow Test → Promote → ...

SAFETY INVARIANTS:
• No model deployed without shadow test period
• No autonomy increase without 30-day track record
• Human override always available within 60 seconds
• Quarterly external fairness audit mandatory`,
  kpis: [
    { metric: 'Pricing Accuracy', target: '≥96% within 5% of actual transaction' },
    { metric: 'Intent Classification Accuracy', target: '≥93% buyer intent prediction' },
    { metric: 'Platform Conversion Uplift (AI-driven)', target: '≥40% vs non-AI baseline' },
    { metric: 'Model Retraining Cycle', target: '≤6 hours for core models' },
    { metric: 'Autonomous Decision Accuracy', target: '≥95% no-override rate' },
    { metric: 'Learning Velocity', target: '≥0.3% weekly accuracy improvement' },
  ],
};

const multiYearChecklist = [
  { category: 'Financial Engine', items: ['ARR trajectory vs decacorn roadmap milestones', 'Revenue mix diversification (no single stream >30%)', 'Gross margin trend and blended target progress', 'Capital efficiency: burn multiple and Rule of 40 score', 'Net revenue retention by customer segment'] },
  { category: 'Capital Relationships', items: ['Tier-1 institutional relationship pipeline health', 'Investor NPS and re-up probability assessment', 'Strategic partnership value and longevity review', 'Capital market positioning vs comparable companies'] },
  { category: 'Intelligence Systems', items: ['Model accuracy trends across all learning loops', 'Autonomous decision override frequency and root causes', 'Fairness audit results and corrective actions', 'Data compounding velocity and competitive gap measurement'] },
  { category: 'Strategic Risk', items: ['Regulatory landscape changes impacting business model', 'Competitive threat assessment and response readiness', 'Key person and team concentration risk evaluation', 'Technology debt and architecture scalability headroom'] },
];

const risks = [
  { signal: 'Revenue growth decelerating despite market expansion', severity: 95, mitigation: 'Diversify revenue mix aggressively; investigate channel saturation vs product-market fit issues; consider adjacent market entry; evaluate pricing power vs volume trade-offs' },
  { signal: 'Institutional capital narrative not converting to actual capital', severity: 88, mitigation: 'Ground narrative in verifiable metrics only; build 3+ warm relationships per tier before fundraising; use existing investor introductions; consider strategic capital alongside financial capital' },
  { signal: 'Self-evolving AI producing unexpected optimization behaviors', severity: 92, mitigation: 'Maintain strict confidence gating; never increase autonomy level without 30-day track record; quarterly external audit; incident response protocol with <15min rollback capability' },
  { signal: 'Multi-region expansion fragmenting operational focus', severity: 86, mitigation: 'Strict expansion gates: do not enter new region until current regions profitable; dedicated regional teams with shared intelligence; central platform, local execution' },
  { signal: 'Data moat assumption invalidated by competitor data acquisition', severity: 83, mitigation: 'Accelerate proprietary data capture velocity; build switching costs through workflow integration; pursue exclusive data partnerships; compound intelligence advantage faster than competitors can acquire' },
  { signal: 'Governance complexity slowing decision velocity at scale', severity: 80, mitigation: 'Dual-class share structure maintaining founder control; clear decision rights matrix; minimal board size with aligned directors; founder retains operational control with board-level strategy governance' },
];

const DecacornCapitalIntelligenceBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Crown className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Decacorn Financial Engine + Capital Dominance + Self-Evolving Intelligence</h2>
          <p className="text-sm text-muted-foreground">Mega-scale financial growth, institutional capital positioning & autonomous learning architecture</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="financial" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="financial"><DollarSign className="h-4 w-4 mr-1.5" />Financial Engine</TabsTrigger>
        <TabsTrigger value="capital"><Landmark className="h-4 w-4 mr-1.5" />Capital Dominance</TabsTrigger>
        <TabsTrigger value="intelligence"><Brain className="h-4 w-4 mr-1.5" />Self-Evolving AI</TabsTrigger>
        <TabsTrigger value="checklist"><ClipboardCheck className="h-4 w-4 mr-1.5" />Multi-Year Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* FINANCIAL ENGINE TAB */}
      <TabsContent value="financial" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Revenue Stream Architecture</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {financialEngine.revenueStreams.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{s.stream}</span>
                    <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">ARR: {s.arrTarget}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">💰 {s.model}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px]">Now: {s.currentContrib}</Badge>
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Target: {s.decacornContrib}</Badge>
                  </div>
                  <p className="text-[10px] text-foreground mt-1">📈 {s.scaleMechanism}</p>
                  <p className="text-[10px] text-chart-3 mt-0.5">📊 {s.marginProfile}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" />Margin Expansion Levers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {financialEngine.marginExpansion.map((m, i) => (
                <div key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{m.lever}</span>
                    <Badge variant="outline" className="text-[10px]">{m.timeline}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] text-destructive border-destructive/20">{m.currentCost}</Badge>
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                    <Badge className="text-[9px] bg-chart-3/10 text-chart-3 border-chart-3/20">{m.targetCost}</Badge>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">{m.impact}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">⚙️ {m.mechanism}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {financialEngine.kpis.map((k, i) => (
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
            <CardHeader className="pb-3"><CardTitle className="text-sm">Decacorn Financial Roadmap</CardTitle></CardHeader>
            <CardContent><CopyBlock text={financialEngine.financialRoadmap} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* CAPITAL DOMINANCE TAB */}
      <TabsContent value="capital" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" />Positioning Narratives</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {capitalDominance.positioning.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-bold text-foreground">{p.narrative}</span>
                  <p className="text-[11px] text-foreground mt-1 italic">"{p.message}"</p>
                  <Badge variant="outline" className="text-[10px] mt-1.5">{p.targetAudience}</Badge>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.proofPoints.map((pp, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">📊 {pp}</Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-primary mt-1">💎 {p.valuationImpact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Network className="h-4 w-4 text-chart-3" />Capital Relationship Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {capitalDominance.engagementFramework.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{t.tier}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{t.capitalTarget}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">🏛️ {t.investors}</p>
                  <p className="text-[10px] text-foreground mt-0.5">📋 {t.engagement}</p>
                  <p className="text-[10px] text-primary mt-0.5">🎯 {t.approach}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {capitalDominance.kpis.map((k, i) => (
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
            <CardHeader className="pb-3"><CardTitle className="text-sm">Global Institutional Capital Narrative</CardTitle></CardHeader>
            <CardContent><CopyBlock text={capitalDominance.narrativeTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* SELF-EVOLVING AI TAB */}
      <TabsContent value="intelligence" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Learning Loop Engines</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selfEvolvingIntelligence.learningLoops.map((l, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-bold text-foreground">{l.loop}</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {l.inputSignals.map((s, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">📥 {s}</Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">⚙️ {l.learningMechanism}</p>
                  <p className="text-[10px] text-foreground mt-0.5">📈 {l.accuracyTrajectory}</p>
                  <p className="text-[10px] text-primary mt-0.5">🔄 {l.compoundingEffect}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Autonomous Growth Systems</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selfEvolvingIntelligence.autonomousGrowth.map((a, i) => (
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

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-4" />Governance Layers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selfEvolvingIntelligence.governanceLayers.map((g, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-semibold text-foreground">{g.layer}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{g.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {g.controls.map((c, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">🛡️ {c}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {selfEvolvingIntelligence.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 4)}>
              <Card><CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                <p className="text-xs font-bold text-foreground mt-1">{k.target}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(10)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Self-Evolving Intelligence Architecture</CardTitle></CardHeader>
            <CardContent><CopyBlock text={selfEvolvingIntelligence.architectureDiagram} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* MULTI-YEAR CHECK TAB */}
      <TabsContent value="checklist" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {multiYearChecklist.map((cat, i) => (
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

export default DecacornCapitalIntelligenceBlueprint;
