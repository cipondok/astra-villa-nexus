import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCopilotAlerts } from '@/hooks/useInvestorCopilot';
import { Bell, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_STYLES: Record<string, string> = {
  warning: 'border-l-amber-500 bg-amber-500/5',
  alert: 'border-l-destructive bg-destructive/5',
  opportunity: 'border-l-emerald-500 bg-emerald-500/5',
  info: 'border-l-primary bg-primary/5',
};

const TREND_ICONS: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export default memo(function CopilotAlertsFeed() {
  const { data: alerts, isLoading } = useCopilotAlerts();

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Investment Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!alerts?.length) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Investment Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No active investment alerts. Market signals are being monitored.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Investment Alerts
          </span>
          <Badge variant="secondary" className="text-[10px]">{alerts.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {alerts.map(alert => {
          const TrendIcon = TREND_ICONS[alert.trend_direction] || Minus;
          return (
            <div
              key={alert.id}
              className={cn(
                'rounded-lg border-l-[3px] px-3 py-2.5 border border-border/30',
                SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">{alert.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
                <TrendIcon className={cn('h-4 w-4 shrink-0 mt-0.5',
                  alert.trend_direction === 'up' ? 'text-emerald-400' :
                  alert.trend_direction === 'down' ? 'text-destructive' :
                  'text-muted-foreground'
                )} />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {alert.city && <Badge variant="outline" className="text-[9px] h-4">{alert.city}</Badge>}
                <span className="text-[9px] text-muted-foreground">
                  Score: {alert.trend_magnitude}/100
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
