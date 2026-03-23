import { Shield, Award, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrustTierBadgeProps {
  dealCount: number;
  reviewCount?: number;
  referralCount?: number;
  className?: string;
}

function getTrustTier(dealCount: number, referralCount: number) {
  if (dealCount >= 10 || referralCount >= 20) return { name: 'Premium Capital Partner', icon: Crown, color: 'text-chart-4' };
  if (dealCount >= 5 || referralCount >= 10) return { name: 'Active Portfolio Builder', icon: Award, color: 'text-primary' };
  if (dealCount >= 1) return { name: 'Verified Investor', icon: Shield, color: 'text-chart-1' };
  return null;
}

export default function TrustTierBadge({ dealCount, reviewCount = 0, referralCount = 0, className }: TrustTierBadgeProps) {
  const tier = getTrustTier(dealCount, referralCount);
  if (!tier) return null;

  const Icon = tier.icon;

  return (
    <Badge variant="outline" className={`gap-1 border-current/20 ${tier.color} ${className}`}>
      <Icon className="h-3 w-3" />
      {tier.name}
    </Badge>
  );
}
