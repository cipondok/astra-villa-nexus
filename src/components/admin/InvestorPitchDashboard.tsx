import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Presentation, AlertTriangle, Lightbulb, Globe, Sparkles, Rocket,
  DollarSign, Eye, TrendingUp, BarChart3, Users, Target, Shield,
  Crown, Star, Zap, ArrowRight, CheckCircle2, ChevronRight, ChevronDown,
  Building, LineChart, MapPin, Database, Lock, Layers, Award,
  Timer, Gem, PieChart, Banknote, Milestone, Flag, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const pitchSlides: PitchSlide[] = [
  {
    slideNumber: 1, title: "The Problem", subtitle: "Property Investment Is Broken", emoji: "🔥",
    icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30",
    speakerNotes: "Open with a story: 'Pak Budi spent 6 months searching for an investment property. He visited 40 properties, hired 3 agents, and still overpaid by 15%. His neighbor used our AI and found a better property in 2 weeks at fair value. This is the gap we're closing.'",
    keyPoints: [
      { point: "Information asymmetry", detail: "Buyers have no access to fair market valuations — 72% of property transactions in Indonesia involve significant overpayment or missed opportunities" },
      { point: "Fragmented discovery", detail: "Investors check 5+ platforms, visit 20+ properties, spend 3-6 months on average — a broken, inefficient experience" },
      { point: "Zero investment intelligence", detail: "No existing platform tells you IF a property is a good investment — only THAT it exists. ROI, rental yield, and market trends are invisible" },
      { point: "Agent inefficiency", detail: "Agents spend 60% of time on unqualified leads — no scoring, no matching, no intelligence on buyer readiness" },
    ],
    visualSuggestion: "Split screen: chaotic traditional process (left) vs. clean AI-powered flow (right). Pain point statistics overlaid.",
    duration: "2 minutes",
  },
  {
    slideNumber: 2, title: "The Solution", subtitle: "AI-Powered Property Intelligence Platform", emoji: "💡",
    icon: Lightbulb, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "This is not another property listing site. We've built an intelligence layer ON TOP of a marketplace. Every property comes with an AI brain that tells you what it's really worth, what it'll earn, and whether you should buy it.",
    keyPoints: [
      { point: "AI Investment Scoring", detail: "Every property gets a 0-100 investment score combining valuation, yield potential, market momentum, and risk assessment — the 'credit score' for properties" },
      { point: "Predictive Market Intelligence", detail: "AI detects emerging hotspots, undervalued opportunities, and market shifts 6-12 months before they're visible to the market" },
      { point: "Smart Matching Engine", detail: "125-point behavioral algorithm matches buyers with properties based on investment goals, not just search filters — 3x higher conversion than browse-and-filter" },
      { point: "Agent Productivity Suite", detail: "AI-scored leads, automated follow-ups, deal probability signals — agents close 40% faster with our tools" },
    ],
    visualSuggestion: "Product demo screenshots: property page with AI score overlay, investment dashboard, deal alert notification. Live demo if possible.",
    duration: "3 minutes",
  },
  {
    slideNumber: 3, title: "Market Opportunity", subtitle: "Indonesia's $200B+ Property Ecosystem", emoji: "🌏",
    icon: Globe, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "Indonesia is the world's 4th largest population with a rapidly urbanizing middle class. The property market is massive but digitally underserved compared to every other consumer category.",
    keyPoints: [
      { point: "Total Addressable Market (TAM)", detail: "$200B+ annual property transaction value in Indonesia — residential, commercial, and land combined" },
      { point: "Serviceable Addressable Market (SAM)", detail: "$45B residential transactions in top 15 cities — our initial geographic focus with digital-savvy buyers" },
      { point: "Serviceable Obtainable Market (SOM)", detail: "$2B target capture (4.4% of SAM) within 5 years through listing fees, subscriptions, and transaction revenue" },
      { point: "Market Tailwinds", detail: "70% internet penetration, 65% under 40 population, government housing programs, declining interest rates, and rising middle-class homeownership aspiration" },
    ],
    visualSuggestion: "Concentric circle TAM/SAM/SOM diagram with dollar values. Indonesia map showing top 15 target cities with market size bubbles.",
    duration: "2 minutes",
  },
  {
    slideNumber: 4, title: "Product & Differentiation", subtitle: "6-Layer AI Intelligence Stack", emoji: "⚡",
    icon: Sparkles, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    speakerNotes: "Our moat is not the marketplace — it's the intelligence. We've built 6 layers of AI that no competitor has. Each layer makes every other layer smarter. This compounds over time and creates an unassailable data advantage.",
    keyPoints: [
      { point: "Layer 1: Data Foundation", detail: "PostgreSQL + real-time market data ingestion — prices, transactions, demographics, infrastructure pipelines from 15 cities" },
      { point: "Layer 2: Property Intelligence", detail: "AI valuation engine (±5% accuracy), yield projections, price forecasts, comparable analysis — runs on every listing automatically" },
      { point: "Layer 3: Decision Brain", detail: "Unified investment scoring, buyer-property matchmaking, deal probability, risk assessment — the 'brain' that synthesizes all signals" },
      { point: "Layer 4: SEO & Content Engine", detail: "Automated location content generation, keyword optimization, programmatic landing pages — 10,000+ SEO pages scaling organically" },
      { point: "Layer 5: Sales Conversion", detail: "Lead scoring, agent performance optimization, smart notifications, deal urgency signals — AI-driven sales funnel" },
      { point: "Layer 6: Growth & Monetization", detail: "Autonomous deal hunting, market pattern detection, investor clustering, subscription intelligence — self-improving growth engine" },
    ],
    visualSuggestion: "Vertical stack diagram showing 6 layers with data flow arrows. Highlight the feedback loop where user behavior improves AI accuracy.",
    duration: "3 minutes",
  },
  {
    slideNumber: 5, title: "Growth Strategy", subtitle: "Multi-Channel Acquisition Engine", emoji: "🚀",
    icon: Rocket, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    speakerNotes: "We don't rely on a single growth channel. We've designed a multi-engine approach where each channel reinforces the others — SEO drives organic traffic, content drives virality, agents drive supply, and partnerships drive credibility.",
    keyPoints: [
      { point: "SEO Location Engine", detail: "10,000+ programmatic location pages covering every district in 15 cities — targeting 'beli rumah [location]' search intent. Target: 500K organic visits/month by Month 12" },
      { point: "Viral Content Strategy", detail: "13 videos/week across TikTok, Reels, Shorts — cinematic tours, price reveals, investment breakdowns. Target: 10M views/month, 100K followers by Day 90" },
      { point: "Agent Network Flywheel", detail: "Tiered agent onboarding (WhatsApp → listing → leads → upgrade): each agent brings 10-20 listings, creating a supply flywheel. Target: 100 agents, 3,000 listings by Day 90" },
      { point: "Strategic Partnerships", detail: "Developer bulk listings, bank mortgage integration, media co-marketing — partnerships reduce CAC by 70% and accelerate city launches" },
    ],
    visualSuggestion: "Flywheel diagram showing how each channel feeds the others. Growth metrics chart showing projected hockey stick trajectory.",
    duration: "2 minutes",
  },
  {
    slideNumber: 6, title: "Traction & Milestones", subtitle: "Proof Points That Matter", emoji: "📈",
    icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "We're not pitching a concept — we've built a production platform with real features, real data, and a clear path to market. Here's what we've accomplished and what's next.",
    keyPoints: [
      { point: "Platform Built & Live", detail: "Full marketplace with AI intelligence stack deployed — property listings, investment scoring, agent tools, admin command center, all production-ready" },
      { point: "AI Intelligence Operational", detail: "6-layer AI stack active: valuations, deal scoring, market forecasting, behavioral recommendations, autonomous deal hunting — all running in production" },
      { point: "SEO Foundation Deployed", detail: "National SEO location content system covering 15 cities with programmatic page generation — ready for organic traffic scaling" },
      { point: "Growth Playbooks Defined", detail: "13-week execution plans for agent acquisition, supply expansion, viral content, investor funnel, partnerships, and brand authority — ready to execute with funding" },
    ],
    visualSuggestion: "Timeline showing milestones achieved (left) and planned milestones (right). Screenshots of live platform features as proof.",
    duration: "2 minutes",
  },
  {
    slideNumber: 7, title: "Revenue Model", subtitle: "5 Revenue Streams, Rp 2.3B/mo by Month 12", emoji: "💰",
    icon: DollarSign, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "We have 5 complementary revenue streams that activate progressively. No single stream dominates, creating a diversified and resilient business model with 82% gross margins.",
    keyPoints: [
      { point: "Listing Promotion (17%)", detail: "Featured placement (Rp 250K), AI Visibility Boost (Rp 500K), Project Spotlight (Rp 5M/mo) — Rp 400M/mo by Month 12" },
      { point: "Agent SaaS (26%)", detail: "Agent Pro (Rp 1.5M/mo), Agency Enterprise (Rp 8M/mo) — AI leads, CRM, analytics — Rp 600M/mo by Month 12" },
      { point: "Investor Intelligence (15%)", detail: "Pro (Rp 500K/mo), Diamond (Rp 2M/mo) — AI scores, forecasts, early deal access — Rp 350M/mo by Month 12" },
      { point: "Transaction Fees (22%)", detail: "1-2% success fee, mortgage referrals (Rp 500K-2M each), value-added services — Rp 500M/mo by Month 12" },
      { point: "Ecosystem B2B (20%)", detail: "Data licensing (Rp 50-200M/quarter), developer marketing (Rp 20-100M/project), institutional analytics — Rp 450M/mo by Month 12" },
    ],
    visualSuggestion: "Revenue waterfall chart Month 3 → 6 → 12. Pie chart showing stream diversification. Unit economics table: CAC Rp 85K, LTV Rp 4.2M, 49:1 ratio.",
    duration: "2 minutes",
  },
  {
    slideNumber: 8, title: "Competitive Landscape", subtitle: "Intelligence Layer vs. Listing Portals", emoji: "🏆",
    icon: Award, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "Every competitor is a listing portal. We're an intelligence platform that happens to have listings. It's like comparing Google Maps to a paper map — same category, completely different product.",
    keyPoints: [
      { point: "Rumah123 / 99.co / OLX", detail: "Listing-only portals: search, filter, contact — no AI intelligence, no investment analysis, no predictive features. They sell ads; we sell intelligence." },
      { point: "Our Advantage: Data Compounding", detail: "Every user interaction makes our AI smarter — more data → better predictions → more users → more data. Competitors can't replicate this without rebuilding from scratch." },
      { point: "Defensibility: 6-Layer Stack", detail: "Replicating our AI stack requires 12-18 months of engineering + massive data acquisition. By then, our data advantage is 2 years ahead." },
      { point: "Category Creation", detail: "We're not competing for 'best listing site' — we're creating 'Property Intelligence' as a new category where we're the first mover and category definer." },
    ],
    visualSuggestion: "2x2 matrix: X-axis = Listing Quality, Y-axis = Intelligence Depth. Competitors clustered bottom-right (good listings, no intelligence). We're top-right (both).",
    duration: "2 minutes",
  },
  {
    slideNumber: 9, title: "Team", subtitle: "Built to Win This Market", emoji: "👥",
    icon: Users, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    speakerNotes: "We have the unique combination of deep property industry knowledge, AI/ML engineering expertise, and marketplace scaling experience needed to execute this vision.",
    keyPoints: [
      { point: "Founder/CEO", detail: "Property industry veteran with deep market knowledge, network across developers, agents, and banking partners — understands the ecosystem from inside" },
      { point: "Technical Architecture", detail: "Full-stack AI platform built with modern stack (React, Supabase, Edge Functions) — designed for scale from day one with sub-800ms AI response times" },
      { point: "Growth Expertise", detail: "SEO, viral content, partnership, and community growth playbooks already designed and ready to execute — not theoretical, execution-ready" },
      { point: "Key Hires Planned", detail: "Seed funding enables: Head of AI/ML, Head of Growth, Head of Sales, 3 engineers — team scales to 15 within 6 months" },
    ],
    visualSuggestion: "Team photo grid with name, role, and key credential. Org chart showing current team and planned hires with funding.",
    duration: "1.5 minutes",
  },
  {
    slideNumber: 10, title: "The Ask", subtitle: "Seed Round — Fuel the Flywheel", emoji: "🎯",
    icon: Target, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    speakerNotes: "We're raising seed to turn our built product into a growth machine. The platform is ready — we need fuel for the flywheel. Every dollar goes directly into user acquisition, team expansion, and market capture.",
    keyPoints: [
      { point: "Raising: $1.5-2M Seed Round", detail: "Pre-money valuation: $8-10M based on product completeness, market opportunity, and execution readiness — comparable to Series A stage product at seed pricing" },
      { point: "Use of Funds: Team (40%)", detail: "6 key hires: Head of AI/ML, Head of Growth, Head of Sales, 3 engineers — the team to scale from 0 to 1,000 paying customers" },
      { point: "Use of Funds: Growth (35%)", detail: "SEO content scaling, social media production, Google/Meta ads, agent acquisition campaigns, partnership development — 12-month growth runway" },
      { point: "Use of Funds: Product (25%)", detail: "AI model improvements, mobile app development, API infrastructure for partners, enterprise features — technical moat deepening" },
    ],
    visualSuggestion: "Pie chart of fund allocation. Timeline showing 18-month runway to Series A milestones. Clear milestone table for what investors get.",
    duration: "2 minutes",
  },
  {
    slideNumber: 11, title: "Vision", subtitle: "National Property Intelligence Infrastructure", emoji: "🌟",
    icon: Crown, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    speakerNotes: "Close with the big vision. We're not building a property website. We're building the intelligence infrastructure that every property transaction in Indonesia flows through. Think Bloomberg Terminal for property — but accessible to everyone.",
    keyPoints: [
      { point: "Year 1: National Data Authority", detail: "Become the most-cited property data source in Indonesia — ASTRA Price Index referenced by banks, media, and government" },
      { point: "Year 2: Platform Dominance", detail: "10,000+ agent network, 50,000+ listings, 500,000+ monthly users — the default platform for property intelligence" },
      { point: "Year 3: Regional Expansion", detail: "Expand AI intelligence model to Malaysia, Thailand, Vietnam, Philippines — same playbook, adapted to each market's data landscape" },
      { point: "Year 5: Category Winner", detail: "$100M+ ARR, IPO-ready, the 'Bloomberg of Asian Property' — institutional-grade intelligence for every property participant" },
    ],
    visualSuggestion: "Southeast Asia map showing expansion trajectory. Revenue growth chart Year 1-5. Final slide: 'The future of property is intelligent. We're building it.'",
    duration: "2 minutes",
  },
];

// ── Appendix Items ──

const appendixItems = [
  { title: "Financial Projections (5-Year)", items: ["Year 1: Rp 15B revenue, -Rp 8B net (investment phase)", "Year 2: Rp 65B revenue, breakeven", "Year 3: Rp 180B revenue, Rp 45B EBITDA", "Year 5: Rp 500B+ revenue, 30% EBITDA margin"] },
  { title: "Key Assumptions", items: ["15% month-over-month listing growth after seed funding", "25% agent Pro conversion rate by Month 6", "15% investor premium conversion rate", "Average transaction value: Rp 1.5B", "Blended take rate: 1.5% across all revenue streams"] },
  { title: "Risk Factors & Mitigation", items: ["Market risk: diversified across 15 cities, no single-city dependency", "Competition: 18-month AI stack advantage, data moat compounds", "Regulatory: proactive compliance, legal advisory on all data handling", "Execution: proven playbooks, staged rollout reduces risk"] },
  { title: "Comparable Exits & Valuations", items: ["PropertyGuru (SGX): $1.8B at IPO — listing portal, no AI intelligence", "Zillow (US): $10B+ — AI-powered (Zestimate) property platform", "REA Group (AU): $15B — data-driven property marketplace", "Our opportunity: PropertyGuru's market position + Zillow's AI intelligence in the world's 4th largest population"] },
];

// ── Components ──

function SlideCard({ slide }: { slide: PitchSlide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = slide.icon;

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
          {/* Speaker Notes */}
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <span className="text-[8px] text-primary font-bold block mb-1">🎤 Speaker Notes</span>
            <p className="text-[9px] text-foreground italic leading-relaxed">{slide.speakerNotes}</p>
          </div>

          {/* Key Points */}
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

          {/* Visual Suggestion */}
          <div className="p-2 rounded-lg bg-chart-4/5 border border-chart-4/20">
            <span className="text-[8px] text-chart-4 font-bold block mb-0.5">🎨 Visual Design</span>
            <p className="text-[8px] text-muted-foreground">{slide.visualSuggestion}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function PitchFlowOverview() {
  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Pitch Flow — 22 Minutes Total
        </CardTitle>
        <CardDescription className="text-[10px]">Narrative arc: Problem → Solution → Market → Product → Growth → Traction → Revenue → Competition → Team → Ask → Vision</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center gap-1 flex-wrap">
          {pitchSlides.map((slide, i) => (
            <React.Fragment key={slide.slideNumber}>
              <div className={cn("p-1.5 rounded-lg border text-center min-w-[70px]", slide.bg, slide.border)}>
                <span className={cn("text-[8px] font-bold block", slide.color)}>{slide.emoji} #{slide.slideNumber}</span>
                <span className="text-[7px] text-foreground block">{slide.title}</span>
                <span className="text-[6px] text-muted-foreground">{slide.duration}</span>
              </div>
              {i < pitchSlides.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorFAQ() {
  const faqs = [
    { q: "What's your unfair advantage?", a: "6-layer AI intelligence stack that takes 18+ months to replicate. Every user interaction makes our predictions more accurate — data network effect that compounds daily." },
    { q: "Why not just add AI to existing portals?", a: "AI intelligence requires rebuilding the entire data architecture from the ground up. Existing portals have 10+ years of technical debt in listing-only schemas. We're AI-native — built for intelligence, not bolted on." },
    { q: "How do you acquire supply in a marketplace?", a: "Agent onboarding via WhatsApp at near-zero CAC (each agent brings 10-20 listings), developer partnerships for bulk inventory (50-200 units per deal), and owner self-listing campaigns on social media." },
    { q: "What's your path to profitability?", a: "82% gross margins from Month 1. Breakeven at Rp 1.5B/mo MRR (Month 8-10 target). 5 diversified revenue streams ensure no single-point-of-failure. LTV:CAC ratio of 49:1 gives massive reinvestment capacity." },
    { q: "Why Indonesia specifically?", a: "4th largest population, $200B property market, <5% digital penetration in property transactions. No AI-powered competitor exists. First-mover advantage in a market that's 5-10 years behind US/AU in PropTech maturity." },
    { q: "How defensible is the business long-term?", a: "3 moats: (1) Data moat — more transactions = better AI = more users. (2) Brand moat — ASTRA Price Index becomes industry reference standard. (3) Network moat — agents + developers + banks create multi-sided lock-in." },
  ];

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Shield className="h-4 w-4 text-chart-3" /> Investor FAQ — Anticipated Questions
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

function DealTermsCard() {
  const terms = [
    { label: "Round", value: "Seed" },
    { label: "Raising", value: "$1.5-2M" },
    { label: "Pre-Money Valuation", value: "$8-10M" },
    { label: "Instrument", value: "Priced Equity / SAFE" },
    { label: "Use of Funds", value: "40% Team, 35% Growth, 25% Product" },
    { label: "Runway", value: "18 months to Series A" },
    { label: "Series A Target", value: "Month 15-18, $8-12M raise" },
    { label: "Series A Milestones", value: "Rp 2B MRR, 50K MAU, 15 cities" },
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

// ── Main Dashboard ──

const InvestorPitchDashboard = React.memo(function InvestorPitchDashboard() {
  return (
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
                Seed round pitch narrative — 11 slides, 22 minutes, structured for Series A-ready storytelling
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              🎯 $1.5-2M Seed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Slides", value: "11", icon: Layers, color: "text-primary" },
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
          {pitchSlides.map((slide) => <SlideCard key={slide.slideNumber} slide={slide} />)}
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
  );
});

export default InvestorPitchDashboard;
