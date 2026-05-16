import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, ArrowRight, Eye, Search, MessageSquare, CreditCard, Home, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const journeyStages = [
  { stage: "Discovery", icon: Eye, users: 12500, dropoff: 0, color: "text-primary" },
  { stage: "Search", icon: Search, users: 8200, dropoff: 34.4, color: "text-chart-2" },
  { stage: "View Details", icon: Home, users: 4800, dropoff: 41.5, color: "text-chart-3" },
  { stage: "Inquiry", icon: MessageSquare, users: 1850, dropoff: 61.5, color: "text-chart-4" },
  { stage: "Viewing", icon: MapPin, users: 720, dropoff: 61.1, color: "text-primary" },
  { stage: "Negotiation", icon: Users, users: 380, dropoff: 47.2, color: "text-chart-2" },
  { stage: "Transaction", icon: CreditCard, users: 185, dropoff: 51.3, color: "text-chart-3" },
];

const touchpointSatisfaction = [
  { touchpoint: "Homepage", satisfaction: 82, responses: 450 },
  { touchpoint: "Search Results", satisfaction: 68, responses: 380 },
  { touchpoint: "Property Detail", satisfaction: 85, responses: 320 },
  { touchpoint: "Inquiry Form", satisfaction: 72, responses: 210 },
  { touchpoint: "Agent Chat", satisfaction: 78, responses: 180 },
  { touchpoint: "Booking Flow", satisfaction: 65, responses: 95 },
  { touchpoint: "Payment", satisfaction: 74, responses: 85 },
];

const weeklyRetention = [
  { week: "W1", returning: 42, new: 58 },
  { week: "W2", returning: 38, new: 62 },
  { week: "W3", returning: 45, new: 55 },
  { week: "W4", returning: 48, new: 52 },
  { week: "W5", returning: 52, new: 48 },
  { week: "W6", returning: 55, new: 45 },
];

const dropoffReasons = [
  { reason: "Price too high", pct: 32 },
  { reason: "Location mismatch", pct: 24 },
  { reason: "Slow agent response", pct: 18 },
  { reason: "Poor photo quality", pct: 14 },
  { reason: "Complex booking flow", pct: 12 },
];

const CustomerJourneyMap = () => {
  const conversionRate = ((journeyStages[journeyStages.length - 1].users / journeyStages[0].users) * 100).toFixed(2);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Customer Journey Map</h2>
        <p className="text-sm text-muted-foreground">End-to-end user journey analytics with touchpoint satisfaction and drop-off analysis</p>
      </div>

      {/* Journey Funnel */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Journey Funnel</CardTitle>
            <Badge variant="outline" className="text-[10px]">Overall Conversion: {conversionRate}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {journeyStages.map((stage, i) => {
              const Icon = stage.icon;
              const widthPct = Math.max(20, (stage.users / journeyStages[0].users) * 100);
              return (
                <React.Fragment key={stage.stage}>
                  <div className="flex flex-col items-center min-w-[90px]" style={{ flex: `0 0 ${widthPct}%`, maxWidth: '160px' }}>
                    <div className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center ${stage.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-medium text-foreground mt-1">{stage.stage}</p>
                    <p className="text-sm font-bold text-foreground">{stage.users.toLocaleString()}</p>
                    {stage.dropoff > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <TrendingDown className="h-2.5 w-2.5 text-destructive" />
                        <span className="text-[9px] text-destructive">-{stage.dropoff}%</span>
                      </div>
                    )}
                  </div>
                  {i < journeyStages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Touchpoint Satisfaction</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={touchpointSatisfaction} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="touchpoint" type="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={90} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="satisfaction" fill="hsl(var(--primary))" name="Satisfaction %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Returning vs New Users</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyRetention}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="returning" stroke="hsl(var(--primary))" name="Returning %" strokeWidth={2} />
                <Line type="monotone" dataKey="new" stroke="hsl(var(--chart-2))" name="New %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Top Drop-off Reasons</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dropoffReasons.map((item) => (
            <div key={item.reason} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.reason}</span>
                <span className="text-muted-foreground">{item.pct}%</span>
              </div>
              <Progress value={item.pct} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerJourneyMap;
