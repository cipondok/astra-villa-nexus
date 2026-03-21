import React, { useState, useMemo } from "react";
import { FlaskConical, Zap, TrendingUp, Clock, AlertTriangle, ChevronDown, ChevronUp, Play, Pause, RotateCcw, ArrowUpDown, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types ───────── */

type Category = "demand" | "conversion" | "pricing" | "vendor" | "viral";
type Priority = "quick-win" | "accelerator" | "moat-builder";
type Status = "queued" | "running" | "completed" | "paused";

interface Experiment {
  id: string;
  name: string;
  category: Category;
  priority: Priority;
  hypothesis: string;
  impactScore: number;
  complexityRating: number;
  resources: string[];
  timeToResult: string;
  status: Status;
  weekSlot: number;
  expectedLift: string;
  kpi: string;
}

/* ───────── data ───────── */

const categoryMeta: Record<Category, { label: string; color: string }> = {
  demand: { label: "Demand Acquisition", color: "text-primary" },
  conversion: { label: "Conversion Funnel", color: "text-chart-2" },
  pricing: { label: "Pricing Psychology", color: "text-chart-3" },
  vendor: { label: "Vendor Onboarding", color: "text-chart-4" },
  viral: { label: "Referral & Viral", color: "text-chart-5" },
};

const priorityMeta: Record<Priority, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  "quick-win": { label: "⚡ Quick Win", variant: "default" },
  "accelerator": { label: "🚀 Accelerator", variant: "secondary" },
  "moat-builder": { label: "🏰 Moat Builder", variant: "destructive" },
};

const experiments: Experiment[] = [
  // Quick wins
  { id: "e1", name: "Urgency countdown on premium listings", category: "pricing", priority: "quick-win", hypothesis: "Adding 48h countdown timer to premium listing slots increases purchase conversion by 25%", impactScore: 88, complexityRating: 15, resources: ["Frontend dev (2h)", "Analytics tag"], timeToResult: "3 days", status: "queued", weekSlot: 1, expectedLift: "+25% slot conversion", kpi: "Premium slot purchase rate" },
  { id: "e2", name: "WhatsApp deep-link on inquiry CTA", category: "conversion", priority: "quick-win", hypothesis: "Replacing email inquiry with WhatsApp deep-link increases inquiry-to-viewing rate by 40%", impactScore: 92, complexityRating: 10, resources: ["Frontend dev (1h)"], timeToResult: "2 days", status: "queued", weekSlot: 1, expectedLift: "+40% inquiry-to-viewing", kpi: "Inquiry conversion rate" },
  { id: "e3", name: "Social proof badge — 'X investors viewed'", category: "demand", priority: "quick-win", hypothesis: "Displaying real-time viewer count creates social proof urgency, increasing inquiry rate by 18%", impactScore: 79, complexityRating: 20, resources: ["Frontend dev (3h)", "Real-time counter"], timeToResult: "4 days", status: "queued", weekSlot: 1, expectedLift: "+18% inquiry rate", kpi: "Listing inquiry velocity" },
  { id: "e4", name: "Charm pricing on subscription tiers", category: "pricing", priority: "quick-win", hypothesis: "Rp 499K vs Rp 500K increases subscription conversion by 12% via left-digit anchoring", impactScore: 72, complexityRating: 5, resources: ["Config change"], timeToResult: "1 day", status: "queued", weekSlot: 2, expectedLift: "+12% sub conversion", kpi: "Subscription conversion rate" },
  // Accelerators
  { id: "e5", name: "AI-personalized property digest email", category: "demand", priority: "accelerator", hypothesis: "Weekly AI-curated digest based on investor DNA increases repeat sessions by 35% and inquiry volume by 20%", impactScore: 85, complexityRating: 55, resources: ["Backend dev (8h)", "Email service", "AI scoring"], timeToResult: "2 weeks", status: "queued", weekSlot: 2, expectedLift: "+35% repeat sessions", kpi: "WAU / inquiry volume" },
  { id: "e6", name: "Vendor 'First 30 Days Free' activation", category: "vendor", priority: "accelerator", hypothesis: "Free trial period for new vendors increases onboarding rate by 60% with 25% conversion to paid", impactScore: 83, complexityRating: 40, resources: ["Backend dev (4h)", "Billing logic", "Onboarding flow"], timeToResult: "10 days", status: "queued", weekSlot: 3, expectedLift: "+60% vendor onboarding", kpi: "Vendor activation rate" },
  { id: "e7", name: "Multi-step inquiry qualification flow", category: "conversion", priority: "accelerator", hypothesis: "Progressive profiling during inquiry increases lead quality score by 45% and agent response rate by 30%", impactScore: 78, complexityRating: 50, resources: ["Frontend dev (6h)", "Form builder", "Scoring logic"], timeToResult: "2 weeks", status: "queued", weekSlot: 3, expectedLift: "+45% lead quality", kpi: "Lead qualification score" },
  { id: "e8", name: "Dynamic boost pricing by demand zone", category: "pricing", priority: "accelerator", hypothesis: "Surge pricing boosts in high-demand districts increases boost revenue by 35% without reducing purchase rate", impactScore: 81, complexityRating: 60, resources: ["Backend dev (10h)", "Demand scoring", "Pricing engine"], timeToResult: "3 weeks", status: "queued", weekSlot: 4, expectedLift: "+35% boost revenue", kpi: "Boost ARPU" },
  { id: "e9", name: "Vendor performance leaderboard", category: "vendor", priority: "accelerator", hypothesis: "Public vendor ranking system increases response speed by 40% and creates competitive quality improvement", impactScore: 76, complexityRating: 45, resources: ["Frontend dev (5h)", "Scoring pipeline"], timeToResult: "2 weeks", status: "queued", weekSlot: 4, expectedLift: "+40% vendor response", kpi: "Vendor response time" },
  // Moat builders
  { id: "e10", name: "Investor referral reward loop", category: "viral", priority: "moat-builder", hypothesis: "Refer-an-investor program with Pro month reward creates 2.3x viral coefficient and reduces CAC by 40%", impactScore: 90, complexityRating: 65, resources: ["Full-stack dev (12h)", "Referral tracking", "Reward system"], timeToResult: "3 weeks", status: "queued", weekSlot: 5, expectedLift: "2.3x viral coefficient", kpi: "Referral-driven signups" },
  { id: "e11", name: "Vendor content syndication network", category: "viral", priority: "moat-builder", hypothesis: "Auto-distributing vendor listings to social channels increases organic reach by 300% and creates content moat", impactScore: 86, complexityRating: 70, resources: ["Backend dev (15h)", "Social APIs", "Content engine"], timeToResult: "4 weeks", status: "queued", weekSlot: 6, expectedLift: "+300% organic reach", kpi: "Organic traffic share" },
  { id: "e12", name: "Embedded analytics for vendor retention", category: "vendor", priority: "moat-builder", hypothesis: "Giving vendors performance dashboards increases 6-month retention by 45% and creates switching cost moat", impactScore: 84, complexityRating: 75, resources: ["Full-stack dev (20h)", "Analytics pipeline", "Dashboard UI"], timeToResult: "5 weeks", status: "queued", weekSlot: 7, expectedLift: "+45% vendor retention", kpi: "6-month vendor retention" },
  { id: "e13", name: "District intelligence report gating", category: "demand", priority: "moat-builder", hypothesis: "Gating AI district reports behind signup increases registrations by 50% and builds proprietary data moat", impactScore: 82, complexityRating: 35, resources: ["Frontend dev (4h)", "Content gating", "Report gen"], timeToResult: "10 days", status: "queued", weekSlot: 5, expectedLift: "+50% signups", kpi: "Registration conversion" },
  { id: "e14", name: "Deal discovery share mechanic", category: "viral", priority: "moat-builder", hypothesis: "One-tap deal sharing with branded preview cards increases viral discovery by 180% and strengthens network effects", impactScore: 80, complexityRating: 45, resources: ["Frontend dev (6h)", "OG meta generation", "Share tracking"], timeToResult: "2 weeks", status: "queued", weekSlot: 6, expectedLift: "+180% viral discovery", kpi: "Shared listing click-through" },
];

const weekCycleGuidance = [
  { day: "Monday", activity: "Launch new experiment variant", detail: "Deploy A/B split, verify tracking, announce to team" },
  { day: "Tuesday–Thursday", activity: "Collect data, monitor anomalies", detail: "Check statistical significance daily, watch for guardrail violations" },
  { day: "Friday", activity: "Analyze results, decide ship/kill/iterate", detail: "Review against hypothesis, document learnings, update backlog scores" },
  { day: "Weekend", activity: "Auto-learning cycle runs", detail: "Feedback loop recalculates priority scores based on completed experiment outcomes" },
];

/* ───────── component ───────── */

const ExperimentPrioritization: React.FC = () => {
  const [sortBy, setSortBy] = useState<"impact" | "complexity" | "priority">("impact");
  const [filterCat, setFilterCat] = useState<Category | "all">("all");
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(experiments.map(e => [e.id, e.status]))
  );
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  const sorted = useMemo(() => {
    let list = [...experiments];
    if (filterCat !== "all") list = list.filter(e => e.category === filterCat);
    switch (sortBy) {
      case "impact": list.sort((a, b) => b.impactScore - a.impactScore); break;
      case "complexity": list.sort((a, b) => a.complexityRating - b.complexityRating); break;
      case "priority": {
        const order: Priority[] = ["quick-win", "accelerator", "moat-builder"];
        list.sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority) || b.impactScore - a.impactScore);
        break;
      }
    }
    return list;
  }, [sortBy, filterCat]);

  const toggleStatus = (id: string) => {
    setStatuses(prev => {
      const cur = prev[id];
      const next: Status = cur === "queued" ? "running" : cur === "running" ? "completed" : cur === "paused" ? "running" : "queued";
      return { ...prev, [id]: next };
    });
  };

  const statusIcon = (s: Status) => {
    switch (s) {
      case "running": return <Pause className="h-3 w-3" />;
      case "completed": return <RotateCcw className="h-3 w-3" />;
      case "paused": return <Play className="h-3 w-3" />;
      default: return <Play className="h-3 w-3" />;
    }
  };

  const runningCount = Object.values(statuses).filter(s => s === "running").length;
  const completedCount = Object.values(statuses).filter(s => s === "completed").length;
  const avgImpact = Math.round(experiments.reduce((s, e) => s + e.impactScore, 0) / experiments.length);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Experiment Prioritization Engine"
        description="Autonomous growth experiment ranking — impact scoring, execution complexity, weekly testing cycles & feedback loops"
        icon={FlaskConical}
        badge={{ text: "🧪 Experiments", variant: "outline" }}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Experiments", value: experiments.length, icon: <FlaskConical className="h-4 w-4 text-primary" /> },
          { label: "Running", value: runningCount, icon: <Play className="h-4 w-4 text-chart-2" /> },
          { label: "Completed", value: completedCount, icon: <RotateCcw className="h-4 w-4 text-chart-3" /> },
          { label: "Avg Impact Score", value: avgImpact, icon: <Zap className="h-4 w-4 text-chart-4" /> },
        ].map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
          <SelectTrigger className="w-40 h-8 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="impact">Highest Impact</SelectItem>
            <SelectItem value="complexity">Lowest Complexity</SelectItem>
            <SelectItem value="priority">Priority Tier</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCat} onValueChange={v => setFilterCat(v as any)}>
          <SelectTrigger className="w-44 h-8 text-xs"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryMeta).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experiment List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="list" className="text-xs">Ranked Backlog</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">Weekly Cycle</TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs">Feedback Loop</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2 mt-4">
          {sorted.map((exp, idx) => {
            const st = statuses[exp.id];
            const cat = categoryMeta[exp.category];
            const pri = priorityMeta[exp.priority];
            return (
              <Card key={exp.id} className={cn("border-border transition-all", st === "running" && "ring-1 ring-chart-2/30")}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{exp.name}</span>
                          <Badge variant={pri.variant} className="text-[9px]">{pri.label}</Badge>
                          <span className={cn("text-[10px] font-medium", cat.color)}>{cat.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{exp.hypothesis}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 shrink-0" onClick={() => toggleStatus(exp.id)}>
                      {statusIcon(st)}
                      <span className="capitalize">{st}</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Impact</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Progress value={exp.impactScore} className="h-1.5 flex-1" />
                        <span className="font-bold text-foreground">{exp.impactScore}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Complexity</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Progress value={exp.complexityRating} className="h-1.5 flex-1" />
                        <span className="font-bold text-foreground">{exp.complexityRating}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Result</span>
                      <p className="font-medium text-foreground mt-0.5">{exp.timeToResult}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Lift</span>
                      <p className="font-medium text-chart-2 mt-0.5">{exp.expectedLift}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">KPI</span>
                      <p className="font-medium text-foreground mt-0.5">{exp.kpi}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {exp.resources.map((r, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px]">{r}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="weekly" className="mt-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Weekly Testing Cycle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weekCycleGuidance.map((w, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="h-7 w-20 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {w.day}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{w.activity}</p>
                    <p className="text-[11px] text-muted-foreground">{w.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">8-Week Experiment Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {Array.from({ length: 8 }, (_, w) => {
                const weekExps = experiments.filter(e => e.weekSlot === w + 1);
                return (
                  <div key={w} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <Badge variant="secondary" className="text-[10px] w-16 justify-center shrink-0">Week {w + 1}</Badge>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {weekExps.length > 0 ? weekExps.map(e => (
                        <Badge key={e.id} variant={priorityMeta[e.priority].variant} className="text-[9px]">
                          {e.name.split(" ").slice(0, 4).join(" ")}…
                        </Badge>
                      )) : (
                        <span className="text-[10px] text-muted-foreground italic">Buffer / iteration week</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-chart-2" /> Performance Learning Feedback Loop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { phase: "1. Measure", desc: "Collect experiment outcome data — actual lift vs predicted, statistical significance, guardrail metrics", color: "text-primary" },
                { phase: "2. Compare", desc: "Compare actual impact score against pre-experiment hypothesis — calculate prediction accuracy", color: "text-chart-2" },
                { phase: "3. Recalibrate", desc: "Update impact scoring weights based on category-level prediction accuracy — categories with consistent overestimation get dampened", color: "text-chart-3" },
                { phase: "4. Re-rank", desc: "Automatically re-prioritize remaining backlog using updated scoring model — surface experiments that benefit from new learnings", color: "text-chart-4" },
                { phase: "5. Compound", desc: "Identify successful experiments that can be combined — winning pricing + winning CTA = compound experiment with higher ceiling", color: "text-chart-5" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className={cn("text-sm font-bold shrink-0 w-24", step.color)}>{step.phase}</div>
                  <p className="text-xs text-foreground flex-1">{step.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedFeedback(!expandedFeedback)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Auto-Learning Signals</CardTitle>
                {expandedFeedback ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>
            {expandedFeedback && (
              <CardContent className="space-y-2">
                {[
                  { signal: "Impact prediction accuracy drops below 60%", action: "Trigger full scoring model recalibration using last 20 experiment outcomes" },
                  { signal: "Category consistently outperforms predictions by >30%", action: "Increase category weight multiplier by 1.2x and surface more experiments from that category" },
                  { signal: "Experiment fails guardrail metric (e.g. bounce rate spike)", action: "Auto-pause experiment, flag for review, reduce impact score of similar experiments" },
                  { signal: "Compound experiment outperforms components by >50%", action: "Create new compound experiment templates and prioritize combination testing" },
                  { signal: "Time-to-result consistently exceeds estimate by >2x", action: "Increase complexity ratings for that resource type, recalibrate effort estimates" },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-chart-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{s.signal}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">→ {s.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentPrioritization;
