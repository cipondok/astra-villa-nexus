
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
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "overview");
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  console.log('AdminDashboard - Current state:', { 
    loading, 
    isAuthenticated, 
    user: !!user, 
    profile: !!profile, 
    role: profile?.role,
    userEmail: user?.email,
    authCheckComplete
  });

  // Check access permissions
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  // Initialize admin alerts hook only if user has access
  useAdminAlerts();

  // Handle forced logout
  const handleForceLogout = async () => {
    try {
      console.log('Force logout initiated');
      await signOut();
      // Clear any local storage items
      localStorage.clear();
      sessionStorage.clear();
      // Force reload to clear any cached state
      window.location.href = '/?auth=true';
    } catch (error) {
      console.error('Force logout error:', error);
      // If signOut fails, force redirect anyway
      window.location.href = '/?auth=true';
    }
  };

  // Enhanced authentication check
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AdminDashboard - Auth check starting');
      
      // Wait a maximum of 5 seconds for auth to load
      const timeout = setTimeout(() => {
        if (!authCheckComplete) {
          console.log('AdminDashboard - Auth check timeout');
          setAuthCheckComplete(true);
        }
      }, 5000);

      // If loading is complete
      if (!loading) {
        clearTimeout(timeout);
        console.log('AdminDashboard - Loading complete, checking auth');
        
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          console.log('AdminDashboard - Not authenticated, redirecting');
          navigate('/?auth=true', { replace: true });
          return;
        }

        // If we have a user but no profile, wait a bit more
        if (!profile) {
          console.log('AdminDashboard - No profile found, waiting...');
          setTimeout(() => {
            if (!profile) {
              console.log('AdminDashboard - Still no profile, checking access');
              // If still no profile after waiting, check if super admin by email
              if (user.email === 'mycode103@gmail.com') {
                console.log('AdminDashboard - Super admin access granted by email');
                setAuthCheckComplete(true);
              } else {
                console.log('AdminDashboard - No profile and not super admin');
                setAccessDenied(true);
                setAuthCheckComplete(true);
              }
            } else {
              setAuthCheckComplete(true);
            }
          }, 2000);
          return;
        }

        // Check access permissions
        if (!canAccess) {
          console.log('AdminDashboard - Access denied');
          setAccessDenied(true);
        }

        setAuthCheckComplete(true);
      }

      return () => clearTimeout(timeout);
    };

    checkAuth();
  }, [loading, isAuthenticated, user, profile, canAccess, navigate]);

  // Redirect support staff to appropriate tab
  useEffect(() => {
    if (authCheckComplete && isSupportStaff && !isAdmin) {
      if (activeTab === 'system' || activeTab === 'overview') {
        setActiveTab("support");
      }
    }
  }, [authCheckComplete, isSupportStaff, isAdmin, activeTab]);

  // Show loading state
  if (loading || !authCheckComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground mb-2">Loading admin dashboard...</p>
          <p className="text-xs text-muted-foreground mb-4">
            Checking authentication and permissions...
          </p>
          <Button 
            variant="outline" 
            onClick={handleForceLogout}
            className="mt-4"
          >
            Force Logout & Retry
          </Button>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    console.log('AdminDashboard - Rendering auth redirect');
    return null;
  }

  // Check if user has admin access
  if (accessDenied || (!canAccess && user?.email !== 'mycode103@gmail.com')) {
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
              <Button variant="outline" onClick={handleForceLogout} className="w-full">
                Logout & Retry
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
