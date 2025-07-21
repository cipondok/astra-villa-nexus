import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";

interface UserStats {
  savedProperties: number;
  activeBookings: number;
  unreadMessages: number;
  adminAlerts?: number;
}

const UserIconWithBadge = () => {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user statistics
  const { data: userStats = { savedProperties: 0, activeBookings: 0, unreadMessages: 0 } } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { savedProperties: 0, activeBookings: 0, unreadMessages: 0 };
      
      const stats: UserStats = {
        savedProperties: 0,
        activeBookings: 0,
        unreadMessages: 0,
      };

      try {
        // Get user's properties count
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);
        stats.savedProperties = propertiesCount || 0;

        // Get admin alerts if user is admin
        if (profile?.role === 'admin' || user?.email === 'mycode103@gmail.com') {
          const { count: alertsCount } = await supabase
            .from('admin_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);
          stats.adminAlerts = alertsCount || 0;
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }

      return stats;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const getTotalBadgeCount = () => {
    const total = unreadCount + (userStats.adminAlerts || 0);
    return total;
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isAgent = profile?.role === 'agent';
  const isVendor = profile?.role === 'vendor';

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

  const badgeCount = getTotalBadgeCount();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-10 h-10 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-semibold">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Combined Badge Count */}
          {badgeCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
              {badgeCount > 99 ? '99+' : badgeCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 p-0" align="end">
        {/* User Profile Header */}
        <DropdownMenuLabel className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-semibold">
                {getUserInitials()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Statistics Section */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Building2 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Properties</p>
                <p className="text-sm font-semibold">{userStats.savedProperties}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Bell className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Notifications</p>
                <p className="text-sm font-semibold">{unreadCount}</p>
              </div>
            </div>

            {userStats.adminAlerts !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Crown className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Admin</p>
                  <p className="text-sm font-semibold">{userStats.adminAlerts}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <div className="p-1">
          {/* Dashboard Navigation */}
          {isAdmin && (
            <DropdownMenuItem 
              onClick={() => { navigate('/admin-dashboard'); setIsOpen(false); }}
              className="flex items-center gap-2 p-3 text-blue-600 dark:text-blue-400"
            >
              <Crown className="h-4 w-4" />
              <span>Admin Dashboard</span>
              {userStats.adminAlerts && userStats.adminAlerts > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 text-xs">
                  {userStats.adminAlerts}
                </Badge>
              )}
            </DropdownMenuItem>
          )}

          {isAgent && (
            <DropdownMenuItem 
              onClick={() => { navigate('/agent'); setIsOpen(false); }}
              className="flex items-center gap-2 p-3 text-green-600 dark:text-green-400"
            >
              <User className="h-4 w-4" />
              <span>Agent Dashboard</span>
            </DropdownMenuItem>
          )}

          {isVendor && (
            <DropdownMenuItem 
              onClick={() => { navigate('/vendor'); setIsOpen(false); }}
              className="flex items-center gap-2 p-3 text-purple-600 dark:text-purple-400"
            >
              <Settings className="h-4 w-4" />
              <span>Vendor Dashboard</span>
            </DropdownMenuItem>
          )}

          {!isAdmin && !isAgent && !isVendor && (
            <DropdownMenuItem 
              onClick={() => { navigate('/dashboard/user'); setIsOpen(false); }}
              className="flex items-center gap-2 p-3"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            onClick={() => { navigate('/saved'); setIsOpen(false); }}
            className="flex items-center gap-2 p-3"
          >
            <Heart className="h-4 w-4" />
            <span>Saved Properties</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => { navigate('/profile'); setIsOpen(false); }}
            className="flex items-center gap-2 p-3"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <div className="p-1">
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserIconWithBadge;