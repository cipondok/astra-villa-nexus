import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyInsight } from '@/hooks/useInvestorCopilot';
import { Brain, ShieldAlert, Clock, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  propertyId: string;
}

const RECOMMENDATION_CONFIG: Record<string, { label: string; emoji: string; className: string }> = {
  strong: { label: 'Strong Buy', emoji: '🟢', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  moderate: { label: 'Moderate', emoji: '🟡', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  avoid: { label: 'Avoid', emoji: '🔴', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export default memo(function PropertyDealInsightCard({ propertyId }: Props) {
  const { data: insight, isLoading } = usePropertyInsight(propertyId);

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> AI Deal Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!insight) return null;

  const rec = RECOMMENDATION_CONFIG[insight.recommendation_level] || RECOMMENDATION_CONFIG.moderate;
  const risks = Array.isArray(insight.risks) ? insight.risks : [];
  const exit = insight.exit_strategy || {};

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> AI Deal Analysis
          </span>
          <Badge className={cn('border text-xs', rec.className)}>
            {rec.emoji} {rec.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Confidence & ROI */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>ROI: <strong className="text-foreground">{insight.projected_roi?.toFixed(1) || '—'}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Confidence: <strong className="text-foreground">{insight.confidence_score || 0}%</strong></span>
          </div>
        </div>

        {/* Why Good Deal */}
        {insight.why_good_deal && (
          <div className="text-xs text-muted-foreground bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
            <p className="font-semibold text-foreground mb-0.5">💡 Why This Deal</p>
            {insight.why_good_deal}
          </div>
        )}

        {/* Risks */}
        {risks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Risk Factors
            </p>
            {risks.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5">
                <Badge variant="outline" className={cn('text-[9px] shrink-0 mt-0.5',
                  r.severity === 'high' ? 'border-destructive/50 text-destructive' :
                  r.severity === 'medium' ? 'border-amber-500/50 text-amber-400' :
                  'border-emerald-500/50 text-emerald-400'
                )}>
                  {r.severity}
                </Badge>
                <span>{r.factor}: {r.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Exit Strategy */}
        {exit.exit_method && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
            <p className="font-semibold text-foreground flex items-center gap-1.5 mb-0.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Exit Strategy
            </p>
            Hold {exit.optimal_hold_years || '?'} years → {exit.exit_method}. {exit.reasoning}
          </div>
        )}

        {/* Best For */}
        {insight.best_for_persona && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span><strong className="text-foreground">Best for:</strong> {insight.best_for_persona}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
