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
          className="relative w-10 h-10 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30 shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-semibold">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 p-0 backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2" 
        align="end"
        sideOffset={8}
      >
        {/* User Profile Header */}
        <DropdownMenuLabel className="p-3 border-b border-border/50 opacity-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-md ring-2 ring-background">
              <span className="text-white text-xs font-semibold">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {roles[0]?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Role-specific Quick Actions */}
        <div className="p-2 opacity-100">
          <div className="flex flex-col gap-1 opacity-100">
            {isAdmin && (
              <>
                <button onClick={() => { navigate('/admin-dashboard'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Crown className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Admin Panel</span>
                </button>
                <button onClick={() => { navigate('/dijual'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Properties</span>
                </button>
                <button onClick={() => { navigate('/users'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <User className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Users</span>
                </button>
                <button onClick={() => { navigate('/analytics'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </>
            )}

            {isAgent && (
              <>
                <button onClick={() => { navigate('/agent'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <User className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Agent Hub</span>
                </button>
                <button onClick={() => { navigate('/listings'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">My Listings</span>
                </button>
              </>
            )}

            {isVendor && (
              <>
                <button onClick={() => { navigate('/vendor'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Settings className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Vendor Panel</span>
                </button>
                <button onClick={() => { navigate('/services'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">My Services</span>
                </button>
              </>
            )}

            {!isAdmin && !isAgent && !isVendor && (
              <>
                <button onClick={() => { navigate('/dashboard/user'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>
                <button onClick={() => { navigate('/saved'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Saved</span>
                </button>
                <button onClick={() => { navigate('/search'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Browse</span>
                </button>
                <button onClick={() => { navigate('/notifications'); setIsOpen(false); }} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-all hover:scale-[1.02] w-full">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Messages</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings & Account */}
        <div className="p-2 border-t border-border/50 opacity-100">
          <DropdownMenuItem 
            onClick={() => { navigate('/profile'); setIsOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserIconWithBadge;