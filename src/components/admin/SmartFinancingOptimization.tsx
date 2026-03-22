import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Shield, Lightbulb, Calculator, Clock } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const SmartFinancingOptimization = () => {
  const [price, setPrice] = useState('2000000000');
  const [downPct, setDownPct] = useState('20');
  const [tenure, setTenure] = useState('20');
  const [rate, setRate] = useState('8.5');
  const [rental, setRental] = useState('15000000');

  const priceNum = parseInt(price) || 0;
  const dpPct = parseInt(downPct) || 0;
  const tenureYears = parseInt(tenure) || 20;
  const rateNum = parseFloat(rate) || 8.5;
  const rentalNum = parseInt(rental) || 0;
  const loanAmount = priceNum * (1 - dpPct / 100);
  const monthlyRate = rateNum / 100 / 12;
  const months = tenureYears * 12;
  const emi = monthlyRate > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1) : loanAmount / months;
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanAmount;
  const dscr = rentalNum > 0 ? rentalNum / emi : 0;
  const riskScore = dscr > 1.5 ? 25 : dscr > 1.2 ? 50 : dscr > 1.0 ? 70 : 90;

  const fmt = (v: number) => `Rp ${(v / 1e6).toFixed(0)}M`;

  const amortizationData = Array.from({ length: Math.min(tenureYears, 30) }, (_, i) => {
    const year = i + 1;
    const remainingMonths = months - year * 12;
    const balance = remainingMonths > 0 ? loanAmount * (Math.pow(1 + monthlyRate, months) - Math.pow(1 + monthlyRate, year * 12)) / (Math.pow(1 + monthlyRate, months) - 1) : 0;
    return { year: `Y${year}`, balance: Math.max(0, balance / 1e6), equity: (priceNum - Math.max(0, balance)) / 1e6 };
  });

  const sensitivityData = [
    { scenario: '7%', payment: ((loanAmount * (7/100/12) * Math.pow(1+7/100/12, months)) / (Math.pow(1+7/100/12, months)-1)) / 1e6 },
    { scenario: '8%', payment: ((loanAmount * (8/100/12) * Math.pow(1+8/100/12, months)) / (Math.pow(1+8/100/12, months)-1)) / 1e6 },
    { scenario: '9%', payment: ((loanAmount * (9/100/12) * Math.pow(1+9/100/12, months)) / (Math.pow(1+9/100/12, months)-1)) / 1e6 },
    { scenario: '10%', payment: ((loanAmount * (10/100/12) * Math.pow(1+10/100/12, months)) / (Math.pow(1+10/100/12, months)-1)) / 1e6 },
    { scenario: '11%', payment: ((loanAmount * (11/100/12) * Math.pow(1+11/100/12, months)) / (Math.pow(1+11/100/12, months)-1)) / 1e6 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Smart Financing & Mortgage Optimization</h2>
          <Badge variant="outline">💳 Financing</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Structure optimal loan decisions with intelligent analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Financing Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Property Price (Rp)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
            <div className="space-y-2"><Label>Down Payment (%)</Label><Input type="number" value={downPct} onChange={e => setDownPct(e.target.value)} /></div>
            <div className="space-y-2"><Label>Loan Tenure (years)</Label><Input type="number" value={tenure} onChange={e => setTenure(e.target.value)} /></div>
            <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Expected Monthly Rental (Rp)</Label><Input type="number" value={rental} onChange={e => setRental(e.target.value)} /></div>
            <Button className="w-full" size="lg"><Calculator className="h-4 w-4 mr-2" />Calculate</Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Monthly Payment', value: fmt(emi), icon: DollarSign, color: 'text-primary' },
              { label: 'Total Interest', value: fmt(totalInterest), icon: TrendingUp, color: 'text-amber-500' },
              { label: 'DSCR', value: dscr.toFixed(2), icon: Shield, color: dscr > 1.2 ? 'text-emerald-500' : 'text-destructive' },
              { label: 'Risk Score', value: `${riskScore}/100`, icon: Shield, color: riskScore < 50 ? 'text-emerald-500' : 'text-amber-500' },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card>
                  <CardContent className="p-3 text-center">
                    <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recommendation */}
          <Card className={dscr > 1.2 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-foreground mb-1">Financing Structure Recommendation</p>
              <p className="text-sm text-muted-foreground">
                {dscr > 1.5 ? 'Strong cashflow coverage — rental income comfortably covers mortgage. Consider leveraging further.' :
                 dscr > 1.2 ? 'Adequate coverage — financing structure is sustainable with moderate safety margin.' :
                 dscr > 1.0 ? 'Tight coverage — consider increasing down payment or extending tenure to improve safety margin.' :
                 'Warning — rental income may not cover mortgage payment. Review financing parameters.'}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="amortization">
            <TabsList>
              <TabsTrigger value="amortization">Amortization</TabsTrigger>
              <TabsTrigger value="sensitivity">Rate Sensitivity</TabsTrigger>
            </TabsList>
            <TabsContent value="amortization">
              <Card>
                <CardContent className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={amortizationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                      <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" name="Equity (M)" />
                      <Area type="monotone" dataKey="balance" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground)/0.1)" name="Loan Balance (M)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sensitivity">
              <Card>
                <CardContent className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensitivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="scenario" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} label={{ value: 'Interest Rate', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="payment" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Monthly Payment (M)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SmartFinancingOptimization;
