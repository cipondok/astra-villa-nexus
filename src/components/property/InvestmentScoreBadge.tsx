import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentScoreBadgeProps {
  score: number | null | undefined;
  grade?: string;
  compact?: boolean;
  className?: string;
}

const GRADE_CONFIG: Record<string, { color: string; glow: string }> = {
  'A+': {
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    glow: '',
  },
  'A': {
    color: 'bg-green-500/20 text-green-400 border-green-500/40',
    glow: '',
  },
  'B+': {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    glow: '',
  },
  'B': {
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    glow: '',
  },
  'C': {
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    glow: '',
  },
  'D': {
    color: 'bg-destructive/20 text-destructive border-destructive/40',
    glow: '',
  },
};

function getGrade(score: number): string {
  if (score >= 85) return 'A+';
  if (score >= 75) return 'A';
  if (score >= 65) return 'B+';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

export default function InvestmentScoreBadge({ score, grade, compact = false, className }: InvestmentScoreBadgeProps) {
  if (!score || score <= 0) return null;

  const resolvedGrade = grade || getGrade(score);
  const config = GRADE_CONFIG[resolvedGrade] || GRADE_CONFIG['C'];

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-[10px] gap-0.5 backdrop-blur-md font-bold',
          config.color,
          score >= 75 && config.glow,
          className
        )}
      >
        <TrendingUp className="h-2.5 w-2.5" />
        {score}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[11px] gap-1 backdrop-blur-md font-bold',
        config.color,
        score >= 75 && config.glow,
        className
      )}
    >
      <TrendingUp className="h-3 w-3" />
      Score {score} · {resolvedGrade}
    </Badge>
  );
}
