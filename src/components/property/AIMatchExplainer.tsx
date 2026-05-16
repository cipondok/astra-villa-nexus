import { Brain, MapPin, Wallet, Waves, TrendingUp, Users, ShieldCheck, AlertCircle, Sparkles, Building } from 'lucide-react';
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
  if (n >= 1e9) return `IDR ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `IDR ${(n / 1e6).toFixed(0)}M`;
  return `IDR ${n.toLocaleString('id-ID')}`;
};

export default function AIMatchExplainer({
  matchScore,
  confidenceScore,
  property,
  userProfile,
  collaborativeOverlap = 0,
  className,
}: AIMatchExplainerProps) {
  // ── Build match reasons (max 5, ordered by signal strength) ──
  const reasons: { icon: React.ReactNode; text: string; weight: number }[] = [];

  // Location — strongest signal
  if (userProfile.preferred_city && property.city === userProfile.preferred_city) {
    reasons.push({
      icon: <MapPin className="h-3 w-3 text-chart-2" />,
      text: `Located in ${property.city} — your most-searched area`,
      weight: 6,
    });
  } else if (property.city && userProfile.preferred_city) {
    // City mismatch but still shown — explain why
    reasons.push({
      icon: <MapPin className="h-3 w-3 text-muted-foreground" />,
      text: `Outside your preferred area, but strong on other factors`,
      weight: 1,
    });
  }

  // Price proximity
  if (userProfile.avg_budget > 0 && property.price) {
    const diff = Math.abs(property.price - userProfile.avg_budget) / userProfile.avg_budget;
    if (diff <= 0.15) {
      reasons.push({
        icon: <Wallet className="h-3 w-3 text-chart-2" />,
        text: `Priced within 15% of your ${formatBudget(userProfile.avg_budget)} target`,
        weight: 5,
      });
    } else if (diff <= 0.30) {
      reasons.push({
        icon: <Wallet className="h-3 w-3 text-primary" />,
        text: `Within your flexible budget range (${formatBudget(userProfile.avg_budget)})`,
        weight: 3,
      });
    }
  }

  // Property type match
  if (userProfile.property_type_preference && property.property_type === userProfile.property_type_preference) {
    reasons.push({
      icon: <Building className="h-3 w-3 text-primary" />,
      text: `${property.property_type} — consistent with your browsing pattern`,
      weight: 4,
    });
  }

  // Feature match (pool)
  if (userProfile.pool_affinity_percent > 60 && property.has_pool) {
    reasons.push({
      icon: <Waves className="h-3 w-3 text-chart-4" />,
      text: `Includes pool — a feature in ${userProfile.pool_affinity_percent}% of your saved properties`,
      weight: 3,
    });
  }

  // Investment alignment
  if (property.investment_score && property.investment_score > 60 && userProfile.buyer_type === 'investor') {
    reasons.push({
      icon: <TrendingUp className="h-3 w-3 text-chart-2" />,
      text: `Investment score ${property.investment_score}/100 — aligned with your investor profile`,
      weight: 4,
    });
  } else if (property.investment_score && property.investment_score > 70 && userProfile.buyer_type === 'balanced') {
    reasons.push({
      icon: <TrendingUp className="h-3 w-3 text-primary" />,
      text: `Strong investment fundamentals (score: ${property.investment_score})`,
      weight: 2,
    });
  }

  // Collaborative filtering
  if (collaborativeOverlap >= 5) {
    reasons.push({
      icon: <Users className="h-3 w-3 text-accent-foreground" />,
      text: `Saved by ${collaborativeOverlap} buyers with similar preferences`,
      weight: 5,
    });
  } else if (collaborativeOverlap >= 2) {
    reasons.push({
      icon: <Users className="h-3 w-3 text-muted-foreground" />,
      text: `Also viewed by buyers with overlapping taste profiles`,
      weight: 2,
    });
  }

  // Fallback reason
  if (reasons.length === 0) {
    reasons.push({
      icon: <Sparkles className="h-3 w-3 text-primary" />,
      text: `Surfaced based on trending engagement across the platform`,
      weight: 1,
    });
  }

  // Sort by weight, take top 5
  reasons.sort((a, b) => b.weight - a.weight);
  const topReasons = reasons.slice(0, 5);

  // ── Confidence interpretation ──
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
    confidenceLabel = 'Learning';
    confidenceColor = 'text-muted-foreground';
    ConfidenceIcon = AlertCircle;
  }

  // ── Summary (max ~80 words, professional tone) ──
  const buyerLabel =
    userProfile.buyer_type === 'investor'
      ? 'investment-focused'
      : userProfile.buyer_type === 'lifestyle'
        ? 'lifestyle-oriented'
        : 'balanced';

  let summary: string;
  if (matchScore >= 80) {
    summary = `Strong match for your ${buyerLabel} profile. ASTRA AI cross-referenced your search history, saved properties, and engagement signals${userProfile.preferred_city ? ` in ${userProfile.preferred_city}` : ''} to identify this property as highly relevant to your criteria.`;
  } else if (matchScore >= 55) {
    summary = `This property aligns with key aspects of your preferences. Our scoring model evaluated location, pricing, features, and market signals to surface this recommendation. Continue engaging to sharpen future results.`;
  } else if (matchScore >= 30) {
    summary = `Partial match based on available data. As you save, view, and interact with more listings, ASTRA AI will refine its understanding of your ideal property profile.`;
  } else {
    summary = `Early-stage recommendation. ASTRA AI needs more interaction signals — browse, save, and contact properties that interest you to unlock personalized results.`;
  }

  // ── Match score color ──
  const scoreColor = matchScore >= 80
    ? 'text-chart-2'
    : matchScore >= 55
      ? 'text-primary'
      : 'text-muted-foreground';

  return (
    <div className={cn('rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 space-y-2.5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-[11px] font-bold text-foreground tracking-tight">AI Match Insight</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] font-semibold', scoreColor)}>{matchScore}% match</span>
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
        {topReasons.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-0.5 flex-shrink-0">{r.icon}</span>
            <span className="text-[10px] text-foreground/80">{r.text}</span>
          </li>
        ))}
      </ul>

      {/* Data depth indicator */}
      {userProfile.total_interactions < 10 && (
        <p className="text-[9px] text-muted-foreground/60 italic pt-0.5">
          Tip: Save and explore more properties to improve match accuracy.
        </p>
      )}
    </div>
  );
}
