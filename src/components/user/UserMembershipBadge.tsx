import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Star, Crown, Gem, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  MembershipLevel, 
  VerificationStatus,
  getMembershipConfig, 
  VERIFICATION_STATUS_CONFIG 
} from '@/types/membership';

interface UserMembershipBadgeProps {
  membershipLevel?: MembershipLevel | string;
  verificationStatus?: VerificationStatus | string;
  showLabel?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'pill' | 'icon' | 'full';
  animate?: boolean;
  className?: string;
}

const MEMBERSHIP_ICONS: Record<MembershipLevel, React.ReactNode> = {
  basic: <Shield className="h-full w-full" />,
  verified: <CheckCircle2 className="h-full w-full" />,
  vip: <Star className="h-full w-full" />,
  gold: <Award className="h-full w-full" />,
  platinum: <Crown className="h-full w-full" />,
  diamond: <Gem className="h-full w-full" />
};

const SIZE_CLASSES = {
  xs: {
    badge: 'h-4 text-[8px] px-1 gap-0.5',
    icon: 'h-3 w-3',
    iconOnly: 'h-4 w-4'
  },
  sm: {
    badge: 'h-5 text-[9px] px-1.5 gap-1',
    icon: 'h-3.5 w-3.5',
    iconOnly: 'h-5 w-5'
  },
  md: {
    badge: 'h-6 text-[10px] px-2 gap-1',
    icon: 'h-4 w-4',
    iconOnly: 'h-6 w-6'
  },
  lg: {
    badge: 'h-7 text-xs px-2.5 gap-1.5',
    icon: 'h-5 w-5',
    iconOnly: 'h-8 w-8'
  }
};

export const UserMembershipBadge: React.FC<UserMembershipBadgeProps> = ({
  membershipLevel = 'basic',
  verificationStatus,
  showLabel = true,
  showIcon = true,
  showTooltip = true,
  size = 'sm',
  variant = 'badge',
  animate = true,
  className
}) => {
  const config = getMembershipConfig(membershipLevel as MembershipLevel);
  const sizeClasses = SIZE_CLASSES[size];
  
  const isHighTier = ['gold', 'platinum', 'diamond'].includes(config.level);
  
  const BadgeContent = () => {
    if (variant === 'icon') {
      return (
        <div 
          className={cn(
            'rounded-full flex items-center justify-center',
            config.bgColor,
            config.color,
            config.borderColor,
            'border',
            sizeClasses.iconOnly,
            animate && isHighTier && 'animate-pulse',
            config.glowColor && `shadow ${config.glowColor}`,
            className
          )}
        >
          <div className={sizeClasses.icon}>
            {MEMBERSHIP_ICONS[config.level]}
          </div>
        </div>
      );
    }

    return (
      <Badge 
        className={cn(
          'font-semibold border inline-flex items-center whitespace-nowrap',
          sizeClasses.badge,
          config.bgColor,
          config.color,
          config.borderColor,
          animate && isHighTier && 'hover:scale-105 transition-transform',
          config.glowColor && `shadow ${config.glowColor}`,
          className
        )}
      >
        {showIcon && (
          <span className={cn(sizeClasses.icon, 'flex-shrink-0')}>
            {MEMBERSHIP_ICONS[config.level]}
          </span>
        )}
        {showLabel && (
          <span className="truncate">
            {variant === 'pill' ? config.shortLabel : config.label}
          </span>
        )}
        {animate && config.level === 'diamond' && (
          <Sparkles className="h-2.5 w-2.5 animate-pulse" />
        )}
      </Badge>
    );
  };

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <BadgeContent />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <div className="space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <span>{config.icon}</span>
                {config.label}
              </p>
              <ul className="text-[10px] text-muted-foreground space-y-0.5">
                {config.benefits.slice(0, 3).map((benefit, i) => (
                  <li key={i}>• {benefit}</li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <BadgeContent />;
};

// Compact version for list views
export const UserMembershipIcon: React.FC<{
  level?: MembershipLevel | string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ level = 'basic', size = 'sm', className }) => {
  return (
    <UserMembershipBadge 
      membershipLevel={level}
      variant="icon"
      size={size}
      showTooltip={true}
      className={className}
    />
  );
};

// Verification status badge
export const VerificationBadge: React.FC<{
  status?: VerificationStatus | string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}> = ({ status = 'pending', size = 'sm', showLabel = true, className }) => {
  const config = VERIFICATION_STATUS_CONFIG[status as VerificationStatus] || VERIFICATION_STATUS_CONFIG.pending;
  const sizeClasses = SIZE_CLASSES[size];
  
  return (
    <Badge 
      className={cn(
        'font-medium border-0 inline-flex items-center gap-1',
        sizeClasses.badge,
        config.bgColor,
        config.color,
        className
      )}
    >
      <span className="text-[10px]">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
};

// Combined badge showing both membership and verification
export const UserStatusBadge: React.FC<{
  membershipLevel?: MembershipLevel | string;
  verificationStatus?: VerificationStatus | string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ membershipLevel, verificationStatus, size = 'sm', className }) => {
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <UserMembershipBadge 
        membershipLevel={membershipLevel}
        size={size}
        variant="pill"
        showTooltip={true}
      />
      {verificationStatus === 'verified' && (
        <VerificationBadge status={verificationStatus} size={size} showLabel={false} />
      )}
    </div>
  );
};

export default UserMembershipBadge;
