import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Leaf, Droplets, Sun, Wind, TrendingUp, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const certifications = [
  { name: 'EDGE Certified', properties: 42, icon: '🏅', level: 'Advanced', color: 'hsl(var(--primary))' },
  { name: 'GREENSHIP (GBCI)', properties: 28, icon: '🌿', level: 'Gold', color: 'hsl(var(--secondary))' },
  { name: 'Green Mark', properties: 15, icon: '♻️', level: 'Platinum', color: 'hsl(var(--accent))' },
  { name: 'LEED Equivalent', properties: 8, icon: '🌍', level: 'Silver', color: 'hsl(var(--muted-foreground))' },
];

const energyData = [
  { month: 'Sep', solar: 320, grid: 480, savings: 40 },
  { month: 'Oct', solar: 350, grid: 450, savings: 44 },
  { month: 'Nov', solar: 310, grid: 490, savings: 39 },
  { month: 'Dec', solar: 280, grid: 520, savings: 35 },
  { month: 'Jan', solar: 340, grid: 460, savings: 42 },
  { month: 'Feb', solar: 370, grid: 430, savings: 46 },
];

const carbonFootprint = [
  { category: 'Construction', value: 45 },
  { category: 'Operations', value: 25 },
  { category: 'Transport', value: 15 },
  { category: 'Materials', value: 10 },
  { category: 'Waste', value: 5 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))'];

const waterEfficiency = [
  { month: 'Sep', usage: 1200, recycled: 320, target: 1000 },
  { month: 'Oct', usage: 1150, recycled: 340, target: 1000 },
  { month: 'Nov', usage: 1100, recycled: 360, target: 1000 },
  { month: 'Dec', usage: 1050, recycled: 380, target: 1000 },
  { month: 'Jan', usage: 1020, recycled: 400, target: 1000 },
  { month: 'Feb', usage: 980, recycled: 420, target: 1000 },
];

const EnvironmentalSustainability = () => {
  const totalCertified = certifications.reduce((s, c) => s + c.properties, 0);
  const avgSavings = Math.round(energyData.reduce((s, d) => s + d.savings, 0) / energyData.length);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" /> Environmental Sustainability
          </h2>
          <p className="text-xs text-muted-foreground">Green certifications, energy efficiency, and carbon tracking</p>
        </div>
        <Badge className="bg-primary/20 text-primary text-[10px]">{totalCertified} Certified Properties</Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Green Certified', value: totalCertified, icon: Award, suffix: '' },
          { label: 'Avg Energy Savings', value: `${avgSavings}%`, icon: Sun, suffix: '' },
          { label: 'Solar Capacity', value: '2.4MW', icon: Wind, suffix: '' },
          { label: 'Carbon Offset', value: '180T', icon: Leaf, suffix: '' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-foreground mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="certifications">
        <TabsList className="h-8">
          <TabsTrigger value="certifications" className="text-xs gap-1"><Award className="h-3 w-3" /> Certifications</TabsTrigger>
          <TabsTrigger value="energy" className="text-xs gap-1"><Sun className="h-3 w-3" /> Energy</TabsTrigger>
          <TabsTrigger value="carbon" className="text-xs gap-1"><Leaf className="h-3 w-3" /> Carbon</TabsTrigger>
          <TabsTrigger value="water" className="text-xs gap-1"><Droplets className="h-3 w-3" /> Water</TabsTrigger>
        </TabsList>

        <TabsContent value="certifications">
          <Card>
            <CardContent className="p-3 space-y-2">
              {certifications.map((cert) => (
                <div key={cert.name} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cert.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{cert.name}</p>
                      <p className="text-[10px] text-muted-foreground">Level: {cert.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{cert.properties}</p>
                    <p className="text-[10px] text-muted-foreground">properties</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Energy Mix (MWh)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="solar" fill="hsl(var(--primary))" name="Solar" stackId="a" />
                  <Bar dataKey="grid" fill="hsl(var(--muted-foreground))" name="Grid" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Carbon Footprint Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={carbonFootprint} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="category" label={({ category, value }) => `${category} ${value}%`}>
                      {carbonFootprint.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Water Usage & Recycling (m³)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={waterEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="usage" stroke="hsl(var(--primary))" name="Total Usage" strokeWidth={2} />
                  <Line type="monotone" dataKey="recycled" stroke="hsl(var(--secondary))" name="Recycled" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--destructive))" name="Target" strokeWidth={1} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvironmentalSustainability;
