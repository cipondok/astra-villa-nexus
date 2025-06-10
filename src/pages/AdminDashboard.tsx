
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Home } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import SystemMonitor from "@/components/admin/SystemMonitor";
import UserRolesManagement from "@/components/admin/UserRolesManagement";
import DatabaseUserManagement from "@/components/admin/DatabaseUserManagement";
import PropertyManagement from "@/components/admin/PropertyManagement";
import EnhancedContentManagement from "@/components/admin/EnhancedContentManagement";
import VendorManagement from "@/components/admin/VendorManagement";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import SimpleUserManagement from "@/components/admin/SimpleUserManagement";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user } = useAuth();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <SystemMonitor />;
      case 'simple-users':
        return <SimpleUserManagement />;
      case 'user-roles':
        return <UserRolesManagement />;
      case 'database-users':
        return <DatabaseUserManagement />;
      case 'properties':
        return <PropertyManagement />;
      case 'content':
        return <EnhancedContentManagement />;
      case 'vendors':
        return <VendorManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'system-monitor':
        return <SystemMonitor />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <SystemMonitor />;
    }
  };

  return (
    <Shell>
      {/* Top Navigation Bar with Home Link */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          {user ? (
            <AdminNavigation activeSection={activeSection} onSectionChange={handleSectionChange} />
          ) : (
            <Card className="h-full">
              <CardContent className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    You must be logged in to access the admin dashboard.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="md:col-span-3">
          {user ? (
            renderContent()
          ) : (
            <Card className="h-full">
              <CardContent className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    You must be logged in to access the admin dashboard.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
};

export default AdminDashboard;
