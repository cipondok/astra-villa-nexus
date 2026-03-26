import React from 'react';
import { useFeatureControls } from '@/hooks/useFeatureControl';
import { useInvestorDemoMode, useDemoModeToggle } from '@/hooks/useInvestorDemoMode';
import { updateFeatureStatus, type FeatureStatus } from '@/services/featureControlService';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ToggleLeft, Gauge, Eye, AlertTriangle, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_STYLES: Record<FeatureStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Active' },
  disabled: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Disabled' },
  beta: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Beta' },
  archived: { bg: 'bg-muted/30 border-border', text: 'text-muted-foreground', label: 'Archived' },
};

function ImpactBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'text-red-400' : score >= 4 ? 'text-amber-400' : 'text-emerald-400';
  return (
    <span className={cn('text-[10px] font-mono', color)}>
      Impact: {score}/10
    </span>
  );
}

const FeatureControlPanel: React.FC = () => {
  const { data: controls = [], isLoading } = useFeatureControls();
  const { isDemoMode } = useInvestorDemoMode();
  const { enable: enableDemo, disable: disableDemo } = useDemoModeToggle();
  const qc = useQueryClient();

  const handleToggle = async (featureKey: string, currentStatus: FeatureStatus) => {
    const newStatus: FeatureStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await updateFeatureStatus(featureKey, newStatus);
      qc.invalidateQueries({ queryKey: ['astra-feature-controls'] });
      toast.success(`${featureKey} → ${newStatus}`);
    } catch (e: any) {
      toast.error('Failed: ' + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeCount = controls.filter(c => c.status === 'active').length;
  const betaCount = controls.filter(c => c.status === 'beta').length;
  const disabledCount = controls.filter(c => c.status === 'disabled').length;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-primary" />
            Feature Control Panel
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {activeCount} active · {betaCount} beta · {disabledCount} disabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={isDemoMode ? 'destructive' : 'default'}
            onClick={() => isDemoMode ? disableDemo() : enableDemo()}
            className="text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {isDemoMode ? 'Exit Demo Mode' : 'Investor Demo Mode'}
          </Button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <Alert className="border-primary/30 bg-primary/5">
          <Eye className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-semibold text-primary">Investor Demo Mode Active</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Experimental modules disabled. Console noise suppressed. Platform optimized for presentation.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', count: activeCount, icon: Zap, color: 'text-emerald-400' },
          { label: 'Beta', count: betaCount, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Disabled', count: disabledCount, icon: Shield, color: 'text-red-400' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <div>
                <div className={cn('text-lg font-bold', s.color)}>{s.count}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {controls.map(ctrl => {
          const style = STATUS_STYLES[ctrl.status as FeatureStatus] || STATUS_STYLES.active;
          return (
            <Card key={ctrl.id} className={cn('border-border/50 transition-all', ctrl.status === 'disabled' && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">{ctrl.label}</span>
                      <Badge variant="outline" className={cn('text-[10px] border', style.bg, style.text)}>
                        {style.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{ctrl.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <ImpactBadge score={ctrl.performance_impact_score} />
                      <span className="text-[10px] text-muted-foreground font-mono">{ctrl.feature_key}</span>
                    </div>
                  </div>
                  <Switch
                    checked={ctrl.status === 'active'}
                    onCheckedChange={() => handleToggle(ctrl.feature_key, ctrl.status as FeatureStatus)}
                    aria-label={`Toggle ${ctrl.label}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureControlPanel;
