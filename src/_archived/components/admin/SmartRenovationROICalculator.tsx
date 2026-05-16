import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hammer, TrendingUp, DollarSign, Clock, BarChart3, Lightbulb, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const improvementCategories = [
  { value: 'kitchen', label: 'Kitchen Remodel', avgUplift: 11, icon: '🍳' },
  { value: 'interior', label: 'Interior Modernization', avgUplift: 9, icon: '🛋️' },
  { value: 'structural', label: 'Structural Upgrade', avgUplift: 7, icon: '🏗️' },
  { value: 'exterior', label: 'Exterior & Landscaping', avgUplift: 6, icon: '🌿' },
  { value: 'bathroom', label: 'Bathroom Renovation', avgUplift: 10, icon: '🚿' },
  { value: 'smart-home', label: 'Smart Home Integration', avgUplift: 5, icon: '🤖' },
];

const costValueData = [
  { budget: '50M', valueAdd: 85, roi: 70 },
  { budget: '100M', valueAdd: 160, roi: 60 },
  { budget: '200M', valueAdd: 290, roi: 45 },
  { budget: '300M', valueAdd: 400, roi: 33 },
  { budget: '500M', valueAdd: 580, roi: 16 },
];

const demandData = [
  { month: 'Jan', demand: 65 }, { month: 'Feb', demand: 70 },
  { month: 'Mar', demand: 78 }, { month: 'Apr', demand: 82 },
  { month: 'May', demand: 88 }, { month: 'Jun', demand: 85 },
];

const SmartRenovationROICalculator = () => {
  const [budget, setBudget] = useState('200000000');
  const [category, setCategory] = useState('interior');
  const [propertyValue, setPropertyValue] = useState('2000000000');
  const [timeline, setTimeline] = useState('6');

  const budgetNum = parseInt(budget) || 0;
  const propVal = parseInt(propertyValue) || 0;
  const cat = improvementCategories.find(c => c.value === category);
  const upliftPct = cat?.avgUplift || 8;
  const estimatedUplift = propVal * (upliftPct / 100);
  const roi = budgetNum > 0 ? ((estimatedUplift - budgetNum) / budgetNum) * 100 : 0;
  const paybackMonths = budgetNum > 0 ? Math.round((budgetNum / (estimatedUplift / 12))) : 0;
  const afterValue = propVal + estimatedUplift;

  const fmt = (v: number) => `Rp ${(v / 1e6).toFixed(0)}M`;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Hammer className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Smart Renovation ROI Calculator</h2>
          <Badge variant="outline" className="ml-2">💎 Value Enhancement</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Estimate value appreciation from renovation improvements</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Renovation Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Property Value (Rp)</Label>
              <Input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Renovation Budget (Rp)</Label>
              <Input type="number" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Improvement Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {improvementCategories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeline (months)</Label>
              <Input type="number" value={timeline} onChange={e => setTimeline(e.target.value)} />
            </div>
            <Button className="w-full" size="lg">
              <TrendingUp className="h-4 w-4 mr-2" /> Calculate ROI
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Value Uplift', value: `${upliftPct}%`, icon: ArrowUpRight, color: 'text-emerald-500' },
              { label: 'Projected After Value', value: fmt(afterValue), icon: DollarSign, color: 'text-primary' },
              { label: 'ROI', value: `${roi.toFixed(0)}%`, icon: TrendingUp, color: roi > 0 ? 'text-emerald-500' : 'text-destructive' },
              { label: 'Payback Period', value: `${paybackMonths}mo`, icon: Clock, color: 'text-amber-500' },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card>
                  <CardContent className="p-4 text-center">
                    <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="comparison">
            <TabsList>
              <TabsTrigger value="comparison">Before vs After</TabsTrigger>
              <TabsTrigger value="cost-value">Cost vs Value</TabsTrigger>
              <TabsTrigger value="demand">Market Demand</TabsTrigger>
            </TabsList>
            <TabsContent value="comparison">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Current Value</span>
                        <span className="font-medium text-foreground">{fmt(propVal)}</span>
                      </div>
                      <Progress value={propVal > 0 ? (propVal / afterValue) * 100 : 0} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Projected Value</span>
                        <span className="font-bold text-primary">{fmt(afterValue)}</span>
                      </div>
                      <Progress value={100} className="h-3" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        {cat?.label} may increase resale value by approximately {upliftPct}% in this district.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cost-value">
              <Card>
                <CardContent className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costValueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="budget" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="valueAdd" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Value Added (M)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="demand">
              <Card>
                <CardContent className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demandData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                      <Area type="monotone" dataKey="demand" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {improvementCategories.map((c, i) => (
              <Card key={c.value} className={`cursor-pointer transition-colors ${category === c.value ? 'border-primary bg-primary/5' : ''}`} onClick={() => setCategory(c.value)}>
                <CardContent className="p-3 text-center">
                  <span className="text-2xl">{c.icon}</span>
                  <p className="text-xs font-medium text-foreground mt-1">{c.label}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">~{c.avgUplift}% uplift</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRenovationROICalculator;
