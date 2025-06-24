
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import SimpleContentManagement from "@/components/admin/SimpleContentManagement";

const ContentManagement = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

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
        <SimpleContentManagement />
      </div>
    </div>
  );
};

export default ContentManagement;
