import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Timer, ThumbsUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const weeklyTickets = [
  { day: "Mon", opened: 42, resolved: 38, escalated: 4 },
  { day: "Tue", opened: 55, resolved: 48, escalated: 7 },
  { day: "Wed", opened: 38, resolved: 45, escalated: 3 },
  { day: "Thu", opened: 61, resolved: 52, escalated: 9 },
  { day: "Fri", opened: 48, resolved: 50, escalated: 5 },
  { day: "Sat", opened: 22, resolved: 28, escalated: 2 },
  { day: "Sun", opened: 15, resolved: 20, escalated: 1 },
];

const responseTimeTrend = [
  { week: "W1", avgMinutes: 45 },
  { week: "W2", avgMinutes: 38 },
  { week: "W3", avgMinutes: 32 },
  { week: "W4", avgMinutes: 28 },
  { week: "W5", avgMinutes: 25 },
  { week: "W6", avgMinutes: 22 },
];

const categoryDist = [
  { name: "Account", value: 28, color: "hsl(var(--primary))" },
  { name: "Payment", value: 22, color: "hsl(var(--chart-2))" },
  { name: "Listing", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Technical", value: 15, color: "hsl(var(--chart-4))" },
  { name: "Viewing", value: 10, color: "hsl(var(--chart-5))" },
  { name: "Other", value: 7, color: "hsl(var(--muted-foreground))" },
];

const topAgents = [
  { name: "Andi Pratama", resolved: 156, avgTime: "18min", satisfaction: 4.8 },
  { name: "Dewi Lestari", resolved: 142, avgTime: "22min", satisfaction: 4.7 },
  { name: "Budi Santoso", resolved: 128, avgTime: "25min", satisfaction: 4.5 },
  { name: "Citra Wulandari", resolved: 115, avgTime: "20min", satisfaction: 4.6 },
];

const SupportTicketAnalytics = () => {
  const totalOpened = weeklyTickets.reduce((s, d) => s + d.opened, 0);
  const totalResolved = weeklyTickets.reduce((s, d) => s + d.resolved, 0);
  const resolutionRate = ((totalResolved / totalOpened) * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Support Ticket Analytics</h2>
        <p className="text-sm text-muted-foreground">Performance metrics across support operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalOpened}</p>
          <p className="text-[10px] text-muted-foreground">Opened This Week</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{resolutionRate}%</p>
          <p className="text-[10px] text-muted-foreground">Resolution Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Timer className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">22min</p>
          <p className="text-[10px] text-muted-foreground">Avg Response Time</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ThumbsUp className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">4.65</p>
          <p className="text-[10px] text-muted-foreground">Avg Satisfaction</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Ticket Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyTickets}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="opened" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Opened" />
                <Bar dataKey="resolved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Response Time Trend (min)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={responseTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="avgMinutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Avg Response (min)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}%`}>
                  {categoryDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Support Agents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topAgents.map((agent, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">#{i + 1}</div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{agent.name}</span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{agent.resolved} resolved</span>
                    <span>Avg: {agent.avgTime}</span>
                    <span className="text-chart-2">★ {agent.satisfaction}</span>
                  </div>
                </div>
                <Progress value={agent.satisfaction / 5 * 100} className="w-16 h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportTicketAnalytics;
