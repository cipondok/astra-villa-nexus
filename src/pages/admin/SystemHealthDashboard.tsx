import React from 'react';
import { useSystemHealthReport, useBundleMetrics, usePerformanceMetrics } from '@/hooks/useSystemHealthMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, AlertTriangle, CheckCircle, Gauge, Shield, TrendingUp, Zap, Server, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  strong: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Strong' },
  stable: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Stable' },
  risk: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'At Risk' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical' },
} as const;

const METRIC_CARDS = [
  { key: 'platformComplexity' as const, label: 'Platform Complexity', abbr: 'PCS', icon: Server, desc: 'System complexity & job health' },
  { key: 'performanceStability' as const, label: 'Performance Stability', abbr: 'PSS', icon: Zap, desc: 'Latency & subsystem uptime' },
  { key: 'featureActivation' as const, label: 'Feature Activation', abbr: 'FAS', icon: Activity, desc: 'Active subsystem coverage' },
  { key: 'investorDemoReadiness' as const, label: 'Demo Readiness', abbr: 'IDRS', icon: Eye, desc: 'Investor presentation readiness' },
  { key: 'scalabilityConfidence' as const, label: 'Scalability', abbr: 'SCS', icon: TrendingUp, desc: 'Growth capacity assessment' },
];

function ScoreRing({ score, status }: { score: number; status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.stable;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="8" />
        <circle
          cx="100" cy="100" r={radius} fill="none"
          stroke="currentColor"
          className={cfg.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-4xl font-bold tracking-tight', cfg.color)}>{score}</span>
        <span className="text-xs text-muted-foreground mt-1">ASTRA INDEX</span>
      </div>
    </div>
  );
}

function MetricCard({ label, abbr, value, icon: Icon, desc }: {
  label: string; abbr: string; value: number; icon: React.ElementType; desc: string;
}) {
  const color = value >= 80 ? 'text-emerald-400' : value >= 65 ? 'text-blue-400' : value >= 55 ? 'text-amber-400' : 'text-red-400';
  const bg = value >= 80 ? 'bg-emerald-500/5' : value >= 65 ? 'bg-blue-500/5' : value >= 55 ? 'bg-amber-500/5' : 'bg-red-500/5';

  return (
    <Card className={cn('border-border/50 backdrop-blur-sm', bg)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-muted/50">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">{abbr}</Badge>
        </div>
        <div className={cn('text-2xl font-bold tracking-tight', color)}>{value}</div>
        <div className="text-xs font-medium text-foreground mt-1">{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
      </CardContent>
    </Card>
  );
}

const SystemHealthDashboard: React.FC = () => {
  const { report, isLoading, lastChecked } = useSystemHealthReport();
  const bundle = useBundleMetrics();
  const perf = usePerformanceMetrics();

  if (isLoading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Gauge className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Computing health index…</p>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[report.status];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Platform Health Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Last checked: {lastChecked ? new Date(lastChecked).toLocaleString() : 'N/A'}
          </p>
        </div>
        <Badge className={cn('text-xs px-3 py-1', cfg.bg, cfg.border, cfg.color)}>
          {cfg.label}
        </Badge>
      </div>

      {/* Smart Alerts */}
      {report.overallScore < 55 && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Feature Freeze Recommended</AlertTitle>
          <AlertDescription className="text-xs">
            Health index is {report.overallScore} — halt new feature development until stability is restored.
          </AlertDescription>
        </Alert>
      )}
      {report.overallScore >= 55 && report.overallScore < 65 && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-sm font-semibold text-amber-400">Stability Warning</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Health index at {report.overallScore} — monitor closely and prioritize fixes.
          </AlertDescription>
        </Alert>
      )}

      {/* Score Ring + Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Ring */}
        <Card className="lg:col-span-4 border-border/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ScoreRing score={report.overallScore} status={report.status} />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-foreground">ASTRA Health Index</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Weighted composite of 5 subsystem scores
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {METRIC_CARDS.map(m => (
            <MetricCard key={m.key} {...m} value={report.metrics[m.key]} />
          ))}
          {/* Performance snapshot card */}
          <Card className="border-border/50 backdrop-blur-sm bg-muted/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">PERF</Badge>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">DOM Ready</span><span className="font-mono text-foreground">{perf.domReady}ms</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">FCP</span><span className="font-mono text-foreground">{perf.fcp}ms</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">JS Chunks</span><span className="font-mono text-foreground">{bundle.jsCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Transfer</span><span className="font-mono text-foreground">{bundle.totalTransferKB}KB</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
