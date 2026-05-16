import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, TrendingUp, Network, Landmark, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Minus, Activity, Gauge,
  RefreshCw, ChevronRight, AlertTriangle, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useFounderStrategicKPIs, type KPICategory, type StrategicKPI, type KPIStatus } from '@/hooks/useFounderStrategicKPIs';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  crown: Crown,
  'trending-up': TrendingUp,
  network: Network,
  landmark: Landmark,
  'shield-alert': ShieldAlert,
};

const STATUS_STYLES: Record<KPIStatus, { text: string; bg: string; border: string; label: string }> = {
  strong:  { text: 'text-chart-2',     bg: 'bg-chart-2/10',     border: 'border-chart-2/30',     label: 'Strong' },
  healthy: { text: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/30',     label: 'Healthy' },
  caution: { text: 'text-chart-4',     bg: 'bg-chart-4/10',     border: 'border-chart-4/30',     label: 'Caution' },
  critical:{ text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'Critical' },
};

const CATEGORY_COLORS: Record<string, string> = {
  'chart-1': 'hsl(var(--chart-1))',
  'chart-2': 'hsl(var(--chart-2))',
  'chart-3': 'hsl(var(--chart-3))',
  'chart-4': 'hsl(var(--chart-4))',
  'chart-5': 'hsl(var(--chart-5))',
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <ArrowUpRight className="h-3.5 w-3.5 text-chart-2" />;
  if (trend === 'down') return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

// ── Score Ring ──
function ScoreRing({ score, status, size = 140 }: { score: number; status: KPIStatus; size?: number }) {
  const s = STATUS_STYLES[status];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted/20" />
        <motion.circle
          cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
          className={cn('transition-colors', s.text.replace('text-', 'stroke-'))}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-bold tabular-nums', s.text)}>{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{s.label}</span>
      </div>
    </div>
  );
}

// ── KPI Row ──
function KPIRow({ kpi, index }: { kpi: StrategicKPI; index: number }) {
  const s = STATUS_STYLES[kpi.status];
  const pct = Math.min(100, (kpi.value / kpi.target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground truncate">{kpi.label}</span>
          <TrendIcon trend={kpi.trend} />
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn('text-sm font-semibold tabular-nums', s.text)}>{kpi.displayValue}</span>
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', s.bg, s.border, s.text)}>
          {s.label}
        </Badge>
      </div>
    </motion.div>
  );
}

// ── Category Card ──
function CategoryCard({ category, index }: { category: KPICategory; index: number }) {
  const Icon = CATEGORY_ICONS[category.icon] || Activity;
  const s = STATUS_STYLES[
    category.compositeScore >= 75 ? 'strong' :
    category.compositeScore >= 50 ? 'healthy' :
    category.compositeScore >= 25 ? 'caution' : 'critical'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, delay: 0.1 * index, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn('p-2 rounded-lg', s.bg)}>
                <Icon className={cn('h-4 w-4', s.text)} />
              </div>
              <CardTitle className="text-base font-semibold">{category.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn('text-lg font-bold tabular-nums', s.text)}>{category.compositeScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-0.5">
          {category.kpis.map((kpi, i) => (
            <KPIRow key={kpi.key} kpi={kpi} index={i} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Radar Chart ──
function DimensionRadar({ categories }: { categories: KPICategory[] }) {
  const data = categories.map(c => ({
    dimension: c.title.replace('Market ', '').replace('Platform ', '').replace(' Signals', ''),
    score: c.compositeScore,
    fullMark: 100,
  }));

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          Strategic Dimension Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))"
              fillOpacity={0.15} strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Score Bar Chart ──
function ScoreBarChart({ categories }: { categories: KPICategory[] }) {
  const data = categories.map(c => ({
    name: c.title.split(' ')[0],
    score: c.compositeScore,
    color: CATEGORY_COLORS[c.color] || 'hsl(var(--primary))',
  }));

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis dataKey="name" type="category" width={65} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v}/100`, 'Score']}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Valuation Readiness Checklist ──
function ValuationReadiness({ data }: { data: ReturnType<typeof useFounderStrategicKPIs>['data'] }) {
  if (!data) return null;
  const checks = [
    { label: 'Market dominance trajectory', pass: data.dominanceScore >= 40, score: data.dominanceScore },
    { label: 'Unit economics sustainability', pass: data.economicsScore >= 50, score: data.economicsScore },
    { label: 'Network effect compounding', pass: data.networkScore >= 35, score: data.networkScore },
    { label: 'Institutional capital readiness', pass: data.capitalScore >= 30, score: data.capitalScore },
    { label: 'Risk exposure managed', pass: data.riskScore >= 50, score: data.riskScore },
  ];
  const passCount = checks.filter(c => c.pass).length;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Valuation Readiness Gate
          </CardTitle>
          <Badge variant="outline" className={cn(
            'text-xs',
            passCount >= 4 ? 'bg-chart-2/10 text-chart-2 border-chart-2/30' :
            passCount >= 2 ? 'bg-chart-4/10 text-chart-4 border-chart-4/30' :
            'bg-destructive/10 text-destructive border-destructive/30'
          )}>
            {passCount}/5 Gates Passed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', c.pass ? 'bg-chart-2' : 'bg-destructive')} />
              <span className="text-sm text-foreground">{c.label}</span>
            </div>
            <span className={cn('text-sm font-semibold tabular-nums', c.pass ? 'text-chart-2' : 'text-muted-foreground')}>
              {c.score}%
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──
const FounderStrategicKPIs = React.memo(function FounderStrategicKPIs() {
  const { data, isLoading, error, refetch } = useFounderStrategicKPIs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-destructive">Failed to load strategic KPIs</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Founder Strategic Command
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Growth · Dominance · Valuation Readiness
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn('text-xs', STATUS_STYLES[data.overallStatus].bg, STATUS_STYLES[data.overallStatus].text, STATUS_STYLES[data.overallStatus].border)}>
            Overall: {data.overallScore}/100
          </Badge>
        </div>
      </motion.div>

      {/* Master Score + Radar + Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="border-border/50 shadow-sm h-full flex flex-col items-center justify-center py-8">
            <ScoreRing score={data.overallScore} status={data.overallStatus} size={160} />
            <p className="text-xs text-muted-foreground mt-3 font-medium uppercase tracking-wider">
              Composite Readiness
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              5-dimension weighted average
            </p>
          </Card>
        </motion.div>

        <DimensionRadar categories={data.categories} />
        <ScoreBarChart categories={data.categories} />
      </div>

      {/* KPI Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.categories.map((cat, i) => (
          <CategoryCard key={cat.id} category={cat} index={i} />
        ))}
        <ValuationReadiness data={data} />
      </div>
    </div>
  );
});

export default FounderStrategicKPIs;
