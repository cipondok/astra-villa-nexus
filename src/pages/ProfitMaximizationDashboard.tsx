import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, TrendingUp, ShieldCheck, DollarSign, AlertTriangle, Activity, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  useProfitDashboard,
  useProfitSignals,
  useProfitExperiments,
  useTriggerProfitScan,
  useApproveSignal,
  useRollbackSignal,
  computeMetabolicEfficiency,
  classifyHealthStatus,
  type ProfitSignal,
  type SignalDomain,
} from '@/hooks/useProfitOptimizationInsights';

const domainConfig: Record<SignalDomain, { label: string; icon: React.ElementType; color: string }> = {
  dynamic_pricing: { label: 'Dynamic Pricing', icon: DollarSign, color: 'text-amber-500' },
  cost_efficiency: { label: 'Cost Efficiency', icon: TrendingUp, color: 'text-emerald-500' },
  revenue_opportunity: { label: 'Revenue Opportunity', icon: Zap, color: 'text-orange-500' },
  risk_control: { label: 'Risk Control', icon: ShieldCheck, color: 'text-blue-500' },
};

const riskColors: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  approved: 'bg-blue-500/10 text-blue-600',
  completed: 'bg-emerald-500/10 text-emerald-600',
  rolled_back: 'bg-destructive/10 text-destructive',
  rejected: 'bg-muted text-muted-foreground',
};

function formatCurrency(val: number): string {
  if (Math.abs(val) >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `Rp ${(val / 1e6).toFixed(1)}M`;
  if (Math.abs(val) >= 1e3) return `Rp ${(val / 1e3).toFixed(0)}K`;
  return `Rp ${val.toFixed(0)}`;
}

function SignalCard({ signal }: { signal: ProfitSignal }) {
  const approve = useApproveSignal();
  const rollback = useRollbackSignal();
  const cfg = domainConfig[signal.signal_domain];
  const Icon = cfg.icon;

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${cfg.color}`} />
            <span className="text-sm font-medium">{signal.signal_type.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <div className="flex gap-1.5">
            <Badge variant="outline" className={riskColors[signal.risk_level]}>
              {signal.risk_level}
            </Badge>
            <Badge variant="outline" className={statusColors[signal.execution_status]}>
              {signal.execution_status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block">Confidence</span>
            <span className="font-semibold text-foreground">{signal.confidence_score}%</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Impact</span>
            <span className={`font-semibold ${signal.projected_impact_pct >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
              {signal.projected_impact_pct > 0 ? '+' : ''}{signal.projected_impact_pct}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Revenue Δ</span>
            <span className="font-semibold text-foreground">{formatCurrency(signal.projected_revenue_impact)}</span>
          </div>
        </div>

        <Progress value={signal.signal_strength} className="h-1.5" />

        {signal.execution_status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => approve.mutate(signal.id)}
              disabled={approve.isPending}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs text-destructive"
              onClick={() => rollback.mutate({ signalId: signal.id, reason: 'Admin rejected' })}
              disabled={rollback.isPending}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ProfitMaximizationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading: dashLoading } = useProfitDashboard();
  const { data: signals } = useProfitSignals();
  const { data: experiments } = useProfitExperiments();
  const triggerScan = useTriggerProfitScan();

  const margin = dashboard?.daily_trend?.[0]?.margin_pct ?? 0;
  const retention = dashboard?.daily_trend?.[0]?.partner_retention_rate ?? 100;
  const confidence = dashboard?.signals?.avg_confidence ?? 0;
  const healthStatus = classifyHealthStatus(margin, retention, confidence);

  const healthColors: Record<string, string> = {
    thriving: 'text-emerald-500',
    healthy: 'text-blue-500',
    caution: 'text-amber-500',
    critical: 'text-destructive',
  };

  const entryVariants = {
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={entryVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Profit Maximization Engine</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Autonomous profitability optimization & risk control</p>
            </div>
          </div>
          <Button onClick={() => triggerScan.mutate()} disabled={triggerScan.isPending} className="gap-2">
            <Zap className="h-4 w-4" />
            {triggerScan.isPending ? 'Scanning…' : 'Run Profit Scan'}
          </Button>
        </motion.div>

        {/* KPI Strip */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={entryVariants}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          <Card className="border-border/50">
            <CardContent className="p-3">
              <span className="text-xs text-muted-foreground">System Health</span>
              <p className={`text-lg font-bold capitalize ${healthColors[healthStatus]}`}>{healthStatus}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <span className="text-xs text-muted-foreground">Signals (30d)</span>
              <p className="text-lg font-bold text-foreground">{dashboard?.signals?.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <span className="text-xs text-muted-foreground">Pending</span>
              <p className="text-lg font-bold text-amber-500">{dashboard?.signals?.pending ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <span className="text-xs text-muted-foreground">Executed</span>
              <p className="text-lg font-bold text-emerald-500">{dashboard?.signals?.executed ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <span className="text-xs text-muted-foreground">Avg Confidence</span>
              <p className="text-lg font-bold text-foreground">{dashboard?.signals?.avg_confidence ?? 0}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <span className="text-xs text-muted-foreground">Experiments</span>
              <p className="text-lg font-bold text-foreground">{dashboard?.experiments?.active ?? 0} active</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Domain Distribution */}
        <motion.div initial="hidden" animate="visible" custom={2} variants={entryVariants}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signal Distribution by Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(Object.entries(domainConfig) as [SignalDomain, typeof domainConfig[SignalDomain]][]).map(([domain, cfg]) => {
                  const Icon = cfg.icon;
                  const count = dashboard?.signals?.by_domain?.[domain] ?? 0;
                  return (
                    <div key={domain} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">{cfg.label}</p>
                        <p className="text-lg font-bold text-foreground">{count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div initial="hidden" animate="visible" custom={3} variants={entryVariants}>
          <Tabs defaultValue="signals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="signals">Active Signals</TabsTrigger>
              <TabsTrigger value="experiments">Experiments</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="signals">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(signals ?? []).length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No signals yet. Run a profit scan to generate optimization signals.</p>
                  </div>
                )}
                {(signals ?? []).map((sig) => (
                  <SignalCard key={sig.id} signal={sig} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="experiments">
              <div className="space-y-3">
                {(experiments ?? []).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No experiments running. Signals will propose experiments automatically.</p>
                  </div>
                )}
                {(experiments ?? []).map((exp) => (
                  <Card key={exp.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-foreground">{exp.experiment_name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{exp.hypothesis}</p>
                        </div>
                        <Badge variant="outline">{exp.status}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Confidence</span>
                          <span className="font-semibold">{exp.current_confidence}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Control Rev</span>
                          <span className="font-semibold">{formatCurrency(exp.control_revenue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Variant Rev</span>
                          <span className="font-semibold">{formatCurrency(exp.variant_revenue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Impact</span>
                          <span className={`font-semibold ${exp.revenue_impact >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                            {formatCurrency(exp.revenue_impact)}
                          </span>
                        </div>
                      </div>
                      <Progress value={exp.current_confidence} max={exp.confidence_threshold} className="mt-3 h-1.5" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit">
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {(dashboard?.recent_audit ?? []).length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No audit entries yet.</p>
                      </div>
                    )}
                    {(dashboard?.recent_audit ?? []).map((entry, i) => (
                      <div key={i} className="p-3 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">{entry.action_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">{entry.decision}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0">
                          <p>{entry.decided_by}</p>
                          {entry.admin_override && <Badge variant="outline" className="text-[10px] px-1">override</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfitMaximizationDashboard;
