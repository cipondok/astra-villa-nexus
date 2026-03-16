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
    <div className={`flex items-center justify-between py-1 ${highlight ? 'text-chart-1' : ''}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs">{label}</span>
      </div>
      {loading ? (
        <div className="h-4 w-10 bg-muted animate-pulse rounded" />
      ) : (
        <div className="flex items-center">
          {sparkData && <Sparkline data={sparkData} color={highlight ? 'hsl(var(--chart-1))' : 'hsl(var(--primary))'} />}
          <span className="text-sm font-black tabular-nums">{value.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
});

export default MetricRow;
