import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Filter, Zap, Gift, Shield, Crown, ArrowRight, CheckCircle2,
  ChevronRight, ChevronDown, Target, TrendingUp, MessageCircle, Bell,
  BookOpen, Star, Trophy, Lock, Gem, BarChart3, Globe, Megaphone,
  Calendar, Mail, Video, FileText, Layers, Timer, Heart, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Funnel Stages ──

interface FunnelStage {
  stage: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  channels: { name: string; tactic: string; metric: string }[];
  conversionTarget: string;
}

const funnelStages: FunnelStage[] = [
  {
    stage: "Awareness", title: "Discovery & Attraction", description: "Drive qualified investor traffic to platform",
    icon: Globe, color: "text-primary", bg: "bg-primary/10",
    channels: [
      { name: "SEO Location Pages", tactic: "10,000+ pages targeting 'investasi properti [kota]' — organic discovery funnel", metric: "500K visits/mo by Month 12" },
      { name: "Social Content", tactic: "Investment breakdowns, ROI reveals, market predictions — TikTok/Reels/Shorts", metric: "10M views/mo, 100K followers" },
      { name: "Media & PR", tactic: "Monthly market intelligence reports pitched to Kompas, Bisnis Indonesia, CNBC Indonesia", metric: "12 media mentions/quarter" },
      { name: "Referral Program", tactic: "Existing investors earn early access credits for referring qualified investors", metric: "30% of new signups via referral" },
    ],
    conversionTarget: "15% of visitors → signup",
  },
  {
    stage: "Activation", title: "Onboarding & First Value", description: "Deliver immediate intelligence value within first session",
    icon: Zap, color: "text-chart-1", bg: "bg-chart-1/10",
    channels: [
      { name: "AI Investment Assessment", tactic: "Free portfolio health check on signup — instant personalized investment insights", metric: "80% completion rate" },
      { name: "Market Intelligence Preview", tactic: "3 free AI-powered market reports covering user's preferred cities", metric: "65% of users consume all 3" },
      { name: "Smart Alert Setup", tactic: "Guided setup of personalized deal alerts (price drops, yield opportunities, hotspots)", metric: "70% alert activation rate" },
      { name: "Community Welcome Flow", tactic: "Automated email sequence: Day 1 welcome, Day 3 first insight, Day 7 community invite", metric: "45% email open rate" },
    ],
    conversionTarget: "60% of signups → activated (first AI insight consumed)",
  },
  {
    stage: "Engagement", title: "Recurring Value & Habit Formation", description: "Build daily/weekly engagement loops",
    icon: Heart, color: "text-chart-4", bg: "bg-chart-4/10",
    channels: [
      { name: "Weekly Market Intelligence Brief", tactic: "AI-curated weekly digest with city-level trends, top deals, and investment signals", metric: "55% weekly open rate" },
      { name: "Deal Alert Notifications", tactic: "Real-time push/email when properties matching investor criteria are detected by AI", metric: "3.5 alerts/week avg" },
      { name: "Discussion Forums", tactic: "City-specific investment discussion threads — moderated by top community members", metric: "25% DAU/MAU ratio" },
      { name: "Monthly Investment Webinars", tactic: "Live market analysis sessions with Q&A — recorded for async consumption", metric: "500 live attendees, 2000 replay views" },
    ],
    conversionTarget: "40% of activated users → weekly active (WAU)",
  },
  {
    stage: "Monetization", title: "Premium Conversion & Revenue", description: "Convert engaged investors to paying community members",
    icon: Crown, color: "text-chart-1", bg: "bg-chart-1/10",
    channels: [
      { name: "Premium Intelligence Tier", tactic: "Gate advanced AI signals behind Diamond subscription — deal scores, price forecasts, yield projections", metric: "15% premium conversion" },
      { name: "Private Deal Access", tactic: "Exclusive pre-market listings and off-market opportunities for premium members", metric: "20 exclusive deals/month" },
      { name: "Strategic Advisory Sessions", tactic: "1-on-1 AI-powered portfolio review sessions for VIP members (Rp 2M/session)", metric: "50 sessions/month" },
      { name: "Investment Group Buys", tactic: "Curated group investment opportunities with negotiated bulk pricing for community", metric: "5 group deals/quarter" },
    ],
    conversionTarget: "15% of WAU → paying premium member",
  },
  {
    stage: "Advocacy", title: "Community Champions & Virality", description: "Turn premium members into brand ambassadors",
    icon: Megaphone, color: "text-chart-3", bg: "bg-chart-3/10",
    channels: [
      { name: "Success Story Showcases", tactic: "Monthly featured investor stories — ROI achieved, AI predictions validated, deal outcomes", metric: "4 stories/month published" },
      { name: "Community Leaderboard", tactic: "Top contributors earn badges, early access, and recognition — gamified engagement", metric: "Top 50 contributors active weekly" },
      { name: "Ambassador Program", tactic: "Top investors become paid brand ambassadors — social posting, event hosting, mentoring", metric: "20 active ambassadors" },
      { name: "Investor Referral Loop", tactic: "Premium members get exclusive referral benefits — extended trial, bonus reports, priority access", metric: "2.5 referrals per premium member" },
    ],
    conversionTarget: "25% of premium members → active referrer",
  },
];

// ── Engagement Programs ──

interface EngagementProgram {
  name: string;
  frequency: string;
  format: string;
  description: string;
  icon: React.ElementType;
  color: string;
  metrics: { label: string; target: string }[];
  tier: "free" | "premium" | "vip";
}

const engagementPrograms: EngagementProgram[] = [
  {
    name: "Weekly Market Pulse", frequency: "Every Monday 8 AM", format: "Email + In-App",
    description: "AI-curated weekly digest: top 5 deals, 3 market trends, 1 deep-dive city analysis, and personalized recommendations",
    icon: Mail, color: "text-primary",
    metrics: [{ label: "Open Rate", target: "55%" }, { label: "CTR", target: "12%" }, { label: "Engagement Time", target: "4.5 min" }],
    tier: "free",
  },
  {
    name: "Real-Time Deal Alerts", frequency: "As detected by AI", format: "Push + Email + SMS",
    description: "Instant notifications when AI identifies properties matching investor criteria — price drops, yield spikes, undervalued listings",
    icon: Bell, color: "text-chart-1",
    metrics: [{ label: "Alert Relevance", target: "85%" }, { label: "Action Rate", target: "22%" }, { label: "Avg Response", target: "< 2 hours" }],
    tier: "free",
  },
  {
    name: "Monthly Investment Webinar", frequency: "Last Thursday monthly", format: "Live Video + Recording",
    description: "90-min deep-dive: national market overview, city spotlights, investment strategy workshop, live Q&A with market analysts",
    icon: Video, color: "text-chart-4",
    metrics: [{ label: "Live Attendance", target: "500+" }, { label: "Replay Views", target: "2,000+" }, { label: "NPS", target: "8.5/10" }],
    tier: "free",
  },
  {
    name: "City Investment Forum", frequency: "Daily active", format: "In-App Discussion",
    description: "City-specific threads where investors share insights, ask questions, and discuss local market conditions — moderated by top contributors",
    icon: MessageCircle, color: "text-chart-3",
    metrics: [{ label: "DAU/MAU", target: "25%" }, { label: "Posts/Week", target: "200+" }, { label: "Avg Thread Depth", target: "8 replies" }],
    tier: "free",
  },
  {
    name: "Premium Intelligence Reports", frequency: "Bi-weekly", format: "PDF + Interactive Dashboard",
    description: "Deep AI analysis reports: 50-page city investment guides, price forecast models, rental yield maps, infrastructure impact studies",
    icon: FileText, color: "text-chart-1",
    metrics: [{ label: "Download Rate", target: "78%" }, { label: "Share Rate", target: "15%" }, { label: "Cited In Media", target: "Monthly" }],
    tier: "premium",
  },
  {
    name: "Private Deal Room", frequency: "5-10 deals/week", format: "Exclusive In-App",
    description: "Pre-market and off-market property opportunities curated by AI — 48-hour exclusive window before public listing",
    icon: Lock, color: "text-chart-1",
    metrics: [{ label: "Deal Quality Score", target: "85/100" }, { label: "Conversion Rate", target: "8%" }, { label: "Avg Savings", target: "12% below market" }],
    tier: "premium",
  },
  {
    name: "VIP Advisory Circle", frequency: "Quarterly", format: "Private Event",
    description: "Invitation-only roundtable with industry leaders, developers, and institutional investors — exclusive networking and deal flow",
    icon: Gem, color: "text-chart-4",
    metrics: [{ label: "Attendees", target: "30-50" }, { label: "Deal Introductions", target: "5+ per event" }, { label: "Retention Impact", target: "+40%" }],
    tier: "vip",
  },
];

// ── Trust Building Framework ──

const trustFramework = [
  {
    pillar: "Data Accuracy Transparency",
    icon: BarChart3, color: "text-primary",
    actions: [
      "Publish monthly AI Prediction Accuracy Scorecard — compare forecasts vs actuals publicly",
      "Display real-time accuracy metrics on platform (e.g., 'Our price predictions are ±4.2% accurate across 15 cities')",
      "Open-source methodology documentation for investment scoring algorithms",
      "Third-party audit of AI models annually by independent research firm",
    ],
  },
  {
    pillar: "Success Story Validation",
    icon: Trophy, color: "text-chart-1",
    actions: [
      "Monthly featured investor case studies with verified ROI data (anonymized if needed)",
      "Video testimonials from investors who acted on AI signals and achieved measurable returns",
      "Before/After portfolio comparisons: 'Investor used AI insights for 6 months → 18% portfolio value increase'",
      "Community-submitted success stories with upvoting and editorial verification",
    ],
  },
  {
    pillar: "Industry Authority Signals",
    icon: Shield, color: "text-chart-3",
    actions: [
      "ASTRA Price Index™ published monthly — aim to become referenced by national media and banking institutions",
      "Partnership badges: 'Trusted by [Bank Name]', 'Data partner of [Media Outlet]'",
      "Speaking engagements at REI, AREBI, and property industry conferences",
      "Research collaborations with universities (UI, ITB, UGM) for market studies",
    ],
  },
  {
    pillar: "Community Governance",
    icon: Users, color: "text-chart-4",
    actions: [
      "Community Advisory Board: 10 top investors elected to provide platform feedback quarterly",
      "Transparent moderation policies with public appeals process",
      "Annual community survey with published results and action commitments",
      "Bug bounty and feature request voting — investors influence product roadmap directly",
    ],
  },
];

// ── Monetization Tiers ──

const communityTiers = [
  {
    name: "Explorer", price: "Free", color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30",
    features: ["Basic AI investment scores", "Weekly Market Pulse email", "City discussion forums", "3 deal alerts/week", "Monthly webinar access", "Community leaderboard participation"],
    targetUsers: "New investors, researchers, curious browsers",
    conversionGoal: "Convert 15% to Insider within 30 days",
  },
  {
    name: "Insider", price: "Rp 500K/mo", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    features: ["Advanced AI deal scores & forecasts", "Unlimited deal alerts", "Bi-weekly intelligence reports", "Priority forum support", "Webinar recording library", "Investment portfolio tracker"],
    targetUsers: "Active individual investors with 1-5 properties",
    conversionGoal: "Convert 10% to Diamond within 90 days",
  },
  {
    name: "Diamond", price: "Rp 2M/mo", color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    features: ["Private Deal Room (48-hr exclusives)", "1-on-1 AI portfolio advisory", "National forecast deep-dives", "VIP Advisory Circle invites", "Ambassador program eligibility", "API access for portfolio integration"],
    targetUsers: "Serious investors with 5+ properties or >Rp 5B portfolio",
    conversionGoal: "95% annual retention, 2.5 referrals per member",
  },
];

// ── Execution Roadmap ──

const roadmapPhases = [
  {
    phase: "Foundation", timeline: "Week 1-4", color: "text-primary", bg: "bg-primary/10",
    milestones: [
      { task: "Launch investor onboarding flow with AI assessment", owner: "Product" },
      { task: "Deploy Weekly Market Pulse email automation", owner: "Growth" },
      { task: "Set up city-specific discussion forums", owner: "Community" },
      { task: "Create first 4 investor success case studies", owner: "Content" },
      { task: "Build deal alert system with personalization", owner: "Engineering" },
      { task: "Design community tiering and gating logic", owner: "Product" },
    ],
  },
  {
    phase: "Activation", timeline: "Week 5-8", color: "text-chart-1", bg: "bg-chart-1/10",
    milestones: [
      { task: "Launch first monthly investment webinar", owner: "Community" },
      { task: "Publish ASTRA Price Index v1", owner: "Research" },
      { task: "Activate referral program with tracking", owner: "Growth" },
      { task: "Launch Insider premium tier (Rp 500K/mo)", owner: "Product" },
      { task: "Deploy community leaderboard and badges", owner: "Engineering" },
      { task: "Pitch first media partnership for market data", owner: "PR" },
    ],
  },
  {
    phase: "Scale", timeline: "Week 9-12", color: "text-chart-3", bg: "bg-chart-3/10",
    milestones: [
      { task: "Launch Diamond tier with Private Deal Room", owner: "Product" },
      { task: "Host first VIP Advisory Circle event", owner: "Community" },
      { task: "Recruit first 10 community ambassadors", owner: "Growth" },
      { task: "Publish first bi-weekly intelligence report", owner: "Research" },
      { task: "Launch 1-on-1 AI portfolio advisory sessions", owner: "Product" },
      { task: "Establish Community Advisory Board", owner: "Community" },
    ],
  },
  {
    phase: "Optimize", timeline: "Month 4-6", color: "text-chart-4", bg: "bg-chart-4/10",
    milestones: [
      { task: "Analyze funnel conversion data and optimize drop-offs", owner: "Growth" },
      { task: "Launch group investment opportunities", owner: "Product" },
      { task: "Expand to 5 university research partnerships", owner: "PR" },
      { task: "Scale ambassador program to 20 active members", owner: "Community" },
      { task: "Achieve 1,000 premium subscribers milestone", owner: "Growth" },
      { task: "Launch API access for Diamond tier", owner: "Engineering" },
    ],
  },
];

// ── Subcomponents ──

function FunnelCard({ stage }: { stage: FunnelStage }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = stage.icon;
  return (
    <Card className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", stage.bg.replace("/10", "/30"))} />
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stage.bg, stage.color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            {stage.stage}: {stage.title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">Target: {stage.conversionTarget}</Badge>
            {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        <CardDescription className="text-[9px] ml-9">{stage.description}</CardDescription>
      </CardHeader>
      {expanded && (
        <CardContent className="p-3 pt-0 space-y-1.5">
          {stage.channels.map((ch, i) => (
            <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className={cn("h-3 w-3 shrink-0 mt-0.5", stage.color)} />
                <div>
                  <span className="text-[10px] font-bold text-foreground">{ch.name}</span>
                  <p className="text-[8px] text-muted-foreground mt-0.5">{ch.tactic}</p>
                  <Badge variant="outline" className="text-[6px] h-3 px-1 mt-1">{ch.metric}</Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

function TierBadge({ tier }: { tier: "free" | "premium" | "vip" }) {
  const styles = { free: "bg-muted/20 text-muted-foreground", premium: "bg-primary/10 text-primary", vip: "bg-chart-1/10 text-chart-1" };
  return <Badge variant="outline" className={cn("text-[6px] h-3 px-1", styles[tier])}>{tier.toUpperCase()}</Badge>;
}

// ── Main Dashboard ──

const InvestorCommunityDashboard = React.memo(function InvestorCommunityDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-3/30 to-chart-1/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Investor Community Growth Framework
              </CardTitle>
              <CardDescription className="text-[11px]">
                Full-funnel system: Attract → Activate → Engage → Monetize → Advocate — designed for serious property investors
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-3 bg-chart-3/10 border-chart-3/30">
              🏘️ Community
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: "Funnel Stages", value: "5", icon: Funnel, color: "text-primary" },
              { label: "Programs", value: "7", icon: Calendar, color: "text-chart-4" },
              { label: "Trust Pillars", value: "4", icon: Shield, color: "text-chart-3" },
              { label: "Community Tiers", value: "3", icon: Crown, color: "text-chart-1" },
              { label: "Roadmap Phases", value: "4", icon: Rocket, color: "text-primary" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="p-2 rounded-xl border border-border/20 bg-muted/5 flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", m.color)} />
                  <div>
                    <span className="text-[7px] text-muted-foreground block">{m.label}</span>
                    <span className={cn("text-sm font-bold", m.color)}>{m.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="funnel" className="text-[10px] h-6 px-3">Investor Funnel</TabsTrigger>
          <TabsTrigger value="engagement" className="text-[10px] h-6 px-3">Engagement Programs</TabsTrigger>
          <TabsTrigger value="trust" className="text-[10px] h-6 px-3">Trust Framework</TabsTrigger>
          <TabsTrigger value="tiers" className="text-[10px] h-6 px-3">Community Tiers</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-[10px] h-6 px-3">Execution Roadmap</TabsTrigger>
        </TabsList>

        {/* Funnel */}
        <TabsContent value="funnel" className="mt-3 space-y-2">
          <div className="flex items-center gap-1 flex-wrap mb-3">
            {funnelStages.map((s, i) => (
              <React.Fragment key={s.stage}>
                <div className={cn("p-1.5 rounded-lg border text-center min-w-[80px]", s.bg, `border-${s.color.replace('text-', '')}/30`)}>
                  <span className={cn("text-[8px] font-bold block", s.color)}>{s.stage}</span>
                  <span className="text-[6px] text-muted-foreground">{s.conversionTarget}</span>
                </div>
                {i < funnelStages.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          {funnelStages.map((stage) => <FunnelCard key={stage.stage} stage={stage} />)}
        </TabsContent>

        {/* Engagement */}
        <TabsContent value="engagement" className="mt-3 space-y-2">
          {engagementPrograms.map((prog) => {
            const Icon = prog.icon;
            return (
              <Card key={prog.name} className="rounded-xl border-border/30 bg-card/80">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", prog.color)} />
                      {prog.name}
                      <TierBadge tier={prog.tier} />
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">
                        <Timer className="h-2 w-2 mr-0.5" />{prog.frequency}
                      </Badge>
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{prog.format}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-[9px] text-muted-foreground mb-2">{prog.description}</p>
                  <div className="flex gap-2">
                    {prog.metrics.map((m) => (
                      <div key={m.label} className="p-1.5 rounded-lg border border-border/10 bg-muted/5 flex-1">
                        <span className="text-[7px] text-muted-foreground block">{m.label}</span>
                        <span className="text-[10px] font-bold text-foreground">{m.target}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Trust */}
        <TabsContent value="trust" className="mt-3 space-y-2">
          {trustFramework.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.pillar} className="rounded-xl border-border/30 bg-card/80">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", pillar.color)} />
                    {pillar.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {pillar.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", pillar.color)} />
                      <span className="text-[8px] text-muted-foreground">{action}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Tiers */}
        <TabsContent value="tiers" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {communityTiers.map((tier) => (
              <Card key={tier.name} className={cn("rounded-2xl overflow-hidden", tier.border)}>
                <div className={cn("h-1", tier.bg.replace("/10", "/30"))} />
                <CardHeader className="p-3 pb-2">
                  <CardTitle className={cn("text-sm font-bold flex items-center justify-between", tier.color)}>
                    {tier.name}
                    <Badge variant="outline" className={cn("text-[9px] font-bold", tier.color, tier.bg)}>{tier.price}</Badge>
                  </CardTitle>
                  <CardDescription className="text-[8px]">{tier.targetUsers}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1.5">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", tier.color)} />
                      <span className="text-[8px] text-foreground">{f}</span>
                    </div>
                  ))}
                  <div className="p-1.5 rounded-lg bg-muted/10 mt-2">
                    <span className="text-[7px] text-muted-foreground">{tier.conversionGoal}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Roadmap */}
        <TabsContent value="roadmap" className="mt-3 space-y-2">
          {roadmapPhases.map((phase) => (
            <Card key={phase.phase} className="rounded-xl border-border/30 bg-card/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                  <div className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold", phase.bg, phase.color)}>{phase.phase}</div>
                  <span className="text-[9px] font-normal text-muted-foreground">{phase.timeline}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {phase.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", phase.color)} />
                      <div>
                        <span className="text-[8px] text-foreground">{m.task}</span>
                        <Badge variant="outline" className="text-[6px] h-3 px-1 ml-1">{m.owner}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default InvestorCommunityDashboard;
