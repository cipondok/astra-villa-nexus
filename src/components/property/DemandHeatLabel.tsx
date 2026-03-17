import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Minus, Snowflake } from 'lucide-react';

interface DemandHeatLabelProps {
  score: number | null;
  compact?: boolean;
}

const DemandHeatLabel = ({ score, compact = false }: DemandHeatLabelProps) => {
  if (score == null) return null;

  let label: string;
  let icon: React.ReactNode;
  let variant: string;

  if (score >= 80) {
    label = compact ? '🔥' : '🔥 Hot';
    icon = <Flame className="h-3 w-3" />;
    variant = 'bg-destructive/15 text-destructive border-destructive/20';
  } else if (score >= 60) {
    label = compact ? '📈' : '📈 Growing';
    icon = <TrendingUp className="h-3 w-3" />;
    variant = 'bg-chart-4/15 text-chart-4 border-chart-4/20';
  } else if (score >= 30) {
    label = compact ? '➖' : '➖ Stable';
    icon = <Minus className="h-3 w-3" />;
    variant = 'bg-muted text-muted-foreground border-border/40';
  } else {
    label = compact ? '❄️' : '❄️ Cool';
    icon = <Snowflake className="h-3 w-3" />;
    variant = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${variant}`}
    >
      {label}
    </Badge>
  );
};

export default DemandHeatLabel;
