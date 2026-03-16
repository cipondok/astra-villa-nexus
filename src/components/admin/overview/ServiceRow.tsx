import React from 'react';

interface ServiceRowProps {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  detail?: string;
}

const statusConfig = {
  operational: { color: 'bg-chart-1', text: 'text-chart-1', label: 'OK' },
  degraded: { color: 'bg-chart-3', text: 'text-chart-3', label: 'Slow' },
  down: { color: 'bg-destructive', text: 'text-destructive', label: 'Down' },
  unknown: { color: 'bg-muted-foreground', text: 'text-muted-foreground', label: 'N/A' },
};

const ServiceRow = React.memo(function ServiceRow({ name, status, detail }: ServiceRowProps) {
  const cfg = statusConfig[status];
  return (
    <div className="flex items-center justify-between py-1.5 px-1 rounded-md hover:bg-muted/30 transition-colors">
      <span className="text-xs text-foreground">{name}</span>
      <div className="flex items-center gap-1.5">
        {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
        <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
        <span className={`text-[10px] font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>
    </div>
  );
});

export default ServiceRow;
