import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirst30Days, DayAction, WeekBlock } from '@/hooks/useFirst30Days';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Target, Rocket, Users, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, ChevronRight, Zap, BarChart3, ArrowRight, Calendar
} from 'lucide-react';

const WEEK_CONFIG: Record<string, { icon: React.ElementType; gradient: string; accent: string }> = {
  supply: { icon: Rocket, gradient: 'from-blue-500/20 to-cyan-500/10', accent: 'text-blue-500' },
  investor: { icon: Users, gradient: 'from-emerald-500/20 to-teal-500/10', accent: 'text-emerald-500' },
  pipeline: { icon: TrendingUp, gradient: 'from-amber-500/20 to-orange-500/10', accent: 'text-amber-500' },
  conversion: { icon: Target, gradient: 'from-purple-500/20 to-pink-500/10', accent: 'text-purple-500' },
};

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ElementType }> = {
  completed: { label: 'Done', variant: 'default', icon: CheckCircle2 },
  in_progress: { label: 'Today', variant: 'secondary', icon: Zap },
  upcoming: { label: 'Upcoming', variant: 'outline', icon: Clock },
  missed: { label: 'Missed', variant: 'destructive', icon: AlertTriangle },
};

const MOMENTUM_CONFIG = {
  strong: { label: 'Strong Momentum', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  steady: { label: 'Steady Progress', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
  at_risk: { label: 'At Risk', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
};

function DayCard({ action }: { action: DayAction }) {
  const badge = STATUS_BADGE[action.status];
  const StatusIcon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
        action.status === 'in_progress'
          ? 'bg-primary/5 border-primary/30 shadow-sm'
          : action.status === 'completed'
          ? 'bg-muted/30 border-border/50'
          : 'bg-card border-border/30'
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold text-muted-foreground shrink-0">
        {action.day}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${action.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {action.title}
          </span>
          <Badge variant={badge.variant} className="text-[10px] h-5 gap-1">
            <StatusIcon className="w-3 h-3" />
            {badge.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{action.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> {action.kpiMetric}
          </span>
          {action.autoCheck && action.liveValue !== undefined && (
            <span className={`text-[10px] font-medium ${(action.liveValue ?? 0) >= (action.targetValue ?? 1) ? 'text-emerald-500' : 'text-amber-500'}`}>
              {action.liveValue}/{action.targetValue} live
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WeekSection({ week }: { week: WeekBlock }) {
  const [expanded, setExpanded] = useState(
    week.days.some((d) => d.status === 'in_progress') || week.progressPct < 100
  );
  const config = WEEK_CONFIG[week.category];
  const Icon = config.icon;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left p-4 flex items-center gap-3 bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-opacity`}
      >
        <div className={`p-2 rounded-lg bg-background/80 ${config.accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{week.label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={`text-sm font-medium ${config.accent}`}>{week.theme}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Progress value={week.progressPct} className="h-1.5 flex-1 max-w-[200px]" />
            <span className="text-xs text-muted-foreground">
              {week.completedCount}/{week.totalCount} actions
            </span>
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="p-4 space-y-2">
              {week.days.map((day) => (
                <DayCard key={day.day} action={day} />
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function First30DaysPage() {
  const { data: plan, isLoading } = useFirst30Days();

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading 30-day plan...</div>
      </div>
    );
  }

  const momentumCfg = MOMENTUM_CONFIG[plan.momentum];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">First 30 Days — Execution Discipline</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Structured daily founder actions to build marketplace momentum after soft launch.
          </p>
        </motion.div>

        {/* Summary Strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{plan.currentDay}</div>
            <div className="text-[11px] text-muted-foreground">Current Day</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{plan.totalCompleted}/{plan.totalActions}</div>
            <div className="text-[11px] text-muted-foreground">Actions Done</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{plan.overallProgress}%</div>
            <div className="text-[11px] text-muted-foreground">Progress</div>
          </Card>
          <Card className={`p-3 text-center border ${momentumCfg.bg}`}>
            <div className={`text-lg font-bold ${momentumCfg.color}`}>{momentumCfg.label}</div>
            <div className="text-[11px] text-muted-foreground">Momentum</div>
          </Card>
        </motion.div>

        {/* Overall progress bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Progress</span>
            <span>{plan.overallProgress}%</span>
          </div>
          <Progress value={plan.overallProgress} className="h-2" />
        </div>

        <Separator />

        {/* Weeks */}
        <div className="space-y-4">
          {plan.weeks.map((week) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: week.week * 0.08 }}
            >
              <WeekSection week={week} />
            </motion.div>
          ))}
        </div>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Final Goal — Day 30
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Close initial transactions and build credibility momentum within the first month.
              Validate supply-demand fit and establish repeatable founder-led sales motion.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
