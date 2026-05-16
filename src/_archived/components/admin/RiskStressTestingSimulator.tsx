import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, TrendingDown, Lightbulb, Activity, Gauge } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const RiskStressTestingSimulator = () => {
  const [rateIncrease, setRateIncrease] = useState('2');
  const [demandDecline, setDemandDecline] = useState('15');
  const [priceCorrection, setPriceCorrection] = useState('10');
  const [vacancyMonths, setVacancyMonths] = useState('3');
  const [leverage, setLeverage] = useState('65');

  const rateNum = parseFloat(rateIncrease) || 0;
  const demandNum = parseFloat(demandDecline) || 0;
  const correctionNum = parseFloat(priceCorrection) || 0;
  const yieldImpact = rateNum * 4 + demandNum * 0.3;
  const portfolioDownside = correctionNum + rateNum * 2;
  const cashflowRisk = Math.min(100, demandNum * 2 + parseInt(vacancyMonths) * 8);
  const resilienceScore = Math.max(0, 100 - portfolioDownside - cashflowRisk * 0.3);

  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    expected: 100 - i * 0.5,
    stressed: 100 - i * 0.5 - (portfolioDownside / 12) * (i + 1),
    worst: 100 - i * 0.5 - (portfolioDownside * 1.5 / 12) * (i + 1),
  }));

  const factorImpact = [
    { factor: 'Rate Rise', impact: rateNum * 4 },
    { factor: 'Demand Drop', impact: demandNum * 0.5 },
    { factor: 'Price Correction', impact: correctionNum },
    { factor: 'Vacancy', impact: parseInt(vacancyMonths) * 3 },
    { factor: 'Leverage Risk', impact: (parseInt(leverage) - 50) * 0.2 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Risk Stress Testing Simulator</h2>
          <Badge variant="outline">⚡ Scenario Analysis</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Evaluate potential downside risks across investment scenarios</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Stress Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Interest Rate Increase (%)</Label><Input type="number" step="0.5" value={rateIncrease} onChange={e => setRateIncrease(e.target.value)} /></div>
            <div className="space-y-2"><Label>Rental Demand Decline (%)</Label><Input type="number" value={demandDecline} onChange={e => setDemandDecline(e.target.value)} /></div>
            <div className="space-y-2"><Label>Price Correction (%)</Label><Input type="number" value={priceCorrection} onChange={e => setPriceCorrection(e.target.value)} /></div>
            <div className="space-y-2"><Label>Vacancy Duration (months)</Label><Input type="number" value={vacancyMonths} onChange={e => setVacancyMonths(e.target.value)} /></div>
            <div className="space-y-2"><Label>Financing Leverage (%)</Label><Input type="number" value={leverage} onChange={e => setLeverage(e.target.value)} /></div>
            <Button className="w-full" size="lg"><Activity className="h-4 w-4 mr-2" />Run Stress Test</Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Portfolio Downside', value: `-${portfolioDownside.toFixed(1)}%`, color: 'text-destructive' },
              { label: 'Yield Impact', value: `-${yieldImpact.toFixed(1)}%`, color: 'text-amber-500' },
              { label: 'Cashflow Risk', value: `${cashflowRisk.toFixed(0)}/100`, color: cashflowRisk > 60 ? 'text-destructive' : 'text-amber-500' },
              { label: 'Resilience Score', value: `${resilienceScore.toFixed(0)}/100`, color: resilienceScore > 50 ? 'text-emerald-500' : 'text-destructive' },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card><CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="projection">
            <TabsList><TabsTrigger value="projection">Scenario Projection</TabsTrigger><TabsTrigger value="factors">Factor Impact</TabsTrigger></TabsList>
            <TabsContent value="projection">
              <Card><CardContent className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="expected" stroke="hsl(var(--primary))" strokeWidth={2} name="Expected" />
                    <Line type="monotone" dataKey="stressed" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Stressed" />
                    <Line type="monotone" dataKey="worst" stroke="hsl(var(--destructive))" strokeDasharray="3 3" name="Worst Case" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="factors">
              <Card><CardContent className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={factorImpact} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis type="category" dataKey="factor" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={100} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="impact" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} name="Impact %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </TabsContent>
          </Tabs>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Stress Test Insight</p>
                <p className="text-sm text-muted-foreground">A {rateIncrease}% interest rate rise may reduce portfolio yield by approximately {yieldImpact.toFixed(1)}%. Consider reducing leverage or diversifying income sources.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiskStressTestingSimulator;
