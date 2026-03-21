import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock, Target, TrendingUp, Users, Building, DollarSign,
  Zap, Shield, AlertTriangle, Star, ArrowUpRight,
  Brain, Rocket, Handshake, BarChart3, Coffee,
  Sun, Sunset, Moon, CheckCircle, Activity
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimeBlock {
  time: string;
  title: string;
  icon: React.ElementType;
  priority: "critical" | "high" | "supportive";
  kpiFocus: string;
  expectedOutcome: string;
  tasks: { label: string; done: boolean }[];
  phase: "morning" | "midday" | "afternoon" | "evening";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const marketplaceStatus = [
  { label: "Live Listings", value: "1,247", trend: "+23 today", icon: Building, color: "text-primary" },
  { label: "Daily Inquiries", value: "89", trend: "+14% WoW", icon: Users, color: "text-emerald-500" },
  { label: "Monetization Revenue", value: "Rp 4.2M", trend: "Today", icon: DollarSign, color: "text-amber-400" },
  { label: "Vendor Response Rate", value: "72%", trend: "Target: 85%", icon: Activity, color: "text-cyan-400" },
  { label: "City Liquidity Index", value: "6.8/10", trend: "Jakarta South", icon: Zap, color: "text-violet-400" },
];

const initialBlocks: TimeBlock[] = [
  {
    time: "06:00 – 07:00", title: "Intelligence Review & Growth Decision", icon: Brain, priority: "critical",
    kpiFocus: "Liquidity Index movement, overnight inquiry volume",
    expectedOutcome: "Clear priority decision for today's growth lever",
    phase: "morning",
    tasks: [
      { label: "Review overnight inquiry & listing metrics", done: false },
      { label: "Check AI Co-Pilot recommendation feed", done: false },
      { label: "Identify top district liquidity gap", done: false },
      { label: "Set single most important growth action", done: false },
    ],
  },
  {
    time: "07:00 – 08:30", title: "Vendor Acquisition Sprint", icon: Handshake, priority: "critical",
    kpiFocus: "New vendors contacted, onboarding conversion rate",
    expectedOutcome: "3-5 new vendor conversations, 1-2 onboarded",
    phase: "morning",
    tasks: [
      { label: "Contact 5 target vendors (Bandung/Jakarta focus)", done: false },
      { label: "Follow up with 3 warm leads from yesterday", done: false },
      { label: "Send exclusivity anchoring pitch to top prospect", done: false },
      { label: "Review vendor churn risk alerts, send nudges", done: false },
      { label: "Update vendor pipeline tracker", done: false },
    ],
  },
  {
    time: "08:30 – 10:00", title: "Investor Demand Activation", icon: TrendingUp, priority: "critical",
    kpiFocus: "Investor signups, deal unlock rate, inquiry growth",
    expectedOutcome: "2-3 high-intent investor engagements triggered",
    phase: "morning",
    tasks: [
      { label: "Review high-intent investor activity signals", done: false },
      { label: "Send curated deal batch to top-20 active investors", done: false },
      { label: "Activate urgency push for expiring exclusive deals", done: false },
      { label: "Respond to premium investor inquiries (<2h SLA)", done: false },
      { label: "Update investor segmentation clusters", done: false },
    ],
  },
  {
    time: "10:00 – 11:00", title: "Monetization Optimization Window", icon: DollarSign, priority: "high",
    kpiFocus: "Boost revenue, subscription upgrades, unlock volume",
    expectedOutcome: "Revenue momentum sustained, pricing optimized",
    phase: "midday",
    tasks: [
      { label: "Check daily boost sales vs target (Rp 2M+)", done: false },
      { label: "Activate surge pricing in high-demand districts", done: false },
      { label: "Review vendor upgrade funnel — trigger prompt for eligible", done: false },
      { label: "Analyze investor unlock conversion by segment", done: false },
    ],
  },
  {
    time: "11:00 – 12:00", title: "Product & System Control", icon: Shield, priority: "high",
    kpiFocus: "AI scoring accuracy, system latency, listing quality",
    expectedOutcome: "Platform stability confirmed, quality maintained",
    phase: "midday",
    tasks: [
      { label: "Review AI scoring queue latency & model drift", done: false },
      { label: "Check listing quality alerts — flag low-score entries", done: false },
      { label: "Monitor edge function response times", done: false },
      { label: "Review pending feature deployments / bug fixes", done: false },
    ],
  },
  {
    time: "13:00 – 14:30", title: "Partnership & Authority Building", icon: Star, priority: "high",
    kpiFocus: "Strategic partnerships, brand credibility signals",
    expectedOutcome: "1 partnership advanced, 1 authority signal published",
    phase: "afternoon",
    tasks: [
      { label: "Follow up with bank/corporate partnership leads", done: false },
      { label: "Draft or publish market intelligence content", done: false },
      { label: "Engage with 2-3 industry contacts on LinkedIn", done: false },
      { label: "Review university housing partnership pipeline", done: false },
    ],
  },
  {
    time: "14:30 – 16:00", title: "Growth Campaign Execution", icon: Rocket, priority: "high",
    kpiFocus: "Campaign ROI, CAC efficiency, conversion funnel",
    expectedOutcome: "Campaigns optimized, spend efficiency improved",
    phase: "afternoon",
    tasks: [
      { label: "Review active campaign performance metrics", done: false },
      { label: "Adjust geo-targeted acquisition funnel parameters", done: false },
      { label: "Test urgency banner variations", done: false },
      { label: "Plan next-day campaign activations", done: false },
    ],
  },
  {
    time: "16:00 – 17:00", title: "Deal Pipeline & Conversion Review", icon: Target, priority: "supportive",
    kpiFocus: "Deal velocity, stage transitions, stall detection",
    expectedOutcome: "Stalled deals unblocked, pipeline health confirmed",
    phase: "afternoon",
    tasks: [
      { label: "Review active deal pipeline for stalls (>48h)", done: false },
      { label: "Escalate high-value stuck negotiations", done: false },
      { label: "Check agent response SLA compliance", done: false },
      { label: "Update deal success probability scores", done: false },
    ],
  },
  {
    time: "17:00 – 18:00", title: "War-Room Reflection & Tomorrow Prep", icon: BarChart3, priority: "supportive",
    kpiFocus: "Daily KPI summary, lesson capture, next-day plan",
    expectedOutcome: "Clear scorecard, tomorrow's #1 action identified",
    phase: "evening",
    tasks: [
      { label: "Score today: revenue vs target, inquiries vs goal", done: false },
      { label: "Capture top learning / insight of the day", done: false },
      { label: "Identify biggest growth risk for tomorrow", done: false },
      { label: "Set tomorrow's single most important action", done: false },
      { label: "Update weekly execution tracker", done: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const priorityStyle = (p: string) => {
  if (p === "critical") return "bg-destructive/15 text-destructive border-destructive/30";
  if (p === "high") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

const phaseIcon = (p: string) => {
  if (p === "morning") return <Sun className="h-4 w-4 text-amber-400" />;
  if (p === "midday") return <Coffee className="h-4 w-4 text-primary" />;
  if (p === "afternoon") return <Sunset className="h-4 w-4 text-orange-400" />;
  return <Moon className="h-4 w-4 text-violet-400" />;
};

// ─── Component ────────────────────────────────────────────────────────────────
const FounderDailyExecution = () => {
  const [blocks, setBlocks] = useState(initialBlocks);

  const toggleTask = (blockIdx: number, taskIdx: number) => {
    setBlocks(prev => prev.map((b, bi) =>
      bi === blockIdx ? { ...b, tasks: b.tasks.map((t, ti) => ti === taskIdx ? { ...t, done: !t.done } : t) } : b
    ));
  };

  const totalTasks = blocks.reduce((sum, b) => sum + b.tasks.length, 0);
  const doneTasks = blocks.reduce((sum, b) => sum + b.tasks.filter(t => t.done).length, 0);
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Founder Daily Execution Plan
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hour-by-hour operational schedule — growth decisions, vendor acquisition, investor activation & revenue optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Daily Progress</p>
            <p className="text-lg font-bold text-foreground">{doneTasks}/{totalTasks} tasks</p>
          </div>
          <div className="w-24">
            <Progress value={completionPct} className="h-2" />
            <p className="text-[10px] text-muted-foreground text-center mt-0.5">{completionPct}%</p>
          </div>
        </div>
      </div>

      {/* Marketplace Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {marketplaceStatus.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 bg-card/60 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.trend}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Time Blocks */}
      <div className="space-y-4">
        {blocks.map((block, bi) => {
          const blockDone = block.tasks.filter(t => t.done).length;
          const blockTotal = block.tasks.length;
          const blockPct = blockTotal > 0 ? Math.round((blockDone / blockTotal) * 100) : 0;
          const isComplete = blockPct === 100;

          return (
            <motion.div key={bi} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: bi * 0.04 }}>
              <Card className={`border-border/40 bg-card/70 backdrop-blur ${isComplete ? "opacity-60" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      {phaseIcon(block.phase)}
                      <span className="text-xs font-mono text-muted-foreground">{block.time}</span>
                      <div className="flex items-center gap-2">
                        <block.icon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">{block.title}</CardTitle>
                      </div>
                      <Badge className={`text-[10px] h-5 ${priorityStyle(block.priority)}`}>{block.priority}</Badge>
                      {isComplete && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{blockDone}/{blockTotal}</span>
                      <Progress value={blockPct} className="h-1.5 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="p-2 rounded bg-muted/20 border border-border/20">
                      <p className="text-[10px] text-muted-foreground uppercase mb-0.5">KPI Focus</p>
                      <p className="text-xs text-foreground">{block.kpiFocus}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/20 border border-border/20 md:col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Expected Outcome</p>
                      <p className="text-xs text-foreground">{block.expectedOutcome}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {block.tasks.map((task, ti) => (
                      <label key={ti} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={task.done}
                          onCheckedChange={() => toggleTask(bi, ti)}
                          className="h-3.5 w-3.5"
                        />
                        <span className={`text-xs ${task.done ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
                          {task.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Daily Summary */}
      <Card className="border-primary/20 bg-primary/5 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            End-of-Day Summary Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-primary/20 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground uppercase">Most Important Action</span>
              </div>
              <p className="text-sm text-foreground font-medium">Onboard 2 premium vendors in Jakarta South to close supply gap before demand spike materializes</p>
            </div>
            <div className="p-3 rounded-lg border border-destructive/20 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium text-foreground uppercase">Biggest Growth Risk</span>
              </div>
              <p className="text-sm text-foreground font-medium">Vendor response rate declining (72% → target 85%) — risk of inquiry drop-off and investor frustration if not corrected within 48h</p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground uppercase">Fastest Revenue Opportunity</span>
              </div>
              <p className="text-sm text-foreground font-medium">Activate boost surge pricing in 3 high-demand districts — estimated +Rp 4.2M additional revenue within 24 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderDailyExecution;
