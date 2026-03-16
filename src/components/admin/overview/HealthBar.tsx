import React from 'react';

interface HealthBarProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isStatus?: boolean;
}

const HealthBar = React.memo(function HealthBar({ label, value, icon: Icon, isStatus }: HealthBarProps) {
  const getColor = (val: number) => {
    if (isStatus) return val === 100 ? 'bg-chart-1' : 'bg-chart-3';
    if (val >= 70) return 'bg-chart-1';
    if (val >= 40) return 'bg-chart-3';
    return 'bg-destructive';
  };

  const getTextColor = (val: number) => {
    if (isStatus) return val === 100 ? 'text-chart-1' : 'text-chart-3';
    if (val >= 70) return 'text-chart-1';
    if (val >= 40) return 'text-chart-3';
    return 'text-destructive';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-foreground">{label}</span>
        </div>
        <span className={`text-[11px] font-semibold ${getTextColor(value)}`}>
          {isStatus ? (value === 100 ? '✓ OK' : '⚠ Error') : `${value}%`}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} health: ${value}%`}>
        <div className={`h-full ${getColor(value)} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
});

export default HealthBar;
