import { motion } from 'framer-motion';

interface OpportunityScoreRingProps {
  score: number | null;
  size?: number;
  className?: string;
}

const OpportunityScoreRing = ({ score, size = 40, className = '' }: OpportunityScoreRingProps) => {
  if (score == null || score <= 0) return null;

  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const isElite = score >= 85;
  const isGood = score >= 60;

  const strokeColor = isElite
    ? 'hsl(var(--chart-2))'  // green for elite
    : isGood
      ? 'hsl(var(--chart-4))' // amber/yellow
      : 'hsl(var(--muted-foreground))';

  const bgStroke = 'hsl(var(--border))';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgStroke}
          strokeWidth={3}
          opacity={0.3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <span
        className="absolute text-[10px] font-bold"
        style={{ color: strokeColor }}
      >
        {score}
      </span>
      {isElite && (
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-chart-2 flex items-center justify-center">
          <span className="text-[6px] text-white font-bold">★</span>
        </div>
      )}
    </div>
  );
};

export default OpportunityScoreRing;
