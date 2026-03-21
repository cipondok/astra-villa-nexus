import React, { useState } from "react";
import { Brain, Database, Zap, Shield, TrendingUp, RefreshCw, Layers, Activity, Eye, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Cpu, GitBranch, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ─── Signal Ingestion Pipeline ─── */

const signalSources = [
  { name: "Browsing Interactions", signals: ["Page dwell time", "Scroll depth", "Filter sequences", "Map viewport changes", "Gallery engagement"], ingestionRate: "Real-time (<50ms)", normalization: "Session-windowed aggregation → 0–100 intensity score", icon: Eye },
  { name: "Inquiry Conversion", signals: ["View-to-inquiry ratio", "Inquiry-to-viewing rate", "Multi-property inquiry clustering", "Abandonment point tracking"], ingestionRate: "Event-driven (<200ms)", normalization: "Funnel-stage conversion probability matrix", icon: TrendingUp },
  { name: "Vendor Responsiveness", signals: ["First-response latency", "Response completeness score", "Follow-up frequency", "Inquiry resolution rate"], ingestionRate: "Batch (5-min windows)", normalization: "Percentile ranking within vendor cohort", icon: Activity },
  { name: "Listing Engagement", signals: ["Views/day trajectory", "Save-to-view ratio", "Comparison inclusion rate", "Share actions", "Return visit frequency"], ingestionRate: "Near real-time (<1s)", normalization: "Z-score deviation from listing-type baseline", icon: BarChart3 },
  { name: "Monetization Feedback", signals: ["Premium conversion triggers", "Boost ROI per listing", "Subscription churn signals", "Revenue-per-session trends"], ingestionRate: "Hourly aggregation", normalization: "Revenue attribution modeling → marginal value scoring", icon: Zap },
];

/* ─── Predictive Modules ─── */

const predictiveModules = [
  {
    name: "Demand Forecasting Engine",
    description: "Predicts inquiry volume and investor interest 7–30 days ahead using behavioral velocity signals and seasonal patterns.",
    inputs: ["Search frequency trends", "Watchlist accumulation rate", "External macro indicators", "District-level momentum"],
    outputs: ["District demand heatmap forecast", "Property-level inquiry probability", "Optimal listing timing windows"],
    accuracy: 82, confidence: 78, retrainCycle: "6 hours",
  },
  {
    name: "Supply Gap Detector",
    description: "Identifies undersupplied segments where demand signals exceed available inventory by analyzing search-to-listing ratios.",
    inputs: ["Unmatched search queries", "Filter combination frequency", "Price-range demand distribution", "Geographic search density"],
    outputs: ["Supply gap severity scores", "Developer acquisition targets", "New listing pricing recommendations"],
    accuracy: 76, confidence: 71, retrainCycle: "12 hours",
  },
  {
    name: "Monetization Opportunity Scorer",
    description: "Detects high-probability monetization moments by correlating vendor behavior patterns with conversion likelihood.",
    inputs: ["Vendor engagement trajectory", "Listing performance vs. peers", "Competitive pressure signals", "Historical upgrade patterns"],
    outputs: ["Upsell timing recommendations", "Dynamic pricing suggestions", "Premium placement ROI forecasts"],
    accuracy: 79, confidence: 74, retrainCycle: "24 hours",
  },
  {
    name: "Behavioral Segmentation Clusterer",
    description: "Autonomously discovers and refines investor behavioral archetypes for personalized experience optimization.",
    inputs: ["Multi-session interaction sequences", "Price sensitivity patterns", "Geographic preference evolution", "Decision velocity indicators"],
    outputs: ["Dynamic segment assignments", "Segment migration predictions", "Personalization strategy per cluster"],
    accuracy: 85, confidence: 81, retrainCycle: "48 hours",
  },
];

/* ─── Self-Evolution Mechanisms ─── */

const evolutionMechanisms = [
  {
    name: "Continuous Model Retraining",
    description: "Automated pipeline that detects model degradation and triggers retraining with fresh behavioral data.",
    trigger: "Accuracy drift > 3% from baseline OR 72h elapsed since last training cycle",
    process: ["Snapshot current model weights → archive", "Ingest new labeled outcomes (transactions, conversions)", "Retrain with expanding sliding window (90-day)", "Shadow-test against production model for 2 hours", "Auto-promote if performance ≥ incumbent"],
    safety: "Rollback to previous version if shadow test shows regression on any primary KPI",
    maturity: 75,
  },
  {
    name: "Experiment Outcome Reinforcement",
    description: "Growth experiments feed results back into scoring models, reinforcing successful patterns and deprioritizing failures.",
    trigger: "Experiment reaches statistical significance (p < 0.05, n > 500)",
    process: ["Capture experiment variant performance metrics", "Extract feature-outcome correlations", "Update relevant scoring weights via gradient adjustment", "Propagate learning to related models", "Log attribution chain for explainability"],
    safety: "Maximum weight adjustment per cycle capped at ±5% to prevent overcorrection",
    maturity: 60,
  },
  {
    name: "Automated Parameter Optimization",
    description: "Bayesian optimization layer that continuously tunes hyperparameters across all scoring engines.",
    trigger: "Weekly optimization cycle OR manual trigger from AI governance dashboard",
    process: ["Define parameter search space per model", "Run Bayesian optimization with acquisition function", "Evaluate candidates on holdout validation set", "Rank by composite metric (accuracy × fairness × speed)", "Apply top candidate with staged rollout (10% → 50% → 100%)"],
    safety: "Human approval required for parameter changes that shift any output by >15%",
    maturity: 45,
  },
  {
    name: "Intelligence Confidence Progression",
    description: "Meta-model that tracks confidence calibration across all predictions and adjusts autonomy levels accordingly.",
    trigger: "Continuous — recalculated after every prediction outcome is observed",
    process: ["Compare predicted confidence vs. actual outcome frequency", "Identify over-confident and under-confident prediction bands", "Recalibrate confidence thresholds per model", "Adjust automation authority based on calibration quality", "Surface poorly-calibrated domains for human review"],
    safety: "Auto-escalate to human review when confidence calibration error exceeds 10%",
    maturity: 55,
  },
];

/* ─── Governance Framework ─── */

const governanceControls = [
  { control: "Human Override Checkpoints", description: "Critical decisions (pricing changes >10%, model promotions, weight shifts >15%) require explicit human approval before production deployment.", status: "active", severity: "critical" },
  { control: "Model Drift Detection", description: "Statistical monitors (PSI, KS-test) continuously compare production input distributions against training distributions. Alerts fire when drift exceeds configurable thresholds.", status: "active", severity: "high" },
  { control: "Performance Validation Dashboard", description: "Real-time comparison of predicted vs. actual outcomes across all models with automatic accuracy tracking, latency monitoring, and coverage metrics.", status: "active", severity: "medium" },
  { control: "Auto-Rollback Protocol", description: "If any model's primary KPI degrades by >5% within 2 hours of deployment, automatic rollback to the previous stable version is triggered.", status: "active", severity: "critical" },
  { control: "Explainability Audit Trail", description: "Every automated decision logs its input features, model version, confidence score, and contributing factors for post-hoc analysis and regulatory compliance.", status: "active", severity: "high" },
  { control: "Fairness & Bias Monitoring", description: "Continuous statistical parity checks ensure scoring models don't systematically disadvantage any geographic or demographic segment.", status: "planned", severity: "high" },
];

/* ─── Maturity Roadmap ─── */

const maturityPhases = [
  {
    phase: "Phase 1 — Assisted Intelligence",
    timeline: "Months 0–6",
    description: "Human-directed AI with automated data collection and basic scoring. All decisions require human confirmation.",
    capabilities: ["Automated signal ingestion pipeline", "Rule-based scoring with configurable weights", "Basic A/B testing framework", "Manual model retraining triggers", "Dashboard-driven decision support"],
    autonomy: 20,
    color: "text-muted-foreground",
  },
  {
    phase: "Phase 2 — Augmented Intelligence",
    timeline: "Months 6–12",
    description: "AI proactively recommends actions with confidence scores. Low-risk decisions auto-execute; high-risk decisions await approval.",
    capabilities: ["Predictive demand and supply gap models", "Automated retraining with shadow testing", "Experiment outcome reinforcement loop", "Confidence-gated automation (>90% = auto)", "Drift detection and alerting"],
    autonomy: 50,
    color: "text-chart-4",
  },
  {
    phase: "Phase 3 — Semi-Autonomous Optimization",
    timeline: "Months 12–24",
    description: "AI manages routine optimization autonomously. Humans focus on strategy, edge cases, and governance oversight.",
    capabilities: ["Bayesian hyperparameter self-tuning", "Multi-model ensemble orchestration", "Autonomous pricing within guardrails", "Cross-model learning transfer", "Predictive governance escalation"],
    autonomy: 75,
    color: "text-primary",
  },
  {
    phase: "Phase 4 — Adaptive Intelligence",
    timeline: "Months 24+",
    description: "Self-evolving system that discovers new optimization opportunities, designs its own experiments, and compounds intelligence advantages.",
    capabilities: ["Autonomous experiment design and execution", "Novel feature discovery from raw signals", "Cross-market intelligence transfer", "Self-healing model infrastructure", "Strategic scenario simulation engine"],
    autonomy: 90,
    color: "text-chart-2",
  },
];

/* ─── Component ─── */

const AIEvolutionArchitecture: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [expandedMech, setExpandedMech] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="AI Self-Evolution Architecture"
        description="Adaptive intelligence system — signal ingestion, predictive modeling, self-learning loops & governance framework"
        icon={Brain}
        badge={{ text: "🧬 Evolution", variant: "outline" }}
      />

      {/* System health strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Signal Ingestion", value: "5 Pipelines", icon: Database, status: "active" },
          { label: "Predictive Models", value: "4 Active", icon: Cpu, status: "active" },
          { label: "Learning Loops", value: "4 Mechanisms", icon: RefreshCw, status: "active" },
          { label: "Governance Controls", value: "6 Active", icon: Shield, status: "active" },
          { label: "System Maturity", value: "Phase 2", icon: Layers, status: "evolving" },
        ].map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-3 text-center">
              <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-[8px] mt-1">{s.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="ingestion" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="ingestion" className="text-xs">Signal Ingestion</TabsTrigger>
          <TabsTrigger value="predictive" className="text-xs">Predictive Models</TabsTrigger>
          <TabsTrigger value="evolution" className="text-xs">Self-Evolution</TabsTrigger>
          <TabsTrigger value="governance" className="text-xs">Governance</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Maturity Roadmap</TabsTrigger>
        </TabsList>

        {/* Signal Ingestion */}
        <TabsContent value="ingestion" className="mt-4 space-y-3">
          {signalSources.map((s, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{s.name}</h4>
                      <Badge variant="outline" className="text-[9px]">{s.ingestionRate}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.signals.map((sig, j) => (
                        <Badge key={j} variant="secondary" className="text-[9px]">{sig}</Badge>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Normalization:</span> {s.normalization}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Predictive Models */}
        <TabsContent value="predictive" className="mt-4 space-y-3">
          {predictiveModules.map((m, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{m.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{m.description}</p>
                  </div>
                  <button onClick={() => setExpandedModule(expandedModule === i ? null : i)} className="p-1 hover:bg-muted/50 rounded">
                    {expandedModule === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Accuracy</span>
                      <span className={cn("text-xs font-bold", m.accuracy >= 80 ? "text-chart-2" : "text-chart-4")}>{m.accuracy}%</span>
                    </div>
                    <Progress value={m.accuracy} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className={cn("text-xs font-bold", m.confidence >= 75 ? "text-chart-2" : "text-chart-4")}>{m.confidence}%</span>
                    </div>
                    <Progress value={m.confidence} className="h-1.5" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground">Retrain Cycle</span>
                    <p className="text-xs font-semibold text-foreground">{m.retrainCycle}</p>
                  </div>
                </div>

                {expandedModule === i && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">INPUTS</p>
                      {m.inputs.map((inp, j) => (
                        <p key={j} className="text-[11px] text-foreground flex items-center gap-1"><span className="text-primary">→</span> {inp}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">OUTPUTS</p>
                      {m.outputs.map((out, j) => (
                        <p key={j} className="text-[11px] text-foreground flex items-center gap-1"><span className="text-chart-2">←</span> {out}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Self-Evolution */}
        <TabsContent value="evolution" className="mt-4 space-y-3">
          {evolutionMechanisms.map((m, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{m.name}</h4>
                      <Badge variant="secondary" className="text-[9px]">Maturity: {m.maturity}%</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{m.description}</p>
                  </div>
                  <button onClick={() => setExpandedMech(expandedMech === i ? null : i)} className="p-1 hover:bg-muted/50 rounded">
                    {expandedMech === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Implementation Maturity</span>
                    <span className="text-xs font-bold text-foreground">{m.maturity}%</span>
                  </div>
                  <Progress value={m.maturity} className="h-1.5" />
                </div>

                <div className="bg-chart-4/5 border border-chart-4/20 rounded-lg p-2">
                  <p className="text-[10px] font-semibold text-chart-4">Trigger Condition</p>
                  <p className="text-[11px] text-foreground">{m.trigger}</p>
                </div>

                {expandedMech === i && (
                  <div className="space-y-3 pt-2 border-t border-border/30">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">EXECUTION STEPS</p>
                      {m.process.map((step, j) => (
                        <div key={j} className="flex items-start gap-2 py-1">
                          <Badge variant="outline" className="text-[8px] h-4 w-4 flex items-center justify-center shrink-0 p-0">{j + 1}</Badge>
                          <p className="text-[11px] text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-destructive">Safety Guardrail</p>
                      <p className="text-[11px] text-foreground">{m.safety}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Governance */}
        <TabsContent value="governance" className="mt-4 space-y-3">
          {governanceControls.map((g, i) => (
            <Card key={i} className={cn("border-border", g.severity === "critical" && "border-destructive/30")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-lg shrink-0", g.severity === "critical" ? "bg-destructive/10" : g.severity === "high" ? "bg-chart-4/10" : "bg-muted/30")}>
                    {g.severity === "critical" ? <Shield className="h-4 w-4 text-destructive" /> : g.severity === "high" ? <AlertTriangle className="h-4 w-4 text-chart-4" /> : <CheckCircle className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{g.control}</h4>
                      <Badge variant={g.status === "active" ? "default" : "secondary"} className="text-[9px]">{g.status}</Badge>
                      <Badge variant="outline" className={cn("text-[9px]", g.severity === "critical" ? "text-destructive border-destructive/30" : g.severity === "high" ? "text-chart-4 border-chart-4/30" : "text-muted-foreground")}>{g.severity}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{g.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Maturity Roadmap */}
        <TabsContent value="roadmap" className="mt-4 space-y-3">
          {maturityPhases.map((p, i) => (
            <Card key={i} className={cn("border-border", i === 1 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={cn("text-sm font-bold", p.color)}>{p.phase}</h4>
                    <p className="text-[10px] text-muted-foreground">{p.timeline}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-lg font-bold", p.color)}>{p.autonomy}%</p>
                    <p className="text-[9px] text-muted-foreground">Autonomy Level</p>
                  </div>
                </div>
                <Progress value={p.autonomy} className="h-2" />
                <p className="text-[11px] text-foreground">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.capabilities.map((c, j) => (
                    <Badge key={j} variant="outline" className="text-[9px]">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEvolutionArchitecture;
