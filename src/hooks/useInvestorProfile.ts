import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type InvestorType = 'wna' | 'wni';

export interface InvestorProfile {
  id: string;
  user_id: string;
  investor_type: InvestorType;
  nationality: string | null;
  country_of_residence: string | null;
  investment_budget_min: number | null;
  investment_budget_max: number | null;
  preferred_property_types: string[] | null;
  preferred_locations: string[] | null;
  investment_timeline: string | null;
  has_completed_eligibility_check: boolean;
  eligibility_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestorProfileData {
  investor_type: InvestorType;
  nationality?: string;
  country_of_residence?: string;
  investment_budget_min?: number;
  investment_budget_max?: number;
  preferred_property_types?: string[];
  preferred_locations?: string[];
  investment_timeline?: string;
}

export const useInvestorProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching investor profile:', error);
        return null;
      }

      return data as InvestorProfile | null;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};

export const useCreateInvestorProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: CreateInvestorProfileData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, add the investor role to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'investor',
          is_active: true,
        }, {
          onConflict: 'user_id,role'
        });

      if (roleError) {
        console.error('Error adding investor role:', roleError);
        // Continue anyway - role might already exist
      }

      // Then create the investor profile
      const { data, error } = await supabase
        .from('investor_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as InvestorProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Investor profile created successfully');
    },
    onError: (error) => {
      console.error('Error creating investor profile:', error);
      toast.error('Failed to create investor profile');
    },
  });
};

export const useUpdateInvestorProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<CreateInvestorProfileData>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('investor_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as InvestorProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-profile'] });
      toast.success('Investor profile updated');
    },
    onError: (error) => {
      console.error('Error updating investor profile:', error);
      toast.error('Failed to update investor profile');
    },
  });
};

export const useIsInvestor = () => {
  const { data: profile, isLoading } = useInvestorProfile();
  return {
    isInvestor: !!profile,
    investorType: profile?.investor_type || null,
    isLoading,
  };
};
