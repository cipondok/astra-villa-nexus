
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Newspaper, Megaphone, Users, Video, TrendingUp, Target,
  FileText, Globe, Mic, Send, Calendar, CheckCircle,
  ArrowRight, Star, Zap, BarChart3, Clock, MessageSquare
} from 'lucide-react';

// ─── Timeline Phases ───────────────────────────────────────

interface PRPhase {
  key: string;
  name: string;
  timeline: string;
  icon: typeof Newspaper;
  color: string;
  objective: string;
  activities: { task: string; owner: string; deliverable: string }[];
  kpis: string[];
}

const phases: PRPhase[] = [
  {
    key: 'pre-launch',
    name: 'Pre-Launch Seeding',
    timeline: 'Weeks 1-4 (Before Launch)',
    icon: Target,
    color: 'text-amber-500',
    objective: 'Build anticipation and secure media commitments before the public announcement',
    activities: [
      { task: 'Draft core press release (English + Bahasa)', owner: 'Founder + PR', deliverable: '2 versions: tech media + property industry' },
      { task: 'Build media contact list', owner: 'PR Lead', deliverable: '50+ contacts: tech, property, startup, business media' },
      { task: 'Create product demo video (3 min)', owner: 'Content Team', deliverable: 'Polished walkthrough showing AI features in action' },
      { task: 'Founder story narrative writing', owner: 'Founder', deliverable: '800-word origin story: why this problem, why AI, why now' },
      { task: 'Secure 3-5 media embargoes', owner: 'PR Lead', deliverable: 'Exclusive early access for tier-1 outlets' },
      { task: 'Prepare data/stat hooks', owner: 'Growth Team', deliverable: 'Market size stats, AI accuracy claims, early traction data' },
    ],
    kpis: ['50+ media contacts identified', '5+ embargo commitments', 'Press kit complete', 'Demo video produced'],
  },
  {
    key: 'launch-week',
    name: 'Launch Week Blitz',
    timeline: 'Launch Week (Days 1-7)',
    icon: Zap,
    color: 'text-green-500',
    objective: 'Maximum visibility across tech, property, and mainstream channels simultaneously',
    activities: [
      { task: 'Press release distribution', owner: 'PR Lead', deliverable: 'Wire distribution + direct pitches to 50+ contacts' },
      { task: 'Founder interview circuit', owner: 'Founder', deliverable: '5-8 podcast/media interviews in launch week' },
      { task: 'Social media launch campaign', owner: 'Content Team', deliverable: 'Coordinated posts: LinkedIn, Twitter/X, Instagram, TikTok' },
      { task: 'Influencer content activation', owner: 'Marketing', deliverable: '10+ influencers posting about platform simultaneously' },
      { task: 'Product Hunt / community launches', owner: 'Growth Team', deliverable: 'Product Hunt launch + relevant community posts' },
      { task: 'Agent network announcement', owner: 'Supply Team', deliverable: 'WhatsApp broadcast to agent network with launch incentives' },
    ],
    kpis: ['10+ media articles published', '50K+ social media reach', '5+ podcast/interview appearances', '1,000+ platform signups in week 1'],
  },
  {
    key: 'post-launch',
    name: 'Post-Launch Momentum',
    timeline: 'Weeks 2-8 (After Launch)',
    icon: TrendingUp,
    color: 'text-blue-500',
    objective: 'Sustain media presence with milestone updates and growth storytelling',
    activities: [
      { task: 'Weekly milestone announcements', owner: 'PR Lead', deliverable: 'Social posts: "1,000 listings reached", "10K users", etc.' },
      { task: 'Case study production', owner: 'Content Team', deliverable: '2-3 agent/developer success stories' },
      { task: 'Thought leadership articles', owner: 'Founder', deliverable: 'Monthly op-eds on AI in Indonesian real estate' },
      { task: 'Speaking engagement applications', owner: 'PR Lead', deliverable: 'Apply to 5+ tech/property conferences' },
      { task: 'Follow-up media pitches', owner: 'PR Lead', deliverable: 'Traction update pitch to original media contacts' },
      { task: 'Community partnership announcements', owner: 'Partnerships', deliverable: 'Co-branded PR with developer/bank partners' },
    ],
    kpis: ['2+ articles/month ongoing', 'Monthly founder thought leadership piece', '1+ speaking engagement booked', 'Partner co-PR executed'],
  },
  {
    key: 'ongoing',
    name: 'Ongoing Visibility Engine',
    timeline: 'Months 3-6+',
    icon: Globe,
    color: 'text-purple-500',
    objective: 'Transform PR from campaign to sustained earned media engine',
    activities: [
      { task: 'Monthly growth storytelling', owner: 'PR + Founder', deliverable: 'Data-driven updates: traffic growth, AI accuracy improvements' },
      { task: 'Awards & recognition submissions', owner: 'PR Lead', deliverable: 'Apply to startup awards, proptech innovation lists' },
      { task: 'Media relationship nurturing', owner: 'PR Lead', deliverable: 'Quarterly journalist dinners, exclusive data sharing' },
      { task: 'Fundraising PR coordination', owner: 'Founder + PR', deliverable: 'Timed announcement with funding round (if applicable)' },
      { task: 'Market report publications', owner: 'Content + AI', deliverable: 'Quarterly Indonesian property market AI report' },
    ],
    kpis: ['Recognized in 2+ industry lists', 'Inbound media requests monthly', 'Quarterly market report published', 'Brand search volume growing'],
  },
];

// ─── Media Targets ─────────────────────────────────────────

const mediaTargets = [
  { tier: 'Tier 1 — Tech/Startup Media', outlets: ['TechCrunch', 'e27', 'Tech in Asia', 'DailySocial.id', 'KrASIA', 'The Ken'], goal: 'Credibility + global startup visibility' },
  { tier: 'Tier 2 — Property Industry', outlets: ['Rumah.com News', 'Properti Indonesia', 'Property & Bank Magazine', 'Real Estate Asia', 'Bisnis Indonesia Property'], goal: 'Industry legitimacy + agent trust' },
  { tier: 'Tier 3 — Business/Mainstream', outlets: ['Kompas Tekno', 'Detik Finance', 'CNBC Indonesia', 'Katadata', 'IDN Times'], goal: 'Mass market awareness + user acquisition' },
  { tier: 'Tier 4 — Podcasts & YouTube', outlets: ['Ngobrolin Startup', 'Tech for Indonesia', 'Property Talks ID', 'Finansialku', 'Investasi Properti Channel'], goal: 'Long-form storytelling + investor awareness' },
];

// ─── Narrative Angles ──────────────────────────────────────

const narrativeAngles = [
  { angle: 'Primary: AI Democratization', headline: '"AI Investment Intelligence, Previously Only for Institutional Investors, Now Available to Every Indonesian"', hook: 'Position as wealth-building tool, not just listing site. AI valuation, ROI forecasting, and risk analysis that previously cost millions in consulting — now free.' },
  { angle: 'Founder Journey', headline: '"From [Origin] to Building Indonesia\'s First AI-Powered Property Brain"', hook: 'Personal narrative connecting founder\'s motivation to the market gap. Authenticity and mission-driven storytelling.' },
  { angle: 'Market Disruption', headline: '"Why Indonesia\'s $350B Property Market Still Runs on WhatsApp Groups and Gut Feeling"', hook: 'Provocative take on industry inefficiency. Data-backed argument for why technology intervention is overdue.' },
  { angle: 'Social Impact', headline: '"Making Property Investment Transparent: How AI Fights Information Asymmetry in Indonesian Real Estate"', hook: 'ESG/social angle — empowering first-time buyers and small investors with institutional-grade intelligence.' },
];

// ─── Press Release Template ────────────────────────────────

const pressReleaseSections = [
  { section: 'Headline', content: '[Platform Name] Launches Indonesia\'s First AI-Powered Property Marketplace', note: 'Max 80 characters, lead with differentiator' },
  { section: 'Sub-headline', content: 'Platform combines AI property valuation, investment intelligence, and marketplace in one platform for Indonesian buyers and investors', note: 'Expand on the headline, add context' },
  { section: 'Opening Paragraph', content: '[City], [Date] — [Platform Name], an AI-powered property marketplace, today announced its official launch in Indonesia. The platform provides AI-driven property valuations, investment ROI forecasting, and a curated marketplace connecting buyers with verified agents.', note: 'Who, what, when, where in first 2 sentences' },
  { section: 'Problem Statement', content: 'Indonesia\'s property market, valued at over $350 billion, remains largely opaque with inconsistent pricing, limited data access, and fragmented listing quality...', note: 'Establish the pain point with market data' },
  { section: 'Solution + Key Features', content: '3-4 paragraphs covering: AI Valuation Engine, Investment Intelligence Suite, Verified Agent Network, Programmatic SEO Discovery', note: 'Feature highlights with benefit framing' },
  { section: 'Traction / Social Proof', content: '[X] listings, [Y] agents, [Z] cities, [W] monthly visitors within [timeframe]', note: 'Hard numbers — the more specific, the more credible' },
  { section: 'Founder Quote', content: '"Our mission is to make property investment intelligence accessible to every Indonesian, not just institutional investors..."', note: 'Vision-forward, quotable, memorable' },
  { section: 'Call to Action', content: 'Visit [URL] to explore AI-powered property insights. Agents can register at [URL]/agents.', note: 'Clear next step for readers' },
  { section: 'Boilerplate', content: 'About [Platform Name]: [2-3 sentence company description]. Founded in [year], the company is backed by [investors/accelerators if applicable].', note: 'Standard company description' },
];

// ─── Component ─────────────────────────────────────────────

const PRLaunchStrategyDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">PR Launch Strategy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Indonesian PropTech market entry — 4-phase PR execution roadmap
        </p>
      </div>

      {/* Phase Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {phases.map((phase) => (
          <Card key={phase.key} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <phase.icon className={`h-4 w-4 ${phase.color}`} />
                <span className="text-[10px] text-muted-foreground">{phase.timeline.split('(')[0]}</span>
              </div>
              <p className="text-[12px] font-semibold text-foreground">{phase.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{phase.activities.length} activities</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="narrative" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {[
            { key: 'narrative', label: 'Narrative', icon: MessageSquare },
            { key: 'timeline', label: 'Timeline', icon: Calendar },
            { key: 'media', label: 'Media Targets', icon: Newspaper },
            { key: 'press-release', label: 'Press Release', icon: FileText },
            { key: 'influencers', label: 'Influencers', icon: Users },
            { key: 'post-launch', label: 'Post-Launch', icon: TrendingUp },
          ].map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs gap-1.5 data-[state=active]:bg-background">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Narrative Tab */}
        <TabsContent value="narrative" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Core Launch Narrative</h3>
            <p className="text-[11px] text-muted-foreground">Position the platform as a category-defining AI intelligence layer, not just another listing site</p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-primary mb-2">One-Line Positioning Statement</p>
              <p className="text-sm font-semibold text-foreground italic">
                "The first AI-powered property marketplace that gives every Indonesian investor the intelligence tools previously reserved for institutional players."
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {narrativeAngles.map((na, i) => (
              <div key={i} className="border border-border/50 rounded-xl p-4 bg-card/40">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[9px]">{na.angle}</Badge>
                </div>
                <p className="text-[12px] font-semibold text-foreground mb-1">{na.headline}</p>
                <p className="text-[10px] text-muted-foreground">{na.hook}</p>
              </div>
            ))}
          </div>

          {/* Key Messages */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">3 Key Messages (Repeat in Every Interaction)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { msg: 'AI Intelligence for Everyone', detail: 'Institutional-grade property valuation, ROI forecasting, and risk analysis — accessible to every Indonesian buyer and investor.' },
                  { msg: 'Verified & Transparent', detail: 'Every listing quality-checked, every agent verified, every price validated by AI against market data.' },
                  { msg: 'Indonesia-First, Built for Scale', detail: 'Programmatic coverage from province to kelurahan. Not a copy of a Western platform — built for Indonesian market dynamics.' },
                ].map((m, i) => (
                  <div key={i} className="border border-border/30 rounded-lg p-3 bg-card/40">
                    <p className="text-[11px] font-semibold text-foreground mb-1">{i + 1}. {m.msg}</p>
                    <p className="text-[10px] text-muted-foreground">{m.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          {phases.map((phase) => (
            <Card key={phase.key} className="bg-card/60 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <phase.icon className={`h-5 w-5 ${phase.color}`} />
                  <div className="flex-1">
                    <CardTitle className="text-sm">{phase.name}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{phase.timeline}</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{phase.objective}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {phase.activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 border border-border/30 rounded-lg p-2.5 bg-card/30">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground">{act.task}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{act.deliverable}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] flex-shrink-0">{act.owner}</Badge>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {phase.kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-[10px] text-muted-foreground">{kpi}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Media Targets Tab */}
        <TabsContent value="media" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Media Outreach Targets</h3>
            <p className="text-[11px] text-muted-foreground">4-tier media strategy — from tech credibility to mass market awareness</p>
          </div>

          {mediaTargets.map((tier, i) => (
            <Card key={i} className="bg-card/60 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-semibold text-foreground">{tier.tier}</p>
                  <Badge variant="outline" className="text-[9px]">{tier.outlets.length} outlets</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tier.outlets.map((outlet) => (
                    <Badge key={outlet} variant="secondary" className="text-[10px]">{outlet}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{tier.goal}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pitch Approach */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Pitch Approach by Outlet Type</p>
              <div className="space-y-2">
                {[
                  { type: 'Tech/Startup', approach: 'Lead with AI innovation angle, founder story, and market size. Offer exclusive data or demo access.', timing: 'Pitch 2 weeks before launch, offer embargo' },
                  { type: 'Property Industry', approach: 'Lead with agent empowerment and listing quality. Position as partner, not disruptor.', timing: 'Pitch 1 week before, include industry-specific stats' },
                  { type: 'Business/Mainstream', approach: 'Lead with consumer benefit and market disruption narrative. Use relatable language.', timing: 'Pitch on launch day with press release + visuals' },
                  { type: 'Podcasts/YouTube', approach: 'Offer founder as guest, propose topic around AI + property investing trends.', timing: 'Book 3-4 weeks out, prep talking points sheet' },
                ].map((p, i) => (
                  <div key={i} className="border border-border/30 rounded-lg p-2.5 bg-card/40">
                    <p className="text-[11px] font-medium text-foreground">{p.type}</p>
                    <p className="text-[10px] text-muted-foreground">{p.approach}</p>
                    <p className="text-[9px] text-primary mt-0.5">Timing: {p.timing}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Press Release Tab */}
        <TabsContent value="press-release" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Press Release Structure</h3>
            <p className="text-[11px] text-muted-foreground">Template framework — customize with actual platform data before distribution</p>
          </div>

          <div className="space-y-2">
            {pressReleaseSections.map((sec, i) => (
              <div key={i} className="border border-border/50 rounded-xl p-3 bg-card/40">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-shrink-0 w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{sec.section}</p>
                </div>
                <p className="text-[11px] text-foreground bg-muted/30 rounded-lg p-2 border border-border/20 ml-7 italic">
                  {sec.content}
                </p>
                <p className="text-[9px] text-muted-foreground mt-1 ml-7">💡 {sec.note}</p>
              </div>
            ))}
          </div>

          {/* Press Kit Checklist */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Press Kit Contents</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Press release (EN + ID)',
                  'Founder headshot (high-res)',
                  'Platform screenshots (5-8)',
                  'Product demo video (3 min)',
                  'Logo pack (SVG, PNG, dark/light)',
                  'Key stats one-pager',
                  'Founder bio (150 words)',
                  'Company fact sheet',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Influencers Tab */}
        <TabsContent value="influencers" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Influencer & Community Amplification</h3>
            <p className="text-[11px] text-muted-foreground">Coordinate creator content to amplify launch visibility across platforms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { category: 'Property Content Creators', platform: 'TikTok / Instagram', count: '5-8 creators', content: 'Property tour videos using the platform, "AI told me this house is worth..." format', budget: 'Rp 2-5M per creator' },
              { category: 'Investment Educators', platform: 'YouTube / Instagram', count: '3-5 creators', content: '"I tested AI property valuation on my neighborhood" or "Property investment tool review"', budget: 'Rp 3-8M per creator' },
              { category: 'Tech Reviewers', platform: 'YouTube / Twitter', count: '2-3 creators', content: 'Product review and demo walkthrough, AI feature deep-dive', budget: 'Rp 5-10M per creator' },
              { category: 'Lifestyle / Home Decor', platform: 'Instagram / TikTok', count: '3-5 creators', content: '"Looking for my dream home using AI" content series', budget: 'Rp 2-4M per creator' },
            ].map((inf, i) => (
              <div key={i} className="border border-border/50 rounded-xl p-3 bg-card/40">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-semibold text-foreground">{inf.category}</p>
                  <Badge variant="outline" className="text-[9px]">{inf.count}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">{inf.platform}</p>
                <p className="text-[10px] text-foreground mb-1.5">{inf.content}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span className="text-[9px] text-muted-foreground">Budget: {inf.budget}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activation Timeline */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Influencer Activation Timeline</p>
              <div className="space-y-2">
                {[
                  { when: 'Week -2', action: 'Brief influencers, share product access, agree on content angles' },
                  { when: 'Week -1', action: 'Review draft content, provide feedback, confirm posting schedule' },
                  { when: 'Launch Day', action: '5+ influencers post within 4-hour window for algorithm amplification' },
                  { when: 'Week +1', action: 'Second wave: follow-up content, results/reaction videos' },
                  { when: 'Week +2-4', action: 'Evergreen content: tutorials, comparison videos, testimonials' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Badge variant="outline" className="text-[9px] flex-shrink-0 w-16 justify-center">{step.when}</Badge>
                    <p className="text-[10px] text-muted-foreground">{step.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post-Launch Tab */}
        <TabsContent value="post-launch" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Post-Launch Visibility Engine</h3>
            <p className="text-[11px] text-muted-foreground">Transform launch buzz into sustained earned media momentum</p>
          </div>

          {/* Milestone Announcement Calendar */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Milestone Announcement Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { week: 'Week 2', milestone: '"1,000 Listings Reached"', channel: 'Social media + email to media contacts' },
                { week: 'Week 4', milestone: '"First City Fully Activated — [City Name]"', channel: 'Press release + local media pitch' },
                { week: 'Month 2', milestone: '"AI Valuation Accuracy Reaches [X]%"', channel: 'Tech media exclusive + blog post' },
                { week: 'Month 3', milestone: '"[X]K Monthly Active Users"', channel: 'Founder LinkedIn post + media update email' },
                { week: 'Month 4', milestone: '"First Developer Partnership Announced"', channel: 'Co-branded press release' },
                { week: 'Month 6', milestone: '"[X] Cities, [Y] Listings, [Z] Users — 6-Month Growth Report"', channel: 'Full media cycle: press release + interviews + report' },
              ].map((ms, i) => (
                <div key={i} className="flex items-start gap-3 border border-border/30 rounded-lg p-2.5 bg-card/30">
                  <Badge variant="outline" className="text-[9px] flex-shrink-0 w-16 justify-center">{ms.week}</Badge>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-foreground">{ms.milestone}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{ms.channel}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ongoing Content Pillars */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Ongoing PR Content Pillars</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { pillar: 'Growth Storytelling', freq: 'Bi-weekly', desc: 'Data-driven updates: user growth charts, listing expansion maps, revenue milestones' },
                  { pillar: 'Thought Leadership', freq: 'Monthly', desc: 'Founder op-eds on AI in real estate, market trends, Indonesia proptech future' },
                  { pillar: 'Market Intelligence Reports', freq: 'Quarterly', desc: 'AI-generated property market analysis — positions platform as industry data source' },
                  { pillar: 'Success Stories', freq: 'Monthly', desc: 'Agent testimonials, developer case studies, buyer journey features' },
                ].map((p, i) => (
                  <div key={i} className="border border-border/30 rounded-lg p-3 bg-card/40">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold text-foreground">{p.pillar}</p>
                      <Badge variant="outline" className="text-[9px]">{p.freq}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PRLaunchStrategyDashboard;
