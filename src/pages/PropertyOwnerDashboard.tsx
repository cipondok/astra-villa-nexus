
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isPropertyOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-2 sm:px-4 py-2 sm:py-4">
        <PropertyOwnerOverview />
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
