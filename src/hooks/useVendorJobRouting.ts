import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorRouting {
  vendor_id: string;
  total_score: number;
  breakdown: {
    rating: number;
    completion: number;
    response_time: number;
    price: number;
    proximity: number;
    capacity: number;
  };
}

export interface RoutingResult {
  success: boolean;
  request_id: string;
  auto_assigned: string | null;
  ranked: VendorRouting[];
  backups: VendorRouting[];
  total_candidates: number;
  sla_deadline: string;
  error?: string;
}

/** Trigger routing for a service request */
export function useRouteVendorJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      request_id: string;
      top_n?: number;
      auto_assign?: boolean;
      admin_override_vendor_id?: string;
    }): Promise<RoutingResult> => {
      const { data, error } = await supabase.functions.invoke('vendor-job-router', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['vendor-service-requests'] });
      qc.invalidateQueries({ queryKey: ['vendor-job-assignments'] });
      if (data.auto_assigned) {
        toast.success(`Job auto-assigned to top vendor (score: ${data.ranked[0]?.total_score})`);
      } else {
        toast.success(`${data.ranked.length} vendors ranked, ${data.backups.length} backups ready`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Fetch routing insights for a specific job */
export function useVendorRoutingInsights(requestId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-routing-insights', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_job_assignments')
        .select('*')
        .eq('request_id', requestId!)
        .order('rank', { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!requestId,
  });
}

/** Fetch all service requests */
export function useVendorServiceRequests(status?: string) {
  return useQuery({
    queryKey: ['vendor-service-requests', status],
    queryFn: async () => {
      let q = supabase
        .from('vendor_service_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

/** Fetch vendor metrics */
export function useVendorPerformanceMetrics(category?: string) {
  return useQuery({
    queryKey: ['vendor-metrics', category],
    queryFn: async () => {
      let q = supabase
        .from('vendor_metrics')
        .select('*')
        .order('avg_rating', { ascending: false });
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}
