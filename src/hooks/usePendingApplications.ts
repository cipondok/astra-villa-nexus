import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ApplicationStatus {
  id: string;
  type: 'property_owner' | 'vendor' | 'agent';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  created_at: string;
  review_notes?: string;
  business_name?: string;
}

export const usePendingApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-applications', user?.id],
    queryFn: async (): Promise<ApplicationStatus[]> => {
      if (!user?.id) return [];

      const applications: ApplicationStatus[] = [];

      // Fetch property owner requests
      const { data: propertyOwnerData } = await supabase
        .from('property_owner_requests')
        .select('id, status, created_at, review_notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (propertyOwnerData && propertyOwnerData.length > 0) {
        applications.push({
          id: propertyOwnerData[0].id,
          type: 'property_owner',
          status: propertyOwnerData[0].status as ApplicationStatus['status'],
          created_at: propertyOwnerData[0].created_at,
          review_notes: propertyOwnerData[0].review_notes || undefined
        });
      }

      // Fetch vendor requests
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
      }

      // Fetch agent registration requests
      const { data: agentData } = await supabase
        .from('agent_registration_requests')
        .select('id, status, created_at, review_notes, company_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (agentData && agentData.length > 0) {
        applications.push({
          id: agentData[0].id,
          type: 'agent',
          status: agentData[0].status as ApplicationStatus['status'],
          created_at: agentData[0].created_at,
          review_notes: agentData[0].review_notes || undefined,
          business_name: agentData[0].company_name || undefined
        });
      }

      return applications;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
};
