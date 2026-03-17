import { useState } from 'react';
import { useDeveloperDemandForecast } from '@/hooks/useDeveloperDemandForecast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, Flame, Target, Users, BarChart3, Zap, DollarSign, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

const CITIES = ['', 'Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan', 'Yogyakarta', 'Makassar', 'Semarang'];
const TYPES = ['', 'rumah', 'apartemen', 'villa', 'ruko', 'tanah'];

const signalConfig = {
  HIGH_LAUNCH_READINESS: { color: 'hsl(var(--chart-1))', bg: 'bg-chart-1/10 text-chart-1 border-chart-1/30', icon: CheckCircle2, label: 'Siap Launch' },
  MODERATE_DEMAND: { color: 'hsl(var(--chart-3))', bg: 'bg-chart-3/10 text-chart-3 border-chart-3/30', icon: Clock, label: 'Push Marketing' },
  LOW_DEMAND_RISK: { color: 'hsl(var(--destructive))', bg: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle, label: 'Risiko Rendah' },
};

const fmt = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}rb`;
  return String(n);
};

export default function DeveloperDemandForecastPage() {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const { data, isLoading, error } = useDeveloperDemandForecast({ city, property_type: propertyType });

  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Developer Demand Forecast
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Strategic intelligence untuk optimasi launch properti</p>
          </div>
          <div className="flex gap-2">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Semua Kota" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Kota</SelectItem>
                {CITIES.filter(Boolean).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Tipe</SelectItem>
                {TYPES.filter(Boolean).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Menganalisis data demand...</span>
          </div>
        )}

        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-6 text-center text-destructive">
              Gagal memuat data: {(error as Error).message}
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPICard icon={Target} label="Properti Dianalisis" value={data.total_properties_analyzed} color="primary" />
              <KPICard icon={Zap} label="Kecepatan Absorpsi" value={`${data.absorption_speed.avg_days_to_absorb} hari`} color="chart-1" badge={data.absorption_speed.speed_rating} />
              <KPICard icon={Users} label="Est. Leads Qualified" value={data.lead_pipeline.estimated_qualified_leads} color="chart-4" />
              <KPICard icon={DollarSign} label="Sweet Spot Harga" value={fmt(data.optimal_pricing.sweet_spot)} color="chart-3" />
            </div>

            {/* Forecast Signals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-primary" />Forecast Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.forecast_signals.map((s, i) => {
                    const cfg = signalConfig[s.signal as keyof typeof signalConfig] || signalConfig.LOW_DEMAND_RISK;
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className={`rounded-lg border p-3 ${cfg.bg}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4" />
                          <span className="font-semibold text-sm">{s.area}</span>
                          <Badge variant="outline" className="ml-auto text-xs">{cfg.label}</Badge>
                        </div>
                        <p className="text-xs opacity-80">{s.message}</p>
                        <Progress value={s.heat} className="h-1.5 mt-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Inquiry Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />Tren Inquiry & Saves</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.inquiry_trend}>
                      <defs>
                        <linearGradient id="gInq" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" fill="url(#gInq)" strokeWidth={2} name="Inquiry" />
                      <Area type="monotone" dataKey="saves" stroke="hsl(var(--chart-4))" fill="url(#gSav)" strokeWidth={2} name="Saves" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Budget Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-chart-3" />Distribusi Budget Investor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.investor_budget_distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Listings" />
                      <Bar dataKey="avg_demand" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Avg Demand" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Area Demand Heat + Competing Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Area Heat Table */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" />Area Demand Heat Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2 px-2">Area</th>
                          <th className="text-center py-2 px-2">Heat</th>
                          <th className="text-center py-2 px-2">Listings</th>
                          <th className="text-center py-2 px-2">Avg Price</th>
                          <th className="text-center py-2 px-2">Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.area_demand_heat.map((a, i) => {
                          const cfg = signalConfig[a.signal as keyof typeof signalConfig] || signalConfig.LOW_DEMAND_RISK;
                          return (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="py-2 px-2 font-medium">{a.area}</td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center gap-2 justify-center">
                                  <Progress value={a.avg_heat} className="h-2 w-16" />
                                  <span className="text-xs font-mono">{a.avg_heat}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center">{a.listing_count}</td>
                              <td className="py-2 px-2 text-center font-mono text-xs">{fmt(a.avg_price)}</td>
                              <td className="py-2 px-2 text-center">
                                <Badge variant="outline" className={`text-xs ${cfg.bg}`}>{cfg.label}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Pipeline */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-4" />Lead Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PipelineStep label="Total Views" value={data.lead_pipeline.total_views} pct={100} color="chart-2" />
                  <PipelineStep label="Est. Inquiries" value={data.lead_pipeline.estimated_inquiries} pct={Math.round((data.lead_pipeline.estimated_inquiries / Math.max(1, data.lead_pipeline.total_views)) * 100)} color="chart-4" />
                  <PipelineStep label="Qualified Leads" value={data.lead_pipeline.estimated_qualified_leads} pct={Math.round((data.lead_pipeline.estimated_qualified_leads / Math.max(1, data.lead_pipeline.total_views)) * 100)} color="chart-1" />
                  <PipelineStep label="Est. Conversions" value={data.lead_pipeline.estimated_conversions} pct={Math.round((data.lead_pipeline.estimated_conversions / Math.max(1, data.lead_pipeline.total_views)) * 100)} color="primary" />
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Conversion Rate</span>
                      <span className="font-bold text-foreground">{data.lead_pipeline.conversion_rate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Optimal Pricing + Competing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-chart-3" />Optimal Pricing Band</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center space-y-3">
                      <div className="flex items-end gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Min</p>
                          <p className="text-lg font-bold text-chart-4">{fmt(data.optimal_pricing.min)}</p>
                        </div>
                        <div className="pb-1">
                          <div className="w-24 h-1 bg-gradient-to-r from-chart-4 via-chart-1 to-chart-3 rounded-full" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Max</p>
                          <p className="text-lg font-bold text-chart-3">{fmt(data.optimal_pricing.max)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sweet Spot</p>
                        <p className="text-3xl font-bold text-primary">{fmt(data.optimal_pricing.sweet_spot)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Berdasarkan {data.optimal_pricing.sample_size} properti high-demand</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-2" />Kompetisi per Tipe Properti</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.competing_projects} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis type="category" dataKey="property_type" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={70} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="total_listings" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Listings" />
                      <Bar dataKey="avg_opportunity_score" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Avg Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color, badge }: { icon: any; label: string; value: string | number; color: string; badge?: string }) {
  return (
    <Card className={`border-${color}/20`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 text-${color}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
          {badge && <Badge variant="outline" className="ml-auto text-[10px]">{badge}</Badge>}
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function PipelineStep({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value.toLocaleString()}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
