import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  BookOpen, TrendingUp, Quote, Video, FileText, Presentation,
  Search, Brain, Handshake, CheckCircle2, ArrowRight, Star,
  Eye, Target, DollarSign, BarChart3, Camera, MessageSquare,
  Clock, Sparkles, Share2, Users, Building2, Shield, Award,
  Lightbulb, Heart, Megaphone, Zap, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   NARRATIVE STRUCTURE
   ═══════════════════════════════════════════ */

interface NarrativeChapter {
  chapter: number;
  title: string;
  hook: string;
  content: string[];
  visualCue: string;
  emotionalGoal: string;
  icon: typeof Search;
  color: string;
  bgColor: string;
}

const CHAPTERS: NarrativeChapter[] = [
  {
    chapter: 1,
    title: 'The Discovery',
    hook: '"I wasn\'t even looking in that area — the AI flagged it before anyone else noticed."',
    content: [
      'Introduce the investor: background, goals, initial skepticism about AI-driven real estate.',
      'Show their first interaction with ASTRA Villa — browsing properties, receiving the first Opportunity Score notification.',
      'Highlight the moment of surprise: "A property I would have overlooked scored 87/100 for investment potential."',
      'Include the specific AI signals that caught attention: undervalued by 15% vs comparable properties, rental yield 2.3x area average, emerging infrastructure development within 2km.',
    ],
    visualCue: 'Screenshot of the Opportunity Score card with the property listing — blur the exact address but show the score breakdown clearly.',
    emotionalGoal: 'Curiosity → "This platform sees things I can\'t"',
    icon: Search,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  {
    chapter: 2,
    title: 'The Analysis',
    hook: '"The data gave me confidence I wasn\'t guessing — I was making an informed decision."',
    content: [
      'Walk through the investment analysis the investor reviewed: market heat map, price trend graph, comparable sales data.',
      'Show how the AI Investment Advisor provided specific ROI projections: 5-year appreciation estimate, rental yield forecast, risk-adjusted return.',
      'Mention the investor\'s due diligence process: cross-referencing AI insights with their own research, consulting with the agent.',
      'Key data point to highlight: "The platform predicted a 12-15% annual appreciation — 6 months later, similar properties have already risen 8%."',
    ],
    visualCue: 'Side-by-side: AI prediction dashboard vs actual market movement 6 months later — showing the prediction was directionally accurate.',
    emotionalGoal: 'Trust → "The data is reliable, not just marketing"',
    icon: Brain,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    chapter: 3,
    title: 'The Negotiation',
    hook: '"Having the market data in my pocket changed how I negotiated — I wasn\'t emotional, I was strategic."',
    content: [
      'Describe the negotiation journey: initial offer, counter-offer, and how market data informed each decision.',
      'Show how the Negotiation Assistant provided a suggested offer range based on fair market value analysis.',
      'Highlight the agent\'s role: how platform tools helped them advocate effectively for the buyer.',
      'Include the timeline: "From first inquiry to accepted offer in 3 weeks — faster than the area average of 6-8 weeks."',
    ],
    visualCue: 'Timeline infographic showing the deal progression with key decision points marked.',
    emotionalGoal: 'Empowerment → "This platform made me a better negotiator"',
    icon: Handshake,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    chapter: 4,
    title: 'The Outcome',
    hook: '"It wasn\'t just a good deal — it was the right deal at the right time, and I have the numbers to prove it."',
    content: [
      'Reveal the final outcome: purchase price vs market value, estimated ROI, current rental income if applicable.',
      'Share the investor\'s reflection on the process and how it compared to previous property purchases.',
      'Include the agent\'s perspective: "This was one of the smoothest transactions I\'ve facilitated — the data did half the convincing."',
      'End with forward-looking statement: "I\'m already watching 3 more properties the AI has flagged for my next investment."',
    ],
    visualCue: 'ROI summary card showing purchase price, current estimated value, and projected 5-year return — clean, simple, credible.',
    emotionalGoal: 'Validation → "Real results, not theoretical promises"',
    icon: Award,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
];

/* ═══════════════════════════════════════════
   VISUAL ELEMENTS
   ═══════════════════════════════════════════ */

const VISUAL_ELEMENTS = [
  {
    element: 'Property Discovery Card',
    description: 'The AI Opportunity Score display — the "aha moment" that started the journey',
    format: 'Static image / animated GIF',
    usage: 'Hero visual for blog header, social media lead image',
    icon: Star,
    color: 'text-chart-4',
    specs: 'Show score breakdown: Location (9/10), Value (8/10), Growth (9/10), Yield (8/10). Include demand heat badge.',
  },
  {
    element: 'ROI Projection vs Reality',
    description: 'Side-by-side comparison of AI prediction vs actual 6-month market performance',
    format: 'Infographic / chart',
    usage: 'Core credibility proof — use in every distribution channel',
    icon: BarChart3,
    color: 'text-primary',
    specs: 'Line chart with two traces: "AI Prediction" (dashed) and "Actual Market" (solid). Highlight convergence point.',
  },
  {
    element: 'Deal Timeline',
    description: 'Visual journey from discovery to closing with time markers',
    format: 'Horizontal timeline infographic',
    usage: 'Blog article body, presentation slide',
    icon: Clock,
    color: 'text-chart-2',
    specs: 'Day 1: Discovery → Day 5: Analysis → Day 10: Viewing → Day 15: Offer → Day 21: Closing. Compare vs industry average.',
  },
  {
    element: 'Testimonial Card',
    description: 'Pull quote from investor and/or agent with photo and credential',
    format: 'Styled quote card',
    usage: 'Social media standalone post, landing page section, pitch deck',
    icon: Quote,
    color: 'text-chart-1',
    specs: 'Photo (or silhouette for privacy), name (or "Verified Investor"), one powerful sentence, star rating if available.',
  },
];

/* ═══════════════════════════════════════════
   DISTRIBUTION
   ═══════════════════════════════════════════ */

const CHANNELS = [
  {
    channel: 'Social Media Short Video',
    platform: 'Instagram Reels / TikTok / LinkedIn',
    format: '60-second vertical video',
    icon: Video,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    script: [
      '0-5s: Hook — "An AI found a property opportunity before anyone else noticed"',
      '5-15s: Problem — "Most investors rely on gut feeling or outdated listings"',
      '15-30s: Discovery — Show the Opportunity Score, the data that stood out',
      '30-45s: Result — "Purchased 15% below market value, now projected 12% annual return"',
      '45-55s: Social proof — Investor quote overlay on property footage',
      '55-60s: CTA — "Explore AI-powered opportunities → astra-villa-realty.lovable.app"',
    ],
    tips: [
      'Use screen recordings of actual platform UI (with permission) — authenticity > polish',
      'Add Indonesian + English subtitles for max reach',
      'Post on Tuesday or Thursday 10am WIB for peak engagement',
    ],
  },
  {
    channel: 'Blog / Landing Page Article',
    platform: 'ASTRA Villa blog + SEO distribution',
    format: '1,200-word long-form article',
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    script: [
      'Title: "How an Investor Discovered a High-Potential Opportunity Using AI Insights"',
      'Meta: "Real case study: AI-powered property analysis leads to a 15% below-market acquisition with projected 12% annual returns"',
      'Structure: Follow the 4-chapter narrative exactly — Discovery → Analysis → Negotiation → Outcome',
      'Embed the ROI comparison chart and deal timeline as inline visuals',
      'Include 2-3 pull quotes from investor/agent throughout the article',
      'End with a clear CTA: "Start your own investment analysis" → link to platform',
    ],
    tips: [
      'Target keywords: "AI property investment Indonesia", "real estate opportunity score"',
      'Internal link to /invest/:citySlug for the relevant city',
      'Add JSON-LD Article schema for rich search results',
    ],
  },
  {
    channel: 'Investor Pitch Presentation',
    platform: 'Pitch deck / Demo sessions',
    format: '3-slide case study insert',
    icon: Presentation,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    script: [
      'Slide 1: "Case Study: First AI-Assisted Transaction" — headline + property image + Opportunity Score',
      'Slide 2: "The Data Behind the Deal" — ROI chart, market analysis, negotiation timeline',
      'Slide 3: "Investor Testimonial" — quote, outcome metrics, forward pipeline ("3 more deals in progress")',
    ],
    tips: [
      'Keep each slide to one key message — don\'t crowd with data',
      'Use the animated KPI counters from the existing Pitch Dashboard for live metrics',
      'Practice the 90-second narration: discovery → data → outcome → scale',
    ],
  },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function SuccessStoryPage() {
  const [activeTab, setActiveTab] = useState('narrative');
  const [expandedChapter, setExpandedChapter] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-chart-1" />
                </div>
                Success Story Blueprint
              </h1>
              <p className="text-sm text-muted-foreground mt-1">First transaction case study — narrative, visuals, and distribution plan</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">
              <Sparkles className="h-3 w-3 mr-1.5" />
              4 chapters · 3 channels
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Headline Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-chart-1/5 mb-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground leading-tight">
                    "How an Investor Discovered a High-Potential Opportunity Using AI Insights"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is the story headline. It leads with the investor's experience, not the platform's features. 
                    The hero is the investor who made a smart decision — ASTRA Villa is the tool that made it possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="narrative">Story Narrative</TabsTrigger>
            <TabsTrigger value="visuals">Visual Elements</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* ═══ NARRATIVE ═══ */}
          <TabsContent value="narrative" className="space-y-3">
            {CHAPTERS.map((ch) => {
              const CIcon = ch.icon;
              const isExpanded = expandedChapter === ch.chapter;
              return (
                <motion.div key={ch.chapter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ch.chapter * 0.05 }}>
                  <Card
                    className={cn('border bg-card cursor-pointer transition-all', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedChapter(isExpanded ? 0 : ch.chapter)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', ch.bgColor)}>
                          <CIcon className={cn('h-5 w-5', ch.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[7px]">Ch. {ch.chapter}</Badge>
                            <CardTitle className="text-sm">{ch.title}</CardTitle>
                          </div>
                          <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">{ch.hook}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        {/* Hook quote */}
                        <div className="p-3 rounded-lg bg-muted/10 border border-border/20 mb-3">
                          <div className="flex items-start gap-2">
                            <Quote className={cn('h-4 w-4 flex-shrink-0', ch.color)} />
                            <p className="text-xs text-foreground italic font-medium">{ch.hook}</p>
                          </div>
                        </div>

                        {/* Content points */}
                        <div className="space-y-1.5 mb-3">
                          {ch.content.map((point, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className={cn('h-3 w-3 flex-shrink-0 mt-0.5', ch.color)} />
                              <p className="text-[10px] text-foreground">{point}</p>
                            </div>
                          ))}
                        </div>

                        {/* Visual cue */}
                        <div className="p-2.5 rounded-lg bg-chart-4/5 border border-chart-4/10 mb-3">
                          <div className="flex items-start gap-2">
                            <Camera className="h-3 w-3 text-chart-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[8px] font-bold text-chart-4 uppercase">Visual Cue</p>
                              <p className="text-[10px] text-foreground">{ch.visualCue}</p>
                            </div>
                          </div>
                        </div>

                        {/* Emotional goal */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <Heart className="h-3 w-3 text-primary flex-shrink-0" />
                          <p className="text-[9px] text-foreground">
                            <span className="font-bold">Emotional goal:</span> {ch.emotionalGoal}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Storytelling Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      The investor is the hero, not the platform. ASTRA Villa is the "magic tool" that enabled their success — like a lightsaber, not the Jedi. Every sentence should make the reader think "I could do that too" rather than "that platform is impressive."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ VISUALS ═══ */}
          <TabsContent value="visuals" className="space-y-3">
            {VISUAL_ELEMENTS.map((v, i) => {
              const VIcon = v.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center flex-shrink-0">
                          <VIcon className={cn('h-5 w-5', v.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-foreground">{v.element}</p>
                            <Badge variant="outline" className="text-[7px]">{v.format}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">{v.description}</p>
                          <div className="p-2 rounded bg-muted/10 border border-border/20 mb-2">
                            <p className="text-[9px] text-foreground"><span className="font-bold">Specs:</span> {v.specs}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Share2 className="h-2.5 w-2.5 text-muted-foreground" />
                            <p className="text-[9px] text-muted-foreground"><span className="font-bold">Use in:</span> {v.usage}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ DISTRIBUTION ═══ */}
          <TabsContent value="distribution" className="space-y-4">
            {CHANNELS.map((ch, i) => {
              const CIcon = ch.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', ch.bgColor)}>
                          <CIcon className={cn('h-5 w-5', ch.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{ch.channel}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">{ch.format}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{ch.platform}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Script / Structure */}
                      <div className="mb-3">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                          {ch.channel.includes('Video') ? 'Script Flow' : 'Content Structure'}
                        </p>
                        <div className="space-y-1">
                          {ch.script.map((line, j) => (
                            <div key={j} className="flex items-start gap-2 p-1.5 rounded bg-muted/10">
                              <ArrowRight className={cn('h-2.5 w-2.5 flex-shrink-0 mt-0.5', ch.color)} />
                              <p className="text-[10px] text-foreground">{line}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Production Tips</p>
                        <div className="space-y-1">
                          {ch.tips.map((tip, j) => (
                            <div key={j} className="flex items-start gap-2 p-1.5 rounded bg-chart-2/5 border border-chart-2/10">
                              <Zap className="h-2.5 w-2.5 text-chart-2 flex-shrink-0 mt-0.5" />
                              <p className="text-[10px] text-foreground">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Distribution Rule</p>
                    <p className="text-[11px] text-muted-foreground">
                      Publish the blog article first — it becomes the canonical source. Then extract the video script from the narrative. Then pull 3 slides for the pitch deck. One story, three formats, zero contradictions. Consistency builds credibility.
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
