import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wrench, Clock, AlertTriangle, CheckCircle, Home, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const weeklyRequests = [
  { week: "W1", new: 28, resolved: 22, pending: 15 },
  { week: "W2", new: 35, resolved: 30, pending: 20 },
  { week: "W3", new: 22, resolved: 25, pending: 17 },
  { week: "W4", new: 42, resolved: 35, pending: 24 },
  { week: "W5", new: 38, resolved: 40, pending: 22 },
  { week: "W6", new: 30, resolved: 32, pending: 20 },
];

const categoryDist = [
  { name: "Plumbing", value: 28, color: "hsl(var(--primary))" },
  { name: "Electrical", value: 22, color: "hsl(var(--chart-2))" },
  { name: "AC/HVAC", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Structural", value: 15, color: "hsl(var(--chart-4))" },
  { name: "Other", value: 17, color: "hsl(var(--muted-foreground))" },
];

const activeRequests = [
  { id: "MR-1042", property: "Villa Seminyak #12", category: "Plumbing", priority: "high", tenant: "Ahmad R.", created: "2d ago", status: "in-progress" },
  { id: "MR-1041", property: "Apt BSD Tower A-1205", category: "AC/HVAC", priority: "medium", tenant: "Sarah D.", created: "3d ago", status: "assigned" },
  { id: "MR-1040", property: "House Menteng #8", category: "Electrical", priority: "high", tenant: "Budi S.", created: "4d ago", status: "in-progress" },
  { id: "MR-1039", property: "Apt Kemang #502", category: "Structural", priority: "low", tenant: "Lisa T.", created: "5d ago", status: "pending" },
  { id: "MR-1038", property: "Villa Ubud #3", category: "Plumbing", priority: "medium", tenant: "Michael C.", created: "1w ago", status: "completed" },
];

const prioColor: Record<string, string> = { high: "text-destructive", medium: "text-chart-4", low: "text-chart-2" };
const statusBadge: Record<string, string> = { "in-progress": "bg-primary/10 text-primary", assigned: "bg-chart-2/10 text-chart-2", pending: "bg-chart-4/10 text-chart-4", completed: "bg-chart-3/10 text-chart-3" };

const MaintenanceRequestTracker = () => {
  const totalOpen = 62;
  const avgResolution = "3.2d";

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Maintenance Requests</h2>
        <p className="text-sm text-muted-foreground">Property maintenance tracking, vendor assignment, and resolution monitoring</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Wrench className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalOpen}</p>
          <p className="text-[10px] text-muted-foreground">Open Requests</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-4" />
          <p className="text-xl font-bold text-chart-4">{avgResolution}</p>
          <p className="text-[10px] text-muted-foreground">Avg Resolution</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">8</p>
          <p className="text-[10px] text-muted-foreground">Urgent</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">184</p>
          <p className="text-[10px] text-muted-foreground">Resolved (6mo)</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Request Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={weeklyRequests}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="new" fill="hsl(var(--primary))" name="New" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(var(--chart-2))" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={categoryDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}%`}>
                  {categoryDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Active Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {activeRequests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Home className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{r.id}</span>
                  <Badge variant="outline" className={`text-[9px] ${prioColor[r.priority]}`}>{r.priority}</Badge>
                  <Badge variant="outline" className="text-[9px]">{r.category}</Badge>
                </div>
                <p className="text-xs text-foreground mt-0.5">{r.property}</p>
                <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span><User className="h-2.5 w-2.5 inline" /> {r.tenant}</span>
                  <span>{r.created}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadge[r.status]}`}>{r.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceRequestTracker;
