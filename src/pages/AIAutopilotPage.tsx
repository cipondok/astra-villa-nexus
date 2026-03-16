import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain, Activity, TrendingUp, TrendingDown, Shield, Zap,
  Target, Eye, AlertTriangle, Flame, ArrowUpRight, ArrowDownRight,
  ChevronRight, Loader2, Radio, Cpu, BarChart3, MapPin,
  Lightbulb, RefreshCw, DollarSign, Layers, Clock, Play,
} from 'lucide-react';
import { useAIAutopilot, type AutopilotSignal, type AutopilotRecommendation } from '@/hooks/useAIAutopilot';
import { useAutopilotStatus, useRunAutopilotWorkers, WORKER_NAMES } from '@/hooks/useAutopilotWorker';
import { cn } from '@/lib/utils';

const fadeIn = (d = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: d },
});

// ── Signal Card ──
const SIGNAL_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  elite_opportunity: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  heat_surge: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
  valuation_reversal: { icon: TrendingDown, color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/20' },
  risk_spike: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  appreciation_forecast: { icon: TrendingUp, color: 'text-chart-1', bg: 'bg-chart-1/10 border-chart-1/20' },
  cooling_alert: { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  flip_detected: { icon: Target, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  rebalance_suggestion: { icon: RefreshCw, color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/20' },
};

function SignalCard({ signal }: { signal: AutopilotSignal }) {
  const cfg = SIGNAL_CONFIG[signal.type] ?? SIGNAL_CONFIG.elite_opportunity;
  const Icon = cfg.icon;
  const severityColor = signal.severity === 'critical' ? 'text-destructive' :
    signal.severity === 'warning' ? 'text-amber-500' :
    signal.severity === 'opportunity' ? 'text-chart-1' : 'text-muted-foreground';

  return (
    <div className={cn('rounded-lg border p-3 space-y-1.5', cfg.bg)}>
      <div className="flex items-start gap-2">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">{signal.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{signal.description}</p>
        </div>
        <Badge variant="outline" className={cn('text-[9px] h-5 shrink-0 font-mono', severityColor)}>
          {signal.confidence}%
        </Badge>
      </div>
    </div>
  );
}

// ── Recommendation Card ──
const REC_ICONS: Record<string, React.ElementType> = {
  buy: ArrowUpRight,
  sell: ArrowDownRight,
  hold: Clock,
  diversify: Layers,
  monitor: Eye,
};

function RecommendationCard({ rec }: { rec: AutopilotRecommendation }) {
  const Icon = REC_ICONS[rec.category] ?? Lightbulb;
  const priorityColor = rec.priority === 'high' ? 'text-destructive' :
    rec.priority === 'medium' ? 'text-amber-500' : 'text-muted-foreground';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/15 border border-border/20">
      <div className={cn('p-1.5 rounded-md', rec.category === 'buy' ? 'bg-chart-1/15' : rec.category === 'sell' ? 'bg-destructive/15' : 'bg-primary/15')}>
        <Icon className={cn('h-3.5 w-3.5', rec.category === 'buy' ? 'text-chart-1' : rec.category === 'sell' ? 'text-destructive' : 'text-primary')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{rec.action}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{rec.rationale}</p>
      </div>
      <Badge variant="outline" className={cn('text-[9px] h-5 shrink-0 capitalize', priorityColor)}>
        {rec.priority}
      </Badge>
    </div>
  );
}

// ── KPI Stat ──
function KPIStat({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="text-center space-y-1">
      <Icon className={cn('h-4 w-4 mx-auto', color)} />
      <p className={cn('text-lg font-bold font-mono', color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {sub && <p className="text-[9px] text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

// ── Module Health ──
function ModuleRow({ name, status, coverage }: { name: string; status: string; coverage: number }) {
  const statusColor = status === 'online' ? 'text-chart-1' : status === 'degraded' ? 'text-amber-500' : 'text-destructive';
  const dotColor = status === 'online' ? 'bg-chart-1' : status === 'degraded' ? 'bg-amber-500' : 'bg-destructive';

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} />
      <span className="text-xs text-foreground flex-1">{name}</span>
      <div className="w-20">
        <Progress value={coverage} className="h-1.5" />
      </div>
      <span className={cn('text-[10px] font-mono w-12 text-right', statusColor)}>
        {coverage}%
      </span>
    </div>
  );
}

// ── Main Page ──
const AIAutopilotPage = () => {
  const navigate = useNavigate();
  const autopilot = useAIAutopilot();
  const { kpis, signals, recommendations, modules, isLoading } = autopilot;
  const { data: workerStatus } = useAutopilotStatus();
  const runWorkers = useRunAutopilotWorkers();

  const onlineModules = modules.filter(m => m.status === 'online').length;
  const systemHealth = modules.length > 0 ? Math.round((onlineModules / modules.length) * 100) : 0;

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">

          {/* Header */}
          <motion.div {...fadeIn(0)} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                  AI Investment Autopilot
                  <div className="flex items-center gap-1.5 ml-2">
                    <Radio className={cn('h-3 w-3', systemHealth >= 80 ? 'text-chart-1 animate-pulse' : 'text-amber-500')} />
                    <span className={cn('text-xs font-mono', systemHealth >= 80 ? 'text-chart-1' : 'text-amber-500')}>
                      {systemHealth}% Online
                    </span>
                  </div>
                </h1>
                <p className="text-xs text-muted-foreground">Autonomous intelligence • Continuous monitoring • Strategic guidance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/portfolio-command-center')} className="text-xs gap-1.5">
                <BarChart3 className="h-3 w-3" /> Portfolio
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/investor-dashboard')} className="text-xs gap-1.5">
                <DollarSign className="h-3 w-3" /> Investor Hub
              </Button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Initializing autopilot systems...</p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Strip */}
              <motion.div {...fadeIn(0.05)}>
                <Card className="bg-card border-border/40">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-4">
                      <KPIStat label="Tracked" value={kpis.totalOpportunitiesTracked.toLocaleString()} icon={Eye} color="text-foreground" />
                      <KPIStat label="Elite" value={kpis.eliteOpportunities} icon={Zap} color="text-amber-400" />
                      <KPIStat label="Prime" value={kpis.primeInvestments} icon={Target} color="text-chart-1" />
                      <KPIStat label="Hot Zones" value={kpis.hotZones} icon={Flame} color="text-orange-500" />
                      <KPIStat label="Cooling" value={kpis.coolingZones} icon={Shield} color="text-blue-400" />
                      <KPIStat label="Predictions" value={`${kpis.pricePredictionCoverage}%`} icon={Brain} color="text-primary" />
                      <KPIStat label="Confidence" value={`${kpis.avgConfidence}%`} icon={Activity} color={kpis.avgConfidence >= 60 ? 'text-chart-1' : 'text-chart-4'} />
                      <KPIStat label="Flips" value={kpis.flipOpportunities} icon={TrendingUp} color="text-chart-1" />
                      <KPIStat label="Risks" value={kpis.riskZones} icon={AlertTriangle} color="text-destructive" />
                      <KPIStat label="Deals" value={kpis.dealHunterActive} icon={MapPin} color="text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column — Signals */}
                <motion.div {...fadeIn(0.1)} className="lg:col-span-2 space-y-6">

                  {/* Live Intelligence Signals */}
                  <Card className="bg-card border-border/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Radio className="h-4 w-4 text-chart-1 animate-pulse" />
                        Live Intelligence Signals
                        <Badge variant="outline" className="text-[9px] h-5 ml-auto font-mono">
                          {signals.length} active
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {signals.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No active signals — all systems nominal</p>
                      ) : (
                        signals.map(s => <SignalCard key={s.id} signal={s} />)
                      )}
                    </CardContent>
                  </Card>

                  {/* Strategic Recommendations */}
                  <Card className="bg-card border-border/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        AI Strategic Recommendations
                        <Badge variant="outline" className="text-[9px] h-5 ml-auto font-mono">
                          {recommendations.length} actions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {recommendations.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">Portfolio is optimally balanced</p>
                      ) : (
                        recommendations.map((r, i) => <RecommendationCard key={i} rec={r} />)
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Navigation */}
                  <Card className="bg-card border-border/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Layers className="h-4 w-4 text-primary" />
                        Intelligence Modules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { label: 'Deal Finder', path: '/deal-finder', icon: Target },
                          { label: 'Price Prediction', path: '/price-prediction', icon: Brain },
                          { label: 'Market Trends', path: '/market-trends', icon: TrendingUp },
                          { label: 'Portfolio Builder', path: '/portfolio-builder', icon: BarChart3 },
                          { label: 'Leaderboard', path: '/investment-leaderboard', icon: Zap },
                          { label: 'Investment Advisor', path: '/investment-advisor', icon: Lightbulb },
                        ].map(item => (
                          <Button
                            key={item.path}
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2 text-xs h-9"
                            onClick={() => navigate(item.path)}
                          >
                            <item.icon className="h-3.5 w-3.5 text-primary" />
                            {item.label}
                            <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right Column — System Health */}
                <motion.div {...fadeIn(0.15)} className="space-y-6">

                  {/* System Health */}
                  <Card className="bg-card border-border/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Cpu className="h-4 w-4 text-primary" />
                        Autopilot Modules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-0.5">
                        {modules.map(m => (
                          <ModuleRow key={m.name} name={m.name} status={m.status} coverage={m.coverage} />
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">System Health</span>
                        <span className={cn('text-sm font-bold font-mono', systemHealth >= 80 ? 'text-chart-1' : systemHealth >= 50 ? 'text-amber-500' : 'text-destructive')}>
                          {systemHealth}%
                        </span>
                      </div>
                      <Progress value={systemHealth} className="h-2 mt-1.5" />
                    </CardContent>
                  </Card>

                  {/* Signal Distribution */}
                  <Card className="bg-card border-border/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Activity className="h-4 w-4 text-primary" />
                        Signal Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      {[
                        { label: 'Opportunities', count: signals.filter(s => s.severity === 'opportunity').length, color: 'bg-chart-1' },
                        { label: 'Warnings', count: signals.filter(s => s.severity === 'warning').length, color: 'bg-amber-500' },
                        { label: 'Critical', count: signals.filter(s => s.severity === 'critical').length, color: 'bg-destructive' },
                        { label: 'Info', count: signals.filter(s => s.severity === 'info').length, color: 'bg-primary' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                          <div className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
                          <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                          <span className="text-xs font-mono font-bold text-foreground">{item.count}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Autopilot Status */}
                  <Card className="bg-card border-border/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Radio className="h-4 w-4 text-primary" />
                        Autopilot Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="p-3 rounded-lg bg-muted/15 border border-border/20 text-center">
                        <div className={cn(
                          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
                          systemHealth >= 80 ? 'bg-chart-1/15 text-chart-1' :
                          systemHealth >= 50 ? 'bg-amber-500/15 text-amber-500' :
                          'bg-destructive/15 text-destructive'
                        )}>
                          <Radio className={cn('h-3 w-3', systemHealth >= 80 && 'animate-pulse')} />
                          {systemHealth >= 80 ? 'FULLY OPERATIONAL' :
                           systemHealth >= 50 ? 'PARTIALLY ACTIVE' :
                           'DEGRADED'}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground space-y-1">
                        <p>• Continuous opportunity monitoring active</p>
                        <p>• Market heat signals refreshed every 60s</p>
                        <p>• Price prediction engine running in background</p>
                        <p>• Deal hunter scanning for new opportunities</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AIAutopilotPage;
