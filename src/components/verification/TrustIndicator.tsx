import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Star
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge, type BadgeTier, type VerificationLevel } from './VerificationBadge';

interface TrustIndicatorProps {
  trustScore: number;
  badgeTier: BadgeTier;
  level: VerificationLevel;
  showScore?: boolean;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  trustScore,
  badgeTier,
  level,
  showScore = true,
  showBadge = true,
  size = 'md',
  className
}) => {
  const getTrustLevel = () => {
    if (trustScore >= 90) return { label: 'Excellent Trust', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (trustScore >= 75) return { label: 'High Trust', color: 'text-green-600', bg: 'bg-green-100' };
    if (trustScore >= 50) return { label: 'Good Trust', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (trustScore >= 25) return { label: 'Basic Trust', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Unverified', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const trustLevel = getTrustLevel();

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'inline-flex items-center',
            sizeClasses[size],
            className
          )}>
            {showBadge && (
              <VerificationBadge tier={badgeTier} size={size} showTooltip={false} />
            )}
            {showScore && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full font-medium',
                trustLevel.bg,
                trustLevel.color
              )}>
                <Star className={cn(
                  size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
                )} />
                <span>{trustScore}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{trustLevel.label}</p>
            <p className="text-xs text-muted-foreground">
              Trust Score: {trustScore}/100
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              Verification Level: {level}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Compact version for property cards
interface CompactTrustBadgeProps {
  badgeTier: BadgeTier;
  verified?: boolean;
  className?: string;
}

export const CompactTrustBadge: React.FC<CompactTrustBadgeProps> = ({
  badgeTier,
  verified = true,
  className
}) => {
  if (!verified) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500',
        className
      )}>
        <AlertCircle className="h-3 w-3" />
        <span>Unverified</span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <VerificationBadge tier={badgeTier} size="sm" />
      <span className="text-xs font-medium capitalize text-muted-foreground">
        Verified
      </span>
    </div>
  );
};

export default TrustIndicator;
