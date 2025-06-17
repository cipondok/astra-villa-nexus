import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminTabNavigation from "@/components/admin/AdminTabNavigation";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import { tabCategories } from "@/components/admin/AdminTabCategories";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "overview");

  const isAdmin = profile?.role === 'admin';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  // Initialize admin alerts hook
  useAdminAlerts();

  useEffect(() => {
    if (isSupportStaff && !isAdmin) {
      if (activeTab === 'system' || activeTab === 'overview') {
        setActiveTab("support");
      }
    }
  }, [profile, isSupportStaff, isAdmin, activeTab]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (simplified check for better performance)
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">You don't have permission to access this dashboard.</p>
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

          <AdminDashboardContent
            isAdmin={isAdmin}
            setActiveTab={setActiveTab}
          />
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
