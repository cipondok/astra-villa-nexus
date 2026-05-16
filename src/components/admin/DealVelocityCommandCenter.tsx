import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useDealVelocityDashboard, useDealConversionScoring, useGenerateFollowups } from "@/hooks/useDealVelocityEngine";
import { Activity, Zap, TrendingUp, Users, Clock, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const STAGES = [
  "inquiry_received", "viewing_scheduled", "negotiation_active",
  "price_agreed", "escrow_initiated", "legal_verification", "completed", "dropped"
];

const STAGE_LABELS: Record<string, string> = {
  inquiry_received: "Inquiry", viewing_scheduled: "Viewing",
  negotiation_active: "Negotiation", price_agreed: "Price Agreed",
  escrow_initiated: "Escrow", legal_verification: "Legal", completed: "Completed", dropped: "Dropped",
};

const STAGE_COLORS: Record<string, string> = {
  inquiry_received: "bg-blue-500", viewing_scheduled: "bg-cyan-500",
  negotiation_active: "bg-amber-500", price_agreed: "bg-emerald-500",
  escrow_initiated: "bg-violet-500", legal_verification: "bg-indigo-500",
  completed: "bg-green-600", dropped: "bg-destructive",
};

const ACTION_ICONS: Record<string, string> = {
  reminder_message: "📩", urgency_prompt: "⚡", escrow_fast_track: "🚀",
  incentive_offer: "🎁", advisor_intervention: "👤",
};

const DealVelocityCommandCenter: React.FC = () => {
  const { data, isLoading } = useDealVelocityDashboard();
  const { data: scoring } = useDealConversionScoring();
  const generateFollowups = useGenerateFollowups();

  const handleGenerateFollowups = () => {
    generateFollowups.mutate(undefined, {
      onSuccess: (d: any) => toast.success(`Generated ${d?.generated || 0} follow-up actions`),
      onError: () => toast.error("Failed to generate follow-ups"),
    });
  };

  const kpis = [
    { label: "Active Deals", value: data?.total_active_deals ?? 0, icon: Activity, color: "text-primary" },
    { label: "Conversion Rate", value: `${data?.conversion_rate ?? 0}%`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Stalled Deals", value: data?.stalled_count ?? 0, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Pending Follow-ups", value: data?.followups?.filter((f: any) => f.action_status === "pending").length ?? 0, icon: Clock, color: "text-violet-500" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="escrow">Escrow Accel</TabsTrigger>
        </TabsList>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Pipeline Stage Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading pipeline data…</p>
              ) : (
                STAGES.map((stage) => {
                  const count = data?.stage_distribution?.[stage] || 0;
                  const total = data?.total_active_deals || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[stage]}`} />
                          {STAGE_LABELS[stage]}
                        </span>
                        <span className="font-medium">{count} <span className="text-muted-foreground">({pct}%)</span></span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Deal Conversion Scores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(scoring?.scored_deals || []).slice(0, 20).map((deal: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div>
                      <p className="text-sm font-medium">{deal.deal_id?.slice(0, 12)}…</p>
                      <Badge variant="outline" className="text-xs mt-1">{STAGE_LABELS[deal.stage] || deal.stage}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{deal.conversion_score}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(deal.completion_probability)}% probability</p>
                    </div>
                  </div>
                ))}
                {(!scoring?.scored_deals || scoring.scored_deals.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">No scored deals yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><ArrowRight className="h-5 w-5" /> Follow-up Actions</CardTitle>
                <Button size="sm" onClick={handleGenerateFollowups} disabled={generateFollowups.isPending}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${generateFollowups.isPending ? "animate-spin" : ""}`} />
                  Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(data?.followups || []).map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{ACTION_ICONS[f.action_type] || "📋"}</span>
                      <div>
                        <p className="text-sm font-medium">{f.action_type?.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{f.trigger_reason}</p>
                      </div>
                    </div>
                    <Badge variant={f.action_status === "pending" ? "default" : "secondary"}>{f.action_status}</Badge>
                  </div>
                ))}
                {(!data?.followups || data.followups.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">No follow-up actions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Agent Deal Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(data?.agent_metrics || []).map((a: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Agent {a.agent_user_id?.slice(0, 8)}…</p>
                      <Badge variant="outline">{a.total_deals} deals</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Avg Close</p><p className="font-medium">{a.avg_deal_closure_days}d</p></div>
                      <div><p className="text-muted-foreground">Success Rate</p><p className="font-medium">{a.deal_success_rate}%</p></div>
                      <div><p className="text-muted-foreground">Negotiation</p><p className="font-medium">{a.negotiation_efficiency_score}/100</p></div>
                      <div><p className="text-muted-foreground">Escrow Conv.</p><p className="font-medium">{a.escrow_conversion_rate}%</p></div>
                    </div>
                  </div>
                ))}
                {(!data?.agent_metrics || data.agent_metrics.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">No agent metrics yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escrow Acceleration Tab */}
        <TabsContent value="escrow">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Escrow Acceleration Metrics</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(data?.escrow_acceleration || []).map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div>
                      <p className="text-sm font-medium">Deal {e.deal_id?.slice(0, 12)}…</p>
                      <div className="flex gap-2 mt-1">
                        {e.wallet_funded && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">💰 Funded</Badge>}
                        {e.fast_escrow_eligible && <Badge className="bg-violet-500/20 text-violet-400 text-xs">⚡ Fast Track</Badge>}
                        <Badge variant="outline" className="text-xs">{e.demand_urgency_level}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{e.conversion_score}</p>
                      <p className="text-xs text-muted-foreground">score</p>
                    </div>
                  </div>
                ))}
                {(!data?.escrow_acceleration || data.escrow_acceleration.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">No escrow acceleration data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealVelocityCommandCenter;
