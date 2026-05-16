import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFounderDashboard, useAggregateKpis, useResolveAlert } from "@/hooks/useFounderKpiEngine";
import {
  Activity, TrendingUp, Wallet, Building, Users, AlertTriangle,
  RefreshCw, DollarSign, Zap, Target, CheckCircle, ArrowUp, ArrowDown
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const anim = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const FounderControlTower: React.FC = () => {
  const { data, isLoading } = useFounderDashboard();
  const aggregate = useAggregateKpis();
  const resolveAlert = useResolveAlert();

  const kpis = data?.daily_kpis || {};
  const dv = data?.deal_velocity;
  const cf = data?.capital_flow;
  const supply = data?.supply;
  const growth = data?.growth;
  const alerts = data?.alerts || [];
  const trends = data?.trends || [];

  const topKpis = [
    { label: "New Users", value: kpis.daily_new_user_signups ?? 0, icon: Users, color: "text-primary" },
    { label: "New Listings", value: kpis.daily_new_listings_live ?? 0, icon: Building, color: "text-emerald-500" },
    { label: "Escrow Today", value: kpis.escrow_transactions_today ?? 0, icon: DollarSign, color: "text-violet-500" },
    { label: "Deals Today", value: kpis.new_deals_today ?? 0, icon: Zap, color: "text-amber-500" },
    { label: "Active Listings", value: kpis.total_active_listings ?? 0, icon: Target, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Founder Control Tower</h2>
          <p className="text-sm text-muted-foreground">Real-time marketplace intelligence</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => aggregate.mutate(undefined, {
          onSuccess: () => toast.success("KPIs aggregated"),
          onError: () => toast.error("Aggregation failed"),
        })} disabled={aggregate.isPending}>
          <RefreshCw className={`h-4 w-4 mr-1 ${aggregate.isPending ? "animate-spin" : ""}`} />
          Refresh KPIs
        </Button>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {topKpis.map((kpi, i) => (
          <motion.div key={kpi.label} {...anim(i)}>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`h-7 w-7 ${kpi.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="capital">Capital</TabsTrigger>
          <TabsTrigger value="supply">Supply</TabsTrigger>
          <TabsTrigger value="alerts">Alerts {alerts.length > 0 && <Badge variant="destructive" className="ml-1 text-xs">{alerts.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Deal Velocity Card */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Deal Velocity</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Deals</span><span className="font-medium">{dv?.total_active_deals ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Avg Pipeline Days</span><span className="font-medium">{dv?.avg_days_in_pipeline ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Inquiry→Escrow</span><span className="font-medium">{dv?.inquiry_to_escrow_rate ?? 0}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Escrow→Close</span><span className="font-medium">{dv?.escrow_to_close_rate ?? 0}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Stalled</span><span className="font-medium text-amber-500">{dv?.stalled_deal_count ?? 0}</span></div>
              </CardContent>
            </Card>

            {/* Capital Flow Card */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4" /> Capital Flow</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Wallet Balance</span><span className="font-medium">{cf?.wallet_total_balance ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Inflow Today</span><span className="font-medium text-emerald-500">{cf?.new_capital_inflow_today ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Escrow Locked</span><span className="font-medium">{cf?.escrow_capital_locked ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payouts Released</span><span className="font-medium">{cf?.payouts_released_today ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Exchange Vol</span><span className="font-medium">{cf?.liquidity_exchange_volume ?? 0}</span></div>
              </CardContent>
            </Card>

            {/* Growth Funnel Card */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Growth Funnel</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Signup→Wallet</span><span>{growth?.signup_to_wallet_rate ?? 0}%</span></div>
                  <Progress value={growth?.signup_to_wallet_rate ?? 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Wallet→Escrow</span><span>{growth?.wallet_to_escrow_rate ?? 0}%</span></div>
                  <Progress value={growth?.wallet_to_escrow_rate ?? 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Repeat Investment</span><span>{growth?.repeat_investment_rate ?? 0}%</span></div>
                  <Progress value={growth?.repeat_investment_rate ?? 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deals */}
        <TabsContent value="deals">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Deal Pipeline Health</CardTitle></CardHeader>
            <CardContent>
              {dv ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Active", value: dv.total_active_deals, color: "text-primary" },
                    { label: "Avg Days", value: dv.avg_days_in_pipeline, color: "text-foreground" },
                    { label: "Inq→Escrow", value: `${dv.inquiry_to_escrow_rate}%`, color: "text-emerald-500" },
                    { label: "Esc→Close", value: `${dv.escrow_to_close_rate}%`, color: "text-violet-500" },
                    { label: "Stalled", value: dv.stalled_deal_count, color: "text-amber-500" },
                  ].map((m, i) => (
                    <div key={i} className="text-center p-4 rounded-lg bg-muted/30 border border-border/40">
                      <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No deal velocity data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capital */}
        <TabsContent value="capital">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Capital Flow Intelligence</CardTitle></CardHeader>
            <CardContent>
              {cf ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Balance", value: cf.wallet_total_balance },
                    { label: "Inflow Today", value: cf.new_capital_inflow_today },
                    { label: "Escrow Locked", value: cf.escrow_capital_locked },
                    { label: "Payouts", value: cf.payouts_released_today },
                    { label: "Exchange Vol", value: cf.liquidity_exchange_volume },
                  ].map((m, i) => (
                    <div key={i} className="text-center p-4 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-xl font-bold">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No capital flow data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supply */}
        <TabsContent value="supply">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Supply Health</CardTitle></CardHeader>
            <CardContent>
              {supply ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "New Today", value: supply.new_listings_today },
                    { label: "Under Verification", value: supply.listings_under_verification },
                    { label: "Avg Quality", value: supply.avg_listing_quality_score },
                    { label: "Gap Zones", value: supply.high_demand_low_supply_zones },
                    { label: "Top Agent Score", value: supply.top_agent_activity_score },
                  ].map((m, i) => (
                    <div key={i} className="text-center p-4 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-xl font-bold">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No supply data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Priority Alerts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.map((a: any) => (
                  <div key={a.alert_id} className={`flex items-center justify-between p-3 rounded-lg border ${SEVERITY_STYLES[a.severity_level] || SEVERITY_STYLES.medium}`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{a.alert_message}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{a.alert_type}</Badge>
                          <Badge variant="outline" className="text-xs">{a.severity_level}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => resolveAlert.mutate(a.alert_id, {
                      onSuccess: () => toast.success("Alert resolved"),
                    })}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No active alerts — all systems nominal ✓</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Growth Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {trends.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div>
                      <p className="text-sm font-medium">{t.metric_name?.replace(/_/g, " ")}</p>
                      <Badge variant="outline" className="text-xs mt-1">{t.period_type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.growth_rate > 0 ? <ArrowUp className="h-4 w-4 text-emerald-500" /> : t.growth_rate < 0 ? <ArrowDown className="h-4 w-4 text-destructive" /> : null}
                      <span className={`font-bold ${t.growth_rate > 0 ? "text-emerald-500" : t.growth_rate < 0 ? "text-destructive" : ""}`}>
                        {t.growth_rate > 0 ? "+" : ""}{t.growth_rate}%
                      </span>
                    </div>
                  </div>
                ))}
                {trends.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No trend data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FounderControlTower;
