import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingDown, TrendingUp, Users, Eye, ArrowDown, ArrowUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

const alertStats = [
  { month: 'Sep', created: 320, triggered: 85, clicked: 62 },
  { month: 'Oct', created: 380, triggered: 102, clicked: 78 },
  { month: 'Nov', created: 410, triggered: 95, clicked: 71 },
  { month: 'Dec', created: 450, triggered: 130, clicked: 98 },
  { month: 'Jan', created: 420, triggered: 115, clicked: 89 },
  { month: 'Feb', created: 480, triggered: 140, clicked: 108 },
];

const alertTypes = [
  { name: 'Price Drop', value: 55, color: 'hsl(var(--primary))' },
  { name: 'New Listing', value: 25, color: 'hsl(var(--secondary))' },
  { name: 'Price Increase', value: 12, color: 'hsl(var(--accent))' },
  { name: 'Back on Market', value: 8, color: 'hsl(var(--muted-foreground))' },
];

const topWatchedAreas = [
  { area: 'Menteng, Jakarta', watchers: 245, avgPrice: 'Rp 15.2B', priceChange: -3.2 },
  { area: 'Kebayoran, Jakarta', watchers: 198, avgPrice: 'Rp 12.8B', priceChange: 1.5 },
  { area: 'Seminyak, Bali', watchers: 176, avgPrice: 'Rp 8.5B', priceChange: -5.1 },
  { area: 'BSD City, Tangerang', watchers: 152, avgPrice: 'Rp 3.2B', priceChange: 2.8 },
  { area: 'Canggu, Bali', watchers: 134, avgPrice: 'Rp 6.1B', priceChange: -1.8 },
  { area: 'PIK 2, Jakarta', watchers: 118, avgPrice: 'Rp 4.5B', priceChange: 4.2 },
];

const recentAlerts = [
  { id: 1, property: 'Villa Seminyak #42', type: 'Price Drop', from: 'Rp 8.5B', to: 'Rp 7.9B', watchers: 12, triggered: '2h ago' },
  { id: 2, property: 'Apt Menteng Tower A-1205', type: 'New Listing', from: '-', to: 'Rp 15.2B', watchers: 8, triggered: '4h ago' },
  { id: 3, property: 'BSD Green Office Park', type: 'Price Drop', from: 'Rp 3.8B', to: 'Rp 3.5B', watchers: 15, triggered: '6h ago' },
  { id: 4, property: 'Canggu Rice Field Villa', type: 'Back on Market', from: '-', to: 'Rp 5.2B', watchers: 6, triggered: '8h ago' },
];

const PriceAlertManager = () => {
  const totalAlerts = alertStats.reduce((s, d) => s + d.created, 0);
  const totalTriggered = alertStats.reduce((s, d) => s + d.triggered, 0);
  const convRate = ((alertStats.reduce((s, d) => s + d.clicked, 0) / totalTriggered) * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Price Alert Manager
          </h2>
          <p className="text-xs text-muted-foreground">User watchlists, price drop notifications, and conversion tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Alerts', value: totalAlerts.toLocaleString(), icon: Bell },
          { label: 'Triggered (6mo)', value: totalTriggered, icon: TrendingDown },
          { label: 'Click-Through', value: `${convRate}%`, icon: Eye },
          { label: 'Watched Areas', value: topWatchedAreas.length, icon: Users },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="trends">
        <TabsList className="h-8">
          <TabsTrigger value="trends" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Trends</TabsTrigger>
          <TabsTrigger value="types" className="text-xs gap-1"><Bell className="h-3 w-3" /> Types</TabsTrigger>
          <TabsTrigger value="areas" className="text-xs gap-1"><Users className="h-3 w-3" /> Watched Areas</TabsTrigger>
          <TabsTrigger value="recent" className="text-xs gap-1"><Eye className="h-3 w-3" /> Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Activity Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={alertStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="created" stroke="hsl(var(--primary))" name="Created" strokeWidth={2} />
                  <Line type="monotone" dataKey="triggered" stroke="hsl(var(--secondary))" name="Triggered" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicked" stroke="hsl(var(--accent))" name="Clicked" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Type Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={alertTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }) => `${name} ${value}%`}>
                    {alertTypes.map((_, i) => (<Cell key={i} fill={alertTypes[i].color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas">
          <Card>
            <CardContent className="p-3 space-y-2">
              {topWatchedAreas.map(area => (
                <div key={area.area} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                  <div>
                    <p className="text-xs font-medium text-foreground">{area.area}</p>
                    <p className="text-[10px] text-muted-foreground">{area.watchers} watchers · Avg {area.avgPrice}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {area.priceChange < 0 ? <ArrowDown className="h-3 w-3 text-destructive" /> : <ArrowUp className="h-3 w-3 text-primary" />}
                    <span className={`text-xs font-bold ${area.priceChange < 0 ? 'text-destructive' : 'text-primary'}`}>{Math.abs(area.priceChange)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardContent className="p-3 space-y-2">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                  <div>
                    <p className="text-xs font-medium text-foreground">{alert.property}</p>
                    <p className="text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[8px] mr-1">{alert.type}</Badge>
                      {alert.from !== '-' && <span>{alert.from} → </span>}{alert.to} · {alert.watchers} notified · {alert.triggered}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceAlertManager;
