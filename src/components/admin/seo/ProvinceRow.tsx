import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProvinceData {
  state: string;
  totalProperties: number;
  analyzedCount: number;
  avgSeoScore: number;
  avgKeywordScore: number;
  topKeywords: string[];
  status: string;
}

interface ProvinceRowProps {
  data: ProvinceData;
  rank: number;
  isSelected: boolean;
  isFilterActive: boolean;
  onToggleSelect: (state: string, checked: boolean) => void;
  onClickProvince: (state: string) => void;
  onQuickFix: (state: string) => void;
  isFixDisabled: boolean;
}

const ProvinceRow = React.memo(({
  data: s,
  rank,
  isSelected,
  isFilterActive,
  onToggleSelect,
  onClickProvince,
  onQuickFix,
  isFixDisabled,
}: ProvinceRowProps) => {
  const progressPct = s.totalProperties > 0 ? Math.round((s.analyzedCount / s.totalProperties) * 100) : 0;
  const scoreColor = s.avgSeoScore >= 70 ? 'text-chart-1' : s.avgSeoScore >= 40 ? 'text-chart-4' : s.avgSeoScore > 0 ? 'text-destructive' : 'text-muted-foreground';
  const barColor = s.avgSeoScore >= 70 ? 'bg-chart-1' : s.avgSeoScore >= 40 ? 'bg-chart-4' : s.avgSeoScore > 0 ? 'bg-destructive' : 'bg-muted';
  const statusIcon = s.status === 'good' ? '✅' : s.status === 'needs-work' ? '⚠️' : s.status === 'poor' ? '❌' : s.status === 'unanalyzed' ? '🔍' : '—';

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group",
        isSelected ? "border-primary/40 bg-primary/5" : "border-border/30 hover:border-border/60 hover:bg-accent/20",
        isFilterActive && "ring-1 ring-primary/30"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onToggleSelect(s.state, !!checked)}
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
      />

      <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">#{rank}</span>

      <div className="w-40 shrink-0" onClick={() => onClickProvince(s.state)}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{s.state}</span>
          <span className="text-[10px]">{statusIcon}</span>
        </div>
        <p className="text-[9px] text-muted-foreground">
          {s.totalProperties} properties · {s.analyzedCount} analyzed
        </p>
      </div>

      <div className="flex-1 min-w-0" onClick={() => onClickProvince(s.state)}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-4 rounded-full bg-muted/30 overflow-hidden relative">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
              style={{ width: `${s.avgSeoScore}%` }}
            />
            {s.avgSeoScore > 0 && (
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground/80">
                {s.avgSeoScore}/100
              </span>
            )}
          </div>
          <span className={cn("text-sm font-bold w-8 text-right tabular-nums", scoreColor)}>
            {s.avgSeoScore || '—'}
          </span>
        </div>
        {s.totalProperties > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
              <div className="h-full rounded-full bg-chart-2/60 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[8px] text-muted-foreground">{progressPct}% analyzed</span>
          </div>
        )}
      </div>

      <div className="w-16 text-center shrink-0">
        {s.analyzedCount > 0 ? (
          <div>
            <p className="text-xs font-bold">{s.avgKeywordScore}</p>
            <p className="text-[8px] text-muted-foreground">Keywords</p>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">—</span>
        )}
      </div>

      <div className="w-32 shrink-0 hidden md:block">
        <div className="flex flex-wrap gap-0.5">
          {s.topKeywords.length > 0 ? s.topKeywords.slice(0, 3).map(kw => (
            <Badge key={kw} variant="outline" className="text-[7px] px-1 py-0">{kw}</Badge>
          )) : <span className="text-[9px] text-muted-foreground">No keywords</span>}
        </div>
      </div>

      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[9px]"
          onClick={(e) => { e.stopPropagation(); onQuickFix(s.state); }}
          disabled={isFixDisabled || s.totalProperties === 0}
        >
          <Zap className="h-2.5 w-2.5 mr-0.5" /> Fix
        </Button>
      </div>
    </div>
  );
});

ProvinceRow.displayName = 'ProvinceRow';

export default ProvinceRow;
