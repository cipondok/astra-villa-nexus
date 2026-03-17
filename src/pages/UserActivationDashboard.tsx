import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivationDashboardStats } from '@/hooks/useActivationMilestones';
import { motion } from 'framer-motion';
import {
  Target, Users, Search, Heart, BarChart3, MessageSquare,
  TrendingUp, Clock, ArrowRight, Zap, AlertTriangle, Loader2,
  ChevronDown, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MILESTONE_CONFIG = [
  { key: 'signed_up', label: 'Signed Up', icon: Users, color: 'text-foreground' },
  { key: 'first_search', label: 'First Search', icon: Search, color: 'text-primary' },
  { key: 'first_save', label: 'First Save', icon: Heart, color: 'text-destructive' },
  { key: 'first_insight_view', label: 'Opened Insights', icon: BarChart3, color: 'text-chart-2' },
  { key: 'first_inquiry', label: 'First Inquiry', icon: MessageSquare, color: 'text-chart-4' },
] as const;

export default function UserActivationDashboard() {
  const [daysBack, setDaysBack] = useState(30);
  const { data: stats, isLoading, error } = useActivationDashboardStats(daysBack);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback data for when no stats yet
  const s = stats || {
    total_new_users: 0, activated_users: 0, activation_rate: 0,
    avg_time_to_search_minutes: 0, avg_time_to_save_minutes: 0,
    avg_time_to_insight_minutes: 0, avg_time_to_inquiry_minutes: 0,
    funnel: { signed_up: 0, first_search: 0, first_save: 0, first_insight_view: 0, first_inquiry: 0 },
  };

  const funnelSteps = MILESTONE_CONFIG.map(m => ({
    ...m,
    count: s.funnel[m.key as keyof typeof s.funnel] || 0,
  }));

  // Calculate drop-off rates
  const dropOffs = funnelSteps.map((step, i) => {
    if (i === 0) return { ...step, dropOff: 0, rate: 100 };
    const prev = funnelSteps[i - 1].count;
    const curr = step.count;
    const rate = prev > 0 ? Math.round((curr / prev) * 100) : 0;
    return { ...step, dropOff: prev - curr, rate };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                User Activation Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Measure how new users reach platform value milestones
              </p>
            </div>
            <Select value={String(daysBack)} onValueChange={v => setDaysBack(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            icon={Users}
            label="New Users"
            value={s.total_new_users}
            sublabel={`Last ${daysBack} days`}
          />
          <KPICard
            icon={Zap}
            label="Activated Users"
            value={s.activated_users}
            sublabel="≥2 milestones hit"
            valueColor="text-chart-2"
          />
          <KPICard
            icon={TrendingUp}
            label="Activation Rate"
            value={`${s.activation_rate}%`}
            sublabel={s.activation_rate >= 40 ? 'Healthy' : s.activation_rate >= 20 ? 'Needs improvement' : 'Critical'}
            valueColor={s.activation_rate >= 40 ? 'text-chart-2' : s.activation_rate >= 20 ? 'text-amber-500' : 'text-destructive'}
          />
          <KPICard
            icon={Clock}
            label="Avg. Time to Search"
            value={s.avg_time_to_search_minutes > 0 ? `${s.avg_time_to_search_minutes}m` : '—'}
            sublabel="After signup"
          />
        </div>

        {/* Time to Action Metrics */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Average Time to Milestone
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'First Search', minutes: s.avg_time_to_search_minutes, icon: Search, target: 5 },
                { label: 'First Save', minutes: s.avg_time_to_save_minutes, icon: Heart, target: 15 },
                { label: 'First Insight View', minutes: s.avg_time_to_insight_minutes, icon: BarChart3, target: 30 },
                { label: 'First Inquiry', minutes: s.avg_time_to_inquiry_minutes, icon: MessageSquare, target: 60 },
              ].map(m => (
                <div key={m.label} className="bg-muted/20 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {m.minutes > 0 ? formatDuration(m.minutes) : '—'}
                  </div>
                  {m.minutes > 0 && (
                    <div className={cn(
                      'text-[10px] font-medium mt-1',
                      m.minutes <= m.target ? 'text-chart-2' : 'text-amber-500'
                    )}>
                      {m.minutes <= m.target ? '✓ Within target' : `Target: <${m.target}m`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activation Funnel Visualization */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Activation Funnel — Drop-Off Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1">
              {dropOffs.map((step, i) => {
                const StepIcon = step.icon;
                const maxCount = funnelSteps[0].count || 1;
                const barWidth = Math.max(5, (step.count / maxCount) * 100);

                return (
                  <div key={step.key} className="group">
                    <div className="flex items-center gap-3 py-2">
                      {/* Step icon */}
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        i === 0 ? 'bg-primary/10' : 'bg-muted/30'
                      )}>
                        <StepIcon className={cn('h-4 w-4', step.color)} />
                      </div>

                      {/* Label + count */}
                      <div className="w-32 flex-shrink-0">
                        <p className="text-xs font-medium text-foreground">{step.label}</p>
                        <p className="text-[10px] text-muted-foreground">{step.count.toLocaleString()} users</p>
                      </div>

                      {/* Bar */}
                      <div className="flex-1 h-8 bg-muted/20 rounded-lg overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className={cn(
                            'h-full rounded-lg',
                            i === 0 ? 'bg-primary/20' :
                            step.rate >= 60 ? 'bg-chart-2/20' :
                            step.rate >= 30 ? 'bg-amber-500/20' :
                            'bg-destructive/20'
                          )}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-[10px] font-semibold text-foreground">
                            {step.rate}%
                          </span>
                        </div>
                      </div>

                      {/* Drop-off indicator */}
                      {i > 0 && step.dropOff > 0 && (
                        <div className="w-20 flex-shrink-0 text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] px-1.5',
                              step.rate >= 60 ? 'text-chart-2 border-chart-2/30' :
                              step.rate >= 30 ? 'text-amber-500 border-amber-500/30' :
                              'text-destructive border-destructive/30'
                            )}
                          >
                            -{step.dropOff}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Drop-off arrow between steps */}
                    {i < dropOffs.length - 1 && (
                      <div className="flex items-center gap-3 py-0.5">
                        <div className="w-8 flex justify-center">
                          <ChevronDown className="h-3 w-3 text-muted-foreground/30" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Recommendations */}
        <Card className="border border-primary/10 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Activation Optimization Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-2">
            {[
              {
                severity: s.activation_rate < 20 ? 'critical' : s.activation_rate < 40 ? 'warning' : 'info',
                title: 'Onboarding Hint Prompts',
                desc: 'Guide first-time users with contextual tooltip prompts on search, save, and investment tools',
                status: 'Active',
              },
              {
                severity: 'info',
                title: 'Elite Opportunity Highlight',
                desc: 'Show a curated high-score property card immediately after first login to demonstrate platform value',
                status: 'Active',
              },
              {
                severity: s.funnel?.first_inquiry === 0 ? 'critical' : 'warning',
                title: 'Inactive User Follow-Up',
                desc: 'Send push notification to users who haven\'t completed first inquiry within 48 hours',
                status: 'Configured',
              },
              {
                severity: 'info',
                title: 'Progressive Disclosure',
                desc: 'Unlock advanced features (AI portfolio, market heat) after first 2 milestones to create discovery momentum',
                status: 'Planned',
              },
            ].map((action, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  action.severity === 'critical' ? 'bg-destructive/5 border-destructive/15' :
                  action.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/15' :
                  'bg-muted/20 border-border/30'
                )}
              >
                <AlertTriangle className={cn(
                  'h-4 w-4 flex-shrink-0 mt-0.5',
                  action.severity === 'critical' ? 'text-destructive' :
                  action.severity === 'warning' ? 'text-amber-500' :
                  'text-muted-foreground'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{action.title}</p>
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">{action.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sublabel, valueColor = 'text-foreground' }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sublabel: string;
  valueColor?: string;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        </div>
        <div className={cn('text-2xl font-black', valueColor)}>{value}</div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
