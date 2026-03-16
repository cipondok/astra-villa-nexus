import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

const colors = {
  green: { icon: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20' },
  blue: { icon: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/20' },
  purple: { icon: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  orange: { icon: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20' },
};

const SummaryCard = React.memo(function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
  const c = colors[color];
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-2.5 text-center`}>
      <Icon className={`h-4 w-4 mx-auto ${c.icon}`} />
      <div className="text-sm font-bold mt-1 text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
});

export default SummaryCard;
