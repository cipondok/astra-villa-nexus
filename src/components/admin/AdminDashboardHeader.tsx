
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
  Home
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminAlertBadge from "./AdminAlertBadge";
import ThemeSwitcher from "@/components/ui/theme-switcher";
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
  const [showAlerts, setShowAlerts] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Session monitoring
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
    if (isSigningOut) return;
    
    try {
      console.log('AdminDashboardHeader: Starting sign out process...');
      setIsSigningOut(true);
      
      toast.loading('Signing out...', { duration: 2000 });
      
      setShowProfile(false);
      setShowAlerts(false);
      
      await signOut();
      
    } catch (error) {
      console.error('AdminDashboardHeader: Error signing out:', error);
      setIsSigningOut(false);
      toast.error('Error signing out');
      window.location.href = '/';
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

  const handleAlertsClick = () => {
    console.log('Opening alerts dialog...');
    setShowAlerts(true);
  };

  const handleProfileClick = () => {
    console.log('Opening profile dialog...');
    setShowProfile(true);
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  {isAdmin ? "Admin Control Panel" : "Support Dashboard"}
                </h1>
                <p className="text-blue-100 text-lg mt-1">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-4 py-2">
                <User className="h-4 w-4 mr-2" />
                {isAdmin ? "System Administrator" : "Support Staff"}
              </Badge>
              
              <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-300/30 px-4 py-2">
                <Activity className="h-4 w-4 mr-2" />
                Online
              </Badge>
              
              {sessionTime && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-500/20 text-blue-100 border-blue-300/30 px-4 py-2 cursor-pointer hover:bg-blue-500/30"
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
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:block">Home</span>
            </Button>

            {/* Alerts Button */}
            <Button
              onClick={handleAlertsClick}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 flex items-center gap-2"
            >
              <AdminAlertBadge />
            </Button>

            {/* Theme Switcher */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
              <ThemeSwitcher variant="compact" />
            </div>

            {/* Admin Control Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={isSigningOut}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block">{profile?.full_name || 'Admin'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <DropdownMenuLabel className="text-gray-900 dark:text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'Administrator'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{user?.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">System Administrator</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Profile Management */}
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Admin Profile
                </DropdownMenuItem>
                
                {/* Dashboard Navigation */}
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/admin')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/wallet')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
                
                {/* System Management */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <Database className="h-4 w-4 mr-2" />
                    System Management
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <Building2 className="h-4 w-4 mr-2" />
                      Property Management
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                {/* Session Management */}
                <DropdownMenuItem 
                  onClick={handleExtendSession}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session ({sessionTime})
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  disabled={isSigningOut}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Alerts Dialog */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">System Alerts</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Recent system alerts and notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-300">Extended Session Timeout</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Session timeout has been extended to 2 hours for better development experience
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-300">Admin Control Panel</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Unified admin controls now available through single user menu
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Admin Profile Management</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <p className="text-gray-900 dark:text-white">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <p className="text-gray-900 dark:text-white">{profile?.role || 'admin'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Duration</label>
              <p className="text-gray-900 dark:text-white">{sessionTime || '0m'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                Active
              </Badge>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={handleExtendSession}>
                <Clock className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
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
