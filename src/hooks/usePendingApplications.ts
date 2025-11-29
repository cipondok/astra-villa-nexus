import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ApplicationStatus {
  id: string;
  type: 'property_owner' | 'vendor' | 'agent';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  business_name?: string;
}

export interface UpgradeRestrictions {
  hasPendingApplication: boolean;
  hasRecentRoleChange: boolean;
  daysUntilCanUpgrade: number;
  lastRoleChangeDate: string | null;
  canUpgrade: boolean;
  restrictionReason: string | null;
}

const UPGRADE_COOLDOWN_DAYS = 30;

export const usePendingApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-applications', user?.id],
    queryFn: async (): Promise<{
      applications: ApplicationStatus[];
      restrictions: UpgradeRestrictions;
    }> => {
      if (!user?.id) {
        return {
          applications: [],
          restrictions: {
            hasPendingApplication: false,
            hasRecentRoleChange: false,
            daysUntilCanUpgrade: 0,
            lastRoleChangeDate: null,
            canUpgrade: true,
            restrictionReason: null
          }
        };
      }

      const applications: ApplicationStatus[] = [];
      let hasPendingApplication = false;

      // Fetch property owner requests
      const { data: propertyOwnerData } = await supabase
        .from('property_owner_requests')
        .select('id, status, created_at, reviewed_at, review_notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (propertyOwnerData && propertyOwnerData.length > 0) {
        applications.push({
          id: propertyOwnerData[0].id,
          type: 'property_owner',
          status: propertyOwnerData[0].status as ApplicationStatus['status'],
          created_at: propertyOwnerData[0].created_at,
          reviewed_at: propertyOwnerData[0].reviewed_at || undefined,
          review_notes: propertyOwnerData[0].review_notes || undefined
        });
        if (propertyOwnerData[0].status === 'pending' || propertyOwnerData[0].status === 'under_review') {
          hasPendingApplication = true;
        }
      }

      // Fetch vendor requests (no reviewed_at column)
      const { data: vendorData } = await supabase
        .from('vendor_requests')
        .select('id, status, created_at, review_notes, business_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (vendorData && vendorData.length > 0) {
        applications.push({
          id: vendorData[0].id,
          type: 'vendor',
          status: vendorData[0].status as ApplicationStatus['status'],
          created_at: vendorData[0].created_at,
          review_notes: vendorData[0].review_notes || undefined,
          business_name: vendorData[0].business_name
        });
        if (vendorData[0].status === 'pending' || vendorData[0].status === 'under_review') {
          hasPendingApplication = true;
        }
      }

      // Fetch agent registration requests
      const { data: agentData } = await supabase
        .from('agent_registration_requests')
        .select('id, status, created_at, reviewed_at, review_notes, company_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (agentData && agentData.length > 0) {
        applications.push({
          id: agentData[0].id,
          type: 'agent',
          status: agentData[0].status as ApplicationStatus['status'],
          created_at: agentData[0].created_at,
          reviewed_at: agentData[0].reviewed_at || undefined,
          review_notes: agentData[0].review_notes || undefined,
          business_name: agentData[0].company_name || undefined
        });
        if (agentData[0].status === 'pending' || agentData[0].status === 'under_review') {
          hasPendingApplication = true;
        }
      }

      // Check for recent role changes (last 30 days)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, assigned_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .neq('role', 'general_user')
        .order('assigned_at', { ascending: false })
        .limit(1);

      let hasRecentRoleChange = false;
      let daysUntilCanUpgrade = 0;
      let lastRoleChangeDate: string | null = null;

      if (roleData && roleData.length > 0 && roleData[0].assigned_at) {
        lastRoleChangeDate = roleData[0].assigned_at;
        const assignedDate = new Date(roleData[0].assigned_at);
        const now = new Date();
        const daysSinceChange = Math.floor((now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceChange < UPGRADE_COOLDOWN_DAYS) {
          hasRecentRoleChange = true;
          daysUntilCanUpgrade = UPGRADE_COOLDOWN_DAYS - daysSinceChange;
        }
      }

      // Determine if user can upgrade
      let canUpgrade = true;
      let restrictionReason: string | null = null;

      if (hasPendingApplication) {
        canUpgrade = false;
        restrictionReason = 'You have a pending application. Please wait until it is reviewed.';
      } else if (hasRecentRoleChange) {
        canUpgrade = false;
        restrictionReason = `You recently upgraded your account. You can apply again in ${daysUntilCanUpgrade} day${daysUntilCanUpgrade !== 1 ? 's' : ''}.`;
      }

      return {
        applications,
        restrictions: {
          hasPendingApplication,
          hasRecentRoleChange,
          daysUntilCanUpgrade,
          lastRoleChangeDate,
          canUpgrade,
          restrictionReason
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Helper hook to just get applications list
export const useApplicationsList = () => {
  const { data, ...rest } = usePendingApplications();
  return {
    data: data?.applications || [],
    ...rest
  };
};

// Helper hook to just get upgrade restrictions
export const useUpgradeRestrictions = () => {
  const { data, ...rest } = usePendingApplications();
  return {
    data: data?.restrictions || {
      hasPendingApplication: false,
      hasRecentRoleChange: false,
      daysUntilCanUpgrade: 0,
      lastRoleChangeDate: null,
      canUpgrade: true,
      restrictionReason: null
    },
    ...rest
  };
};
