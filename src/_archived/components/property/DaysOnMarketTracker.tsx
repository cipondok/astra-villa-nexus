import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, BarChart3, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DOMData {
  estimated_days_on_market: number;
  speed_category: string;
  confidence_score: number;
  factors: {
    price_position: string;
    engagement_level: string;
    competition_level: string;
    investment_score: number;
  };
  actual_dom_stats: {
    sample_size: number;
    average: number;
    median: number;
    min: number;
    max: number;
    prediction_accuracy: number | null;
  } | null;
  current_dom_info: {
    listed_at: string;
    sold_at: string | null;
    days_active: number;
    is_sold: boolean;
  } | null;
}

interface DaysOnMarketTrackerProps {
  propertyId: string;
}

const DaysOnMarketTracker = ({ propertyId }: DaysOnMarketTrackerProps) => {
  const [data, setData] = useState<DOMData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDOM = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch(
          `https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/core-engine`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk',
            },
            body: JSON.stringify({ property_id: propertyId, mode: 'days_to_sell_prediction' }),
          }
        );
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error('DOM tracker error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchDOM();
  }, [propertyId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing days on market...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const speedColor = (cat: string) => {
    switch (cat) {
      case 'very fast': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'fast': return 'bg-chart-1/15 text-chart-1 border-chart-1/30';
      case 'moderate': return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-destructive/15 text-destructive border-destructive/30';
    }
  };

  const accuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (acc >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-destructive';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Days on Market Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prediction */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight">{data.estimated_days_on_market}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Predicted days to sell</p>
          </div>
          <div className="text-right space-y-1">
            <Badge variant="outline" className={speedColor(data.speed_category)}>
              {data.speed_category}
            </Badge>
            <p className="text-xs text-muted-foreground">{data.confidence_score}% confidence</p>
          </div>
        </div>

        {/* Current DOM (if listed) */}
        {data.current_dom_info && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                {data.current_dom_info.is_sold ? 'Final Days on Market' : 'Active Days on Market'}
              </span>
              <span className="text-sm font-bold">
                {data.current_dom_info.days_active} days
              </span>
            </div>
            <Progress
              value={Math.min(100, (data.current_dom_info.days_active / data.estimated_days_on_market) * 100)}
              className="h-1.5"
            />
            <p className="text-[10px] text-muted-foreground">
              Listed {new Date(data.current_dom_info.listed_at).toLocaleDateString()}
              {data.current_dom_info.is_sold && data.current_dom_info.sold_at &&
                ` • Sold ${new Date(data.current_dom_info.sold_at).toLocaleDateString()}`
              }
            </p>
          </div>
        )}

        {/* Market Stats (actual sold data) */}
        {data.actual_dom_stats && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Market Average ({data.actual_dom_stats.sample_size} sold properties)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Avg', value: data.actual_dom_stats.average },
                { label: 'Median', value: data.actual_dom_stats.median },
                { label: 'Min', value: data.actual_dom_stats.min },
                { label: 'Max', value: data.actual_dom_stats.max },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-md border bg-background p-1.5">
                  <p className="text-sm font-semibold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {data.actual_dom_stats.prediction_accuracy !== null && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Model accuracy:</span>
                <span className={`text-xs font-semibold ${accuracyColor(data.actual_dom_stats.prediction_accuracy)}`}>
                  {data.actual_dom_stats.prediction_accuracy}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Factors */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { label: 'Price Position', value: data.factors.price_position },
            { label: 'Engagement', value: data.factors.engagement_level },
            { label: 'Competition', value: data.factors.competition_level },
            { label: 'Investment Score', value: data.factors.investment_score },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-medium capitalize">{f.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DaysOnMarketTracker;
