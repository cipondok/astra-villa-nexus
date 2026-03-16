import React from 'react';
import Sparkline from './Sparkline';

interface MetricRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading?: boolean;
  highlight?: boolean;
  sparkData?: number[];
}

const MetricRow = React.memo(function MetricRow({ icon: Icon, label, value, loading, highlight, sparkData }: MetricRowProps) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-1 rounded-md ${highlight ? 'bg-chart-1/5' : 'hover:bg-muted/30'} transition-colors`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-chart-1' : 'text-muted-foreground'}`} />
        <span className="text-xs text-foreground">{label}</span>
      </div>
      {loading ? (
        <div className="h-4 w-10 bg-muted animate-pulse rounded" />
      ) : (
        <div className="flex items-center gap-1">
          {sparkData && <Sparkline data={sparkData} color={highlight ? 'hsl(var(--chart-1))' : 'hsl(var(--primary))'} />}
          <span className={`text-sm font-bold tabular-nums ${highlight ? 'text-chart-1' : 'text-foreground'}`}>{value.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
});

export default MetricRow;
