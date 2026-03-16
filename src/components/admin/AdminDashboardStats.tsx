import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Building2, Store, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

const StatCard = ({ title, value, change, icon: Icon, loading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      )}
      {change && !loading && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {change.type === 'increase' ? (
            <TrendingUp className="h-3 w-3 text-chart-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={change.type === 'increase' ? 'text-chart-1' : 'text-destructive'}>
            {change.value}%
          </span>
          <span>from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const AdminDashboardStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats-live'],
    queryFn: async () => {
      const [usersRes, propsRes, vendorsRes, ticketsRes] = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vendor_services').select('*', { count: 'exact', head: true }),
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('action_required', true).eq('is_read', false),
      ]);

      return {
        users: usersRes.status === 'fulfilled' ? (usersRes.value.count ?? 0) : 0,
        properties: propsRes.status === 'fulfilled' ? (propsRes.value.count ?? 0) : 0,
        vendors: vendorsRes.status === 'fulfilled' ? (vendorsRes.value.count ?? 0) : 0,
        tickets: ticketsRes.status === 'fulfilled' ? (ticketsRes.value.count ?? 0) : 0,
      };
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Users"
        value={data?.users ?? 0}
        icon={Users}
        loading={isLoading}
      />
      <StatCard
        title="Active Properties"
        value={data?.properties ?? 0}
        icon={Building2}
        loading={isLoading}
      />
      <StatCard
        title="Vendors"
        value={data?.vendors ?? 0}
        icon={Store}
        loading={isLoading}
      />
      <StatCard
        title="Pending Actions"
        value={data?.tickets ?? 0}
        icon={MessageSquare}
        loading={isLoading}
      />
    </div>
  );
};

export default AdminDashboardStats;
