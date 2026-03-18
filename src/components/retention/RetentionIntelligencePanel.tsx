import { motion } from 'framer-motion';
import {
  Shield, Sparkles, BarChart3, BellRing, Target, Trophy,
  TrendingUp, TrendingDown, Minus, Activity, AlertTriangle,
  ChevronRight, Flame, Snowflake, Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRetentionEngine, HEALTH_META, type RetentionAction } from '@/hooks/useRetentionEngine';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  'bell-ring': BellRing,
  'sparkles': Sparkles,
  'bar-chart': BarChart3,
  'trophy': Trophy,
  'target': Target,
};

const TREND_ICONS: Record<string, React.ElementType> = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'border-destructive/30 bg-destructive/5',
  medium: 'border-chart-4/30 bg-chart-4/5',
  low: 'border-chart-2/30 bg-chart-2/5',
};

export default function RetentionIntelligencePanel() {
  const { data: retention, isLoading } = useRetentionEngine();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!retention) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Sign in to view your retention intelligence
        </CardContent>
      </Card>
    );
  }

  const meta = HEALTH_META[retention.health];
  const TrendIcon = TREND_ICONS[retention.engagement_trend];
  const churnPercent = Math.round(retention.predicted_churn_probability * 100);

  return (
    <div className="space-y-3">
      {/* Health Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden border-border/40">
          <div className={cn('absolute inset-0 opacity-[0.03]', meta.bgColor)} />
          <CardContent className="p-4 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {retention.health === 'thriving' && <Flame className="h-5 w-5 text-chart-2" />}
                  {retention.health === 'churning' && <Snowflake className="h-5 w-5 text-destructive" />}
                  {!['thriving', 'churning'].includes(retention.health) && <Heart className={cn('h-5 w-5', meta.color)} />}
                  <span className={cn('text-lg font-bold', meta.color)}>{meta.label}</span>
                  <Badge variant="outline" className="text-[10px] h-5">
                    Score: {retention.health_score}/100
                  </Badge>
                </div>

                {/* Score Progress */}
                <Progress value={retention.health_score} className="h-2 mb-3" />

                {/* Mini KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{retention.signals.browsing_frequency}</p>
                    <p className="text-[9px] text-muted-foreground">Sessions (30d)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{retention.signals.watchlist_updates}</p>
                    <p className="text-[9px] text-muted-foreground">Watchlist Updates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{retention.signals.alert_response_rate}%</p>
                    <p className="text-[9px] text-muted-foreground">Alert Response</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{retention.signals.days_since_last_visit}d</p>
                    <p className="text-[9px] text-muted-foreground">Since Last Visit</p>
                  </div>
                </div>
              </div>

              {/* Trend + Churn Risk */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  {TrendIcon && <TrendIcon className={cn('h-4 w-4', retention.engagement_trend === 'improving' ? 'text-chart-2' : retention.engagement_trend === 'declining' ? 'text-destructive' : 'text-muted-foreground')} />}
                  <span className="text-[10px] text-muted-foreground capitalize">{retention.engagement_trend}</span>
                </div>
                <div className="text-center">
                  <div className={cn(
                    'text-xl font-bold',
                    churnPercent > 60 ? 'text-destructive' : churnPercent > 30 ? 'text-chart-5' : 'text-chart-2'
                  )}>
                    {churnPercent}%
                  </div>
                  <p className="text-[9px] text-muted-foreground">Churn Risk</p>
                </div>
              </div>
            </div>

            {retention.next_milestone && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Target className="h-3 w-3" />
                Next milestone: <span className="font-medium text-foreground">{retention.next_milestone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Retention Actions */}
      {retention.recommended_actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Retention Actions
                <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                  {retention.recommended_actions.length} actions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {retention.recommended_actions.map((action, i) => (
                <RetentionActionCard key={action.id} action={action} index={i} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Signal Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-4" />
              Behavioral Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-2.5">
              <SignalBar label="Browsing Frequency" value={Math.min(retention.signals.browsing_frequency / 20 * 100, 100)} detail={`${retention.signals.browsing_frequency} sessions`} />
              <SignalBar label="Watchlist Engagement" value={Math.min(retention.signals.watchlist_updates / 10 * 100, 100)} detail={`${retention.signals.watchlist_updates} updates`} />
              <SignalBar label="Alert Responsiveness" value={retention.signals.alert_response_rate} detail={`${retention.signals.alert_response_rate}% response`} />
              <SignalBar label="Visit Recency" value={Math.max(0, (1 - retention.signals.days_since_last_visit / 30) * 100)} detail={`${retention.signals.days_since_last_visit}d ago`} />
              <SignalBar label="Session Regularity" value={Math.max(0, (1 - retention.signals.avg_session_gap_days / 14) * 100)} detail={`avg ${retention.signals.avg_session_gap_days}d gap`} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function RetentionActionCard({ action, index }: { action: RetentionAction; index: number }) {
  const Icon = ACTION_ICONS[action.icon_key] || AlertTriangle;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className={cn('rounded-lg border p-2.5 flex items-start gap-2.5', PRIORITY_STYLES[action.priority])}
    >
      <div className="h-7 w-7 rounded-md bg-background/80 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-foreground">{action.title}</span>
          <Badge variant="outline" className={cn(
            'text-[8px] h-3.5 px-1',
            action.priority === 'high' ? 'border-destructive/40 text-destructive' :
            action.priority === 'medium' ? 'border-chart-4/40 text-chart-4' : 'border-chart-2/40 text-chart-2'
          )}>
            {action.priority}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{action.description}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
    </motion.div>
  );
}

function SignalBar({ label, value, detail }: { label: string; value: number; detail: string }) {
  const clamped = Math.round(Math.max(0, Math.min(100, value)));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-foreground">{label}</span>
        <span className="text-[9px] text-muted-foreground">{detail}</span>
      </div>
      <Progress value={clamped} className="h-1.5" />
    </div>
  );
}
