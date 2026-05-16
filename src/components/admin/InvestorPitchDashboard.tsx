import React, { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Presentation, AlertTriangle, Lightbulb, Globe, Sparkles, Rocket,
  DollarSign, TrendingUp, BarChart3, Users, Target, Shield,
  Crown, Zap, ArrowRight, CheckCircle2, ChevronRight, ChevronDown,
  Layers, Award, Timer, Banknote, Play, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePitchMetrics } from "./pitch/usePitchMetrics";
import type { PresentationSlide } from "./pitch/PitchPresentationMode";
import {
  KeyPointsGrid, LiveMetricsSlide, OpportunityDistributionChart,
  RevenueProjectionChart, CompetitiveMatrixChart, FundAllocationChart,
} from "./pitch/PitchSlideContent";

const PitchPresentationMode = lazy(() => import("./pitch/PitchPresentationMode"));

// ── Pitch Slide Data ──

interface PitchSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  speakerNotes: string;
  keyPoints: { point: string; detail: string }[];
  visualSuggestion: string;
  duration: string;
  sectionDivider?: boolean;
  sectionLabel?: string;
}

const pitchSlides: PitchSlide[] = [
  // Section divider: Problem & Opportunity
  {
    slideNumber: 0, title: "Problem & Opportunity", subtitle: "Why now, why this market", emoji: "🔍",
    icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30",
    speakerNotes: "Transition: We're about to show you a massive inefficiency in the world's 4th largest economy.",
    keyPoints: [], visualSuggestion: "", duration: "10s", sectionDivider: true, sectionLabel: "PART I",
  },
  {
    slideNumber: 1, title: "The Problem", subtitle: "Property Investment Is Broken", emoji: "🔥",
    icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30",
    speakerNotes: "Open with a story: 'Pak Budi spent 6 months searching for an investment property. He visited 40 properties, hired 3 agents, and still overpaid by 15%. His neighbor used our AI and found a better property in 2 weeks at fair value. This is the gap we're closing.'",
    keyPoints: [
      { point: "Information asymmetry", detail: "72% of transactions involve significant overpayment" },
      { point: "Fragmented discovery", detail: "Investors check 5+ platforms, visit 20+ properties, spend 3-6 months" },
      { point: "Zero investment intelligence", detail: "No platform tells you IF a property is a good investment" },
      { point: "Agent inefficiency", detail: "Agents spend 60% of time on unqualified leads" },
    ],
    visualSuggestion: "Split screen comparison", duration: "2 min",
  },
  {
    slideNumber: 2, title: "Market Opportunity", subtitle: "Indonesia's $200B+ Property Ecosystem", emoji: "🌏",
    icon: Globe, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "Indonesia is the world's 4th largest population with a rapidly urbanizing middle class.",
    keyPoints: [
      { point: "TAM: $200B+", detail: "Annual property transaction value — residential, commercial, land" },
      { point: "SAM: $45B", detail: "Residential transactions in top 15 cities" },
      { point: "SOM: $2B", detail: "4.4% capture within 5 years" },
      { point: "Tailwinds", detail: "70% internet penetration, 65% under 40, declining rates" },
    ],
    visualSuggestion: "TAM/SAM/SOM concentric circles", duration: "2 min",
  },
  // Section divider: Solution & Product
  {
    slideNumber: 0, title: "Solution & Product", subtitle: "The AI intelligence platform", emoji: "⚡",
    icon: Sparkles, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    speakerNotes: "Now let's show you what we've built.", keyPoints: [], visualSuggestion: "", duration: "10s",
    sectionDivider: true, sectionLabel: "PART II",
  },
  {
    slideNumber: 3, title: "The Solution", subtitle: "AI-Powered Property Intelligence", emoji: "💡",
    icon: Lightbulb, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "This is not another property listing site. We've built an intelligence layer ON TOP of a marketplace.",
    keyPoints: [
      { point: "AI Investment Scoring", detail: "0-100 score: valuation, yield, momentum, risk" },
      { point: "Predictive Market Intelligence", detail: "Detect hotspots 6-12 months early" },
      { point: "Smart Matching Engine", detail: "125-point algorithm, 3x higher conversion" },
      { point: "Agent Productivity Suite", detail: "AI-scored leads, agents close 40% faster" },
    ],
    visualSuggestion: "Product screenshots", duration: "3 min",
  },
  {
    slideNumber: 4, title: "6-Layer AI Stack", subtitle: "Deep Technical Moat", emoji: "⚡",
    icon: Sparkles, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    speakerNotes: "Our moat is the intelligence. 6 layers that compound. Each makes every other smarter.",
    keyPoints: [
      { point: "Layer 1-2: Data + Property Intelligence", detail: "Real-time ingestion, AI valuation ±5% accuracy" },
      { point: "Layer 3: Decision Brain", detail: "Investment scoring, matchmaking, deal probability" },
      { point: "Layer 4-5: SEO + Sales Conversion", detail: "10,000+ pages, AI lead scoring, smart notifications" },
      { point: "Layer 6: Growth Engine", detail: "Autonomous deal hunting, self-improving" },
    ],
    visualSuggestion: "Stack diagram with feedback loop", duration: "3 min",
  },
  // Live metrics slide (special)
  {
    slideNumber: 5, title: "Live Platform Intelligence", subtitle: "Real-time platform metrics", emoji: "📊",
    icon: BarChart3, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "These are LIVE numbers from our production platform. This is not a mockup — this is real data.",
    keyPoints: [], visualSuggestion: "Animated KPI counters", duration: "1 min",
  },
  // Section divider: Business Model
  {
    slideNumber: 0, title: "Business & Growth", subtitle: "Revenue model and competitive edge", emoji: "💰",
    icon: DollarSign, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "Let's talk about how this becomes a billion-dollar business.", keyPoints: [], visualSuggestion: "", duration: "10s",
    sectionDivider: true, sectionLabel: "PART III",
  },
  {
    slideNumber: 6, title: "Growth Strategy", subtitle: "Multi-Channel Acquisition", emoji: "🚀",
    icon: Rocket, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    speakerNotes: "Multi-engine approach where each channel reinforces the others.",
    keyPoints: [
      { point: "SEO Location Engine", detail: "10,000+ pages, 500K organic visits/mo by M12" },
      { point: "Viral Content", detail: "13 videos/week, 10M views/mo target" },
      { point: "Agent Network", detail: "100 agents, 3,000 listings by Day 90" },
      { point: "Strategic Partnerships", detail: "Developer + bank integrations, -70% CAC" },
    ],
    visualSuggestion: "Flywheel diagram", duration: "2 min",
  },
  {
    slideNumber: 7, title: "Revenue Model", subtitle: "Rp 2.3B/mo by Month 12", emoji: "💰",
    icon: DollarSign, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "5 complementary revenue streams with 82% gross margins.",
    keyPoints: [
      { point: "Listing Promotion (17%)", detail: "Featured, AI Boost, Spotlight — Rp 400M/mo" },
      { point: "Agent SaaS (26%)", detail: "Pro + Enterprise tiers — Rp 600M/mo" },
      { point: "Investor Intelligence (15%)", detail: "Pro + Diamond — Rp 350M/mo" },
      { point: "Transaction + B2B (42%)", detail: "Success fees + data licensing — Rp 950M/mo" },
    ],
    visualSuggestion: "Revenue waterfall chart", duration: "2 min",
  },
  {
    slideNumber: 8, title: "Competitive Landscape", subtitle: "Intelligence vs Listings", emoji: "🏆",
    icon: Award, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "Every competitor is a listing portal. We're an intelligence platform.",
    keyPoints: [
      { point: "Rumah123 / 99.co / OLX", detail: "No AI, no predictions — they sell ads, we sell intelligence" },
      { point: "Data Compounding", detail: "More users → better AI → more users (network effect)" },
      { point: "18-month Stack Advantage", detail: "Can't replicate without full rebuild" },
      { point: "Category Creation", detail: "'Property Intelligence' — we define it" },
    ],
    visualSuggestion: "Radar chart comparison", duration: "2 min",
  },
  // Section divider: Ask
  {
    slideNumber: 0, title: "The Ask & Vision", subtitle: "Investment opportunity", emoji: "🎯",
    icon: Target, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "This is the moment — make the ask compelling.", keyPoints: [], visualSuggestion: "", duration: "10s",
    sectionDivider: true, sectionLabel: "THE ASK",
  },
  {
    slideNumber: 9, title: "Team", subtitle: "Built to Win This Market", emoji: "👥",
    icon: Users, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    speakerNotes: "Property knowledge + AI engineering + marketplace scaling.",
    keyPoints: [
      { point: "Founder/CEO", detail: "Deep property industry knowledge and network" },
      { point: "Technical Architecture", detail: "Modern AI-native stack, <800ms response" },
      { point: "Growth Expertise", detail: "Execution-ready playbooks for all channels" },
      { point: "Key Hires Planned", detail: "Head AI/ML, Growth, Sales + 3 engineers" },
    ],
    visualSuggestion: "Team grid", duration: "1.5 min",
  },
  {
    slideNumber: 10, title: "The Ask", subtitle: "Seed Round — $1.5-2M", emoji: "🎯",
    icon: Target, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "We're raising seed to turn our built product into a growth machine.",
    keyPoints: [
      { point: "Raising: $1.5-2M Seed", detail: "Pre-money: $8-10M — Series A product at seed pricing" },
      { point: "Team (40%)", detail: "6 key hires to scale to 1,000 paying customers" },
      { point: "Growth (35%)", detail: "12-month growth runway across all channels" },
      { point: "Product (25%)", detail: "AI models, mobile app, API infrastructure" },
    ],
    visualSuggestion: "Fund allocation pie chart", duration: "2 min",
  },
  {
    slideNumber: 11, title: "Vision", subtitle: "National Property Intelligence Infrastructure", emoji: "🌟",
    icon: Crown, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "We're building the intelligence infrastructure that every property transaction flows through.",
    keyPoints: [
      { point: "Year 1: National Data Authority", detail: "ASTRA Price Index referenced by banks & media" },
      { point: "Year 2: Platform Dominance", detail: "10K agents, 50K listings, 500K monthly users" },
      { point: "Year 3: Regional Expansion", detail: "Malaysia, Thailand, Vietnam, Philippines" },
      { point: "Year 5: Category Winner", detail: "$100M+ ARR, 'Bloomberg of Asian Property'" },
    ],
    visualSuggestion: "Expansion map + revenue chart", duration: "2 min",
  },
];

// ── Appendix ──

const appendixItems = [
  { title: "Financial Projections (5-Year)", items: ["Year 1: Rp 15B revenue, -Rp 8B net", "Year 2: Rp 65B, breakeven", "Year 3: Rp 180B, Rp 45B EBITDA", "Year 5: Rp 500B+, 30% EBITDA margin"] },
  { title: "Key Assumptions", items: ["15% MoM listing growth", "25% agent Pro conversion by M6", "15% investor premium conversion", "Avg transaction: Rp 1.5B", "Blended take rate: 1.5%"] },
  { title: "Risk Factors", items: ["Market: diversified 15 cities", "Competition: 18-month AI moat", "Regulatory: proactive compliance", "Execution: staged rollout"] },
  { title: "Comparable Exits", items: ["PropertyGuru: $1.8B (no AI)", "Zillow: $10B+ (Zestimate)", "REA Group: $15B (data-driven)", "ASTRA: PropertyGuru market + Zillow intelligence"] },
];

// ── Sub-components ──

const SlideCard = React.memo(function SlideCard({ slide }: { slide: PitchSlide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = slide.icon;

  if (slide.sectionDivider) {
    return (
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30" />
        </div>
        <div className="relative flex justify-center">
          <Badge variant="outline" className={cn("text-[9px] h-5 px-3 font-bold", slide.bg, slide.color, slide.border)}>
            {slide.sectionLabel} — {slide.emoji} {slide.title}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", slide.bg.replace("/10", "/30"))} />
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold", slide.bg, slide.color)}>
              {slide.slideNumber}
            </div>
            {slide.emoji} {slide.title}
            <span className="text-[9px] font-normal text-muted-foreground">— {slide.subtitle}</span>
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">
              <Timer className="h-2 w-2 mr-0.5" />{slide.duration}
            </Badge>
            {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-3 pt-0 space-y-3 border-t border-border/20">
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <span className="text-[8px] text-primary font-bold block mb-1">🎤 Speaker Notes</span>
            <p className="text-[9px] text-foreground italic leading-relaxed">{slide.speakerNotes}</p>
          </div>
          <div className="space-y-1.5">
            {slide.keyPoints.map((kp, i) => (
              <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className={cn("h-3 w-3 shrink-0 mt-0.5", slide.color)} />
                  <div>
                    <span className="text-[10px] font-bold text-foreground">{kp.point}</span>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{kp.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

function PitchFlowOverview() {
  const nonDividers = pitchSlides.filter((s) => !s.sectionDivider);
  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Pitch Flow — {pitchSlides.length} Slides
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center gap-1 flex-wrap">
          {nonDividers.map((slide, i) => (
            <React.Fragment key={`${slide.slideNumber}-${i}`}>
              <div className={cn("p-1.5 rounded-lg border text-center min-w-[60px]", slide.bg, slide.border)}>
                <span className={cn("text-[8px] font-bold block", slide.color)}>{slide.emoji} #{slide.slideNumber}</span>
                <span className="text-[7px] text-foreground block">{slide.title}</span>
              </div>
              {i < nonDividers.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorFAQ() {
  const faqs = [
    { q: "What's your unfair advantage?", a: "6-layer AI stack, 18+ months to replicate. Data network effect compounds daily." },
    { q: "Why not add AI to existing portals?", a: "Requires full architecture rebuild. We're AI-native, not bolted on." },
    { q: "How do you acquire supply?", a: "Agent onboarding via WhatsApp (10-20 listings each), developer partnerships (50-200 units)." },
    { q: "Path to profitability?", a: "82% gross margins. Breakeven at Rp 1.5B/mo MRR (Month 8-10). LTV:CAC 49:1." },
    { q: "Why Indonesia?", a: "4th largest population, $200B market, <5% digital penetration. No AI competitor." },
    { q: "How defensible?", a: "Data moat + brand moat (ASTRA Price Index) + network moat (agents + devs + banks)." },
  ];
  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Shield className="h-4 w-4 text-chart-3" /> Investor FAQ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="p-2.5 rounded-xl border border-border/20 bg-muted/5">
            <span className="text-[10px] font-bold text-foreground block mb-1">Q: {faq.q}</span>
            <p className="text-[9px] text-muted-foreground">A: {faq.a}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DealTermsCard() {
  const terms = [
    { label: "Round", value: "Seed" },
    { label: "Raising", value: "$1.5-2M" },
    { label: "Pre-Money", value: "$8-10M" },
    { label: "Instrument", value: "Equity / SAFE" },
    { label: "Use of Funds", value: "40% Team, 35% Growth, 25% Product" },
    { label: "Runway", value: "18 months to Series A" },
    { label: "Series A Target", value: "M15-18, $8-12M" },
    { label: "Series A KPIs", value: "Rp 2B MRR, 50K MAU" },
  ];
  return (
    <Card className="rounded-2xl border-chart-1/20 bg-chart-1/5">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Banknote className="h-4 w-4 text-chart-1" /> Proposed Deal Terms
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {terms.map((t) => (
            <div key={t.label} className="p-2 rounded-xl border border-chart-1/20 bg-card/60">
              <span className="text-[7px] text-muted-foreground block">{t.label}</span>
              <span className="text-[10px] font-bold text-foreground">{t.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AppendixSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {appendixItems.map((section) => (
        <Card key={section.title} className="rounded-xl border-border/30 bg-card/80">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-[10px] font-bold text-foreground">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-2.5 w-2.5 text-chart-1 shrink-0 mt-0.5" />
                <span className="text-[8px] text-muted-foreground">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Dashboard ──

const InvestorPitchDashboard = React.memo(function InvestorPitchDashboard() {
  const [presenting, setPresenting] = useState(false);
  const { data: metrics } = usePitchMetrics();

  // Build presentation slides with content components
  const presentationSlides: PresentationSlide[] = useMemo(() => {
    return pitchSlides.map((slide) => {
      let content: React.ReactNode = null;

      if (slide.sectionDivider) {
        // handled by PresentationMode directly
      } else if (slide.title === "Live Platform Intelligence") {
        content = <LiveMetricsSlide metrics={metrics} />;
      } else if (slide.title === "Revenue Model") {
        content = (
          <div className="grid grid-cols-2 gap-8 h-full">
            <KeyPointsGrid points={slide.keyPoints} color={slide.color} />
            <RevenueProjectionChart />
          </div>
        );
      } else if (slide.title === "Competitive Landscape") {
        content = (
          <div className="grid grid-cols-2 gap-8 h-full">
            <KeyPointsGrid points={slide.keyPoints} color={slide.color} />
            <CompetitiveMatrixChart />
          </div>
        );
      } else if (slide.title === "The Ask") {
        content = (
          <div className="grid grid-cols-2 gap-8 h-full">
            <KeyPointsGrid points={slide.keyPoints} color={slide.color} />
            <FundAllocationChart />
          </div>
        );
      } else if (slide.title === "6-Layer AI Stack") {
        content = (
          <div className="grid grid-cols-2 gap-8 h-full">
            <KeyPointsGrid points={slide.keyPoints} color={slide.color} />
            <OpportunityDistributionChart />
          </div>
        );
      } else {
        content = <KeyPointsGrid points={slide.keyPoints} color={slide.color} />;
      }

      return {
        slideNumber: slide.slideNumber,
        title: slide.title,
        subtitle: slide.subtitle,
        emoji: slide.emoji,
        speakerNotes: slide.speakerNotes,
        sectionDivider: slide.sectionDivider,
        sectionLabel: slide.sectionLabel,
        content,
      };
    });
  }, [metrics]);

  return (
    <>
      {presenting && (
        <Suspense fallback={null}>
          <PitchPresentationMode slides={presentationSlides} onExit={() => setPresenting(false)} />
        </Suspense>
      )}

      <div className="space-y-4">
        <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
          <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-4/20" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-primary" />
                  Investor Pitch Deck
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Seed round pitch — {pitchSlides.filter(s => !s.sectionDivider).length} content slides + section dividers
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPresenting(true)}
                  variant="cta"
                  size="sm"
                  className="gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  Present
                </Button>
                <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
                  🎯 $1.5-2M Seed
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Slides", value: `${pitchSlides.length}`, icon: Layers, color: "text-primary" },
                { label: "Duration", value: "22 min", icon: Timer, color: "text-chart-4" },
                { label: "Raising", value: "$1.5-2M", icon: Target, color: "text-chart-1" },
                { label: "Valuation", value: "$8-10M", icon: TrendingUp, color: "text-chart-3" },
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

        <Tabs defaultValue="deck" className="w-full">
          <TabsList className="h-8">
            <TabsTrigger value="deck" className="text-[10px] h-6 px-3">Pitch Deck</TabsTrigger>
            <TabsTrigger value="faq" className="text-[10px] h-6 px-3">Investor FAQ</TabsTrigger>
            <TabsTrigger value="terms" className="text-[10px] h-6 px-3">Deal Terms</TabsTrigger>
            <TabsTrigger value="appendix" className="text-[10px] h-6 px-3">Appendix</TabsTrigger>
          </TabsList>

          <TabsContent value="deck" className="mt-3 space-y-2">
            <PitchFlowOverview />
            {pitchSlides.map((slide, i) => <SlideCard key={`${slide.slideNumber}-${i}`} slide={slide} />)}
          </TabsContent>

          <TabsContent value="faq" className="mt-3">
            <InvestorFAQ />
          </TabsContent>

          <TabsContent value="terms" className="mt-3 space-y-3">
            <DealTermsCard />
          </TabsContent>

          <TabsContent value="appendix" className="mt-3">
            <AppendixSection />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
});

export default InvestorPitchDashboard;
