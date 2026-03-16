import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActionRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  onClick: () => void;
  urgent?: boolean;
}

const ActionRow = React.memo(function ActionRow({ icon: Icon, label, count, onClick, urgent }: ActionRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
        urgent ? 'bg-chart-3/10 hover:bg-chart-3/20 border border-chart-3/30' : 'hover:bg-muted/50 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${urgent ? 'text-chart-3' : 'text-muted-foreground'}`} />
        <span className="text-xs">{label}</span>
      </div>
      <Badge variant={urgent ? 'destructive' : 'secondary'} className="text-[10px] h-5 px-2">
        {count}
      </Badge>
    </button>
  );
});

export default ActionRow;
