
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Home, Store, MessageSquare, DollarSign, TrendingUp, Settings, List } from "lucide-react";

const AdminOverview = () => {
  const { data: userCount } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: propertyCount } = useQuery({
    queryKey: ['admin-property-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: vendorCount } = useQuery({
    queryKey: ['admin-vendor-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor');
      return count || 0;
    },
  });

  const { data: vendorServicesCount } = useQuery({
    queryKey: ['admin-vendor-services-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('vendor_services')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: serviceCategoriesCount } = useQuery({
    queryKey: ['admin-service-categories-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('vendor_service_categories')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: feedbackCount } = useQuery({
    queryKey: ['admin-feedback-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('feedback_monitoring')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
  });

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Properties",
      value: propertyCount,
      icon: Home,
      color: "text-green-600",
    },
    {
      title: "Vendors",
      value: vendorCount,
      icon: Store,
      color: "text-purple-600",
    },
    {
      title: "Vendor Services",
      value: vendorServicesCount,
      icon: Settings,
      color: "text-cyan-600",
    },
    {
      title: "Service Categories",
      value: serviceCategoriesCount,
      icon: List,
      color: "text-indigo-600",
    },
    {
      title: "Pending Feedback",
      value: feedbackCount,
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Monitor key metrics and system health at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value !== undefined ? stat.value : '...'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Vendor Management Quick Access
            </CardTitle>
            <CardDescription>Manage vendor operations and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Active Vendors:</span>
                <span className="font-medium">{vendorCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Services:</span>
                <span className="font-medium">{vendorServicesCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Categories:</span>
                <span className="font-medium">{serviceCategoriesCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Activity monitoring coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
