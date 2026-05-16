import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FlaskConical, Zap, TrendingUp, Users, DollarSign,
  Clock, AlertTriangle, CheckCircle, ArrowUpRight,
  Target, Megaphone, Gift, Brain, Share2, BarChart3,
  ChevronDown, ChevronUp, Sparkles, Shield
} from "lucide-react";
import { motion } from "framer-motion";

type Category = "demand" | "vendor" | "pricing" | "urgency" | "ai-ranking" | "referral";
type Priority = "fastest-revenue" | "highest-liquidity" | "lowest-complexity";
type Risk = "low" | "medium" | "high";

interface Experiment {
  id: string;
  category: Category;
  title: string;
  hypothesis: string;
  steps: string[];
  expectedImpact: string;
  metrics: string[];
  risk: Risk;
  duration: string;
  revenueScore: number;
  liquidityScore: number;
  complexityScore: number; // lower = simpler
}

const categoryMeta: Record<Category, { label: string; icon: React.ElementType; color: string }> = {
  demand: { label: "Demand Generation", icon: Megaphone, color: "text-primary" },
  vendor: { label: "Vendor Onboarding", icon: Users, color: "text-emerald-500" },
  pricing: { label: "Pricing Psychology", icon: DollarSign, color: "text-amber-400" },
  urgency: { label: "Urgency Messaging", icon: Clock, color: "text-destructive" },
  "ai-ranking": { label: "AI Ranking Logic", icon: Brain, color: "text-cyan-400" },
  referral: { label: "Network Effects", icon: Share2, color: "text-violet-400" },
};

const riskColors: Record<Risk, string> = {
  low: "bg-emerald-500/15 text-emerald-500",
  medium: "bg-amber-500/15 text-amber-400",
  high: "bg-destructive/15 text-destructive",
};

const experiments: Experiment[] = [
  {
    id: "E01", category: "pricing", title: "Anchor Pricing on Boost Packages",
    hypothesis: "Showing a crossed-out 'original' price next to the boost fee will increase purchase rate by 20-35% through anchoring bias.",
    steps: ["Add visual anchor price (2x actual) to boost purchase modal", "A/B test 50/50 split on boost checkout page", "Track conversion rate and revenue per impression"],
    expectedImpact: "+25% boost purchase conversion → +Rp 15M/month revenue",
    metrics: ["Boost purchase rate", "Revenue per boost impression", "Average boost tier selected"],
    risk: "low", duration: "7 days", revenueScore: 9, liquidityScore: 4, complexityScore: 2,
  },
  {
    id: "E02", category: "urgency", title: "Live Viewer Count on Listings",
    hypothesis: "Displaying '{{X}} people viewing now' on listing pages will increase inquiry rate by 15-25% through social proof and urgency.",
    steps: ["Track active sessions per listing (5-min window)", "Display viewer count badge on listings with ≥3 viewers", "A/B test badge visibility vs control"],
    expectedImpact: "+20% inquiry rate on high-traffic listings",
    metrics: ["Inquiry rate per listing view", "Time-to-inquiry", "Bounce rate on listing pages"],
    risk: "low", duration: "10 days", revenueScore: 6, liquidityScore: 8, complexityScore: 3,
  },
  {
    id: "E03", category: "vendor", title: "72-Hour Activation Sprint",
    hypothesis: "Giving new vendors a 72-hour countdown to list their first property (with a free boost reward) will increase activation rate from 40% to 65%.",
    steps: ["Trigger countdown timer on vendor dashboard post-signup", "Award 1 free boost credit upon first listing within 72h", "Send reminder notifications at 24h and 48h"],
    expectedImpact: "+25pp vendor activation rate → +150 active listings/month",
    metrics: ["First-listing activation rate", "Time-to-first-listing", "Boost credit redemption rate"],
    risk: "low", duration: "14 days", revenueScore: 5, liquidityScore: 9, complexityScore: 3,
  },
  {
    id: "E04", category: "demand", title: "Investor Deal Alert Drip Sequence",
    hypothesis: "A 5-email drip sequence showing curated deals matched to investor preferences will convert 8-12% of inactive investors into active inquirers.",
    steps: ["Segment investors by saved search criteria and budget range", "Generate personalized deal batches using AI matching scores", "Deploy 5-email sequence over 14 days with escalating urgency", "Track open → click → inquiry → unlock conversion funnel"],
    expectedImpact: "+10% reactivation of dormant investors → +80 monthly inquiries",
    metrics: ["Email open rate", "Click-to-inquiry rate", "Investor reactivation rate", "Deal unlock conversions"],
    risk: "low", duration: "14 days", revenueScore: 7, liquidityScore: 7, complexityScore: 4,
  },
  {
    id: "E05", category: "pricing", title: "Decoy Tier on Vendor Subscriptions",
    hypothesis: "Adding a 'Professional' tier priced 15% below 'Premium' with 40% fewer features will push 30% of Basic subscribers to choose Premium (decoy effect).",
    steps: ["Design 3-tier pricing card: Basic / Professional / Premium", "Position Professional as intentionally inferior value vs Premium", "Track tier selection distribution over 21 days"],
    expectedImpact: "+30% Premium tier selection → +Rp 25M/month subscription revenue",
    metrics: ["Tier selection distribution", "ARPU change", "Subscription churn by tier"],
    risk: "medium", duration: "21 days", revenueScore: 9, liquidityScore: 3, complexityScore: 3,
  },
  {
    id: "E06", category: "ai-ranking", title: "Demand-Weighted Listing Ranking",
    hypothesis: "Ranking listings by real-time demand signals (search frequency × save rate × inquiry velocity) instead of recency will increase overall platform inquiry rate by 18%.",
    steps: ["Build composite demand score: 40% search match + 30% save rate + 30% inquiry velocity", "Replace chronological sort with demand-weighted ranking as default", "A/B test new ranking vs current for 14 days"],
    expectedImpact: "+18% platform-wide inquiry rate → faster deal velocity",
    metrics: ["Inquiry rate per listing impression", "Average position of inquired listings", "Listing views distribution (Gini coefficient)"],
    risk: "medium", duration: "14 days", revenueScore: 6, liquidityScore: 9, complexityScore: 6,
  },
  {
    id: "E07", category: "urgency", title: "Scarcity Countdown on Premium Listings",
    hypothesis: "Adding 'Only available for X more days' countdown on premium/boosted listings will increase inquiry urgency by 25-40%.",
    steps: ["Add configurable expiry timer to boosted listing cards", "Display countdown badge with animated pulse", "Test 7-day vs 14-day countdown duration"],
    expectedImpact: "+30% inquiry rate on boosted listings → higher boost ROI perception",
    metrics: ["Inquiry rate on countdown listings vs control", "Time-to-first-inquiry", "Boost renewal rate"],
    risk: "low", duration: "10 days", revenueScore: 7, liquidityScore: 6, complexityScore: 2,
  },
  {
    id: "E08", category: "referral", title: "Agent-to-Agent Referral Loop",
    hypothesis: "Offering agents Rp 500K credit for each new agent they refer (who lists ≥3 properties) will create viral vendor growth at 60% lower CAC than paid acquisition.",
    steps: ["Build referral code system for agents", "Credit referrer upon referee's 3rd listing", "Add referral leaderboard to agent dashboard", "Cap at 10 referrals per agent per month"],
    expectedImpact: "+40 new active agents/month at 60% lower CAC",
    metrics: ["Referral conversion rate", "Referred agent activation rate", "CAC comparison vs paid channels", "Viral coefficient (K-factor)"],
    risk: "medium", duration: "30 days", revenueScore: 5, liquidityScore: 8, complexityScore: 5,
  },
  {
    id: "E09", category: "demand", title: "Geo-Targeted Instagram Micro-Campaigns",
    hypothesis: "Running hyper-local Instagram ads (3km radius around high-inventory districts) will deliver investor leads at Rp 35K CPA — 50% below current blended CPA.",
    steps: ["Identify top 5 districts by listing density", "Create district-specific ad creatives featuring top 3 listings", "Run 7-day campaigns with Rp 2M budget per district", "Track signup → inquiry → unlock funnel"],
    expectedImpact: "+200 qualified investor leads at 50% lower CPA",
    metrics: ["CPA per district", "Lead-to-inquiry conversion", "Cost per inquiry", "District-level demand lift"],
    risk: "medium", duration: "7 days", revenueScore: 7, liquidityScore: 7, complexityScore: 4,
  },
  {
    id: "E10", category: "pricing", title: "Flash Unlock Discount Windows",
    hypothesis: "Offering 30% discount on deal unlocks during a 2-hour daily window (2-4pm) will increase daily unlock volume by 40% while training habitual usage.",
    steps: ["Schedule daily flash discount from 2-4pm", "Display countdown banner across investor dashboard", "Push notification at 1:55pm to active investors", "Compare revenue: higher volume × lower price vs baseline"],
    expectedImpact: "+40% unlock volume during window → net +15% daily unlock revenue",
    metrics: ["Unlock volume during window vs baseline", "Total daily unlock revenue", "Repeat purchase rate", "Session timing shift"],
    risk: "medium", duration: "14 days", revenueScore: 8, liquidityScore: 5, complexityScore: 4,
  },
  {
    id: "E11", category: "ai-ranking", title: "Vendor-Buyer Match Confidence Display",
    hypothesis: "Showing a visible 'Match Score: 92%' badge on listings that align with buyer search patterns will increase click-through by 20% and inquiry by 15%.",
    steps: ["Calculate match score from buyer profile vs listing attributes", "Display score badge on listing cards above 80% threshold", "A/B test badge visibility"],
    expectedImpact: "+20% CTR on matched listings, +15% inquiry conversion",
    metrics: ["CTR by match score bucket", "Inquiry rate by match score", "User satisfaction (NPS segment)"],
    risk: "low", duration: "14 days", revenueScore: 5, liquidityScore: 8, complexityScore: 5,
  },
  {
    id: "E12", category: "referral", title: "Investor Circle Sharing Incentive",
    hypothesis: "Rewarding investors with 1 free unlock for every 3 friends who sign up will create organic demand-side growth with K-factor > 0.3.",
    steps: ["Build share-to-unlock referral mechanism", "Generate unique referral links per investor", "Credit free unlock upon 3rd referee signup", "Track viral loop metrics"],
    expectedImpact: "+120 organic investor signups/month → K-factor 0.35",
    metrics: ["Shares per investor", "Referee signup rate", "K-factor", "Incremental unlock revenue from activated referees"],
    risk: "low", duration: "21 days", revenueScore: 6, liquidityScore: 7, complexityScore: 4,
  },
];

const GrowthExperimentBacklog = () => {
  const [priority, setPriority] = useState<Priority>("fastest-revenue");
  const [filterCat, setFilterCat] = useState<Category | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...experiments]
    .filter(e => filterCat === "all" || e.category === filterCat)
    .sort((a, b) => {
      if (priority === "fastest-revenue") return b.revenueScore - a.revenueScore;
      if (priority === "highest-liquidity") return b.liquidityScore - a.liquidityScore;
      return a.complexityScore - b.complexityScore;
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Growth Experiment Backlog
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {experiments.length} structured experiments across 6 categories — prioritized by revenue, liquidity & complexity
        </p>
      </div>

      {/* Controls */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-1.5">Priority Sort</p>
            <div className="flex flex-wrap gap-2">
              {([
                { key: "fastest-revenue", label: "Fastest Revenue", icon: DollarSign },
                { key: "highest-liquidity", label: "Highest Liquidity", icon: TrendingUp },
                { key: "lowest-complexity", label: "Lowest Complexity", icon: Zap },
              ] as const).map(p => (
                <Button
                  key={p.key} size="sm" variant={priority === p.key ? "default" : "outline"}
                  className="h-7 text-xs gap-1.5"
                  onClick={() => setPriority(p.key)}
                >
                  <p.icon className="h-3 w-3" />{p.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-1.5">Category Filter</p>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant={filterCat === "all" ? "default" : "outline"} className="h-6 text-[10px]" onClick={() => setFilterCat("all")}>All</Button>
              {Object.entries(categoryMeta).map(([k, v]) => (
                <Button key={k} size="sm" variant={filterCat === k ? "default" : "outline"} className="h-6 text-[10px] gap-1" onClick={() => setFilterCat(k as Category)}>
                  <v.icon className="h-3 w-3" />{v.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Experiments", value: experiments.length, icon: FlaskConical },
          { label: "Low Risk", value: experiments.filter(e => e.risk === "low").length, icon: Shield },
          { label: "Quick Wins (≤10d)", value: experiments.filter(e => parseInt(e.duration) <= 10).length, icon: Zap },
          { label: "High Revenue Impact", value: experiments.filter(e => e.revenueScore >= 7).length, icon: DollarSign },
        ].map((s, i) => (
          <Card key={i} className="border-border/40 bg-card/70">
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Experiment Cards */}
      <div className="space-y-3">
        {sorted.map((exp, i) => {
          const cat = categoryMeta[exp.category];
          const isOpen = expanded === exp.id;
          return (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/40 bg-card/70">
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(isOpen ? null : exp.id)}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-[10px] shrink-0">{exp.id}</Badge>
                      <cat.icon className={`h-4 w-4 shrink-0 ${cat.color}`} />
                      <CardTitle className="text-sm truncate">{exp.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${riskColors[exp.risk]}`}>{exp.risk} risk</Badge>
                      <Badge variant="outline" className="text-[10px] gap-1"><Clock className="h-3 w-3" />{exp.duration}</Badge>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5" title="Revenue Impact">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-foreground">{exp.revenueScore}</span>
                        </div>
                        <div className="flex items-center gap-0.5" title="Liquidity Impact">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-foreground">{exp.liquidityScore}</span>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>

                {isOpen && (
                  <CardContent className="space-y-3 pt-0">
                    {/* Hypothesis */}
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-primary uppercase mb-0.5 flex items-center gap-1"><Target className="h-3 w-3" />Hypothesis</p>
                      <p className="text-xs text-foreground">{exp.hypothesis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Steps */}
                      <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <p className="text-[10px] text-muted-foreground uppercase mb-1.5 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Execution Steps</p>
                        {exp.steps.map((s, si) => (
                          <p key={si} className="text-xs text-foreground mb-1 flex items-start gap-1.5">
                            <span className="text-[10px] text-muted-foreground mt-0.5 shrink-0">{si + 1}.</span>{s}
                          </p>
                        ))}
                      </div>

                      {/* Metrics */}
                      <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <p className="text-[10px] text-muted-foreground uppercase mb-1.5 flex items-center gap-1"><BarChart3 className="h-3 w-3" />Success Metrics</p>
                        {exp.metrics.map((m, mi) => (
                          <p key={mi} className="text-xs text-foreground mb-1 flex items-start gap-1.5">
                            <ArrowUpRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />{m}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Expected Impact */}
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[10px] text-emerald-500 uppercase mb-0.5 flex items-center gap-1"><Sparkles className="h-3 w-3" />Expected Impact</p>
                      <p className="text-xs font-medium text-foreground">{exp.expectedImpact}</p>
                    </div>

                    {/* Score Bars */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Revenue Impact", score: exp.revenueScore },
                        { label: "Liquidity Impact", score: exp.liquidityScore },
                        { label: "Complexity", score: 10 - exp.complexityScore },
                      ].map((bar, bi) => (
                        <div key={bi}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-muted-foreground">{bar.label}</p>
                            <p className="text-[10px] font-bold text-foreground">{bar.score}/10</p>
                          </div>
                          <Progress value={bar.score * 10} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthExperimentBacklog;
