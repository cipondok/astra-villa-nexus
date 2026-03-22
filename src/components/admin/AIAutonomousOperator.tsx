import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Bot, Zap, TrendingUp, DollarSign, Users, Share2,
  Target, Shield, Activity, ArrowRight, CheckCircle, AlertTriangle, Clock
} from "lucide-react";

const automationPanels = [
  { label: "Dynamic Pricing", status: "active", efficiency: 88, events: 142, icon: DollarSign, lastAction: "Auto-adjusted 3 listings -2.5%" },
  { label: "Buyer Acquisition", status: "active", efficiency: 76, events: 85, icon: Users, lastAction: "Matched 12 buyers to new listings" },
  { label: "Agent Auto-Ranking", status: "active", efficiency: 82, events: 210, icon: TrendingUp, lastAction: "Promoted Agent Rina to Gold tier" },
  { label: "Referral Loop", status: "monitoring", efficiency: 65, events: 38, icon: Share2, lastAction: "Sent 8 referral nudge messages" },
  { label: "Marketing ROI", status: "optimizing", efficiency: 71, events: 56, icon: Target, lastAction: "Shifted budget to Seminyak +15%" },
];

const eventTimeline = [
  { time: "14:32", event: "Dynamic pricing adjusted L-91 from Rp 4.2B → Rp 4.05B", type: "pricing" },
  { time: "14:28", event: "High-intent buyer detected — auto-notified Agent Maya", type: "matching" },
  { time: "14:15", event: "Marketing ROI below threshold in Sanur — paused campaign", type: "marketing" },
  { time: "14:02", event: "Agent Budi promoted to Silver tier — auto-badge assigned", type: "ranking" },
  { time: "13:48", event: "Referral bonus triggered for Agent Rina — Rp 2M queued", type: "referral" },
  { time: "13:30", event: "3 new listings auto-priced based on district median", type: "pricing" },
];

const flywheelStages = [
  { label: "Supply", value: 360, unit: "listings", icon: "🏠" },
  { label: "Demand", value: 142, unit: "active buyers", icon: "👥" },
  { label: "Liquidity", value: 72, unit: "/100 score", icon: "💧" },
  { label: "Revenue", value: "1.15B", unit: "IDR run-rate", icon: "💰" },
  { label: "Network", value: 62, unit: "agents", icon: "🔗" },
];

const interventionAlerts = [
  { area: "Sanur Marketing", reason: "ROI below 1.2x for 14 days — recommend manual review", urgency: "medium" },
  { area: "Luxury Pricing", reason: "Auto-pricing confidence <70% for properties >Rp 10B — human oversight suggested", urgency: "low" },
];

const autonomousScore = 78;
const statusColor = (s: string) => s === "active" ? "bg-chart-1/15 text-chart-1 border-chart-1/30" : s === "optimizing" ? "bg-primary/15 text-primary border-primary/30" : "bg-chart-3/15 text-chart-3 border-chart-3/30";

const AIAutonomousOperator: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Autonomous Marketplace Operator
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Self-optimizing marketplace growth systems</p>
        </div>
        <Card className="border-primary/20 bg-primary/5 px-4 py-2">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{autonomousScore}%</div>
            <div className="text-[9px] text-muted-foreground uppercase">Autonomy Score</div>
          </div>
        </Card>
      </div>

      {/* Flywheel */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            {flywheelStages.map((s, i) => (
              <React.Fragment key={s.label}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="text-center flex-1 min-w-[80px]">
                  <div className="text-lg">{s.icon}</div>
                  <div className="text-sm font-bold text-foreground">{s.value}</div>
                  <div className="text-[9px] text-muted-foreground">{s.unit}</div>
                  <div className="text-[10px] font-medium text-primary">{s.label}</div>
                </motion.div>
                {i < flywheelStages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-primary/40 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {automationPanels.map((ap, i) => (
          <motion.div key={ap.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ap.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">{ap.label}</span>
                  </div>
                  <Badge className={`${statusColor(ap.status)} text-[9px]`}>{ap.status}</Badge>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-muted-foreground">Efficiency</span>
                  <span className="text-xs font-bold text-foreground">{ap.efficiency}%</span>
                </div>
                <Progress value={ap.efficiency} className="h-1.5 mb-2" />
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-chart-1" />
                  {ap.lastAction}
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">{ap.events} events processed</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Event Timeline */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Optimization Event Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {eventTimeline.map((ev, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 p-1.5 rounded border border-border/20 hover:bg-muted/20 transition-colors">
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">{ev.time}</span>
                <span className="text-[11px] text-foreground">{ev.event}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Intervention Alerts */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-chart-3" /> Manual Intervention Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {interventionAlerts.map((ia, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-chart-3/20 bg-chart-3/5">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />
                      <span className="text-xs font-bold text-foreground">{ia.area}</span>
                      <Badge variant="secondary" className="text-[9px]">{ia.urgency}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{ia.reason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="border-chart-1/20 bg-chart-1/5">
              <CardContent className="p-3 flex items-start gap-2">
                <Zap className="h-4 w-4 text-chart-1 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  <span className="font-bold">System Assessment:</span> Platform operating at {autonomousScore}% autonomy.
                  {autonomousScore >= 75 ? " Most systems self-optimizing — minimal human intervention required." : " Some systems need attention."}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAutonomousOperator;
