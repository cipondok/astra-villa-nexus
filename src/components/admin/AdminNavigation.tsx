
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Home, Shield, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedLogo from "@/components/AnimatedLogo";

interface AdminNavigationProps {
  user: any;
  adminData: any;
}

const AdminNavigation = ({ user, adminData }: AdminNavigationProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const isSuperAdmin = user?.email === 'mycode103@gmail.com';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-ios border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            <AnimatedLogo />
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Admin Control Panel
                {isSuperAdmin && (
                  <Badge variant="destructive" className="text-xs">
                    SUPER ADMIN
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                AstraVilla Management System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* System Health Indicator */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">System Health: {adminData?.systemHealth || 0}%</span>
              </div>
              
              {adminData?.pendingApprovals > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    {adminData.pendingApprovals} pending
                  </Badge>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                {isSuperAdmin && <Shield className="h-4 w-4 text-red-500" />}
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoHome}
                className="bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary border-primary/30 hover:border-primary/50 transition-all duration-300"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 border-red-500/30 hover:border-red-500/50 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
