
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, LogOut, Home } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Astra Villa Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {adminData?.is_super_admin ? 'Super Admin' : adminData?.role?.name}
              </p>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
