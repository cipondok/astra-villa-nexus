import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Sparkles, 
  BarChart3,
  Building2,
  Heart,
  MessageSquare,
  Bell,
  Shield,
  Star,
  Gem,
  Award,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useUserMembership } from "@/hooks/useUserMembership";
import { getMembershipConfig, MEMBERSHIP_LEVELS } from "@/types/membership";

interface UserIconWithBadgeProps {
  onNavigate?: (path: string) => void;
}

const MEMBERSHIP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  basic: Shield,
  verified: CheckCircle2,
  vip: Star,
  gold: Award,
  platinum: Gem,
  diamond: Gem, // Using Gem for diamond
};

// Special gradient colors for each membership level
const MEMBERSHIP_GRADIENTS: Record<string, string> = {
  basic: 'linear-gradient(135deg, #6b7280, #9ca3af)',
  verified: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  vip: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  gold: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  platinum: 'linear-gradient(135deg, #64748b, #94a3b8)',
  diamond: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)', // Rainbow gradient for diamond
};

const UserIconWithBadge = ({ onNavigate }: UserIconWithBadgeProps = { onNavigate: undefined }) => {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { data: roles = [] } = useUserRoles();
  const { membershipLevel, verificationStatus } = useUserMembership();
  
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    // Prevent scroll jump on mobile Safari/Chrome when dropdown auto-focuses
    if (open) {
      const y = window.scrollY;
      requestAnimationFrame(() => window.scrollTo({ top: y, left: 0 }));
    }
    setIsOpen(open);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isAgent = roles.includes('agent');
  const isVendor = roles.includes('vendor');

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const membershipConfig = getMembershipConfig(membershipLevel);
  const MembershipIcon = MEMBERSHIP_ICONS[membershipLevel] || Shield;
  const membershipGradient = MEMBERSHIP_GRADIENTS[membershipLevel] || MEMBERSHIP_GRADIENTS.basic;
  const hasAvatar = profile?.avatar_url;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 p-0 rounded-full transition-all shrink-0 group"
              >
                {/* Main Icon - Membership Status Icon when logged in */}
                <div 
                  className={
                    `w-full h-full rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 ` +
                    (membershipLevel === 'diamond' ? 'animate-pulse' : '')
                  }
                  style={{ 
                    background: membershipGradient,
                    boxShadow: membershipLevel === 'diamond' 
                      ? '0 2px 14px rgba(139, 92, 246, 0.65), 0 0 24px rgba(6, 182, 212, 0.5)' 
                      : `0 2px 10px ${membershipConfig.color}50`
                  }}
                >
                  <MembershipIcon
                    className={
                      `h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md ` +
                      (membershipLevel === 'diamond' ? 'animate-[spin_6s_linear_infinite]' : '')
                    }
                  />
                </div>
                
                {/* Notification Badge - Bottom Right */}
                {unreadCount > 0 && (
                  <Badge className="absolute -bottom-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[8px] sm:text-xs lg:text-[8px] animate-pulse border border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          {/* Hover Tooltip with Membership Details */}
          {!isOpen && (
            <TooltipContent 
              side="bottom" 
              align="end"
              className="p-2 bg-popover/95 backdrop-blur-md border-border/50 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: membershipConfig.color }}
                >
                  <MembershipIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-foreground">{membershipConfig.label} Member</p>
                  <p className="text-[9px] text-muted-foreground">
                    {verificationStatus === 'verified' ? '✓ Verified' : 'Click for options'}
                  </p>
                </div>
              </div>
              {membershipConfig.benefits.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-border/30">
                  <p className="text-[8px] text-muted-foreground mb-0.5">Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {membershipConfig.benefits.slice(0, 2).map((benefit, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent 
        className="w-44 sm:w-52 lg:w-52 p-0 backdrop-blur-md bg-background/70 border-border/30 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2" 
        align="end"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* User Profile Header with Membership */}
        <DropdownMenuLabel className="p-2.5 border-b border-border/30 opacity-100">
          <div className="flex items-center gap-2.5">
            {/* Membership Status Icon */}
            <div 
              className={
                `w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-background flex-shrink-0 ` +
                (membershipLevel === 'diamond' ? 'animate-pulse' : '')
              }
              style={{ 
                background: membershipGradient,
                boxShadow: membershipLevel === 'diamond' 
                  ? '0 2px 14px rgba(139, 92, 246, 0.65), 0 0 24px rgba(6, 182, 212, 0.5)' 
                  : `0 2px 8px ${membershipConfig.color}60`
              }}
            >
              <MembershipIcon
                className={
                  `h-5 w-5 text-white drop-shadow-md ` +
                  (membershipLevel === 'diamond' ? 'animate-[spin_6s_linear_infinite]' : '')
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs text-foreground truncate">
                {profile?.full_name || user?.email}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span 
                  className="text-[11px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ 
                    background: membershipGradient,
                    color: 'white',
                    boxShadow: membershipLevel === 'diamond' ? '0 1px 6px rgba(139, 92, 246, 0.4)' : 'none'
                  }}
                >
                  {membershipConfig.label}
                </span>
                {verificationStatus === 'verified' && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Role-specific Quick Actions */}
        <div className="p-1.5 opacity-100">
          <div className="flex flex-col gap-0.5 opacity-100">
            {isAdmin && (
              <>
                <button onClick={() => { navigate('/admin-dashboard'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Admin Panel</span>
                </button>
                <button onClick={() => { navigate('/dijual'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-green-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Properties</span>
                </button>
                <button onClick={() => { navigate('/users'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-purple-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Users</span>
                </button>
                <button onClick={() => { navigate('/analytics'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-orange-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Analytics</span>
                </button>
              </>
            )}

            {isAgent && (
              <>
                <button onClick={() => { navigate('/agent'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-green-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Agent Hub</span>
                </button>
                <button onClick={() => { navigate('/listings'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">My Listings</span>
                </button>
              </>
            )}

            {isVendor && (
              <>
                <button onClick={() => { navigate('/vendor'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-purple-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Vendor Panel</span>
                </button>
                <button onClick={() => { navigate('/services'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">My Services</span>
                </button>
              </>
            )}

            {!isAdmin && !isAgent && !isVendor && (
              <>
                <button onClick={() => { navigate('/dashboard/user'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Dashboard</span>
                </button>
                <button onClick={() => { navigate('/saved'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-red-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Saved</span>
                </button>
                <button onClick={() => { navigate('/search'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-green-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Browse</span>
                </button>
                <button onClick={() => { navigate('/notifications'); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md hover:bg-accent/50 transition-all w-full text-left">
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 text-purple-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs lg:text-xs font-medium">Messages</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings & Account */}
        <div className="p-1.5 border-t border-border/30 opacity-100">
          <DropdownMenuItem 
            onClick={() => { navigate('/profile'); setIsOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md cursor-pointer"
          >
            <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs lg:text-xs">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-2 py-1.5 sm:py-2 lg:py-1.5 rounded-md cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3.5 lg:w-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs lg:text-xs">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserIconWithBadge;