
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
  Eye,
  BarChart3
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
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AdminDashboardHeader = ({ isAdmin, user, profile, activeTab, onTabChange }: AdminDashboardHeaderProps) => {
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
      <div className="sticky top-0 left-0 right-0 z-[10000] header-ios border-b border-white/10 backdrop-blur-xl shadow-lg transform-gpu will-change-transform animate-fade-in">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Shield className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-300 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">ASTRA</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">Villa</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'overview' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('overview')}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Overview
              </Button>
              <Button 
                variant={activeTab === 'user-management' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'user-management' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('user-management')}
              >
                <Users className="h-3 w-3 mr-1" />
                Users
              </Button>
              <Button 
                variant={activeTab === 'vendor-management' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'vendor-management' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('vendor-management')}
              >
                <UserCog className="h-3 w-3 mr-1" />
                Vendors
              </Button>
              <Button 
                variant={activeTab === 'astra-tokens' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'astra-tokens' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('astra-tokens')}
              >
                <Shield className="h-3 w-3 mr-1" />
                ASTRA Tokens
              </Button>
              <Button 
                variant={activeTab === 'customer-service' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'customer-service' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('customer-service')}
              >
                <Bell className="h-3 w-3 mr-1" />
                Customer Service
              </Button>
              <Button 
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'analytics' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('analytics')}
              >
                <Activity className="h-3 w-3 mr-1" />
                Analytics
              </Button>
              <Button 
                variant={activeTab === 'api-configuration' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'api-configuration' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('api-configuration')}
              >
                <Database className="h-3 w-3 mr-1" />
                API Config
              </Button>
              <Button 
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                size="sm"
                className={`h-10 px-3 text-xs font-medium hover:scale-105 rounded-lg transition-all duration-200 ${
                  activeTab === 'settings' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onTabChange?.('settings')}
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Status Badge */}
              <Badge variant="outline" className="hidden sm:flex bg-green-500/20 text-green-600 dark:text-green-400 border-green-400/50 px-2 py-0.5 text-xs backdrop-blur-sm">
                <Activity className="h-2 w-2 mr-1" />
                Online
              </Badge>
              
              {sessionTime && (
                <Badge 
                  variant="outline" 
                  className="hidden md:flex bg-primary/20 text-primary border-primary/50 px-2 py-0.5 text-xs cursor-pointer hover:bg-primary/30 backdrop-blur-sm animate-scale-in"
                  onClick={handleExtendSession}
                  title="Click to extend session"
                >
                  <Clock className="h-2 w-2 mr-1" />
                  {sessionTime}
                </Badge>
              )}

              {/* Enhanced Home Button */}
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="w-11 h-11 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg animate-scale-in"
              >
                <Home className="h-5 w-5" />
              </Button>

              {/* Theme Switcher */}
              <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
                <ThemeSwitcher variant="compact" />
              </div>

              {/* Enhanced Alerts Button */}
              <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
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
