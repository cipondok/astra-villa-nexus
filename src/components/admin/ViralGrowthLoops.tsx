import React, { useState } from "react";
import { Share2, Users, Zap, TrendingUp, Copy, Check, ChevronDown, ChevronUp, Target, Clock, BarChart3, Repeat, Gift, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── types ───────── */

interface ViralLoop {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  mechanism: string;
  psychology: string;
  growthImpact: number;
  networkEffect: number;
  complexity: number;
  priorityScore: number;
  steps: string[];
  kpis: { metric: string; target: string }[];
  liquidityImpact: string;
  timeline: string;
}

/* ───────── data ───────── */

const loops: ViralLoop[] = [
  {
    id: "deal-unlock-referral",
    title: "Deal Unlock Referral Gate",
    category: "buyer-referral",
    icon: <Gift className="h-5 w-5" />,
    mechanism: "Investors earn free deal unlocks by referring other qualified investors. Each successful referral (sign-up + first inquiry) grants 1 premium deal unlock credit worth Rp 99K.",
    psychology: "Loss aversion + reciprocity: investors who've already found value want to unlock more deals without paying. Social currency of sharing 'insider' access.",
    growthImpact: 92,
    networkEffect: 88,
    complexity: 35,
    priorityScore: 95,
    steps: [
      "Add 'Invite & Unlock' button to deal detail pages and investor dashboard",
      "Generate unique referral links with UTM tracking per investor",
      "Track referral sign-up → first inquiry conversion funnel",
      "Auto-credit deal unlock to referrer on qualification trigger",
      "Send push notification to referrer: 'Your friend just joined — deal unlocked!'",
      "Display referral leaderboard in investor community section",
    ],
    kpis: [
      { metric: "Referral conversion rate", target: ">18% sign-up from shared link" },
      { metric: "K-factor", target: ">0.35 (each user brings 0.35 new users)" },
      { metric: "Referred user activation", target: ">60% make inquiry within 48hrs" },
      { metric: "Cost per referred user", target: "<Rp 25K (vs Rp 95K blended CAC)" },
    ],
    liquidityImpact: "Each referred investor adds ~3.2 inquiries/month, directly increasing listing engagement velocity and vendor satisfaction scores.",
    timeline: "Week 1-2 build → Week 3 soft launch → Week 4-6 optimize",
  },
  {
    id: "vendor-showcase-loop",
    title: "Vendor Success Showcase Loop",
    category: "vendor-social",
    icon: <Eye className="h-5 w-5" />,
    mechanism: "Auto-generate shareable 'performance cards' for vendors showing their inquiry count, response rating, and deals closed on ASTRA. Vendors share these as social proof on Instagram/WhatsApp to attract more clients.",
    psychology: "Status signaling + competitive benchmarking: vendors want to showcase success. Their audience (property seekers) discovers ASTRA through vendor's social channels.",
    growthImpact: 78,
    networkEffect: 82,
    complexity: 30,
    priorityScore: 88,
    steps: [
      "Design branded performance card template (inquiry count, rating, badge tier)",
      "Auto-generate card monthly for vendors with >10 inquiries received",
      "Add 'Share My Results' button with pre-formatted WhatsApp/Instagram story export",
      "Include ASTRA branded watermark with QR code linking to vendor's listings",
      "Track shares and downstream sign-ups via QR code scans",
      "Gamify with 'Most Shared Agent' monthly recognition badge",
    ],
    kpis: [
      { metric: "Vendor share rate", target: ">40% of eligible vendors share monthly" },
      { metric: "QR code scan-to-signup", target: ">12% conversion" },
      { metric: "Organic impressions per share", target: ">200 views avg" },
      { metric: "New vendor sign-ups from showcase", target: ">15% of new vendors monthly" },
    ],
    liquidityImpact: "Each vendor share exposes ASTRA to their network (avg 500-2K followers), driving both demand-side traffic and competitive vendor sign-ups.",
    timeline: "Week 1 design → Week 2-3 build → Week 4 launch",
  },
  {
    id: "scarcity-invite",
    title: "Urgency-Driven Invite System",
    category: "urgency-invite",
    icon: <Zap className="h-5 w-5" />,
    mechanism: "When a high-demand listing receives >20 inquiries, trigger 'Hot Deal Alert' that existing investors can share with friends. Shared link grants 24hr priority viewing access before public availability.",
    psychology: "Scarcity + exclusivity + FOMO: recipients feel they're getting insider access to a limited opportunity. Time pressure drives immediate action.",
    growthImpact: 85,
    networkEffect: 75,
    complexity: 45,
    priorityScore: 82,
    steps: [
      "Define 'hot deal' threshold trigger (>20 inquiries in 48hrs or >5 viewing requests)",
      "Push 'Hot Deal Alert' notification to investors who viewed similar properties",
      "Include 'Share with a friend for priority access' CTA in alert",
      "Generate time-limited invite link (24hr expiry) with priority queue position",
      "Track invite acceptance, sign-up, and inquiry conversion",
      "After 24hrs, release listing to general availability with social proof counter",
    ],
    kpis: [
      { metric: "Alert-to-share rate", target: ">25% of alerted investors share" },
      { metric: "Invite link activation", target: ">35% click-through rate" },
      { metric: "Priority user conversion", target: ">50% make inquiry within 24hrs" },
      { metric: "Viral coefficient per hot deal", target: ">1.5 new users per event" },
    ],
    liquidityImpact: "Hot deal events create concentrated demand spikes that validate vendor listing value and attract new supply from competing platforms.",
    timeline: "Week 2-3 build → Week 4 test with 5 listings → Week 5-6 automate",
  },
  {
    id: "market-insight-content",
    title: "Market Insight Content Flywheel",
    category: "content-organic",
    icon: <BarChart3 className="h-5 w-5" />,
    mechanism: "Auto-generate district-level market insight reports (price trends, demand velocity, yield estimates) from platform data. Publish as shareable content with gated deep-dive access requiring sign-up.",
    psychology: "Information asymmetry reduction: investors and vendors crave local market data. Free surface-level insights build trust; gated deep-dive creates sign-up motivation.",
    growthImpact: 72,
    networkEffect: 68,
    complexity: 50,
    priorityScore: 70,
    steps: [
      "Build automated data aggregation for district-level price and demand trends",
      "Design shareable infographic template with key metrics and ASTRA branding",
      "Publish weekly on social media with SEO-optimized blog post version",
      "Gate detailed analysis (price predictions, yield projections) behind free account",
      "Enable social sharing with pre-written captions for each platform",
      "Track content attribution through sign-up funnel",
    ],
    kpis: [
      { metric: "Content reach per post", target: ">5K organic impressions" },
      { metric: "Content-to-signup conversion", target: ">4% of readers create account" },
      { metric: "SEO traffic growth", target: ">20% MoM organic search increase" },
      { metric: "Content share rate", target: ">8% of viewers share" },
    ],
    liquidityImpact: "SEO-driven content creates compounding organic traffic. Each report positions ASTRA as the data authority, attracting both investors seeking insights and vendors seeking exposure.",
    timeline: "Week 1-2 data pipeline → Week 3-4 design → Week 5+ weekly publishing",
  },
  {
    id: "social-proof-listing",
    title: "Live Social Proof on Listings",
    category: "buyer-referral",
    icon: <Users className="h-5 w-5" />,
    mechanism: "Display real-time engagement signals on listing pages: '12 investors viewed today', '3 viewing requests this week', 'Similar property sold in 14 days'. Add 'Share this opportunity' with pre-populated message.",
    psychology: "Social proof + urgency: seeing others interested validates the opportunity. Sharing becomes natural when an investor wants to discuss a deal with their network.",
    growthImpact: 68,
    networkEffect: 72,
    complexity: 25,
    priorityScore: 78,
    steps: [
      "Add real-time view counter and inquiry activity badge to listing cards",
      "Display 'X investors viewing now' on property detail pages",
      "Add floating 'Share this deal' button with WhatsApp/Telegram/Email options",
      "Pre-populate share message: 'Check out this property on ASTRA — [X] investors already interested'",
      "Track shared link clicks and downstream sign-ups",
      "A/B test social proof messaging variants for conversion optimization",
    ],
    kpis: [
      { metric: "Share button click rate", target: ">5% of listing viewers" },
      { metric: "Shared link conversion", target: ">15% click-to-signup" },
      { metric: "Listing inquiry uplift", target: ">20% more inquiries on social-proof listings" },
      { metric: "Time-to-first-inquiry reduction", target: ">30% faster" },
    ],
    liquidityImpact: "Social proof signals accelerate listing conversion velocity, reducing time-on-market for vendors and increasing platform transaction throughput.",
    timeline: "Week 1 build → Week 2 A/B test → Week 3 full rollout",
  },
  {
    id: "vendor-referral-chain",
    title: "Vendor-to-Vendor Referral Chain",
    category: "vendor-social",
    icon: <Repeat className="h-5 w-5" />,
    mechanism: "Vendors who refer other vendors receive commission boosts or priority placement. Creates a self-expanding supply network where successful vendors recruit peers.",
    psychology: "Financial incentive + professional network leverage: agents and brokers naturally know other agents. Monetary reward + status recognition for top recruiters.",
    growthImpact: 80,
    networkEffect: 90,
    complexity: 40,
    priorityScore: 85,
    steps: [
      "Create vendor referral program with tiered rewards (1 referral = 10% boost discount, 3 = free month premium, 5 = Ambassador badge)",
      "Build referral tracking dashboard in vendor panel",
      "Auto-send onboarding support to referred vendors with referrer's name as social proof",
      "Display 'Referred by [Agent Name]' badge on new vendor's profile",
      "Monthly recognition for top vendor recruiters in community feed",
      "Track referred vendor activation rate and listing quality scores",
    ],
    kpis: [
      { metric: "Vendor referral participation", target: ">20% of active vendors refer at least 1" },
      { metric: "Referred vendor activation", target: ">70% list within 7 days" },
      { metric: "Supply growth from referrals", target: ">25% of new vendor sign-ups" },
      { metric: "Referred vendor retention (90-day)", target: ">65%" },
    ],
    liquidityImpact: "Self-expanding supply network reduces vendor acquisition cost and improves listing quality through peer trust and accountability.",
    timeline: "Week 1-2 program design → Week 3 build → Week 4 launch with top 50 vendors",
  },
  {
    id: "watchlist-fomo",
    title: "Watchlist FOMO Notifications",
    category: "urgency-invite",
    icon: <MessageSquare className="h-5 w-5" />,
    mechanism: "When a watchlisted property gets a price change, new viewing, or competing offer, notify the watcher with shareable urgency message: 'Your watchlisted property just got 3 new inquiries — share with your advisor?'",
    psychology: "Loss aversion + decision urgency: investors who've shown interest fear missing out. Sharing with advisors/partners creates new platform users organically.",
    growthImpact: 65,
    networkEffect: 60,
    complexity: 30,
    priorityScore: 68,
    steps: [
      "Trigger notifications on watchlist property events (price drop, new inquiry spike, viewing scheduled)",
      "Include 'Share with your advisor/partner' CTA in notification",
      "Pre-populate message with property summary and urgency framing",
      "Track advisor/partner sign-ups attributed to watchlist shares",
      "Personalize notification intensity based on investor engagement history",
      "Add 'Investment Circle' feature — invite trusted contacts to co-evaluate deals",
    ],
    kpis: [
      { metric: "Watchlist notification open rate", target: ">45%" },
      { metric: "Share-with-advisor click rate", target: ">12%" },
      { metric: "Advisor sign-up conversion", target: ">20% from shared links" },
      { metric: "Watchlist-to-inquiry conversion uplift", target: ">15%" },
    ],
    liquidityImpact: "Converts passive watchlist behavior into active engagement and new user acquisition through natural decision-making workflows.",
    timeline: "Week 1 notification logic → Week 2 share mechanics → Week 3 launch",
  },
  {
    id: "milestone-celebration",
    title: "Milestone Celebration Shares",
    category: "content-organic",
    icon: <Target className="h-5 w-5" />,
    mechanism: "Celebrate platform milestones with users: '1,000th listing added!', 'You've viewed 50 properties — here's your investment profile summary'. Generate shareable achievement cards.",
    psychology: "Identity reinforcement + achievement signaling: users want to share milestones that make them look like serious investors or successful agents.",
    growthImpact: 55,
    networkEffect: 58,
    complexity: 20,
    priorityScore: 62,
    steps: [
      "Define user milestone triggers (10th login, 50th property view, first inquiry, first deal)",
      "Design achievement card templates with personalized stats",
      "Auto-generate and push to user with 'Share your journey' CTA",
      "Include ASTRA-branded card with sign-up link for recipients",
      "Track milestone share rates and downstream conversions",
      "Create platform-wide milestone celebrations (1K listings, 500 investors) as community events",
    ],
    kpis: [
      { metric: "Milestone card generation rate", target: ">80% of eligible users" },
      { metric: "Milestone share rate", target: ">15% of recipients share" },
      { metric: "Downstream sign-ups per share", target: ">0.3 new users" },
      { metric: "User retention uplift (milestone users)", target: ">25% higher 30-day retention" },
    ],
    liquidityImpact: "Milestone celebrations increase user emotional investment in the platform, reducing churn while creating organic brand awareness through social sharing.",
    timeline: "Week 1 design → Week 2 build → Week 3 launch first 5 milestones",
  },
];

const categories = [
  { id: "all", label: "All Loops" },
  { id: "buyer-referral", label: "Buyer Referral" },
  { id: "vendor-social", label: "Vendor Social" },
  { id: "urgency-invite", label: "Urgency Invite" },
  { id: "content-organic", label: "Content Organic" },
];

const sortedLoops = [...loops].sort((a, b) => b.priorityScore - a.priorityScore);

/* ───────── component ───────── */

const ViralGrowthLoops: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedLoop, setExpandedLoop] = useState<string | null>(sortedLoops[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = activeCategory === "all" ? sortedLoops : sortedLoops.filter(l => l.category === activeCategory);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggle = (id: string) => setExpandedLoop(prev => (prev === id ? null : id));

  const scoreColor = (v: number) => {
    if (v >= 80) return "text-green-600 dark:text-green-400";
    if (v >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Viral Growth Loops"
        description="8 structured viral mechanics prioritized by growth impact, network effect strength & implementation complexity"
        icon={Share2}
        badge={{ text: "🔄 Viral", variant: "outline" }}
      />

      {/* Priority Overview */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Prioritized Loop Ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedLoops.map((loop, i) => (
            <div
              key={loop.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-[6px] p-2 transition-colors"
              onClick={() => { setExpandedLoop(loop.id); setActiveCategory("all"); }}
            >
              <span className="text-xs font-bold text-muted-foreground w-5 text-right">#{i + 1}</span>
              <div className="h-7 w-7 rounded-[6px] bg-primary/10 flex items-center justify-center shrink-0">{loop.icon}</div>
              <span className="text-sm font-medium text-foreground flex-1 truncate">{loop.title}</span>
              <div className="hidden md:flex items-center gap-4 text-xs">
                <span className={scoreColor(loop.growthImpact)}>Growth {loop.growthImpact}</span>
                <span className={scoreColor(loop.networkEffect)}>Network {loop.networkEffect}</span>
                <span className={scoreColor(100 - loop.complexity)}>Easy {100 - loop.complexity}</span>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">{loop.priorityScore}pts</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="text-xs"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Loop Cards */}
      {filtered.map(loop => (
        <Card key={loop.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => toggle(loop.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{loop.icon}</div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{loop.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <Clock className="h-3 w-3" />{loop.timeline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{loop.priorityScore}pts</Badge>
                {expandedLoop === loop.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          </CardHeader>

          {expandedLoop === loop.id && (
            <CardContent className="space-y-5 pt-0">
              {/* Score Bars */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Growth Impact", value: loop.growthImpact },
                  { label: "Network Effect", value: loop.networkEffect },
                  { label: "Ease of Build", value: 100 - loop.complexity },
                ].map(s => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{s.label}</span><span className={scoreColor(s.value)}>{s.value}%</span>
                    </div>
                    <Progress value={s.value} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Mechanism & Psychology */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                  <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" />Mechanism</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{loop.mechanism}</p>
                </div>
                <div className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                  <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />Psychology</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{loop.psychology}</p>
                </div>
              </div>

              {/* Execution Steps */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-2">Execution Steps</h5>
                <div className="space-y-1.5">
                  {loop.steps.map((step, i) => {
                    const stepId = `${loop.id}-step-${i}`;
                    return (
                      <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-2 group">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-xs text-muted-foreground flex-1">{step}</p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copyText(step, stepId)}>
                          {copiedId === stepId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KPIs & Liquidity Impact */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Target className="h-4 w-4 text-primary" />Success KPIs</h5>
                  {loop.kpis.map((kpi, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 rounded-[6px] border border-border p-2">
                      <span className="text-xs text-muted-foreground">{kpi.metric}</span>
                      <Badge variant="secondary" className="text-[10px] shrink-0">{kpi.target}</Badge>
                    </div>
                  ))}
                </div>
                <div className="rounded-[6px] border border-border bg-primary/5 p-3 space-y-1.5">
                  <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary" />Liquidity Impact</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{loop.liquidityImpact}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ViralGrowthLoops;
