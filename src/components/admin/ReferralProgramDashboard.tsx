import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Gift, TrendingUp, DollarSign, Share2, ArrowUpRight, Link2, Copy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const monthlyReferrals = [
  { month: "Oct", referrals: 120, conversions: 42, revenue: 18 },
  { month: "Nov", referrals: 155, conversions: 58, revenue: 24 },
  { month: "Dec", referrals: 98, conversions: 35, revenue: 15 },
  { month: "Jan", referrals: 185, conversions: 72, revenue: 32 },
  { month: "Feb", referrals: 210, conversions: 85, revenue: 38 },
  { month: "Mar", referrals: 245, conversions: 98, revenue: 44 },
];

const channelData = [
  { name: "WhatsApp", value: 38, color: "hsl(var(--chart-2))" },
  { name: "Email", value: 22, color: "hsl(var(--primary))" },
  { name: "Social Media", value: 25, color: "hsl(var(--chart-3))" },
  { name: "Direct Link", value: 15, color: "hsl(var(--chart-4))" },
];

const topReferrers = [
  { name: "Ahmad Rizki", referrals: 45, conversions: 18, earned: 9200000, tier: "Gold" },
  { name: "Sarah Dewi", referrals: 38, conversions: 15, earned: 7800000, tier: "Gold" },
  { name: "Budi Santoso", referrals: 28, conversions: 12, earned: 5400000, tier: "Silver" },
  { name: "Citra Wulandari", referrals: 22, conversions: 8, earned: 3600000, tier: "Silver" },
  { name: "David Lim", referrals: 18, conversions: 7, earned: 2800000, tier: "Bronze" },
];

const tierColor: Record<string, string> = { Gold: "text-chart-3", Silver: "text-muted-foreground", Bronze: "text-chart-4" };

const ReferralProgramDashboard = () => {
  const totalReferrals = monthlyReferrals.reduce((s, m) => s + m.referrals, 0);
  const totalConversions = monthlyReferrals.reduce((s, m) => s + m.conversions, 0);
  const convRate = ((totalConversions / totalReferrals) * 100).toFixed(1);
  const totalRevenue = monthlyReferrals.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Referral Program</h2>
        <p className="text-sm text-muted-foreground">Referral tracking, conversions, and reward payouts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Share2 className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalReferrals.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Referrals</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ArrowUpRight className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{convRate}%</p>
          <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {totalRevenue}M</p>
          <p className="text-[10px] text-muted-foreground">Revenue Generated</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Gift className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">Rp {(topReferrers.reduce((s, r) => s + r.earned, 0) / 1e6).toFixed(1)}M</p>
          <p className="text-[10px] text-muted-foreground">Rewards Paid</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Referral Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={monthlyReferrals}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="referrals" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Referrals" />
                <Area type="monotone" dataKey="conversions" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} name="Conversions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Channel</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={channelData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}%`}>
                  {channelData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Top Referrers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {topReferrers.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                  <Badge variant="outline" className={`text-[9px] ${tierColor[r.tier]}`}>{r.tier}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{r.referrals} referrals</span>
                  <span className="text-chart-2">{r.conversions} converted</span>
                  <span>Rp {(r.earned / 1e6).toFixed(1)}M earned</span>
                </div>
              </div>
              <Progress value={(r.conversions / r.referrals) * 100} className="w-16 h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralProgramDashboard;
