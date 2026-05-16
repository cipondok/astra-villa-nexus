import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Search, Eye, Heart, MessageSquare, CreditCard, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
  icon: typeof Users;
  color: string;
}

const funnelSteps: FunnelStep[] = [
  { name: "Visit Website", count: 125000, percentage: 100, dropoff: 0, icon: Users, color: "hsl(var(--primary))" },
  { name: "Search Properties", count: 68000, percentage: 54.4, dropoff: 45.6, icon: Search, color: "hsl(var(--chart-2))" },
  { name: "View Listing", count: 42000, percentage: 33.6, dropoff: 38.2, icon: Eye, color: "hsl(var(--chart-3))" },
  { name: "Save / Favorite", count: 12500, percentage: 10.0, dropoff: 70.2, icon: Heart, color: "hsl(var(--chart-4))" },
  { name: "Send Inquiry", count: 5800, percentage: 4.64, dropoff: 53.6, icon: MessageSquare, color: "hsl(var(--chart-5))" },
  { name: "Schedule Viewing", count: 2200, percentage: 1.76, dropoff: 62.1, icon: CheckCircle, color: "hsl(var(--primary))" },
  { name: "Make Transaction", count: 380, percentage: 0.30, dropoff: 82.7, icon: CreditCard, color: "hsl(var(--chart-2))" },
];

const conversionBySource = [
  { source: "Organic Search", visitors: 45000, conversions: 180, rate: 0.40 },
  { source: "Direct", visitors: 32000, conversions: 96, rate: 0.30 },
  { source: "Social Media", visitors: 25000, conversions: 50, rate: 0.20 },
  { source: "Referral", visitors: 15000, conversions: 38, rate: 0.25 },
  { source: "Paid Ads", visitors: 8000, conversions: 16, rate: 0.20 },
];

const barData = funnelSteps.map(s => ({ name: s.name.split(" ").slice(0, 2).join(" "), count: s.count }));

const UserFunnelAnalysis = () => {
  const overallConversion = ((funnelSteps[funnelSteps.length - 1].count / funnelSteps[0].count) * 100).toFixed(2);
  const biggestDropoff = funnelSteps.reduce((max, s) => s.dropoff > max.dropoff ? s : max, funnelSteps[0]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Funnel Analysis</h2>
          <p className="text-sm text-muted-foreground">Conversion pipeline from visit to transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{(funnelSteps[0].count / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Visitors</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CreditCard className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{funnelSteps[funnelSteps.length - 1].count}</p>
          <p className="text-[10px] text-muted-foreground">Transactions</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{overallConversion}%</p>
          <p className="text-[10px] text-muted-foreground">Overall CVR</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ArrowRight className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{biggestDropoff.dropoff}%</p>
          <p className="text-[10px] text-muted-foreground">Biggest Drop</p>
        </CardContent></Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion Funnel</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {funnelSteps.map((step, i) => {
            const Icon = step.icon;
            const widthPercent = Math.max(step.percentage, 8);
            return (
              <div key={i}>
                <div className="flex items-center gap-3">
                  <div className="w-8 shrink-0 text-center">
                    <Icon className="h-4 w-4 mx-auto text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{step.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{step.count.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[9px]">{step.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="h-6 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%`, backgroundColor: step.color }}
                      />
                    </div>
                  </div>
                </div>
                {i < funnelSteps.length - 1 && step.dropoff > 0 && (
                  <div className="ml-11 my-1 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 text-destructive rotate-90" />
                    <span className="text-[10px] text-destructive">-{step.dropoff}% drop-off</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* By Source */}
      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion by Traffic Source</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversionBySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="source" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="conversions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserFunnelAnalysis;
