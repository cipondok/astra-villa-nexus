import { motion } from 'framer-motion';
import { Crown, Shield, Star, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGamification, PROFILE_FRAMES } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

interface UserStatusBadgeProps {
  userId?: string;
  userName?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showTitle?: boolean;
  showBadges?: boolean;
  className?: string;
}

// Frame styles mapped by name
const FRAME_STYLES: Record<string, { border: string; glow: string; icon?: React.ReactNode }> = {
  default: { border: 'border-muted', glow: '' },
  bronze: { border: 'border-amber-600 border-2', glow: 'shadow-amber-200/50' },
  silver: { border: 'border-slate-400 border-2', glow: 'shadow-slate-200/50' },
  gold: { border: 'border-yellow-500 border-2', glow: 'shadow-yellow-200/50 shadow-lg', icon: <Star className="h-2.5 w-2.5 text-yellow-500" /> },
  platinum: { border: 'border-cyan-400 border-2', glow: 'shadow-cyan-200/50 shadow-lg', icon: <Shield className="h-2.5 w-2.5 text-cyan-400" /> },
  diamond: { border: 'border-purple-500 border-2 ring-2 ring-purple-300/50', glow: 'shadow-purple-300/50 shadow-xl', icon: <Crown className="h-2.5 w-2.5 text-purple-500" /> }
};

const SIZE_STYLES = {
  sm: { avatar: 'h-8 w-8', badge: 'text-[9px] px-1', icon: 'h-3 w-3' },
  md: { avatar: 'h-10 w-10', badge: 'text-[10px] px-1.5', icon: 'h-3.5 w-3.5' },
  lg: { avatar: 'h-14 w-14', badge: 'text-xs px-2', icon: 'h-4 w-4' }
};

const UserStatusBadge = ({
  userId,
  userName = 'User',
  avatarUrl,
  size = 'md',
  showLevel = true,
  showTitle = false,
  showBadges = false,
  className
}: UserStatusBadgeProps) => {
  const { stats, getProfileFrame, getUserTitle, userBadges } = useGamification();
  
  const sizeStyles = SIZE_STYLES[size];
  const frame = getProfileFrame();
  const frameStyle = FRAME_STYLES[frame.name] || FRAME_STYLES.default;
  const title = getUserTitle();
  const displayBadges = userBadges?.slice(0, 3) || [];

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Avatar with Frame */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <Avatar 
              className={cn(
                sizeStyles.avatar,
                frameStyle.border,
                frameStyle.glow,
                "transition-all duration-300"
              )}
            >
              <AvatarImage src={avatarUrl || undefined} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Level indicator */}
            {showLevel && stats && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold",
                    size === 'sm' ? 'h-4 w-4 text-[8px]' : size === 'md' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs'
                  )}>
                    {stats.current_level}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Level {stats.current_level} • {stats.total_xp.toLocaleString()} XP
                </TooltipContent>
              </Tooltip>
            )}

            {/* Frame icon for high levels */}
            {frameStyle.icon && (
              <div className={cn(
                "absolute -top-1 -right-1 rounded-full bg-background p-0.5",
                size === 'sm' && '-top-0.5 -right-0.5'
              )}>
                {frameStyle.icon}
              </div>
            )}
          </motion.div>
        </div>

        {/* Name, Title & Badges */}
        {(showTitle || showBadges) && (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{userName}</div>
            
            {showTitle && (
              <div className="flex items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className={cn(sizeStyles.badge, "font-normal bg-primary/10 text-primary")}
                >
                  {title}
                </Badge>
              </div>
            )}

            {showBadges && displayBadges.length > 0 && (
              <div className="flex items-center gap-0.5 mt-0.5">
                {displayBadges.map((ub) => (
                  <Tooltip key={ub.id}>
                    <TooltipTrigger asChild>
                      <span className="text-xs cursor-help">{ub.badge?.icon}</span>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      {ub.badge?.name}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default UserStatusBadge;
