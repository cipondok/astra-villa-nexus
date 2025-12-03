import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMembership } from '@/hooks/useUserMembership';
import { UserMembershipBadge, VerificationBadge, UserStatusBadge } from './UserMembershipBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, LogOut, ChevronRight, Shield, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';

interface UserProfileHeaderProps {
  variant?: 'full' | 'compact' | 'minimal';
  showActions?: boolean;
  className?: string;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  variant = 'compact',
  showActions = true,
  className
}) => {
  const { user, profile, signOut } = useAuth();
  const { membershipLevel, verificationStatus, isLoading } = useUserMembership();
  const navigate = useNavigate();

  if (!user) return null;

  const isHighTier = ['gold', 'platinum', 'diamond'].includes(membershipLevel);
  const config = MEMBERSHIP_LEVELS[membershipLevel];

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  // Minimal variant - just avatar and badge
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <div className="relative">
          <Avatar className="h-7 w-7 border border-border">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-[10px] bg-primary/10">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {verificationStatus === 'verified' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-background flex items-center justify-center">
              <Shield className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        <UserMembershipBadge 
          membershipLevel={membershipLevel} 
          size="xs" 
          variant="pill"
          showIcon={true}
          showLabel={true}
        />
      </div>
    );
  }

  // Compact variant - horizontal layout
  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg',
          isHighTier ? config.bgColor : 'bg-muted/50',
          isHighTier && config.glowColor,
          className
        )}
      >
        <div className="relative">
          <Avatar className={cn(
            'h-9 w-9 border-2',
            isHighTier ? config.borderColor : 'border-border'
          )}>
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-xs bg-primary/10">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {verificationStatus === 'verified' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium truncate max-w-[100px]">
              {profile?.full_name || 'User'}
            </span>
            {isHighTier && <Sparkles className="h-3 w-3 text-yellow-500" />}
          </div>
          <UserMembershipBadge 
            membershipLevel={membershipLevel} 
            size="xs" 
            variant="pill"
            showIcon={true}
          />
        </div>

        {showActions && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  // Full variant - card layout with all details
  return (
    <Card className={cn(
      'border-0 overflow-hidden',
      isHighTier ? `${config.bgColor} ${config.glowColor}` : 'bg-card',
      className
    )}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className={cn(
              'h-12 w-12 border-2',
              isHighTier ? config.borderColor : 'border-border'
            )}>
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {verificationStatus === 'verified' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">
                {profile?.full_name || 'User'}
              </h3>
              {isHighTier && (
                <Crown className={cn('h-4 w-4', config.color)} />
              )}
            </div>
            
            <p className="text-[10px] text-muted-foreground truncate">
              {user.email}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              <UserMembershipBadge 
                membershipLevel={membershipLevel} 
                size="xs" 
                showIcon={true}
              />
              {verificationStatus === 'verified' && (
                <VerificationBadge status={verificationStatus} size="xs" />
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-1.5 mt-3 pt-2 border-t border-border/50">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Membership level showcase for displaying all levels
export const MembershipLevelShowcase: React.FC<{ 
  currentLevel?: MembershipLevel;
  size?: 'sm' | 'md';
}> = ({ currentLevel = 'basic', size = 'sm' }) => {
  const levels: MembershipLevel[] = ['basic', 'verified', 'vip', 'gold', 'platinum', 'diamond'];
  
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {levels.map((level) => (
        <UserMembershipBadge
          key={level}
          membershipLevel={level}
          size={size === 'sm' ? 'xs' : 'sm'}
          variant="pill"
          showTooltip={true}
          className={cn(
            level === currentLevel && 'ring-2 ring-primary ring-offset-1',
            level !== currentLevel && 'opacity-50'
          )}
        />
      ))}
    </div>
  );
};

export default UserProfileHeader;
