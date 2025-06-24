
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
  RefreshCw
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
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

  // Session monitoring with extended session info
  useEffect(() => {
    const updateSessionTime = () => {
      const loginTime = localStorage.getItem('login_time');
      const lastActivity = localStorage.getItem('last_activity');
      
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
      console.log('AdminDashboardHeader: Signing out...');
      await signOut();
      navigate('/?auth=true', { replace: true });
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('AdminDashboardHeader: Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const handleRefreshSession = async () => {
    try {
      await extendSession();
      toast.success('Session refreshed and extended');
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh session');
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

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
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
                  {isAdmin ? "Admin Dashboard" : "Support Dashboard"}
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
              
              {/* Alert Badge */}
              <Button
                onClick={() => setShowAlerts(true)}
                variant="ghost"
                className="p-0 h-auto bg-transparent hover:bg-white/10"
              >
                <AdminAlertBadge />
              </Button>
              
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
          
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
              <ThemeSwitcher variant="compact" />
            </div>

            {/* Extend Session Button */}
            <Button
              onClick={handleExtendSession}
              variant="ghost"
              className="bg-green-500/20 hover:bg-green-500/30 text-white border border-green-300/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Extend Session
            </Button>

            {/* Refresh Button */}
            <Button
              onClick={handleRefreshSession}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {/* Admin Profile Button */}
            <Button
              onClick={() => setShowProfile(true)}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>

            {/* Logout Button */}
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="bg-red-500/20 hover:bg-red-500/30 text-white border border-red-300/30 px-4 py-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Admin Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Settings className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Controls</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <User className="h-4 w-4 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/wallet')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExtendSession}>
                  <Clock className="h-4 w-4 mr-2" />
                  Extend Session
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Alerts Dialog */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>System Alerts</DialogTitle>
            <DialogDescription>
              Recent system alerts and notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Extended Session Timeout</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Session timeout has been extended to 2 hours for better development experience
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Auto Session Extension</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your session will automatically extend when you're active. Manual extension available.
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Development Mode</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Enhanced session management active for smoother development workflow
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Profile Management</DialogTitle>
            <DialogDescription>
              Your administrator profile information and session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-gray-900">{profile?.role || 'admin'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Session Duration</label>
              <p className="text-gray-900">{sessionTime || '0m'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge variant="outline" className="bg-green-100 text-green-800">
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
