import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Clock, CheckCircle } from "lucide-react";

interface VendorProgress {
  id: string;
  vendor_id: string;
  progress_percentage: number;
  completed_tasks: number;
  level_started_at: string;
  level_achieved_at: string | null;
  vendor: {
    full_name: string;
    email: string;
  };
}

const VendorProgressReports = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: vendorProgress, isLoading } = useQuery({
    queryKey: ['vendor-progress-reports', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_membership_progress')
        .select(`
          *,
          vendor:profiles!vendor_id (full_name, email)
        `)
        .order('progress_percentage', { ascending: false });
      
      if (error) throw error;
      return data as VendorProgress[];
    },
    staleTime: 0, // Always fetch fresh data
  });

  const { data: analytics } = useQuery({
    queryKey: ['vendor-analytics-summary', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_performance_analytics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const totalVendors = vendorProgress?.length || 0;
  const activeVendors = vendorProgress?.filter(v => v.progress_percentage > 0).length || 0;
  const completedVendors = vendorProgress?.filter(v => v.level_achieved_at).length || 0;
  const avgProgress = vendorProgress?.reduce((acc, v) => acc + v.progress_percentage, 0) / totalVendors || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <h2 className="text-2xl font-bold">Vendor Progress Reports</h2>
          <p className="text-muted-foreground">Real-time vendor progress tracking and analytics</p>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          Live Updates
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{totalVendors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Progress</p>
                <p className="text-2xl font-bold">{activeVendors}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedVendors}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{Math.round(avgProgress)}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Vendor Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendorProgress?.map((vendor) => (
              <div key={vendor.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{vendor.vendor?.full_name || 'Unknown Vendor'}</h4>
                    <p className="text-sm text-muted-foreground">{vendor.vendor?.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={vendor.level_achieved_at ? "default" : "secondary"}>
                      {vendor.level_achieved_at ? "Completed" : "In Progress"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vendor.completed_tasks} tasks completed
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{vendor.progress_percentage}%</span>
                  </div>
                  <Progress value={vendor.progress_percentage} className="h-2" />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Started: {new Date(vendor.level_started_at).toLocaleDateString()}</span>
                  {vendor.level_achieved_at && (
                    <span>Completed: {new Date(vendor.level_achieved_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProgressReports;