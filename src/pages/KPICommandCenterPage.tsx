import { motion } from 'framer-motion';
import {
  Activity, DollarSign, Users, Zap, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Minus, RefreshCw, Bell, Calendar,
  ArrowUpRight, Shield, Target, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useKPICommandCenter, type KPIDomain, type AlertLevel, type TrendDir } from '@/hooks/useKPICommandCenter';
import { cn } from '@/lib/utils';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  activity: Activity,
  dollar: DollarSign,
  users: Users,
  zap: Zap,
};

const DOMAIN_COLORS = [
  { bg: 'bg-chart-1/10', border: 'border-chart-1/30', text: 'text-chart-1', progress: 'bg-chart-1' },
  { bg: 'bg-chart-2/10', border: 'border-chart-2/30', text: 'text-chart-2', progress: 'bg-chart-2' },
  { bg: 'bg-chart-3/10', border: 'border-chart-3/30', text: 'text-chart-3', progress: 'bg-chart-3' },
  { bg: 'bg-chart-4/10', border: 'border-chart-4/30', text: 'text-chart-4', progress: 'bg-chart-4' },
];

function alertBadge(level: AlertLevel) {
  if (level === 'critical') return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Critical</Badge>;
  if (level === 'warning') return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30 text-[10px] px-1.5 py-0">Warning</Badge>;
  return <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 text-[10px] px-1.5 py-0">Normal</Badge>;
}

function trendIcon(t: TrendDir) {
  if (t === 'up') return <TrendingUp className="w-3.5 h-3.5 text-chart-2" />;
  if (t === 'down') return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

function formatValue(val: number, unit: string) {
  if (unit === 'Rp') return `Rp ${val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val.toLocaleString('id-ID')}`;
  if (unit === 'x') return `${val}x`;
  if (unit === '%') return `${val}%`;
  return `${val} ${unit}`;
}

function healthColor(score: number) {
  if (score >= 70) return 'text-chart-2';
  if (score >= 40) return 'text-chart-4';
  return 'text-destructive';
}

export default function KPICommandCenterPage() {
  const { data, isLoading, refetch } = useKPICommandCenter();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              KPI Command Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time marketplace intelligence — liquidity, revenue, network, growth</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Overall Health</p>
              <p className={cn('text-2xl font-bold', healthColor(data.overallHealth))}>{data.overallHealth}%</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </motion.div>

        {/* Alert Strip */}
        {data.topAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">Active Alerts ({data.topAlerts.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.topAlerts.slice(0, 6).map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', a.level === 'critical' ? 'text-destructive' : 'text-chart-4')} />
                      <div>
                        <span className="text-foreground">{a.message}</span>
                        <span className="text-muted-foreground ml-1">· {a.domain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Domain Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {data.domains.map((domain, di) => {
            const Icon = DOMAIN_ICONS[domain.icon] || Activity;
            const colors = DOMAIN_COLORS[di];
            return (
              <motion.div key={domain.domain} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + di * 0.08 }}>
                <Card className={cn('border', colors.border)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className={cn('p-1.5 rounded-md', colors.bg)}>
                          <Icon className={cn('w-4 h-4', colors.text)} />
                        </div>
                        {domain.domain}
                      </CardTitle>
                      <div className="text-right">
                        <p className={cn('text-xl font-bold', healthColor(domain.healthScore))}>{domain.healthScore}</p>
                        <p className="text-[10px] text-muted-foreground">Health Score</p>
                      </div>
                    </div>
                    <Progress value={domain.healthScore} className="h-1.5 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="space-y-2.5">
                      {domain.metrics.map((m) => (
                        <div key={m.key} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{m.label}</span>
                              {alertBadge(m.alert)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-sm font-bold text-foreground">{formatValue(m.value, m.unit)}</span>
                            <div className="flex items-center gap-1">
                              {trendIcon(m.trend)}
                              <span className={cn('text-xs font-medium', m.delta > 0 ? 'text-chart-2' : m.delta < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                {m.delta > 0 ? '+' : ''}{m.delta}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Anomalies */}
                    {domain.anomalies.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-destructive flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="w-3 h-3" /> Anomalies Detected
                        </p>
                        {domain.anomalies.map((a, i) => (
                          <p key={i} className="text-xs text-muted-foreground pl-4 py-0.5">• {a}</p>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div>
                      <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1.5">
                        <Target className="w-3 h-3" /> Recommended Actions
                      </p>
                      {domain.actions.map((a, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4 py-0.5">→ {a}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Row: Reporting Cadence + KPI Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Reporting Cadence */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Executive Reporting Cadence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.reportingCadence.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.frequency}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{r.next}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* KPI Priority Hierarchy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  KPI Prioritization Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { tier: 'P0 — North Star', kpis: 'Deal Velocity · Absorption Rate · MRR', desc: 'Monitor daily, act immediately on anomalies' },
                  { tier: 'P1 — Growth Drivers', kpis: 'LTV/CAC · Agent Density · Investor Acquisition', desc: 'Review weekly, adjust campaigns accordingly' },
                  { tier: 'P2 — Efficiency', kpis: 'Campaign ROI · Referral % · Days on Market', desc: 'Monthly optimization cycles' },
                  { tier: 'P3 — Strategic', kpis: 'Vendor Coverage · Premium Yield · Subscription Growth', desc: 'Quarterly strategy reviews' },
                ].map((p, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{p.tier}</p>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-primary mt-0.5">{p.kpis}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
