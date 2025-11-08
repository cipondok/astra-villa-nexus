import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PropertyFilters } from '../search/AdvancedPropertyFilters';

interface TrendingSearch {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  totalSearches: number;
  change: number;
  sparkline: number[];
  filters: Partial<PropertyFilters>;
}

interface TrendingSearchesWidgetProps {
  onSearchClick?: (filters: Partial<PropertyFilters>) => void;
}

export const TrendingSearchesWidget = ({ onSearchClick }: TrendingSearchesWidgetProps) => {
  const [trends, setTrends] = useState<TrendingSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-trending-searches');
        if (error) throw error;
        setTrends(data?.trends || []);
      } catch (error) {
        console.error('Error fetching trending searches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width="60" height="24" className="inline-block">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-background to-primary/5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (trends.length === 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">Trending Searches</h3>
          <p className="text-sm text-muted-foreground">Popular in the last 7 days</p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-accent text-white">
          <Sparkles className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {trends.map((trend, index) => (
          <button
            key={trend.id}
            onClick={() => onSearchClick?.(trend.filters)}
            className="w-full group p-4 rounded-xl border-2 border-border/50 hover:border-primary/40 bg-gradient-to-r from-background to-muted/20 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                {trend.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{trend.title}</span>
                  {trend.change !== 0 && (
                    <Badge 
                      variant={trend.change > 0 ? "default" : "secondary"}
                      className={`text-xs ${
                        trend.change > 0 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}
                    >
                      {trend.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(trend.change)}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{trend.subtitle}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-primary">{renderSparkline(trend.sparkline)}</div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {trend.totalSearches} searches
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
