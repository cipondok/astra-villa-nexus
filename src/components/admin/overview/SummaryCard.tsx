import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

const colors = {
  green: 'text-chart-1 bg-chart-1/10',
  blue: 'text-chart-2 bg-chart-2/10',
  purple: 'text-primary bg-primary/10',
  orange: 'text-chart-3 bg-chart-3/10',
};

const SummaryCard = React.memo(function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-border/30 p-2.5 text-center">
      <Icon className={`h-4 w-4 mx-auto ${colors[color].split(' ')[0]}`} />
      <div className="text-sm font-bold mt-1">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
});

export default SummaryCard;
