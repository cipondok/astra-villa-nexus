import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  FileText, TrendingUp, BarChart3, Shield, Users, Star,
  CheckCircle2, Calendar, Clock, Target, Sparkles, Eye,
  MessageSquare, Video, Megaphone, Building2, Award,
  ArrowRight, Flame, Globe, BookOpen, Lightbulb, Heart,
  ChevronRight, Zap, DollarSign, PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Content Pillars ─── */

const CONTENT_PILLARS = [
  {
    id: 'insight',
    pillar: 'Investment Insight Stories',
    subtitle: 'Show the AI working — make investors say "I couldn\'t have found this myself"',
    icon: Lightbulb,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    frequency: '2x / week',
    platform: 'LinkedIn + Instagram',
    formats: [
      {
        title: 'Opportunity Score Breakdown',
        description: 'Pick a real listing scoring 80+. Walk through WHY: demand heat, valuation gap, rental yield. Show the intelligence, not just the number.',
        example: '"This Canggu villa scores 84 on our AI engine. Here\'s why: it\'s priced 11% below market, in a zone with 23% rising demand, and projects 7.2% rental yield. Here\'s what most investors miss..."',
        channel: 'LinkedIn carousel (5 slides)',
        cta: 'Explore this opportunity →',
      },
      {
        title: 'Price Trend Deep Dive',
        description: 'Take one neighborhood. Show 12-month price movement, supply changes, and what the data predicts for the next quarter.',
        example: '"Uluwatu prices grew 18% in 2025. But here\'s the signal most miss: new supply is entering at 2x the rate of 2024. What does that mean for investors entering now?"',
        channel: 'LinkedIn article + IG story',
        cta: 'See full market analysis →',
      },
      {
        title: '"What I\'d Buy Today" Analysis',
        description: 'Founder picks one property each week and explains the investment thesis. Personal, opinionated, data-backed.',
        example: '"If I had IDR 3B to invest today, I\'d look at this Seminyak apartment. Here\'s my reasoning: 8.1% yield, 90% occupancy zone, and the developer has a 15-year track record..."',
        channel: 'LinkedIn post + short video',
        cta: 'View property details →',
      },
    ],
  },
  {
    id: 'education',
    pillar: 'Market Education',
    subtitle: 'Teach investors something they didn\'t know — educated buyers trust more and buy faster',
    icon: BookOpen,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    frequency: '1x / week',
    platform: 'LinkedIn + Blog',
    formats: [
      {
        title: 'City Yield Comparison',
        description: 'Compare rental yields across Bali zones with real data. Help investors understand where money works hardest.',
        example: '"Bali rental yield map: Seminyak 6.8%, Canggu 7.4%, Uluwatu 8.2%, Ubud 5.9%. But yield alone doesn\'t tell the story — here\'s what occupancy rates reveal..."',
        channel: 'LinkedIn infographic + blog post',
        cta: 'Compare properties by yield →',
      },
      {
        title: 'Growth Zone Explainer',
        description: 'Identify one emerging area. Explain the infrastructure, demand drivers, and timeline for value appreciation.',
        example: '"Why Tabanan is Bali\'s next investment frontier: new toll road completion in Q3 2026, land prices 40% below Canggu, and 3 developer projects breaking ground this year."',
        channel: 'LinkedIn article',
        cta: 'Explore Tabanan listings →',
      },
      {
        title: 'Indonesian Property Law 101',
        description: 'Demystify SHM vs SHGB, foreign ownership structures, and tax implications. Remove the legal fear barrier.',
        example: '"Can foreigners own property in Indonesia? The short answer is structured — here\'s exactly how PMA and Hak Pakai work, what they cost, and what to watch out for."',
        channel: 'Blog + IG carousel',
        cta: 'Explore legal services →',
      },
    ],
  },
  {
    id: 'credibility',
    pillar: 'Platform Credibility Signals',
    subtitle: 'Social proof compounds — every milestone shared builds the perception of momentum',
    icon: Shield,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    frequency: '1x / week',
    platform: 'All channels',
    formats: [
      {
        title: 'Milestone Announcements',
        description: 'Share real traction numbers. Even small ones — "100 investors exploring" beats silence. Frame as momentum, not bragging.',
        example: '"This week: 47 investors used our AI scoring engine to analyze 312 properties. The most-analyzed listing? A Canggu villa scoring 91. The market is paying attention."',
        channel: 'LinkedIn + Twitter/X',
        cta: 'Join the investors →',
      },
      {
        title: 'Partnership Reveals',
        description: 'Announce developer partnerships, agent onboarding milestones, or service provider integrations. Each partnership = credibility layer.',
        example: '"We\'re excited to partner with [Developer] to bring their latest Seminyak project to ASTRA Villa investors — with exclusive AI-powered demand forecasting."',
        channel: 'LinkedIn + press release',
        cta: 'View featured project →',
      },
      {
        title: 'User Testimonial Spotlights',
        description: 'After first deals: share buyer/agent quotes. Before deals: share "platform discovery" moments from early users.',
        example: '"I found a property I wouldn\'t have noticed on traditional portals. The opportunity score gave me confidence that the numbers were real." — Early investor',
        channel: 'IG story + LinkedIn',
        cta: 'Start your discovery →',
      },
    ],
  },
  {
    id: 'founder',
    pillar: 'Humanized Founder Communication',
    subtitle: 'People invest in founders before they invest in platforms — be visible, honest, and relatable',
    icon: Heart,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    frequency: '1x / week',
    platform: 'LinkedIn + IG Reels',
    formats: [
      {
        title: 'Mission Video (60 sec)',
        description: 'Short, face-to-camera video. No production — authenticity beats polish. Explain one aspect of the mission.',
        example: '"I built ASTRA Villa because I watched friends overpay for properties they could have analyzed in 30 seconds with the right data. Here\'s what we\'re changing..."',
        channel: 'LinkedIn video + IG Reel',
        cta: 'See the platform →',
      },
      {
        title: 'Transparent Progress Update',
        description: 'Share what you built this week, what broke, what you learned. Vulnerability builds trust faster than perfection.',
        example: '"Week 6 update: 3 new agent partnerships, 1 deal in active negotiation, and we fixed a bug that was hiding our best listings from search. Building in public."',
        channel: 'LinkedIn post',
        cta: null,
      },
      {
        title: 'Industry Observation',
        description: 'Comment on a market trend, news event, or competitor move. Position yourself as someone who thinks deeply about the space.',
        example: '"PropertyGuru just raised $50M for AI features. Here\'s why I think the opportunity isn\'t in bigger portals — it\'s in deeper intelligence for serious investors."',
        channel: 'LinkedIn + Twitter/X',
        cta: null,
      },
    ],
  },
];

/* ─── Publishing Calendar ─── */

const WEEKLY_CALENDAR = [
  { day: 'Monday', content: 'Investment Insight Story', type: 'insight', icon: Lightbulb, color: 'text-chart-2' },
  { day: 'Tuesday', content: 'Founder Progress Update', type: 'founder', icon: Heart, color: 'text-chart-4' },
  { day: 'Wednesday', content: 'Market Education Post', type: 'education', icon: BookOpen, color: 'text-primary' },
  { day: 'Thursday', content: 'Investment Insight #2', type: 'insight', icon: Lightbulb, color: 'text-chart-2' },
  { day: 'Friday', content: 'Credibility Signal / Milestone', type: 'credibility', icon: Shield, color: 'text-chart-1' },
  { day: 'Saturday', content: 'IG Story: Behind the scenes', type: 'founder', icon: Video, color: 'text-chart-4' },
  { day: 'Sunday', content: 'Rest / batch-produce next week', type: 'rest', icon: Calendar, color: 'text-muted-foreground' },
];

/* ─── Distribution Rules ─── */

const DISTRIBUTION_RULES = [
  { platform: 'LinkedIn', role: 'Primary — professional investors, agents, developers', frequency: '5x/week', format: 'Long-form posts, carousels, articles, videos' },
  { platform: 'Instagram', role: 'Visual discovery — lifestyle investors, younger buyers', frequency: '4x/week', format: 'Carousels, Reels (60s), Stories (daily)' },
  { platform: 'Blog (SEO)', role: 'Evergreen — search-driven organic traffic', frequency: '1x/week', format: 'Long-form articles (1,500+ words) with internal links' },
  { platform: 'WhatsApp Groups', role: 'Direct — warm investor communities', frequency: '2x/week', format: 'Short insight + property link (never spam)' },
  { platform: 'Twitter/X', role: 'Industry commentary — founder visibility', frequency: '3x/week', format: 'Threads, hot takes, data visualizations' },
];

export default function ContentStrategyPage() {
  const [activeTab, setActiveTab] = useState('pillars');
  const [expandedPillar, setExpandedPillar] = useState('insight');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PenTool className="h-5 w-5 text-primary" />
                </div>
                Content Publishing Strategy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Build investor confidence through consistent, credible content</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/20 text-primary">
              <Calendar className="h-3 w-3 mr-1.5" />
              6 posts / week
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pillars">Content Pillars</TabsTrigger>
            <TabsTrigger value="calendar">Weekly Calendar</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* ═══ PILLARS ═══ */}
          <TabsContent value="pillars" className="space-y-3">
            {CONTENT_PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              const isExpanded = expandedPillar === pillar.id;
              return (
                <motion.div key={pillar.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn('border bg-card transition-all cursor-pointer', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedPillar(isExpanded ? '' : pillar.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', pillar.bgColor)}>
                          <PIcon className={cn('h-5 w-5', pillar.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{pillar.pillar}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">{pillar.frequency}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{pillar.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="text-[8px] text-muted-foreground flex-shrink-0">{pillar.platform}</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mt-2">
                          {pillar.formats.map((f, fi) => (
                            <div key={fi} className="border border-border/30 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 font-bold">Format {fi + 1}</Badge>
                                  <p className="text-xs font-bold text-foreground">{f.title}</p>
                                </div>
                                <Badge variant="outline" className="text-[7px] text-muted-foreground">{f.channel}</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-2">{f.description}</p>

                              <div className="p-3 rounded-lg bg-muted/10 border border-border/20 mb-2">
                                <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Example Copy</p>
                                <p className="text-[10px] text-foreground italic leading-relaxed">{f.example}</p>
                              </div>

                              {f.cta && (
                                <div className="flex items-center gap-2">
                                  <Zap className="h-3 w-3 text-primary" />
                                  <p className="text-[9px] text-primary font-medium">CTA: {f.cta}</p>
                                </div>
                              )}
                            </div>
                          ))}
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
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Content Golden Rule</p>
                    <p className="text-[11px] text-muted-foreground">
                      Every post must pass this test: "Would a serious property investor screenshot this and share it with a friend?" If not, it's filler. Insight beats frequency — one great post per week outperforms daily noise.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CALENDAR ═══ */}
          <TabsContent value="calendar" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Consistency beats virality. This schedule is sustainable for a solo founder or 2-person team.</p>

            {WEEKLY_CALENDAR.map((d, i) => {
              const DIcon = d.icon;
              return (
                <motion.div key={d.day} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={cn('border bg-card', d.type === 'rest' ? 'border-border/40 opacity-60' : 'border-border')}>
                    <CardContent className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', d.type === 'rest' ? 'bg-muted/20' : `bg-current/10`)}>
                          <DIcon className={cn('h-4 w-4', d.color)} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-foreground">{d.day}</p>
                          <p className="text-[10px] text-muted-foreground">{d.content}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[7px]', d.color)}>{d.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Batch Production Tip</p>
                    <p className="text-[11px] text-muted-foreground">
                      Sunday afternoon: write all 6 posts for the week. Use AI listing generator for property insights. Schedule everything. During the week, only engage with comments and respond to messages. Batch creation prevents daily content anxiety.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ DISTRIBUTION ═══ */}
          <TabsContent value="distribution" className="space-y-3">
            {DISTRIBUTION_RULES.map((dr, i) => (
              <motion.div key={dr.platform} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-bold text-foreground">{dr.platform}</p>
                          <Badge variant="outline" className="text-[7px]">{dr.frequency}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1">{dr.role}</p>
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-2.5 w-2.5 text-muted-foreground" />
                          <p className="text-[9px] text-muted-foreground italic">{dr.format}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Content → Conversion Bridge</p>
                    <p className="text-[11px] text-muted-foreground">
                      Every content piece must link back to the platform. Not with "check out our website" but with specific deep links: "See this property's score →" or "Compare yields in Canggu →". Content without a destination is brand awareness. Content with a destination is acquisition.
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
