import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Activity, Target, BarChart3,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Zap, Shield
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const elasticityCurve = [
  { priceChange: -10, inquiryChange: 65 }, { priceChange: -8, inquiryChange: 52 },
  { priceChange: -5, inquiryChange: 35 }, { priceChange: -3, inquiryChange: 28 },
  { priceChange: 0, inquiryChange: 0 }, { priceChange: 3, inquiryChange: -18 },
  { priceChange: 5, inquiryChange: -30 }, { priceChange: 8, inquiryChange: -48 },
  { priceChange: 10, inquiryChange: -58 },
];

const listings = [
  { id: "L-91", title: "Seminyak Villa 4BR", current: 4.2, recommended: 4.05, demand: 85, dom: 12, elasticity: 0.82, risk: "low" },
  { id: "L-78", title: "Canggu Modern House", current: 2.8, recommended: 2.65, demand: 72, dom: 28, elasticity: 0.68, risk: "medium" },
  { id: "L-103", title: "Nusa Dua Waterfront", current: 8.5, recommended: 8.2, demand: 58, dom: 45, elasticity: 0.45, risk: "high" },
  { id: "L-115", title: "Ubud Eco Retreat", current: 3.2, recommended: 3.1, demand: 65, dom: 18, elasticity: 0.72, risk: "low" },
  { id: "L-128", title: "BSD Premium Apt", current: 1.5, recommended: 1.42, demand: 78, dom: 8, elasticity: 0.88, risk: "low" },
];

const domPrediction = [
  { day: 0, current: 100, optimized: 100, aggressive: 100 },
  { day: 7, current: 88, optimized: 72, aggressive: 55 },
  { day: 14, current: 78, optimized: 52, aggressive: 30 },
  { day: 21, current: 70, optimized: 35, aggressive: 15 },
  { day: 30, current: 62, optimized: 20, aggressive: 5 },
];

const riskColor = (r: string) => r === "high" ? "text-destructive" : r === "medium" ? "text-chart-3" : "text-chart-1";
const riskBg = (r: string) => r === "high" ? "bg-destructive/10 border-destructive/20" : r === "medium" ? "bg-chart-3/10 border-chart-3/20" : "bg-chart-1/10 border-chart-1/20";

const AIDynamicPricingEngine: React.FC = () => {
  const [adjustment, setAdjustment] = useState([-3]);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const inquiryImpact = Math.round(Math.abs(adjustment[0]) * 9.3);
  const confidence = 92 - Math.abs(adjustment[0]) * 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            AI Dynamic Pricing Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Intelligent price optimization & simulation</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Auto-Adjust</span>
          <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
          {autoEnabled && <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[10px] animate-pulse">ACTIVE</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Price Gap", value: "-3.5%", icon: Target, color: "text-primary", sub: "vs recommended" },
          { label: "Inquiry Impact", value: `+${inquiryImpact}%`, icon: TrendingUp, color: "text-chart-1", sub: "estimated" },
          { label: "Confidence", value: `${confidence}%`, icon: Shield, color: "text-chart-2", sub: "model score" },
          { label: "Active Signals", value: "5", icon: Zap, color: "text-chart-3", sub: "listings tracked" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
              <div className="text-[9px] text-muted-foreground">{m.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation Slider */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Price Adjustment Simulator</span>
            <Badge variant="secondary" className="text-xs">{adjustment[0] > 0 ? "+" : ""}{adjustment[0]}%</Badge>
          </div>
          <Slider value={adjustment} onValueChange={setAdjustment} min={-10} max={10} step={1} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>-10% Aggressive</span><span>Current</span><span>+10% Premium</span>
          </div>
          <Card className="border-border/40">
            <CardContent className="p-3">
              <p className="text-xs text-foreground">
                <Zap className="h-3 w-3 inline mr-1 text-primary" />
                {adjustment[0] < 0
                  ? `Reducing price by ${Math.abs(adjustment[0])}% may increase inquiry rate by ~${inquiryImpact}% within 7 days.`
                  : adjustment[0] > 0
                  ? `Increasing price by ${adjustment[0]}% may reduce inquiry rate by ~${inquiryImpact}% — monitor demand signals.`
                  : "Current pricing maintained — no change projected."}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="listings" className="text-xs">📋 Listings</TabsTrigger>
          <TabsTrigger value="elasticity" className="text-xs">📈 Elasticity</TabsTrigger>
          <TabsTrigger value="scenario" className="text-xs">🔮 Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-2">
          {listings.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-border/40 ${riskBg(l.risk)}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">{l.id}</span>
                      <span className="text-xs text-foreground truncate">{l.title}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>Current: Rp {l.current}B</span>
                      <span className="text-chart-1">Rec: Rp {l.recommended}B</span>
                      <span>DOM: {l.dom}d</span>
                      <span>Elasticity: {l.elasticity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground flex items-center gap-0.5">
                        {l.current > l.recommended ? <ArrowDownRight className="h-3 w-3 text-chart-1" /> : <ArrowUpRight className="h-3 w-3 text-destructive" />}
                        {(((l.recommended - l.current) / l.current) * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">gap</div>
                    </div>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${l.demand}%` }} />
                    </div>
                    <Badge className={`${riskColor(l.risk)} text-[10px]`} variant="secondary">
                      {l.risk === "high" ? "⚠️" : l.risk === "medium" ? "⚡" : "✅"} {l.risk}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="elasticity">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Price Elasticity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={elasticityCurve}>
                  <defs>
                    <linearGradient id="elGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="priceChange" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Price Change %", position: "insideBottom", offset: -5, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Inquiry Change %", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="inquiryChange" stroke="hsl(var(--primary))" fill="url(#elGrad)" strokeWidth={2} name="Inquiry Impact %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenario">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Days-on-Market Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={domPrediction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "% Remaining", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                  <Line type="monotone" dataKey="current" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Current Pricing" />
                  <Line type="monotone" dataKey="optimized" stroke="hsl(var(--primary))" strokeWidth={2} name="Optimized" />
                  <Line type="monotone" dataKey="aggressive" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Aggressive" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground inline-block" style={{ borderTop: "2px dashed" }} /> Current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Optimized</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-1 inline-block" /> Aggressive</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIDynamicPricingEngine;
