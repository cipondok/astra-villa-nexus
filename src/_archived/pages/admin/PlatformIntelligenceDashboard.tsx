import React from 'react';
import { usePlatformIntelligence } from '@/hooks/usePlatformIntelligence';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Brain, AlertTriangle, TrendingUp, Globe, DollarSign,
  Target, Gauge, Shield, Loader2, CheckCircle, ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RISK_STYLES = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Low Risk' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Medium Risk' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'High Risk' },
} as const;

const REVENUE_SIGNAL_STYLES = {
  growing: { color: 'text-emerald-400', label: 'Growing' },
  stable: { color: 'text-blue-400', label: 'Stable' },
  declining: { color: 'text-red-400', label: 'Declining' },
  unknown: { color: 'text-muted-foreground', label: 'Insufficient Data' },
} as const;

function ActionList({ items, icon: Icon, iconClass }: {
  items: string[]; icon: React.ElementType; iconClass?: string;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
          <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', iconClass || 'text-primary')} />
          {item}
        </li>
      ))}
    </ul>
  );
}

const PlatformIntelligenceDashboard: React.FC = () => {
  const { intelligence, isLoading: intLoading } = usePlatformIntelligence();
  const { kpis, recommendations: revRecs, isLoading: revLoading } = useRevenueAnalytics();

  if (intLoading || revLoading || !intelligence) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Brain className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Analyzing platform intelligence…</p>
        </div>
      </div>
    );
  }

  const risk = RISK_STYLES[intelligence.riskLevel];
  const revSignal = REVENUE_SIGNAL_STYLES[intelligence.revenueHealthSignal];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Platform Intelligence Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Autonomous CTO · Scaling Planner · Revenue Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs px-3 py-1', risk.bg, risk.border, risk.color)}>
            {risk.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Scaling: {intelligence.scalingReadiness}%
          </Badge>
        </div>
      </div>

      {/* High Risk Alert */}
      {intelligence.riskLevel === 'high' && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">High Platform Risk Detected</AlertTitle>
          <AlertDescription className="text-xs">
            Multiple critical thresholds breached. Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Risk Level', value: risk.label, icon: Shield, color: risk.color },
          { label: 'Scaling Ready', value: `${intelligence.scalingReadiness}%`, icon: Globe, color: intelligence.scalingReadiness >= 70 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Revenue Signal', value: revSignal.label, icon: DollarSign, color: revSignal.color },
          { label: 'Warnings', value: String(intelligence.architectureWarnings.length), icon: AlertTriangle, color: intelligence.architectureWarnings.length === 0 ? 'text-emerald-400' : 'text-amber-400' },
        ].map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <k.icon className={cn('h-4 w-4', k.color)} />
              <div>
                <div className={cn('text-sm font-bold', k.color)}>{k.value}</div>
                <div className="text-[10px] text-muted-foreground">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActionList items={intelligence.priorityActions} icon={ArrowUpRight} iconClass="text-primary" />
          </CardContent>
        </Card>

        {/* Optimization Targets */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Optimization Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intelligence.optimizationTargets.length > 0 ? (
              <ActionList items={intelligence.optimizationTargets} icon={TrendingUp} iconClass="text-blue-400" />
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> All metrics within target range.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Architecture Warnings */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Architecture Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intelligence.architectureWarnings.length > 0 ? (
              <ActionList items={intelligence.architectureWarnings} icon={AlertTriangle} iconClass="text-amber-400" />
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> No architecture warnings detected.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Intelligence */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Revenue Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Listing Conversion', value: `${kpis.listingConversionRate}%` },
                  { label: 'Deal Velocity', value: `${kpis.dealCompletionVelocityDays}d` },
                  { label: 'Premium Adoption', value: `${kpis.premiumAdoptionRate}%` },
                  { label: 'Geo Focus', value: kpis.geographicConcentration },
                ].map(m => (
                  <div key={m.label} className="p-2 rounded-lg bg-muted/30">
                    <div className="text-xs font-medium text-foreground">{m.value}</div>
                    <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
            <ActionList items={revRecs} icon={TrendingUp} iconClass="text-emerald-400" />
          </CardContent>
        </Card>
      </div>

      {/* Scaling Readiness Milestones */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Global Scaling Readiness — {intelligence.scalingReadiness}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted/30 rounded-full h-2.5 mb-4">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-1000',
                intelligence.scalingReadiness >= 70 ? 'bg-emerald-500' :
                intelligence.scalingReadiness >= 40 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${intelligence.scalingReadiness}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            {[
              { phase: 'Phase 1', label: 'Single Region', threshold: '0-30%' },
              { phase: 'Phase 2', label: 'CDN + Caching', threshold: '30-50%' },
              { phase: 'Phase 3', label: 'Read Replicas', threshold: '50-75%' },
              { phase: 'Phase 4', label: 'Multi-Region', threshold: '75-100%' },
            ].map(p => (
              <div key={p.phase} className="p-2 rounded-lg bg-muted/20 text-center">
                <div className="font-semibold text-foreground">{p.phase}</div>
                <div className="text-muted-foreground">{p.label}</div>
                <div className="text-[10px] text-muted-foreground">{p.threshold}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformIntelligenceDashboard;
