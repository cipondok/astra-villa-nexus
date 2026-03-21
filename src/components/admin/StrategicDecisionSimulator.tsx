import React, { useState } from "react";
import { GitBranch, ChevronDown, ChevronUp, Copy, Check, TrendingUp, TrendingDown, AlertTriangle, Target, Clock, Shield, Zap, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── types & data ───────── */

interface Scenario {
  label: string;
  icon: React.ReactNode;
  color: string;
  liquidity: string;
  revenue: string;
  timeline: string;
  probability: number;
  description: string;
}

interface SecondOrder { effect: string; positive: boolean }

interface Decision {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  context: string;
  scenarios: { best: Scenario; expected: Scenario; downside: Scenario };
  secondOrder: SecondOrder[];
  recommendation: string;
  shortTermImpact: number;
  longTermMoat: number;
  capitalEfficiency: number;
  executionComplexity: number;
  monitorMetrics: string[];
  warningSignals: string[];
  pivotTriggers: string[];
}

const decisions: Decision[] = [
  {
    id: "expand-vs-deepen",
    title: "Expand to City #2 vs Deepen Current City",
    optionA: "Launch City #2 now",
    optionB: "Double down on City #1 dominance",
    context: "With 500+ listings and growing inquiry velocity in City #1, the temptation to expand is strong. But liquidity density in City #1 is at 62/100 — below the 75+ threshold for defensible dominance.",
    scenarios: {
      best: { label: "Best Case", icon: <ArrowUpRight className="h-4 w-4" />, color: "text-green-600 dark:text-green-400", liquidity: "City #1 holds at 62, City #2 reaches 40 in 6 months", revenue: "+45% ARR from new market", timeline: "9 months to City #2 break-even", probability: 20, description: "Both cities grow simultaneously. Team scales efficiently. Investor narrative strengthens with multi-city traction." },
      expected: { label: "Expected", icon: <Minus className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400", liquidity: "City #1 drops to 55, City #2 reaches 30", revenue: "+15% ARR but higher burn", timeline: "14 months to City #2 break-even", probability: 55, description: "Resources split. City #1 growth stalls. City #2 ramp is slower than projected. Burn rate increases 60%." },
      downside: { label: "Downside", icon: <ArrowDownRight className="h-4 w-4" />, color: "text-destructive", liquidity: "City #1 drops to 48, City #2 stalls at 20", revenue: "-10% ARR, cash runway shrinks to 8 months", timeline: "City #2 fails to reach break-even", probability: 25, description: "Operational stretch causes quality decline in both cities. Vendor churn spikes in City #1. Competitor captures weakened position." },
    },
    secondOrder: [
      { effect: "Splitting engineering focus delays AI feature roadmap by 3-4 months", positive: false },
      { effect: "Multi-city data improves prediction model accuracy for expansion planning", positive: true },
      { effect: "Vendor support quality drops without dedicated city-level ops team", positive: false },
      { effect: "Investor narrative strengthens — 'proven expansion model' unlocks Series A", positive: true },
    ],
    recommendation: "DEEPEN City #1 to 75+ liquidity index before expanding. The data moat compounds faster with density than breadth. Expand only when City #1 generates positive unit economics.",
    shortTermImpact: 40,
    longTermMoat: 85,
    capitalEfficiency: 80,
    executionComplexity: 35,
    monitorMetrics: ["Liquidity index trajectory (target 75+)", "Vendor retention rate (>85%)", "Inquiry-to-offer conversion (>12%)", "Monthly burn rate vs revenue ratio"],
    warningSignals: ["Liquidity index declining 2+ weeks consecutively", "Vendor response time increasing >24hrs avg", "Inquiry velocity plateauing despite marketing spend increase"],
    pivotTriggers: ["City #1 liquidity reaches 78+ for 30 consecutive days → trigger expansion", "Competitor announces City #1 launch → accelerate deepening, delay expansion", "Series A closes → allocate 30% of funds to City #2 prep"],
  },
  {
    id: "pricing-vs-growth",
    title: "Increase Pricing vs Maximize User Growth",
    optionA: "Raise premium tier pricing 30%",
    optionB: "Keep pricing low, prioritize user acquisition",
    context: "Current conversion rate to paid plans is 8.5%. Premium users generate 4.2x more inquiries than free users. Competitors are undercutting on price.",
    scenarios: {
      best: { label: "Best Case", icon: <ArrowUpRight className="h-4 w-4" />, color: "text-green-600 dark:text-green-400", liquidity: "Premium users increase inquiry quality, liquidity improves", revenue: "+40% ARPU, only 8% subscriber churn", timeline: "Revenue impact within 30 days", probability: 25, description: "Price increase is absorbed. Higher-value users self-select. Revenue jumps without proportional churn." },
      expected: { label: "Expected", icon: <Minus className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400", liquidity: "Slight dip in new sign-ups, stable inquiry velocity", revenue: "+22% ARPU, 15% subscriber churn", timeline: "Net positive after 60 days", probability: 50, description: "Some price-sensitive users leave. Revenue per user rises. Net revenue positive after initial churn stabilizes." },
      downside: { label: "Downside", icon: <ArrowDownRight className="h-4 w-4" />, color: "text-destructive", liquidity: "25% drop in new premium sign-ups, inquiry velocity declines", revenue: "-5% total revenue from high churn", timeline: "3-month recovery period", probability: 25, description: "Price increase triggers competitor migration. Vendor satisfaction drops as inquiry volume falls. Brand perception shifts to 'expensive'." },
    },
    secondOrder: [
      { effect: "Higher pricing attracts more serious investors, improving deal quality", positive: true },
      { effect: "Reduced user base weakens network effect momentum", positive: false },
      { effect: "Higher ARPU improves unit economics for Series A narrative", positive: true },
      { effect: "Competitor uses pricing gap as primary sales pitch against ASTRA", positive: false },
    ],
    recommendation: "INCREASE pricing on new subscribers only. Grandfather existing users for 6 months. This captures higher ARPU without triggering churn, and tests price elasticity with lower risk.",
    shortTermImpact: 70,
    longTermMoat: 55,
    capitalEfficiency: 90,
    executionComplexity: 75,
    monitorMetrics: ["New subscriber conversion rate (baseline 8.5%)", "Churn rate within 30 days of increase", "ARPU trend weekly", "Competitor mention in churn surveys"],
    warningSignals: ["New subscriber conversion drops below 5%", "NPS score drops >10 points within 30 days", "Vendor complaints about reduced inquiry volume"],
    pivotTriggers: ["Conversion drops below 4% for 2 weeks → rollback pricing for new users", "Competitor launches 'free forever' plan → freeze pricing, accelerate feature differentiation", "ARPU increases >25% with <10% churn → extend pricing increase to existing users"],
  },
  {
    id: "vendor-vs-investor",
    title: "Vendor Acquisition Investment vs Investor Marketing",
    optionA: "Allocate 70% budget to vendor acquisition",
    optionB: "Allocate 70% budget to investor demand generation",
    context: "Current ratio: 500 listings, 200 active investors. Healthy marketplace target is 3:1 listing-to-investor ratio. Current ratio is 2.5:1 — slightly supply-heavy.",
    scenarios: {
      best: { label: "Best Case", icon: <ArrowUpRight className="h-4 w-4" />, color: "text-green-600 dark:text-green-400", liquidity: "Demand surge creates 5+ inquiries/listing, vendor satisfaction peaks", revenue: "+50% monetization from demand-side products", timeline: "Demand impact visible within 3 weeks", probability: 30, description: "Investor acquisition campaigns perform well. Inquiry velocity doubles. Vendors see immediate ROI, reducing churn and increasing upgrade rates." },
      expected: { label: "Expected", icon: <Minus className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400", liquidity: "Inquiry-per-listing rises from 3 to 4.2, gradual improvement", revenue: "+25% from investor subscriptions and deal unlocks", timeline: "Steady improvement over 6-8 weeks", probability: 50, description: "Demand grows steadily. Some listings remain under-engaged. Overall marketplace health improves." },
      downside: { label: "Downside", icon: <ArrowDownRight className="h-4 w-4" />, color: "text-destructive", liquidity: "Low-quality investor traffic inflates numbers but not conversions", revenue: "Flat — high CAC investors don't convert to paid", timeline: "3 months of spend with minimal ROI", probability: 20, description: "Marketing spend attracts browsers, not buyers. Inquiry quality drops. Vendors complain about 'tire-kicker' leads." },
    },
    secondOrder: [
      { effect: "Higher inquiry velocity is the #1 driver of vendor satisfaction and retention", positive: true },
      { effect: "Neglecting vendor acquisition may create supply shortage when demand scales", positive: false },
      { effect: "Investor data accumulation accelerates AI matching model training", positive: true },
      { effect: "Vendor acquisition requires relationship-building that doesn't scale with ad spend", positive: false },
    ],
    recommendation: "INVEST IN DEMAND (investors) when supply-to-demand ratio exceeds 2:1. Current 2.5:1 ratio means supply is adequate — the bottleneck is demand density. Shift to 65% investor / 35% vendor allocation.",
    shortTermImpact: 75,
    longTermMoat: 65,
    capitalEfficiency: 70,
    executionComplexity: 60,
    monitorMetrics: ["Inquiries per listing (target >4)", "Investor CAC by channel", "Vendor satisfaction score (weekly survey)", "Listing-to-investor ratio"],
    warningSignals: ["Inquiry quality score dropping below 60/100", "Vendor churn exceeding 8% monthly", "CAC exceeding Rp 180K blended", "Supply-to-demand ratio dropping below 1.5:1"],
    pivotTriggers: ["Ratio drops below 1.8:1 → immediately shift 60% budget to vendor acquisition", "Investor CAC exceeds 2x target → pause paid channels, focus on organic/referral", "Vendor churn spikes >10% → emergency vendor retention campaign"],
  },
  {
    id: "feature-vs-revenue",
    title: "Product Feature Build vs Revenue Campaign",
    optionA: "Build AI deal matching engine (8-week sprint)",
    optionB: "Launch monetization campaign with existing features",
    context: "Current product has listing, search, and basic inquiry features. AI matching could differentiate significantly but delays revenue focus. Revenue campaigns could generate $15-25K/month with current features.",
    scenarios: {
      best: { label: "Best Case", icon: <ArrowUpRight className="h-4 w-4" />, color: "text-green-600 dark:text-green-400", liquidity: "AI matching increases inquiry relevance 3x, conversion doubles", revenue: "Delayed 8 weeks but launches with $40K/month potential", timeline: "Revenue acceleration starts week 10", probability: 20, description: "AI matching is a breakthrough feature. Investors love it. Media coverage drives organic growth. Premium tier becomes irresistible." },
      expected: { label: "Expected", icon: <Minus className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400", liquidity: "Moderate matching improvement, 40% better inquiry relevance", revenue: "Delayed 8 weeks, launches at $20K/month", timeline: "12 weeks to revenue impact", probability: 50, description: "AI matching works but requires iteration. Initial version is good, not great. Revenue ramp is slower than monetizing existing features." },
      downside: { label: "Downside", icon: <ArrowDownRight className="h-4 w-4" />, color: "text-destructive", liquidity: "Feature takes 12+ weeks, matching accuracy disappoints", revenue: "Zero revenue for 12 weeks, runway pressure increases", timeline: "16+ weeks to any revenue impact", probability: 30, description: "Engineering timeline slips. AI matching requires more data than available. Runway pressure forces rushed monetization launch." },
    },
    secondOrder: [
      { effect: "Building AI early creates compounding data advantage — 6 months of learning", positive: true },
      { effect: "8 weeks without revenue focus risks running out of cash before product-market fit proof", positive: false },
      { effect: "AI matching becomes a defensible moat competitors cannot replicate quickly", positive: true },
      { effect: "Investors want to see revenue traction, not just product vision", positive: false },
    ],
    recommendation: "LAUNCH REVENUE CAMPAIGN NOW with existing features (2-week sprint). Simultaneously start AI matching as background project (80/20 split). Revenue proves market demand; AI matching deepens the moat. Don't choose — sequence.",
    shortTermImpact: 85,
    longTermMoat: 70,
    capitalEfficiency: 85,
    executionComplexity: 55,
    monitorMetrics: ["Revenue from existing features (target $15K/month in 30 days)", "AI matching beta accuracy rate", "Runway remaining in months", "User feedback on matching relevance"],
    warningSignals: ["Revenue campaign generates <$5K in first 30 days", "AI matching accuracy below 60% after 4 weeks of training", "Team morale declining from context-switching"],
    pivotTriggers: ["Revenue exceeds $20K/month → allocate dedicated team to AI matching", "Revenue below $8K after 45 days → pause AI, focus entirely on monetization", "Competitor launches AI matching → accelerate AI timeline, accept revenue delay"],
  },
];

const scoreColor = (v: number) => {
  if (v >= 75) return "text-green-600 dark:text-green-400";
  if (v >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
};

/* ───────── component ───────── */

const StrategicDecisionSimulator: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(decisions[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggle = (id: string) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Strategic Decision Simulator"
        description="4 high-impact decision scenarios with best/expected/downside modeling, second-order effects & pivot triggers"
        icon={GitBranch}
        badge={{ text: "🧠 Decisions", variant: "outline" }}
      />

      {/* Decision Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {decisions.map(d => (
          <Card
            key={d.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-border"
            onClick={() => toggle(d.id)}
          >
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{d.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" />Short-term: <span className={scoreColor(d.shortTermImpact)}>{d.shortTermImpact}</span></span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Moat: <span className={scoreColor(d.longTermMoat)}>{d.longTermMoat}</span></span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">{d.optionA}</Badge>
                <span className="text-[10px] text-muted-foreground">vs</span>
                <Badge variant="secondary" className="text-[10px]">{d.optionB}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decision Detail Cards */}
      {decisions.map(decision => (
        <Card key={decision.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => toggle(decision.id)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">{decision.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{decision.context}</p>
              </div>
              {expanded === decision.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          </CardHeader>

          {expanded === decision.id && (
            <CardContent className="space-y-5 pt-0">
              {/* Scenario Cards */}
              <div className="grid md:grid-cols-3 gap-3">
                {(["best", "expected", "downside"] as const).map(key => {
                  const s = decision.scenarios[key];
                  return (
                    <div key={key} className="rounded-[6px] border border-border bg-card p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={s.color}>{s.icon}</span>
                        <span className="text-sm font-semibold text-foreground">{s.label}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">{s.probability}% prob</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Liquidity:</span><span className="text-foreground font-medium text-right flex-1 ml-2">{s.liquidity}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Revenue:</span><span className="text-foreground font-medium text-right flex-1 ml-2">{s.revenue}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Timeline:</span><span className="text-foreground font-medium text-right flex-1 ml-2">{s.timeline}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Second-Order Consequences */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-2">Second-Order Consequences</h5>
                <div className="grid md:grid-cols-2 gap-1.5">
                  {decision.secondOrder.map((so, i) => (
                    <div key={i} className={`flex items-start gap-2 rounded-[6px] p-2.5 text-xs ${so.positive ? "bg-green-500/5 border border-green-500/20" : "bg-destructive/5 border border-destructive/20"}`}>
                      {so.positive ? <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />}
                      <span className="text-muted-foreground">{so.effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Short-Term Impact", value: decision.shortTermImpact, icon: <Zap className="h-3.5 w-3.5" /> },
                  { label: "Long-Term Moat", value: decision.longTermMoat, icon: <Shield className="h-3.5 w-3.5" /> },
                  { label: "Capital Efficiency", value: decision.capitalEfficiency, icon: <BarChart3 className="h-3.5 w-3.5" /> },
                  { label: "Ease of Execution", value: 100 - decision.executionComplexity, icon: <Target className="h-3.5 w-3.5" /> },
                ].map(s => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{s.icon}{s.label}</div>
                    <div className="flex items-center gap-2">
                      <Progress value={s.value} className="h-2 flex-1" />
                      <span className={`text-xs font-semibold ${scoreColor(s.value)}`}>{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="rounded-[6px] border border-primary/20 bg-primary/5 p-4 group relative">
                <h5 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wider">Recommended Decision</h5>
                <p className="text-sm text-foreground leading-relaxed font-medium">{decision.recommendation}</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyText(decision.recommendation, `rec-${decision.id}`)}>
                  {copiedId === `rec-${decision.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>

              {/* Monitor / Warnings / Pivots */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                  <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-primary" />Metrics to Monitor</h6>
                  {decision.monitorMetrics.map((m, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{m}</p>
                  ))}
                </div>
                <div className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                  <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-orange-500" />Warning Signals</h6>
                  {decision.warningSignals.map((w, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-orange-500 mt-0.5">⚠</span>{w}</p>
                  ))}
                </div>
                <div className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                  <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />Pivot Triggers</h6>
                  {decision.pivotTriggers.map((p, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary mt-0.5">→</span>{p}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default StrategicDecisionSimulator;
