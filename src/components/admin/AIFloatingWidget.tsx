import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, AlertTriangle, TrendingUp, ShieldCheck, 
  ChevronRight, Zap, Bell, BarChart3, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AISignal {
  id: string;
  type: 'alert' | 'opportunity' | 'insight' | 'action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const generateSignals = (): AISignal[] => [
  {
    id: '1',
    type: 'alert',
    title: 'Vendor verification needed',
    description: '3 vendors pending KYC review for over 48 hours',
    priority: 'high',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Revenue opportunity detected',
    description: 'Bali villa cluster shows 23% price imbalance — premium listing upsell window',
    priority: 'medium',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '3',
    type: 'insight',
    title: 'Inquiry velocity spike',
    description: 'Seminyak district inquiries up 47% vs last week — consider featured placement push',
    priority: 'medium',
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: '4',
    type: 'action',
    title: 'Auto-approve suggestion',
    description: 'Approve 5 verified vendors to unlock Rp 240M projected revenue pipeline',
    priority: 'low',
    timestamp: new Date(Date.now() - 900000),
  },
];

const typeConfig = {
  alert: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  opportunity: { icon: TrendingUp, color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20' },
  insight: { icon: BarChart3, color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/20' },
  action: { icon: Zap, color: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20' },
};

export const AIFloatingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [signals] = useState<AISignal[]>(generateSignals);
  const [hasNew, setHasNew] = useState(true);

  const highPriorityCount = signals.filter(s => s.priority === 'high').length;

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setHasNew(false); }}
        className={cn(
          "fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          "bg-primary text-primary-foreground shadow-lg hover:shadow-xl",
          "border border-primary/20"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="h-5 w-5" />
        {hasNew && highPriorityCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-[10px] text-destructive-foreground font-bold">
            {highPriorityCount}
          </span>
        )}
        {/* Pulse ring */}
        {hasNew && (
          <span className="absolute inset-0 rounded-xl bg-primary/30 animate-ping" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-[100] w-80 max-h-[480px] rounded-xl border border-border/50 bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">AI Intelligence</h3>
                  <p className="text-[9px] text-muted-foreground">Live signals & recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Signal Feed */}
            <ScrollArea className="flex-1 max-h-[380px]">
              <div className="p-2 space-y-1.5">
                {signals.map((signal) => {
                  const config = typeConfig[signal.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={signal.id}
                      className={cn(
                        "p-2.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30",
                        config.border, config.bg
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", config.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-medium text-foreground line-clamp-1">{signal.title}</span>
                            {signal.priority === 'high' && (
                              <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5">urgent</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                            {signal.description}
                          </p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-border/30">
              <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] text-muted-foreground">
                View all intelligence signals
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFloatingWidget;
