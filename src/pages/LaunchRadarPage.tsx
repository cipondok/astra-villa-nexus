import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Radar, TrendingUp, Shield, Bell, Scan, MapPin, Building2, AlertTriangle, Zap, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as ReRadar, Cell } from 'recharts';
import { toast } from 'sonner';
import {
  useLaunchRadarScan,
  useLaunchRadarSignals,
  useLaunchRadarAlerts,
  useLaunchRadarRisks,
  useLaunchRadarPredictions,
  useLaunchRadarForecasts,
} from '@/hooks/useLaunchRadar';

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-primary text-primary-foreground',
  medium: 'bg-muted text-muted-foreground',
  low: 'bg-secondary text-secondary-foreground',
};

const RISK_COLORS: Record<string, string> = {
  low: 'text-primary',
  moderate: 'text-muted-foreground',
  high: 'text-destructive',
  critical: 'text-destructive',
};

export default function LaunchRadarPage() {
  const [tab, setTab] = useState('overview');
  const scanMutation = useLaunchRadarScan();
  const { data: signals, refetch: rSignals } = useLaunchRadarSignals();
  const { data: alerts, refetch: rAlerts } = useLaunchRadarAlerts();
  const { data: risks, refetch: rRisks } = useLaunchRadarRisks();
  const { data: predictions, refetch: rPreds } = useLaunchRadarPredictions();
  const { data: forecasts, refetch: rForecasts } = useLaunchRadarForecasts();

  const runFullScan = async () => {
    try {
      await scanMutation.mutateAsync('full_scan');
      toast.success('Full radar scan complete!');
      rSignals(); rAlerts(); rRisks(); rPreds(); rForecasts();
    } catch {
      toast.error('Scan failed');
    }
  };

  const signalsByCity = (signals || []).reduce((acc: Record<string, number>, s: any) => {
    acc[s.city] = (acc[s.city] || 0) + 1;
    return acc;
  }, {});
  const cityChartData = Object.entries(signalsByCity).map(([city, count]) => ({ city, signals: count }));

  const riskChartData = (risks || []).map((r: any) => ({
    developer: r.developer_name.split(' ')[0],
    safety: r.investment_safety_index,
    quality: r.quality_perception_index,
    financial: r.financial_strength,
    reliability: r.completion_reliability,
    track_record: r.track_record_score,
  }));

  const CHART_COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--muted-foreground))',
    'hsl(var(--destructive))',
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Radar className="h-7 w-7 text-primary" />
            Launch Radar Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Predict upcoming project launches before official marketing begins
          </p>
        </div>
        <Button onClick={runFullScan} disabled={scanMutation.isPending} className="gap-2">
          <Scan className="h-4 w-4" />
          {scanMutation.isPending ? 'Scanning...' : 'Full Radar Scan'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Zap} label="Active Signals" value={signals?.length || 0} />
        <SummaryCard icon={Bell} label="Alerts" value={alerts?.length || 0} />
        <SummaryCard icon={Shield} label="Developers Scored" value={risks?.length || 0} />
        <SummaryCard icon={PiggyBank} label="Price Predictions" value={predictions?.length || 0} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 border border-border w-full flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="signals" className="text-xs">Developer Signals</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">Price Arbitrage</TabsTrigger>
          <TabsTrigger value="demand" className="text-xs">Demand Forecast</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs">Developer Risk</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Signals by City</CardTitle></CardHeader>
              <CardContent>
                {cityChartData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={cityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="signals" radius={[4, 4, 0, 0]}>
                        {cityChartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-10 text-center">Run a scan to see data</p>}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(alerts || []).slice(0, 5).map((a: any) => (
                  <div key={a.id} className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[9px] ${PRIORITY_COLORS[a.priority]}`}>{a.priority}</Badge>
                      <span className="text-xs font-medium text-foreground line-clamp-1">{a.title}</span>
                    </div>
                  </div>
                ))}
                {!alerts?.length && <p className="text-sm text-muted-foreground py-6 text-center">No alerts yet</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Developer Signals */}
        <TabsContent value="signals" className="mt-4">
          <div className="grid gap-3">
            {(signals || []).map((s: any) => (
              <Card key={s.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm text-foreground">{s.developer_name}</span>
                        <Badge variant="outline" className="text-[9px]">{s.signal_type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{s.city} — {s.district}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Launch Probability</p>
                      <p className="text-lg font-black text-primary">{s.launch_probability}%</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Intensity" value={s.activity_intensity_score} suffix="/100" />
                    <MiniStat label="Scale" value={s.estimated_project_scale} />
                    <MiniStat label="Est. Units" value={s.estimated_units} />
                  </div>
                  <Progress value={s.launch_probability} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
            ))}
            {!signals?.length && <p className="text-center text-muted-foreground py-10">Run a scan to detect developer signals</p>}
          </div>
        </TabsContent>

        {/* Price Arbitrage */}
        <TabsContent value="pricing" className="mt-4">
          <div className="grid gap-3">
            {(predictions || []).map((p: any) => (
              <Card key={p.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">{p.developer_name} — {p.city}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.optimal_booking_window}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Capital Gain</p>
                      <p className="text-lg font-black text-primary">+{p.expected_capital_gain_pct}%</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Launch /sqm" value={`Rp ${(p.expected_launch_price_sqm / 1e6).toFixed(1)}M`} />
                    <MiniStat label="Resale /sqm" value={`Rp ${(p.expected_resale_price_sqm / 1e6).toFixed(1)}M`} />
                    <MiniStat label="Early Bird" value={`-${p.early_bird_discount_pct}%`} />
                  </div>
                  <Progress value={p.early_entry_profit_score} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
            ))}
            {!predictions?.length && <p className="text-center text-muted-foreground py-10">No price predictions yet</p>}
          </div>
        </TabsContent>

        {/* Demand Forecast */}
        <TabsContent value="demand" className="mt-4">
          <div className="grid gap-3">
            {(forecasts || []).map((f: any) => (
              <Card key={f.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">{f.city} — {f.district}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(f.target_segments || []).map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Sellout Prob.</p>
                      <p className="text-lg font-black text-primary">{f.inventory_sellout_probability}%</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <MiniStat label="Velocity" value={f.sales_velocity_score} suffix="/100" />
                    <MiniStat label="Speed" value={f.buyer_absorption_speed} />
                    <MiniStat label="Foreign" value={`${f.foreign_investor_attraction}%`} />
                    <MiniStat label="Appreciation" value={`+${f.post_launch_appreciation_pct}%`} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!forecasts?.length && <p className="text-center text-muted-foreground py-10">No demand forecasts yet</p>}
          </div>
        </TabsContent>

        {/* Developer Risk */}
        <TabsContent value="risk" className="space-y-4 mt-4">
          {riskChartData.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Developer Safety Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={riskChartData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="developer" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <ReRadar name="Safety" dataKey="safety" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <ReRadar name="Quality" dataKey="quality" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {(risks || []).map((r: any) => (
              <Card key={r.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 ${RISK_COLORS[r.execution_risk_rating]}`} />
                      <span className="font-bold text-sm text-foreground">{r.developer_name}</span>
                      <Badge variant="outline" className="text-[9px]">{r.execution_risk_rating} risk</Badge>
                    </div>
                    <p className="text-lg font-black text-primary">{r.investment_safety_index}<span className="text-xs text-muted-foreground">/100</span></p>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <MiniStat label="Completed" value={`${r.completed_projects}/${r.total_projects}`} />
                    <MiniStat label="Delay" value={`${r.avg_delay_months}mo`} />
                    <MiniStat label="Quality" value={r.quality_perception_index} suffix="/100" />
                    <MiniStat label="Financial" value={r.financial_strength} suffix="/100" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!risks?.length && <p className="text-center text-muted-foreground py-10">No developer risk scores yet</p>}
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-4">
          <div className="grid gap-3">
            {(alerts || []).map((a: any) => (
              <Card key={a.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${RISK_COLORS[a.priority === 'critical' ? 'critical' : a.priority === 'high' ? 'high' : 'moderate']}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[9px] ${PRIORITY_COLORS[a.priority]}`}>{a.priority}</Badge>
                        <Badge variant="outline" className="text-[9px]">{a.alert_type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="font-bold text-sm text-foreground mt-1">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                    </div>
                    <p className="text-sm font-bold text-primary whitespace-nowrap">{Math.round(a.investment_score)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!alerts?.length && <p className="text-center text-muted-foreground py-10">No alerts generated yet</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-black text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, suffix }: { label: string; value: any; suffix?: string }) {
  return (
    <div className="p-1.5 rounded bg-muted/30">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-bold text-foreground">{value}{suffix && <span className="text-[9px] text-muted-foreground">{suffix}</span>}</p>
    </div>
  );
}
