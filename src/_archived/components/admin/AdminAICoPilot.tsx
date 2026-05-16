import { useState, useEffect } from "react";
import { useCopilotIntelligence, CopilotIntelligence } from "@/hooks/useCopilotIntelligence";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Zap, AlertTriangle, Shield, TrendingUp, Send,
  CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, Target, Settings, Play, Pause,
  MessageSquare, Lightbulb, ShieldAlert, Eye, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Recommendation {
  id: string;
  type: "growth" | "vendor" | "liquidity" | "monetization";
  title: string;
  description: string;
  confidence: number;
  impact: string;
  timeWindow: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "approved" | "executed" | "dismissed";
}

interface RiskAlert {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  title: string;
  metric: string;
  trend: "up" | "down" | "flat";
  probability: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeColor = (t: string) => {
  const m: Record<string, string> = { growth: "text-emerald-500", vendor: "text-blue-400", liquidity: "text-cyan-400", monetization: "text-amber-400" };
  return m[t] || "text-muted-foreground";
};

const priorityBadge = (p: string) => {
  const m: Record<string, string> = { critical: "bg-destructive/20 text-destructive", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-muted text-muted-foreground" };
  return m[p] || "";
};

const severityIcon = (s: string) => {
  if (s === "critical") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (s === "warning") return <ShieldAlert className="h-4 w-4 text-amber-400" />;
  return <Eye className="h-4 w-4 text-blue-400" />;
};

// ─── Section 1: Recommendation Feed ──────────────────────────────────────────
function RecommendationFeed({ recommendations, onAction }: { recommendations: Recommendation[]; onAction: (id: string, action: string) => void }) {
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("all");

  const recs = recommendations.map(r => ({ ...r, status: localStatus[r.id] || r.status }));
  const filtered = filter === "all" ? recs : recs.filter(r => r.type === filter);

  const handleAction = (id: string, action: "approved" | "dismissed") => {
    setLocalStatus(prev => ({ ...prev, [id]: action }));
    onAction(id, action === "approved" ? "approve_recommendation" : "dismiss_recommendation");
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            AI Recommendation Feed
          </CardTitle>
          <Badge variant="outline" className="text-xs">{recs.filter(r => r.status === "pending").length} pending</Badge>
        </div>
        <div className="flex gap-1.5 mt-2">
          {["all", "growth", "vendor", "liquidity", "monetization"].map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"} className="h-7 text-xs capitalize" onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
        <AnimatePresence>
          {filtered.map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`p-3 rounded-lg border border-border/40 bg-background/50 space-y-2 ${rec.status !== "pending" ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono uppercase ${typeColor(rec.type)}`}>{rec.type}</span>
                      <Badge className={`text-[10px] h-4 ${priorityBadge(rec.priority)}`}>{rec.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-primary">{rec.confidence}%</div>
                    <span className="text-[10px] text-muted-foreground">confidence</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{rec.impact}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.timeWindow}</span>
                  </div>
                  {rec.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => handleAction(rec.id, "approved")}>
                        <Play className="h-3 w-3 mr-1" />Execute
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => handleAction(rec.id, "dismissed")}>
                        Dismiss
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      {rec.status === "approved" ? <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" /> : null}
                      {rec.status}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ─── Section 2: Natural Language Action Panel ────────────────────────────────
function NaturalLanguagePanel({ kpiContext }: { kpiContext?: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Ready. Ask me anything about platform performance, trigger campaigns, or simulate strategies." },
  ]);

  const exampleCommands = [
    "What's our revenue trend this week?",
    "Activate boost campaign for Jakarta",
    "Simulate 20% price increase impact",
    "Show top performing vendors",
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: kpiContext
        ? `Based on live data: ${kpiContext}\n\nFor deeper analysis, use the Founder AI Copilot which has full streaming AI with marketplace context.`
        : `Use the Founder AI Copilot for real-time AI-powered analysis with live marketplace data.` }]);
    }, 800);
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-primary" />
          Natural Language Command
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {exampleCommands.map(cmd => (
            <Button key={cmd} size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { setInput(cmd); }}>
              {cmd}
            </Button>
          ))}
        </div>
        <div className="bg-background/50 rounded-lg border border-border/30 p-3 max-h-[280px] overflow-y-auto space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`text-xs ${msg.role === "ai" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
              <span className={`text-[10px] font-mono mr-1.5 ${msg.role === "ai" ? "text-primary" : "text-amber-400"}`}>
                {msg.role === "ai" ? "AI" : "YOU"}
              </span>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask or command..."
            className="text-sm h-9"
          />
          <Button size="sm" className="h-9 px-3" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 3: Risk Early Warning ───────────────────────────────────────────
function RiskEarlyWarning({ alerts }: { alerts: RiskAlert[] }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Operational Risk Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active risk alerts — system healthy</p>
        ) : alerts.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/30 bg-background/40">
              {severityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.metric}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  {alert.trend === "down" ? <ArrowDownRight className="h-3 w-3 text-destructive" /> : alert.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <Activity className="h-3 w-3 text-muted-foreground" />}
                  <span className="text-sm font-bold text-foreground">{alert.probability}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground">probability</span>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Section 4: Automation Control ───────────────────────────────────────────
function AutomationControl() {
  const [controls, setControls] = useState({
    lowRiskAuto: true,
    mediumRiskQueue: true,
    highRiskLock: true,
    vendorNudges: true,
    pricingAdjust: false,
    campaignTrigger: false,
  });

  const toggle = (key: keyof typeof controls) => setControls(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: "lowRiskAuto" as const, label: "Auto-approve low-risk actions", desc: "Confidence ≥90%, impact < Rp 1M", tier: "safe" },
    { key: "mediumRiskQueue" as const, label: "Queue medium-risk for review", desc: "Confidence 75-89%, reviewed before execution", tier: "caution" },
    { key: "highRiskLock" as const, label: "Lock high-impact actions", desc: "Revenue >Rp 5M or system-wide changes require manual approval", tier: "locked" },
    { key: "vendorNudges" as const, label: "Automated vendor nudges", desc: "Performance reminders sent to underperforming vendors", tier: "safe" },
    { key: "pricingAdjust" as const, label: "Dynamic pricing adjustments", desc: "AI adjusts boost pricing based on demand signals", tier: "caution" },
    { key: "campaignTrigger" as const, label: "Campaign auto-trigger", desc: "Growth campaigns launch when opportunity score ≥85%", tier: "caution" },
  ];

  const tierColor = (t: string) => {
    if (t === "safe") return "text-emerald-500";
    if (t === "caution") return "text-amber-400";
    return "text-destructive";
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-5 w-5 text-primary" />
          Execution Automation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-background/40">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <span className={`text-[10px] font-mono uppercase ${tierColor(item.tier)}`}>{item.tier}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={controls[item.key]} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Section 5: Performance Transparency ─────────────────────────────────────
function PerformanceTransparency({ performance }: { performance: { actions_executed_7d: number; ai_signals_7d: number } }) {
  const metrics = [
    { label: "Actions Executed (7d)", value: performance.actions_executed_7d, target: 10 },
    { label: "AI Signals Generated (7d)", value: performance.ai_signals_7d, target: 50 },
  ];
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          AI Performance Transparency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">{metric.value}</span>
                <span className="text-xs text-muted-foreground">/ {metric.target} target</span>
              </div>
            </div>
            <Progress value={Math.min((metric.value / metric.target) * 100, 100)} className="h-1.5" />
          </div>
        ))}
        <div className="mt-4 p-2.5 rounded-lg border border-border/30 bg-background/40 text-center">
          <p className="text-xs text-muted-foreground">Intelligence powered by live database queries</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Top KPI Strip ───────────────────────────────────────────────────────────
function CoPilotKPIStrip({ data }: { data?: CopilotIntelligence }) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const k = data.kpis;
  const kpis = [
    { icon: Brain, label: "Total Listings", value: String(k.total_properties), sub: `${k.active_listings_last_30_days} new (30d)`, color: "text-primary" },
    { icon: Target, label: "Users", value: String(k.total_users), sub: `+${k.new_users_last_7_days} this week`, color: "text-emerald-500" },
    { icon: Zap, label: "Deals Open", value: String(k.deals_open), sub: `${k.deals_closed_30_days} closed (30d)`, color: "text-amber-400" },
    { icon: Shield, label: "Risk Alerts", value: String(data.risk_alerts.length), sub: `${data.risk_alerts.filter(a => a.severity === "critical").length} critical`, color: "text-destructive" },
    { icon: Activity, label: "Escrow Active", value: String(k.escrow_active), sub: `${data.funnel.conversion_rate}% conv rate`, color: "text-cyan-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur p-3">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminAICoPilot = () => {
  const { data, isLoading, executeAction } = useCopilotIntelligence();

  const handleAction = (recId: string, actionType: string) => {
    executeAction.mutate({ actionType, payload: { recommendation_id: recId } });
  };

  const kpiContext = data ? `${data.kpis.total_properties} listings, ${data.kpis.total_users} users, ${data.kpis.deals_open} open deals, ${data.kpis.escrow_active} active escrow, ${data.funnel.conversion_rate}% conversion` : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Co-Pilot Command
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligent operations assistant — recommendations, risk detection, natural language control & automation governance
          </p>
        </div>
        <Badge variant="outline" className="text-xs h-6 gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          ONLINE
        </Badge>
      </div>

      {/* KPI Strip */}
      <CoPilotKPIStrip data={data} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recommendations + NL Panel */}
        <div className="space-y-6">
          <RecommendationFeed
            recommendations={data?.recommendations || []}
            onAction={handleAction}
          />
          <NaturalLanguagePanel kpiContext={kpiContext} />
        </div>

        {/* Right: Risk + Automation + Performance */}
        <div className="space-y-6">
          <RiskEarlyWarning alerts={data?.risk_alerts || []} />
          <AutomationControl />
          <PerformanceTransparency performance={data?.performance || { actions_executed_7d: 0, ai_signals_7d: 0 }} />
        </div>
      </div>
    </div>
  );
};

export default AdminAICoPilot;
