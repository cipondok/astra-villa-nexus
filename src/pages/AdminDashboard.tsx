
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

  console.log('AdminDashboard - Current state:', { 
    loading, 
    isAuthenticated, 
    user: !!user, 
    profile: !!profile, 
    role: profile?.role,
    userEmail: user?.email
  });

  // Check access permissions - simplified logic
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  // Initialize admin alerts hook only if user has access
  useAdminAlerts();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Redirect support staff to appropriate tab
  useEffect(() => {
    if (isSupportStaff && !isAdmin && activeTab === 'overview') {
      setActiveTab("support");
    }
  }, [isSupportStaff, isAdmin, activeTab]);

  // Show loading state only while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
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
