import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserCheck, AlertTriangle, CheckCircle, Clock, FileText, ShieldCheck, Ban } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const screeningStats = [
  { label: "Pending Screens", value: "24", icon: Clock, color: "text-chart-3" },
  { label: "Approved Today", value: "8", icon: CheckCircle, color: "text-chart-2" },
  { label: "Flagged Issues", value: "5", icon: AlertTriangle, color: "text-chart-5" },
  { label: "Rejection Rate", value: "4.2%", icon: Ban, color: "text-destructive" },
];

const screeningResults = [
  { name: "Approved", value: 78, color: "hsl(var(--chart-2))" },
  { name: "Conditional", value: 14, color: "hsl(var(--chart-3))" },
  { name: "Under Review", value: 5, color: "hsl(var(--chart-4))" },
  { name: "Rejected", value: 3, color: "hsl(var(--destructive))" },
];

const monthlyScreenings = [
  { month: "Jan", applications: 85, approved: 72, rejected: 4 },
  { month: "Feb", applications: 92, approved: 78, rejected: 3 },
  { month: "Mar", applications: 105, approved: 89, rejected: 5 },
  { month: "Apr", applications: 88, approved: 75, rejected: 2 },
  { month: "May", applications: 110, approved: 94, rejected: 6 },
  { month: "Jun", applications: 118, approved: 102, rejected: 4 },
];

const recentApplications = [
  {
    id: "SCR-2201",
    name: "Ahmad Wijaya",
    property: "Apt. Sudirman Park 12A",
    creditScore: 720,
    income: "Rp 25M/mo",
    employment: "Verified - 3yr",
    background: "Clear",
    status: "Approved",
    time: "1h ago",
  },
  {
    id: "SCR-2200",
    name: "Sarah Chen",
    property: "Villa Canggu #7",
    creditScore: 680,
    income: "Rp 18M/mo",
    employment: "Verified - 1yr",
    background: "Clear",
    status: "Conditional",
    time: "3h ago",
  },
  {
    id: "SCR-2199",
    name: "Budi Santoso",
    property: "BSD Townhouse Unit 4",
    creditScore: 590,
    income: "Rp 12M/mo",
    employment: "Self-employed",
    background: "Minor flag",
    status: "Under Review",
    time: "5h ago",
  },
  {
    id: "SCR-2198",
    name: "Michael Brown",
    property: "Kemang Residence 8F",
    creditScore: 750,
    income: "Rp 45M/mo",
    employment: "Verified - 5yr",
    background: "Clear",
    status: "Approved",
    time: "8h ago",
  },
];

const creditColor = (score: number) => {
  if (score >= 700) return "text-chart-2";
  if (score >= 600) return "text-chart-3";
  return "text-destructive";
};

const statusBadge = (status: string) => {
  switch (status) {
    case "Approved": return "outline";
    case "Rejected": return "destructive";
    case "Under Review": return "secondary";
    default: return "secondary";
  }
};

const TenantScreening = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tenant Screening</h2>
        <p className="text-muted-foreground text-sm">Background checks, credit scoring, employment verification, and application management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {screeningStats.map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Screening Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyScreenings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="applications" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Results Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={screeningResults} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {screeningResults.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {screeningResults.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-muted-foreground">{r.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{r.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{app.name}</span>
                    <Badge variant={statusBadge(app.status) as any} className="text-[10px]">{app.status}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{app.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{app.property}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Credit Score</span>
                    <p className={`font-semibold ${creditColor(app.creditScore)}`}>{app.creditScore}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Income</span>
                    <p className="font-medium text-foreground">{app.income}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employment</span>
                    <p className="font-medium text-foreground">{app.employment}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Background</span>
                    <p className={`font-medium ${app.background === "Clear" ? "text-chart-2" : "text-chart-3"}`}>{app.background}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantScreening;
