import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useInvestorKPIs, type KPICategory, type KPIMetric } from '@/hooks/useInvestorKPIs';
import {
  Building2, Users, Brain, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, Target, Activity,
  BarChart3, RefreshCw, Download, ChevronRight,
  type LucideIcon,
} from 'lucide-react';

const categoryIconMap: Record<string, LucideIcon> = {
  building: Building2,
  users: Users,
  brain: Brain,
  dollar: DollarSign,
  trending: TrendingUp,
};

const categoryColorMap: Record<string, string> = {
  supply: '--panel-accent',
  demand: '--panel-info',
  ai: '--panel-warning',
  revenue: '--panel-success',
  growth: '--panel-accent',
};

function formatValue(value: number | string, format?: string): string {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    case 'currency':
      if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}B`;
      if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
      return `Rp ${value.toLocaleString()}`;
    case 'percent':
      return `${value}%`;
    default:
      return value.toLocaleString();
  }
}

function getProgressPercent(value: number | string, target?: number): number | null {
  if (!target || typeof value === 'string') return null;
  return Math.min((value / target) * 100, 100);
}

const InvestorKPIDashboard: React.FC = () => {
  const { data: categories, isLoading, refetch, isRefetching } = useInvestorKPIs();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
              <BarChart3 className="h-4 w-4 text-[hsl(var(--panel-accent))]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">
                Investor KPI Framework
              </h1>
              <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">
                Structured performance visibility for internal strategy and investor reporting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium border transition-all",
                "text-[hsl(var(--panel-text-secondary))] border-[hsl(var(--panel-border))] hover:border-[hsl(var(--panel-accent)/.3)] hover:text-[hsl(var(--panel-accent))]",
                isRefetching && "opacity-60"
              )}
            >
              <RefreshCw className={cn("h-3 w-3", isRefetching && "animate-spin")} />
              Refresh
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium border text-[hsl(var(--panel-text-secondary))] border-[hsl(var(--panel-border))] hover:border-[hsl(var(--panel-accent)/.3)] hover:text-[hsl(var(--panel-accent))] transition-all"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {/* Summary strip */}
        {categories && (
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
            {categories.map((cat) => {
              const color = categoryColorMap[cat.id] || '--panel-accent';
              return (
                <div key={cat.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${color}))` }} />
                  <span className="text-[9px] font-medium uppercase tracking-wider text-[hsl(var(--panel-text-muted))]">
                    {cat.title.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${color}))` }}>
                    {cat.metrics.length}
                  </span>
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-1">
              <Activity className="h-3 w-3 text-[hsl(var(--panel-success))]" />
              <span className="text-[9px] text-[hsl(var(--panel-success))] font-medium">Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-4 animate-pulse">
              <div className="h-4 w-48 bg-[hsl(var(--panel-hover))] rounded mb-3" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-[hsl(var(--panel-hover))] rounded" />
                <div className="h-16 bg-[hsl(var(--panel-hover))] rounded" />
                <div className="h-16 bg-[hsl(var(--panel-hover))] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Categories */}
      {categories?.map((category) => (
        <KPICategoryCard
          key={category.id}
          category={category}
          isExpanded={expandedCategory === category.id}
          onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
        />
      ))}

      {/* Footer note */}
      <div className="px-2 py-2">
        <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
          ASTRA Villa KPI Framework v1.0 — Data refreshes every 10 minutes — Last sync: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

/* ── Category Card ────────────────────────────────── */
const KPICategoryCard: React.FC<{
  category: KPICategory;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, isExpanded, onToggle }) => {
  const Icon = categoryIconMap[category.icon] || BarChart3;
  const accentVar = categoryColorMap[category.id] || '--panel-accent';

  return (
    <div
      className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden transition-all"
      style={{ boxShadow: 'var(--panel-shadow)' }}
    >
      {/* Category header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[hsl(var(--panel-hover))] transition-colors"
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg border"
          style={{
            backgroundColor: `hsl(var(${accentVar}) / 0.08)`,
            borderColor: `hsl(var(${accentVar}) / 0.18)`,
          }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${accentVar}))` }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[12px] font-bold text-[hsl(var(--panel-text))] tracking-tight">{category.title}</h2>
          <p className="text-[9px] text-[hsl(var(--panel-text-muted))]">{category.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick metric preview */}
          {category.metrics.slice(0, 2).map((m) => (
            <div key={m.key} className="text-right hidden sm:block">
              <span className="text-[11px] font-bold font-mono text-[hsl(var(--panel-text))]">
                {formatValue(m.value, m.format)}
              </span>
              <span className="block text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">
                {m.label.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          ))}
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))] transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </div>
      </button>

      {/* Expanded metrics grid */}
      {isExpanded && (
        <div className="border-t border-[hsl(var(--panel-border-subtle))] animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[hsl(var(--panel-border-subtle))]">
            {category.metrics.map((metric) => (
              <KPIMetricCell key={metric.key} metric={metric} accentVar={accentVar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Metric Cell ────────────────────────────────── */
const KPIMetricCell: React.FC<{ metric: KPIMetric; accentVar: string }> = ({ metric, accentVar }) => {
  const progress = typeof metric.value === 'number' && metric.target
    ? getProgressPercent(metric.value, metric.target)
    : null;

  const TrendIcon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Minus;
  const trendColor = metric.trend === 'up' ? '--panel-success' : metric.trend === 'down' ? '--panel-danger' : '--panel-text-muted';

  return (
    <div className="px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.5)] transition-colors">
      {/* Label */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-medium uppercase tracking-wider text-[hsl(var(--panel-text-muted))]">
          {metric.label}
        </span>
        {metric.trend && (
          <div className="flex items-center gap-0.5">
            <TrendIcon className="h-2.5 w-2.5" style={{ color: `hsl(var(${trendColor}))` }} />
            {metric.change !== undefined && (
              <span className="text-[8px] font-bold font-mono" style={{ color: `hsl(var(${trendColor}))` }}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-lg font-bold font-mono leading-none"
          style={{ color: `hsl(var(${accentVar}))` }}
        >
          {formatValue(metric.value, metric.format)}
        </span>
        {metric.target && (
          <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">
            / {formatValue(metric.target, metric.format)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {progress !== null && (
        <div className="mt-2">
          <div className="h-1 rounded-full bg-[hsl(var(--panel-border))] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: `hsl(var(${accentVar}))`,
                boxShadow: `0 0 6px hsl(var(${accentVar}) / 0.3)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{progress.toFixed(0)}%</span>
            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">
              {metric.target && (
                <span className="flex items-center gap-0.5">
                  <Target className="h-2 w-2" />
                  Target
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorKPIDashboard;
