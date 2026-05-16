import { useState } from 'react';
import { useLearningStats, useTrainModel } from '@/hooks/useSelfLearning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, TrendingUp, Activity, Zap, BarChart3, RefreshCw, CheckCircle2, XCircle, Target, Cpu } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const FACTOR_LABELS: Record<string, string> = {
  location: 'Location', price: 'Price', feature: 'Features',
  investment: 'Investment', popularity: 'Popularity', collaborative: 'Collaborative',
};

const ACTION_CONFIG: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  contact: { color: 'text-emerald-500', label: 'Contact', icon: CheckCircle2 },
  save: { color: 'text-blue-500', label: 'Save', icon: CheckCircle2 },
  visit: { color: 'text-purple-500', label: 'Visit', icon: CheckCircle2 },
  view: { color: 'text-sky-400', label: 'View', icon: Activity },
  ignore: { color: 'text-amber-500', label: 'Ignore', icon: XCircle },
  dismiss: { color: 'text-red-400', label: 'Dismiss', icon: XCircle },
};

const SelfLearningDashboard = () => {
  const { data, isLoading, error, refetch } = useLearningStats();
  const trainModel = useTrainModel();
  const { toast } = useToast();
  const [trainResult, setTrainResult] = useState<any>(null);

  const handleTrain = async () => {
    try {
      const result = await trainModel.mutateAsync();
      setTrainResult(result);
      toast({ title: 'Model trained successfully', description: `Accuracy: ${result.model_metrics.accuracy}% | Confidence: ${result.model_metrics.confidence}%` });
      refetch();
    } catch (err) {
      toast({ title: 'Training failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-6"><CardContent className="p-8 text-center text-muted-foreground">
        <Brain className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Failed to load self-learning data</p>
      </CardContent></Card>
    );
  }

  const { learning_stats: stats, signal_trend, model_evolution, current_weights } = data;

  // Prepare weight radar data
  const weightRadar = current_weights
    ? Object.entries(FACTOR_LABELS).map(([key, label]) => ({
        factor: label,
        weight: Number((current_weights as any)[key]) || 0,
      }))
    : [];

  // Action breakdown for bar chart
  const actionData = Object.entries(stats.action_breakdown).map(([action, count]) => ({
    action: ACTION_CONFIG[action]?.label || action,
    count,
    fill: (ACTION_CONFIG[action]?.color || 'text-muted-foreground').includes('emerald') ? 'hsl(var(--primary))'
      : (ACTION_CONFIG[action]?.color || '').includes('red') ? '#ef4444'
      : (ACTION_CONFIG[action]?.color || '').includes('blue') ? '#3b82f6'
      : (ACTION_CONFIG[action]?.color || '').includes('amber') ? '#f59e0b'
      : (ACTION_CONFIG[action]?.color || '').includes('purple') ? '#8b5cf6'
      : '#64748b',
  })).sort((a, b) => b.count - a.count);

  const accuracyColor = stats.conversion_rate >= 60 ? 'text-emerald-500' : stats.conversion_rate >= 30 ? 'text-amber-500' : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Self-Learning AI System</h2>
            <p className="text-sm text-muted-foreground">Continuously improving from user behavior signals</p>
          </div>
        </div>
        <Button onClick={handleTrain} disabled={trainModel.isPending} className="gap-2">
          {trainModel.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
          {trainModel.isPending ? 'Training…' : 'Train Now'}
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Activity, label: 'Total Signals (30d)', value: stats.total_signals_30d.toLocaleString(), sub: 'Feedback collected' },
          { icon: CheckCircle2, label: 'Positive Signals', value: stats.positive_signals.toLocaleString(), sub: `${stats.conversion_rate}% conversion` },
          { icon: XCircle, label: 'Negative Signals', value: stats.negative_signals.toLocaleString(), sub: 'Ignored/dismissed' },
          { icon: Target, label: 'Avg Match Score', value: stats.avg_match_score.toString(), sub: 'At recommendation time' },
          { icon: TrendingUp, label: 'Conversion Rate', value: `${stats.conversion_rate}%`, sub: accuracyColor.includes('emerald') ? 'Excellent' : accuracyColor.includes('amber') ? 'Moderate' : 'Needs improvement' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="w-4 h-4" /><span className="text-xs">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Trend */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              7-Day Signal Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={signal_trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Positive" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Action Breakdown */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Action Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="action" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                  {actionData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weights Radar */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Current Model Weights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightRadar.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={weightRadar}>
                  <PolarGrid className="stroke-border/30" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <PolarRadiusAxis domain={[0, 35]} tick={false} />
                  <Radar dataKey="weight" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No weights configured</p>
            )}
            {weightRadar.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {weightRadar.map((w) => (
                  <div key={w.factor} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-muted-foreground">{w.factor}</span>
                    <Progress value={w.weight} className="h-1.5 flex-1" />
                    <span className="w-8 text-right text-foreground font-medium">{w.weight}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Evolution */}
        <Card className="lg:col-span-2 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Model Evolution
              <Badge variant="secondary" className="ml-auto">{model_evolution.length} snapshots</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {model_evolution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={model_evolution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => v?.slice(5, 10) || ''} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Accuracy %" />
                  <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Confidence %" />
                  <Line type="monotone" dataKey="positive_ratio" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Positive %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Cpu className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm">No training snapshots yet</p>
                <p className="text-xs mt-1">Click "Train Now" to create the first snapshot</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Training Result */}
      {trainResult && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Latest Training Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Accuracy</p>
                <p className="font-bold text-foreground">{trainResult.model_metrics.accuracy}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Confidence</p>
                <p className="font-bold text-foreground">{trainResult.model_metrics.confidence}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Learning Rate</p>
                <p className="font-bold text-foreground">{trainResult.model_metrics.learning_rate.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data Sufficiency</p>
                <p className="font-bold text-foreground">{trainResult.model_metrics.data_sufficiency}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {Object.entries(trainResult.adjustments).map(([key, val]) => (
                <div key={key} className="text-center bg-muted/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
                  <p className={`text-sm font-bold ${(val as number) > 0 ? 'text-emerald-500' : (val as number) < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {(val as number) > 0 ? '+' : ''}{(val as number).toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SelfLearningDashboard;
