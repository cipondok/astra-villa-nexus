import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Landmark, TrendingUp, Activity, Brain, BarChart3, Settings2,
  DollarSign, Globe, Shield, Zap, Target, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface PolicyLever {
  id: string; label: string; icon: React.ElementType; value: number[];
  onChange: (v: number[]) => void; unit: string; description: string;
}

const MacroPolicySimulator = () => {
  const [txnTax, setTxnTax] = useState([5]);
  const [foreignInvest, setForeignInvest] = useState([50]);
  const [infraInvest, setInfraInvest] = useState([50]);
  const [interestRate, setInterestRate] = useState([50]);
  const [digitalAdopt, setDigitalAdopt] = useState([50]);

  const levers: PolicyLever[] = [
    { id: 'tax', label: 'Transaction Tax Rate', icon: DollarSign, value: txnTax, onChange: setTxnTax, unit: '%', description: 'Property transfer tax level' },
    { id: 'foreign', label: 'Foreign Investment Openness', icon: Globe, value: foreignInvest, onChange: setForeignInvest, unit: '%', description: 'Cross-border capital accessibility' },
    { id: 'infra', label: 'Infrastructure Investment', icon: Landmark, value: infraInvest, onChange: setInfraInvest, unit: '%', description: 'Public infrastructure spending level' },
    { id: 'rate', label: 'Interest Rate Environment', icon: TrendingUp, value: interestRate, onChange: setInterestRate, unit: '%', description: 'Monetary policy tightness' },
    { id: 'digital', label: 'Digital Transaction Adoption', icon: Zap, value: digitalAdopt, onChange: setDigitalAdopt, unit: '%', description: 'E-transaction penetration speed' },
  ];

  const simFactor = useMemo(() => {
    const taxImpact = (10 - txnTax[0]) * 0.01;
    const foreignImpact = (foreignInvest[0] - 50) * 0.008;
    const infraImpact = (infraInvest[0] - 50) * 0.006;
    const rateImpact = (50 - interestRate[0]) * 0.005;
    const digitalImpact = (digitalAdopt[0] - 50) * 0.007;
    return 1 + taxImpact + foreignImpact + infraImpact + rateImpact + digitalImpact;
  }, [txnTax, foreignInvest, infraInvest, interestRate, digitalAdopt]);

  const impactData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    year: `Y${i + 1}`,
    baseline: 100 + i * 8 + Math.random() * 5,
    simulated: 100 + i * 8 * simFactor + Math.random() * 5,
    liquidity: 45 + i * 2 * Math.max(0.5, simFactor) + Math.random() * 3,
    friction: Math.max(5, 55 - i * 2.2 * simFactor + Math.random() * 3),
  })), [simFactor]);

  const scenarioComparison = useMemo(() => [
    { scenario: 'Current Policy', gmv: 100, liquidity: 45, friction: 55, efficiency: 42 },
    { scenario: 'Simulated Policy', gmv: Math.round(100 * simFactor), liquidity: Math.round(45 * Math.max(0.5, simFactor)), friction: Math.round(55 / Math.max(0.5, simFactor)), efficiency: Math.round(42 * simFactor) },
    { scenario: 'Best Case', gmv: 185, liquidity: 82, friction: 18, efficiency: 78 },
  ], [simFactor]);

  const resilienceData = useMemo(() => [
    { metric: 'Vendor Stability', value: Math.min(100, 55 + (infraInvest[0] - 50) * 0.5 + (foreignInvest[0] - 50) * 0.3) },
    { metric: 'Capital Flow', value: Math.min(100, 50 + (foreignInvest[0] - 50) * 0.6 + (50 - interestRate[0]) * 0.3) },
    { metric: 'Pricing Stability', value: Math.min(100, 60 + (10 - txnTax[0]) * 2 + (digitalAdopt[0] - 50) * 0.2) },
    { metric: 'Transaction Speed', value: Math.min(100, 40 + (digitalAdopt[0] - 50) * 0.8 + (infraInvest[0] - 50) * 0.3) },
    { metric: 'Market Depth', value: Math.min(100, 48 + (foreignInvest[0] - 50) * 0.5 + (infraInvest[0] - 50) * 0.4) },
    { metric: 'Regulatory Clarity', value: Math.min(100, 55 + (10 - txnTax[0]) * 1.5 + (digitalAdopt[0] - 50) * 0.3) },
  ], [txnTax, foreignInvest, infraInvest, interestRate, digitalAdopt]);

  const gmvDelta = ((simFactor - 1) * 100).toFixed(1);
  const isPositive = simFactor >= 1;

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI-Driven Real Estate Macro Policy Simulator</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-3 border-chart-3/20">SIMULATION</Badge>
        </div>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="text-muted-foreground">Sim Factor:</span>
          <span className={cn("font-bold tabular-nums", isPositive ? "text-chart-1" : "text-destructive")}>{simFactor.toFixed(3)}x</span>
          <span className={cn("tabular-nums", isPositive ? "text-chart-1" : "text-destructive")}>{isPositive ? '+' : ''}{gmvDelta}% GMV</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-3">
        {/* LEFT — Policy Levers */}
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
              <Settings2 className="h-3 w-3 text-primary" />Policy Levers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-3">
            {levers.map(lever => (
              <div key={lever.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <lever.icon className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[8px] text-foreground">{lever.label}</span>
                  </div>
                  <span className="text-[8px] font-semibold text-foreground tabular-nums">{lever.value[0]}{lever.unit}</span>
                </div>
                <Slider value={lever.value} onValueChange={lever.onChange} min={0} max={100} step={5} />
                <p className="text-[6px] text-muted-foreground">{lever.description}</p>
              </div>
            ))}

            {/* Scenario Comparison */}
            <div className="pt-2 border-t border-border/20 space-y-1.5">
              <p className="text-[8px] font-semibold text-foreground">Scenario Comparison</p>
              {scenarioComparison.map((s, i) => (
                <div key={i} className={cn("flex items-center gap-2 px-2 py-1 rounded-lg border border-border/10", i === 1 && "bg-primary/5 border-primary/20")}>
                  <span className="text-[7px] text-foreground w-20 truncate">{s.scenario}</span>
                  <div className="flex items-center gap-2 text-[6px] tabular-nums flex-1">
                    <span className="text-muted-foreground">GMV:{s.gmv}</span>
                    <span className="text-muted-foreground">Liq:{s.liquidity}</span>
                    <span className="text-muted-foreground">Fric:{s.friction}</span>
                    <span className="text-muted-foreground">Eff:{s.efficiency}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — Projections */}
        <div className="space-y-3">
          {/* Impact Projection Curve */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-1" />Policy Impact Projection — GMV & Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={impactData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSimGMV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth={1} strokeDasharray="3 3" name="Baseline GMV" />
                  <Area type="monotone" dataKey="simulated" stroke="hsl(var(--chart-1))" fill="url(#gSimGMV)" strokeWidth={2} name="Simulated GMV" />
                  <Line type="monotone" dataKey="liquidity" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Liquidity Index" />
                  <Line type="monotone" dataKey="friction" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="Transaction Friction" strokeDasharray="2 2" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-1">
                {[
                  { label: 'Baseline GMV', color: 'bg-muted-foreground', dashed: true },
                  { label: 'Simulated GMV', color: 'bg-chart-1' },
                  { label: 'Liquidity', color: 'bg-primary' },
                  { label: 'Friction', color: 'bg-destructive', dashed: true },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-3 rounded-sm", l.color, l.dashed && "opacity-50")} />
                    <span className="text-[7px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resilience Radar + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <Shield className="h-3 w-3 text-chart-2" />Vendor Ecosystem Resilience
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={resilienceData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 6, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <Brain className="h-3 w-3 text-chart-1" />AI Policy Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 space-y-1.5">
                {[
                  { condition: txnTax[0] > 7, insight: 'High transaction tax suppressing deal velocity — consider phased reduction', type: 'warning' },
                  { condition: foreignInvest[0] > 70, insight: 'Strong foreign capital openness accelerating liquidity — monitor concentration risk', type: 'info' },
                  { condition: infraInvest[0] > 65, insight: 'Infrastructure investment expanding market depth — positive vendor ecosystem effect', type: 'positive' },
                  { condition: interestRate[0] > 65, insight: 'Tight monetary environment reducing buyer purchasing power', type: 'warning' },
                  { condition: digitalAdopt[0] > 70, insight: 'High digital adoption reducing settlement friction significantly', type: 'positive' },
                  { condition: simFactor > 1.15, insight: `Policy mix projecting +${gmvDelta}% GMV — strong growth scenario`, type: 'positive' },
                  { condition: simFactor < 0.9, insight: `Policy mix projecting ${gmvDelta}% GMV — contractionary scenario`, type: 'warning' },
                ].filter(i => i.condition).slice(0, 4).map((insight, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn("px-2 py-1.5 rounded-lg border text-[8px]",
                      insight.type === 'warning' ? 'border-chart-3/20 bg-chart-3/5 text-chart-3' :
                      insight.type === 'positive' ? 'border-chart-1/20 bg-chart-1/5 text-chart-1' :
                      'border-primary/20 bg-primary/5 text-primary'
                    )}>
                    {insight.insight}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroPolicySimulator;
