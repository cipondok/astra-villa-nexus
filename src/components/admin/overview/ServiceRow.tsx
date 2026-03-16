import React from 'react';

interface ServiceRowProps {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  detail?: string;
}

const statusConfig = {
  operational: { color: 'bg-chart-1', text: 'OK' },
  degraded: { color: 'bg-chart-3', text: 'Slow' },
  down: { color: 'bg-destructive', text: 'Down' },
  unknown: { color: 'bg-muted-foreground', text: 'N/A' },
};

const ServiceRow = React.memo(function ServiceRow({ name, status, detail }: ServiceRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs">{name}</span>
      <div className="flex items-center gap-1.5">
        {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
        <div className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
        <span className="text-[10px] text-muted-foreground">{statusConfig[status].text}</span>
      </div>
    </div>
  );
});

export default ServiceRow;
