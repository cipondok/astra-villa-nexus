import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Zap, ShieldAlert, DollarSign } from 'lucide-react';

export type AITagType = 'growth' | 'risk' | 'optimize' | 'delay' | 'fraud' | 'revenue';

interface AIInlineTagProps {
  type: AITagType;
  label: string;
  className?: string;
}

const tagConfig: Record<AITagType, { icon: React.ElementType; color: string; bg: string }> = {
  growth:   { icon: TrendingUp,   color: 'text-chart-1',       bg: 'bg-chart-1/10' },
  risk:     { icon: AlertTriangle,color: 'text-chart-3',       bg: 'bg-chart-3/10' },
  optimize: { icon: Zap,          color: 'text-chart-2',       bg: 'bg-chart-2/10' },
  delay:    { icon: AlertTriangle,color: 'text-destructive',   bg: 'bg-destructive/10' },
  fraud:    { icon: ShieldAlert,  color: 'text-destructive',   bg: 'bg-destructive/10' },
  revenue:  { icon: DollarSign,   color: 'text-chart-1',       bg: 'bg-chart-1/10' },
};

/**
 * Compact inline AI intelligence tag for table rows.
 * Shows micro-insight like "High growth potential" or "Delay risk predicted"
 */
export const AIInlineTag = ({ type, label, className }: AIInlineTagProps) => {
  const cfg = tagConfig[type];
  const Icon = cfg.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-medium border border-transparent",
      cfg.bg, cfg.color,
      "animate-in fade-in duration-300",
      className
    )}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
};

/**
 * Skeleton shimmer for loading states — enterprise density.
 */
export const AdminSkeleton = ({ rows = 5, className }: { rows?: number; className?: string }) => (
  <div className={cn("space-y-1", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-[42px] rounded-lg bg-muted/20 border border-border/10 animate-pulse"
        style={{ animationDelay: `${i * 80}ms` }}
      />
    ))}
  </div>
);

/**
 * Animated number that transitions smoothly.
 */
export const AnimatedNumber = ({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) => {
  return (
    <span className="tabular-nums font-bold transition-all duration-300">
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
    </span>
  );
};

/**
 * KPI card — compact 60px enterprise density.
 */
interface AdminKPICardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  pulse?: boolean;
  className?: string;
}

export const AdminKPICard = ({ label, value, icon: Icon, trend, trendValue, pulse, className }: AdminKPICardProps) => (
  <div className={cn(
    "admin-kpi-card flex items-center gap-2.5 min-h-[56px]",
    pulse && "admin-kpi-pulse",
    className
  )}>
    {Icon && (
      <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="admin-kpi-value text-foreground">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="admin-kpi-label flex items-center gap-1">
        {label}
        {trend && trendValue && (
          <span className={cn(
            "text-[8px] font-medium",
            trend === 'up' ? 'text-chart-1' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{trendValue}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default { AIInlineTag, AdminSkeleton, AnimatedNumber, AdminKPICard };
