// User Membership & Verification Levels

export type MembershipLevel = 
  | 'basic'
  | 'verified'
  | 'vip'
  | 'gold'
  | 'platinum'
  | 'diamond';

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
}

export const MEMBERSHIP_LEVELS: Record<MembershipLevel, MembershipConfig> = {
  basic: {
    level: 'basic',
    label: 'Basic Member',
    shortLabel: 'Basic',
    icon: '👤',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: '',
    priority: 0,
    benefits: ['Browse properties', 'Save favorites', 'Basic search']
  },
  verified: {
    level: 'verified',
    label: 'Verified Member',
    shortLabel: 'Verified',
    icon: '✓',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-300 dark:border-blue-700',
    glowColor: 'shadow-blue-500/20',
    priority: 1,
    benefits: ['Verified identity', 'Contact agents', 'Priority support']
  },
  vip: {
    level: 'vip',
    label: 'VIP Member',
    shortLabel: 'VIP',
    icon: '⭐',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
    borderColor: 'border-purple-300 dark:border-purple-700',
    glowColor: 'shadow-purple-500/30',
    priority: 2,
    benefits: ['VIP badge', 'Early access', 'Exclusive deals', 'Dedicated support']
  },
  gold: {
    level: 'gold',
    label: 'Gold Member',
    shortLabel: 'Gold',
    icon: '🥇',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
    glowColor: 'shadow-yellow-500/40',
    priority: 3,
    benefits: ['Gold badge', 'Premium listings', 'Market insights', 'Priority matching']
  },
  platinum: {
    level: 'platinum',
    label: 'Platinum Member',
    shortLabel: 'Platinum',
    icon: '💎',
    color: 'text-cyan-600 dark:text-cyan-300',
    bgColor: 'bg-gradient-to-r from-slate-100 to-cyan-50 dark:from-slate-900/50 dark:to-cyan-950/50',
    borderColor: 'border-cyan-400 dark:border-cyan-500',
    glowColor: 'shadow-cyan-500/50',
    priority: 4,
    benefits: ['Platinum badge', 'Concierge service', 'Investment advisory', 'Exclusive events']
  },
  diamond: {
    level: 'diamond',
    label: 'Diamond Member',
    shortLabel: 'Diamond',
    icon: '💠',
    color: 'text-sky-500 dark:text-sky-300',
    bgColor: 'bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 dark:from-sky-950/50 dark:via-indigo-950/50 dark:to-violet-950/50',
    borderColor: 'border-sky-400 dark:border-sky-500',
    glowColor: 'shadow-sky-500/60 shadow-lg',
    priority: 5,
    benefits: ['Diamond badge', 'Personal advisor', 'First access', 'VIP concierge', 'All benefits']
  }
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
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: '⚠'
  }
};

export function getMembershipConfig(level: MembershipLevel | string | undefined): MembershipConfig {
  if (!level || !(level in MEMBERSHIP_LEVELS)) {
    return MEMBERSHIP_LEVELS.basic;
  }
  return MEMBERSHIP_LEVELS[level as MembershipLevel];
}

export function getMembershipFromUserLevel(userLevelName: string | undefined): MembershipLevel {
  if (!userLevelName) return 'basic';
  
  const normalized = userLevelName.toLowerCase().trim();
  
  if (normalized.includes('diamond')) return 'diamond';
  if (normalized.includes('platinum')) return 'platinum';
  if (normalized.includes('gold')) return 'gold';
  if (normalized.includes('vip')) return 'vip';
  if (normalized.includes('verified') || normalized.includes('premium')) return 'verified';
  
  return 'basic';
}
