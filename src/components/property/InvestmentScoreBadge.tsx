import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentScoreBadgeProps {
  score: number | null | undefined;
  grade?: string;
  compact?: boolean;
  className?: string;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  'A': 'bg-green-500/15 text-green-500 border-green-500/30',
  'B+': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  'B': 'bg-sky-500/15 text-sky-500 border-sky-500/30',
  'C': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'D': 'bg-destructive/15 text-destructive border-destructive/30',
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
  const gradeColor = GRADE_COLORS[resolvedGrade] || GRADE_COLORS['C'];

  if (compact) {
    return (
      <Badge variant="outline" className={cn('text-[9px] gap-0.5', gradeColor, className)}>
        <TrendingUp className="h-2.5 w-2.5" />
        {score}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn('text-[10px] gap-1', gradeColor, className)}>
      <TrendingUp className="h-3 w-3" />
      Score {score} · {resolvedGrade}
    </Badge>
  );
}
