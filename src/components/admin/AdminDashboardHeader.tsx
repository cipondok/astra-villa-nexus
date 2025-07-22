
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Building2, 
  Settings,
  Activity,
  AlertTriangle,
  Bell,
  User,
  LogOut,
  Clock,
  RefreshCw,
  UserCog,
  Database,
  Monitor,
  ChevronDown,
  Home,
  X,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminAlertBadge from "./AdminAlertBadge";
import EnhancedAlertBadge from "./EnhancedAlertBadge";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  action_required: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

interface AdminDashboardHeaderProps {
  isAdmin: boolean;
  user: any;
  profile: any;
}

const AdminDashboardHeader = ({ isAdmin, user, profile }: AdminDashboardHeaderProps) => {
  const { signOut, extendSession } = useAuth();
  const navigate = useNavigate();
  const [sessionTime, setSessionTime] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin counts for badge
  const { data: adminCounts = { unreadAlerts: 0, pendingTasks: 0, systemIssues: 0 } } = useQuery({
    queryKey: ['admin-counts', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return { unreadAlerts: 0, pendingTasks: 0, systemIssues: 0 };
      
      const counts = {
        unreadAlerts: 0,
        pendingTasks: 0,
        systemIssues: 0,
      };

      try {
        // Get unread admin alerts
        const { count: alertsCount } = await supabase
          .from('admin_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        counts.unreadAlerts = alertsCount || 0;

        // Get pending tasks (you can adjust this query based on your needs)
        const { count: tasksCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending');
        counts.pendingTasks = tasksCount || 0;

        // Get system issues count (example query)
        const { count: issuesCount } = await supabase
          .from('admin_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'error')
          .eq('action_required', true);
        counts.systemIssues = issuesCount || 0;
      } catch (error) {
        console.error('Error fetching admin counts:', error);
      }

      return counts;
    },
    enabled: !!user?.id && isAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const updateSessionTime = () => {
      const loginTime = localStorage.getItem('login_time');
      
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setSessionTime(`${hours}h ${minutes}m`);
        } else {
          setSessionTime(`${minutes}m`);
        }
      }
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('AdminDashboardHeader: Fast sign out initiated...');
      setShowProfile(false);
      await signOut();
    } catch (error) {
      console.error('AdminDashboardHeader: Error signing out:', error);
    }
  };

  const handleExtendSession = async () => {
    try {
      await extendSession();
      toast.success('Session extended successfully! You can continue working.');
    } catch (error) {
      console.error('Error extending session:', error);
      toast.error('Failed to extend session');
    }
  };

  const handleProfileClick = () => {
    console.log('Opening profile dialog...');
    setShowProfile(true);
  };

  // Get proper display name and email
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Administrator';
  const displayEmail = user?.email || 'admin@astra.com';
  const userRole = profile?.role || 'admin';

  // Calculate total badge count
  const getTotalBadgeCount = () => {
    return adminCounts.unreadAlerts + adminCounts.pendingTasks + adminCounts.systemIssues;
  };

  const badgeCount = getTotalBadgeCount();

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600/70 dark:bg-gray-900/70 backdrop-blur-md text-white transition-all duration-300 border-b border-blue-500/30 dark:border-gray-700/50">
        {/* Ultra Compact Header with 70% Transparency */}
        <div className="relative w-full max-w-full px-4 py-2">
          <div className="flex items-center justify-between min-h-[60px]">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 bg-white/20 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-600/50">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">
                  ASTRA Control Center
                </h1>
                <p className="text-blue-100 dark:text-gray-300 text-xs">
                  Welcome, {displayName}
                </p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-sm font-bold text-white">ASTRA</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Compact Status Badges */}
            <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400/50 px-2 py-0.5 text-xs backdrop-blur-sm">
              <Activity className="h-2 w-2 mr-1" />
              Online
            </Badge>
            
            {sessionTime && (
              <Badge 
                variant="outline" 
                className="bg-blue-500/20 text-blue-100 border-blue-400/50 px-2 py-0.5 text-xs cursor-pointer hover:bg-blue-500/30 backdrop-blur-sm"
                onClick={handleExtendSession}
                title="Click to extend session"
              >
                <Clock className="h-2 w-2 mr-1" />
                {sessionTime}
              </Badge>
            )}

            {/* Home Button */}
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2 py-1 h-8 backdrop-blur-sm"
            >
              <Home className="h-3 w-3" />
            </Button>

            {/* Theme Switcher */}
            <ThemeSwitcher variant="compact" />

            {/* Enhanced Real-time Alerts Button */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <EnhancedAlertBadge />
            </div>

            {/* Admin Control Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                       variant="ghost"
                       size="sm"
                       className="relative w-12 h-12 p-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                     >
                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                         <UserCog className="h-5 w-5 text-white drop-shadow-sm" />
                       </div>
                      
                      {/* Badge Count */}
                      {badgeCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                    <div className="text-center">
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-gray-300">{userRole} • {sessionTime || '0m'}</p>
                      {badgeCount > 0 && (
                        <p className="text-xs text-orange-300 mt-1">{badgeCount} pending items</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{displayEmail}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{userRole} Access</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                
                {/* Profile Management */}
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Admin Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/wallet')}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
                
                {/* System Management */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Database className="h-4 w-4 mr-2" />
                    System Management
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                    <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Building2 className="h-4 w-4 mr-2" />
                      Property Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                
                {/* Session Management */}
                <DropdownMenuItem 
                  onClick={handleExtendSession}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session ({sessionTime})
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </div>

        {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Admin Profile Management</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-gray-100">{displayEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <p className="text-gray-900 dark:text-gray-100">{displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <p className="text-gray-900 dark:text-gray-100 capitalize">{userRole}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Duration</label>
              <p className="text-gray-900 dark:text-gray-100">{sessionTime || '0m'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600">
                Active
              </Badge>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={handleExtendSession} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminDashboardHeader;
