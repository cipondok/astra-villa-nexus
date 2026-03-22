import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Brain, Sparkles, BarChart3, Settings2, BookOpen,
  TrendingUp, Zap, AlertTriangle, Bot, ChevronRight,
  Activity, Target, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface AIControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIControlPanel = ({ isOpen, onClose }: AIControlPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[200]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-96 z-[201] bg-card border-l border-border/40 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">AI Control Center</h2>
                  <p className="text-[10px] text-muted-foreground">Intelligence & Automation</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <Tabs defaultValue="insights" className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-4 mt-3 h-8 bg-muted/40 border border-border/30 p-0.5 shrink-0">
                <TabsTrigger value="insights" className="text-[10px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1">
                  <Sparkles className="h-3 w-3" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="automation" className="text-[10px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1">
                  <Zap className="h-3 w-3" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="predictions" className="text-[10px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="learning" className="text-[10px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1">
                  <BookOpen className="h-3 w-3" />
                  Learning
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 min-h-0">
                <TabsContent value="insights" className="p-4 space-y-3 mt-0">
                  <InsightCard
                    icon={TrendingUp}
                    title="Market Momentum"
                    value="Accelerating"
                    detail="Bali inquiry volume up 34% week-over-week"
                    color="text-chart-1"
                  />
                  <InsightCard
                    icon={AlertTriangle}
                    title="Price Imbalance Detected"
                    value="Seminyak"
                    detail="Villa prices 18% above FMV — correction likely within 60 days"
                    color="text-chart-3"
                  />
                  <InsightCard
                    icon={Activity}
                    title="Liquidity Index"
                    value="78/100"
                    detail="Strong buyer demand across 4 primary districts"
                    color="text-chart-2"
                  />
                  <InsightCard
                    icon={Shield}
                    title="Fraud Risk Level"
                    value="Low"
                    detail="All active vendors pass verification threshold"
                    color="text-chart-1"
                  />
                </TabsContent>

                <TabsContent value="automation" className="p-4 space-y-3 mt-0">
                  <AutomationItem title="Auto-verify trusted vendors" status="active" savings="4.2 hrs/week" />
                  <AutomationItem title="Smart lead routing" status="active" savings="12 leads/day" />
                  <AutomationItem title="Price alert notifications" status="paused" savings="—" />
                  <AutomationItem title="Listing quality scoring" status="active" savings="23% faster reviews" />

                  <div className="pt-2">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Automations</h4>
                    <div className="space-y-2">
                      <SuggestionCard text="Auto-approve vendors with Trust Score > 90 to unlock Rp 240M projected revenue" />
                      <SuggestionCard text="Schedule premium listing promotions for high-demand periods (Fri-Sun)" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="predictions" className="p-4 space-y-3 mt-0">
                  <PredictionItem label="Next month deal closings" predicted="47" confidence={82} trend="up" />
                  <PredictionItem label="Revenue forecast (30d)" predicted="Rp 1.2B" confidence={75} trend="up" />
                  <PredictionItem label="New vendor signups" predicted="23" confidence={68} trend="stable" />
                  <PredictionItem label="Buyer inquiry volume" predicted="1,240" confidence={88} trend="up" />
                </TabsContent>

                <TabsContent value="learning" className="p-4 space-y-3 mt-0">
                  <LearningMetric label="Price Prediction Accuracy" value={91} delta="+2.3%" />
                  <LearningMetric label="Lead Scoring Precision" value={87} delta="+1.1%" />
                  <LearningMetric label="Fraud Detection Rate" value={96} delta="+0.4%" />
                  <LearningMetric label="Deal Close Prediction" value={79} delta="+3.8%" />
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground">Last training cycle: 2h ago · Next: in 4h</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Data points processed: 24,847 this week</p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InsightCard = ({ icon: Icon, title, value, detail, color }: { icon: any; title: string; value: string; detail: string; color: string }) => (
  <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
    <div className="flex items-center gap-2 mb-1.5">
      <Icon className={cn("h-3.5 w-3.5", color)} />
      <span className="text-[11px] font-medium text-foreground">{title}</span>
    </div>
    <div className={cn("text-base font-bold mb-1", color)}>{value}</div>
    <p className="text-[10px] text-muted-foreground leading-relaxed">{detail}</p>
  </div>
);

const AutomationItem = ({ title, status, savings }: { title: string; status: 'active' | 'paused'; savings: string }) => (
  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40">
    <div className="flex items-center gap-2">
      <div className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? 'bg-chart-1' : 'bg-muted-foreground')} />
      <span className="text-[11px] font-medium text-foreground">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground">{savings}</span>
      <Badge variant={status === 'active' ? 'default' : 'secondary'} className="text-[8px] px-1.5 py-0 h-4">
        {status}
      </Badge>
    </div>
  </div>
);

const SuggestionCard = ({ text }: { text: string }) => (
  <div className="p-2.5 rounded-lg border border-dashed border-chart-3/30 bg-chart-3/5">
    <div className="flex items-start gap-2">
      <Bot className="h-3.5 w-3.5 text-chart-3 mt-0.5 shrink-0" />
      <p className="text-[10px] text-foreground leading-relaxed">{text}</p>
    </div>
    <div className="flex gap-2 mt-2">
      <Button size="sm" className="h-6 text-[9px] px-2">Approve</Button>
      <Button size="sm" variant="ghost" className="h-6 text-[9px] px-2">Dismiss</Button>
    </div>
  </div>
);

const PredictionItem = ({ label, predicted, confidence, trend }: { label: string; predicted: string; confidence: number; trend: 'up' | 'down' | 'stable' }) => (
  <div className="p-3 rounded-lg border border-border/40">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[11px] font-medium text-foreground">{label}</span>
      <TrendingUp className={cn("h-3 w-3", trend === 'up' ? 'text-chart-1' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground')} />
    </div>
    <div className="text-lg font-bold text-foreground tabular-nums">{predicted}</div>
    <div className="flex items-center gap-2 mt-1.5">
      <Progress value={confidence} className="h-1 flex-1" />
      <span className="text-[9px] text-muted-foreground tabular-nums">{confidence}%</span>
    </div>
  </div>
);

const LearningMetric = ({ label, value, delta }: { label: string; value: number; delta: string }) => (
  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40">
    <div>
      <span className="text-[11px] font-medium text-foreground block">{label}</span>
      <span className="text-[9px] text-chart-1">{delta} vs last cycle</span>
    </div>
    <div className="flex items-center gap-2">
      <Progress value={value} className="h-1.5 w-16" />
      <span className="text-sm font-bold tabular-nums text-foreground">{value}%</span>
    </div>
  </div>
);

export default AIControlPanel;
