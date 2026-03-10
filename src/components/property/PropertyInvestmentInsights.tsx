import { usePropertyInvestmentScore } from '@/hooks/useInvestmentScores';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, ShieldCheck, Shield, ShieldAlert, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const RISK_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  low: { icon: ShieldCheck, label: 'Low Risk', color: 'text-emerald-500' },
  medium: { icon: Shield, label: 'Medium', color: 'text-amber-500' },
  high: { icon: ShieldAlert, label: 'High Risk', color: 'text-destructive' },
};

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  'A': 'bg-green-500/15 text-green-500 border-green-500/30',
  'B+': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  'B': 'bg-sky-500/15 text-sky-500 border-sky-500/30',
  'C': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'D': 'bg-destructive/15 text-destructive border-destructive/30',
};

export default function PropertyInvestmentInsights({ propertyId }: { propertyId: string }) {
  const { data, isLoading } = usePropertyInvestmentScore(propertyId);

  if (isLoading || !data) return null;

  const risk = RISK_CONFIG[data.risk_level] || RISK_CONFIG.medium;
  const RiskIcon = risk.icon;
  const scoreColor = data.investment_score >= 75 ? 'text-emerald-500' : data.investment_score >= 50 ? 'text-primary' : data.investment_score >= 35 ? 'text-amber-500' : 'text-destructive';

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Investment Insights</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-2xl font-bold', scoreColor)}>{data.investment_score}</span>
            <Badge variant="outline" className={cn('text-[10px]', GRADE_COLORS[data.grade] || GRADE_COLORS['C'])}>{data.grade}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/20 rounded-lg p-2.5 border border-border/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">ROI Forecast</p>
            <p className="text-sm font-bold text-foreground">{data.roi_forecast}%</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5 border border-border/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Rental Yield</p>
            <p className="text-sm font-bold text-foreground">{data.rental_yield}%</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5 border border-border/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Growth Prediction</p>
            <p className={cn('text-sm font-bold', data.growth_prediction > 0 ? 'text-emerald-500' : 'text-destructive')}>
              {data.growth_prediction > 0 ? '+' : ''}{data.growth_prediction}%
            </p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5 border border-border/20 flex items-center gap-1.5">
            <RiskIcon className={cn('h-4 w-4', risk.color)} />
            <div>
              <p className="text-[10px] text-muted-foreground">Risk Level</p>
              <p className={cn('text-sm font-bold', risk.color)}>{risk.label}</p>
            </div>
          </div>
        </div>

        {data.recommendation && (
          <p className="text-[10px] text-muted-foreground italic">{data.recommendation}</p>
        )}
      </CardContent>
    </Card>
  );
}
