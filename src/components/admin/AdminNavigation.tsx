
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-blue-500/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Control Panel
              </h1>
              <p className="text-sm text-blue-300">
                AstraVilla Command Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-blue-300">
                {adminData?.is_super_admin ? 'Super Administrator' : adminData?.role?.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoHome}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-white border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white border border-red-500/30 hover:border-red-400/50 transition-all duration-300"
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
