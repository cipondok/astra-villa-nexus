import React from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '@/hooks/usePermissions';
import { Loader2, ShieldX } from 'lucide-react';

interface PermissionGateProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions — user needs ANY of them */
  anyOf?: string[];
  /** Multiple permissions — user needs ALL of them */
  allOf?: string[];
  /** What to render if access denied (defaults to nothing) */
  fallback?: React.ReactNode;
  /** Show a loading spinner while checking */
  showLoader?: boolean;
  children: React.ReactNode;
}

/**
 * UI-only permission gate. Wraps children and only renders them
 * if the current user has the required permission(s).
 * 
 * NOT a security control — all data access is enforced by RLS/edge functions.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  fallback = null,
  showLoader = false,
  children,
}) => {
  // Determine which hook to use based on props
  if (permission) {
    return <SinglePermissionGate permission={permission} fallback={fallback} showLoader={showLoader}>{children}</SinglePermissionGate>;
  }
  if (anyOf) {
    return <AnyPermissionGate permissions={anyOf} fallback={fallback} showLoader={showLoader}>{children}</AnyPermissionGate>;
  }
  if (allOf) {
    return <AllPermissionGate permissions={allOf} fallback={fallback} showLoader={showLoader}>{children}</AllPermissionGate>;
  }
  return <>{children}</>;
};

function SinglePermissionGate({ permission, fallback, showLoader, children }: { permission: string; fallback: React.ReactNode; showLoader: boolean; children: React.ReactNode }) {
  const { hasPermission, isLoading } = useHasPermission(permission);
  if (isLoading && showLoader) return <LoadingState />;
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}

function AnyPermissionGate({ permissions, fallback, showLoader, children }: { permissions: string[]; fallback: React.ReactNode; showLoader: boolean; children: React.ReactNode }) {
  const { hasAny, isLoading } = useHasAnyPermission(permissions);
  if (isLoading && showLoader) return <LoadingState />;
  if (!hasAny) return <>{fallback}</>;
  return <>{children}</>;
}

function AllPermissionGate({ permissions, fallback, showLoader, children }: { permissions: string[]; fallback: React.ReactNode; showLoader: boolean; children: React.ReactNode }) {
  const { hasAll, isLoading } = useHasAllPermissions(permissions);
  if (isLoading && showLoader) return <LoadingState />;
  if (!hasAll) return <>{fallback}</>;
  return <>{children}</>;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * A visible "Access Denied" fallback component for full-page permission gates.
 */
export function PermissionDenied({ message = 'You do not have permission to access this feature.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-3 rounded-full bg-destructive/10 mb-4">
        <ShieldX className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Access Denied</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    </div>
  );
}

export default PermissionGate;
