import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Globe, DollarSign, TrendingUp, Users, Building2,
  BarChart3, Target, ArrowUpRight, Shield, Zap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const cities = [
  { name: "Jakarta", pop: 10.5, competition: "high", readiness: 72 },
  { name: "Surabaya", pop: 2.9, competition: "medium", readiness: 58 },
  { name: "Bandung", pop: 2.5, competition: "medium", readiness: 55 },
  { name: "Medan", pop: 2.2, competition: "low", readiness: 42 },
  { name: "Yogyakarta", pop: 0.8, competition: "low", readiness: 65 },
];

const scenarioData = (budget: number, agents: number) => {
  const factor = (budget / 500) * (agents / 20);
  return [
    { month: "M1", conservative: Math.round(2 * factor), aggressive: Math.round(5 * factor) },
    { month: "M2", conservative: Math.round(5 * factor), aggressive: Math.round(12 * factor) },
    { month: "M3", conservative: Math.round(10 * factor), aggressive: Math.round(22 * factor) },
    { month: "M4", conservative: Math.round(16 * factor), aggressive: Math.round(35 * factor) },
    { month: "M5", conservative: Math.round(24 * factor), aggressive: Math.round(50 * factor) },
    { month: "M6", conservative: Math.round(34 * factor), aggressive: Math.round(68 * factor) },
  ];
};

const compColor = (c: string) => c === "high" ? "text-destructive" : c === "medium" ? "text-chart-3" : "text-chart-1";

const GlobalExpansionCapitalSimulator: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState(0);
  const [marketingBudget, setMarketingBudget] = useState([300]);
  const [agentTarget, setAgentTarget] = useState([15]);

  const city = cities[selectedCity];
  const data = scenarioData(marketingBudget[0], agentTarget[0]);
  const predicted6mDeals = data[5].conservative;
  const breakevenMonth = Math.max(2, Math.round(6 - (marketingBudget[0] / 200)));
  const capitalEfficiency = (predicted6mDeals / (marketingBudget[0] / 100)).toFixed(1);
  const leadershipProb = Math.min(95, Math.round(city.readiness * 0.8 + (marketingBudget[0] / 20) + agentTarget[0]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Global Expansion Capital Simulator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Model city-level expansion investment scenarios</p>
      </div>

      {/* City Selector */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Target City Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cities.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedCity(i)}
              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${i === selectedCity ? "border-primary/30 bg-primary/5" : "border-border/30 hover:bg-muted/20"}`}>
              <span className="text-xs font-bold text-foreground w-24">{c.name}</span>
              <span className="text-[10px] text-muted-foreground w-16">Pop: {c.pop}M</span>
              <Badge className={`${compColor(c.competition)} text-[9px]`} variant="secondary">{c.competition} comp.</Badge>
              <div className="flex-1">
                <Progress value={c.readiness} className="h-1.5" />
              </div>
              <span className="text-[10px] font-mono text-foreground w-8">{c.readiness}%</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-foreground">Marketing Budget</span>
                <Badge variant="secondary" className="text-xs">Rp {marketingBudget[0]}M/month</Badge>
              </div>
              <Slider value={marketingBudget} onValueChange={setMarketingBudget} min={100} max={1000} step={50} />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>Rp 100M</span><span>Rp 1B</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-foreground">Agent Recruitment Target</span>
                <Badge variant="secondary" className="text-xs">{agentTarget[0]} agents</Badge>
              </div>
              <Slider value={agentTarget} onValueChange={setAgentTarget} min={5} max={50} step={5} />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>5 agents</span><span>50 agents</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Predicted 6M Deals", value: predicted6mDeals, icon: Target, color: "text-primary" },
            { label: "Break-Even", value: `Month ${breakevenMonth}`, icon: TrendingUp, color: "text-chart-1" },
            { label: "Capital Efficiency", value: `${capitalEfficiency}x`, icon: DollarSign, color: "text-chart-2" },
            { label: "Leadership Prob.", value: `${leadershipProb}%`, icon: Shield, color: "text-chart-3" },
          ].map((m) => (
            <Card key={m.label} className="border-border/50">
              <CardContent className="p-3 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-0.5 ${m.color}`} />
                <div className="text-lg font-bold text-foreground">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scenario Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> {city.name} — Deal Volume Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
              <Area type="monotone" dataKey="conservative" stroke="hsl(var(--primary))" fill="url(#expGrad)" strokeWidth={2} name="Conservative" />
              <Area type="monotone" dataKey="aggressive" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={2} name="Aggressive" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalExpansionCapitalSimulator;
