
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

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white transition-all duration-300">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-600/50">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  ASTRA Villa {isAdmin ? "Admin Panel" : "Support Dashboard"}
                </h1>
                <p className="text-blue-100 dark:text-gray-300 text-lg mt-1">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 dark:bg-gray-700/60 text-white border-white/30 dark:border-gray-600/50 hover:bg-white/30 dark:hover:bg-gray-600/60 transition-colors px-4 py-2">
                <User className="h-4 w-4 mr-2" />
                {isAdmin ? "System Administrator" : "Support Staff"}
              </Badge>
              
              <Badge variant="outline" className="bg-green-500/20 dark:bg-green-600/30 text-green-100 dark:text-green-200 border-green-400/50 dark:border-green-500/40 px-4 py-2">
                <Activity className="h-4 w-4 mr-2" />
                Online
              </Badge>
              
              {sessionTime && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-500/20 dark:bg-blue-600/30 text-blue-100 dark:text-blue-200 border-blue-400/50 dark:border-blue-500/40 px-4 py-2 cursor-pointer hover:bg-blue-500/30 dark:hover:bg-blue-600/40"
                  onClick={handleExtendSession}
                  title="Click to extend session"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Session: {sessionTime}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Home Button */}
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="bg-white/10 dark:bg-gray-800/60 hover:bg-white/20 dark:hover:bg-gray-700/60 text-white border border-white/20 dark:border-gray-600/50 px-4 py-2 flex items-center gap-2 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:block">Home</span>
            </Button>

            {/* Theme Switcher */}
            <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 rounded-lg">
              <ThemeSwitcher variant="compact" className="px-2" />
            </div>

            {/* Enhanced Real-time Alerts Button */}
            <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 rounded-lg">
              <EnhancedAlertBadge />
            </div>

            {/* Admin Control Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-white/10 dark:bg-gray-800/60 hover:bg-white/20 dark:hover:bg-gray-700/60 text-white border border-white/20 dark:border-gray-600/50 px-4 py-2 flex items-center gap-2 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block">{profile?.full_name || 'Admin'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'Administrator'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">System Administrator</p>
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
                
                {/* Dashboard Navigation */}
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/admin')}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Dashboard
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
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Admin Profile Management</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <p className="text-gray-900 dark:text-gray-100">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <p className="text-gray-900 dark:text-gray-100">{profile?.role || 'admin'}</p>
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
  );
};

export default AdminDashboardHeader;
