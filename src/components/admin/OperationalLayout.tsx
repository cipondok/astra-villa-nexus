import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, MapPin, ShieldAlert } from 'lucide-react';
import { useAISignals } from '@/hooks/useAISignals';

/* ──────────────────────────────────────────
   Priority weights for signal types
   ────────────────────────────────────────── */
const PRIORITY_WEIGHTS: Record<string, number> = {
  fraud_risk: 0.9,
  revenue_opportunity: 0.8,
  demand_spike: 0.7,
  vendor_risk: 0.65,
  price_imbalance: 0.6,
  liquidity_shift: 0.5,
};

export type PriorityModule = {
  key: string;
  label: string;
  urgencyIndex: number;
  icon: React.ElementType;
  color: string;
  description: string;
};

/**
 * Hook: computes prioritized module ordering from AI signals.
 */
export function usePriorityEngine() {
  const { data: signals = [] } = useAISignals(true);

  const priorityModules = useMemo<PriorityModule[]>(() => {
    const moduleMap = new Map<string, { urgency: number; count: number }>();

    for (const signal of signals) {
      const weight = PRIORITY_WEIGHTS[signal.signal_type] ?? 0.3;
      const severityMultiplier =
        signal.severity === 'critical' ? 1.0 :
        signal.severity === 'high' ? 0.8 :
        signal.severity === 'medium' ? 0.5 : 0.2;
      const confidence = (signal.confidence_score ?? 50) / 100;
      const urgency = weight * severityMultiplier * confidence;

      const moduleKey = signalToModule(signal.signal_type);
      const existing = moduleMap.get(moduleKey);
      if (existing) {
        existing.urgency = Math.max(existing.urgency, urgency);
        existing.count++;
      } else {
        moduleMap.set(moduleKey, { urgency, count: 1 });
      }
    }

    const modules: PriorityModule[] = [];
    for (const [key, data] of moduleMap) {
      const config = MODULE_CONFIG[key];
      if (config) {
        modules.push({
          key,
          label: config.label,
          urgencyIndex: data.urgency,
          icon: config.icon,
          color: config.color,
          description: `${data.count} signal${data.count > 1 ? 's' : ''} detected`,
        });
      }
    }

    return modules.sort((a, b) => b.urgencyIndex - a.urgencyIndex);
  }, [signals]);

  const hasFraudRisk = priorityModules.some(m => m.key === 'verification' && m.urgencyIndex > 0.5);
  const hasRevenueOpp = priorityModules.some(m => m.key === 'revenue' && m.urgencyIndex > 0.4);
  const hasDemandSpike = priorityModules.some(m => m.key === 'marketplace' && m.urgencyIndex > 0.3);

  return { priorityModules, hasFraudRisk, hasRevenueOpp, hasDemandSpike, signals };
}

function signalToModule(signalType: string): string {
  switch (signalType) {
    case 'fraud_risk':
    case 'vendor_risk':
      return 'verification';
    case 'revenue_opportunity':
    case 'price_imbalance':
      return 'revenue';
    case 'demand_spike':
    case 'liquidity_shift':
      return 'marketplace';
    default:
      return 'general';
  }
}

const MODULE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  verification: { label: 'Vendor Verification', icon: ShieldAlert, color: 'text-destructive' },
  revenue:      { label: 'Revenue Opportunity', icon: TrendingUp, color: 'text-chart-1' },
  marketplace:  { label: 'Market Intelligence', icon: MapPin, color: 'text-chart-2' },
  general:      { label: 'System Alert', icon: AlertTriangle, color: 'text-chart-3' },
};

/* ──────────────────────────────────────────
   Dynamic Priority Surface Component
   ────────────────────────────────────────── */
interface DynamicPrioritySurfaceProps {
  children?: React.ReactNode;
  className?: string;
}

export const DynamicPrioritySurface = ({ children, className }: DynamicPrioritySurfaceProps) => {
  const { priorityModules, hasFraudRisk, hasRevenueOpp, hasDemandSpike } = usePriorityEngine();

  if (priorityModules.length === 0) return <>{children}</>;

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Priority alerts — compact horizontal strip */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {priorityModules.slice(0, 3).map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.key}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0",
                "bg-card border-border/30 hover:bg-muted/20 cursor-pointer transition-colors",
                mod.urgencyIndex > 0.6 && "border-destructive/30 bg-destructive/5"
              )}
            >
              <Icon className={cn("h-3 w-3 shrink-0", mod.color)} />
              <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{mod.label}</span>
              <span className="text-[8px] text-muted-foreground">{mod.description}</span>
              {mod.urgencyIndex > 0.6 && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
};

/* ──────────────────────────────────────────
   Operational Grid Layout
   ────────────────────────────────────────── */
interface OperationalGridProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
}

export const OperationalGrid = ({ primary, secondary, className }: OperationalGridProps) => (
  <div className={cn(
    "grid gap-3",
    secondary ? "grid-cols-1 xl:grid-cols-[2.4fr_1fr]" : "grid-cols-1",
    className
  )}>
    <div className="min-w-0">{primary}</div>
    {secondary && (
      <div className="min-w-0 space-y-2">{secondary}</div>
    )}
  </div>
);

/* ──────────────────────────────────────────
   Content Container
   ────────────────────────────────────────── */
export const ContentContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("max-w-[1600px] mx-auto w-full", className)}>
    {children}
  </div>
);

/* ──────────────────────────────────────────
   Compact Page Header
   ────────────────────────────────────────── */
interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  subtitle?: string;
}

export const CompactPageHeader = ({ title, actions, subtitle }: PageHeaderProps) => (
  <div className="flex items-center justify-between h-[52px]">
    <div>
      <h2 className="text-sm font-semibold text-foreground tracking-tight leading-none">{title}</h2>
      {subtitle && <p className="text-[9px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-1.5">{actions}</div>}
  </div>
);

export default { DynamicPrioritySurface, OperationalGrid, ContentContainer, CompactPageHeader, usePriorityEngine };
