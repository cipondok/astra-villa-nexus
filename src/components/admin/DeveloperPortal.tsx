import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Key, Webhook, BookOpen, Copy, Eye, EyeOff, Activity, Plus, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const apiKeys = [
  { id: 'key_1', name: 'Production API', key: 'pk_live_astr4_****_8f2k', created: '2025-11-15', lastUsed: '2 min ago', status: 'active', calls: 45230, rateLimit: '1000/min' },
  { id: 'key_2', name: 'Staging API', key: 'pk_test_astr4_****_9j3m', created: '2025-12-01', lastUsed: '1h ago', status: 'active', calls: 12450, rateLimit: '500/min' },
  { id: 'key_3', name: 'Mobile App', key: 'pk_live_astr4_****_2h7n', created: '2026-01-10', lastUsed: '5 min ago', status: 'active', calls: 28900, rateLimit: '800/min' },
  { id: 'key_4', name: 'Partner Integration', key: 'pk_live_astr4_****_4k1p', created: '2026-02-01', lastUsed: '3d ago', status: 'inactive', calls: 890, rateLimit: '200/min' },
];

const webhooks = [
  { id: 'wh_1', event: 'property.created', url: 'https://api.partner.com/webhooks/property', status: 'active', successRate: 99.2, lastDelivery: '3 min ago' },
  { id: 'wh_2', event: 'transaction.completed', url: 'https://crm.client.com/hooks/tx', status: 'active', successRate: 97.8, lastDelivery: '15 min ago' },
  { id: 'wh_3', event: 'user.registered', url: 'https://analytics.internal.com/events', status: 'active', successRate: 100, lastDelivery: '1h ago' },
  { id: 'wh_4', event: 'listing.price_changed', url: 'https://feed.portal.id/update', status: 'paused', successRate: 94.5, lastDelivery: '2d ago' },
];

const apiTraffic = [
  { hour: '00:00', calls: 120, errors: 2 },
  { hour: '04:00', calls: 85, errors: 1 },
  { hour: '08:00', calls: 450, errors: 5 },
  { hour: '12:00', calls: 680, errors: 8 },
  { hour: '16:00', calls: 520, errors: 4 },
  { hour: '20:00', calls: 380, errors: 3 },
];

const endpointUsage = [
  { endpoint: '/api/v1/properties', calls: 15200, avgLatency: 45 },
  { endpoint: '/api/v1/search', calls: 12800, avgLatency: 120 },
  { endpoint: '/api/v1/users', calls: 8400, avgLatency: 32 },
  { endpoint: '/api/v1/transactions', calls: 5600, avgLatency: 88 },
  { endpoint: '/api/v1/analytics', calls: 3200, avgLatency: 210 },
];

const DeveloperPortal = () => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const totalCalls = apiKeys.reduce((s, k) => s + k.calls, 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Developer Portal
          </h2>
          <p className="text-xs text-muted-foreground">API keys, webhooks, documentation, and usage analytics</p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1"><Plus className="h-3 w-3" /> New API Key</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'API Keys', value: apiKeys.filter(k => k.status === 'active').length, icon: Key },
          { label: 'Total Calls', value: `${(totalCalls / 1000).toFixed(1)}K`, icon: Activity },
          { label: 'Active Webhooks', value: webhooks.filter(w => w.status === 'active').length, icon: Webhook },
          { label: 'Endpoints', value: endpointUsage.length, icon: Code },
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

      <Tabs defaultValue="keys">
        <TabsList className="h-8">
          <TabsTrigger value="keys" className="text-xs gap-1"><Key className="h-3 w-3" /> API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1"><Webhook className="h-3 w-3" /> Webhooks</TabsTrigger>
          <TabsTrigger value="traffic" className="text-xs gap-1"><Activity className="h-3 w-3" /> Traffic</TabsTrigger>
          <TabsTrigger value="endpoints" className="text-xs gap-1"><Code className="h-3 w-3" /> Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <div className="space-y-2">
            {apiKeys.map(key => (
              <Card key={key.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{key.name}</p>
                        <Badge className={key.status === 'active' ? 'bg-primary/20 text-primary text-[9px]' : 'bg-muted text-muted-foreground text-[9px]'}>{key.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                          {showKeys[key.id] ? key.key.replace('****', 'abcd1234') : key.key}
                        </code>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowKeys(p => ({ ...p, [key.id]: !p[key.id] }))}>
                          {showKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5"><Copy className="h-3 w-3" /></Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{key.calls.toLocaleString()} calls · Rate: {key.rateLimit} · Last used: {key.lastUsed}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <div className="space-y-2">
            {webhooks.map(wh => (
              <Card key={wh.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono">{wh.event}</Badge>
                        <Badge className={wh.status === 'active' ? 'bg-primary/20 text-primary text-[9px]' : 'bg-muted text-muted-foreground text-[9px]'}>{wh.status}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-md">{wh.url}</p>
                      <p className="text-[10px] text-muted-foreground">Success: {wh.successRate}% · Last: {wh.lastDelivery}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">API Traffic (24h)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={apiTraffic}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" name="Calls" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="errors" fill="hsl(var(--destructive))" name="Errors" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardContent className="p-3 space-y-2">
              {endpointUsage.map(ep => (
                <div key={ep.endpoint} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                  <div>
                    <code className="text-xs font-mono font-medium text-foreground">{ep.endpoint}</code>
                    <p className="text-[10px] text-muted-foreground">{ep.calls.toLocaleString()} calls · Avg {ep.avgLatency}ms</p>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${ep.avgLatency > 100 ? 'border-destructive/50 text-destructive' : 'border-primary/50 text-primary'}`}>
                    {ep.avgLatency}ms
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPortal;
