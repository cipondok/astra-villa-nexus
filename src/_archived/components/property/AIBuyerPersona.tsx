import { User, TrendingUp, Shield, Flame, MapPin, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAiProfile {
  buyer_type: 'investor' | 'balanced' | 'lifestyle';
  preferred_city: string;
  avg_budget: number;
  pool_affinity_percent: number;
  property_type_preference: string;
  total_interactions: number;
  avg_investment_score_viewed?: number;
}

interface AIBuyerPersonaProps {
  profile: UserAiProfile;
  className?: string;
}

const formatBudget = (n: number) => {
  if (n >= 1e9) return `IDR ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `IDR ${(n / 1e6).toFixed(0)}M`;
  if (n > 0) return `IDR ${n.toLocaleString('id-ID')}`;
  return 'Not established';
};

function buildPersona(p: UserAiProfile) {
  const city = p.preferred_city || 'Indonesia';
  const type = p.property_type_preference || 'property';
  const avgInv = p.avg_investment_score_viewed ?? 0;

  // ── Title ──
  let title: string;
  if (p.buyer_type === 'investor') {
    title = `Strategic ${city} Investor`;
  } else if (p.buyer_type === 'lifestyle') {
    title = `${city} Lifestyle Seeker`;
  } else {
    title = `${city} Smart Buyer`;
  }

  // ── Summary ──
  let summary: string;
  if (p.buyer_type === 'investor') {
    summary = `You focus on high-yield ${type} opportunities in ${city} with strong ROI potential. Your browsing patterns indicate a data-driven approach, prioritizing investment metrics over lifestyle amenities.`;
  } else if (p.buyer_type === 'lifestyle') {
    summary = `You're drawn to ${type} properties in ${city} that offer comfort and lifestyle value${p.pool_affinity_percent > 60 ? ', with a clear preference for pool amenities' : ''}. Quality of living drives your decisions more than pure returns.`;
  } else {
    summary = `You evaluate ${type} properties in ${city} with a balanced eye — weighing both investment potential and lifestyle quality. Your approach suggests careful, well-rounded decision-making.`;
  }

  // ── Investment tendency ──
  let investmentTendency: string;
  if (p.buyer_type === 'investor') investmentTendency = 'Yield-Focused';
  else if (p.buyer_type === 'lifestyle') investmentTendency = 'Lifestyle-First';
  else investmentTendency = 'Balanced Growth';

  // ── Risk appetite ──
  let riskAppetite: 'Low' | 'Medium' | 'High';
  let riskColor: string;
  if (p.buyer_type === 'investor' && avgInv > 70) {
    riskAppetite = 'High';
    riskColor = 'text-destructive';
  } else if (p.buyer_type === 'investor' || avgInv > 50) {
    riskAppetite = 'Medium';
    riskColor = 'text-primary';
  } else {
    riskAppetite = 'Low';
    riskColor = 'text-chart-2';
  }

  return { title, summary, investmentTendency, riskAppetite, riskColor };
}

export default function AIBuyerPersona({ profile, className }: AIBuyerPersonaProps) {
  const { title, summary, investmentTendency, riskAppetite, riskColor } = buildPersona(profile);

  const iconBg =
    profile.buyer_type === 'investor'
      ? 'from-chart-1 to-chart-2'
      : profile.buyer_type === 'lifestyle'
        ? 'from-chart-4 to-accent'
        : 'from-primary to-accent';

  return (
    <div className={cn('rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 space-y-2.5', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={cn('h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md', iconBg)}>
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-foreground leading-tight">{title}</h3>
          <span className="text-[9px] text-muted-foreground font-medium">ASTRA AI Buyer Profile</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-[10px] leading-relaxed text-muted-foreground">{summary}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/30 bg-muted/30 px-2 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp className="h-2.5 w-2.5 text-primary" />
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Tendency</span>
          </div>
          <span className="text-[10px] font-semibold text-foreground">{investmentTendency}</span>
        </div>

        <div className="rounded-lg border border-border/30 bg-muted/30 px-2 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Flame className="h-2.5 w-2.5 text-primary" />
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Risk Appetite</span>
          </div>
          <span className={cn('text-[10px] font-semibold', riskColor)}>{riskAppetite}</span>
        </div>

        <div className="rounded-lg border border-border/30 bg-muted/30 px-2 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <MapPin className="h-2.5 w-2.5 text-primary" />
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Focus Area</span>
          </div>
          <span className="text-[10px] font-semibold text-foreground">{profile.preferred_city || 'Exploring'}</span>
        </div>

        <div className="rounded-lg border border-border/30 bg-muted/30 px-2 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Wallet className="h-2.5 w-2.5 text-primary" />
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Budget</span>
          </div>
          <span className="text-[10px] font-semibold text-foreground">{formatBudget(profile.avg_budget)}</span>
        </div>
      </div>
    </div>
  );
}
