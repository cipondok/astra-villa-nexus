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
      <Card className="p-2 md:p-4 bg-gradient-to-br from-background to-primary/5">
        <div className="animate-pulse space-y-2">
          <div className="h-4 md:h-6 bg-muted rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 md:h-16 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (trends.length === 0) return null;

  return (
    <Card className="p-2 md:p-4 bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 shadow-lg">
      <div className="flex items-center gap-2 mb-2 md:mb-4">
        <div className="p-1.5 md:p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
          <TrendingUp className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs md:text-base font-bold">Trending Searches</h3>
          <p className="text-[9px] md:text-xs text-muted-foreground">Popular in the last 7 days</p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-accent text-white text-[8px] md:text-xs px-1.5 py-0.5">
          <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
          Live
        </Badge>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        {trends.map((trend, index) => (
          <button
            key={trend.id}
            onClick={() => onSearchClick?.(trend.filters)}
            className="w-full group p-2 md:p-3 rounded-lg border border-border/50 hover:border-primary/40 bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-lg md:text-2xl group-hover:scale-110 transition-transform">
                {trend.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-[10px] md:text-sm">{trend.title}</span>
                  {trend.change !== 0 && (
                    <Badge 
                      variant={trend.change > 0 ? "default" : "secondary"}
                      className={`text-[8px] md:text-[10px] px-1 py-0 ${
                        trend.change > 0 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}
                    >
                      {trend.change > 0 ? <TrendingUp className="h-2 w-2 md:h-2.5 md:w-2.5" /> : <TrendingDown className="h-2 w-2 md:h-2.5 md:w-2.5" />}
                      {Math.abs(trend.change)}%
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] md:text-xs text-muted-foreground line-clamp-1">{trend.subtitle}</p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-primary">{renderSparkline(trend.sparkline)}</div>
                <span className="text-[9px] md:text-xs font-medium text-muted-foreground">
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
