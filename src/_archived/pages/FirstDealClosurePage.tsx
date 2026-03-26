import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Target, CheckCircle2, ArrowRight, ChevronRight, Sparkles,
  Search, Users, BarChart3, FileText, Shield, DollarSign,
  TrendingUp, MessageSquare, Scale, Flame, Clock, Star,
  Building2, Handshake, Award, CircleDollarSign, Flag, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 1,
    title: 'Select the Right Listing',
    subtitle: 'Choose a property engineered for fast closure — not the best listing, the most closeable one',
    icon: Search,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    status: 'active',
    criteria: [
      { label: 'Realistic Pricing', detail: 'Listing price within ±10% of AI estimated fair market value — avoid overpriced aspirational listings', metric: 'Valuation gap < 10%' },
      { label: 'Strong Opportunity Score', detail: 'Score ≥ 70 indicates healthy investment fundamentals: demand, yield, growth — gives buyer confidence', metric: 'Score ≥ 70' },
      { label: 'Seller/Agent Responsiveness', detail: 'Agent responds to inquiries within 24 hours — unresponsive agents kill deals regardless of property quality', metric: 'Response < 24h' },
      { label: 'Clean Legal Status', detail: 'SHM/SHGB certificate verified, no disputes, clear ownership chain — legal friction is the #1 deal-killer', metric: 'Docs verified' },
    ],
    actions: [
      'Pull top 10 listings by opportunity score with valuation gap < 10%',
      'Cross-reference with inquiry count — prioritize listings with 3+ inquiries (proven demand)',
      'Contact each listing agent: test response time, verify document readiness, assess motivation',
      'Final shortlist: 3 properties that are well-priced, well-documented, and well-supported',
    ],
    outcome: '3 deal-ready listings identified with verified agent commitment',
    route: '/properties',
  },
  {
    id: 2,
    title: 'Identify Serious Buyer',
    subtitle: 'Don\'t pitch cold — find the buyer who is already warm and moving toward a decision',
    icon: Users,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    status: 'pending',
    criteria: [
      { label: 'Active Engagement Signals', detail: 'Buyer has saved listings, submitted inquiries, or used mortgage calculator — behavioral intent signals', metric: '3+ actions' },
      { label: 'Clear Budget Range', detail: 'Budget confirmed through mortgage pre-qualification or stated investment range — no window shoppers', metric: 'Budget verified' },
      { label: 'Decision Timeline', detail: 'Buyer has stated timeline: "within 3 months" or "ready now" — avoid "just browsing" conversations', metric: 'Timeline < 90 days' },
      { label: 'Financing Readiness', detail: 'Cash buyer or pre-approved KPR — financing uncertainty is the #2 deal-killer after legal issues', metric: 'Finance confirmed' },
    ],
    actions: [
      'Review platform analytics: which users have saved 3+ properties in the shortlist price range?',
      'Check inquiry history: who asked specific questions (legal status, negotiation room, viewing schedule)?',
      'Direct outreach to top 5 warm leads: "We have a property matching your criteria — interested in a detailed analysis?"',
      'Qualify: confirm budget, timeline, financing method, decision-maker status in first conversation',
    ],
    outcome: '2–3 qualified buyers matched to shortlisted properties',
    route: '/agent-crm',
  },
  {
    id: 3,
    title: 'Strengthen Investment Confidence',
    subtitle: 'Remove doubt with data — transform "I think this is good" into "the data shows this is good"',
    icon: BarChart3,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    status: 'pending',
    criteria: [
      { label: 'AI Valuation Presentation', detail: 'Show estimated fair market value, price positioning, and confidence score — buyer sees objective data, not just listing price', metric: 'FMV report' },
      { label: 'Comparable Market Evidence', detail: 'Present 3–5 similar properties with recent transaction prices — proves the market supports this valuation', metric: '3+ comparables' },
      { label: 'Demand & Urgency Signals', detail: 'Show inquiry velocity, area demand heat score, and days-on-market trend — creates informed urgency', metric: 'Heat score shown' },
      { label: 'ROI Projection', detail: 'Present rental yield estimate, 5-year appreciation forecast, and investment grade — answers "what do I get?"', metric: 'ROI calculated' },
    ],
    actions: [
      'Generate Super Engine report for each shortlisted property — full valuation + rental + deal analysis',
      'Prepare Comparative Market Analysis with 5 closest comparables and price positioning',
      'Create personalized investor brief: property summary, AI insights, ROI projection, risk assessment',
      'Schedule presentation call or in-person meeting — walk buyer through the intelligence, not just the listing',
    ],
    outcome: 'Buyer has data-backed confidence that this is a sound investment',
    route: '/super-engine',
  },
  {
    id: 4,
    title: 'Facilitate Offer Submission',
    subtitle: 'Guide the offer — don\'t let buyer and seller negotiate blind',
    icon: Handshake,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    status: 'pending',
    criteria: [
      { label: 'Competitive Offer Range', detail: 'Use AI Pricing Advisor to suggest offer range: "start at X, walk up to Y, market supports Z" — buyer feels strategic', metric: 'Range provided' },
      { label: 'Structured Communication', detail: 'Platform-facilitated messaging between buyer and seller/agent — keeps negotiation documented and professional', metric: 'Via platform' },
      { label: 'Active Negotiation Tracking', detail: 'Monitor offer → counter-offer → acceptance flow in real-time — intervene if stalling', metric: 'Status tracked' },
      { label: 'Terms Clarity', detail: 'Payment schedule, handover date, included items, contingencies — all agreed in writing before closing', metric: 'Terms signed' },
    ],
    actions: [
      'Guide buyer: "Based on AI analysis, offer IDR X as starting point — here\'s why this is competitive"',
      'Submit offer through platform with clear terms: price, deposit, timeline, conditions',
      'If counter-offer received: analyze gap, suggest compromise position, facilitate response within 48 hours',
      'When terms agreed: generate preliminary agreement summary for both parties to confirm',
    ],
    outcome: 'Offer accepted by both parties with agreed terms documented',
    route: '/my-offers',
  },
  {
    id: 5,
    title: 'Support Closing Process',
    subtitle: 'The deal isn\'t done until money moves and documents are signed — shepherd every step',
    icon: Shield,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    status: 'pending',
    criteria: [
      { label: 'Legal Documentation', detail: 'PPJB preparation, notaris coordination, SHM verification — connect buyer with legal service partner', metric: 'Legal engaged' },
      { label: 'Payment Timeline', detail: 'Deposit schedule, KPR disbursement coordination, final payment — every rupiah tracked and confirmed', metric: 'Payments tracked' },
      { label: 'Transaction Proof', detail: 'AJB signed, ownership transfer recorded, platform transaction logged — verifiable completion', metric: 'AJB signed' },
      { label: 'Commission Collection', detail: 'Platform commission invoiced per pre-signed agreement — collected at or before closing', metric: 'Commission paid' },
    ],
    actions: [
      'Connect buyer with platform legal partner for PPJB/AJB preparation and notaris services',
      'Create payment milestone tracker: deposit → installments → final payment → handover',
      'Coordinate document signing: digital signature through platform or in-person at notaris office',
      'Upon completion: collect commission, log transaction, request testimonial from both parties',
    ],
    outcome: 'Transaction completed — first revenue earned and case study documented',
    route: '/legal-services',
  },
];

const DEAL_KILLERS = [
  { killer: 'Overpriced Listing', prevention: 'Only pursue properties within 10% of AI FMV — reject vanity pricing', icon: DollarSign },
  { killer: 'Legal Uncertainty', prevention: 'Verify SHM/SHGB before any buyer introduction — no exceptions', icon: Shield },
  { killer: 'Unresponsive Agent', prevention: 'Test response time before committing — 48h silence = move on', icon: Clock },
  { killer: 'Unqualified Buyer', prevention: 'Confirm budget + financing + timeline in first conversation', icon: Users },
  { killer: 'Negotiation Stall', prevention: 'Set 72h response windows — escalate or pivot if exceeded', icon: MessageSquare },
  { killer: 'Closing Delay', prevention: 'Pre-engage legal partner before offer acceptance — zero gap between agreement and documentation', icon: FileText },
];

const SUCCESS_METRICS = [
  { metric: 'Time to First Deal', target: '< 90 days from platform launch', icon: Clock },
  { metric: 'Transaction Value', target: 'IDR 1.5–5B (sweet spot for first deal)', icon: DollarSign },
  { metric: 'Commission Earned', target: 'IDR 30–75M (1.5–2.5% of transaction)', icon: CircleDollarSign },
  { metric: 'Buyer Satisfaction', target: '4.5+ star rating and written testimonial', icon: Star },
  { metric: 'Seller Satisfaction', target: 'Agent agrees to list 3+ more properties', icon: Building2 },
  { metric: 'Case Study Published', target: 'Full narrative: problem → solution → outcome', icon: FileText },
];

export default function FirstDealClosurePage() {
  const [activeTab, setActiveTab] = useState('playbook');
  const [expandedStep, setExpandedStep] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Flag className="h-5 w-5 text-chart-1" />
                </div>
                First Deal Closure Playbook
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                5-step strategy to close the first verified transaction
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">
              <Target className="h-3 w-3 mr-1.5" />
              Target: &lt; 90 days
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="playbook">5-Step Playbook</TabsTrigger>
            <TabsTrigger value="risks">Deal Killers</TabsTrigger>
            <TabsTrigger value="success">Success Metrics</TabsTrigger>
          </TabsList>

          {/* ═══ PLAYBOOK ═══ */}
          <TabsContent value="playbook" className="space-y-3">
            {/* Progress bar */}
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STEPS.map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedStep(s.id)}
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all',
                            expandedStep === s.id ? cn(s.bgColor, s.color) : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
                          )}
                        >
                          <SIcon className="h-3 w-3" />
                          Step {s.id}
                        </button>
                        {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {STEPS.map((step) => {
              const SIcon = step.icon;
              const isExpanded = expandedStep === step.id;
              return (
                <motion.div key={step.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: step.id * 0.05 }}>
                  <Card
                    className={cn('border bg-card transition-all cursor-pointer', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedStep(isExpanded ? 0 : step.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', step.bgColor)}>
                          <SIcon className={cn('h-5 w-5', step.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn('text-[7px] px-1.5 py-0 h-3.5 font-bold', step.color, `border-current/20`)}>Step {step.id}</Badge>
                            <CardTitle className="text-sm">{step.title}</CardTitle>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.subtitle}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        {/* Selection Criteria */}
                        <div className="mt-2 mb-3">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Selection Criteria</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {step.criteria.map((c, ci) => (
                              <div key={ci} className="p-2.5 rounded-lg border border-border/30 bg-card">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[10px] font-bold text-foreground">{c.label}</p>
                                  <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">{c.metric}</Badge>
                                </div>
                                <p className="text-[9px] text-muted-foreground">{c.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mb-3">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Action Steps</p>
                          <div className="space-y-1">
                            {step.actions.map((a, ai) => (
                              <div key={ai} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground">{a}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Outcome */}
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/10">
                          <Target className="h-3.5 w-3.5 text-chart-1 flex-shrink-0" />
                          <p className="text-[10px] text-chart-1 font-medium">{step.outcome}</p>
                          {step.route && <Badge variant="outline" className="text-[8px] text-primary border-primary/20 ml-auto flex-shrink-0">{step.route}</Badge>}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}

            {/* Bottom CTA */}
            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Execution Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      Speed beats perfection. The first deal doesn't need to be the biggest or most profitable — it needs to be completed. One verified transaction creates more credibility than 100 features. Optimize the funnel, not the listing.
                    </p>
                  </div>
                  <Badge className="bg-chart-1 text-chart-1-foreground text-xs flex-shrink-0">Close → Learn → Scale</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ DEAL KILLERS ═══ */}
          <TabsContent value="risks" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">Every failed deal follows a pattern. Prevent these six failure modes before they occur.</p>
            {DEAL_KILLERS.map((dk, i) => {
              const DIcon = dk.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-destructive/10 bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <DIcon className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">{dk.killer}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{dk.prevention}</p>
                        </div>
                        <Badge variant="outline" className="text-[7px] text-destructive border-destructive/20 flex-shrink-0">Prevent</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ SUCCESS METRICS ═══ */}
          <TabsContent value="success" className="space-y-3">
            {SUCCESS_METRICS.map((sm, i) => {
              const SMIcon = sm.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                          <SMIcon className="h-4 w-4 text-chart-2" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">{sm.metric}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Target: {sm.target}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">After the First Deal</p>
                    <p className="text-[11px] text-muted-foreground">
                      Document everything: transaction value, commission earned, days to close, buyer/seller satisfaction, AI accuracy vs actual price. This becomes the revenue case study that transforms investor conversations from "we plan to monetize" to "we have monetized."
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">Case Study</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
