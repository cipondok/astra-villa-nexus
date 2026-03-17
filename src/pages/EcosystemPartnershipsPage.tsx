import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Handshake, Building2, Landmark, Wrench, Users, ChevronRight,
  Target, Zap, Shield, Star, Clock, CheckCircle2, ArrowUpRight,
  BarChart3, Crown, Globe, Layers, Brain, CircleDot, Award,
  Home, Scale, Briefcase, Heart, MessageSquare, CalendarDays,
  TrendingUp, DollarSign, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   PARTNERSHIP CATEGORIES
   ═══════════════════════════════════════════ */

interface PartnershipOpportunity {
  partner: string;
  model: string;
  valueToPartner: string;
  valueToAstra: string;
  status: 'Active' | 'In Discussion' | 'Planned' | 'Concept';
  priority: 'Critical' | 'High' | 'Medium';
}

interface PartnershipCategory {
  name: string;
  icon: typeof Landmark;
  color: string;
  bgColor: string;
  barColor: string;
  strategic: string;
  opportunities: PartnershipOpportunity[];
}

const CATEGORIES: PartnershipCategory[] = [
  {
    name: 'Financial Institutions',
    icon: Landmark,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    barColor: 'bg-chart-2',
    strategic: 'Embed ASTRA Villa as the preferred digital channel for mortgage origination and investor financing — every transaction that flows through our platform becomes a qualified lead for banking partners.',
    opportunities: [
      { partner: 'Major Bank KPR Integration', model: 'Revenue share on originated mortgages (0.3–0.5% of loan value)', valueToPartner: 'Pre-qualified digital leads with property context, reducing underwriting cost by 40%', valueToAstra: 'Embedded financing increases transaction conversion rate by 25–35%', status: 'In Discussion', priority: 'Critical' },
      { partner: 'Investor Pre-Approval Tool', model: 'API integration with credit scoring — co-branded experience', valueToPartner: 'Access to high-net-worth investor pipeline with verified asset profiles', valueToAstra: 'Pre-approved buyers accelerate deal velocity and reduce negotiation friction', status: 'Planned', priority: 'Critical' },
      { partner: 'Multi-Bank Rate Comparison', model: 'Lead generation fee per qualified application (Rp 500K–2M)', valueToPartner: 'Competitive marketplace drives application volume across 5+ banks', valueToAstra: 'Becomes decision hub for financing — increases platform stickiness', status: 'Concept', priority: 'High' },
      { partner: 'Developer Project Financing', model: 'Preferred financing packages for featured projects', valueToPartner: 'Exclusive access to curated development portfolio with demand validation', valueToAstra: 'Pre-approved financing on featured projects increases developer partnership value', status: 'Concept', priority: 'Medium' },
    ],
  },
  {
    name: 'Developer Networks',
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    barColor: 'bg-primary',
    strategic: 'Position as the intelligence partner developers need before and during project launches — our demand data is more valuable than any advertising platform because it predicts actual absorption.',
    opportunities: [
      { partner: 'Exclusive Launch Partnerships', model: 'Rp 50M–200M per project launch campaign + 1% sales commission', valueToPartner: 'AI-validated demand targeting reduces marketing waste by 60%, pre-launch waitlists', valueToAstra: 'Premium revenue stream + exclusive inventory attracts investor traffic', status: 'Active', priority: 'Critical' },
      { partner: 'Demand Intelligence Reports', model: 'Rp 15M–30M per custom area analysis report', valueToPartner: 'Data-driven launch pricing and unit mix decisions — reduces unsold inventory risk', valueToAstra: 'Monetizes proprietary behavioral data — pure margin revenue', status: 'In Discussion', priority: 'High' },
      { partner: 'Pre-Sales Integration', model: 'Embedded reservation system with NUP management', valueToPartner: 'End-to-end digital sales funnel — real-time buyer pipeline visibility', valueToAstra: 'Captures transaction data at earliest stage — strengthens prediction models', status: 'Planned', priority: 'High' },
      { partner: 'Developer API Data Feed', model: 'Real-time inventory sync + pricing updates via API', valueToPartner: 'Automated listing management across platform — zero manual effort', valueToAstra: 'Always-current inventory improves marketplace quality and search accuracy', status: 'Planned', priority: 'Medium' },
    ],
  },
  {
    name: 'Property Service Providers',
    icon: Wrench,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    barColor: 'bg-chart-4',
    strategic: 'Own the post-transaction lifecycle — every property purchase triggers Rp 50M–200M in service spend. Capturing even 10% commission on this creates a massive recurring revenue layer.',
    opportunities: [
      { partner: 'Renovation Marketplace', model: '8–12% commission on project value through verified vendor network', valueToPartner: 'Guaranteed lead flow from verified property buyers with budget intent', valueToAstra: 'Post-purchase revenue capture — Rp 5M–25M per transaction in service commissions', status: 'Active', priority: 'High' },
      { partner: 'Legal & Notary Network', model: '5–10% facilitation fee on SHM/AJB/PPJB processing', valueToPartner: 'Steady client pipeline with pre-prepared documentation and property data', valueToAstra: 'End-to-end transaction experience reduces buyer anxiety and increases close rates', status: 'Active', priority: 'Critical' },
      { partner: 'Property Management Companies', model: 'Revenue share on managed rental portfolio (15–20% of management fee)', valueToPartner: 'Access to investor-owned rental properties seeking professional management', valueToAstra: 'Recurring revenue from rental lifecycle + rental performance data for AI models', status: 'In Discussion', priority: 'High' },
      { partner: 'Interior Design & Smart Home', model: 'Curated partner showcases + lead generation fees', valueToPartner: 'Premium buyer audience with active renovation budgets', valueToAstra: 'Expands service ecosystem breadth — positions platform as one-stop property hub', status: 'Planned', priority: 'Medium' },
      { partner: 'Insurance Partners', model: 'Embedded property insurance at transaction close', valueToPartner: 'Digital-first distribution channel with verified property data pre-filled', valueToAstra: 'Commission per policy + increases transaction completeness perception', status: 'Concept', priority: 'Medium' },
    ],
  },
  {
    name: 'Investment Communities',
    icon: Users,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    barColor: 'bg-chart-1',
    strategic: 'Tap into existing trust networks — investor clubs have pre-qualified, high-intent members. Our intelligence becomes the reason they choose ASTRA Villa as their deal-flow platform.',
    opportunities: [
      { partner: 'Investor Club Collaborations', model: 'Co-branded market intelligence events + exclusive platform access', valueToPartner: 'Premium content and data insights that elevate club value proposition to members', valueToAstra: 'Direct access to organized investor groups — high-intent user acquisition at low CAC', status: 'In Discussion', priority: 'Critical' },
      { partner: 'Market Intelligence Events', model: 'Quarterly joint seminars — sponsored by developer and banking partners', valueToPartner: 'Networking and deal sourcing opportunities with curated investor audience', valueToAstra: 'Brand authority building + lead generation + sponsor revenue (Rp 20M–50M/event)', status: 'Planned', priority: 'High' },
      { partner: 'Diaspora Investment Networks', model: 'Offshore investor clubs targeting Indonesia property', valueToPartner: 'On-the-ground intelligence and verified deal flow for remote investors', valueToAstra: 'High-value foreign buyer segment with premium subscription potential', status: 'Concept', priority: 'High' },
      { partner: 'Proptech Community Integration', model: 'API/data partnerships with complementary proptech platforms', valueToPartner: 'Enhanced product capability through intelligence layer integration', valueToAstra: 'Network effects — connected ecosystem increases switching costs', status: 'Concept', priority: 'Medium' },
    ],
  },
];

/* ═══════════════════════════════════════════
   ENGAGEMENT FRAMEWORK
   ═══════════════════════════════════════════ */

const ENGAGEMENT_STAGES = [
  {
    stage: 'Identify & Qualify',
    icon: Target,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    duration: 'Weeks 1–3',
    actions: [
      'Map potential partners by category using industry databases and referral networks',
      'Score partnership fit using strategic value matrix (data value, revenue potential, brand alignment)',
      'Identify decision maker and prepare tailored value proposition deck',
    ],
  },
  {
    stage: 'Initiate & Demonstrate',
    icon: MessageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    duration: 'Weeks 4–6',
    actions: [
      'Conduct discovery meeting focused on partner pain points and growth objectives',
      'Present ASTRA Villa intelligence capabilities with live demo of relevant data',
      'Share pilot proposal with clear success metrics and minimal commitment scope',
    ],
  },
  {
    stage: 'Pilot & Validate',
    icon: Activity,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    duration: 'Weeks 7–14',
    actions: [
      'Execute 30–60 day pilot with defined KPIs (leads generated, conversion rate, revenue)',
      'Provide weekly performance dashboards to partner stakeholders',
      'Collect feedback and iterate on integration touchpoints',
    ],
  },
  {
    stage: 'Formalize & Scale',
    icon: Award,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    duration: 'Weeks 15–20',
    actions: [
      'Negotiate formal partnership agreement with revenue share terms and SLAs',
      'Launch co-branded integration visible to end users on platform',
      'Establish quarterly business review cadence with growth targets',
    ],
  },
];

/* ═══════════════════════════════════════════
   HUB POSITIONING
   ═══════════════════════════════════════════ */

const HUB_LAYERS = [
  {
    layer: 'Intelligence Layer',
    position: 'Core',
    icon: Brain,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: 'AI-powered market analytics, opportunity scoring, and predictive intelligence that no single partner can replicate independently',
    connections: ['Developer demand reports', 'Investor portfolio analytics', 'Bank risk assessment data', 'Service provider demand forecasts'],
  },
  {
    layer: 'Transaction Layer',
    position: 'Primary',
    icon: DollarSign,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    description: 'End-to-end property transaction facilitation from discovery through financing to closing',
    connections: ['Bank mortgage origination', 'Legal document processing', 'Insurance placement', 'Escrow and payment'],
  },
  {
    layer: 'Service Layer',
    position: 'Extended',
    icon: Layers,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    description: 'Post-purchase lifecycle services that maximize property value and investor returns',
    connections: ['Renovation marketplace', 'Property management', 'Interior design', 'Smart home installation'],
  },
  {
    layer: 'Community Layer',
    position: 'Network',
    icon: Globe,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    description: 'Trust-based investor networks and knowledge-sharing communities that drive organic growth',
    connections: ['Investor clubs', 'Developer forums', 'Diaspora networks', 'Proptech ecosystem'],
  },
];

/* ═══════════════════════════════════════════
   STATUS & PRIORITY STYLES
   ═══════════════════════════════════════════ */

const statusStyles: Record<string, { color: string; bg: string }> = {
  Active: { color: 'text-chart-1', bg: 'bg-chart-1/10' },
  'In Discussion': { color: 'text-chart-2', bg: 'bg-chart-2/10' },
  Planned: { color: 'text-chart-4', bg: 'bg-chart-4/10' },
  Concept: { color: 'text-muted-foreground', bg: 'bg-muted/20' },
};

const priorityStyles: Record<string, { color: string; bg: string }> = {
  Critical: { color: 'text-destructive', bg: 'bg-destructive/10' },
  High: { color: 'text-chart-2', bg: 'bg-chart-2/10' },
  Medium: { color: 'text-muted-foreground', bg: 'bg-muted/20' },
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function EcosystemPartnershipsPage() {
  const [activeTab, setActiveTab] = useState('partners');
  const [expandedCat, setExpandedCat] = useState('Financial Institutions');

  const totalOpps = CATEGORIES.flatMap(c => c.opportunities).length;
  const activeCount = CATEGORIES.flatMap(c => c.opportunities).filter(o => o.status === 'Active').length;
  const criticalCount = CATEGORIES.flatMap(c => c.opportunities).filter(o => o.priority === 'Critical').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-primary" />
                </div>
                Ecosystem Partnerships
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Multi-layer partnership strategy positioning ASTRA Villa as the central property intelligence hub</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">{activeCount} Active</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-destructive/20 text-destructive">{criticalCount} Critical</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-border text-muted-foreground">{totalOpps} Total</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="partners">Partnership Map</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Framework</TabsTrigger>
            <TabsTrigger value="hub">Hub Architecture</TabsTrigger>
          </TabsList>

          {/* ═══ PARTNERSHIP MAP ═══ */}
          <TabsContent value="partners" className="space-y-3">
            {CATEGORIES.map((cat, ci) => {
              const CIcon = cat.icon;
              const isExpanded = expandedCat === cat.name;
              return (
                <motion.div key={cat.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
                  <Card
                    className={cn('border bg-card cursor-pointer transition-all', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedCat(isExpanded ? '' : cat.name)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cat.bgColor)}>
                          <CIcon className={cn('h-5 w-5', cat.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{cat.name}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">{cat.opportunities.length} opportunities</Badge>
                          </div>
                          <p className="text-[9px] text-muted-foreground line-clamp-1">{cat.strategic}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {cat.opportunities.map((o, i) => {
                            const st = statusStyles[o.status];
                            return <div key={i} className={cn('w-2 h-2 rounded-full', st.bg, o.status === 'Active' && 'ring-1 ring-chart-1/30')} />;
                          })}
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-2" onClick={e => e.stopPropagation()}>
                        <p className="text-[10px] text-muted-foreground border-l-2 border-border pl-3 mb-3 italic">{cat.strategic}</p>
                        {cat.opportunities.map((opp, oi) => {
                          const st = statusStyles[opp.status];
                          const pr = priorityStyles[opp.priority];
                          return (
                            <div key={oi} className="p-3 rounded-lg bg-muted/10 border border-border/30 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Zap className={cn('h-3 w-3', cat.color)} />
                                <p className="text-xs font-bold text-foreground flex-1">{opp.partner}</p>
                                <Badge variant="outline" className={cn('text-[7px] border-0', st.bg, st.color)}>{opp.status}</Badge>
                                <Badge variant="outline" className={cn('text-[7px] border-0', pr.bg, pr.color)}>{opp.priority}</Badge>
                              </div>
                              <p className="text-[9px] font-mono text-muted-foreground">{opp.model}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded bg-chart-2/5 border border-chart-2/10">
                                  <p className="text-[7px] font-bold text-chart-2 uppercase mb-0.5">Value to Partner</p>
                                  <p className="text-[9px] text-foreground">{opp.valueToPartner}</p>
                                </div>
                                <div className="p-2 rounded bg-primary/5 border border-primary/10">
                                  <p className="text-[7px] font-bold text-primary uppercase mb-0.5">Value to ASTRA</p>
                                  <p className="text-[9px] text-foreground">{opp.valueToAstra}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ ENGAGEMENT FRAMEWORK ═══ */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ENGAGEMENT_STAGES.map((stage, i) => {
                const SIcon = stage.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="border border-border bg-card h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stage.bgColor)}>
                            <SIcon className={cn('h-5 w-5', stage.color)} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-muted-foreground">STAGE {i + 1}</span>
                              <Badge variant="outline" className="text-[7px]">{stage.duration}</Badge>
                            </div>
                            <CardTitle className="text-sm">{stage.stage}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-1.5">
                        {stage.actions.map((action, j) => (
                          <div key={j} className="flex items-start gap-2 p-2 rounded bg-muted/10 border border-border/20">
                            <CircleDot className={cn('h-3 w-3 mt-0.5 flex-shrink-0', stage.color)} />
                            <p className="text-[10px] text-foreground">{action}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Success metrics */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Partnership Success KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Partner Pipeline', target: '20+ qualified', icon: Target, color: 'text-chart-4' },
                    { label: 'Active Integrations', target: '8–12 by Y1', icon: CheckCircle2, color: 'text-chart-1' },
                    { label: 'Partner Revenue Share', target: '30% of total rev', icon: DollarSign, color: 'text-chart-2' },
                    { label: 'Partner NPS', target: '≥ 60', icon: Heart, color: 'text-primary' },
                  ].map((kpi, i) => {
                    const KIcon = kpi.icon;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
                        <KIcon className={cn('h-4 w-4 mx-auto mb-1', kpi.color)} />
                        <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{kpi.target}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ HUB ARCHITECTURE ═══ */}
          <TabsContent value="hub" className="space-y-4">
            <Card className="border border-primary/15 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Handshake className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Hub Positioning Strategy</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      ASTRA Villa's competitive moat is not any single partnership — it's the network effect of being the central node that connects investors, developers, banks, and service providers through a shared intelligence layer. Each partnership strengthens the data flywheel, making the platform more valuable to every other participant.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {HUB_LAYERS.map((layer, i) => {
              const LIcon = layer.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', layer.bgColor)}>
                          <LIcon className={cn('h-5 w-5', layer.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{layer.layer}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">{layer.position}</Badge>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-1.5">
                        {layer.connections.map((conn, j) => (
                          <div key={j} className="flex items-center gap-2 p-2 rounded bg-muted/10 border border-border/20">
                            <ArrowUpRight className={cn('h-3 w-3 flex-shrink-0', layer.color)} />
                            <p className="text-[9px] text-foreground">{conn}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Flywheel */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-2" /> Partnership Flywheel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {[
                    { step: 'More partners → richer transaction and behavioral data', color: 'text-chart-2' },
                    { step: 'Richer data → more accurate AI intelligence and predictions', color: 'text-primary' },
                    { step: 'Better intelligence → higher investor trust and premium conversions', color: 'text-chart-4' },
                    { step: 'More investors → stronger value proposition to partners', color: 'text-chart-1' },
                    { step: 'Stronger proposition → more partners join the ecosystem', color: 'text-chart-2' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded bg-muted/10 border border-border/20">
                      <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center text-[9px] font-black text-muted-foreground">{i + 1}</div>
                      <p className={cn('text-[10px] font-medium', item.color)}>{item.step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
