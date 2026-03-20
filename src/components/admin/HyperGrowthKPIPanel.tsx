import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, TrendingDown, ArrowUp, ArrowDown, AlertTriangle, CheckCircle, DollarSign, Users, Building2, Zap, Clock, Target, BarChart3 } from 'lucide-react';

interface KPI {
  metric: string;
  value: string;
  prev: string;
  change: number;
  target: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: number[];
}

const liquidityKPIs: KPI[] = [
  { metric: 'Listing Absorption Rate', value: '42 days', prev: '48 days', change: -12.5, target: '<35 days', status: 'warning', trend: [52, 50, 48, 46, 44, 42] },
  { metric: 'Deal Conversion', value: '6.4%', prev: '5.8%', change: 10.3, target: '8%', status: 'healthy', trend: [4.2, 4.8, 5.2, 5.8, 6.1, 6.4] },
  { metric: 'Demand Heat Intensity', value: '78/100', prev: '72/100', change: 8.3, target: '85', status: 'healthy', trend: [65, 68, 70, 72, 75, 78] },
  { metric: 'Active Listings', value: '12,847', prev: '11,200', change: 14.7, target: '15,000', status: 'healthy', trend: [9800, 10200, 10800, 11200, 12100, 12847] },
];

const revenueKPIs: KPI[] = [
  { metric: 'Monthly Recurring Revenue', value: 'Rp 2.4B', prev: 'Rp 2.1B', change: 14.3, target: 'Rp 3B', status: 'healthy', trend: [1.6, 1.8, 1.9, 2.1, 2.2, 2.4] },
  { metric: 'Commission Volume', value: 'Rp 8.7B', prev: 'Rp 7.9B', change: 10.1, target: 'Rp 10B', status: 'healthy', trend: [6.2, 6.8, 7.2, 7.9, 8.3, 8.7] },
  { metric: 'Premium Listing Conv.', value: '18.2%', prev: '16.5%', change: 10.3, target: '22%', status: 'warning', trend: [12, 14, 15, 16.5, 17.4, 18.2] },
  { metric: 'Vendor Sub Penetration', value: '34%', prev: '29%', change: 17.2, target: '45%', status: 'warning', trend: [22, 25, 27, 29, 31, 34] },
];

const userKPIs: KPI[] = [
  { metric: 'Monthly Active Users', value: '148K', prev: '127K', change: 16.5, target: '200K', status: 'healthy', trend: [95, 105, 112, 127, 138, 148] },
  { metric: 'Investor Acquisition Rate', value: '2,340/mo', prev: '1,890/mo', change: 23.8, target: '3,000', status: 'healthy', trend: [1200, 1450, 1620, 1890, 2100, 2340] },
  { metric: 'Vendor Network Growth', value: '+142/mo', prev: '+108/mo', change: 31.5, target: '200/mo', status: 'healthy', trend: [72, 85, 92, 108, 125, 142] },
  { metric: 'Developer Onboarding', value: '18 active', prev: '14 active', change: 28.6, target: '25', status: 'warning', trend: [8, 10, 11, 14, 16, 18] },
];

const opsKPIs: KPI[] = [
  { metric: 'Lead Response Time', value: '2.4h', prev: '3.1h', change: -22.6, target: '<2h', status: 'warning', trend: [4.5, 4.0, 3.5, 3.1, 2.7, 2.4] },
  { metric: 'Deal Pipeline Velocity', value: '34 days', prev: '41 days', change: -17.1, target: '<28 days', status: 'warning', trend: [52, 48, 45, 41, 37, 34] },
  { metric: 'Campaign ROI', value: '340%', prev: '285%', change: 19.3, target: '400%', status: 'healthy', trend: [180, 210, 245, 285, 310, 340] },
  { metric: 'CSAT Score', value: '4.6/5', prev: '4.4/5', change: 4.5, target: '4.7', status: 'healthy', trend: [4.1, 4.2, 4.3, 4.4, 4.5, 4.6] },
];

const alerts = [
  { severity: 'critical', message: 'Listing absorption in Surabaya exceeded 60-day threshold', time: '12m ago' },
  { severity: 'warning', message: 'Vendor subscription churn rate increased 8% WoW', time: '1h ago' },
  { severity: 'warning', message: 'Lead response time in Bandung trending above 4h target', time: '2h ago' },
  { severity: 'info', message: 'Investor acquisition hit monthly record: 2,340 new investors', time: '4h ago' },
  { severity: 'info', message: 'Jakarta deal conversion improved to 7.2% (+18% MoM)', time: '6h ago' },
];

const phases = [
  { phase: 1, name: 'Core KPI Framework', duration: 'Month 1', progress: 100, items: ['KPI hierarchy', 'Data aggregation', 'Cache layer'] },
  { phase: 2, name: 'Real-Time Dashboard', duration: 'Month 2', progress: 70, items: ['Live refresh', 'Spark trends', 'Summary cards'] },
  { phase: 3, name: 'Alert Engine', duration: 'Month 3', progress: 25, items: ['Anomaly detection', 'Threshold rules', 'Push notifications'] },
  { phase: 4, name: 'Predictive Layer', duration: 'Month 4-5', progress: 0, items: ['Trend projection', 'Forecasting models', 'Executive briefs'] },
];

const statusIcon = (s: string) => {
  if (s === 'healthy') return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
  if (s === 'warning') return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
  return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
};

const SparkLine: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="text-primary">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

const KPIRow: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  const isPositiveGood = !kpi.metric.includes('Time') && !kpi.metric.includes('Absorption');
  const isGood = isPositiveGood ? kpi.change > 0 : kpi.change < 0;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {statusIcon(kpi.status)}
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{kpi.metric}</p>
          <p className="text-[10px] text-muted-foreground">Target: {kpi.target}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SparkLine data={kpi.trend} />
        <div className="text-right w-20">
          <p className="text-sm font-bold">{kpi.value}</p>
          <p className={`text-[10px] flex items-center justify-end gap-0.5 ${isGood ? 'text-emerald-600' : 'text-red-500'}`}>
            {isGood ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {Math.abs(kpi.change)}%
          </p>
        </div>
      </div>
    </div>
  );
};

const HyperGrowthKPIPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Executive Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Revenue Growth', value: '+14.3%', sub: 'MoM', icon: DollarSign, accent: 'text-emerald-600' },
          { label: 'User Growth', value: '+16.5%', sub: 'MAU', icon: Users, accent: 'text-primary' },
          { label: 'Deal Velocity', value: '34 days', sub: 'avg close', icon: Zap, accent: 'text-orange-600' },
          { label: 'Health Score', value: '82/100', sub: 'overall', icon: Activity, accent: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <s.icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="liquidity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-9">
          <TabsTrigger value="liquidity" className="text-xs">Liquidity</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
          <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="liquidity" className="space-y-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Marketplace Liquidity</CardTitle>
                <Badge variant="outline" className="text-[10px] ml-auto">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {liquidityKPIs.map(k => <KPIRow key={k.metric} kpi={k} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-sm">Revenue Growth</CardTitle>
                <Badge variant="outline" className="text-[10px] ml-auto">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {revenueKPIs.map(k => <KPIRow key={k.metric} kpi={k} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">User & Network Expansion</CardTitle>
                <Badge variant="outline" className="text-[10px] ml-auto">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {userKPIs.map(k => <KPIRow key={k.metric} kpi={k} />)}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm">Operational Efficiency</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {opsKPIs.map(k => <KPIRow key={k.metric} kpi={k} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          {alerts.map((a, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                {a.severity === 'critical' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                ) : a.severity === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${
                    a.severity === 'critical' ? 'border-red-300 text-red-600' :
                    a.severity === 'warning' ? 'border-amber-300 text-amber-600' :
                    'border-emerald-300 text-emerald-600'
                  }`}
                >
                  {a.severity}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-3">
          {phases.map(p => (
            <Card key={p.phase} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      p.progress === 100 ? 'bg-emerald-100 text-emerald-700' :
                      p.progress > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {p.phase}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.duration}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {p.items.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] font-normal">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HyperGrowthKPIPanel;
