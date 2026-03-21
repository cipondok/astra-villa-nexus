import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, TrendingDown, TrendingUp, Activity, Shield,
  Zap, Users, BarChart3, Eye, Target, DollarSign,
  ArrowRight, Clock, Flame, Brain, Bell, Search,
  ChevronDown, ChevronUp, ShieldCheck, XCircle, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from "recharts";

type Severity = "critical" | "high" | "medium" | "low";
type Category = "liquidity" | "demand" | "revenue" | "vendor" | "traffic";
type MarketState = "healthy" | "warning" | "stressed";

interface Anomaly {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  icon: React.ElementType;
  detectionLogic: string;
  threshold: string;
  rootCauses: string[];
  immediateActions: string[];
  preventiveFixes: string[];
  confidence: number;
}

const categoryMeta: Record<Category, { label: string; icon: React.ElementType; color: string }> = {
  liquidity: { label: "Liquidity", icon: Activity, color: "text-cyan-400" },
  demand: { label: "Demand", icon: TrendingUp, color: "text-emerald-500" },
  revenue: { label: "Revenue", icon: DollarSign, color: "text-amber-400" },
  vendor: { label: "Vendor", icon: Users, color: "text-violet-400" },
  traffic: { label: "Traffic Quality", icon: Eye, color: "text-primary" },
};

const severityStyles: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  high: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  medium: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  low: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border/30" },
};

const anomalies: Anomaly[] = [
  {
    id: "liq-drop", title: "Sudden Liquidity Collapse", category: "liquidity", severity: "critical",
    icon: TrendingDown, confidence: 92,
    detectionLogic: "Inquiry velocity drops >30% vs 7-day rolling average AND active listing count stable or growing. Signals demand-side failure, not supply contraction.",
    threshold: "Trigger: inquiry_velocity_7d_delta < -30% AND listings_delta_7d >= 0%",
    rootCauses: ["Seasonal demand trough (predictable — check calendar)", "Competitor launched aggressive campaign capturing traffic", "Platform UX regression increasing bounce rate", "Price inflation across listings reducing perceived value", "External macro shock (policy change, rate hike)"],
    immediateActions: ["Activate emergency boost credit distribution to top 20% vendors", "Deploy investor re-engagement push notifications with urgency framing", "Launch 48h flash promotion on premium deal unlocks", "Cross-reference with traffic analytics — is the drop in visits or conversion?"],
    preventiveFixes: ["Build seasonal demand forecasting model using 12-month historical data", "Create automated 'liquidity floor' mechanism that triggers vendor pricing suggestions when inquiry density drops below threshold", "Implement early-warning at -15% (before -30% critical trigger)"],
  },
  {
    id: "demand-spike", title: "Abnormal Demand Surge", category: "demand", severity: "high",
    icon: Flame, confidence: 85,
    detectionLogic: "Inquiry volume exceeds 2.5σ above 14-day mean for a single district or property type. May indicate viral content, PR event, or bot traffic.",
    threshold: "Trigger: district_inquiries > mean_14d + (2.5 × stddev_14d)",
    rootCauses: ["Viral social media content driving organic spike", "PR coverage or influencer campaign driving targeted traffic", "Bot or scraper activity generating fake inquiries", "Government policy announcement creating genuine urgency", "Competitor platform outage redirecting users"],
    immediateActions: ["Validate traffic quality — check session duration, bounce rate, device fingerprints", "If genuine: activate dynamic boost pricing (+15-30%) in hot district", "If suspicious: enable CAPTCHA layer on inquiry forms for flagged IPs", "Notify top vendors in district to improve response time during window"],
    preventiveFixes: ["Deploy bot detection scoring on all inquiry submissions", "Build demand surge monetization automation (auto-adjust boost pricing)", "Create 'demand quality index' combining session depth, return visits, and inquiry specificity"],
  },
  {
    id: "rev-inconsistency", title: "Revenue Conversion Breakdown", category: "revenue", severity: "critical",
    icon: XCircle, confidence: 88,
    detectionLogic: "Monetization conversion rate (boost purchases + subscription upgrades + deal unlocks) drops >25% week-over-week while traffic remains stable. Revenue leak without volume explanation.",
    threshold: "Trigger: monetization_conv_rate_wow < -25% AND traffic_delta_wow > -5%",
    rootCauses: ["Payment gateway experiencing elevated failure rates", "Pricing change created sticker shock (recent price increase)", "Free-tier experience improved enough to reduce upgrade urgency", "Competitor offering aggressive promotional pricing", "UI change disrupted conversion funnel flow"],
    immediateActions: ["Check payment gateway success rate — if <95%, escalate to provider", "Review recent pricing or UI changes deployed in last 7 days", "Deploy limited-time discount to test price sensitivity hypothesis", "Run funnel analysis: where exactly are users dropping off?"],
    preventiveFixes: ["Implement real-time payment success rate monitoring with auto-alert at <97%", "A/B test all pricing changes before full rollout", "Build revenue conversion dashboard with hourly granularity for early detection", "Create automated rollback trigger for UI changes that reduce conversion >10%"],
  },
  {
    id: "vendor-churn", title: "Vendor Churn Probability Spike", category: "vendor", severity: "high",
    icon: Users, confidence: 79,
    detectionLogic: "Composite churn signal: vendor login frequency drops >50% AND listing update activity drops >60% AND response time degrades >2x within 14-day window.",
    threshold: "Trigger: login_freq_14d_delta < -50% AND listing_updates_14d < -60% AND avg_response_time > 2x_baseline",
    rootCauses: ["Vendor not receiving sufficient inquiry volume (ROI dissatisfaction)", "Competitor platform offering better terms or visibility", "Vendor business seasonality or personal circumstances", "Platform complexity frustrating less technical vendors", "Subscription cost perceived as too high relative to results"],
    immediateActions: ["Trigger automated 'We miss you' reactivation message with performance data", "Assign high-value at-risk vendors to account manager for personal outreach", "Offer 30-day premium trial extension to demonstrate continued value", "Send curated inquiry data showing demand in their listing areas"],
    preventiveFixes: ["Build vendor health score combining login, listing, response, and revenue signals", "Implement proactive engagement triggers at -25% activity decline (before critical)", "Create vendor success onboarding flow with milestone celebrations", "Develop vendor ROI dashboard showing actual revenue attributed to platform"],
  },
  {
    id: "traffic-quality", title: "Traffic Quality Deterioration", category: "traffic", severity: "medium",
    icon: Search, confidence: 74,
    detectionLogic: "Bounce rate increases >20% AND pages-per-session drops >30% AND inquiry-to-visit ratio declines >40% over 7-day period. Traffic volume may be stable but conversion-quality is degrading.",
    threshold: "Trigger: bounce_rate_7d > baseline + 20% AND pages_per_session < baseline × 0.7 AND inquiry_rate < baseline × 0.6",
    rootCauses: ["Paid acquisition campaigns targeting wrong audience segments", "SEO ranking shifts bringing less-qualified organic traffic", "Social media content attracting curiosity traffic without purchase intent", "Landing page mismatch with ad/content promises", "Competitor negative SEO or brand bidding"],
    immediateActions: ["Pause underperforming paid campaigns (ROAS < 1.5x threshold)", "Analyze traffic source breakdown — identify which channel quality dropped", "Review landing page relevance for top traffic sources", "Check search console for ranking changes on high-intent keywords"],
    preventiveFixes: ["Implement traffic quality scoring per acquisition channel", "Set automated budget reallocation rules based on channel conversion quality", "Build intent-scoring model using behavioral signals (scroll depth, time, interactions)", "Create separate landing pages for different intent levels"],
  },
  {
    id: "listing-stale", title: "Listing Staleness Accumulation", category: "liquidity", severity: "medium",
    icon: Clock, confidence: 81,
    detectionLogic: "Percentage of listings with zero inquiries in 30+ days exceeds 35% of total active inventory. Dead inventory degrades marketplace quality perception.",
    threshold: "Trigger: (listings_zero_inquiry_30d / total_active_listings) > 0.35",
    rootCauses: ["Listings priced significantly above fair market value", "Poor listing quality (low image count, thin descriptions)", "Supply-demand mismatch in specific districts or property types", "Vendor not refreshing or optimizing stale listings", "Search/filter algorithm not surfacing relevant inventory"],
    immediateActions: ["Flag stale listings for vendor notification with optimization suggestions", "Apply automatic ranking demotion for 30+ day zero-inquiry listings", "Send vendors pricing comparison data showing competitive listings", "Review search algorithm — are stale listings being shown to relevant queries?"],
    preventiveFixes: ["Implement listing quality score that factors freshness into search ranking", "Auto-suggest price adjustments when listings underperform district average", "Create 'listing health' notifications showing vendors how to improve visibility", "Build automatic archival for 90+ day zero-engagement listings"],
  },
  {
    id: "demand-decline", title: "Sustained Demand Erosion", category: "demand", severity: "high",
    icon: TrendingDown, confidence: 86,
    detectionLogic: "Daily active investor sessions decline for 5+ consecutive days with no recovery signal. Distinguished from weekend dips by day-of-week normalization.",
    threshold: "Trigger: dau_investors_consecutive_decline >= 5 days (weekday-normalized)",
    rootCauses: ["Market sentiment shift — macro uncertainty reducing buyer confidence", "Platform value proposition weakening relative to alternatives", "Content/communication fatigue from over-messaging", "Seasonal slowdown compounded by insufficient demand stimulation", "Key listing inventory becoming stale or uncompetitive"],
    immediateActions: ["Deploy high-value content push: fresh market intelligence report", "Activate dormant investor re-engagement campaign (email + push + WhatsApp)", "Release new exclusive deal batch to create fresh discovery momentum", "Analyze competitor activity — have they launched a campaign?"],
    preventiveFixes: ["Build investor engagement lifecycle model with decay prediction", "Create automated 'content freshness' system that publishes new insights daily", "Implement 'investor momentum score' tracking engagement trajectory per user", "Develop personalized re-engagement triggers based on individual behavior patterns"],
  },
  {
    id: "rev-concentration", title: "Revenue Concentration Risk", category: "revenue", severity: "medium",
    icon: Shield, confidence: 77,
    detectionLogic: "Top 10% of paying users contribute >60% of total revenue. Single-customer or single-segment dependency creates fragility.",
    threshold: "Trigger: revenue_top_10pct_share > 60% OR single_customer_share > 15%",
    rootCauses: ["Premium tier over-indexed on small number of institutional users", "Mass-market monetization features not converting at scale", "Pricing structure creates too large a gap between free and premium", "Mid-tier subscription lacking compelling value proposition", "Geographic revenue concentration in single city"],
    immediateActions: ["Map revenue dependency — identify exact concentration sources", "Accelerate mid-tier product development to broaden paying base", "Create promotional entry point for non-paying power users", "Diversify geographic revenue by prioritizing monetization in expansion cities"],
    preventiveFixes: ["Set revenue concentration ceiling alerts (HHI index for customer concentration)", "Build progressive monetization ladder with more granular pricing tiers", "Implement 'revenue diversification score' as executive KPI", "Create segment-specific value propositions to broaden conversion across user types"],
  },
];

// Simulated trend data for deviation charts
function genTrendData(anomalyActive: boolean) {
  const base = 100;
  return Array.from({ length: 14 }, (_, i) => {
    const day = `D${i + 1}`;
    const normal = base + Math.sin(i * 0.5) * 10 + Math.random() * 5;
    const actual = anomalyActive && i > 9
      ? normal * (1 - (i - 9) * 0.08 - Math.random() * 0.05)
      : normal + Math.random() * 8 - 4;
    return { day, baseline: Math.round(normal), actual: Math.round(actual), lower: Math.round(normal * 0.85), upper: Math.round(normal * 1.15) };
  });
}

const KPIAnomalyDetector = () => {
  const [marketState, setMarketState] = useState<MarketState>("warning");
  const [filterCat, setFilterCat] = useState<"all" | Category>("all");
  const [filterSev, setFilterSev] = useState<"all" | Severity>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = anomalies;
    if (filterCat !== "all") result = result.filter(a => a.category === filterCat);
    if (filterSev !== "all") result = result.filter(a => a.severity === filterSev);
    return result;
  }, [filterCat, filterSev]);

  const trendData = useMemo(() => genTrendData(marketState !== "healthy"), [marketState]);

  const sevCounts = { critical: anomalies.filter(a => a.severity === "critical").length, high: anomalies.filter(a => a.severity === "high").length, medium: anomalies.filter(a => a.severity === "medium").length, low: anomalies.filter(a => a.severity === "low").length };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          KPI Anomaly Detection Blueprint
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          8 anomaly frameworks across liquidity, demand, revenue, vendor & traffic quality
        </p>
      </div>

      {/* Status & Filters */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Activity className="h-3 w-3" />Market State</label>
              <Select value={marketState} onValueChange={v => setMarketState(v as MarketState)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy" className="text-xs">✅ Healthy</SelectItem>
                  <SelectItem value="warning" className="text-xs">⚠️ Warning</SelectItem>
                  <SelectItem value="stressed" className="text-xs">🔴 Stressed</SelectItem>
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
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Severity</label>
              <Select value={filterSev} onValueChange={v => setFilterSev(v as any)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Severities</SelectItem>
                  <SelectItem value="critical" className="text-xs">🔴 Critical</SelectItem>
                  <SelectItem value="high" className="text-xs">🟠 High</SelectItem>
                  <SelectItem value="medium" className="text-xs">🔵 Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              {Object.entries(sevCounts).filter(([, v]) => v > 0).map(([k, v]) => (
                <Badge key={k} variant="outline" className={cn("text-[10px]", severityStyles[k as Severity].bg, severityStyles[k as Severity].text)}>
                  {v} {k}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="anomalies" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="anomalies" className="text-xs gap-1.5"><AlertTriangle className="h-3 w-3" />Anomaly Frameworks</TabsTrigger>
          <TabsTrigger value="visualization" className="text-xs gap-1.5"><BarChart3 className="h-3 w-3" />Deviation Chart</TabsTrigger>
        </TabsList>

        {/* Anomalies */}
        <TabsContent value="anomalies" className="space-y-3">
          {filtered.map((a, i) => {
            const cat = categoryMeta[a.category];
            const sev = severityStyles[a.severity];
            const isExpanded = expandedId === a.id;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={cn("border-border/40 bg-card/70 transition-all", isExpanded && "ring-1 ring-primary/30")}>
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn("flex items-center justify-center h-8 w-8 rounded-lg shrink-0", sev.bg)}>
                          <a.icon className={cn("h-4 w-4", sev.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-foreground">{a.title}</span>
                            <Badge variant="outline" className={cn("text-[9px]", sev.bg, sev.text, sev.border)}>{a.severity}</Badge>
                            <Badge variant="outline" className="text-[9px]">
                              <cat.icon className={cn("h-2.5 w-2.5 mr-1", cat.color)} />{cat.label}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{a.detectionLogic}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center hidden md:block">
                          <p className="text-[8px] text-muted-foreground uppercase">Confidence</p>
                          <div className="flex items-center gap-1">
                            <Progress value={a.confidence} className="w-12 h-1.5" />
                            <span className="text-[10px] font-bold text-foreground">{a.confidence}%</span>
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

                          {/* Threshold */}
                          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/20 font-mono">
                            <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Detection Threshold</p>
                            <p className="text-[11px] text-foreground">{a.threshold}</p>
                          </div>

                          {/* Root Causes */}
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1.5 flex items-center gap-1"><Brain className="h-3 w-3" />Root Cause Hypotheses</p>
                            <ul className="space-y-1">
                              {a.rootCauses.map((rc, ri) => (
                                <li key={ri} className="flex items-start gap-2 text-xs text-foreground">
                                  <span className="text-[9px] font-bold text-muted-foreground shrink-0 mt-0.5">{ri + 1}.</span>
                                  <span>{rc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Actions Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/15">
                              <p className="text-[10px] text-destructive uppercase font-medium mb-1.5 flex items-center gap-1"><Zap className="h-3 w-3" />Immediate Actions</p>
                              <ul className="space-y-1">
                                {a.immediateActions.map((ia, ii) => (
                                  <li key={ii} className="flex items-start gap-1.5 text-[11px] text-foreground">
                                    <ArrowRight className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                                    <span>{ia}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                              <p className="text-[10px] text-emerald-500 uppercase font-medium mb-1.5 flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Preventive Fixes</p>
                              <ul className="space-y-1">
                                {a.preventiveFixes.map((pf, pi) => (
                                  <li key={pi} className="flex items-start gap-1.5 text-[11px] text-foreground">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{pf}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Visualization */}
        <TabsContent value="visualization" className="space-y-4">
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Trend Deviation Monitor — 14-Day Rolling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--popover-foreground))" }}
                    />
                    <Area type="monotone" dataKey="upper" stackId="band" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.08} />
                    <Area type="monotone" dataKey="lower" stackId="band" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
                    <Line type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Expected" />
                    <Line type="monotone" dataKey="actual" stroke={marketState === "healthy" ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"} strokeWidth={2} dot={{ r: 3, fill: marketState === "healthy" ? "hsl(var(--chart-2))" : "hsl(var(--destructive))" }} name="Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: "2px dashed" }} />Expected Baseline
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className={cn("w-4 h-0.5", marketState === "healthy" ? "bg-emerald-500" : "bg-destructive")} />Actual
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-4 h-3 bg-primary/10 rounded-sm" />Acceptable Band (±15%)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Card Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "Inquiry Velocity", value: marketState === "stressed" ? "-34%" : marketState === "warning" ? "-18%" : "+5%", status: marketState, desc: "vs 7-day avg" },
              { title: "Monetization Conv", value: marketState === "stressed" ? "1.8%" : marketState === "warning" ? "3.2%" : "5.1%", status: marketState === "stressed" ? "stressed" : "healthy", desc: "boost + sub + unlock" },
              { title: "Vendor Activity", value: marketState === "stressed" ? "62%" : marketState === "warning" ? "78%" : "91%", status: marketState === "stressed" ? "warning" : "healthy", desc: "7-day active rate" },
            ].map((card, ci) => (
              <Card key={ci} className={cn("border-border/40", card.status === "stressed" ? "bg-destructive/5 border-destructive/20" : card.status === "warning" ? "bg-amber-500/5 border-amber-500/20" : "bg-card/70")}>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[9px] text-muted-foreground uppercase">{card.title}</p>
                  <p className={cn("text-xl font-bold", card.status === "stressed" ? "text-destructive" : card.status === "warning" ? "text-amber-500" : "text-emerald-500")}>{card.value}</p>
                  <p className="text-[10px] text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Confidence Panel */}
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />AI Risk Confidence Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anomalies.slice(0, 5).map(a => {
                  const sev = severityStyles[a.severity];
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/20">
                      <Badge variant="outline" className={cn("text-[9px] w-16 justify-center", sev.bg, sev.text)}>{a.severity}</Badge>
                      <span className="text-xs text-foreground flex-1 truncate">{a.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Progress value={a.confidence} className="w-16 h-1.5" />
                        <span className="text-[10px] font-bold text-foreground w-8 text-right">{a.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KPIAnomalyDetector;
