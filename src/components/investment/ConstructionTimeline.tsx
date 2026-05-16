import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ConstructionPhase {
  name: string;
  estimatedDate?: string;
  completed: boolean;
  current: boolean;
}

interface ConstructionTimelineProps {
  phases: ConstructionPhase[];
  className?: string;
  compact?: boolean;
}

const DEFAULT_PHASES: ConstructionPhase[] = [
  { name: 'Planning', completed: true, current: false },
  { name: 'Groundbreaking', completed: true, current: false },
  { name: 'Structure', completed: false, current: true },
  { name: 'MEP', completed: false, current: false },
  { name: 'Finishing', completed: false, current: false },
  { name: 'Handover', completed: false, current: false },
];

export default function ConstructionTimeline({ phases = DEFAULT_PHASES, className, compact }: ConstructionTimelineProps) {
  const currentIdx = phases.findIndex(p => p.current);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-muted" />
        <div
          className="absolute top-3.5 left-4 h-0.5 bg-primary transition-all duration-700"
          style={{ width: `${Math.max(0, (currentIdx / (phases.length - 1)) * 100)}%` }}
        />

        {phases.map((phase, i) => (
          <div key={phase.name} className="relative flex flex-col items-center z-10" style={{ flex: 1 }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: phase.current ? [1, 1.15, 1] : 1 }}
              transition={phase.current ? { repeat: Infinity, duration: 2 } : {}}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors',
                phase.completed && 'bg-primary border-primary text-primary-foreground',
                phase.current && 'bg-primary/20 border-primary text-primary ring-2 ring-primary/30',
                !phase.completed && !phase.current && 'bg-muted border-border text-muted-foreground'
              )}
            >
              {phase.completed ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </motion.div>
            {!compact && (
              <>
                <span className={cn(
                  'text-[8px] sm:text-[9px] mt-1.5 text-center leading-tight font-medium',
                  phase.current ? 'text-primary' : phase.completed ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {phase.name}
                </span>
                {phase.estimatedDate && (
                  <span className="text-[7px] text-muted-foreground mt-0.5">{phase.estimatedDate}</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
