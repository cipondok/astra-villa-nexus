import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTenantMaintenanceRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["maintenance-requests", "tenant", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests" as any)
        .select("id, title, description, category, priority, status, resolution_notes, created_at, resolved_at, booking_id, property_id")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
};

export const useOwnerMaintenanceRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["maintenance-requests", "owner", user?.id],
    queryFn: async () => {
      // First get owner's property IDs
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user!.id);
      
      if (!properties || properties.length === 0) return [];
      
      const propertyIds = properties.map(p => p.id);
      const { data, error } = await supabase
        .from("maintenance_requests" as any)
        .select("*")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
};
