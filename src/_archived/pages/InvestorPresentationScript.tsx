import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, ChevronLeft, ChevronRight, Play, Clock, MessageSquare,
  Eye, Target, TrendingUp, BarChart3, DollarSign, Building2,
  Sparkles, Users, Shield, Lightbulb, AlertTriangle, CheckCircle2,
  Presentation, Volume2, PauseCircle, Flag, Flame, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ScriptSlide {
  id: number;
  phase: string;
  title: string;
  duration: string;
  icon: typeof Mic;
  color: string;
  bgColor: string;
  script: string;
  speakerNotes: string[];
  demoAction?: string;
  transition?: string;
}

const SLIDES: ScriptSlide[] = [
  {
    id: 1,
    phase: 'OPENING',
    title: 'Vision Framing',
    duration: '90 sec',
    icon: Sparkles,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    script: `"Property investment in Indonesia is a $180 billion market — yet most decisions are still made on gut feeling, broker relationships, and incomplete data.

Buyers overpay. Sellers misprice. Investors miss opportunities. Not because the data doesn't exist — but because no one has organized it into actionable intelligence.

ASTRA Villa is building the intelligent infrastructure layer for property investment. We combine real-time market data, AI-driven opportunity scoring, and transaction facilitation into one platform — so investors can make decisions with confidence, not guesswork."`,
    speakerNotes: [
      'Start with the problem — not the product. Investors fund solutions to painful problems.',
      'Pause after "gut feeling" — let the audience recognize the truth of that statement.',
      'The $180B number establishes market size early — they\'re already doing TAM math.',
      'End on "confidence, not guesswork" — this is the value proposition in one phrase.',
    ],
    demoAction: 'Show landing page hero — clean, professional, data-first positioning',
    transition: '"Let me show you what this looks like in practice."',
  },
  {
    id: 2,
    phase: 'DISCOVERY',
    title: 'AI Opportunity Scoring',
    duration: '2 min',
    icon: Target,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    script: `"Every property on our platform is automatically scored by our AI engine. This isn't a simple price filter — it's a composite intelligence score.

The Opportunity Score weighs six factors: ROI projection at 30%, market demand heat at 20%, price undervaluation at 20%, buyer inquiry velocity at 15%, rental yield strength at 10%, and luxury appeal at 5%.

What you're seeing here is a property scoring 87 — that's an Elite Opportunity. The AI has identified that it's priced 12% below estimated fair market value, in a high-demand zone, with strong rental yield potential.

This kind of insight used to require a team of analysts. We deliver it automatically for every listing on the platform."`,
    speakerNotes: [
      'Click into a high-scoring property BEFORE this slide — have it ready on screen.',
      'Read the six factors slowly — investors love structured, quantitative frameworks.',
      'Point to the score ring animation — visual reinforcement of the number.',
      '"Team of analysts" comparison makes the value tangible — they understand cost savings.',
    ],
    demoAction: 'Navigate to property detail → Show Opportunity Score ring + breakdown',
    transition: '"But individual scores are only part of the picture. Let me show you the market view."',
  },
  {
    id: 3,
    phase: 'INTELLIGENCE',
    title: 'Market Heat & Trends',
    duration: '90 sec',
    icon: TrendingUp,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    script: `"This heat map shows real-time demand intensity across neighborhoods. The darker zones indicate where buyer interest is concentrating — and more importantly, where it's accelerating.

Seminyak is showing a 23% increase in inquiry velocity this quarter. Canggu has high demand but rising supply — a signal to watch carefully. Uluwatu is emerging — lower absolute demand but the growth rate is the highest on the map.

For an investor, this isn't just data — it's timing intelligence. The difference between buying in Uluwatu now versus six months from now could be a 15% price premium."`,
    speakerNotes: [
      'If live demo: hover over heat map zones to show tooltips with real numbers.',
      'The Uluwatu example creates urgency without being pushy — it\'s data-driven FOMO.',
      'Emphasize "timing intelligence" — this positions the platform as a decision advantage.',
      'If asked about data sources: "Aggregated from listing activity, inquiry patterns, and transaction velocity across our network."',
    ],
    demoAction: 'Show Market Intelligence heat map → Hover over 2-3 zones',
    transition: '"Now, once an investor identifies an opportunity — how do they validate it?"',
  },
  {
    id: 4,
    phase: 'DECISION',
    title: 'ROI & Comparison Tools',
    duration: '2 min',
    icon: BarChart3,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    script: `"Our Super Engine generates a comprehensive investment analysis for any property — valuation confidence, rental yield projection, deal rating, and market trend context. All in one view.

This property is listed at 3.2 billion rupiah. Our AI estimates fair market value at 3.5 billion — that's a 9% undervaluation. Rental yield estimate is 7.8% gross, which is above the Bali average of 6.2%.

The investor can also run a Comparative Market Analysis — here are five comparable properties with recent transaction prices, showing exactly where this listing sits in the market.

We've essentially compressed a week of manual research into a 30-second intelligence briefing."`,
    speakerNotes: [
      'Show Super Engine dashboard — let the data density speak for itself.',
      'Use specific numbers. Investors respect precision, not vague claims.',
      '"Week of manual research into 30 seconds" — this is the ROI of the platform itself.',
      'If time allows: briefly show the mortgage calculator to demonstrate end-to-end buyer journey.',
    ],
    demoAction: 'Show Super Engine report → Scroll through valuation, rental yield, CMA section',
    transition: '"So how does this translate into a business?"',
  },
  {
    id: 5,
    phase: 'BUSINESS',
    title: 'Revenue Model',
    duration: '2 min',
    icon: DollarSign,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    script: `"We monetize through three streams — each activated at a different stage of the property lifecycle.

First, transaction commissions. When a deal closes through our platform, we earn 1.5 to 2.5% of the transaction value. On a 3 billion rupiah property, that's 45 to 75 million per deal.

Second, developer promotion packages. Developers pay for featured placement, demand analytics, and investor early-access notifications. Packages range from 15 to 50 million per project launch.

Third, premium analytics subscriptions. Institutional investors and agencies pay for advanced market intelligence, portfolio tracking, and API access. Tiered from free to Diamond at 2.5 million per month.

Our Year 3 target is 141.5 billion rupiah ARR across these streams. Current focus is validating transaction commission with our first closed deals in Bali."`,
    speakerNotes: [
      'Three revenue streams show diversification — investors fear single-stream dependency.',
      'Give the per-deal math: 3B × 2% = 60M. Make it concrete.',
      'Year 3 ARR target shows ambition but tie it back to "current focus" for credibility.',
      'Anticipate the question: "How many deals to break even?" — have the unit economics ready.',
    ],
    demoAction: 'Show Revenue Activation Roadmap page or pitch deck revenue slide',
    transition: '"Let me share where we are today and where we\'re heading."',
  },
  {
    id: 6,
    phase: 'TRACTION',
    title: 'Current Status & Ask',
    duration: '90 sec',
    icon: Flag,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    script: `"We launched in Bali as our beachhead market. Current traction: over 4,000 indexed properties, active AI scoring across all listings, and a growing investor community engaging with our intelligence tools.

Our immediate focus is closing the first transaction — proving that investors will not only use our data but transact through our platform. We have active deals in pipeline.

We're raising a pre-seed round to accelerate three things: supply acquisition in Bali to reach 35% market coverage, investor demand generation through targeted campaigns, and one flagship developer partnership to validate B2B revenue.

Our vision is to become what Bloomberg Terminal is to equities — but for property investment in Southeast Asia."`,
    speakerNotes: [
      'Be honest about stage — "first transaction" shows transparency, not weakness.',
      '"Active deals in pipeline" — only say this if true. Investors will ask for details.',
      'The Bloomberg comparison is powerful but use it carefully — it sets high expectations.',
      'End with a clear ask: what you\'re raising, what it funds, and the milestone it enables.',
    ],
    demoAction: 'Show admin dashboard with live platform metrics',
    transition: '"I\'d love to answer your questions and discuss how we can work together."',
  },
];

const OBJECTION_RESPONSES = [
  {
    question: '"How is this different from existing property portals?"',
    response: 'Existing portals are listing databases — they show what\'s available. We show what\'s worth buying and why. No portal in Indonesia provides AI opportunity scoring, demand heat mapping, or investment-grade analytics. We\'re not competing with listing sites — we\'re building the intelligence layer on top of the market.',
  },
  {
    question: '"What if agents don\'t want to share data?"',
    response: 'We\'re not asking agents to share their data — we\'re giving them intelligence they can\'t generate alone. Agents who list on ASTRA get AI pricing recommendations, buyer matching, and demand insights. The value exchange is clear: list with us, close faster.',
  },
  {
    question: '"Can you defend against PropertyGuru or 99.co entering this space?"',
    response: 'PropertyGuru optimizes for listing volume and lead generation — their business model rewards quantity over quality. Our moat is intelligence depth: opportunity scoring, predictive pricing, and investment analytics require a fundamentally different data architecture. They would need to rebuild from scratch.',
  },
  {
    question: '"How do you ensure AI accuracy?"',
    response: 'Our confidence scores are transparent — every estimate shows the data inputs and comparable count that generated it. We validate against actual transaction prices and continuously improve the model. We don\'t claim 100% accuracy — we claim better accuracy than manual research, which is the current alternative.',
  },
];

export default function InvestorPresentationScript() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [activeTab, setActiveTab] = useState('teleprompter');

  const slide = SLIDES[currentSlide];
  const SIcon = slide.icon;
  const totalDuration = '10 min';

  const goNext = () => setCurrentSlide((p) => Math.min(p + 1, SLIDES.length - 1));
  const goPrev = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Presentation className="h-5 w-5 text-primary" />
                </div>
                Investor Presentation Script
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Structured spoken narrative for live demo sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-border">
                <Clock className="h-3 w-3 mr-1.5" />
                Total: {totalDuration}
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/20 text-primary">
                {currentSlide + 1} / {SLIDES.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="teleprompter">Teleprompter</TabsTrigger>
            <TabsTrigger value="overview">Full Script</TabsTrigger>
            <TabsTrigger value="objections">Q&A Prep</TabsTrigger>
          </TabsList>

          {/* ═══ TELEPROMPTER ═══ */}
          <TabsContent value="teleprompter" className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={currentSlide === 0} className="text-xs gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <div className="flex items-center gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      i === currentSlide ? 'bg-primary w-6' : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                    )}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={goNext} disabled={currentSlide === SLIDES.length - 1} className="text-xs gap-1.5">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Phase & Title */}
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', slide.bgColor)}>
                        <SIcon className={cn('h-6 w-6', slide.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn('text-[8px] font-bold', slide.color)}>{slide.phase}</Badge>
                          <Badge variant="outline" className="text-[8px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5 mr-1" />{slide.duration}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-1">{slide.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {/* Script */}
                    <div className="p-5 rounded-xl bg-muted/10 border border-border/30 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="h-3.5 w-3.5 text-primary" />
                        <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Speak</p>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-medium">
                        {slide.script}
                      </p>
                    </div>

                    {/* Demo Action */}
                    {slide.demoAction && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-chart-4/5 border border-chart-4/10 mb-3">
                        <Eye className="h-3.5 w-3.5 text-chart-4 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] font-bold text-chart-4 uppercase">Demo Action</p>
                          <p className="text-[10px] text-foreground">{slide.demoAction}</p>
                        </div>
                      </div>
                    )}

                    {/* Transition */}
                    {slide.transition && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                        <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[8px] font-bold text-primary uppercase">Transition</p>
                          <p className="text-[10px] text-foreground italic">{slide.transition}</p>
                        </div>
                      </div>
                    )}

                    {/* Speaker Notes */}
                    {showNotes && (
                      <div className="space-y-1.5 mt-3">
                        <button onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                          <Lightbulb className="h-3 w-3" /> Speaker Notes
                        </button>
                        {slide.speakerNotes.map((n, ni) => (
                          <div key={ni} className="flex items-start gap-2 p-2 rounded-lg bg-accent/30 border border-accent/10">
                            <AlertTriangle className="h-3 w-3 text-accent-foreground/60 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-accent-foreground/80">{n}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ═══ FULL SCRIPT OVERVIEW ═══ */}
          <TabsContent value="overview" className="space-y-3">
            {SLIDES.map((s, i) => {
              const SlIcon = s.icon;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', s.bgColor)}>
                          <SlIcon className={cn('h-4 w-4', s.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn('text-[7px] font-bold', s.color)}>{s.phase}</Badge>
                            <p className="text-xs font-bold text-foreground">{s.title}</p>
                            <Badge variant="outline" className="text-[7px] text-muted-foreground ml-auto flex-shrink-0">
                              <Clock className="h-2 w-2 mr-0.5" />{s.duration}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-3 whitespace-pre-line">{s.script.slice(1, 200)}…</p>
                          {s.transition && (
                            <p className="text-[9px] text-primary italic mt-1.5">→ {s.transition}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-[9px] h-6 px-2 flex-shrink-0" onClick={() => { setCurrentSlide(i); setActiveTab('teleprompter'); }}>
                          <Play className="h-3 w-3 mr-1" /> Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mic className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Delivery Principles</p>
                    <p className="text-[11px] text-muted-foreground">
                      Speak slowly. Pause after key numbers. Let the demo breathe — don't narrate every click. Confidence comes from preparation, not speed. If you lose your place, return to the transition line — it always reconnects you to the narrative.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Q&A PREP ═══ */}
          <TabsContent value="objections" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Anticipate these questions — having a confident, concise answer builds more credibility than the presentation itself.</p>
            {OBJECTION_RESPONSES.map((obj, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare className="h-4 w-4 text-chart-2" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-foreground mb-1.5">{obj.question}</p>
                        <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                          <p className="text-[10px] text-foreground leading-relaxed">{obj.response}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Q&A Golden Rule</p>
                    <p className="text-[11px] text-muted-foreground">
                      If you don't know the answer, say: "That's a great question — I want to give you an accurate answer, so let me follow up with the specific data after this session." Never guess. Intellectual honesty builds more trust than perfect answers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
