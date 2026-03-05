import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, AlertTriangle, CheckCircle, Eye, Ban, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const riskDistribution = [
  { name: "Low Risk", value: 842, color: "hsl(var(--chart-2))" },
  { name: "Medium Risk", value: 156, color: "hsl(var(--chart-3))" },
  { name: "High Risk", value: 43, color: "hsl(var(--chart-5))" },
  { name: "Critical", value: 12, color: "hsl(var(--destructive))" },
];

const weeklyAlerts = [
  { day: "Mon", flagged: 8, blocked: 2, resolved: 5 },
  { day: "Tue", flagged: 12, blocked: 4, resolved: 7 },
  { day: "Wed", flagged: 6, blocked: 1, resolved: 4 },
  { day: "Thu", flagged: 15, blocked: 6, resolved: 8 },
  { day: "Fri", flagged: 9, blocked: 3, resolved: 6 },
  { day: "Sat", flagged: 4, blocked: 1, resolved: 3 },
  { day: "Sun", flagged: 3, blocked: 0, resolved: 2 },
];

const recentCases = [
  { id: "FRD-2401", type: "Duplicate Listing", user: "user_8821", risk: "High", status: "Under Review", time: "12m ago" },
  { id: "FRD-2400", type: "Fake Document", user: "agent_334", risk: "Critical", status: "Blocked", time: "28m ago" },
  { id: "FRD-2399", type: "Price Manipulation", user: "owner_112", risk: "Medium", status: "Investigating", time: "1h ago" },
  { id: "FRD-2398", type: "Identity Theft", user: "user_9902", risk: "High", status: "Escalated", time: "2h ago" },
  { id: "FRD-2397", type: "Spam Listings", user: "agent_221", risk: "Low", status: "Resolved", time: "3h ago" },
];

const riskBadgeColor = (risk: string) => {
  switch (risk) {
    case "Critical": return "destructive";
    case "High": return "destructive";
    case "Medium": return "secondary";
    default: return "outline";
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case "Blocked": return <Ban className="h-3.5 w-3.5 text-destructive" />;
    case "Resolved": return <CheckCircle className="h-3.5 w-3.5 text-chart-2" />;
    case "Escalated": return <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />;
    default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const FraudDetectionDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Fraud Detection</h2>
        <p className="text-muted-foreground text-sm">Real-time fraud monitoring, risk scoring, and case management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Alerts", value: "23", icon: ShieldAlert, change: "-12%", color: "text-destructive" },
          { label: "Blocked Today", value: "7", icon: Ban, change: "+3", color: "text-chart-5" },
          { label: "Under Review", value: "16", icon: Eye, change: "5 urgent", color: "text-chart-3" },
          { label: "Resolved (7d)", value: "89", icon: CheckCircle, change: "94% rate", color: "text-chart-2" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Alert Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyAlerts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="flagged" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-muted-foreground">{r.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  {statusIcon(c.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{c.id}</span>
                      <Badge variant={riskBadgeColor(c.risk) as any} className="text-[10px]">{c.risk}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.type} • {c.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{c.status}</p>
                  <p className="text-[10px] text-muted-foreground">{c.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetectionDashboard;
