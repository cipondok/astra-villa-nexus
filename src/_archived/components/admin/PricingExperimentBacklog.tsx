import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  FlaskConical, TrendingUp, Clock, AlertTriangle, Zap, Target,
  DollarSign, BarChart3, Brain, Flame, ShieldCheck, ArrowRight,
  Copy, Check, Timer, Users, Layers, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Priority = "critical" | "high" | "medium";
type Risk = "low" | "medium" | "high";
type Category = "boost" | "subscription" | "scarcity" | "urgency" | "dynamic";

interface Experiment {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  risk: Risk;
  revenueImpact: number; // 1-10
  complexity: number; // 1-10
  psychLeverage: number; // 1-10
  duration: string;
  hypothesis: string;
  steps: string[];
  expectedResponse: string;
  metrics: string[];
}

const categoryMeta: Record<Category, { label: string; icon: React.ElementType; color: string }> = {
  boost: { label: "Boost Pricing", icon: Zap, color: "text-amber-400" },
  subscription: { label: "Subscription Bundles", icon: Layers, color: "text-primary" },
  scarcity: { label: "Scarcity Discounts", icon: Timer, color: "text-destructive" },
  urgency: { label: "Urgency Messaging", icon: Flame, color: "text-orange-500" },
  dynamic: { label: "Dynamic Pricing", icon: Brain, color: "text-violet-400" },
};

const priorityStyles: Record<Priority, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  medium: "bg-primary/10 text-primary border-primary/30",
};

const riskStyles: Record<Risk, string> = {
  low: "bg-emerald-500/10 text-emerald-500",
  medium: "bg-amber-500/10 text-amber-500",
  high: "bg-destructive/10 text-destructive",
};

function generateExperiments(convRate: string, liquidity: string): Experiment[] {
  const lowConv = convRate === "low";
  const strongLiq = liquidity === "strong";

  return [
    {
      id: "exp-01", title: "Decoy Tier Anchoring for Boost Packages", category: "boost", priority: "critical",
      risk: "low", revenueImpact: 9, complexity: 3, psychLeverage: 9, duration: "14 days",
      hypothesis: "Introducing a high-priced 'Platinum Boost' tier (Rp 15M) that few will buy will anchor perception and increase conversion on the mid-tier 'Gold Boost' (Rp 5M) by 25-40%.",
      steps: [
        "Create 3-tier boost structure: Silver (Rp 1.5M), Gold (Rp 5M), Platinum (Rp 15M)",
        "Design Platinum with intentionally excessive features to serve as price anchor",
        "Position Gold as 'Most Popular' with visual emphasis and social proof badge",
        "A/B test: Control (current 2-tier) vs Treatment (3-tier with decoy)",
        "Track tier selection distribution and total revenue per impression"
      ],
      expectedResponse: "Buyers experiencing the contrast effect will perceive Gold as reasonable value. The Platinum tier normalizes higher price points while Gold captures 55-65% of conversions.",
      metrics: ["Gold tier conversion rate", "Average revenue per boost purchase", "Tier selection distribution", "Overall boost attach rate"]
    },
    {
      id: "exp-02", title: "Loss-Framed Boost Expiry Countdown", category: "urgency", priority: "critical",
      risk: "low", revenueImpact: 8, complexity: 2, psychLeverage: 9, duration: "7 days",
      hypothesis: "Showing vendors 'Your listing lost X views today without a boost' with a 4-hour discount countdown will increase boost purchase rate by 30%+ vs neutral messaging.",
      steps: [
        "Calculate actual view differential between boosted and unboosted listings in same area",
        "Display loss-framed notification: 'Your listing missed ~47 investor views today'",
        "Attach time-limited 20% discount with visible countdown timer",
        "Trigger at peak browsing hours (10AM, 7PM) for maximum psychological impact",
        "A/B test loss-frame vs gain-frame ('Get 47 more views with boost')"
      ],
      expectedResponse: "Loss aversion (2x stronger than equivalent gain) drives immediate action. The countdown creates urgency that prevents deliberation and price comparison.",
      metrics: ["Boost CTR from notification", "Conversion within countdown window", "Revenue per notification sent", "Vendor satisfaction score (monitor for fatigue)"]
    },
    {
      id: "exp-03", title: "Subscription Commitment Discount Ladder", category: "subscription", priority: "high",
      risk: "low", revenueImpact: 8, complexity: 4, psychLeverage: 7, duration: "30 days",
      hypothesis: "Offering escalating discounts for longer subscription commitments (Monthly → Quarterly → Annual) with visible per-day cost comparison will increase annual plan adoption by 35% and reduce churn by 20%.",
      steps: [
        "Restructure pricing display: Monthly Rp 2.5M (Rp 83K/day), Quarterly Rp 6M (Rp 67K/day, save 20%), Annual Rp 18M (Rp 50K/day, save 40%)",
        "Add 'cost per day' framing — makes annual feel trivial",
        "Show cumulative savings calculator: 'You save Rp 12M over 12 months'",
        "Highlight annual plan with 'Best Value' badge and slight visual elevation",
        "Track plan selection, LTV impact, and churn rate by cohort"
      ],
      expectedResponse: "Per-day framing reduces perceived cost magnitude. Sunk cost psychology of annual commitment reduces churn. Higher upfront revenue improves cash flow predictability.",
      metrics: ["Annual plan adoption rate", "Revenue per subscriber (ARPS)", "Churn rate by plan type", "Cash collected upfront vs monthly"]
    },
    {
      id: "exp-04", title: "Dynamic Boost Pricing by Demand Intensity", category: "dynamic", priority: "high",
      risk: "medium", revenueImpact: 9, complexity: 7, psychLeverage: 6, duration: "21 days",
      hypothesis: `In ${strongLiq ? "high-demand" : "emerging"} zones, dynamically pricing boosts 15-30% higher during peak inquiry periods will increase revenue per boost without reducing purchase volume, as vendors perceive higher price as signal of stronger market.`,
      steps: [
        "Build demand intensity index per district (inquiry velocity + view density + save rate)",
        "Define 3 pricing bands: Standard (base), High Demand (+15%), Surge (+30%)",
        "Display demand indicator alongside price: '🔥 High demand area — boost slots filling fast'",
        "Auto-adjust pricing every 6 hours based on real-time signals",
        "A/B test: Control (flat pricing) vs Treatment (dynamic pricing)",
        "Monitor vendor sentiment and purchase elasticity at each band"
      ],
      expectedResponse: "Vendors in high-demand areas have higher willingness to pay because the expected ROI is visibly higher. Dynamic pricing captures surplus without alienating low-demand vendors.",
      metrics: ["Revenue per boost by demand band", "Purchase volume elasticity", "Vendor NPS by pricing band", "Total boost revenue lift"]
    },
    {
      id: "exp-05", title: "48-Hour Early Bird Scarcity Window", category: "scarcity", priority: "high",
      risk: "low", revenueImpact: 7, complexity: 3, psychLeverage: 8, duration: "14 days",
      hypothesis: "Offering new vendors a 48-hour 'Founding Member' discount (30% off first 3 months) with a visible countdown and slot counter ('12 of 50 slots remaining') will increase onboarding-to-paid conversion by 40%.",
      steps: [
        "Trigger 48-hour window immediately after vendor account creation",
        "Display persistent banner with countdown + remaining slot counter",
        "Use social proof: 'X vendors in your area activated this week'",
        "Send WhatsApp reminder at T-12h and T-2h before expiry",
        "After expiry, show 'Offer expired — standard pricing applies' to reinforce scarcity legitimacy"
      ],
      expectedResponse: "Combination of time pressure + quantity scarcity + social proof creates a 'now or never' decision frame. FOMO drives faster commitment while discount reduces first-purchase friction.",
      metrics: ["48h conversion rate vs control", "Time-to-first-payment", "3-month retention (discount vs full-price cohort)", "Slot counter engagement rate"]
    },
    {
      id: "exp-06", title: "Investor Deal Unlock Bundle Pricing", category: "subscription", priority: "high",
      risk: "low", revenueImpact: 8, complexity: 3, psychLeverage: 8, duration: "14 days",
      hypothesis: "Offering deal unlock bundles (5-pack at 15% discount, 20-pack at 30% discount) vs single unlocks will increase average transaction value by 50% and create commitment to platform usage.",
      steps: [
        "Create bundle options: 1 unlock (Rp 150K), 5-pack (Rp 637K — save 15%), 20-pack (Rp 2.1M — save 30%)",
        "Display per-unlock cost comparison prominently",
        "Add 'Most investors choose' badge on 5-pack (even if early, to seed behavior)",
        "Show unlock balance as progress bar to encourage usage and repurchase",
        "Track bundle selection, usage velocity, and repurchase rate"
      ],
      expectedResponse: "Bundle pricing triggers 'stockpiling' psychology — investors commit more capital upfront and then use the platform more frequently to justify the purchase, creating a usage-commitment loop.",
      metrics: ["Average transaction value", "Bundle vs single selection ratio", "Unlock usage velocity", "Repurchase rate by bundle type"]
    },
    {
      id: "exp-07", title: "Social Proof Pricing Notifications", category: "urgency", priority: "medium",
      risk: "low", revenueImpact: 6, complexity: 2, psychLeverage: 8, duration: "10 days",
      hypothesis: "Showing real-time social proof notifications ('A vendor in Seminyak just boosted their listing — 3 boost slots remaining in this area') will increase boost purchase rate by 20% through competitive FOMO.",
      steps: [
        "Aggregate anonymized boost purchase events by area (last 24h)",
        "Display non-intrusive toast notification when vendor views their dashboard",
        "Include area-specific slot scarcity count (even if soft limit)",
        "Vary notification frequency: test 1x/day vs 3x/day",
        "A/B test: Control (no notifications) vs Treatment (social proof toasts)"
      ],
      expectedResponse: "Competitive social proof triggers both FOMO and herd behavior. Vendors don't want competitors to have visibility advantages. Area-specific framing makes it personal and relevant.",
      metrics: ["Boost conversion rate post-notification", "Notification click-through rate", "Notification fatigue signal (dismiss rate)", "Incremental boost revenue"]
    },
    {
      id: "exp-08", title: "Premium Feature Sampling (Freemium Conversion)", category: "subscription", priority: "medium",
      risk: "low", revenueImpact: 7, complexity: 5, psychLeverage: 7, duration: "21 days",
      hypothesis: `Giving free-tier vendors a 72-hour 'Premium Preview' with full analytics access${lowConv ? " (especially important given low current conversion)" : ""} will create endowment effect — vendors who experience premium features convert at 3x the rate of those who only see feature descriptions.`,
      steps: [
        "Auto-activate 72h premium trial for vendors after their first listing gets 10+ views",
        "Show premium analytics overlay with clear 'Premium Feature' badge on each element",
        "At T-24h, display: 'Your premium access expires tomorrow — keep these insights?'",
        "After expiry, grey out premium features with 'Upgrade to restore' overlay",
        "Compare conversion: trial-exposed vs feature-description-only cohort"
      ],
      expectedResponse: "Endowment effect makes losing access psychologically painful (loss > equivalent gain). Vendors who've seen their own data through premium lens develop dependency on those insights.",
      metrics: ["Trial-to-paid conversion rate", "Premium feature usage during trial", "Time-to-upgrade after expiry", "Revenue per vendor (trial vs non-trial)"]
    },
    {
      id: "exp-09", title: "Price Elasticity Micro-Test Grid", category: "dynamic", priority: "medium",
      risk: "medium", revenueImpact: 7, complexity: 6, psychLeverage: 5, duration: "28 days",
      hypothesis: "Systematically testing ±10% and ±20% price variations across boost tiers and geographies will identify optimal price points that maximize revenue (not just volume), potentially unlocking 15-25% revenue increase.",
      steps: [
        "Segment markets into 4 test cells per product: -20%, -10%, base, +10%, +20%",
        "Ensure statistical significance targets (min 100 impressions per cell per geography)",
        "Run simultaneously across all segments to control for time effects",
        "Calculate price elasticity coefficient for each product × geography",
        "Identify revenue-maximizing price point (volume × price optimization)"
      ],
      expectedResponse: "Many marketplaces discover they're under-priced in strong markets and over-priced in weak ones. Systematic testing replaces intuition with data-backed optimal pricing.",
      metrics: ["Price elasticity coefficient per segment", "Revenue-maximizing price point", "Volume impact at each price point", "Willingness-to-pay distribution curve"]
    },
    {
      id: "exp-10", title: "Competitive Urgency Trigger for Investors", category: "urgency", priority: "critical",
      risk: "low", revenueImpact: 8, complexity: 2, psychLeverage: 9, duration: "7 days",
      hypothesis: "Showing investors 'X other investors are viewing this property right now' with a deal unlock CTA will increase unlock conversion by 35%+ by activating competitive acquisition instinct.",
      steps: [
        "Track concurrent viewer count per listing (can be smoothed/delayed for privacy)",
        "Display viewer count badge on high-interest listings (threshold: 3+ concurrent)",
        "Position deal unlock CTA adjacent to viewer count: 'Unlock full details before others'",
        "Test threshold variations: show at 3+ vs 5+ concurrent viewers",
        "Monitor unlock rate, time-to-unlock, and subsequent viewing bookings"
      ],
      expectedResponse: "Competitive scarcity is the strongest driver for high-intent investors. Seeing others interested in the same deal triggers immediate action to secure informational advantage.",
      metrics: ["Deal unlock rate on flagged listings", "Time from view to unlock", "Viewing booking rate post-unlock", "Revenue per listing with competitive signal"]
    },
  ];
}

const PricingExperimentBacklog = () => {
  const { toast } = useToast();
  const [convRate, setConvRate] = useState("medium");
  const [liquidity, setLiquidity] = useState("strong");
  const [filterCat, setFilterCat] = useState<"all" | Category>("all");
  const [sortBy, setSortBy] = useState<"revenue" | "complexity" | "psych">("revenue");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const experiments = generateExperiments(convRate, liquidity);
  const filtered = filterCat === "all" ? experiments : experiments.filter(e => e.category === filterCat);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "revenue") return b.revenueImpact - a.revenueImpact;
    if (sortBy === "complexity") return a.complexity - b.complexity;
    return b.psychLeverage - a.psychLeverage;
  });

  const copyAll = (exp: Experiment) => {
    const text = `# ${exp.title}\n\nHypothesis: ${exp.hypothesis}\n\nSteps:\n${exp.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nExpected Response: ${exp.expectedResponse}\n\nMetrics: ${exp.metrics.join(", ")}\n\nDuration: ${exp.duration} | Risk: ${exp.risk} | Priority: ${exp.priority}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(exp.id);
    toast({ title: "Experiment copied" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Pricing Experiment Backlog
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Behavioral economics experiments for boost, subscription & premium access monetization
        </p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><BarChart3 className="h-3 w-3" />Conversion Rate</label>
              <Select value={convRate} onValueChange={setConvRate}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">Low (&lt;3%)</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium (3-8%)</SelectItem>
                  <SelectItem value="high" className="text-xs">High (&gt;8%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><TrendingUp className="h-3 w-3" />Liquidity</label>
              <Select value={liquidity} onValueChange={setLiquidity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak" className="text-xs">Weak</SelectItem>
                  <SelectItem value="moderate" className="text-xs">Moderate</SelectItem>
                  <SelectItem value="strong" className="text-xs">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" />Category</label>
              <Select value={filterCat} onValueChange={v => setFilterCat(v as any)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                  {Object.entries(categoryMeta).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Sparkles className="h-3 w-3" />Sort By</label>
              <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue" className="text-xs">Revenue Impact</SelectItem>
                  <SelectItem value="complexity" className="text-xs">Lowest Complexity</SelectItem>
                  <SelectItem value="psych" className="text-xs">Psych Leverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Experiments", value: sorted.length, icon: FlaskConical },
          { label: "Critical Priority", value: sorted.filter(e => e.priority === "critical").length, icon: AlertTriangle },
          { label: "Low Risk", value: sorted.filter(e => e.risk === "low").length, icon: ShieldCheck },
          { label: "Avg Revenue Impact", value: `${(sorted.reduce((a, e) => a + e.revenueImpact, 0) / sorted.length).toFixed(1)}/10`, icon: DollarSign },
        ].map((s, i) => (
          <Card key={i} className="border-border/40 bg-card/70">
            <CardContent className="pt-3 pb-3 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Experiment Cards */}
      <div className="space-y-3">
        {sorted.map((exp, i) => {
          const cat = categoryMeta[exp.category];
          const isExpanded = expandedId === exp.id;
          return (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={cn("border-border/40 bg-card/70 transition-all", isExpanded && "ring-1 ring-primary/30")}>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : exp.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/50 shrink-0">
                        <cat.icon className={cn("h-4 w-4", cat.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <CardTitle className="text-sm">{exp.title}</CardTitle>
                          <Badge variant="outline" className={cn("text-[9px]", priorityStyles[exp.priority])}>{exp.priority}</Badge>
                          <Badge variant="outline" className={cn("text-[9px]", riskStyles[exp.risk])}>Risk: {exp.risk}</Badge>
                          <Badge variant="outline" className="text-[9px]">{exp.duration}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{exp.hypothesis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden md:flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[8px] text-muted-foreground uppercase">Revenue</p>
                          <div className="flex items-center gap-1"><Progress value={exp.revenueImpact * 10} className="w-12 h-1.5" /><span className="text-[10px] font-bold text-foreground">{exp.revenueImpact}</span></div>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] text-muted-foreground uppercase">Complexity</p>
                          <div className="flex items-center gap-1"><Progress value={exp.complexity * 10} className="w-12 h-1.5" /><span className="text-[10px] font-bold text-foreground">{exp.complexity}</span></div>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] text-muted-foreground uppercase">Psych</p>
                          <div className="flex items-center gap-1"><Progress value={exp.psychLeverage * 10} className="w-12 h-1.5" /><span className="text-[10px] font-bold text-foreground">{exp.psychLeverage}</span></div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <CardContent className="pt-0 space-y-4">
                        <div className="h-px bg-border/30" />

                        {/* Steps */}
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium mb-2 flex items-center gap-1"><Target className="h-3 w-3" />Execution Steps</p>
                          <div className="space-y-1.5">
                            {exp.steps.map((step, si) => (
                              <div key={si} className="flex items-start gap-2 text-xs text-foreground">
                                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0 mt-0.5">{si + 1}</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expected Response */}
                        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
                          <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1 flex items-center gap-1"><Brain className="h-3 w-3" />Expected Behavioral Response</p>
                          <p className="text-xs text-foreground leading-relaxed">{exp.expectedResponse}</p>
                        </div>

                        {/* Metrics */}
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium mb-2 flex items-center gap-1"><BarChart3 className="h-3 w-3" />Success Metrics</p>
                          <div className="flex flex-wrap gap-1.5">
                            {exp.metrics.map((m, mi) => (
                              <Badge key={mi} variant="outline" className="text-[10px] bg-muted/20">{m}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => copyAll(exp)}>
                            {copiedKey === exp.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copiedKey === exp.id ? "Copied" : "Copy Experiment"}
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingExperimentBacklog;
