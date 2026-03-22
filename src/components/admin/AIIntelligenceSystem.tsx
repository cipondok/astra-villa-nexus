import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, TrendingUp, Zap, BarChart3, Bot,
  Activity, Shield, Sparkles, BookOpen, X, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAISignals } from '@/hooks/useAISignals';

/* ──────────────────────────────────────────
   Signal type → visual config
   ────────────────────────────────────────── */
type SystemStatus = 'nominal' | 'warning' | 'danger' | 'opportunity';

interface InternalSignal {
  id: string;
  type: 'alert' | 'opportunity' | 'insight' | 'action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const typeConfig = {
  alert:       { icon: AlertTriangle, color: 'text-destructive',    bg: 'bg-destructive/10', border: 'border-destructive/20' },
  opportunity: { icon: TrendingUp,    color: 'text-chart-1',        bg: 'bg-chart-1/10',     border: 'border-chart-1/20' },
  insight:     { icon: BarChart3,     color: 'text-chart-2',        bg: 'bg-chart-2/10',     border: 'border-chart-2/20' },
  action:      { icon: Zap,           color: 'text-chart-3',        bg: 'bg-chart-3/10',     border: 'border-chart-3/20' },
};

const statusColors: Record<SystemStatus, string> = {
  nominal:     'bg-chart-1',
  warning:     'bg-chart-3',
  danger:      'bg-destructive',
  opportunity: 'bg-chart-2',
};

const statusGlow: Record<SystemStatus, string> = {
  nominal:     'shadow-none',
  warning:     'shadow-[0_0_12px_hsl(var(--chart-3)/0.4)]',
  danger:      'shadow-[0_0_12px_hsl(var(--destructive)/0.5)]',
  opportunity: 'shadow-[0_0_12px_hsl(var(--chart-2)/0.4)]',
};

/* ──────────────────────────────────────────
   Fallback signals when DB is empty
   ────────────────────────────────────────── */
const fallbackSignals: InternalSignal[] = [
  { id: 'f1', type: 'alert', title: 'Vendor verification needed', description: '3 vendors pending KYC review for over 48 hours', priority: 'high' },
  { id: 'f2', type: 'opportunity', title: 'Revenue opportunity detected', description: 'Bali villa cluster shows 23% price imbalance — premium listing upsell window', priority: 'medium' },
  { id: 'f3', type: 'insight', title: 'Inquiry velocity spike', description: 'Seminyak district inquiries up 47% vs last week', priority: 'medium' },
  { id: 'f4', type: 'action', title: 'Auto-approve suggestion', description: 'Approve 5 verified vendors to unlock Rp 240M projected revenue pipeline', priority: 'low' },
];

/* ──────────────────────────────────────────
   Unified AI Intelligence System
   ────────────────────────────────────────── */
interface Props {
  onPriorityChange?: (priorities: string[]) => void;
}

export const AIIntelligenceSystem = ({ onPriorityChange }: Props) => {
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const { data: dbSignals } = useAISignals(true);

  // Map DB signals to internal format, fallback to static
  const signals: InternalSignal[] = useMemo(() => {
    if (dbSignals && dbSignals.length > 0) {
      return dbSignals.map(s => ({
        id: s.id,
        type: (s.signal_type === 'fraud_risk' ? 'alert' :
              s.signal_type === 'revenue_opportunity' ? 'opportunity' :
              s.signal_type === 'demand_spike' ? 'insight' : 'action') as InternalSignal['type'],
        title: s.signal_type.replace(/_/g, ' '),
        description: JSON.stringify(s.predicted_value).slice(0, 100),
        priority: s.severity === 'critical' || s.severity === 'high' ? 'high' as const :
                  s.severity === 'medium' ? 'medium' as const : 'low' as const,
      }));
    }
    return fallbackSignals;
  }, [dbSignals]);

  // Determine system status
  const systemStatus: SystemStatus = useMemo(() => {
    const hasHigh = signals.some(s => s.priority === 'high' && s.type === 'alert');
    const hasWarning = signals.some(s => s.priority === 'medium' && s.type === 'alert');
    const hasOpp = signals.some(s => s.type === 'opportunity');
    if (hasHigh) return 'danger';
    if (hasWarning) return 'warning';
    if (hasOpp) return 'opportunity';
    return 'nominal';
  }, [signals]);

  const highCount = signals.filter(s => s.priority === 'high').length;

  // Notify parent about priority sections
  useEffect(() => {
    if (!onPriorityChange) return;
    const priorities: string[] = [];
    if (signals.some(s => s.type === 'alert' && s.priority === 'high')) priorities.push('verification');
    if (signals.some(s => s.type === 'opportunity')) priorities.push('revenue');
    if (signals.some(s => s.type === 'insight')) priorities.push('marketplace');
    onPriorityChange(priorities);
  }, [signals, onPriorityChange]);

  const openCommandCenter = useCallback(() => {
    setCommandCenterOpen(true);
  }, []);

  return (
    <>
      {/* ─── GLOBAL STATUS INDICATOR ─── */}
      <motion.button
        onClick={openCommandCenter}
        className={cn(
          "fixed bottom-5 right-5 z-[100] w-11 h-11 rounded-astra flex items-center justify-center",
          "border border-border/40 bg-card text-foreground transition-all duration-300",
          statusGlow[systemStatus]
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open AI Command Center"
      >
        <Brain className="h-4.5 w-4.5" />
        {/* Status dot */}
        <span className={cn(
          "absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-card",
          statusColors[systemStatus]
        )} />
        {/* Count badge */}
        {highCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-[8px] text-destructive-foreground font-bold tabular-nums">
            {highCount}
          </span>
        )}
        {/* Pulse for danger/warning */}
        {systemStatus !== 'nominal' && (
          <motion.span
            className={cn("absolute inset-0 rounded-astra", statusColors[systemStatus], "opacity-20")}
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.button>

      {/* ─── COMMAND CENTER (slide-out) ─── */}
      <AnimatePresence>
        {commandCenterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-[200]"
              onClick={() => setCommandCenterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed top-0 right-0 h-screen w-[360px] z-[201] bg-card border-l border-border/30 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/20 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", statusColors[systemStatus] + '/15')}>
                    <Brain className={cn("h-3.5 w-3.5", systemStatus === 'danger' ? 'text-destructive' : systemStatus === 'warning' ? 'text-chart-3' : 'text-primary')} />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-foreground">Command Center</h2>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusColors[systemStatus])} />
                      <span className="text-[9px] text-muted-foreground capitalize">{systemStatus}</span>
                      <span className="text-[9px] text-muted-foreground">· {signals.length} signals</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCommandCenterOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                  aria-label="Close command center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="signals" className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-3 mt-2.5 h-7 bg-muted/30 border border-border/20 p-0.5 shrink-0">
                  <TabsTrigger value="signals" className="text-[9px] h-6 px-2 data-[state=active]:bg-background gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" />Signals
                  </TabsTrigger>
                  <TabsTrigger value="automation" className="text-[9px] h-6 px-2 data-[state=active]:bg-background gap-1">
                    <Zap className="h-2.5 w-2.5" />Auto
                  </TabsTrigger>
                  <TabsTrigger value="predictions" className="text-[9px] h-6 px-2 data-[state=active]:bg-background gap-1">
                    <TrendingUp className="h-2.5 w-2.5" />Predict
                  </TabsTrigger>
                  <TabsTrigger value="learning" className="text-[9px] h-6 px-2 data-[state=active]:bg-background gap-1">
                    <BookOpen className="h-2.5 w-2.5" />Learn
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 min-h-0">
                  {/* SIGNALS TAB */}
                  <TabsContent value="signals" className="p-3 space-y-1.5 mt-0">
                    {signals.map((signal) => {
                      const cfg = typeConfig[signal.type];
                      const Icon = cfg.icon;
                      return (
                        <div key={signal.id} className={cn("p-2 rounded-lg border transition-colors cursor-pointer hover:bg-muted/20", cfg.border, cfg.bg)}>
                          <div className="flex items-start gap-2">
                            <Icon className={cn("h-3 w-3 mt-0.5 shrink-0", cfg.color)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[10px] font-medium text-foreground line-clamp-1">{signal.title}</span>
                                {signal.priority === 'high' && (
                                  <Badge variant="destructive" className="text-[7px] px-1 py-0 h-3">urgent</Badge>
                                )}
                              </div>
                              <p className="text-[9px] text-muted-foreground leading-snug line-clamp-2">{signal.description}</p>
                            </div>
                            <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {/* AUTOMATION TAB */}
                  <TabsContent value="automation" className="p-3 space-y-2 mt-0">
                    <AutomationRow title="Auto-verify trusted vendors" status="active" savings="4.2 hrs/week" />
                    <AutomationRow title="Smart lead routing" status="active" savings="12 leads/day" />
                    <AutomationRow title="Price alert notifications" status="paused" savings="—" />
                    <AutomationRow title="Listing quality scoring" status="active" savings="23% faster" />
                    <div className="pt-2">
                      <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Suggested</h4>
                      <SuggestionRow text="Auto-approve vendors with Trust Score > 90 to unlock Rp 240M revenue" />
                      <SuggestionRow text="Schedule premium listing promotions for Fri-Sun peak demand" />
                    </div>
                  </TabsContent>

                  {/* PREDICTIONS TAB */}
                  <TabsContent value="predictions" className="p-3 space-y-2 mt-0">
                    <PredictionRow label="Deal closings (30d)" value="47" confidence={82} trend="up" />
                    <PredictionRow label="Revenue forecast" value="Rp 1.2B" confidence={75} trend="up" />
                    <PredictionRow label="New vendors" value="23" confidence={68} trend="stable" />
                    <PredictionRow label="Inquiry volume" value="1,240" confidence={88} trend="up" />
                  </TabsContent>

                  {/* LEARNING TAB */}
                  <TabsContent value="learning" className="p-3 space-y-2 mt-0">
                    <LearningRow label="Price Prediction" value={91} delta="+2.3%" />
                    <LearningRow label="Lead Scoring" value={87} delta="+1.1%" />
                    <LearningRow label="Fraud Detection" value={96} delta="+0.4%" />
                    <LearningRow label="Deal Close Prediction" value={79} delta="+3.8%" />
                    <div className="pt-2 border-t border-border/20">
                      <p className="text-[9px] text-muted-foreground">Last cycle: 2h ago · Next: 4h · 24,847 data points this week</p>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Sub-components (compact) ─── */

const AutomationRow = ({ title, status, savings }: { title: string; status: 'active' | 'paused'; savings: string }) => (
  <div className="flex items-center justify-between p-2 rounded-lg border border-border/30">
    <div className="flex items-center gap-1.5">
      <div className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? 'bg-chart-1' : 'bg-muted-foreground')} />
      <span className="text-[10px] font-medium text-foreground">{title}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] text-muted-foreground">{savings}</span>
      <Badge variant={status === 'active' ? 'default' : 'secondary'} className="text-[7px] px-1 py-0 h-3.5">{status}</Badge>
    </div>
  </div>
);

const SuggestionRow = ({ text }: { text: string }) => (
  <div className="p-2 rounded-lg border border-dashed border-chart-3/20 bg-chart-3/5 mb-1.5">
    <div className="flex items-start gap-1.5">
      <Bot className="h-3 w-3 text-chart-3 mt-0.5 shrink-0" />
      <p className="text-[9px] text-foreground leading-snug">{text}</p>
    </div>
    <div className="flex gap-1.5 mt-1.5">
      <Button size="sm" className="h-5 text-[8px] px-1.5">Approve</Button>
      <Button size="sm" variant="ghost" className="h-5 text-[8px] px-1.5">Dismiss</Button>
    </div>
  </div>
);

const PredictionRow = ({ label, value, confidence, trend }: { label: string; value: string; confidence: number; trend: 'up' | 'down' | 'stable' }) => (
  <div className="p-2.5 rounded-lg border border-border/30">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-medium text-foreground">{label}</span>
      <TrendingUp className={cn("h-2.5 w-2.5", trend === 'up' ? 'text-chart-1' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground')} />
    </div>
    <div className="text-base font-bold text-foreground tabular-nums leading-none">{value}</div>
    <div className="flex items-center gap-1.5 mt-1.5">
      <Progress value={confidence} className="h-1 flex-1" />
      <span className="text-[8px] text-muted-foreground tabular-nums">{confidence}%</span>
    </div>
  </div>
);

const LearningRow = ({ label, value, delta }: { label: string; value: number; delta: string }) => (
  <div className="flex items-center justify-between p-2 rounded-lg border border-border/30">
    <div>
      <span className="text-[10px] font-medium text-foreground block">{label}</span>
      <span className="text-[8px] text-chart-1">{delta}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Progress value={value} className="h-1 w-14" />
      <span className="text-xs font-bold tabular-nums text-foreground">{value}%</span>
    </div>
  </div>
);

export default AIIntelligenceSystem;
