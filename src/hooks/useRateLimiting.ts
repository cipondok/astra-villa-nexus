import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RateLimitConfig {
  id: string;
  endpoint_pattern: string;
  endpoint_name: string;
  requests_per_window: number;
  window_seconds: number;
  burst_limit: number | null;
  is_active: boolean;
  applies_to: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  violation_count: number;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  blocked_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface PartnerAPIKey {
  id: string;
  api_key: string;
  partner_name: string;
  partner_email: string;
  is_active: boolean;
  is_whitelisted: boolean;
  rate_limit_multiplier: number;
  custom_limits: Record<string, any>;
  allowed_endpoints: string[];
  total_requests: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface RateLimitViolation {
  id: string;
  identifier: string;
  identifier_type: 'ip' | 'user' | 'api_key';
  endpoint_pattern: string;
  violation_count: number;
  first_violation_at: string;
  last_violation_at: string;
  user_agent: string | null;
  request_path: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface RateLimitAnalytics {
  id: string;
  hour_bucket: string;
  endpoint_pattern: string;
  total_requests: number;
  blocked_requests: number;
  unique_ips: number;
  unique_users: number;
  avg_requests_per_ip: number | null;
  top_ips: any[];
}

export interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  added_by: string | null;
  created_at: string;
}

export const useRateLimiting = () => {
  const queryClient = useQueryClient();

  // Fetch rate limit configs
  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['rate-limit-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_config')
        .select('*')
        .order('endpoint_pattern');
      if (error) throw error;
      return data as RateLimitConfig[];
    }
  });

  // Fetch blocked IPs
  const { data: blockedIPs = [], isLoading: loadingBlockedIPs } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });
      if (error) throw error;
      return data as BlockedIP[];
    }
  });

  // Fetch whitelisted IPs
  const { data: whitelistedIPs = [], isLoading: loadingWhitelistedIPs } = useQuery({
    queryKey: ['whitelisted-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whitelisted_ips')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WhitelistedIP[];
    }
  });

  // Fetch partner API keys
  const { data: apiKeys = [], isLoading: loadingAPIKeys } = useQuery({
    queryKey: ['partner-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PartnerAPIKey[];
    }
  });

  // Fetch recent violations
  const { data: violations = [], isLoading: loadingViolations } = useQuery({
    queryKey: ['rate-limit-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .order('last_violation_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as RateLimitViolation[];
    }
  });

  // Fetch analytics
  const { data: analytics = [], isLoading: loadingAnalytics } = useQuery({
    queryKey: ['rate-limit-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_analytics')
        .select('*')
        .gte('hour_bucket', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('hour_bucket', { ascending: false });
      if (error) throw error;
      return data as RateLimitAnalytics[];
    }
  });

  // Update rate limit config
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<RateLimitConfig> & { id: string }) => {
      const { error } = await supabase
        .from('rate_limit_config')
        .update({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-limit-configs'] });
      toast.success('Rate limit config updated');
    },
    onError: () => toast.error('Failed to update config')
  });

  // Block IP
  const blockIPMutation = useMutation({
    mutationFn: async (data: { 
      ip_address: string; 
      reason: string; 
      expires_at?: string; 
      is_permanent?: boolean;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('blocked_ips')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP blocked successfully');
    },
    onError: () => toast.error('Failed to block IP')
  });

  // Unblock IP
  const unblockIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP unblocked');
    },
    onError: () => toast.error('Failed to unblock IP')
  });

  // Whitelist IP
  const whitelistIPMutation = useMutation({
    mutationFn: async (data: { ip_address: string; description?: string }) => {
      const { error } = await supabase
        .from('whitelisted_ips')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelisted-ips'] });
      toast.success('IP whitelisted');
    },
    onError: () => toast.error('Failed to whitelist IP')
  });

  // Remove from whitelist
  const removeWhitelistMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('whitelisted_ips')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelisted-ips'] });
      toast.success('IP removed from whitelist');
    },
    onError: () => toast.error('Failed to remove from whitelist')
  });

  // Create API key
  const createAPIKeyMutation = useMutation({
    mutationFn: async (data: {
      partner_name: string;
      partner_email: string;
      rate_limit_multiplier?: number;
      is_whitelisted?: boolean;
      expires_at?: string;
    }) => {
      const apiKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`;
      const { error } = await supabase
        .from('partner_api_keys')
        .insert({ ...data, api_key: apiKey });
      if (error) throw error;
      return apiKey;
    },
    onSuccess: (apiKey) => {
      queryClient.invalidateQueries({ queryKey: ['partner-api-keys'] });
      toast.success(`API key created: ${apiKey.substring(0, 20)}...`);
    },
    onError: () => toast.error('Failed to create API key')
  });

  // Revoke API key
  const revokeAPIKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partner_api_keys')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-api-keys'] });
      toast.success('API key revoked');
    },
    onError: () => toast.error('Failed to revoke API key')
  });

  return {
    // Data
    configs,
    blockedIPs,
    whitelistedIPs,
    apiKeys,
    violations,
    analytics,
    
    // Loading states
    isLoading: loadingConfigs || loadingBlockedIPs || loadingAPIKeys || loadingViolations,
    loadingAnalytics,
    
    // Mutations
    updateConfig: updateConfigMutation.mutate,
    blockIP: blockIPMutation.mutate,
    unblockIP: unblockIPMutation.mutate,
    whitelistIP: whitelistIPMutation.mutate,
    removeWhitelist: removeWhitelistMutation.mutate,
    createAPIKey: createAPIKeyMutation.mutateAsync,
    revokeAPIKey: revokeAPIKeyMutation.mutate,
    
    // Mutation states
    isUpdating: updateConfigMutation.isPending,
    isBlocking: blockIPMutation.isPending,
  };
};

export default useRateLimiting;