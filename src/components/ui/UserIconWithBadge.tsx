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
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUserRoles } from "@/hooks/useUserRoles";

interface UserIconWithBadgeProps {
  onNavigate?: (path: string) => void;
}

const UserIconWithBadge = ({ onNavigate }: UserIconWithBadgeProps = { onNavigate: undefined }) => {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { data: roles = [] } = useUserRoles();
  
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30 shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-7 lg:h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] sm:text-xs lg:text-[10px] font-semibold">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[8px] sm:text-xs lg:text-[8px] animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-44 sm:w-52 lg:w-52 p-0 backdrop-blur-md bg-background/70 border-border/30 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2" 
        align="end"
        sideOffset={8}
      >
        {/* User Profile Header */}
        <DropdownMenuLabel className="p-2 sm:p-2.5 lg:p-2 border-b border-border/30 opacity-100">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-[10px] sm:text-xs font-semibold">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[10px] sm:text-xs text-foreground truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground capitalize">
                {roles[0]?.replace('_', ' ') || 'User'}
              </p>
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