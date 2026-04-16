/**
 * Luxury Trust Bar
 * Displays institutional-grade trust signals across the platform
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Globe, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLuxuryMicrocopy } from '@/hooks/useLuxuryMicrocopy';

interface LuxuryTrustBarProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const LuxuryTrustBar = memo(({ variant = 'compact', className }: LuxuryTrustBarProps) => {
  const copy = useLuxuryMicrocopy();

  const signals = [
    { icon: Shield, text: copy.trust('escrow') },
    { icon: Lock, text: copy.trust('institutional') },
    { icon: Award, text: copy.trust('legal') },
    { icon: Globe, text: copy.trust('exclusive') },
  ];

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center gap-4 overflow-x-auto scrollbar-hide py-2 px-1',
        className
      )}>
        {signals.slice(0, 3).map((s, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-1.5 shrink-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <s.icon className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{s.text}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl',
      'bg-card/30 border border-border/20 backdrop-blur-sm',
      className
    )}>
      {signals.map((s, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2 p-3 rounded-lg bg-background/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
            <s.icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground leading-tight">{s.text}</span>
        </motion.div>
      ))}
    </div>
  );
});

LuxuryTrustBar.displayName = 'LuxuryTrustBar';

export default LuxuryTrustBar;
