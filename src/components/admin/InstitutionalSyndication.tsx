import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Shield, Lightbulb, Building, CheckCircle, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const portfolioBundles = [
  {
    name: 'Jakarta Premium Mixed-Use Portfolio',
    properties: 12, totalValue: 'Rp 185B', minTicket: 'Rp 5B',
    expectedYield: '8.2%', risk: 'Low-Medium', status: 'Open',
    progress: 68, participants: 4, target: 8,
    dueDiligence: 75,
  },
  {
    name: 'Bali Hospitality Collection',
    properties: 8, totalValue: 'Rp 92B', minTicket: 'Rp 2B',
    expectedYield: '10.5%', risk: 'Medium', status: 'Open',
    progress: 42, participants: 3, target: 6,
    dueDiligence: 90,
  },
  {
    name: 'BSD Industrial & Logistics Pack',
    properties: 15, totalValue: 'Rp 240B', minTicket: 'Rp 10B',
    expectedYield: '7.8%', risk: 'Low', status: 'Closing Soon',
    progress: 85, participants: 6, target: 8,
    dueDiligence: 100,
  },
];

const demandData = [
  { month: 'Oct', institutional: 12, retail: 45 },
  { month: 'Nov', institutional: 15, retail: 52 },
  { month: 'Dec', institutional: 18, retail: 48 },
  { month: 'Jan', institutional: 22, retail: 55 },
  { month: 'Feb', institutional: 28, retail: 60 },
  { month: 'Mar', institutional: 35, retail: 58 },
];

const InstitutionalSyndication = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Institutional Portfolio Syndication</h2>
          <Badge variant="outline">🏦 Institutional</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Coordinate large-scale property investment collaboration</p>
      </motion.div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Bundles', value: '3', color: 'text-primary' },
          { label: 'Total AUM', value: 'Rp 517B', color: 'text-emerald-500' },
          { label: 'Avg Yield', value: '8.8%', color: 'text-primary' },
          { label: 'Participation Rate', value: '65%', color: 'text-amber-500' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Bundles */}
      <div className="space-y-4">
        {portfolioBundles.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={b.status === 'Closing Soon' ? 'border-amber-500/30' : ''}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{b.name}</h3>
                      <Badge variant={b.status === 'Closing Soon' ? 'default' : 'secondary'} className="text-xs">{b.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {[
                        { label: 'Properties', value: b.properties.toString() },
                        { label: 'Total Value', value: b.totalValue },
                        { label: 'Min Ticket', value: b.minTicket },
                        { label: 'Expected Yield', value: b.expectedYield },
                      ].map((s, j) => (
                        <div key={j}>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="text-sm font-medium text-foreground">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Capital Participation ({b.participants}/{b.target} investors)</span>
                          <span className="font-medium text-foreground">{b.progress}%</span>
                        </div>
                        <Progress value={b.progress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Due Diligence Progress</span>
                          <span className="font-medium text-foreground">{b.dueDiligence}%</span>
                        </div>
                        <Progress value={b.dueDiligence} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:min-w-[140px]">
                    <Badge variant="outline" className="justify-center text-xs">Risk: {b.risk}</Badge>
                    <Button size="sm" className="w-full">View Details</Button>
                    <Button size="sm" variant="outline" className="w-full">Express Interest</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Demand Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Institutional Demand Signal Index</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="institutional" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Institutional" />
              <Bar dataKey="retail" fill="hsl(var(--primary)/0.35)" radius={[4, 4, 0, 0]} name="Retail" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Syndication Insight</p>
            <p className="text-sm text-muted-foreground">Mixed-use portfolio bundle reaching optimal scale for institutional participation — institutional demand signals have grown 190% over the past 6 months.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionalSyndication;
