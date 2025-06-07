
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, LogOut, Home, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-ios">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Control Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                AstraVilla Command Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {adminData?.is_super_admin ? 'Super Administrator' : adminData?.role?.name}
              </p>
            </div>
            
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
                className="bg-ios-red/10 hover:bg-ios-red/20 text-ios-red hover:text-ios-red border-ios-red/30 hover:border-ios-red/50 transition-all duration-300"
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
