
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminTabNavigation from "@/components/admin/AdminTabNavigation";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import TokenManagementHub from "@/components/admin/TokenManagementHub";
import { tabCategories } from "@/components/admin/AdminTabCategories";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";

const AdminDashboard = () => {
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "overview");
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);

  console.log('AdminDashboard - Current state:', { 
    loading, 
    isAuthenticated, 
    user: !!user, 
    profile: !!profile, 
    role: profile?.role,
    userEmail: user?.email
  });

  // Initialize admin alerts hook
  useAdminAlerts();

  // Check access permissions
  useEffect(() => {
    const checkAccess = async () => {
      console.log('Checking admin access...', { loading, isAuthenticated, user: !!user, profile: !!profile });
      
      // Wait for auth to complete
      if (loading) {
        console.log('Still loading, waiting...');
        return;
      }

      // If not authenticated, redirect immediately
      if (!isAuthenticated || !user) {
        console.log('Not authenticated, redirecting...');
        navigate('/?auth=true', { replace: true });
        return;
      }

      // If no profile yet, wait a bit more
      if (!profile) {
        console.log('No profile yet, waiting...');
        return;
      }

      // Check admin access with multiple conditions
      const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
      const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
      const hasAccess = isAdmin || isSupportStaff;

      console.log('Access check result:', { 
        isAdmin, 
        isSupportStaff, 
        hasAccess, 
        email: user?.email, 
        role: profile?.role 
      });

      if (!hasAccess) {
        console.log('Access denied, redirecting...');
        navigate('/', { replace: true });
        return;
      }

      // Redirect support staff to appropriate tab
      if (isSupportStaff && !isAdmin && activeTab === 'overview') {
        console.log('Redirecting support staff to support tab');
        setActiveTab("support");
      }

      console.log('Access granted, completing check');
      setAccessCheckComplete(true);
    };

    checkAccess();
  }, [loading, isAuthenticated, user, profile, navigate, activeTab]);

  // Show loading state while checking access
  if (loading || (!accessCheckComplete && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Final access check
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this dashboard.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">Return to Home</Button>
              <Button variant="outline" onClick={signOut} className="w-full">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation
        language="en"
        onLanguageToggle={() => {}}
        theme="light"
        onThemeToggle={() => {}}
      />
      
      <AdminDashboardHeader 
        isAdmin={isAdmin} 
        user={user} 
        profile={profile} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <AdminTabNavigation
            tabCategories={tabCategories}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />

          {/* Add ASTRA Token Management as a dedicated tab */}
          {activeTab === "astra-tokens" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">ASTRA Token Management</h2>
                <p className="text-muted-foreground">
                  Configure and manage the ASTRA token system
                </p>
              </div>
              <TokenManagementHub />
            </div>
          )}

          {activeTab !== "astra-tokens" && (
            <AdminDashboardContent
              isAdmin={isAdmin}
              setActiveTab={setActiveTab}
            />
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
