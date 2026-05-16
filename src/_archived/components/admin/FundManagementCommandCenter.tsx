import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Landmark, DollarSign, Users, TrendingUp, BarChart3,
  Shield, PieChart, Clock, CheckCircle2, AlertTriangle,
  RefreshCw, Building, Briefcase, ArrowDownToLine, Layers,
} from "lucide-react";
import { useFundDashboard } from "@/hooks/useFundManagement";

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const fmtIDR = (n: number) => `Rp ${fmt(n)}`;
const fmtB = (n: number) => n >= 1e9 ? `Rp ${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `Rp ${(n / 1e6).toFixed(1)}M` : fmtIDR(n);

const anim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const Metric = ({ icon: Icon, label, value, sub, color = "text-primary" }: any) => (
  <motion.div variants={anim}>
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const FundRow = ({ fund }: { fund: any }) => {
  const pct = fund.target_raise_amount
    ? Math.min(100, Math.round((Number(fund.committed_capital || 0) / Number(fund.target_raise_amount)) * 100))
    : 0;
  const statusMap: Record<string, string> = {
    raising: "bg-amber-500/20 text-amber-400",
    active: "bg-emerald-500/20 text-emerald-400",
    closed: "bg-muted text-muted-foreground",
  };
  const strategyMap: Record<string, string> = {
    income_yield: "Income Yield",
    growth_appreciation: "Growth",
    mixed: "Mixed Strategy",
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{fund.fund_name}</h3>
            <p className="text-xs text-muted-foreground">{strategyMap[fund.fund_strategy_type] || fund.fund_type || "Mixed"}</p>
          </div>
          <Badge className={statusMap[fund.fund_status] || "bg-muted"}>{fund.fund_status}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Target</span>
            <p className="font-semibold text-foreground">{fmtB(Number(fund.target_raise_amount || 0))}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Committed</span>
            <p className="font-semibold text-foreground">{fmtB(Number(fund.committed_capital || 0))}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fees</span>
            <p className="font-semibold text-foreground">{fund.management_fee_percent || 0}% / {fund.performance_fee_percent || 0}%</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Capital Raised</span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

const FundManagementCommandCenter: React.FC = () => {
  const { data: dashboard, isLoading, refetch } = useFundDashboard();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Fund & REIT Management Center</h1>
            <p className="text-sm text-muted-foreground">Pooled capital vehicles, NAV tracking & distribution management</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={Briefcase} label="Total Funds" value={dashboard?.total_funds ?? "—"} />
        <Metric icon={CheckCircle2} label="Active Funds" value={dashboard?.active_funds ?? "—"} color="text-emerald-400" />
        <Metric icon={TrendingUp} label="Raising" value={dashboard?.raising_funds ?? "—"} color="text-amber-400" />
        <Metric icon={Users} label="Unique Investors" value={dashboard?.unique_investors ?? "—"} color="text-blue-400" />
        <Metric icon={DollarSign} label="Total AUM" value={dashboard ? fmtB(dashboard.total_aum_idr) : "—"} />
        <Metric icon={ArrowDownToLine} label="Distributed" value={dashboard ? fmtB(dashboard.total_distributed_idr) : "—"} color="text-cyan-400" />
        <Metric icon={Building} label="Properties Allocated" value={dashboard?.total_properties_allocated ?? "—"} />
        <Metric icon={Clock} label="Pending Redemptions" value={dashboard?.pending_redemptions ?? "—"} color="text-rose-400" />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="funds" className="space-y-3">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="funds">Fund Vehicles</TabsTrigger>
          <TabsTrigger value="nav">NAV & Performance</TabsTrigger>
          <TabsTrigger value="compliance">Regulatory</TabsTrigger>
        </TabsList>

        <TabsContent value="funds">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading funds…</div>
          ) : !dashboard?.funds?.length ? (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Landmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No investment funds created yet</p>
                <p className="text-xs mt-1">Create your first fund vehicle to start pooling capital</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboard.funds.map((f: any) => <FundRow key={f.id} fund={f} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="nav">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> NAV History & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.latest_nav_records?.length ? (
                <div className="space-y-2">
                  {dashboard.latest_nav_records.map((nav: any, i: number) => (
                    <div key={nav.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">NAV/Unit: {fmtIDR(Number(nav.nav_per_unit))}</p>
                        <p className="text-xs text-muted-foreground">Total Value: {fmtB(Number(nav.total_fund_value || 0))}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {nav.valuation_timestamp ? new Date(nav.valuation_timestamp).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No NAV records available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Regulatory & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "KYC/AML Verification", status: "Integrated", icon: CheckCircle2, desc: "Investor identity verified before subscription" },
                  { label: "Accreditation Tiers", status: "Active", icon: Users, desc: "Retail / Accredited / Institutional classification" },
                  { label: "Financial Reporting", status: "Ready", icon: BarChart3, desc: "NAV, distribution, and performance export capability" },
                  { label: "Audit Trail", status: "Logging", icon: Shield, desc: "All fund transactions and NAV changes recorded" },
                  { label: "Investor Concentration", status: "Monitored", icon: AlertTriangle, desc: "Max single-investor exposure limits enforced" },
                  { label: "Redemption Gate", status: "Configured", icon: Layers, desc: "14-day settlement window for redemption requests" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <c.icon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">{c.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundManagementCommandCenter;
