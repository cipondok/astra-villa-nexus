import { memo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Handshake, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = [
  { icon: MessageCircle, label: 'Inquiry', active: true },
  { icon: Handshake, label: 'Negotiation', active: false },
  { icon: Shield, label: 'Escrow', active: false },
  { icon: CheckCircle2, label: 'Completion', active: false },
];

interface DealActionTimelineProps {
  currentStage?: number; // 0-3
}

const DealActionTimeline = memo(({ currentStage = 0 }: DealActionTimelineProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="rounded-xl border border-border/50 bg-card p-3"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <ArrowRight className="h-3 w-3 text-primary" />
        <h3 className="text-xs font-bold text-foreground">Your Investment Journey</h3>
      </div>

      <div className="flex items-center justify-between">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = i === currentStage;
          const isDone = i < currentStage;
          const isFuture = i > currentStage;
          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                  isActive && 'border-primary bg-primary/10 ring-2 ring-primary/20',
                  isDone && 'border-emerald-500 bg-emerald-500/10',
                  isFuture && 'border-border/40 bg-muted/30',
                )}>
                  <Icon className={cn(
                    'h-3.5 w-3.5',
                    isActive && 'text-primary',
                    isDone && 'text-emerald-500',
                    isFuture && 'text-muted-foreground/50',
                  )} />
                </div>
                <span className={cn(
                  'text-[9px] font-medium text-center',
                  isActive && 'text-primary font-bold',
                  isDone && 'text-emerald-500',
                  isFuture && 'text-muted-foreground/60',
                )}>
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn(
                  'h-px flex-1 mx-1 -mt-4',
                  isDone ? 'bg-emerald-500/40' : 'bg-border/30',
                )} />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-muted-foreground text-center mt-2 italic">
        Start your journey — make an inquiry or reserve directly via secure escrow.
      </p>
    </motion.div>
  );
});

DealActionTimeline.displayName = 'DealActionTimeline';
export default DealActionTimeline;
