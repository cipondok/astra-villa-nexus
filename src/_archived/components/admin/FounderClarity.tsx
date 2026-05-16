import React, { useState } from "react";
import { Brain, Sun, Moon, Zap, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Clock, Heart, Shield, Target, TrendingUp, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── data ───────── */

const morningRitual = [
  { step: "5 min — Stillness & breathing (4-7-8 pattern)", detail: "Before checking any device. Activates parasympathetic system, clears cortisol fog." },
  { step: "3 min — Write today's ONE non-negotiable outcome", detail: "Not a task list. One sentence: 'Today I will ___.' Everything else is secondary." },
  { step: "2 min — Identify the hardest decision and timebox it", detail: "Name it. Schedule 30 min for it. Remove the ambient anxiety of unresolved choices." },
  { step: "5 min — Review yesterday's wins (minimum 3)", detail: "Rewires negativity bias. Founders chronically under-credit their own progress." },
  { step: "Zero-device first 20 minutes", detail: "Notifications hijack your prefrontal cortex. Protect the clarity window." },
];

const eveningReflection = [
  "What was today's single most valuable action I took?",
  "What decision did I avoid, and why?",
  "Where did I spend energy on something that doesn't compound?",
  "What would I tell a friend to do differently if they had my day?",
  "Am I closer to this week's milestone than I was this morning?",
];

const decisionChecklist = [
  { question: "Is this reversible?", guidance: "If yes → decide in <5 minutes. Speed beats perfection for reversible decisions." },
  { question: "What's the cost of waiting 48 hours?", guidance: "If low → sleep on it. If high → act now with 70% information." },
  { question: "Am I deciding from fear or from strategy?", guidance: "Fear-driven decisions optimize for safety. Strategy-driven decisions optimize for growth." },
  { question: "Does this move the ONE metric that matters this quarter?", guidance: "If no → delegate or defer. Protect focus ruthlessly." },
  { question: "What would I advise another founder to do?", guidance: "Self-distance technique. Removes emotional attachment and activates analytical thinking." },
  { question: "Can I write the decision rationale in one sentence?", guidance: "If not → the thinking isn't clear yet. Clarity precedes confidence." },
];

const burnoutSignals = [
  { signal: "Dreading Monday morning despite loving the mission", severity: 85, action: "Take a full day off within 72 hours. Not a 'work from home' day — a zero-work day." },
  { signal: "Making reactive decisions instead of proactive ones", severity: 75, action: "Block 2 hours tomorrow for strategic thinking only. No Slack, no email, no calls." },
  { signal: "Irritability with team members over minor issues", severity: 70, action: "Your nervous system is overloaded. 30 min walk before the next meeting. Every day this week." },
  { signal: "Inability to disconnect — checking phone at midnight", severity: 80, action: "Phone charges outside bedroom starting tonight. Non-negotiable boundary." },
  { signal: "Loss of excitement about milestones achieved", severity: 90, action: "Anhedonia is a serious signal. Talk to a peer founder or coach within 48 hours." },
  { signal: "Physical symptoms: headaches, insomnia, appetite changes", severity: 95, action: "Your body is ahead of your mind. See a doctor. Sustainable companies need sustainable founders." },
  { signal: "Avoiding difficult conversations with co-founders or team", severity: 65, action: "Schedule the conversation for tomorrow. Write 3 bullet points. Avoidance compounds." },
  { signal: "Comparing yourself to other founders constantly", severity: 60, action: "Unfollow for 7 days. Comparison is the thief of execution. Your timeline is your own." },
];

const weeklyAssessment = [
  { dimension: "Strategic Clarity", question: "Can I articulate our #1 priority in one sentence?" },
  { dimension: "Decision Velocity", question: "How many decisions am I carrying unresolved from last week?" },
  { dimension: "Energy Management", question: "Did I have at least 2 high-energy deep work blocks this week?" },
  { dimension: "Delegation Health", question: "Am I doing work that someone else could do 80% as well?" },
  { dimension: "Emotional Stability", question: "Did I react disproportionately to any event this week?" },
  { dimension: "Physical Foundation", question: "Sleep quality, exercise frequency, nutrition — any red flags?" },
  { dimension: "Relationship Investment", question: "Did I have at least one meaningful non-work conversation?" },
  { dimension: "Progress Recognition", question: "Can I name 3 concrete things that moved forward this week?" },
];

const reframingStatements = [
  { situation: "Everything feels uncertain", reframe: "Uncertainty is the raw material of opportunity. If the path were clear, everyone would already be on it. Your tolerance for ambiguity is your competitive advantage." },
  { situation: "We're not growing fast enough", reframe: "Growth is a lagging indicator. The inputs you're putting in today show up in metrics 60-90 days from now. Trust the process while improving it." },
  { situation: "A competitor just raised more money", reframe: "Capital is a tool, not a strategy. More money often means more burn, more pressure, and more dilution. Your constraint is your discipline advantage." },
  { situation: "I made a bad decision", reframe: "A bad decision made quickly and corrected is worth more than a perfect decision made too late. Speed of learning > accuracy of prediction." },
  { situation: "The team isn't performing", reframe: "Before blaming execution, check clarity. 90% of performance problems are direction problems. Have you made the priority unmistakably clear?" },
  { situation: "I feel like an imposter", reframe: "Imposter syndrome is the tax on ambition. If you felt comfortable, you wouldn't be stretching. Discomfort is evidence of growth, not incompetence." },
];

/* ───────── component ───────── */

const FounderClarity: React.FC = () => {
  const [stress, setStress] = useState(65);
  const [workload, setWorkload] = useState(75);
  const [pendingDecisions, setPendingDecisions] = useState(4);
  const [checkedMorning, setCheckedMorning] = useState<Record<number, boolean>>({});
  const [checkedDecision, setCheckedDecision] = useState<Record<number, boolean>>({});
  const [weeklyScores, setWeeklyScores] = useState<Record<number, number>>(
    Object.fromEntries(weeklyAssessment.map((_, i) => [i, 5]))
  );

  const clarityScore = Math.max(0, Math.min(100, Math.round(100 - stress * 0.4 - workload * 0.3 - pendingDecisions * 5 + 20)));
  const burnoutRisk = stress > 75 && workload > 80 ? "high" : stress > 55 ? "medium" : "low";
  const weeklyAvg = Math.round(Object.values(weeklyScores).reduce((s, v) => s + v, 0) / weeklyAssessment.length);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Founder Clarity Coach"
        description="Mental performance operating system — morning rituals, decision frameworks, burnout detection & weekly self-assessment"
        icon={Brain}
        badge={{ text: "🧠 Clarity", variant: "outline" }}
      />

      {/* State inputs */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" /> Current State Check-In</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Stress Level</span>
              <span className={cn("text-xs font-bold", stress > 70 ? "text-destructive" : "text-foreground")}>{stress}%</span>
            </div>
            <Slider value={[stress]} onValueChange={v => setStress(v[0])} min={0} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Workload Intensity</span>
              <span className={cn("text-xs font-bold", workload > 80 ? "text-destructive" : "text-foreground")}>{workload}%</span>
            </div>
            <Slider value={[workload]} onValueChange={v => setWorkload(v[0])} min={0} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Pending Decisions</span>
              <span className="text-xs font-bold text-foreground">{pendingDecisions}</span>
            </div>
            <Slider value={[pendingDecisions]} onValueChange={v => setPendingDecisions(v[0])} min={0} max={10} step={1} />
          </div>
        </CardContent>
      </Card>

      {/* Health cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <Brain className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className={cn("text-xl font-bold", clarityScore >= 60 ? "text-chart-2" : clarityScore >= 35 ? "text-chart-4" : "text-destructive")}>{clarityScore}</p>
          <p className="text-[10px] text-muted-foreground">Clarity Score</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className={cn("text-xl font-bold", burnoutRisk === "high" ? "text-destructive" : burnoutRisk === "medium" ? "text-chart-4" : "text-chart-2")}>
            {burnoutRisk.toUpperCase()}
          </p>
          <p className="text-[10px] text-muted-foreground">Burnout Risk</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{pendingDecisions}</p>
          <p className="text-[10px] text-muted-foreground">Open Decisions</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{weeklyAvg}/10</p>
          <p className="text-[10px] text-muted-foreground">Weekly Performance</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="rituals" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="rituals" className="text-xs">Daily Rituals</TabsTrigger>
          <TabsTrigger value="decisions" className="text-xs">Decision Engine</TabsTrigger>
          <TabsTrigger value="burnout" className="text-xs">Burnout Radar</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">Weekly Review</TabsTrigger>
        </TabsList>

        {/* Daily Rituals */}
        <TabsContent value="rituals" className="mt-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Sun className="h-4 w-4 text-chart-4" /> Morning Clarity Ritual (15 min)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {morningRitual.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <Checkbox checked={!!checkedMorning[i]} onCheckedChange={() => setCheckedMorning(prev => ({ ...prev, [i]: !prev[i] }))} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{r.step}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Moon className="h-4 w-4 text-primary" /> Evening Reflection (5 min)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {eveningReflection.map((q, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-primary text-xs font-bold mt-0.5">{i + 1}.</span>
                  <p className="text-xs text-foreground">{q}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reframing */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 text-chart-2" /> Mindset Reframing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reframingStatements.map((r, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1">
                  <Badge variant="secondary" className="text-[9px]">{r.situation}</Badge>
                  <p className="text-xs text-foreground italic">"{r.reframe}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decision Engine */}
        <TabsContent value="decisions" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> Rapid Decision Confidence Checklist</CardTitle>
              <p className="text-xs text-muted-foreground">Run every pending decision through these 6 gates. If you can answer all clearly, decide immediately.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {decisionChecklist.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <Checkbox checked={!!checkedDecision[i]} onCheckedChange={() => setCheckedDecision(prev => ({ ...prev, [i]: !prev[i] }))} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{d.question}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{d.guidance}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Burnout Radar */}
        <TabsContent value="burnout" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Burnout Early Warning Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {burnoutSignals.sort((a, b) => b.severity - a.severity).map((b, i) => (
                <div key={i} className={cn("rounded-lg border p-3 space-y-1.5", b.severity >= 80 ? "border-destructive/30 bg-destructive/5" : "border-border/40")}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-foreground flex-1">{b.signal}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Progress value={b.severity} className="h-1.5 w-12" />
                      <Badge variant={b.severity >= 80 ? "destructive" : "secondary"} className="text-[9px]">{b.severity}</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-chart-2">↳ {b.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Review */}
        <TabsContent value="weekly" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Weekly Self-Assessment</CardTitle>
                <Badge variant={weeklyAvg >= 7 ? "default" : weeklyAvg >= 5 ? "secondary" : "destructive"} className="text-[10px]">
                  Avg: {weeklyAvg}/10
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyAssessment.map((w, i) => (
                <div key={i} className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{w.dimension}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      weeklyScores[i] >= 7 ? "text-chart-2" : weeklyScores[i] >= 4 ? "text-chart-4" : "text-destructive"
                    )}>{weeklyScores[i]}/10</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{w.question}</p>
                  <Slider
                    value={[weeklyScores[i]]}
                    onValueChange={v => setWeeklyScores(prev => ({ ...prev, [i]: v[0] }))}
                    min={1} max={10} step={1}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FounderClarity;
