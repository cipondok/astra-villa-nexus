
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

const AdminAlertBadge = () => {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-alerts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('admin_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  if (unreadCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No alerts</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Bell className="h-4 w-4 text-orange-600" />
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      </div>
      <span className="text-sm font-medium text-orange-600">
        {unreadCount} Alert{unreadCount > 1 ? 's' : ''}
      </span>
    </div>
  );
};

export default AdminAlertBadge;
