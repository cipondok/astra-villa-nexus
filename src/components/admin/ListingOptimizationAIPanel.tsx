import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, TrendingUp, Zap, AlertTriangle, BarChart3, Clock, Target, ArrowUp, ArrowDown, Minus } from "lucide-react";

/* ── Decision Logic Tab ──────────────────────────────────────── */

const decisionRules = [
  {
    signal: "Stagnation Alert",
    condition: "views < district_avg × 0.4 AND days_on_market > 30",
    action: "Trigger visibility boost + price review recommendation",
    priority: "Critical",
  },
  {
    signal: "CTR Decline",
    condition: "CTR drops > 15% over 7-day window",
    action: "Auto-suggest photo refresh + title A/B test",
    priority: "High",
  },
  {
    signal: "Price Misalignment",
    condition: "price > FMV × 1.12 AND inquiries < 3 in 14d",
    action: "Generate optimal price range + urgency nudge to agent",
    priority: "High",
  },
  {
    signal: "Content Gap",
    condition: "photo_count < 5 OR desc_length < 150 chars",
    action: "Content enhancement alert with specific improvement list",
    priority: "Medium",
  },
  {
    signal: "Liquidity Drop",
    condition: "liquidity_score trend < −8 over 21d",
    action: "Marketing boost trigger + competitor positioning brief",
    priority: "High",
  },
  {
    signal: "Conversion Lag",
    condition: "views > 200 BUT inquiries < 2",
    action: "Diagnose pricing/content mismatch + recommend A/B split",
    priority: "Medium",
  },
  {
    signal: "Hot Market Opportunity",
    condition: "district_demand_trend > +12% AND listing undervalued",
    action: "Recommend 3-5% price increase + premium visibility slot",
    priority: "Strategic",
  },
];

function DecisionLogicTab() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Composite Optimization Score Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed">
            <p className="text-foreground font-semibold mb-2">listing_optimization_score =</p>
            <p className="pl-4 text-muted-foreground">(visibility_index × 0.25)</p>
            <p className="pl-4 text-muted-foreground">+ (engagement_rate × 0.20)</p>
            <p className="pl-4 text-muted-foreground">+ (price_competitiveness × 0.20)</p>
            <p className="pl-4 text-muted-foreground">+ (content_completeness × 0.15)</p>
            <p className="pl-4 text-muted-foreground">+ (conversion_efficiency × 0.12)</p>
            <p className="pl-4 text-muted-foreground">+ (liquidity_momentum × 0.08)</p>
            <p className="mt-3 text-xs text-muted-foreground">Range: 0–100 · Recalculated every 4 hours · District-normalized</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Decision Rules Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {decisionRules.map((rule, i) => (
              <div key={i} className="border border-border/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{rule.signal}</span>
                  <Badge variant={rule.priority === "Critical" ? "destructive" : rule.priority === "High" ? "default" : "secondary"} className="text-xs">
                    {rule.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mb-1">IF: {rule.condition}</p>
                <p className="text-xs text-foreground/80">→ {rule.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Feedback Loop Tab ───────────────────────────────────────── */

const loopStages = [
  { stage: "Signal Collection", desc: "Ingest views, clicks, inquiries, saves, shares from behavioral_events", interval: "Real-time", icon: Eye },
  { stage: "Benchmark Comparison", desc: "Compare listing KPIs against district averages and top-10% performers", interval: "4h", icon: BarChart3 },
  { stage: "Gap Detection", desc: "Identify underperformance signals via decision rules engine", interval: "4h", icon: AlertTriangle },
  { stage: "Action Generation", desc: "Generate ranked optimization actions with expected impact scores", interval: "On detection", icon: Zap },
  { stage: "Delivery & Tracking", desc: "Push alerts to agents/admin, log actions, measure outcome delta", interval: "Continuous", icon: Target },
  { stage: "Model Calibration", desc: "Compare predicted vs actual impact, adjust rule weights quarterly", interval: "90d", icon: TrendingUp },
];

function FeedbackLoopTab() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Performance Feedback Loop Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loopStages.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    {i < loopStages.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{s.stage}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.interval}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Self-Learning Calibration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { metric: "Price Adjustment Accuracy", predicted: 72, actual: 68, delta: -4 },
            { metric: "Content Enhancement Impact", predicted: 45, actual: 51, delta: +6 },
            { metric: "Visibility Boost Conversion", predicted: 18, actual: 15, delta: -3 },
            { metric: "Stagnation Alert Precision", predicted: 85, actual: 82, delta: -3 },
          ].map((m, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{m.metric}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs">P:{m.predicted}%</span>
                <span className="font-mono text-xs">A:{m.actual}%</span>
                <span className={`font-mono text-xs flex items-center gap-0.5 ${m.delta > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {m.delta > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(m.delta)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Performance Dashboard Tab ───────────────────────────────── */

const dashboardWidgets = [
  {
    title: "Optimization Score Distribution",
    type: "Histogram",
    desc: "Breakdown of all active listings by optimization score band (0-25, 26-50, 51-75, 76-100)",
    placement: "Hero — full width",
    refresh: "4h",
  },
  {
    title: "Stagnation Watchlist",
    type: "Sortable Table",
    desc: "Listings with score < 35, sorted by days_on_market. Columns: title, city, score, views, inquiries, DOM, suggested action",
    placement: "Left column",
    refresh: "4h",
  },
  {
    title: "Action Impact Tracker",
    type: "Timeline Chart",
    desc: "Before/after KPI comparison for listings that received optimization actions in last 30 days",
    placement: "Right column",
    refresh: "24h",
  },
  {
    title: "District Benchmark Heatmap",
    type: "Choropleth",
    desc: "Average optimization score per district, highlighting underperforming zones",
    placement: "Full width",
    refresh: "24h",
  },
  {
    title: "Conversion Funnel by Segment",
    type: "Funnel Chart",
    desc: "Views → Saves → Inquiries → Viewings → Offers breakdown segmented by property type",
    placement: "Left column",
    refresh: "12h",
  },
  {
    title: "AI Action Queue",
    type: "Live Feed",
    desc: "Real-time stream of generated optimization actions with status: pending, applied, dismissed",
    placement: "Right column",
    refresh: "Real-time",
  },
];

function PerformanceDashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: "Active Listings", value: "4,218", trend: "+127 this week", up: true },
          { label: "Avg Optimization Score", value: "61.4", trend: "+2.3 vs last month", up: true },
          { label: "Stagnated Listings", value: "342", trend: "8.1% of total", up: false },
          { label: "Actions Applied (30d)", value: "1,847", trend: "73% acceptance rate", up: true },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? "text-emerald-600" : "text-amber-600"}`}>
                {kpi.up ? <ArrowUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {kpi.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Dashboard Widget Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardWidgets.map((w, i) => (
              <div key={i} className="border border-border/40 rounded-lg p-3 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{w.title}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{w.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{w.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{w.placement}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />{w.refresh}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Rollout Plan Tab ────────────────────────────────────────── */

const rolloutPhases = [
  {
    phase: "Phase 1 — Observation Mode",
    duration: "Weeks 1-4",
    progress: 100,
    items: [
      "Deploy scoring model against all active listings (read-only)",
      "Validate optimization score correlation with actual deal outcomes",
      "Baseline district benchmarks and stagnation thresholds",
      "Admin-only dashboard with no agent-facing alerts",
    ],
    outcome: "Scoring accuracy validated at ≥70% correlation with deal velocity",
  },
  {
    phase: "Phase 2 — Advisory Alerts",
    duration: "Weeks 5-10",
    progress: 65,
    items: [
      "Enable stagnation + content gap alerts for agents (non-blocking)",
      "Push price optimization suggestions to admin review queue",
      "A/B test alert messaging cadence (daily vs weekly digest)",
      "Track action adoption rate and outcome improvement",
    ],
    outcome: "Agent adoption rate >40%, measurable inquiry lift on actioned listings",
  },
  {
    phase: "Phase 3 — Semi-Autonomous Actions",
    duration: "Weeks 11-18",
    progress: 30,
    items: [
      "Auto-apply visibility boosts for score < 30 listings (admin-approved rules)",
      "Dynamic ranking recalibration in search results based on optimization score",
      "Marketing boost triggers with budget guardrails",
      "Automated content enhancement suggestions with one-click apply",
    ],
    outcome: "20% reduction in avg days-on-market for optimized listings",
  },
  {
    phase: "Phase 4 — Full Autonomous Engine",
    duration: "Weeks 19-26",
    progress: 0,
    items: [
      "Closed-loop: action → measure → recalibrate without human approval",
      "Predictive stagnation prevention (act before decline begins)",
      "Cross-listing optimization (portfolio-level strategy for multi-listing agents)",
      "Self-tuning weight model with quarterly accuracy reports",
    ],
    outcome: "Fully autonomous optimization with <5% false-positive action rate",
  },
];

function RolloutPlanTab() {
  return (
    <div className="space-y-4">
      {rolloutPhases.map((p, i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{p.phase}</span>
              <Badge variant="outline" className="text-xs">{p.duration}</Badge>
            </div>
            <Progress value={p.progress} className="h-1.5 mb-3" />
            <ul className="space-y-1.5 mb-3">
              {p.items.map((item, j) => (
                <li key={j} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-muted/40 rounded p-2">
              <p className="text-xs"><span className="font-medium">Success Gate:</span> <span className="text-muted-foreground">{p.outcome}</span></p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────────────── */

export default function ListingOptimizationAIPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Autonomous Listing Optimization AI</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Continuous performance analysis with automated visibility, pricing, and content optimization actions.
        </p>
      </div>

      <Tabs defaultValue="decision-logic" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="decision-logic" className="text-xs">Decision Logic</TabsTrigger>
          <TabsTrigger value="feedback-loop" className="text-xs">Feedback Loop</TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
          <TabsTrigger value="rollout" className="text-xs">Rollout Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="decision-logic"><DecisionLogicTab /></TabsContent>
        <TabsContent value="feedback-loop"><FeedbackLoopTab /></TabsContent>
        <TabsContent value="dashboard"><PerformanceDashboardTab /></TabsContent>
        <TabsContent value="rollout"><RolloutPlanTab /></TabsContent>
      </Tabs>
    </div>
  );
}
