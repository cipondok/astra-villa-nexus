import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OpportunityScoreRingProps {
  score: number | null;
  size?: number;
  className?: string;
  /** Show label + investment tag below the ring */
  showLabel?: boolean;
}

const getScoreTier = (score: number) => {
  if (score >= 80) return {
    color: 'hsl(var(--chart-2))',        // emerald green
    glowColor: 'hsl(var(--chart-2) / 0.4)',
    textClass: 'text-chart-2',
    bgClass: 'bg-chart-2',
    tag: 'Strong Buy Signal',
    tier: 'elite',
  };
  if (score >= 60) return {
    color: 'hsl(var(--primary))',          // gold
    glowColor: 'hsl(var(--primary) / 0.3)',
    textClass: 'text-primary',
    bgClass: 'bg-primary',
    tag: 'Good Investment',
    tier: 'good',
  };
  if (score >= 40) return {
    color: 'hsl(var(--chart-4))',          // amber/orange
    glowColor: 'hsl(var(--chart-4) / 0.2)',
    textClass: 'text-chart-4',
    bgClass: 'bg-chart-4',
    tag: 'Moderate Potential',
    tier: 'moderate',
  };
  return {
    color: 'hsl(var(--muted-foreground))',
    glowColor: 'transparent',
    textClass: 'text-muted-foreground',
    bgClass: 'bg-muted-foreground',
    tag: 'Low Priority',
    tier: 'low',
  };
};

const OpportunityScoreRing = ({ score, size = 40, className = '', showLabel = false }: OpportunityScoreRingProps) => {
  if (score == null || score <= 0) return null;

  const strokeWidth = size >= 56 ? 4 : 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const tier = getScoreTier(score);
  const isElite = score >= 80;

  const bgStroke = 'hsl(var(--border))';

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      {/* Ring container */}
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Elite glow pulse */}
        {isElite && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 12px 2px ${tier.glowColor}` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgStroke}
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          {/* Animated progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tier.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />
        </svg>

        {/* Center score number */}
        <span
          className={cn('absolute font-bold', tier.textClass)}
          style={{ fontSize: size >= 56 ? '14px' : '10px' }}
        >
          {score}
        </span>

        {/* Elite star badge */}
        {isElite && (
          <motion.div
            className={cn('absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center', tier.bgClass)}
            style={{ width: size >= 56 ? 14 : 12, height: size >= 56 ? 14 : 12 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
          >
            <span className="text-white font-bold" style={{ fontSize: size >= 56 ? 8 : 6 }}>★</span>
          </motion.div>
        )}
      </div>

      {/* Label + tag (optional, for detail views) */}
      {showLabel && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">
            AI Investment Score
          </span>
          <span className={cn(
            'text-[8px] font-semibold px-1.5 py-0.5 rounded-full border',
            isElite
              ? 'bg-chart-2/10 text-chart-2 border-chart-2/20'
              : tier.tier === 'good'
                ? 'bg-primary/10 text-primary border-primary/20'
                : tier.tier === 'moderate'
                  ? 'bg-chart-4/10 text-chart-4 border-chart-4/20'
                  : 'bg-muted text-muted-foreground border-border/30'
          )}>
            {tier.tag}
          </span>
        </div>
      )}
    </div>
  );
};

export default OpportunityScoreRing;
