import React from 'react';
import { useAIReadinessScore } from '@/hooks/useAIHealthMetrics';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain } from 'lucide-react';

const AIReadinessBadge = ({ compact = false }: { compact?: boolean }) => {
  const { data: readiness } = useAIReadinessScore();

  if (!readiness) return null;

  const score = readiness.readiness_score;
  const color = score >= 80 ? 'bg-chart-1/10 text-chart-1 border-chart-1/30' :
                score >= 50 ? 'bg-chart-2/10 text-chart-2 border-chart-2/30' :
                'bg-destructive/10 text-destructive border-destructive/30';
  const label = score >= 80 ? 'Production Ready' : score >= 50 ? 'Partially Ready' : 'Needs Attention';

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`gap-1 text-[10px] px-2 py-0.5 ${color}`}>
              <Brain className="h-3 w-3" />
              {score.toFixed(0)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p className="font-medium">AI Readiness: {score.toFixed(1)}/100</p>
            <p className="text-muted-foreground">{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
      <Brain className="h-4 w-4" />
      <div>
        <p className="text-xs font-bold">{score.toFixed(0)}/100</p>
        <p className="text-[9px] opacity-80">{label}</p>
      </div>
    </div>
  );
};

export default AIReadinessBadge;
