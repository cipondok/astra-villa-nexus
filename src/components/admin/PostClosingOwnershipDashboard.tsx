import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Home, TrendingUp, FileText, Bell, MapPin, DollarSign,
  Calendar, ArrowUpRight, Shield, Clock, Eye, Wrench, BarChart3
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const appreciationData = [
  { month: "Oct", value: 4100 }, { month: "Nov", value: 4150 }, { month: "Dec", value: 4180 },
  { month: "Jan", value: 4220 }, { month: "Feb", value: 4280 }, { month: "Mar", value: 4350 },
];

const properties = [
  { title: "Modern 3BR Villa", location: "Seminyak, Bali", purchased: "Mar 2026", purchasePrice: "Rp 4.1B", currentValue: "Rp 4.35B", appreciation: 6.1 },
  { title: "Apartment Canggu", location: "Canggu, Bali", purchased: "Jan 2026", purchasePrice: "Rp 1.8B", currentValue: "Rp 1.92B", appreciation: 6.7 },
];

const documents = [
  { name: "Property Title (SHM)", type: "Legal", date: "Mar 22, 2026" },
  { name: "Sale Agreement", type: "Transaction", date: "Mar 22, 2026" },
  { name: "Tax Payment Receipt", type: "Tax", date: "Mar 25, 2026" },
  { name: "Building Permit (IMB)", type: "Legal", date: "Mar 22, 2026" },
];

const reminders = [
  { text: "Annual property tax payment due", date: "Apr 15, 2026", urgency: "high" },
  { text: "AC system maintenance scheduled", date: "Apr 20, 2026", urgency: "medium" },
  { text: "Insurance renewal reminder", date: "May 1, 2026", urgency: "low" },
];

const nearbyActivity = [
  { text: "2 new listings in Seminyak under Rp 5B", time: "2h ago" },
  { text: "Average price up 3.2% in district this quarter", time: "1d ago" },
  { text: "New commercial development announced nearby", time: "3d ago" },
];

const urgColor = (u: string) =>
  u === "high" ? "bg-destructive/15 text-destructive" :
  u === "medium" ? "bg-chart-3/15 text-chart-3" :
  "bg-primary/15 text-primary";

const PostClosingOwnershipDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            Property Ownership Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Post-closing ownership intelligence & management</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">{properties.length} Properties Owned</Badge>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total Portfolio", value: "Rp 6.27B", icon: DollarSign, color: "text-primary", delta: "+6.3%" },
          { label: "Unrealized Gain", value: "Rp 370M", icon: TrendingUp, color: "text-chart-1", delta: "+6.3%" },
          { label: "Avg Appreciation", value: "6.4%", icon: BarChart3, color: "text-chart-2", delta: "Annualized" },
          { label: "Documents", value: "8 stored", icon: FileText, color: "text-chart-3", delta: "All verified" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                <div className="text-lg font-bold text-foreground">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
                <div className="text-[9px] text-chart-1 flex items-center justify-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5" />{m.delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Appreciation Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Property Appreciation Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={appreciationData}>
              <defs>
                <linearGradient id="ownerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={["dataMin - 50", "dataMax + 50"]} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 11 }} formatter={(v: number) => [`Rp ${v}M`, "Value"]} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#ownerGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Property Cards */}
        <div className="md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Owned Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {properties.map((p, i) => (
                <motion.div key={p.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border-border/30">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-xs font-bold text-foreground">{p.title}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.location}</div>
                        </div>
                        <Badge className="bg-chart-1/15 text-chart-1 text-[8px]">+{p.appreciation}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><div className="text-[9px] text-muted-foreground">Purchased</div><div className="text-[11px] font-bold text-foreground">{p.purchasePrice}</div></div>
                        <div><div className="text-[9px] text-muted-foreground">Current Value</div><div className="text-[11px] font-bold text-chart-1">{p.currentValue}</div></div>
                        <div><div className="text-[9px] text-muted-foreground">Date</div><div className="text-[11px] font-bold text-foreground">{p.purchased}</div></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Equity Gauge */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-primary" /> Equity Growth</div>
                <Badge variant="secondary" className="text-[9px]">+Rp 370M total</Badge>
              </div>
              <Progress value={63} className="h-2.5" />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>Purchase Value: Rp 5.9B</span><span>Current: Rp 6.27B</span>
              </div>
            </CardContent>
          </Card>

          {/* Resale Timing */}
          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-chart-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">Suggested Resale Timing</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Optimal holding period for Villa Seminyak: 18–24 months for 12–15% appreciation potential based on district growth trajectory.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Documents */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-primary" /> Documents</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded border border-border/20">
                  <Shield className="h-3 w-3 text-chart-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-foreground truncate">{d.name}</div>
                    <div className="text-[8px] text-muted-foreground">{d.type} • {d.date}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0"><Eye className="h-3 w-3" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Maintenance Reminders */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-chart-3" /> Reminders</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {reminders.map((r, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded border border-border/20">
                  <Bell className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-foreground truncate">{r.text}</div>
                    <div className="text-[8px] text-muted-foreground">{r.date}</div>
                  </div>
                  <Badge className={`${urgColor(r.urgency)} text-[7px]`}>{r.urgency}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Nearby Activity */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Nearby Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {nearbyActivity.map((a, i) => (
                <div key={i} className="p-1.5 rounded border border-border/20">
                  <div className="text-[10px] text-foreground">{a.text}</div>
                  <div className="text-[8px] text-muted-foreground">{a.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostClosingOwnershipDashboard;
