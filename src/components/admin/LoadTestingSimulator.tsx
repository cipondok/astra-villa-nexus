import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Gauge, Zap, AlertTriangle, TrendingUp, Users, Image, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LoadTestingSimulator = () => {
  const [concurrentUsers, setConcurrentUsers] = useState(500);
  const [apiRate, setApiRate] = useState(100);
  const [imageLoad, setImageLoad] = useState(false);
  const [messagingLoad, setMessagingLoad] = useState(30);

  const metrics = useMemo(() => {
    const loadFactor = (concurrentUsers / 1000) * (apiRate / 200) * (1 + messagingLoad / 200);
    const baseLatency = 45;
    const responseTime = Math.round(baseLatency * (1 + loadFactor * 0.8 + (imageLoad ? 0.3 : 0)));
    const errorRate = Math.min(loadFactor > 2 ? (loadFactor - 2) * 3.5 : loadFactor > 1.5 ? (loadFactor - 1.5) * 0.8 : 0, 25);
    const throughput = Math.min(Math.round(apiRate * concurrentUsers * 0.01), 5000);
    const cpuUsage = Math.min(Math.round(loadFactor * 35 + (imageLoad ? 15 : 0)), 100);
    const memUsage = Math.min(Math.round(25 + loadFactor * 20 + (imageLoad ? 10 : 0)), 100);
    const scalingTriggered = loadFactor > 1.5;
    return { responseTime, errorRate: +errorRate.toFixed(1), throughput, cpuUsage, memUsage, loadFactor: +loadFactor.toFixed(2), scalingTriggered };
  }, [concurrentUsers, apiRate, imageLoad, messagingLoad]);

  const scenarioData = useMemo(() => {
    return [
      { label: '0s', normal: 45, peak: 80, viral: 180 },
      { label: '10s', normal: 48, peak: 95, viral: 250 },
      { label: '20s', normal: 46, peak: 120, viral: 380 },
      { label: '30s', normal: 50, peak: 110, viral: 520 },
      { label: '40s', normal: 47, peak: 130, viral: 450 },
      { label: '50s', normal: 45, peak: 105, viral: 350 },
      { label: '60s', normal: 44, peak: 95, viral: 280 },
    ].map(d => ({
      ...d,
      custom: Math.round(d.normal * metrics.loadFactor),
    }));
  }, [metrics.loadFactor]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Gauge className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">System Performance Load Testing</h2>
          <Badge variant="outline">🔥 Stress Test</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Simulate user traffic scenarios and measure system response characteristics</p>
      </motion.div>

      {/* Simulation Controls */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Load Parameters</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4" />Concurrent Users</span>
              <span className="font-bold text-foreground">{concurrentUsers.toLocaleString()}</span>
            </div>
            <Slider value={[concurrentUsers]} onValueChange={v => setConcurrentUsers(v[0])} min={50} max={5000} step={50} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-4 w-4" />API Request Rate (req/s)</span>
              <span className="font-bold text-foreground">{apiRate}</span>
            </div>
            <Slider value={[apiRate]} onValueChange={v => setApiRate(v[0])} min={10} max={500} step={10} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />Messaging Load (msg/s)</span>
              <span className="font-bold text-foreground">{messagingLoad}</span>
            </div>
            <Slider value={[messagingLoad]} onValueChange={v => setMessagingLoad(v[0])} min={0} max={200} step={5} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setImageLoad(!imageLoad)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${imageLoad ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border'}`}>
              <Image className="h-4 w-4 inline mr-1.5" />Image Upload Traffic {imageLoad ? 'ON' : 'OFF'}
            </button>
            {metrics.scalingTriggered && (
              <Badge variant="destructive" className="text-xs animate-pulse">⚠️ Auto-Scaling Triggered</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Output Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Response Time', value: `${metrics.responseTime}ms`, warn: metrics.responseTime > 200 },
          { label: 'Error Rate', value: `${metrics.errorRate}%`, warn: metrics.errorRate > 1 },
          { label: 'Throughput', value: `${metrics.throughput}/s`, warn: false },
          { label: 'CPU Usage', value: `${metrics.cpuUsage}%`, warn: metrics.cpuUsage > 75 },
          { label: 'Memory', value: `${metrics.memUsage}%`, warn: metrics.memUsage > 80 },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={m.warn ? 'border-destructive/50' : ''}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={`text-xl font-bold ${m.warn ? 'text-destructive' : 'text-primary'}`}>{m.value}</p>
                {m.warn && <AlertTriangle className="h-3.5 w-3.5 text-destructive mx-auto mt-1" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Infrastructure Scaling */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Infrastructure Utilization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'Database Connections', value: Math.min(Math.round(concurrentUsers * 0.03), 100), threshold: 80 },
            { name: 'Edge Function Instances', value: Math.min(Math.round(apiRate * 0.15), 100), threshold: 70 },
            { name: 'WebSocket Channels', value: Math.min(Math.round(messagingLoad * 0.4), 100), threshold: 75 },
            { name: 'CDN Bandwidth', value: Math.min(Math.round(concurrentUsers * 0.02 + (imageLoad ? 25 : 0)), 100), threshold: 85 },
          ].map((r, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{r.name}</span>
                <span className={`text-xs ${r.value > r.threshold ? 'text-destructive' : 'text-muted-foreground'}`}>{r.value}% ({r.value > r.threshold ? 'Over threshold' : 'Normal'})</span>
              </div>
              <Progress value={r.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Response Time Scenario Comparison (ms)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
              <Legend />
              <Line type="monotone" dataKey="normal" stroke="hsl(142 76% 36%)" name="Normal" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="peak" stroke="hsl(38 92% 50%)" name="Peak" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="viral" stroke="hsl(0 84% 60%)" name="Viral" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="custom" stroke="hsl(var(--primary))" name="Current Config" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadTestingSimulator;
