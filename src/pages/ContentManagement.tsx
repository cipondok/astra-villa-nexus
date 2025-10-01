
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Navigate } from "react-router-dom";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import ContentManagement from "@/components/admin/ContentManagement";

const ContentManagementPage = () => {
  const { user, profile, loading } = useAuth();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();

  if (loading || adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboardHeader 
        isAdmin={isAdmin} 
        user={user} 
        profile={profile} 
      />
      <div className="container mx-auto px-4 py-8">
        <ContentManagement />
      </div>
    </div>
  );
};

export default ContentManagementPage;
