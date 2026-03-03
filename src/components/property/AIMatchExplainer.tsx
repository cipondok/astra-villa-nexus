import { Brain, MapPin, Wallet, Waves, TrendingUp, Users, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAiProfile {
  buyer_type: 'investor' | 'balanced' | 'lifestyle';
  preferred_city: string;
  avg_budget: number;
  pool_affinity_percent: number;
  property_type_preference: string;
  total_interactions: number;
}

interface AIMatchExplainerProps {
  matchScore: number;
  confidenceScore: number;
  property: {
    city?: string;
    price?: number;
    has_pool?: boolean;
    property_type?: string;
    investment_score?: number;
  };
  userProfile: UserAiProfile;
  collaborativeOverlap?: number;
  className?: string;
}

const formatBudget = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return n.toLocaleString('id-ID');
};

export default function AIMatchExplainer({
  matchScore,
  confidenceScore,
  property,
  userProfile,
  collaborativeOverlap = 0,
  className,
}: AIMatchExplainerProps) {
  // ── Build match reasons ──
  const reasons: { icon: React.ReactNode; text: string }[] = [];

  if (userProfile.preferred_city && property.city === userProfile.preferred_city) {
    reasons.push({
      icon: <MapPin className="h-3 w-3 text-chart-2" />,
      text: `Located in ${property.city}, your preferred area`,
    });
  }

  if (userProfile.avg_budget > 0 && property.price) {
    const diff = Math.abs(property.price - userProfile.avg_budget) / userProfile.avg_budget;
    if (diff <= 0.2) {
      reasons.push({
        icon: <Wallet className="h-3 w-3 text-chart-2" />,
        text: `Price closely matches your IDR ${formatBudget(userProfile.avg_budget)} budget range`,
      });
    } else if (diff <= 0.4) {
      reasons.push({
        icon: <Wallet className="h-3 w-3 text-primary" />,
        text: `Within your flexible budget range`,
      });
    }
  }

  if (userProfile.pool_affinity_percent > 60 && property.has_pool) {
    reasons.push({
      icon: <Waves className="h-3 w-3 text-chart-4" />,
      text: `Includes pool — a feature you consistently prefer`,
    });
  }

  if (userProfile.property_type_preference && property.property_type === userProfile.property_type_preference) {
    reasons.push({
      icon: <TrendingUp className="h-3 w-3 text-primary" />,
      text: `${property.property_type} matches your browsing pattern`,
    });
  }

  if (property.investment_score && property.investment_score > 60 && userProfile.buyer_type === 'investor') {
    reasons.push({
      icon: <TrendingUp className="h-3 w-3 text-chart-2" />,
      text: `High investment score (${property.investment_score}) aligned with your investor profile`,
    });
  }

  if (collaborativeOverlap >= 3) {
    reasons.push({
      icon: <Users className="h-3 w-3 text-accent-foreground" />,
      text: `Favored by ${collaborativeOverlap} buyers with similar preferences`,
    });
  }

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push({
      icon: <Sparkles className="h-3 w-3 text-primary" />,
      text: `Surfaced based on trending engagement signals`,
    });
  }

  // ── Confidence statement ──
  let confidenceLabel: string;
  let confidenceColor: string;
  let ConfidenceIcon: typeof ShieldCheck;

  if (confidenceScore >= 65) {
    confidenceLabel = 'High confidence';
    confidenceColor = 'text-chart-2';
    ConfidenceIcon = ShieldCheck;
  } else if (confidenceScore >= 35) {
    confidenceLabel = 'Medium confidence';
    confidenceColor = 'text-primary';
    ConfidenceIcon = ShieldCheck;
  } else {
    confidenceLabel = 'Still learning your preferences';
    confidenceColor = 'text-muted-foreground';
    ConfidenceIcon = AlertCircle;
  }

  // ── Summary paragraph ──
  const buyerLabel =
    userProfile.buyer_type === 'investor'
      ? 'investment-focused'
      : userProfile.buyer_type === 'lifestyle'
        ? 'lifestyle-oriented'
        : 'balanced';

  const summary = matchScore >= 75
    ? `This property is a strong match for your ${buyerLabel} profile${userProfile.preferred_city ? ` in ${userProfile.preferred_city}` : ''}. Our AI analyzed your browsing history, saved properties, and engagement patterns to surface this recommendation.`
    : matchScore >= 50
      ? `This property aligns with several of your preferences. As you continue browsing, ASTRA AI refines its understanding of your ideal property to deliver better matches.`
      : `This property was surfaced based on early signals from your activity. Save and explore more properties to help ASTRA AI learn your preferences faster.`;

  return (
    <div className={cn('rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 space-y-2.5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-[11px] font-bold text-foreground">AI Match Insight</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-primary">{matchScore}% match</span>
          <span className="text-[9px] text-muted-foreground">•</span>
          <span className={cn('text-[10px] font-medium flex items-center gap-0.5', confidenceColor)}>
            <ConfidenceIcon className="h-2.5 w-2.5" />
            {confidenceLabel}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-[10px] leading-relaxed text-muted-foreground">{summary}</p>

      {/* Reasons */}
      <ul className="space-y-1">
        {reasons.slice(0, 5).map((r, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-0.5 flex-shrink-0">{r.icon}</span>
            <span className="text-[10px] text-foreground/80">{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
