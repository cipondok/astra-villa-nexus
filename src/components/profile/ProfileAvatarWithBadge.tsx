import React from 'react';
import { User, Shield, Star, Crown, Gem, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';

interface ProfileAvatarWithBadgeProps {
  avatarUrl?: string | null;
  fullName?: string;
  membershipLevel: MembershipLevel;
  verificationStatus: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// TikTok/FB style badge icons for each level
const LEVEL_BADGE_ICONS: Record<MembershipLevel, { icon: React.ComponentType<any>; bgColor: string; iconColor: string }> = {
  basic: {
    icon: Shield,
    bgColor: 'bg-slate-500',
    iconColor: 'text-white'
  },
  verified: {
    icon: CheckCircle2,
    bgColor: 'bg-blue-500',
    iconColor: 'text-white'
  },
  vip: {
    icon: Star,
    bgColor: 'bg-purple-500',
    iconColor: 'text-white'
  },
  gold: {
    icon: Award,
    bgColor: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    iconColor: 'text-white'
  },
  platinum: {
    icon: Crown,
    bgColor: 'bg-gradient-to-br from-cyan-400 to-slate-400',
    iconColor: 'text-white'
  },
  diamond: {
    icon: Gem,
    bgColor: 'bg-gradient-to-br from-sky-400 via-indigo-400 to-violet-400',
    iconColor: 'text-white'
  }
};

const SIZE_CONFIG = {
  sm: {
    avatar: 'w-12 h-12',
    badge: 'w-5 h-5',
    icon: 'h-3 w-3',
    border: 'border-2',
    badgeOffset: '-bottom-0.5 -right-0.5'
  },
  md: {
    avatar: 'w-16 h-16',
    badge: 'w-6 h-6',
    icon: 'h-3.5 w-3.5',
    border: 'border-3',
    badgeOffset: '-bottom-1 -right-1'
  },
  lg: {
    avatar: 'w-20 h-20',
    badge: 'w-7 h-7',
    icon: 'h-4 w-4',
    border: 'border-4',
    badgeOffset: '-bottom-1 -right-1'
  },
  xl: {
    avatar: 'w-24 h-24',
    badge: 'w-8 h-8',
    icon: 'h-5 w-5',
    border: 'border-4',
    badgeOffset: '-bottom-1.5 -right-1.5'
  }
};

export const ProfileAvatarWithBadge: React.FC<ProfileAvatarWithBadgeProps> = ({
  avatarUrl,
  fullName,
  membershipLevel,
  verificationStatus,
  size = 'lg',
  className
}) => {
  const config = SIZE_CONFIG[size];
  const levelConfig = MEMBERSHIP_LEVELS[membershipLevel];
  const badgeConfig = LEVEL_BADGE_ICONS[membershipLevel];
  const BadgeIcon = badgeConfig.icon;
  
  const isHighTier = ['gold', 'platinum', 'diamond'].includes(membershipLevel);
  const isVerified = verificationStatus === 'verified';

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName || 'User'}
          className={cn(
            config.avatar,
            'rounded-xl object-cover border-background shadow-lg',
            config.border,
            isHighTier && 'ring-2 ring-offset-2 ring-offset-background',
            isHighTier && levelConfig.borderColor.replace('border-', 'ring-')
          )}
        />
      ) : (
        <div className={cn(
          config.avatar,
          'rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-background shadow-lg',
          config.border
        )}>
          <User className="h-8 w-8 text-white" />
        </div>
      )}

      {/* TikTok/FB Style Membership Badge - Bottom Right */}
      <div 
        className={cn(
          'absolute flex items-center justify-center rounded-full border-2 border-background shadow-md',
          config.badge,
          config.badgeOffset,
          badgeConfig.bgColor,
          isHighTier && 'animate-pulse'
        )}
        title={levelConfig.label}
      >
        <BadgeIcon className={cn(config.icon, badgeConfig.iconColor)} />
      </div>

      {/* Verification checkmark - Top Right (only if verified) */}
      {isVerified && membershipLevel !== 'verified' && (
        <div 
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-blue-500 border-2 border-background shadow-sm',
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          title="Verified"
        >
          <CheckCircle2 className={cn(
            'text-white',
            size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
          )} />
        </div>
      )}
    </div>
  );
};

export default ProfileAvatarWithBadge;
