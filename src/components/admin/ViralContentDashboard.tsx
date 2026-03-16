import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video, Play, Eye, Heart, Share2, MessageCircle, TrendingUp, Target,
  Calendar, Clock, Zap, Crown, Star, ArrowRight, Globe, MapPin,
  BarChart3, Users, Sparkles, Flame, Camera, Film, Tv, ChevronRight,
  Circle, CheckCircle2, Layers, ExternalLink, Hash, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Content Format Definitions ──

interface ContentFormat {
  key: string;
  title: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
  platforms: string[];
  estViews: string;
  engagementRate: string;
  production: string;
  hooks: string[];
  cta: string;
  example: string;
}

const contentFormats: ContentFormat[] = [
  {
    key: "timelapse", title: "Construction Timelapse", emoji: "🏗️", icon: Film,
    color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    description: "Hypnotic construction-to-completion videos showing months compressed into 30-60 seconds",
    platforms: ["TikTok", "Reels", "Shorts"],
    estViews: "50K-500K", engagementRate: "8-15%", production: "Drone + phone footage, 2hr edit",
    hooks: [
      "\"Watch this empty land become a Rp 5M villa in 60 seconds 🏗️→🏡\"",
      "\"8 months of construction in 45 seconds... wait for the pool reveal 🏊\"",
      "\"From foundation to move-in ready — the most satisfying property video you'll see today\"",
    ],
    cta: "See AI valuation of this property → link in bio",
    example: "Film 1 progress visit/week at a construction site, compile into timelapse with upbeat music + price reveal at end",
  },
  {
    key: "cinematic", title: "Luxury Cinematic Tours", emoji: "🏡", icon: Camera,
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    description: "Smooth gimbal walkthrough tours of stunning properties with atmospheric music and price reveal",
    platforms: ["TikTok", "Reels", "Shorts", "YouTube"],
    estViews: "100K-2M", engagementRate: "12-20%", production: "Gimbal + drone, 3hr shoot + edit",
    hooks: [
      "\"This Rp 15M Bali villa has a private infinity pool... would you live here? 🌴\"",
      "\"POV: You just bought your dream house in Jakarta Selatan 🏠✨\"",
      "\"House tour but the price will SHOCK you 💰 (wait for it...)\"",
    ],
    cta: "Explore more properties like this → AI finds your perfect match",
    example: "Slow-motion door open → room-by-room reveal → drone pullout showing neighborhood → price card at end with AI investment score",
  },
  {
    key: "transformation", title: "Before-After Transformations", emoji: "✨", icon: Sparkles,
    color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    description: "Split-screen or swipe-reveal renovations showing dramatic property value increases",
    platforms: ["TikTok", "Reels", "Shorts"],
    estViews: "200K-1M", engagementRate: "15-25%", production: "Before photos + after shoot, 1hr edit",
    hooks: [
      "\"They bought this for Rp 800M and turned it into THIS 🤯 (now worth Rp 2.5B)\"",
      "\"The ugliest house on the street → the most expensive 📈\"",
      "\"Renovation ROI: 213% — here's what they changed 🔨→💎\"",
    ],
    cta: "Find undervalued properties with AI → spot the next transformation opportunity",
    example: "Side-by-side swipe transition: run-down exterior → renovated exterior, old kitchen → modern kitchen, final price comparison card",
  },
  {
    key: "hotspot", title: "Investment Hotspot Explainers", emoji: "📊", icon: BarChart3,
    color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    description: "Data-driven breakdowns of emerging property markets with AI insights and ROI projections",
    platforms: ["TikTok", "Reels", "Shorts", "YouTube"],
    estViews: "30K-200K", engagementRate: "6-12%", production: "Screen record + voiceover, 1.5hr",
    hooks: [
      "\"This area in Bali will 3x in value by 2028 — here's the data 📊\"",
      "\"3 areas near Jakarta where prices are about to explode 🚀\"",
      "\"AI just flagged this location as the #1 investment opportunity in Indonesia\"",
    ],
    cta: "Get free AI property alerts for this area → never miss an opportunity",
    example: "Map zoom into area → data overlay (price trends, infrastructure plans) → AI score reveal → comparison with established areas → CTA",
  },
  {
    key: "pov", title: "POV / Reaction Content", emoji: "😱", icon: MessageCircle,
    color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30",
    description: "First-person reactions, agent day-in-life, and relatable property hunting moments",
    platforms: ["TikTok", "Reels"],
    estViews: "100K-5M", engagementRate: "10-18%", production: "Phone only, 30min",
    hooks: [
      "\"POV: The real estate agent shows you a house 2x your budget 😭💸\"",
      "\"When the AI says your dream house is actually undervalued 🤩📉\"",
      "\"Day in the life of an Indonesian property investor using AI 🤖🏠\"",
    ],
    cta: "Try the AI property finder yourself → link in bio",
    example: "Trending audio + relatable property scenario + platform branding at end + comment prompt",
  },
];

// ── Distribution Plan ──

interface PlatformPlan {
  platform: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  audience: string;
  bestFormats: string[];
  postingFreq: string;
  bestTimes: string;
  hashtagStrategy: string[];
  growthTactic: string;
}

const platformPlans: PlatformPlan[] = [
  {
    platform: "TikTok", icon: Play, color: "text-foreground", bg: "bg-foreground/10",
    audience: "18-35, first-time buyers, aspiring investors, curiosity-driven",
    bestFormats: ["Cinematic Tours", "Before-After", "POV/Reaction"],
    postingFreq: "2x daily (7AM + 7PM WIB)",
    bestTimes: "6-8 AM, 12-1 PM, 7-9 PM WIB",
    hashtagStrategy: ["#rumahimpian", "#propertiindonesia", "#investasiproperti", "#rumahmewah", "#tiktokrealestate"],
    growthTactic: "Duet/stitch with property content creators, use trending sounds within first 2 hours of trend",
  },
  {
    platform: "Instagram Reels", icon: Camera, color: "text-chart-4", bg: "bg-chart-4/10",
    audience: "25-45, premium buyers, lifestyle-focused, design-conscious",
    bestFormats: ["Cinematic Tours", "Timelapse", "Hotspot Explainers"],
    postingFreq: "1x daily Reel + 3-5 Stories",
    bestTimes: "7-9 AM, 12 PM, 6-8 PM WIB",
    hashtagStrategy: ["#propertyinvestment", "#rumahjakarta", "#balivillla", "#realestateindonesia", "#aitechnology"],
    growthTactic: "Collab posts with agents, carousel infographics for saves, location tags on every post",
  },
  {
    platform: "YouTube Shorts", icon: Tv, color: "text-destructive", bg: "bg-destructive/10",
    audience: "25-50, serious researchers, long-term investors, SEO-driven discovery",
    bestFormats: ["Hotspot Explainers", "Timelapse", "Cinematic Tours"],
    postingFreq: "1x daily Short + 1x weekly long-form",
    bestTimes: "8-10 AM, 2-4 PM WIB",
    hashtagStrategy: ["#propertyinvestment", "#indonesiarealestate", "#aipropertyanalysis"],
    growthTactic: "Shorts → drive to long-form deep dives, end screen to SEO landing pages, community posts for engagement",
  },
];

// ── Engagement Triggers ──

interface EngagementTrigger {
  name: string;
  emoji: string;
  mechanic: string;
  why: string;
  example: string;
}

const engagementTriggers: EngagementTrigger[] = [
  { name: "Price Reveal at End", emoji: "💰", mechanic: "Withhold the property price until the final 3 seconds — forces full watch", why: "Boosts watch time (algorithm signal #1), creates anticipation, drives comments asking about price", example: "Full house tour → 'How much do you think this costs?' text → 3 second pause → price card reveal" },
  { name: "\"Would You Live Here?\"", emoji: "🏠", mechanic: "End every tour with a direct question prompting yes/no comments", why: "Comment volume boosts algorithmic reach 3-5x, creates community debate, personal investment in content", example: "Tour ends → text overlay 'Would you live here? Yes or No? 👇' → pin first comment asking the question" },
  { name: "Investment Potential Breakdown", emoji: "📈", mechanic: "Show property → reveal AI investment score → break down ROI potential", why: "Educates audience (save-worthy), positions platform as authority, drives premium signup curiosity", example: "Property showcase → 'AI Investment Score: 87/100' → rental yield → 5yr forecast → 'Get your own AI analysis free'" },
  { name: "\"Guess the Price\" Challenge", emoji: "🤔", mechanic: "Show the property, ask viewers to guess the price in comments before reveal", why: "Massive comment engagement, viewers feel compelled to participate, creates shareable debate", example: "Quick tour → 'Comment your price guess before I reveal it 👇' → reveal at end → react to best guesses in next video" },
  { name: "Area Comparison Battle", emoji: "⚔️", mechanic: "Compare two neighborhoods: 'Rp 2B in Menteng vs Rp 2B in BSD — which would you pick?'", why: "Triggers strong opinions, location pride drives sharing, educational format disguised as entertainment", example: "Split screen → side-by-side property tours → price comparison → AI score comparison → 'Which one wins?'" },
  { name: "\"Save This\" Data Posts", emoji: "📌", mechanic: "Carousel/visual with specific data: 'Top 5 areas with highest ROI in 2026'", why: "Saves are the highest-weight engagement signal on Instagram, positions as reference resource", example: "Clean data visualization → area rankings → price per sqm → rental yield → save prompt at end" },
];

// ── Posting Calendar ──

interface DayPlan {
  day: string;
  tiktok: string;
  reels: string;
  shorts: string;
  theme: string;
}

const weeklyCalendar: DayPlan[] = [
  { day: "Monday", tiktok: "2x: Cinematic Tour + POV", reels: "1x Cinematic Tour", shorts: "1x Tour clip", theme: "🏡 Dream Home Monday" },
  { day: "Tuesday", tiktok: "2x: Hotspot + Reaction", reels: "1x Hotspot Explainer", shorts: "1x Data Breakdown", theme: "📊 Data Tuesday" },
  { day: "Wednesday", tiktok: "2x: Before-After + Tour", reels: "1x Transformation", shorts: "1x Timelapse", theme: "✨ Transformation Wednesday" },
  { day: "Thursday", tiktok: "2x: Investment + POV", reels: "1x Investment Tip", shorts: "1x AI Insight", theme: "💰 Investment Thursday" },
  { day: "Friday", tiktok: "2x: Luxury Tour + Guess Price", reels: "1x Luxury Tour", shorts: "1x Tour clip", theme: "🏰 Luxury Friday" },
  { day: "Saturday", tiktok: "2x: Area Battle + Tour", reels: "1x Area Comparison", shorts: "1x Location Explainer", theme: "📍 Location Saturday" },
  { day: "Sunday", tiktok: "1x: Weekly Recap/Best Of", reels: "1x Carousel Data Post", shorts: "1x Weekly long-form", theme: "📈 Recap Sunday" },
];

// ── Traffic Conversion Flows ──

interface ConversionFlow {
  trigger: string;
  icon: React.ElementType;
  steps: string[];
  destination: string;
  expectedCTR: string;
}

const conversionFlows: ConversionFlow[] = [
  {
    trigger: "Cinematic Tour Video", icon: Camera,
    steps: ["Viewer watches full tour", "Price reveal + AI score shown", "CTA: 'See full AI analysis'", "Link in bio → property page"],
    destination: "Property detail page with AI insights", expectedCTR: "3-5%",
  },
  {
    trigger: "Hotspot Explainer", icon: MapPin,
    steps: ["Data breakdown of area", "AI flags opportunity", "CTA: 'Explore all properties in [area]'", "Link → SEO location page"],
    destination: "Location SEO page (e.g., /properti/bali/seminyak)", expectedCTR: "4-7%",
  },
  {
    trigger: "Investment Score Reveal", icon: BarChart3,
    steps: ["Property showcase", "AI Investment Score teased", "CTA: 'Get free AI analysis on any property'", "Link → investor dashboard signup"],
    destination: "Freemium investor dashboard", expectedCTR: "5-8%",
  },
  {
    trigger: "Price Guess Challenge", icon: MessageCircle,
    steps: ["Engagement in comments", "Reply with property link", "CTA: 'See what AI thinks it's really worth'", "Link → AI valuation tool"],
    destination: "AI property valuation page", expectedCTR: "2-4%",
  },
];

// ── Component: Content Format Card ──

function FormatCard({ format }: { format: ContentFormat }) {
  const Icon = format.icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn("rounded-2xl border-border/30 bg-card/80 overflow-hidden transition-all")}>
      <div className={cn("h-1", format.bg.replace("/10", "/30"))} />
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", format.bg)}>
              <Icon className={cn("h-3 w-3", format.color)} />
            </div>
            {format.emoji} {format.title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", format.color, format.bg, format.border)}>
              <Eye className="h-2 w-2 mr-0.5" />{format.estViews}
            </Badge>
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
              <Heart className="h-2 w-2 mr-0.5" />{format.engagementRate}
            </Badge>
            <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", expanded && "rotate-90")} />
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">{format.description}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="p-3 pt-0 space-y-2.5 border-t border-border/20">
          <div className="flex items-center gap-1 flex-wrap">
            {format.platforms.map((p) => (
              <Badge key={p} variant="outline" className="text-[7px] h-3.5 px-1.5 text-muted-foreground">{p}</Badge>
            ))}
            <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-muted-foreground">
              <Clock className="h-2 w-2 mr-0.5" />{format.production}
            </Badge>
          </div>

          <div>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Hook Examples</span>
            <div className="space-y-1">
              {format.hooks.map((hook, i) => (
                <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-muted/5 border border-border/10">
                  <Flame className="h-2.5 w-2.5 text-chart-4 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-foreground italic">{hook}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-[8px] text-primary font-bold block mb-0.5">📋 Production Template</span>
            <p className="text-[9px] text-muted-foreground">{format.example}</p>
          </div>

          <div className="p-2 rounded-lg bg-chart-1/5 border border-chart-1/20">
            <span className="text-[8px] text-chart-1 font-bold block mb-0.5">🎯 CTA Strategy</span>
            <p className="text-[9px] text-foreground">{format.cta}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Component: Platform Distribution ──

function PlatformDistribution() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {platformPlans.map((p) => {
        const Icon = p.icon;
        return (
          <Card key={p.platform} className="rounded-2xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <Icon className={cn("h-4 w-4", p.color)} />{p.platform}
              </CardTitle>
              <p className="text-[9px] text-muted-foreground">{p.audience}</p>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Best Formats</span>
                <div className="flex flex-wrap gap-1">
                  {p.bestFormats.map((f) => (
                    <Badge key={f} variant="outline" className="text-[7px] h-3.5 px-1.5 text-foreground">{f}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 rounded-lg bg-muted/5 border border-border/10">
                  <span className="text-[7px] text-muted-foreground block">Frequency</span>
                  <span className="text-[9px] font-semibold text-foreground">{p.postingFreq}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-muted/5 border border-border/10">
                  <span className="text-[7px] text-muted-foreground block">Best Times</span>
                  <span className="text-[9px] font-semibold text-foreground">{p.bestTimes}</span>
                </div>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Hashtags</span>
                <div className="flex flex-wrap gap-1">
                  {p.hashtagStrategy.map((h) => (
                    <Badge key={h} variant="outline" className="text-[7px] h-3.5 px-1.5 text-chart-4 bg-chart-4/5 border-chart-4/20">
                      <Hash className="h-2 w-2 mr-0.5" />{h.replace("#", "")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-[7px] text-primary font-bold block">Growth Tactic</span>
                <p className="text-[8px] text-muted-foreground">{p.growthTactic}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Component: Engagement Triggers ──

function EngagementTriggersSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {engagementTriggers.map((t) => (
        <Card key={t.name} className="rounded-xl border-border/30 bg-card/80">
          <CardContent className="p-3 space-y-2">
            <span className="text-[11px] font-bold text-foreground">{t.emoji} {t.name}</span>
            <div className="space-y-1.5">
              <div>
                <span className="text-[7px] text-muted-foreground uppercase tracking-wide block">Mechanic</span>
                <p className="text-[9px] text-foreground">{t.mechanic}</p>
              </div>
              <div>
                <span className="text-[7px] text-muted-foreground uppercase tracking-wide block">Why It Works</span>
                <p className="text-[9px] text-muted-foreground">{t.why}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-chart-1/5 border border-chart-1/20">
                <span className="text-[7px] text-chart-1 font-bold block">Example</span>
                <p className="text-[8px] text-muted-foreground">{t.example}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Component: Weekly Calendar ──

function WeeklyCalendar() {
  return (
    <Card className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Weekly Content Calendar
        </CardTitle>
        <CardDescription className="text-[10px]">13 videos/week across 3 platforms — daily themes for consistent brand building</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1">
          {weeklyCalendar.map((d) => (
            <div key={d.day} className="grid grid-cols-[80px_1fr_1fr_1fr_120px] gap-2 p-2 rounded-lg border border-border/10 bg-muted/5 items-center">
              <span className="text-[10px] font-bold text-foreground">{d.day}</span>
              <span className="text-[8px] text-muted-foreground">{d.tiktok}</span>
              <span className="text-[8px] text-muted-foreground">{d.reels}</span>
              <span className="text-[8px] text-muted-foreground">{d.shorts}</span>
              <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-chart-4 bg-chart-4/5 border-chart-4/20 justify-self-end">
                {d.theme}
              </Badge>
            </div>
          ))}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_120px] gap-2 px-2 pt-1">
            <span className="text-[7px] text-muted-foreground font-bold">Day</span>
            <span className="text-[7px] text-muted-foreground font-bold">TikTok</span>
            <span className="text-[7px] text-muted-foreground font-bold">Reels</span>
            <span className="text-[7px] text-muted-foreground font-bold">Shorts</span>
            <span className="text-[7px] text-muted-foreground font-bold text-right">Theme</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Component: Conversion Flows ──

function ConversionFlows() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {conversionFlows.map((flow) => {
        const Icon = flow.icon;
        return (
          <Card key={flow.trigger} className="rounded-xl border-border/30 bg-card/80">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />{flow.trigger}
                </span>
                <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-chart-1 bg-chart-1/10 border-chart-1/30">
                  CTR: {flow.expectedCTR}
                </Badge>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {flow.steps.map((step, i) => (
                  <React.Fragment key={i}>
                    <Badge variant="outline" className="text-[7px] h-4 px-1.5 text-foreground bg-muted/10">
                      {i + 1}. {step}
                    </Badge>
                    {i < flow.steps.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-[7px] text-primary font-bold">Destination: </span>
                <span className="text-[8px] text-muted-foreground">{flow.destination}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── KPI Targets ──

function KPITargets() {
  const targets = [
    { period: "Day 30", views: "500K total", followers: "5K", leads: "200", color: "text-chart-4" },
    { period: "Day 60", views: "3M total", followers: "25K", leads: "1,500", color: "text-primary" },
    { period: "Day 90", views: "10M total", followers: "100K", leads: "5,000", color: "text-chart-1" },
  ];

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Target className="h-4 w-4 text-chart-1" />
          90-Day Growth KPI Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-3 gap-2">
          {targets.map((t) => (
            <div key={t.period} className="p-2.5 rounded-xl border border-border/20 bg-muted/5 space-y-1.5">
              <Badge variant="outline" className={cn("text-[9px] h-5 px-2 font-bold", t.color)}>{t.period}</Badge>
              <div className="space-y-1">
                {[
                  { label: "Total Views", value: t.views },
                  { label: "Followers", value: t.followers },
                  { label: "Leads Generated", value: t.leads },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between">
                    <span className="text-[8px] text-muted-foreground">{m.label}</span>
                    <span className={cn("text-[9px] font-bold", t.color)}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──

const ViralContentDashboard = React.memo(function ViralContentDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-4/40 via-destructive/20 to-primary/30" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Video className="h-5 w-5 text-chart-4" />
                Viral Content Growth Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                Social media content engine — formats, distribution, engagement triggers, and conversion flows
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-4 bg-chart-4/10 border-chart-4/30">
              🎬 13 videos/week
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {contentFormats.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key} className={cn("p-2 rounded-xl border", f.bg, f.border)}>
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3 w-3", f.color)} />
                    <span className="text-[8px] font-bold text-foreground">{f.emoji} {f.title.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <span className={cn("text-[9px] font-bold block mt-0.5", f.color)}>{f.estViews} views</span>
                  <span className="text-[7px] text-muted-foreground">{f.engagementRate} engagement</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="formats" className="text-[10px] h-6 px-3">Content Formats</TabsTrigger>
          <TabsTrigger value="distribution" className="text-[10px] h-6 px-3">Distribution</TabsTrigger>
          <TabsTrigger value="engagement" className="text-[10px] h-6 px-3">Engagement Triggers</TabsTrigger>
          <TabsTrigger value="calendar" className="text-[10px] h-6 px-3">Calendar & Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="mt-3 space-y-2">
          {contentFormats.map((f) => <FormatCard key={f.key} format={f} />)}
        </TabsContent>

        <TabsContent value="distribution" className="mt-3 space-y-3">
          <PlatformDistribution />
        </TabsContent>

        <TabsContent value="engagement" className="mt-3 space-y-3">
          <EngagementTriggersSection />
        </TabsContent>

        <TabsContent value="calendar" className="mt-3 space-y-3">
          <KPITargets />
          <WeeklyCalendar />
          <ConversionFlows />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default ViralContentDashboard;
