
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
import AdminVendorServiceManagement from "@/components/admin/AdminVendorServiceManagement";
import AdminKYCManagement from "@/components/admin/AdminKYCManagement";
import AdminMembershipManagement from "@/components/admin/AdminMembershipManagement";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";

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
      case 'vendor-services':
        return <AdminVendorServiceManagement />;
      case 'kyc-management':
        return <AdminKYCManagement />;
      case 'membership-levels':
        return <AdminMembershipManagement />;
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
      {/* Enhanced Top Navigation Bar with Theme Support */}
      <div className="mb-6 p-4 glass-ios rounded-2xl border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="btn-ios flex items-center gap-2 glass-ios">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">System Management & Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggleSwitch language="en" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          {user ? (
            <AdminNavigation activeSection={activeSection} onSectionChange={handleSectionChange} />
          ) : (
            <Card className="card-ios">
              <CardContent className="p-6">
                <Alert variant="destructive" className="glass-ios border-destructive/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-destructive-foreground">Authentication Required</AlertTitle>
                  <AlertDescription className="text-destructive-foreground/80">
                    You must be logged in to access the admin dashboard.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="lg:col-span-3">
          {user ? (
            <div className="space-y-6">
              {renderContent()}
            </div>
          ) : (
            <Card className="card-ios">
              <CardContent className="p-6">
                <Alert variant="destructive" className="glass-ios border-destructive/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-destructive-foreground">Authentication Required</AlertTitle>
                  <AlertDescription className="text-destructive-foreground/80">
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
