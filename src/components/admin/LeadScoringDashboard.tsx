import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, TrendingUp, Zap, ArrowUpRight, Phone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const scoreTrend = [
  { month: "Oct", hot: 28, warm: 65, cold: 120 },
  { month: "Nov", hot: 35, warm: 72, cold: 108 },
  { month: "Dec", hot: 22, warm: 58, cold: 95 },
  { month: "Jan", hot: 42, warm: 88, cold: 130 },
  { month: "Feb", hot: 48, warm: 95, cold: 115 },
  { month: "Mar", hot: 56, warm: 102, cold: 98 },
];

const scoreDist = [
  { name: "Hot (80-100)", value: 56, color: "hsl(var(--chart-4))" },
  { name: "Warm (50-79)", value: 102, color: "hsl(var(--primary))" },
  { name: "Cold (20-49)", value: 98, color: "hsl(var(--chart-2))" },
  { name: "Inactive (<20)", value: 44, color: "hsl(var(--muted-foreground))" },
];

const conversionBySource = [
  { source: "Organic Search", leads: 85, converted: 28, rate: 32.9 },
  { source: "Paid Ads", leads: 62, converted: 15, rate: 24.2 },
  { source: "Referral", leads: 48, converted: 22, rate: 45.8 },
  { source: "Social Media", leads: 55, converted: 12, rate: 21.8 },
  { source: "Direct", leads: 38, converted: 18, rate: 47.4 },
];

const topLeads = [
  { name: "Dewi Suryani", score: 95, interest: "Villa Bali", budget: "Rp 12B", activity: "Viewed 8x, Inquiry sent" },
  { name: "Michael Tanoto", score: 88, interest: "Penthouse Jakarta", budget: "Rp 25B", activity: "Scheduled viewing" },
  { name: "Rina Hartono", score: 82, interest: "3BR Apt BSD", budget: "Rp 3.5B", activity: "KPR pre-approved" },
  { name: "Agus Wibowo", score: 78, interest: "Commercial Surabaya", budget: "Rp 8B", activity: "Comparing 3 units" },
  { name: "Lisa Chen", score: 75, interest: "Land Serpong", budget: "Rp 5B", activity: "Agent contacted" },
];

const scoreColor = (score: number) => score >= 80 ? "text-chart-4" : score >= 50 ? "text-primary" : "text-muted-foreground";

const LeadScoringDashboard = () => {
  const totalLeads = scoreDist.reduce((s, d) => s + d.value, 0);
  const avgConvRate = (conversionBySource.reduce((s, c) => s + c.rate, 0) / conversionBySource.length).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Lead Scoring</h2>
        <p className="text-sm text-muted-foreground">AI-powered lead quality assessment and conversion pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalLeads}</p>
          <p className="text-[10px] text-muted-foreground">Active Leads</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-chart-4" />
          <p className="text-xl font-bold text-chart-4">56</p>
          <p className="text-[10px] text-muted-foreground">Hot Leads</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ArrowUpRight className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{avgConvRate}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Conversion</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Phone className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">142</p>
          <p className="text-[10px] text-muted-foreground">Follow-ups Due</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Lead Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="hot" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} name="Hot" />
                <Area type="monotone" dataKey="warm" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Warm" />
                <Area type="monotone" dataKey="cold" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} name="Cold" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Score Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={scoreDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${value}`}>
                  {scoreDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion by Source</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {conversionBySource.map((item) => (
              <div key={item.source} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.source}</span>
                  <span className="text-chart-2">{item.rate}% ({item.converted}/{item.leads})</span>
                </div>
                <Progress value={item.rate} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Scored Leads</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topLeads.map((lead, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                <div className={`text-sm font-bold ${scoreColor(lead.score)} w-8 text-center`}>{lead.score}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{lead.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{lead.interest} · {lead.budget}</p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0">{lead.activity.split(",")[0]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadScoringDashboard;
