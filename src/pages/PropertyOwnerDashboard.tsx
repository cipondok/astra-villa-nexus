
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import PropertyOwnerOverview from "@/components/propertyowner/PropertyOwnerOverview";
import { useHasRole } from "@/hooks/useUserRoles";

const PropertyOwnerDashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const { hasRole: isPropertyOwner, isLoading: rolesLoading } = useHasRole('property_owner');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !rolesLoading) {
      if (!isAuthenticated) {
        navigate('/?auth=true');
      } else if (!isPropertyOwner) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, isPropertyOwner, rolesLoading, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isPropertyOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <PropertyOwnerOverview />
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
