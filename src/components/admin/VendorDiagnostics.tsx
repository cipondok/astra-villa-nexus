import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp,
  Users,
  Activity
} from "lucide-react";

interface VendorStatus {
  id: string;
  vendor_id: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  last_activity: string;
  services_count: number;
  bookings_count: number;
  rating: number;
  vendor: {
    full_name: string;
    email: string;
  };
}

const VendorDiagnostics = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const { data: vendorStatuses, isLoading } = useQuery({
    queryKey: ['vendor-diagnostics', refreshKey],
    queryFn: async () => {
      // Get vendor business profiles with activity data
      const { data: profiles, error: profilesError } = await supabase
        .from('vendor_business_profiles')
        .select(`
          *,
          vendor:profiles!vendor_id (full_name, email)
        `);

      if (profilesError) throw profilesError;

      // Get services count for each vendor
      const { data: services, error: servicesError } = await supabase
        .from('vendor_services')
        .select('vendor_id, id')
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Combine data
      const vendorStats = profiles?.map(profile => {
        const vendorServices = services?.filter(s => s.vendor_id === profile.vendor_id) || [];
        
        return {
          id: profile.id,
          vendor_id: profile.vendor_id,
          status: profile.is_active ? 'active' : 'inactive',
          last_activity: profile.updated_at,
          services_count: vendorServices.length,
          bookings_count: profile.total_reviews || 0,
          rating: profile.rating || 0,
          vendor: profile.vendor
        };
      }) || [];

      return vendorStats as VendorStatus[];
    },
    staleTime: 0,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['vendor-system-health', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select('is_active, rating, total_reviews');
      
      if (error) throw error;
      
      const total = data.length;
      const active = data.filter(v => v.is_active).length;
      const avgRating = data.reduce((acc, v) => acc + (v.rating || 0), 0) / total;
      const totalReviews = data.reduce((acc, v) => acc + (v.total_reviews || 0), 0);
      
      return {
        total,
        active,
        inactive: total - active,
        avgRating,
        totalReviews,
        healthScore: Math.round((active / total) * 100)
      };
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'suspended': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor System Diagnostics</h2>
          <p className="text-muted-foreground">Real-time vendor system monitoring and health checks</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="animate-pulse">
            Live Monitoring
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">{systemHealth?.healthScore || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold">{systemHealth?.active || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{(systemHealth?.avgRating || 0).toFixed(1)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{systemHealth?.totalReviews || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Status List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Status Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendorStatuses?.map((vendor) => (
              <div key={vendor.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(vendor.status)}`}></div>
                    <div>
                      <h4 className="font-medium">{vendor.vendor?.full_name || 'Unknown Vendor'}</h4>
                      <p className="text-sm text-muted-foreground">{vendor.vendor?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{vendor.services_count}</p>
                      <p className="text-xs text-muted-foreground">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{vendor.rating.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{vendor.bookings_count}</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStatusIcon(vendor.status)}
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Last activity: {new Date(vendor.last_activity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDiagnostics;