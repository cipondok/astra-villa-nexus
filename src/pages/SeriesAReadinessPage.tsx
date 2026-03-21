import { motion } from 'framer-motion';
import {
  TrendingUp, Crown, Shield, MessageSquare, CheckCircle2, AlertCircle,
  XCircle, RefreshCw, Target, Rocket, ArrowRight, ChevronRight,
  DollarSign, BarChart3, Zap, Clock, Flag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSeriesAReadiness, type CheckStatus, type ReadinessLevel } from '@/hooks/useSeriesAReadiness';
import { cn } from '@/lib/utils';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  trending: TrendingUp, crown: Crown, shield: Shield, message: MessageSquare,
};
const DOMAIN_COLORS = [
  { bg: 'bg-chart-1/10', border: 'border-chart-1/30', text: 'text-chart-1', bar: 'bg-chart-1' },
  { bg: 'bg-chart-2/10', border: 'border-chart-2/30', text: 'text-chart-2', bar: 'bg-chart-2' },
  { bg: 'bg-chart-3/10', border: 'border-chart-3/30', text: 'text-chart-3', bar: 'bg-chart-3' },
  { bg: 'bg-chart-4/10', border: 'border-chart-4/30', text: 'text-chart-4', bar: 'bg-chart-4' },
];

function statusIcon(s: CheckStatus) {
  if (s === 'pass') return <CheckCircle2 className="w-4 h-4 text-chart-2" />;
  if (s === 'partial') return <AlertCircle className="w-4 h-4 text-chart-4" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
}

function readinessLabel(level: ReadinessLevel) {
  const map: Record<ReadinessLevel, { label: string; color: string }> = {
    not_ready: { label: 'NOT READY', color: 'bg-destructive/20 text-destructive' },
    building: { label: 'BUILDING', color: 'bg-chart-4/20 text-chart-4' },
    approaching: { label: 'APPROACHING', color: 'bg-chart-1/20 text-chart-1' },
    ready: { label: 'SERIES-A READY', color: 'bg-chart-2/20 text-chart-2' },
  };
  const m = map[level];
  return <Badge className={cn('text-xs font-bold px-3 py-1', m.color)}>{m.label}</Badge>;
}

function scoreColor(s: number) {
  if (s >= 70) return 'text-chart-2';
  if (s >= 40) return 'text-chart-4';
  return 'text-destructive';
}

export default function SeriesAReadinessPage() {
  const { data, isLoading, refetch } = useSeriesAReadiness();

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
              <Rocket className="w-6 h-6 text-primary" />
              Series-A Readiness Command
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fundraising readiness tracker — target {data.targetRaise} at {data.targetValuation}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Overall Readiness</p>
              <p className={cn('text-3xl font-bold', scoreColor(data.overallScore))}>{data.overallScore}%</p>
            </div>
            {readinessLabel(data.readinessLevel)}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Domain Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.domains.map((d, i) => {
            const Icon = DOMAIN_ICONS[d.icon] || TrendingUp;
            const c = DOMAIN_COLORS[i];
            return (
              <motion.div key={d.domain} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className={cn('border', c.border)}>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('p-1.5 rounded-md', c.bg)}><Icon className={cn('w-4 h-4', c.text)} /></div>
                      <span className="text-xs font-medium text-muted-foreground">{d.domain}</span>
                    </div>
                    <p className={cn('text-2xl font-bold', scoreColor(d.score))}>{d.score}%</p>
                    <Progress value={d.score} className="h-1.5 mt-2" />
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{d.narrative}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Top Gaps Alert */}
        {data.topGaps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="py-3 px-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-destructive" />
                  Critical Gaps to Close ({data.topGaps.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {data.topGaps.map((g, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-destructive" /> {g}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Domain Detail + Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {data.domains.map((d, di) => {
            const c = DOMAIN_COLORS[di];
            return (
              <motion.div key={d.domain} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + di * 0.07 }}>
                <Card className={cn('border', c.border)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{d.domain} Checklist</span>
                      <span className={cn('text-lg font-bold', scoreColor(d.score))}>{d.score}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {d.checks.map((ch, ci) => (
                      <div key={ci} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                        {statusIcon(ch.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{ch.label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{ch.current}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-primary">{ch.target}</span>
                          </div>
                        </div>
                        <div className="w-16 text-right shrink-0">
                          <p className={cn('text-sm font-bold', scoreColor(ch.pct))}>{ch.pct}%</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Row: Timeline + Story Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Fundraising Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Fundraising Preparation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.timeline.map((t, i) => (
                  <div key={i} className={cn(
                    'p-3 rounded-lg border',
                    t.status === 'active' ? 'border-primary/30 bg-primary/5' :
                    t.status === 'completed' ? 'border-chart-2/20 bg-chart-2/5' :
                    'border-muted bg-muted/20'
                  )}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {t.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-chart-2" /> :
                         t.status === 'active' ? <Zap className="w-4 h-4 text-primary" /> :
                         <Flag className="w-4 h-4 text-muted-foreground" />}
                        <span className="text-sm font-semibold text-foreground">{t.phase}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{t.months}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {t.milestones.map((m, mi) => (
                        <p key={mi} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="shrink-0">→</span> {m}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Investor Story Structure */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Investor Storytelling Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.storyStructure.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-bold">{s.section}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{s.hook}</p>
                    <p className="text-xs text-primary mt-1 flex items-start gap-1">
                      <BarChart3 className="w-3 h-3 mt-0.5 shrink-0" />
                      {s.proof}
                    </p>
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
