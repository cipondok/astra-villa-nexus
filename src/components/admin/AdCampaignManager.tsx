import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Megaphone, TrendingUp, DollarSign, Eye, MousePointer, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const campaigns = [
  { name: "Jakarta Premium Homes", platform: "Google Ads", budget: 15, spent: 12.8, impressions: 245000, clicks: 4200, conversions: 85, status: "active" },
  { name: "Bali Villa Showcase", platform: "Meta Ads", budget: 10, spent: 8.5, impressions: 180000, clicks: 5800, conversions: 62, status: "active" },
  { name: "First-Time Buyer Promo", platform: "Google Ads", budget: 8, spent: 7.2, impressions: 120000, clicks: 3100, conversions: 48, status: "active" },
  { name: "Agent Recruitment", platform: "LinkedIn", budget: 5, spent: 4.8, impressions: 55000, clicks: 1200, conversions: 28, status: "paused" },
  { name: "Ramadan Special", platform: "TikTok", budget: 12, spent: 11.5, impressions: 320000, clicks: 8500, conversions: 35, status: "completed" },
];

const weeklyPerf = [
  { week: "W1", impressions: 85, clicks: 3.2, conversions: 42 },
  { week: "W2", impressions: 92, clicks: 3.8, conversions: 48 },
  { week: "W3", impressions: 78, clicks: 2.9, conversions: 38 },
  { week: "W4", impressions: 105, clicks: 4.5, conversions: 55 },
  { week: "W5", impressions: 110, clicks: 4.8, conversions: 62 },
  { week: "W6", impressions: 120, clicks: 5.2, conversions: 68 },
];

const platformDist = [
  { name: "Google Ads", value: 42, color: "hsl(var(--primary))" },
  { name: "Meta Ads", value: 28, color: "hsl(var(--chart-2))" },
  { name: "TikTok", value: 18, color: "hsl(var(--chart-3))" },
  { name: "LinkedIn", value: 12, color: "hsl(var(--chart-4))" },
];

const statusColor: Record<string, string> = { active: "text-chart-2", paused: "text-chart-4", completed: "text-muted-foreground" };

const AdCampaignManager = () => {
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0).toFixed(1);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgCPA = (parseFloat(totalSpent) / totalConversions * 1e6).toFixed(0);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Ad Campaign Manager</h2>
        <p className="text-sm text-muted-foreground">Paid advertising campaigns, budget tracking, and ROAS optimization</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Megaphone className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{campaigns.length}</p>
          <p className="text-[10px] text-muted-foreground">Campaigns</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-chart-4" />
          <p className="text-xl font-bold text-chart-4">Rp {totalSpent}M</p>
          <p className="text-[10px] text-muted-foreground">Total Spent</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{totalConversions}</p>
          <p className="text-[10px] text-muted-foreground">Conversions</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(parseInt(avgCPA) / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-muted-foreground">Avg CPA</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={weeklyPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="Impressions (K)" />
                <Area type="monotone" dataKey="conversions" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} name="Conversions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Platform</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={platformDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}%`}>
                  {platformDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Campaign Directory</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {campaigns.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Megaphone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <Badge variant="outline" className={`text-[9px] ${statusColor[c.status]}`}>{c.status}</Badge>
                  <Badge variant="outline" className="text-[9px]">{c.platform}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span><Eye className="h-2.5 w-2.5 inline" /> {(c.impressions / 1000).toFixed(0)}K impr</span>
                  <span><MousePointer className="h-2.5 w-2.5 inline" /> {c.clicks.toLocaleString()} clicks</span>
                  <span className="text-chart-2">{c.conversions} conv</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">Rp {c.spent}M / {c.budget}M</p>
                <Progress value={(c.spent / c.budget) * 100} className="w-16 h-1.5 mt-1" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdCampaignManager;
