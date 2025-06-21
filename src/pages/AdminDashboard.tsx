
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminTabNavigation from "@/components/admin/AdminTabNavigation";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import TokenManagementHub from "@/components/admin/TokenManagementHub";
import { tabCategories } from "@/components/admin/AdminTabCategories";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";

const AdminDashboard = () => {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "overview");
  const [loadingError, setLoadingError] = useState<string | null>(null);

  console.log('AdminDashboard - Current state:', { 
    loading, 
    isAuthenticated, 
    user: !!user, 
    profile: !!profile, 
    role: profile?.role,
    userEmail: user?.email
  });

  // Check access permissions
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  // Initialize admin alerts hook only if user has access
  useAdminAlerts();

  // Enhanced authentication check with timeout
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AdminDashboard - Auth check starting');
      
      // Set a timeout for loading
      const timeout = setTimeout(() => {
        if (loading) {
          setLoadingError('Authentication check timed out. Please refresh the page.');
        }
      }, 10000); // 10 second timeout

      if (!loading) {
        clearTimeout(timeout);
        
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          console.log('AdminDashboard - Not authenticated, redirecting to login');
          navigate('/?auth=true', { replace: true });
          return;
        }

        // Check if profile exists and user has access
        if (profile && !canAccess) {
          console.log('AdminDashboard - Insufficient permissions');
          navigate('/', { replace: true });
          return;
        }

        // If profile is null but user exists, there might be a profile loading issue
        if (!profile && user) {
          console.log('AdminDashboard - Profile not found, but user exists');
          setLoadingError('Profile not found. Please contact support if this persists.');
          return;
        }

        console.log('AdminDashboard - Authentication successful');
      }

      return () => clearTimeout(timeout);
    };

    checkAuth();
  }, [loading, isAuthenticated, user, profile, canAccess, navigate]);

  // Redirect support staff to appropriate tab
  useEffect(() => {
    if (isSupportStaff && !isAdmin) {
      if (activeTab === 'system' || activeTab === 'overview') {
        setActiveTab("support");
      }
    }
  }, [profile, isSupportStaff, isAdmin, activeTab]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
          <p className="text-xs text-muted-foreground mt-2">
            If this takes too long, please refresh the page
          </p>
        </div>
      </div>
    );
  }

  // Show loading error
  if (loadingError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive flex items-center gap-2 justify-center">
              <AlertCircle className="h-5 w-5" />
              Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">{loadingError}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user has admin access
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
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
