import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutcomeTracking } from '@/hooks/useOutcomeTracking';
import { useModelExperiments } from '@/hooks/useModelExperiments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Target, Activity, Zap, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ContinuousLearningDashboard = () => {
  const { stats, isLoading: outcomeLoading } = useOutcomeTracking();
  const { experiments } = useModelExperiments();
  const [isTraining, setIsTraining] = useState(false);

  const trainingHistory = useQuery({
    queryKey: ['training-history'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('continuous-learning', {
        body: { mode: 'stats' },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60_000,
  });

  const triggerTraining = async () => {
    setIsTraining(true);
    try {
      const { data, error } = await supabase.functions.invoke('continuous-learning', {
        body: { mode: 'train', trigger: 'manual' },
      });
      if (error) throw error;
      toast.success(`Training complete — ${data.samples} samples, ${data.accuracy.toFixed(1)}% accuracy`);
      trainingHistory.refetch();
    } catch (err) {
      toast.error('Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const runs = trainingHistory.data?.training_runs || [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Continuous Learning Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Self-improving AI recommendation system</p>
        </div>
        <Button onClick={triggerTraining} disabled={isTraining} size="sm">
          <Zap className="h-4 w-4 mr-1" />
          {isTraining ? 'Training...' : 'Train Now'}
        </Button>
      </div>

      {/* Outcome Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Investments', value: stats?.totalInvestments ?? 0, icon: BarChart3 },
          { label: 'Pred. ROI', value: `${stats?.avgPredictedRoi ?? 0}%`, icon: Target },
          { label: 'Actual ROI', value: `${stats?.avgActualRoi ?? 0}%`, icon: TrendingUp },
          { label: 'Accuracy', value: `${stats?.predictionAccuracy ?? 0}%`, icon: Brain },
          { label: 'Success Rate', value: `${stats?.successRate ?? 0}%`, icon: Activity },
          { label: 'Total P/L', value: `$${((stats?.totalProfitLoss ?? 0) / 1000).toFixed(0)}K`, icon: Zap },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <m.icon className="h-3.5 w-3.5" /> {m.label}
              </div>
              <div className="text-lg font-bold text-foreground">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Training History */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Training History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {runs.length === 0 && <p className="text-muted-foreground text-sm">No training runs yet</p>}
            {runs.map((run: any) => (
              <div key={run.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg text-sm">
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{run.model_version}</span>
                  <div className="flex gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">{run.training_samples} samples</Badge>
                    <Badge variant={run.status === 'completed' ? 'default' : 'destructive'} className="text-xs">
                      {run.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{run.accuracy?.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">{run.trigger_type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Model Experiments */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Model Experiments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {experiments.length === 0 && <p className="text-muted-foreground text-sm">No active experiments</p>}
            {experiments.map((exp) => {
              const champRate = exp.champion_impressions > 0
                ? (exp.champion_conversions / exp.champion_impressions * 100).toFixed(1) : '0';
              const challRate = exp.challenger_impressions > 0
                ? (exp.challenger_conversions / exp.challenger_impressions * 100).toFixed(1) : '0';
              return (
                <div key={exp.id} className="p-3 bg-muted/30 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{exp.experiment_name}</span>
                    <Badge>{exp.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-background rounded">
                      <div className="text-muted-foreground">Champion ({exp.champion_version})</div>
                      <div className="font-bold">{champRate}% conv</div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="text-muted-foreground">Challenger ({exp.challenger_version})</div>
                      <div className="font-bold">{challRate}% conv</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Latest Weights */}
      {runs.length > 0 && runs[0].new_weights && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Model Weights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(runs[0].new_weights as Record<string, number>).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg">
                  <span className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-mono font-bold text-sm">{(val * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContinuousLearningDashboard;
