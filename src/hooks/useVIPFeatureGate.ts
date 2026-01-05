import { useMemo } from 'react';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';
import { useUserMembership } from '@/hooks/useUserMembership';

type FeatureKey = 
  | 'featured_listings'
  | 'priority_support'
  | 'concierge_service'
  | 'investment_advisory'
  | 'exclusive_events'
  | 'personal_advisor'
  | 'early_access'
  | 'market_insights';

interface FeatureConfig {
  requiredLevel: MembershipLevel;
  name: string;
  description: string;
}

export const VIP_FEATURES: Record<FeatureKey, FeatureConfig> = {
  featured_listings: {
    requiredLevel: 'gold',
    name: 'Featured Listings',
    description: 'Highlight your properties at the top of search results'
  },
  priority_support: {
    requiredLevel: 'vip',
    name: 'Priority Support',
    description: 'Get faster responses from our support team'
  },
  concierge_service: {
    requiredLevel: 'platinum',
    name: 'Concierge Service',
    description: 'Personal assistance for property transactions'
  },
  investment_advisory: {
    requiredLevel: 'platinum',
    name: 'Investment Advisory',
    description: 'Expert advice on property investments'
  },
  exclusive_events: {
    requiredLevel: 'platinum',
    name: 'Exclusive Events',
    description: 'Access to VIP property showcases and networking events'
  },
  personal_advisor: {
    requiredLevel: 'diamond',
    name: 'Personal Advisor',
    description: 'Dedicated property advisor assigned to you'
  },
  early_access: {
    requiredLevel: 'diamond',
    name: 'Early Access',
    description: 'First access to new listings before public release'
  },
  market_insights: {
    requiredLevel: 'gold',
    name: 'Market Insights',
    description: 'Detailed market analysis and trends reports'
  }
};

function getLevelPriority(level: MembershipLevel): number {
  return MEMBERSHIP_LEVELS[level]?.priority ?? 0;
}

export function hasMinimumLevel(userLevel: MembershipLevel, requiredLevel: MembershipLevel): boolean {
  return getLevelPriority(userLevel) >= getLevelPriority(requiredLevel);
}

interface VIPFeatureGateResult {
  canAccess: boolean;
  userLevel: MembershipLevel;
  requiredLevel: MembershipLevel;
  feature: FeatureConfig;
  isLoading: boolean;
  upgradeNeeded: boolean;
}

export function useVIPFeatureGate(featureKey: FeatureKey): VIPFeatureGateResult {
  const { membershipLevel, isLoading } = useUserMembership();
  
  const feature = VIP_FEATURES[featureKey];
  const canAccess = hasMinimumLevel(membershipLevel, feature.requiredLevel);
  
  return {
    canAccess,
    userLevel: membershipLevel,
    requiredLevel: feature.requiredLevel,
    feature,
    isLoading,
    upgradeNeeded: !canAccess
  };
}

// Check multiple features at once
export function useVIPFeatures(featureKeys: FeatureKey[]): Record<FeatureKey, boolean> {
  const { membershipLevel } = useUserMembership();
  
  return useMemo(() => {
    const result = {} as Record<FeatureKey, boolean>;
    featureKeys.forEach(key => {
      const feature = VIP_FEATURES[key];
      result[key] = hasMinimumLevel(membershipLevel, feature.requiredLevel);
    });
    return result;
  }, [membershipLevel, featureKeys]);
}

export default useVIPFeatureGate;
