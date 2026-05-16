// User Membership & Verification Levels — Premium 4-Tier System

export type MembershipLevel = 
  | 'free'
  | 'pro_agent'
  | 'developer'
  | 'vip_investor';

export type VerificationStatus = 
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended';

export interface MembershipConfig {
  level: MembershipLevel;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  priority: number;
  benefits: string[];
  monthlyPrice: number;
  yearlyPrice: number;
}

export const MEMBERSHIP_LEVELS: Record<MembershipLevel, MembershipConfig> = {
  free: {
    level: 'free',
    label: 'Silver',
    shortLabel: 'Silver',
    icon: '🥈',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    glowColor: '',
    priority: 0,
    benefits: [
      'Browse properties',
      'Save favorites',
      'Basic search',
      'View property details',
    ],
    monthlyPrice: 0,
    yearlyPrice: 0,
  },
  pro_agent: {
    level: 'pro_agent',
    label: 'Gold',
    shortLabel: 'Gold',
    icon: '🥇',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    borderColor: 'border-amber-300 dark:border-amber-700',
    glowColor: 'shadow-amber-500/20',
    priority: 1,
    benefits: [
      '2x listing exposure',
      'Priority placement',
      'Agent badge',
      'Extended images (10)',
      'SEO tools',
      'Priority support',
    ],
    monthlyPrice: 199000,
    yearlyPrice: 1990000,
  },
  developer: {
    level: 'developer',
    label: 'Platinum',
    shortLabel: 'Platinum',
    icon: '🏆',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50',
    borderColor: 'border-cyan-400 dark:border-cyan-600',
    glowColor: 'shadow-cyan-500/30',
    priority: 2,
    benefits: [
      '5x listing exposure',
      'AI analytics & insights',
      'Bulk listings',
      'Project showcase',
      'SEO optimization',
      'Virtual tour (360°)',
      '3D model integration',
      'Featured badge',
    ],
    monthlyPrice: 499000,
    yearlyPrice: 4990000,
  },
  vip_investor: {
    level: 'vip_investor',
    label: 'Diamond',
    shortLabel: 'Diamond',
    icon: '💎',
    color: 'text-violet-500 dark:text-violet-300',
    bgColor: 'bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/50 dark:via-purple-950/50 dark:to-fuchsia-950/50',
    borderColor: 'border-violet-400 dark:border-violet-500',
    glowColor: 'shadow-violet-500/60 shadow-lg',
    priority: 3,
    benefits: [
      '10x listing exposure',
      'Homepage spotlight',
      '3D featured badge',
      'Personal concierge',
      'First access to listings',
      'Investment advisory',
      'Unlimited images',
      'AI-generated descriptions',
      'All Platinum benefits',
    ],
    monthlyPrice: 999000,
    yearlyPrice: 9990000,
  },
};

export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950/30',
    icon: '⏳'
  },
  verified: {
    label: 'Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950/30',
    icon: '✓'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
    icon: '✗'
  },
  suspended: {
    label: 'Suspended',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted dark:bg-muted/50',
    icon: '⚠'
  }
};

export function getMembershipConfig(level: MembershipLevel | string | undefined): MembershipConfig {
  if (!level || !(level in MEMBERSHIP_LEVELS)) {
    return MEMBERSHIP_LEVELS.free;
  }
  return MEMBERSHIP_LEVELS[level as MembershipLevel];
}

/**
 * Maps user_levels table name to the new 4-tier system.
 * Keeps backward compatibility with old tier names.
 */
export function getMembershipFromUserLevel(userLevelName: string | undefined): MembershipLevel {
  if (!userLevelName) return 'free';
  
  const normalized = userLevelName.toLowerCase().trim();
  
  // New tier names
  if (normalized.includes('vip_investor') || normalized.includes('vip investor')) return 'vip_investor';
  if (normalized.includes('developer')) return 'developer';
  if (normalized.includes('pro_agent') || normalized.includes('pro agent')) return 'pro_agent';
  
  // Backward compatibility with old tier names
  if (normalized.includes('diamond')) return 'vip_investor';
  if (normalized.includes('platinum')) return 'developer';
  if (normalized.includes('gold')) return 'developer';
  if (normalized.includes('vip')) return 'pro_agent';
  if (normalized.includes('verified') || normalized.includes('premium')) return 'pro_agent';
  
  return 'free';
}
