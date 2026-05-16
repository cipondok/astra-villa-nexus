import React, { useState } from "react";
import { Siren, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, Shield, Zap, Clock, Target, TrendingDown, Users, DollarSign, BarChart3, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types & data ───────── */

const severityLevels = [
  { level: "DEFCON 1 — Critical", range: "Score 85-100", color: "bg-destructive/10 text-destructive border-destructive/30", desc: "Multiple systems failing simultaneously. Revenue in free-fall. Existential threat to marketplace viability.", response: "All-hands war room. CEO leads. Hourly check-ins. All non-critical work paused." },
  { level: "DEFCON 2 — Severe", range: "Score 65-84", color: "bg-chart-1/10 text-chart-1 border-chart-1/30", desc: "Major KPI degradation across 2+ dimensions. Sustained decline for 5+ days. Competitive threat materializing.", response: "Leadership war room daily. Dedicated crisis team assembled. 4-hour reporting cadence." },
  { level: "DEFCON 3 — Elevated", range: "Score 40-64", color: "bg-chart-4/10 text-chart-4 border-chart-4/30", desc: "Single dimension declining beyond threshold. Early warning signals across 2+ areas.", response: "Daily monitoring escalated. Preventive actions deployed. Standard operations continue." },
  { level: "DEFCON 4 — Watch", range: "Score 15-39", color: "bg-primary/10 text-primary border-primary/30", desc: "Anomalous signals detected but within normal variance. Monitoring increased.", response: "Weekly review added to leadership agenda. Diagnostic analysis initiated." },
];

interface CrisisIndicator {
  id: string;
  signal: string;
  weight: number;
  threshold: string;
  currentValue: string;
  status: "normal" | "warning" | "critical";
}

const crisisIndicators: CrisisIndicator[] = [
  { id: "inquiry", signal: "Inquiry velocity decline", weight: 20, threshold: ">30% drop WoW", currentValue: "-8% WoW", status: "normal" },
  { id: "vendor-churn", signal: "Vendor inactivity spike", weight: 18, threshold: ">20% inactive 14+ days", currentValue: "12% inactive", status: "normal" },
  { id: "conversion", signal: "Monetization conversion crash", weight: 18, threshold: ">40% drop in paid actions", currentValue: "-5% WoW", status: "normal" },
  { id: "traffic", signal: "Traffic quality deterioration", weight: 15, threshold: "Bounce >65% or session <1.5 pages", currentValue: "42% bounce", status: "normal" },
  { id: "competitor", signal: "Competitive disruption event", weight: 12, threshold: "New funded entrant or price war", currentValue: "No signal", status: "normal" },
  { id: "revenue", signal: "Revenue run-rate decline", weight: 10, threshold: ">25% MRR drop MoM", currentValue: "+12% MoM", status: "normal" },
  { id: "sentiment", signal: "User sentiment deterioration", weight: 7, threshold: "NPS <30 or complaint spike >3x", currentValue: "NPS 52", status: "normal" },
];

interface WarRoomModule {
  id: string;
  title: string;
  icon: React.ReactNode;
  timeframe: string;
  actions: { action: string; owner: string; deadline: string; priority: "P0" | "P1" | "P2" }[];
}

const warRoomModules: WarRoomModule[] = [
  {
    id: "stabilize",
    title: "Immediate Stabilization",
    icon: <Shield className="h-5 w-5" />,
    timeframe: "0-24 Hours",
    actions: [
      { action: "Activate emergency monitoring dashboard — 15-minute KPI refresh cycle", owner: "Engineering", deadline: "Hour 1", priority: "P0" },
      { action: "Freeze all non-critical feature deployments — production stability lockdown", owner: "CTO", deadline: "Hour 1", priority: "P0" },
      { action: "Send vendor reassurance communication — 'platform performing, your listings are active'", owner: "Operations", deadline: "Hour 4", priority: "P0" },
      { action: "Activate 50% boost discount for all active vendors — prevent panic delistings", owner: "Product", deadline: "Hour 6", priority: "P0" },
      { action: "Deploy investor push notification — curated 'hot deals' to reactivate dormant users", owner: "Growth", deadline: "Hour 8", priority: "P1" },
      { action: "Review and fix any broken conversion funnels — payment, signup, or inquiry flows", owner: "Engineering", deadline: "Hour 12", priority: "P0" },
      { action: "Executive team alignment call — confirm crisis level, assign war-room roles", owner: "CEO", deadline: "Hour 2", priority: "P0" },
    ],
  },
  {
    id: "demand",
    title: "Demand Reactivation",
    icon: <TrendingDown className="h-5 w-5" />,
    timeframe: "24-72 Hours",
    actions: [
      { action: "Launch 'Flash Deal Discovery' email campaign to all registered investors", owner: "Growth", deadline: "Day 2", priority: "P0" },
      { action: "Activate WhatsApp broadcast — personalized deal alerts to top 200 investors by engagement", owner: "Sales", deadline: "Day 2", priority: "P0" },
      { action: "Deploy urgency messaging across platform — 'X investors viewed this property today'", owner: "Product", deadline: "Day 2", priority: "P1" },
      { action: "Launch limited-time free deal unlock promotion — reduce friction to first conversion", owner: "Product", deadline: "Day 3", priority: "P1" },
      { action: "Publish 3 high-value market insight articles — drive organic traffic via SEO and social", owner: "Content", deadline: "Day 3", priority: "P1" },
      { action: "Activate referral incentive boost — 2x rewards for 7-day period", owner: "Growth", deadline: "Day 3", priority: "P2" },
    ],
  },
  {
    id: "supply",
    title: "Emergency Supply Acquisition",
    icon: <Users className="h-5 w-5" />,
    timeframe: "24-72 Hours",
    actions: [
      { action: "Personal outreach to top 30 vendors — confirm listing status, offer premium visibility free for 14 days", owner: "BD", deadline: "Day 2", priority: "P0" },
      { action: "Launch 'List Free for 30 Days' campaign targeting competitor portal vendors", owner: "Marketing", deadline: "Day 2", priority: "P0" },
      { action: "Activate developer partnership fast-track — onboard 3-5 new project listings within 72hrs", owner: "BD", deadline: "Day 3", priority: "P1" },
      { action: "Deploy automated listing quality improvement — AI-enhance descriptions and images for bottom 20% listings", owner: "Engineering", deadline: "Day 3", priority: "P1" },
      { action: "Reactivate churned vendors — personalized win-back with 60-day free premium offer", owner: "Operations", deadline: "Day 3", priority: "P2" },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Incentive Recalibration",
    icon: <DollarSign className="h-5 w-5" />,
    timeframe: "48 Hours — 2 Weeks",
    actions: [
      { action: "Reduce all boost prices by 40% for 14-day recovery period", owner: "Product", deadline: "Day 3", priority: "P0" },
      { action: "Launch 'Guaranteed Inquiry' program — refund boost cost if <3 inquiries in 30 days", owner: "Product", deadline: "Day 4", priority: "P1" },
      { action: "Introduce micro-payment option — Rp 25K single-listing boost for price-sensitive vendors", owner: "Product", deadline: "Day 5", priority: "P1" },
      { action: "Offer 3-month subscription at 50% discount with auto-renew — lock in revenue floor", owner: "Sales", deadline: "Day 5", priority: "P1" },
      { action: "A/B test urgency countdown timer on deal unlock page — measure conversion lift", owner: "Growth", deadline: "Day 7", priority: "P2" },
    ],
  },
  {
    id: "trust",
    title: "Brand Trust Reinforcement",
    icon: <CheckCircle2 className="h-5 w-5" />,
    timeframe: "48 Hours — 2 Weeks",
    actions: [
      { action: "CEO publishes transparent market update — acknowledge challenges, reaffirm vision and commitment", owner: "CEO", deadline: "Day 3", priority: "P0" },
      { action: "Highlight vendor success stories — 3 case studies of vendors who gained inquiries via platform", owner: "Content", deadline: "Day 4", priority: "P1" },
      { action: "Publish verified transaction data — demonstrate marketplace is active and producing results", owner: "Marketing", deadline: "Day 5", priority: "P1" },
      { action: "Host live webinar — 'Market Outlook' positioning platform as intelligence authority", owner: "CEO", deadline: "Day 7", priority: "P1" },
      { action: "Deploy in-app satisfaction survey — capture sentiment data and demonstrate responsiveness", owner: "Product", deadline: "Day 7", priority: "P2" },
    ],
  },
];

const recoveryKPIs = [
  { category: "Liquidity Recovery", metrics: ["Inquiry velocity rebound to 80% of pre-crisis baseline within 14 days", "Zero-engagement listings below 25% within 21 days", "New listing additions >15/week sustained for 3 consecutive weeks"] },
  { category: "Revenue Stabilization", metrics: ["MRR decline arrested within 7 days (flat or positive WoW)", "Paid action conversion rate returns to >5% within 14 days", "Subscription churn rate below 8% monthly within 30 days"] },
  { category: "Engagement Recovery", metrics: ["Vendor login frequency returns to pre-crisis average within 14 days", "Investor DAU rebounds to 70% of peak within 21 days", "Session depth recovers to >3.5 pages/session within 14 days"] },
];

const escalationTriggers = [
  { trigger: "Crisis score increases 10+ points in 48 hours despite interventions", action: "Escalate to DEFCON 1 — all-hands deployment, consider pivot strategy", severity: "critical" as const },
  { trigger: "Revenue decline exceeds 50% MoM with no recovery signal", action: "Activate emergency fundraising or bridge financing conversation", severity: "critical" as const },
  { trigger: "Vendor churn exceeds 30% in 30 days", action: "Deploy vendor retention team with personal calls to every active vendor", severity: "critical" as const },
  { trigger: "Interventions show <10% improvement after 14 days", action: "Reassess strategy — consider market repositioning or geographic pivot", severity: "warning" as const },
  { trigger: "Competitor captures >20% of vendor base", action: "Activate competitive response playbook — match pricing, lock exclusives", severity: "warning" as const },
];

/* ───────── component ───────── */

const CrisisWarRoom: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("stabilize");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleAction = (key: string) => {
    setCheckedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalActions = warRoomModules.reduce((sum, m) => sum + m.actions.length, 0);
  const completedActions = Object.values(checkedActions).filter(Boolean).length;
  const crisisScore = 28; // simulated

  const statusColors = { normal: "text-chart-3", warning: "text-chart-4", critical: "text-chart-1" };
  const priorityColors = { P0: "bg-destructive/10 text-destructive border-destructive/30", P1: "bg-chart-4/10 text-chart-4 border-chart-4/30", P2: "bg-primary/10 text-primary border-primary/30" };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Crisis War Room"
        description="Rapid-response framework for liquidity drops, vendor churn, monetization collapse & competitive disruption — severity scoring, action checklists & escalation triggers"
        icon={Siren}
        badge={{ text: "🚨 War Room", variant: "outline" }}
      />

      {/* Crisis Severity Status */}
      <Card className="border-border overflow-hidden">
        <div className={cn("h-1.5 bg-gradient-to-r", crisisScore >= 65 ? "from-destructive/60 via-destructive/30 to-destructive/60" : crisisScore >= 40 ? "from-chart-4/60 via-chart-4/30 to-chart-4/60" : "from-chart-3/60 via-chart-3/30 to-chart-3/60")} />
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Crisis Score</p>
              <p className={cn("text-4xl font-bold", crisisScore >= 65 ? "text-destructive" : crisisScore >= 40 ? "text-chart-4" : "text-chart-3")}>{crisisScore}<span className="text-lg">/100</span></p>
              <Badge variant="outline" className={cn("text-[10px] mt-1", crisisScore >= 65 ? "text-destructive" : crisisScore >= 40 ? "text-chart-4" : "text-chart-3")}>
                {crisisScore >= 85 ? "DEFCON 1" : crisisScore >= 65 ? "DEFCON 2" : crisisScore >= 40 ? "DEFCON 3" : "DEFCON 4"} — {crisisScore >= 85 ? "Critical" : crisisScore >= 65 ? "Severe" : crisisScore >= 40 ? "Elevated" : "Watch"}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Action Progress</p>
              <p className="text-2xl font-bold text-foreground">{completedActions}/{totalActions}</p>
              <Progress value={(completedActions / totalActions) * 100} className="h-2 mt-1" />
            </div>
            <div className="space-y-1">
              {crisisIndicators.slice(0, 3).map(ci => (
                <div key={ci.id} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground truncate">{ci.signal}</span>
                  <span className={cn("text-[10px] font-bold", statusColors[ci.status])}>{ci.currentValue}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Severity Framework */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> Crisis Severity Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {severityLevels.map((s, i) => (
            <div key={i} className={cn("rounded-[6px] border p-3 space-y-1", s.color)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{s.level}</span>
                <Badge variant="outline" className="text-[10px]">{s.range}</Badge>
              </div>
              <p className="text-xs opacity-80">{s.desc}</p>
              <p className="text-[10px] opacity-60"><span className="font-semibold">Response:</span> {s.response}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Crisis Signal Indicators */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Crisis Signal Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {crisisIndicators.map(ci => (
            <div key={ci.id} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{ci.signal}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{ci.threshold}</Badge>
              <span className={cn("text-xs font-bold shrink-0", statusColors[ci.status])}>{ci.currentValue}</span>
              <div className="flex items-center gap-1 shrink-0">
                <Progress value={ci.weight} className="h-1 w-8" />
                <span className="text-[9px] text-muted-foreground">{ci.weight}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* War Room Action Modules */}
      {warRoomModules.map(module => (
        <Card key={module.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(prev => prev === module.id ? null : module.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{module.icon}</div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{module.title}</CardTitle>
                  <Badge variant="outline" className="text-[10px] mt-0.5"><Clock className="h-2.5 w-2.5 mr-0.5" />{module.timeframe}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {module.actions.filter((_, i) => checkedActions[`${module.id}-${i}`]).length}/{module.actions.length}
                </span>
                {expanded === module.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          </CardHeader>

          {expanded === module.id && (
            <CardContent className="pt-0 space-y-1.5">
              {module.actions.map((act, i) => {
                const key = `${module.id}-${i}`;
                const done = checkedActions[key] ?? false;
                return (
                  <div key={i} className={cn("flex items-start gap-3 rounded-[6px] p-3 transition-colors group", done ? "bg-chart-3/5 border border-chart-3/20" : "bg-muted/30")}>
                    <button onClick={() => toggleAction(key)} className="mt-0.5 shrink-0">
                      {done ? <CheckCircle2 className="h-4 w-4 text-chart-3" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>{act.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{act.owner}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{act.deadline}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] shrink-0", priorityColors[act.priority])}>{act.priority}</Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => copy(act.action, key)}>
                      {copiedId === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      ))}

      {/* Recovery KPIs */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Recovery Target KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {recoveryKPIs.map((group, i) => (
              <div key={i} className="rounded-[6px] border border-border bg-card p-3 space-y-2">
                <span className="text-xs font-semibold text-foreground">{group.category}</span>
                {group.metrics.map((m, j) => (
                  <p key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <Target className="h-3 w-3 text-primary mt-0.5 shrink-0" />{m}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Triggers */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Siren className="h-4 w-4 text-destructive" /> Pivot & Escalation Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {escalationTriggers.map((et, i) => (
            <div key={i} className={cn("rounded-[6px] border p-3 space-y-1.5", et.severity === "critical" ? "bg-destructive/5 border-destructive/20" : "bg-chart-4/5 border-chart-4/20")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-foreground">{et.trigger}</p>
                <Badge variant="outline" className={cn("text-[9px] uppercase shrink-0", et.severity === "critical" ? "text-destructive" : "text-chart-4")}>{et.severity}</Badge>
              </div>
              <div className="flex items-start gap-1.5">
                <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">{et.action}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisWarRoom;
