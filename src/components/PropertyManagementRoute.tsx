import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { canManageProperties } from '@/lib/managementRoles';
import { Button } from '@/components/ui/button';
import { ShieldX, Loader2 } from 'lucide-react';

/**
 * Guards the property management area (/my-properties and sub-routes).
 * Guests are redirected to sign-in; authenticated users without a management
 * role get a safe, explanatory fallback instead of a dead end.
 */
const PropertyManagementRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  const location = useLocation();
  const navigate = useNavigate();

  if (authLoading || rolesLoading) {
    return (
      <output
        aria-live="polite"
        className="flex min-h-dvh items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading…
      </output>
    );
  }

  if (!user) {
    return <Navigate to="/?auth=true" replace state={{ from: location.pathname }} />;
  }

  if (!canManageProperties(roles)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <ShieldX className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Property management unavailable</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your account doesn’t have a listing role yet. Agents, property owners and developers can
            manage listings here.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
          <Button variant="outline" onClick={() => navigate('/properties')}>
            Browse properties
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default PropertyManagementRoute;
