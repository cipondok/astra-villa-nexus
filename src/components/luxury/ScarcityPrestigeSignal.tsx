/**
 * Scarcity & Prestige Signal Component
 * Displays urgency and exclusivity indicators
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLuxuryMicrocopy } from '@/hooks/useLuxuryMicrocopy';

interface ScarcityPrestigeSignalProps {
  type: 'scarcity' | 'prestige' | 'urgency' | 'private';
  data?: Record<string, unknown>;
  className?: string;
}

const SIGNAL_CONFIG = {
  scarcity: { icon: Clock, bgClass: 'bg-amber-500/10 border-amber-500/20', textClass: 'text-amber-400' },
  prestige: { icon: TrendingUp, bgClass: 'bg-emerald-500/10 border-emerald-500/20', textClass: 'text-emerald-400' },
  urgency: { icon: Eye, bgClass: 'bg-primary/10 border-primary/20', textClass: 'text-primary' },
  private: { icon: Lock, bgClass: 'bg-purple-500/10 border-purple-500/20', textClass: 'text-purple-400' },
};

const ScarcityPrestigeSignal = memo(({ type, data, className }: ScarcityPrestigeSignalProps) => {
  const copy = useLuxuryMicrocopy();
  const config = SIGNAL_CONFIG[type];
  const Icon = config.icon;

  const getText = () => {
    switch (type) {
      case 'scarcity': return copy.signal('scarcity', data);
      case 'prestige': return copy.signal('prestige', data);
      case 'urgency': return copy.signal('urgency', data);
      case 'private': return 'Private listing — exclusive investor access';
    }
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{getText()}</span>
    </motion.div>
  );
});

ScarcityPrestigeSignal.displayName = 'ScarcityPrestigeSignal';

export default ScarcityPrestigeSignal;
