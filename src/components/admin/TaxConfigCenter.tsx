import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calculator, FileText, TrendingUp, Settings, DollarSign, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const taxRates = [
  { type: 'PPh (Income Tax)', rate: 2.5, applicableTo: 'Property Sale', status: 'active', lastUpdated: '2026-01-15' },
  { type: 'BPHTB (Transfer Tax)', rate: 5.0, applicableTo: 'Property Purchase', status: 'active', lastUpdated: '2026-01-15' },
  { type: 'PPN (VAT)', rate: 11.0, applicableTo: 'New Construction', status: 'active', lastUpdated: '2025-12-01' },
  { type: 'PBB (Property Tax)', rate: 0.5, applicableTo: 'Annual Ownership', status: 'active', lastUpdated: '2026-02-01' },
  { type: 'PPh Rental', rate: 10.0, applicableTo: 'Rental Income', status: 'active', lastUpdated: '2025-11-20' },
  { type: 'Luxury Tax', rate: 20.0, applicableTo: 'Properties >Rp 30B', status: 'inactive', lastUpdated: '2025-10-01' },
];

const monthlyCollection = [
  { month: 'Sep', pph: 245, bphtb: 380, ppn: 120, pbb: 90 },
  { month: 'Oct', pph: 260, bphtb: 410, ppn: 135, pbb: 88 },
  { month: 'Nov', pph: 280, bphtb: 395, ppn: 150, pbb: 92 },
  { month: 'Dec', pph: 310, bphtb: 450, ppn: 180, pbb: 95 },
  { month: 'Jan', pph: 290, bphtb: 420, ppn: 160, pbb: 91 },
  { month: 'Feb', pph: 305, bphtb: 440, ppn: 175, pbb: 93 },
];

const complianceData = [
  { month: 'Sep', filed: 92, late: 5, missed: 3 },
  { month: 'Oct', filed: 94, late: 4, missed: 2 },
  { month: 'Nov', filed: 91, late: 6, missed: 3 },
  { month: 'Dec', filed: 96, late: 3, missed: 1 },
  { month: 'Jan', filed: 93, late: 5, missed: 2 },
  { month: 'Feb', filed: 95, late: 4, missed: 1 },
];

const TaxConfigCenter = () => {
  const [autoCalc, setAutoCalc] = useState(true);
  const totalRevenue = monthlyCollection.reduce((s, m) => s + m.pph + m.bphtb + m.ppn + m.pbb, 0);
  const avgCompliance = Math.round(complianceData.reduce((s, d) => s + d.filed, 0) / complianceData.length);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Tax Configuration Center
          </h2>
          <p className="text-xs text-muted-foreground">Indonesian property tax rates, collections, and compliance reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Auto-Calculate</span>
          <Switch checked={autoCalc} onCheckedChange={setAutoCalc} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Tax Types', value: taxRates.filter(t => t.status === 'active').length, icon: FileText },
          { label: 'Total Collection (M)', value: `Rp ${totalRevenue}`, icon: DollarSign },
          { label: 'Avg Compliance', value: `${avgCompliance}%`, icon: TrendingUp },
          { label: 'Overdue Filings', value: complianceData[complianceData.length - 1].missed, icon: AlertTriangle },
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

      <Tabs defaultValue="rates">
        <TabsList className="h-8">
          <TabsTrigger value="rates" className="text-xs gap-1"><Settings className="h-3 w-3" /> Tax Rates</TabsTrigger>
          <TabsTrigger value="collection" className="text-xs gap-1"><DollarSign className="h-3 w-3" /> Collections</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs gap-1"><FileText className="h-3 w-3" /> Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="rates">
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {taxRates.map((tax, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <div>
                      <p className="text-xs font-medium text-foreground">{tax.type}</p>
                      <p className="text-[10px] text-muted-foreground">{tax.applicableTo} · Updated {tax.lastUpdated}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">{tax.rate}%</span>
                      <Badge className={tax.status === 'active' ? 'bg-primary/20 text-primary text-[9px]' : 'bg-muted text-muted-foreground text-[9px]'}>
                        {tax.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Tax Collections (Rp Millions)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="pph" fill="hsl(var(--primary))" name="PPh" stackId="a" />
                  <Bar dataKey="bphtb" fill="hsl(var(--secondary))" name="BPHTB" stackId="a" />
                  <Bar dataKey="ppn" fill="hsl(var(--accent))" name="PPN" stackId="a" />
                  <Bar dataKey="pbb" fill="hsl(var(--muted-foreground))" name="PBB" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Filing Compliance Rate (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" domain={[80, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="filed" stroke="hsl(var(--primary))" name="Filed On Time" strokeWidth={2} />
                  <Line type="monotone" dataKey="late" stroke="hsl(var(--secondary))" name="Late" strokeWidth={2} />
                  <Line type="monotone" dataKey="missed" stroke="hsl(var(--destructive))" name="Missed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxConfigCenter;
