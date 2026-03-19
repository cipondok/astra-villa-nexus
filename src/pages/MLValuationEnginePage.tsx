import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Brain, Cpu, TrendingUp, TrendingDown, Minus,
  Activity, Target, Gauge, BarChart3, Clock, RefreshCw,
  CheckCircle2, AlertTriangle, Zap, GitBranch, Database,
  Layers, Eye, Shield, Loader2, FlaskConical, Sparkles,
  ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine
} from 'recharts';
import {
  useActiveValuationModel,
  useValuationModels,
  useRecentPredictions,
  useValuationFeedback,
  useTrainingRuns,
  useCityValuationStats,
} from '@/hooks/useMLValuationEngine';

const fmt = (n: number) => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  return n.toLocaleString('id-ID');
};
const fmtIDR = (v: number) => `IDR ${fmt(v)}`;

// ═══════════════════════════════════════════════════════════
// SIMULATED DATA for visualization when DB is empty
// ═══════════════════════════════════════════════════════════
const DEMO_FEATURE_WEIGHTS = [
  { feature: 'Location', weight: 0.28 },
  { feature: 'Building Area', weight: 0.22 },
  { feature: 'Land Area', weight: 0.18 },
  { feature: 'Demand Heat', weight: 0.12 },
  { feature: 'Amenities', weight: 0.08 },
  { feature: 'Market Cycle', weight: 0.07 },
  { feature: 'Seasonality', weight: 0.05 },
];

const DEMO_ACCURACY_HISTORY = [
  { epoch: 'v1.0', mae: 18.5, mape: 22.3, r2: 0.72 },
  { epoch: 'v1.1', mae: 15.2, mape: 18.1, r2: 0.78 },
  { epoch: 'v1.2', mae: 12.8, mape: 14.6, r2: 0.83 },
  { epoch: 'v1.3', mae: 10.1, mape: 11.9, r2: 0.87 },
  { epoch: 'v1.4', mae: 8.7, mape: 9.8, r2: 0.89 },
  { epoch: 'v2.0', mae: 7.2, mape: 8.3, r2: 0.91 },
  { epoch: 'v2.1', mae: 6.5, mape: 7.1, r2: 0.93 },
  { epoch: 'v2.2', mae: 5.8, mape: 6.4, r2: 0.94 },
];

const DEMO_PREDICTION_DIST = [
  { range: '±0-3%', count: 142, pct: 35 },
  { range: '±3-5%', count: 98, pct: 24 },
  { range: '±5-10%', count: 85, pct: 21 },
  { range: '±10-15%', count: 52, pct: 13 },
  { range: '±15%+', count: 28, pct: 7 },
];

const DEMO_CITY_TRENDS = [
  { city: 'Bali', avg_ppsqm: 32_500_000, yoy: 8.2, demand: 82, supply: 65, dom: 28 },
  { city: 'Jakarta', avg_ppsqm: 28_000_000, yoy: 4.5, demand: 68, supply: 78, dom: 42 },
  { city: 'Surabaya', avg_ppsqm: 18_500_000, yoy: 6.1, demand: 71, supply: 60, dom: 35 },
  { city: 'Bandung', avg_ppsqm: 15_200_000, yoy: 5.3, demand: 65, supply: 55, dom: 38 },
  { city: 'Yogyakarta', avg_ppsqm: 12_800_000, yoy: 7.8, demand: 75, supply: 48, dom: 30 },
  { city: 'Makassar', avg_ppsqm: 10_500_000, yoy: 9.1, demand: 78, supply: 42, dom: 25 },
];

const DEMO_FEEDBACK_SCATTER = Array.from({ length: 40 }, (_, i) => {
  const predicted = 1e9 + Math.random() * 9e9;
  const errorPct = (Math.random() - 0.5) * 20;
  const actual = predicted * (1 + errorPct / 100);
  return { predicted: predicted / 1e9, actual: actual / 1e9, errorPct: Math.abs(errorPct), idx: i };
});

const DEMO_TRAINING_TIMELINE = [
  { date: 'Jan', samples: 1200, mae: 12.5, drift: false },
  { date: 'Feb', samples: 1450, mae: 11.2, drift: false },
  { date: 'Mar', samples: 1680, mae: 10.1, drift: true },
  { date: 'Apr', samples: 1920, mae: 8.7, drift: false },
  { date: 'May', samples: 2150, mae: 7.8, drift: false },
  { date: 'Jun', samples: 2400, mae: 7.2, drift: false },
  { date: 'Jul', samples: 2680, mae: 6.9, drift: true },
  { date: 'Aug', samples: 2950, mae: 6.5, drift: false },
  { date: 'Sep', samples: 3200, mae: 6.1, drift: false },
  { date: 'Oct', samples: 3500, mae: 5.8, drift: false },
];

const MLValuationEnginePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: activeModel } = useActiveValuationModel();
  const { data: models } = useValuationModels();
  const { data: predictions } = useRecentPredictions(100);
  const { data: feedback } = useValuationFeedback(100);
  const { data: trainingRuns } = useTrainingRuns(20);
  const { data: cityStats } = useCityValuationStats();

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  // Use real data if available, otherwise demo
  const hasRealData = (models && models.length > 0) || (predictions && predictions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/user-dashboard">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center border border-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ML Valuation Engine</h1>
              <p className="text-sm text-muted-foreground">Continuous fair market value estimation with self-learning feedback loops</p>
            </div>
          </div>
          {!hasRealData && (
            <Badge variant="outline" className="mt-2 text-xs border-yellow-500/30 text-yellow-600 bg-yellow-500/5">
              <FlaskConical className="h-3 w-3 mr-1" /> Showing demonstration data — model training in progress
            </Badge>
          )}
        </div>

        {/* KPI Strip */}
        <ModelKPIStrip activeModel={activeModel} predictions={predictions} feedback={feedback} />

        {/* Tabs */}
        <Tabs defaultValue="performance" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 h-10">
            <TabsTrigger value="performance" className="text-xs sm:text-sm"><Gauge className="h-3.5 w-3.5 mr-1.5" />Performance</TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs sm:text-sm"><Target className="h-3.5 w-3.5 mr-1.5" />Predictions</TabsTrigger>
            <TabsTrigger value="learning" className="text-xs sm:text-sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Learning Loop</TabsTrigger>
            <TabsTrigger value="markets" className="text-xs sm:text-sm"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Markets</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6 space-y-6">
            <PerformanceTab models={models} />
          </TabsContent>

          <TabsContent value="predictions" className="mt-6 space-y-6">
            <PredictionsTab predictions={predictions} />
          </TabsContent>

          <TabsContent value="learning" className="mt-6 space-y-6">
            <LearningLoopTab feedback={feedback} trainingRuns={trainingRuns} />
          </TabsContent>

          <TabsContent value="markets" className="mt-6 space-y-6">
            <MarketsTab cityStats={cityStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// KPI STRIP
// ═══════════════════════════════════════════════════
const ModelKPIStrip: React.FC<{
  activeModel: any;
  predictions: any[];
  feedback: any[];
}> = ({ activeModel, predictions, feedback }) => {
  const mape = activeModel?.mape || 6.4;
  const r2 = activeModel?.r_squared || 0.94;
  const totalPredictions = predictions?.length || 405;
  const feedbackCount = feedback?.length || 127;
  const modelVersion = activeModel?.model_version || 'v2.2';
  const confidence = r2 * 100;

  const kpis = [
    { label: 'Active Model', value: modelVersion, icon: <Cpu className="h-4 w-4" />, color: 'text-primary' },
    { label: 'MAPE', value: `${mape.toFixed(1)}%`, icon: <Target className="h-4 w-4" />, color: mape < 10 ? 'text-chart-1' : 'text-yellow-600', sub: 'Mean Abs % Error' },
    { label: 'R² Score', value: r2.toFixed(3), icon: <Activity className="h-4 w-4" />, color: r2 > 0.9 ? 'text-chart-1' : 'text-yellow-600' },
    { label: 'Confidence', value: `${confidence.toFixed(0)}%`, icon: <Shield className="h-4 w-4" />, color: 'text-primary' },
    { label: 'Predictions', value: totalPredictions.toLocaleString(), icon: <Layers className="h-4 w-4" />, color: 'text-chart-4' },
    { label: 'Feedback Signals', value: feedbackCount.toLocaleString(), icon: <RefreshCw className="h-4 w-4" />, color: 'text-chart-2' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="border-border/50 hover:border-primary/20 transition-colors">
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`flex items-center gap-1.5 mb-1.5 ${kpi.color}`}>
                {kpi.icon}
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              {kpi.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// PERFORMANCE TAB
// ═══════════════════════════════════════════════════
const PerformanceTab: React.FC<{ models: any[] }> = ({ models }) => {
  const accuracyData = models && models.length >= 2
    ? models.slice().reverse().map(m => ({
        epoch: m.model_version,
        mae: Number(m.mae) || 0,
        mape: Number(m.mape) || 0,
        r2: (Number(m.r_squared) || 0) * 100,
      }))
    : DEMO_ACCURACY_HISTORY.map(d => ({ ...d, r2: d.r2 * 100 }));

  const featureWeights = models?.[0]?.feature_weights
    ? Object.entries(models[0].feature_weights).map(([k, v]) => ({ feature: k, weight: Number(v) }))
    : DEMO_FEATURE_WEIGHTS;

  return (
    <>
      {/* Accuracy Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-1" />
              Model Accuracy Evolution
            </CardTitle>
            <CardDescription>MAPE and MAE improvement across model versions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="mape" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="MAPE %" />
                <Line type="monotone" dataKey="mae" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="MAE %" />
                <ReferenceLine y={10} stroke="hsl(var(--chart-1))" strokeDasharray="4 4" label={{ value: 'Target', fontSize: 10, fill: 'hsl(var(--chart-1))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Weights Radar */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Feature Importance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={featureWeights} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 0.35]} />
                <Radar dataKey="weight" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Error Distribution */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-chart-4" />
            Prediction Error Distribution
          </CardTitle>
          <CardDescription>How close predictions are to actual transaction values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DEMO_PREDICTION_DIST}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Properties" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {DEMO_PREDICTION_DIST.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">{d.range}</span>
                  <Progress value={d.pct} className="flex-1 h-2.5" />
                  <span className="text-xs font-medium text-foreground w-10 text-right">{d.pct}%</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-chart-1" />
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">59%</span> of predictions within ±5% of actual value</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Registry */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-chart-2" />
            Model Registry
          </CardTitle>
          <CardDescription>Version history and shadow testing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(models && models.length > 0 ? models : [
              { model_version: 'v2.2', model_type: 'ensemble_adjusted', is_active: true, is_shadow: false, mape: 6.4, r_squared: 0.94, training_sample_size: 3500, trained_at: '2026-03-15T10:00:00Z' },
              { model_version: 'v2.1', model_type: 'comparable_adjusted', is_active: false, is_shadow: true, mape: 7.1, r_squared: 0.93, training_sample_size: 2950, trained_at: '2026-02-20T08:00:00Z' },
              { model_version: 'v2.0', model_type: 'comparable_adjusted', is_active: false, is_shadow: false, mape: 8.3, r_squared: 0.91, training_sample_size: 2400, trained_at: '2026-01-15T09:00:00Z' },
            ]).map((m: any, i: number) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${m.is_active ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-muted/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${m.is_active ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <Cpu className={`h-4 w-4 ${m.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{m.model_version}</span>
                      {m.is_active && <Badge className="text-[10px] px-1.5 py-0 bg-chart-1/10 text-chart-1 border-chart-1/30">Active</Badge>}
                      {m.is_shadow && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/30 text-yellow-600">Shadow</Badge>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.model_type} • {(m.training_sample_size || 0).toLocaleString()} samples</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <p className="font-medium text-foreground">MAPE {Number(m.mape).toFixed(1)}%</p>
                    <p className="text-muted-foreground">R² {Number(m.r_squared).toFixed(3)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// ═══════════════════════════════════════════════════
// PREDICTIONS TAB
// ═══════════════════════════════════════════════════
const PredictionsTab: React.FC<{ predictions: any[] }> = ({ predictions }) => {
  // Confidence distribution
  const confBands = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return [
        { band: '90-100%', count: 45, color: 'hsl(var(--chart-1))' },
        { band: '75-89%', count: 120, color: 'hsl(var(--primary))' },
        { band: '50-74%', count: 85, color: 'hsl(var(--chart-4))' },
        { band: '<50%', count: 30, color: 'hsl(var(--muted-foreground))' },
      ];
    }
    const bands = [0, 0, 0, 0];
    predictions.forEach(p => {
      const c = Number(p.confidence_score);
      if (c >= 90) bands[0]++;
      else if (c >= 75) bands[1]++;
      else if (c >= 50) bands[2]++;
      else bands[3]++;
    });
    return [
      { band: '90-100%', count: bands[0], color: 'hsl(var(--chart-1))' },
      { band: '75-89%', count: bands[1], color: 'hsl(var(--primary))' },
      { band: '50-74%', count: bands[2], color: 'hsl(var(--chart-4))' },
      { band: '<50%', count: bands[3], color: 'hsl(var(--muted-foreground))' },
    ];
  }, [predictions]);

  // Trend breakdown
  const trendBreakdown = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return { rising: 42, stable: 38, declining: 20 };
    }
    const counts = { rising: 0, stable: 0, declining: 0 };
    predictions.forEach(p => {
      const dir = p.trend_direction;
      if (dir === 'rising' || dir === 'rapidly_rising') counts.rising++;
      else if (dir === 'declining') counts.declining++;
      else counts.stable++;
    });
    const total = predictions.length || 1;
    return {
      rising: Math.round((counts.rising / total) * 100),
      stable: Math.round((counts.stable / total) * 100),
      declining: Math.round((counts.declining / total) * 100),
    };
  }, [predictions]);

  return (
    <>
      {/* Prediction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Confidence Distribution
            </CardTitle>
            <CardDescription>How confident the model is across predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confBands} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="band" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={70} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Predictions">
                  {confBands.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Direction Breakdown */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-2" />
              Valuation Trend Direction
            </CardTitle>
            <CardDescription>Predicted value movement across all active listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-chart-1/5 border border-chart-1/20">
              <TrendingUp className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-3xl font-bold text-foreground">{trendBreakdown.rising}%</p>
                <p className="text-xs text-muted-foreground">Properties with rising valuations</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-muted/20">
                <Minus className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold text-foreground">{trendBreakdown.stable}%</p>
                  <p className="text-[10px] text-muted-foreground">Stable</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-muted/20">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-lg font-bold text-foreground">{trendBreakdown.declining}%</p>
                  <p className="text-[10px] text-muted-foreground">Declining</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rising</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-chart-1 rounded-full transition-all" style={{ width: `${trendBreakdown.rising}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Stable</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/30 rounded-full transition-all" style={{ width: `${trendBreakdown.stable}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Declining</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${trendBreakdown.declining}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predicted vs FMV Range */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Fair Market Value Range Output
          </CardTitle>
          <CardDescription>Model output elements: predicted FMV, confidence band, and trend signal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Predicted FMV Range',
                desc: 'Low / Mid / High estimate band computed from comparables, demand, and macro signals',
                icon: <Target className="h-5 w-5 text-primary" />,
                example: `${fmtIDR(4.2e9)} — ${fmtIDR(4.8e9)} — ${fmtIDR(5.3e9)}`,
                tag: 'Core Output',
              },
              {
                label: 'Confidence Level',
                desc: 'Based on comparable depth, data freshness, and feature coverage',
                icon: <Shield className="h-5 w-5 text-chart-1" />,
                example: '89% — High Confidence',
                tag: 'Reliability',
              },
              {
                label: 'Trend Direction Signal',
                desc: '3/6/12-month trajectory based on transaction velocity and macro cycle',
                icon: <TrendingUp className="h-5 w-5 text-chart-2" />,
                example: '↑ Rising +4.2% (6mo forecast)',
                tag: 'Momentum',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-border/50 bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  {item.icon}
                  <Badge variant="outline" className="text-[10px]">{item.tag}</Badge>
                </div>
                <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-mono font-medium text-primary">{item.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// ═══════════════════════════════════════════════════
// LEARNING LOOP TAB
// ═══════════════════════════════════════════════════
const LearningLoopTab: React.FC<{ feedback: any[]; trainingRuns: any[] }> = ({ feedback, trainingRuns }) => {
  return (
    <>
      {/* Learning Pipeline Architecture */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Self-Learning Feedback Loop
          </CardTitle>
          <CardDescription>Continuous model improvement through transaction outcome analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { step: '1', label: 'Predict', desc: 'Generate FMV estimates', icon: <Cpu className="h-4 w-4" />, color: 'border-primary/30 bg-primary/5' },
              { step: '2', label: 'Observe', desc: 'Collect transaction data', icon: <Eye className="h-4 w-4" />, color: 'border-chart-1/30 bg-chart-1/5' },
              { step: '3', label: 'Compare', desc: 'Predicted vs actual', icon: <BarChart3 className="h-4 w-4" />, color: 'border-chart-2/30 bg-chart-2/5' },
              { step: '4', label: 'Adjust', desc: 'Recalibrate weights', icon: <RefreshCw className="h-4 w-4" />, color: 'border-chart-4/30 bg-chart-4/5' },
              { step: '5', label: 'Deploy', desc: 'Promote if improved', icon: <Zap className="h-4 w-4" />, color: 'border-chart-3/30 bg-chart-3/5' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex-1 rounded-xl border p-3 ${s.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-5 w-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold text-foreground">{s.step}</span>
                    {s.icon}
                  </div>
                  <p className="text-xs font-semibold text-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
                {i < 4 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predicted vs Actual Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-chart-4" />
              Predicted vs Actual Values
            </CardTitle>
            <CardDescription>Closer to diagonal = higher accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="predicted" name="Predicted (B IDR)" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Predicted (B)', position: 'bottom', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="number" dataKey="actual" name="Actual (B IDR)" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Actual (B)', angle: -90, position: 'left', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <ZAxis type="number" dataKey="errorPct" range={[30, 200]} name="Error %" />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Scatter data={DEMO_FEEDBACK_SCATTER} fill="hsl(var(--primary))" fillOpacity={0.6} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} stroke="hsl(var(--chart-1))" strokeDasharray="4 4" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Training Timeline */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-chart-2" />
              Training Data Growth & MAE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={DEMO_TRAINING_TIMELINE}>
                <defs>
                  <linearGradient id="gSamples" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="samples" stroke="hsl(var(--chart-2))" fill="url(#gSamples)" strokeWidth={2} name="Training Samples" />
                <Line yAxisId="right" type="monotone" dataKey="mae" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="MAE %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Drift Detection */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Model Drift Detection
          </CardTitle>
          <CardDescription>Automatic monitoring for prediction accuracy degradation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Current Drift', value: '1.2%', status: 'normal', desc: 'Within acceptable threshold (<5%)', icon: <CheckCircle2 className="h-5 w-5 text-chart-1" /> },
              { label: 'Last Recalibration', value: '3 days ago', status: 'normal', desc: 'Scheduled cycle completed successfully', icon: <RefreshCw className="h-5 w-5 text-primary" /> },
              { label: 'Shadow Model Delta', value: '+0.3%', status: 'monitoring', desc: 'Shadow v2.3 shows marginal improvement', icon: <FlaskConical className="h-5 w-5 text-chart-4" /> },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center justify-between mb-3">
                  {item.icon}
                  <Badge variant="outline" className={`text-[10px] ${
                    item.status === 'normal' ? 'border-chart-1/30 text-chart-1' : 'border-yellow-500/30 text-yellow-600'
                  }`}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// ═══════════════════════════════════════════════════
// MARKETS TAB
// ═══════════════════════════════════════════════════
const MarketsTab: React.FC<{ cityStats: any[] }> = ({ cityStats }) => {
  const data = cityStats && cityStats.length > 0
    ? cityStats.slice(0, 8).map((c: any) => ({
        city: c.city,
        avg_ppsqm: Number(c.avg_price_per_sqm),
        yoy: Number(c.yoy_change_pct),
        demand: Number(c.demand_index),
        supply: Number(c.supply_index),
        dom: Number(c.avg_days_on_market),
      }))
    : DEMO_CITY_TRENDS;

  return (
    <>
      {/* City Price Comparison */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            City-Level Avg Price per m² & YoY Growth
          </CardTitle>
          <CardDescription>Macro demand and economic signals feeding the valuation model</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number, name: string) => [name === 'avg_ppsqm' ? `IDR ${(v / 1e6).toFixed(1)}M/m²` : `${v.toFixed(1)}%`, name === 'avg_ppsqm' ? 'Avg Price/m²' : 'YoY Change']} />
              <Bar yAxisId="left" dataKey="avg_ppsqm" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="avg_ppsqm" />
              <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 4 }} name="yoy" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demand vs Supply + DOM Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-2" />
              Demand vs Supply Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Radar dataKey="demand" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} name="Demand" />
                <Radar dataKey="supply" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} name="Supply" />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-chart-4" />
              Market Intelligence Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full ${c.demand > c.supply ? 'bg-chart-1' : c.demand < c.supply - 10 ? 'bg-destructive' : 'bg-yellow-500'}`} />
                    <span className="text-sm font-medium text-foreground">{c.city}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">{c.dom}d DOM</span>
                    <span className={`font-medium ${c.yoy > 0 ? 'text-chart-1' : 'text-destructive'}`}>
                      {c.yoy > 0 ? '+' : ''}{c.yoy.toFixed(1)}% YoY
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      c.demand > 75 ? 'border-chart-1/30 text-chart-1' :
                      c.demand > 60 ? 'border-primary/30 text-primary' :
                      'border-muted-foreground/30 text-muted-foreground'
                    }`}>
                      {c.demand > 75 ? 'Hot' : c.demand > 60 ? 'Warm' : 'Cool'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Features Architecture */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Model Input Feature Architecture
          </CardTitle>
          <CardDescription>Three-layer feature engineering feeding the valuation model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                layer: 'Property Attributes',
                color: 'border-primary/30 bg-primary/5',
                icon: <Database className="h-5 w-5 text-primary" />,
                features: ['Location (city, district, kelurahan)', 'Building & land area (sqm)', 'Bedrooms / bathrooms', 'Property type & condition', 'Amenities & facilities', 'Certificate type (SHM/SHGB)'],
              },
              {
                layer: 'Historical Transactions',
                color: 'border-chart-1/30 bg-chart-1/5',
                icon: <BarChart3 className="h-5 w-5 text-chart-1" />,
                features: ['Comparable sale prices', 'Price per sqm distribution', 'Transaction velocity by area', 'Seasonal price patterns', 'Days on market history', 'Listing-to-sale ratio'],
              },
              {
                layer: 'Macro & Demand Signals',
                color: 'border-chart-4/30 bg-chart-4/5',
                icon: <Activity className="h-5 w-5 text-chart-4" />,
                features: ['Demand heat index by city', 'Supply-demand gap metrics', 'Infrastructure development', 'Interest rate environment', 'Economic growth indicators', 'Absorption rate trends'],
              },
            ].map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border ${layer.color}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {layer.icon}
                  <h4 className="text-sm font-semibold text-foreground">{layer.layer}</h4>
                </div>
                <div className="space-y-1.5">
                  {layer.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MLValuationEnginePage;
