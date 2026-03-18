import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Zap, Target, Layers, AlertTriangle, CheckCircle2,
  Clock, Circle, Sparkles, RefreshCw, ArrowUpRight, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useFeaturePrioritization, type Quadrant, type PrioritizedFeature } from '@/hooks/useFeaturePrioritization';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const QUADRANT_META: Record<Quadrant, { label: string; icon: React.ElementType; color: string; bg: string; border: string; description: string }> = {
  quick_wins: { label: 'Quick Wins', icon: Zap, color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/30', description: 'High impact, low complexity — ship immediately' },
  strategic_bets: { label: 'Strategic Bets', icon: Target, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', description: 'High impact, high complexity — invest deliberately' },
  fill_ins: { label: 'Fill-Ins', icon: Layers, color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30', description: 'Low impact, low complexity — do when bandwidth allows' },
  deprioritize: { label: 'Deprioritize', icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-border/40', description: 'Low impact, high complexity — defer or eliminate' },
};

const STATUS_CONFIG = {
  shipped: { icon: CheckCircle2, color: 'text-chart-2', label: 'Shipped' },
  building: { icon: Clock, color: 'text-chart-4', label: 'Building' },
  planned: { icon: Circle, color: 'text-primary', label: 'Planned' },
  exploring: { icon: Sparkles, color: 'text-muted-foreground', label: 'Exploring' },
};

export default function FeaturePrioritizationPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useFeaturePrioritization();
  const [activeTab, setActiveTab] = useState<string>('matrix');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-chart-4" />
            Feature Prioritization Matrix
          </h1>
          <p className="text-xs text-muted-foreground">
            Impact vs complexity decision framework · Updated {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM d, HH:mm') : '—'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Recommendation Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Card className="border-chart-2/30 bg-chart-2/5">
          <CardContent className="p-3 flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">Strategic Recommendation</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{data.focus_recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quadrant Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['quick_wins', 'strategic_bets', 'fill_ins', 'deprioritize'] as Quadrant[]).map(q => {
            const meta = QUADRANT_META[q];
            const summary = data.quadrant_summary[q];
            const Icon = meta.icon;
            return (
              <Card key={q} className={cn('border-border/40', meta.border)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={cn('h-6 w-6 rounded-md flex items-center justify-center', meta.bg)}>
                      <Icon className={cn('h-3 w-3', meta.color)} />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{meta.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{summary.count}</p>
                  <p className="text-[9px] text-muted-foreground">Avg score: {summary.avg_score}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs: Matrix / Ranked List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="matrix" className="text-xs gap-1"><LayoutGrid className="h-3 w-3" /> Quadrant View</TabsTrigger>
          <TabsTrigger value="ranked" className="text-xs gap-1"><Filter className="h-3 w-3" /> Ranked List</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-3 space-y-4">
          {(['quick_wins', 'strategic_bets', 'fill_ins', 'deprioritize'] as Quadrant[]).map((q, i) => {
            const meta = QUADRANT_META[q];
            const items = data.features.filter(f => f.quadrant === q);
            const Icon = meta.icon;
            if (items.length === 0) return null;
            return (
              <motion.div key={q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-4 w-4', meta.color)} />
                  <h2 className="text-sm font-bold text-foreground">{meta.label}</h2>
                  <span className="text-[10px] text-muted-foreground">— {meta.description}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map(f => (
                    <FeatureCard key={f.id} feature={f} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="ranked" className="mt-3">
          <Card className="border-border/40">
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {data.features.map((f, i) => (
                  <RankedRow key={f.id} feature={f} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeatureCard({ feature }: { feature: PrioritizedFeature }) {
  const meta = QUADRANT_META[feature.quadrant];
  const status = STATUS_CONFIG[feature.status];
  const StatusIcon = status.icon;

  return (
    <Card className={cn('border-border/40', meta.border, 'bg-card/50')}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-foreground">{feature.name}</span>
              <Badge variant="outline" className="text-[8px] h-3.5 bg-muted/20">{feature.category}</Badge>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{feature.description}</p>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="text-lg font-bold text-foreground">{feature.priority_score}</p>
            <p className="text-[8px] text-muted-foreground">SCORE</p>
          </div>
        </div>

        {/* Bars */}
        <div className="space-y-1.5 mb-2">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-muted-foreground">Impact</span>
              <span className="text-[9px] font-medium text-foreground">{feature.impact}</span>
            </div>
            <Progress value={feature.impact} className="h-1" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-muted-foreground">Complexity</span>
              <span className="text-[9px] font-medium text-foreground">{feature.complexity}</span>
            </div>
            <Progress value={feature.complexity} className="h-1" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StatusIcon className={cn('h-3 w-3', status.color)} />
            <span className={cn('text-[9px] font-medium', status.color)}>{status.label}</span>
          </div>
          {feature.engagement_signal !== undefined && (
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <ArrowUpRight className="h-2.5 w-2.5" />
              {feature.engagement_signal.toLocaleString()} signals
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RankedRow({ feature, rank }: { feature: PrioritizedFeature; rank: number }) {
  const meta = QUADRANT_META[feature.quadrant];
  const status = STATUS_CONFIG[feature.status];
  const StatusIcon = status.icon;
  const QuadIcon = meta.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">#{rank}</span>
      <div className={cn('h-7 w-7 rounded-md flex items-center justify-center shrink-0', meta.bg)}>
        <QuadIcon className={cn('h-3.5 w-3.5', meta.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-foreground truncate">{feature.name}</span>
          <Badge variant="outline" className="text-[8px] h-3.5 bg-muted/20 shrink-0">{feature.category}</Badge>
        </div>
        <p className="text-[9px] text-muted-foreground truncate">{feature.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-center hidden sm:block">
          <p className="text-[9px] text-muted-foreground">Impact</p>
          <p className="text-xs font-bold text-foreground">{feature.impact}</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="text-[9px] text-muted-foreground">Cmplx</p>
          <p className="text-xs font-bold text-foreground">{feature.complexity}</p>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon className={cn('h-3 w-3', status.color)} />
          <span className={cn('text-[9px] font-medium', status.color)}>{status.label}</span>
        </div>
        <p className="text-sm font-bold text-foreground w-8 text-right">{feature.priority_score}</p>
      </div>
    </div>
  );
}
