import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ShieldCheck, 
  Crown, 
  Gem, 
  Star,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type VerificationLevel = 'basic' | 'enhanced' | 'professional' | 'premium';

interface VerificationBadgeProps {
  tier: BadgeTier;
  level?: VerificationLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const tierConfig: Record<BadgeTier, {
  label: string;
  icon: React.ElementType;
  colors: string;
  bgColors: string;
  borderColors: string;
  description: string;
  trustIndicator: string;
}> = {
  bronze: {
    label: 'Bronze Member',
    icon: Shield,
    colors: 'text-amber-700',
    bgColors: 'bg-amber-100',
    borderColors: 'border-amber-300',
    description: 'Email & phone verified',
    trustIndicator: 'Basic Trust'
  },
  silver: {
    label: 'Silver Member',
    icon: ShieldCheck,
    colors: 'text-slate-500',
    bgColors: 'bg-slate-100',
    borderColors: 'border-slate-300',
    description: 'Identity verified with documents',
    trustIndicator: 'Enhanced Trust'
  },
  gold: {
    label: 'Gold Member',
    icon: Star,
    colors: 'text-yellow-600',
    bgColors: 'bg-yellow-50',
    borderColors: 'border-yellow-400',
    description: 'Professional credentials verified',
    trustIndicator: 'Professional Trust'
  },
  platinum: {
    label: 'Platinum Member',
    icon: Crown,
    colors: 'text-purple-600',
    bgColors: 'bg-purple-50',
    borderColors: 'border-purple-400',
    description: 'Video verified with references',
    trustIndicator: 'Premium Trust'
  },
  diamond: {
    label: 'Diamond Member',
    icon: Gem,
    colors: 'text-cyan-500',
    bgColors: 'bg-gradient-to-r from-cyan-50 to-blue-50',
    borderColors: 'border-cyan-400',
    description: 'Highest trust level achieved',
    trustIndicator: 'Elite Trust'
  }
};

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    badge: 'h-5 px-1.5 text-xs gap-1',
    iconOnly: 'h-5 w-5'
  },
  md: {
    icon: 'h-4 w-4',
    badge: 'h-7 px-2 text-sm gap-1.5',
    iconOnly: 'h-7 w-7'
  },
  lg: {
    icon: 'h-5 w-5',
    badge: 'h-9 px-3 text-base gap-2',
    iconOnly: 'h-9 w-9'
  }
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  tier,
  level,
  size = 'md',
  showLabel = false,
  showTooltip = true,
  className
}) => {
  const config = tierConfig[tier];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  const badge = (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        config.bgColors,
        config.borderColors,
        showLabel ? sizeStyles.badge : sizeStyles.iconOnly,
        tier === 'diamond' && 'animate-pulse',
        className
      )}
    >
      <Icon className={cn(sizeStyles.icon, config.colors)} />
      {showLabel && (
        <span className={config.colors}>{config.label}</span>
      )}
      {tier === 'diamond' && (
        <Sparkles className={cn('h-2 w-2 absolute -top-0.5 -right-0.5', config.colors)} />
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', config.colors)} />
              <span className="font-semibold">{config.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-green-600">{config.trustIndicator}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
