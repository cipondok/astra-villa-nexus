import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTenantScore = (tenantId?: string) => {
  const { user } = useAuth();
  const targetId = tenantId || user?.id;

  return useQuery({
    queryKey: ["tenant-score", targetId],
    queryFn: async () => {
      // First try to calculate/refresh the score
      await supabase.rpc("calculate_tenant_score", { p_tenant_id: targetId } as any);
      
      // Then fetch the score
      const { data, error } = await supabase
        .from("tenant_scores" as any)
        .select("*")
        .eq("tenant_id", targetId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!targetId,
  });
};

export const useOwnerTenantScores = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant-scores", "owner", user?.id],
    queryFn: async () => {
      // Get all tenant IDs from owner's bookings
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user!.id);
      
      if (!properties || properties.length === 0) return [];
      
      const propertyIds = properties.map(p => p.id);
      const { data: bookings } = await supabase
        .from("rental_bookings" as any)
        .select("customer_id")
        .in("property_id", propertyIds);
      
      if (!bookings || bookings.length === 0) return [];
      
      const tenantIds = [...new Set((bookings as any[]).map(b => b.customer_id))];
      
      // Calculate scores for each tenant
      for (const tid of tenantIds) {
        await supabase.rpc("calculate_tenant_score", { p_tenant_id: tid } as any);
      }
      
      // Fetch all scores
      const { data, error } = await supabase
        .from("tenant_scores" as any)
        .select("*")
        .in("tenant_id", tenantIds)
        .order("overall_score", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
};
