import React from 'react';
import { AlertTriangle, Lock, Clock, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatLockedUntil } from '@/hooks/useProfileEditCooldown';

interface ProfileEditLockBannerProps {
  canEdit: boolean;
  changeCount: number;
  daysRemaining: number;
  lockedUntil: string | null;
  changesRemaining: number;
  nextCooldownDays: number;
  mustContactSupport: boolean;
  onContactSupport?: () => void;
  className?: string;
}

const ProfileEditLockBanner: React.FC<ProfileEditLockBannerProps> = ({
  canEdit,
  changeCount,
  daysRemaining,
  lockedUntil,
  changesRemaining,
  nextCooldownDays,
  mustContactSupport,
  onContactSupport,
  className,
}) => {
  // Show nothing if first time editing (no restrictions yet)
  if (changeCount === 0 && canEdit) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20",
        className
      )}>
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary">
            <span className="font-medium">Note:</span> Name, phone & company will be locked for 30 days after saving. Address and bio can be edited anytime.
          </p>
        </div>
      </div>
    );
  }

  // Must contact support
  if (mustContactSupport) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20",
        className
      )}>
        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive mb-1">Maximum Changes Reached</p>
          <p className="text-xs text-muted-foreground mb-2">
            You've changed your profile 3 times. To protect account security, 
            please contact our customer support team for further changes.
          </p>
          {onContactSupport && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={onContactSupport}
              className="h-7 text-xs gap-1.5"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Contact Support
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Currently locked - name, phone & company are locked
  if (!canEdit && daysRemaining > 0) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-accent/50",
        className
      )}>
        <Lock className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">
              Identity Fields Locked
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-accent/30">
              <Clock className="h-2.5 w-2.5 mr-1" />
              {daysRemaining}d remaining
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Name, phone & company can be edited again on{' '}
            <span className="font-medium">{formatLockedUntil(lockedUntil)}</span>.
            {changeCount < 3 && (
              <> You have <span className="font-medium text-primary">{changesRemaining}</span> identity edit{changesRemaining !== 1 ? 's' : ''} remaining.</>
            )}
            <span className="block mt-1 text-primary">Address and bio can still be edited.</span>
          </p>
        </div>
      </div>
    );
  }

  // Can edit but show warning about next cooldown
  if (canEdit && changeCount > 0) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border",
        className
      )}>
        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">Identity Edit Available</p>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {changesRemaining} edit{changesRemaining !== 1 ? 's' : ''} left
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Changing name, phone or company will lock those fields for{' '}
            <span className="font-medium">{nextCooldownDays} days</span>.
            {changesRemaining === 1 && (
              <span className="text-destructive font-medium"> This is your last identity edit before requiring support.</span>
            )}
            <span className="block mt-1 text-primary">Address and bio can always be edited freely.</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ProfileEditLockBanner;
