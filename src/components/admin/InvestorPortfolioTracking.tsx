import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Briefcase, TrendingUp, DollarSign, PieChart, ArrowUpRight,
  BarChart3, MapPin, Calendar, Shield, AlertTriangle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const growthData = [
  { month: "Sep", value: 5200 }, { month: "Oct", value: 5350 }, { month: "Nov", value: 5480 },
  { month: "Dec", value: 5600 }, { month: "Jan", value: 5820 }, { month: "Feb", value: 5950 },
  { month: "Mar", value: 6270 },
];

const allocationData = [
  { type: "Villa", value: 65, amount: "Rp 4.1B" },
  { type: "Apartment", value: 29, amount: "Rp 1.8B" },
  { type: "Land", value: 6, amount: "Rp 370M" },
];

const holdings = [
  { title: "Villa Seminyak", type: "Villa", district: "Seminyak", cost: "Rp 4.1B", current: "Rp 4.35B", roi: 6.1, status: "appreciating" },
  { title: "Apt Canggu", type: "Apartment", district: "Canggu", cost: "Rp 1.8B", current: "Rp 1.92B", roi: 6.7, status: "appreciating" },
  { title: "Land Ubud", type: "Land", district: "Ubud", cost: "Rp 350M", current: "Rp 370M", roi: 5.7, status: "stable" },
];

const transactions = [
  { type: "Purchase", property: "Villa Seminyak", amount: "Rp 4.1B", date: "Mar 22, 2026" },
  { type: "Purchase", property: "Apt Canggu", amount: "Rp 1.8B", date: "Jan 15, 2026" },
  { type: "Purchase", property: "Land Ubud", amount: "Rp 350M", date: "Nov 5, 2025" },
];

const riskData = [
  { district: "Seminyak", exposure: 65, risk: "low" },
  { district: "Canggu", exposure: 29, risk: "low" },
  { district: "Ubud", exposure: 6, risk: "medium" },
];

const riskColor = (r: string) => r === "low" ? "bg-chart-1/15 text-chart-1" : r === "medium" ? "bg-chart-3/15 text-chart-3" : "bg-destructive/15 text-destructive";
const statusColor = (s: string) => s === "appreciating" ? "bg-chart-1/15 text-chart-1" : "bg-primary/15 text-primary";

const InvestorPortfolioTracking: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Investor Portfolio Tracking
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Multi-property performance analytics</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">3 Holdings</Badge>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Portfolio Value", value: "Rp 6.64B", icon: DollarSign, color: "text-primary", delta: "+Rp 390M" },
          { label: "Total Cost", value: "Rp 6.25B", icon: Briefcase, color: "text-chart-2", delta: "Basis" },
          { label: "Unrealized Gain", value: "Rp 390M", icon: TrendingUp, color: "text-chart-1", delta: "+6.2%" },
          { label: "Avg ROI", value: "6.2%", icon: BarChart3, color: "text-chart-3", delta: "Annualized" },
          { label: "Holdings", value: "3", icon: PieChart, color: "text-primary", delta: "3 districts" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-border/50">
              <CardContent className="p-2.5 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                <div className="text-sm font-bold text-foreground">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
                <div className="text-[9px] text-chart-1 flex items-center justify-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5" />{m.delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Growth Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Portfolio Growth Momentum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={["dataMin - 100", "dataMax + 100"]} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 11 }} formatter={(v: number) => [`Rp ${v}M`, "Value"]} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="url(#portGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Holdings */}
        <div className="md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Individual Property ROI</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {holdings.map((h, i) => (
                <motion.div key={h.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border-border/30">
                    <CardContent className="p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-foreground">{h.title}</span>
                          <span className="text-[9px] text-muted-foreground ml-1.5 flex items-center gap-0.5 inline-flex"><MapPin className="h-2.5 w-2.5" />{h.district}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[8px]">{h.type}</Badge>
                          <Badge className={`${statusColor(h.status)} text-[8px]`}>{h.status}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><div className="text-[9px] text-muted-foreground">Cost</div><div className="text-[11px] font-bold text-foreground">{h.cost}</div></div>
                        <div><div className="text-[9px] text-muted-foreground">Current</div><div className="text-[11px] font-bold text-chart-1">{h.current}</div></div>
                        <div><div className="text-[9px] text-muted-foreground">ROI</div><div className="text-[11px] font-bold text-chart-1">+{h.roi}%</div></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Allocation Breakdown */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Diversification</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allocationData.map(a => (
                  <div key={a.type}>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-foreground font-medium">{a.type}</span>
                      <span className="text-muted-foreground">{a.amount} ({a.value}%)</span>
                    </div>
                    <Progress value={a.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Transaction History */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> Transaction History</CardTitle></CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {transactions.map((t, i) => (
                <div key={i} className="p-1.5 rounded border border-border/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-foreground">{t.property}</span>
                    <Badge variant="secondary" className="text-[7px]">{t.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-primary font-bold">{t.amount}</span>
                    <span className="text-[8px] text-muted-foreground">{t.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Exposure */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-xs flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-chart-3" /> Risk Exposure</CardTitle></CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {riskData.map(r => (
                <div key={r.district} className="flex items-center gap-2 p-1.5 rounded border border-border/20">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-foreground">{r.district}</div>
                    <Progress value={r.exposure} className="h-1 mt-0.5" />
                  </div>
                  <span className="text-[9px] text-foreground">{r.exposure}%</span>
                  <Badge className={`${riskColor(r.risk)} text-[7px]`}>{r.risk}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvestorPortfolioTracking;
