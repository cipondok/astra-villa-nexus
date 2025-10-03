import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Clock, CheckCircle, Target, AlertCircle, Award, ArrowRight, Home, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProgressAnalyticsDashboard from "./progress/ProgressAnalyticsDashboard";

interface VendorProgress {
  id: string;
  vendor_id: string;
  progress_percentage: number;
  completed_tasks: number;
  level_started_at: string;
  level_achieved_at: string | null;
  current_level_id: string | null;
  next_level_id: string | null;
  vendor: {
    full_name: string;
    email: string;
  };
}

interface MembershipLevel {
  id: string;
  level_name: string;
  level_number: number;
  requirements: any;
  benefits: any;
  tasks_required: number;
  min_rating: number;
  min_completed_bookings: number;
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

  const { data: membershipLevels } = useQuery({
    queryKey: ['membership-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_membership_levels')
        .select('*')
        .order('level_number', { ascending: true });
      
      if (error) throw error;
      return data as MembershipLevel[];
    }
  });

  const { data: vendorProgress, isLoading } = useQuery({
    queryKey: ['vendor-progress-reports', refreshKey],
    queryFn: async () => {
      console.log('Fetching vendor progress data...');
      
      const { data, error } = await supabase
        .from('vendor_membership_progress')
        .select(`
          *,
          vendor:profiles!vendor_id (full_name, email)
        `)
        .order('progress_percentage', { ascending: false });
      
      console.log('Vendor progress data:', data, 'Error:', error);
      
      if (error) {
        console.error('Progress error:', error);
        throw error;
      }

      // If no data, return sample data
      if (!data || data.length === 0) {
        console.log('No progress data, returning sample data');
        return [
          {
            id: 'sample-1',
            vendor_id: 'sample-vendor-1',
            progress_percentage: 85,
            completed_tasks: 17,
            level_started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            level_achieved_at: null,
            current_level_id: null,
            next_level_id: null,
            vendor: {
              full_name: 'Sample Vendor 1',
              email: 'vendor1@example.com'
            }
          },
          {
            id: 'sample-2',
            vendor_id: 'sample-vendor-2',
            progress_percentage: 100,
            completed_tasks: 20,
            level_started_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            level_achieved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            current_level_id: null,
            next_level_id: null,
            vendor: {
              full_name: 'Sample Vendor 2',
              email: 'vendor2@example.com'
            }
          },
          {
            id: 'sample-3',
            vendor_id: 'sample-vendor-3',
            progress_percentage: 35,
            completed_tasks: 7,
            level_started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            level_achieved_at: null,
            current_level_id: null,
            next_level_id: null,
            vendor: {
              full_name: 'Sample Vendor 3',
              email: 'vendor3@example.com'
            }
          }
        ] as VendorProgress[];
      }
      
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
          <p className="text-muted-foreground">Advanced progress tracking with diagnostic tools</p>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          Live Updates
        </Badge>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="reports">Progress Reports</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6 mt-6">

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

      {/* Vendor Progress List with Guided System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Individual Vendor Progress & Next Level Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {vendorProgress?.map((vendor) => {
              const currentLevel = membershipLevels?.find(l => l.id === vendor.current_level_id);
              const nextLevel = membershipLevels?.find(l => l.id === vendor.next_level_id);
              const tasksRemaining = nextLevel ? nextLevel.tasks_required - vendor.completed_tasks : 0;
              const progressStage = vendor.progress_percentage >= 75 ? 'excellent' : 
                                  vendor.progress_percentage >= 50 ? 'good' : 
                                  vendor.progress_percentage >= 25 ? 'fair' : 'needs-attention';

              return (
                <div key={vendor.id} className="p-6 border rounded-lg space-y-4 bg-card">
                  {/* Header Section */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{vendor.vendor?.full_name || 'Unknown Vendor'}</h4>
                        {currentLevel && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {currentLevel.level_name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{vendor.vendor?.email}</p>
                    </div>
                    <Badge 
                      variant={vendor.level_achieved_at ? "default" : "secondary"}
                      className="ml-4"
                    >
                      {vendor.level_achieved_at ? "Level Completed" : "In Progress"}
                    </Badge>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Overall Progress</span>
                      <span className="font-semibold">{vendor.progress_percentage}%</span>
                    </div>
                    <Progress value={vendor.progress_percentage} className="h-3" />
                    
                    {/* Progress Stage Indicator */}
                    <Alert className={
                      progressStage === 'excellent' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                      progressStage === 'good' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
                      progressStage === 'fair' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                      'border-orange-500 bg-orange-50 dark:bg-orange-950'
                    }>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Status: </strong>
                        {progressStage === 'excellent' && 'Excellent progress! Almost ready for next level.'}
                        {progressStage === 'good' && 'Good progress! Keep up the momentum.'}
                        {progressStage === 'fair' && 'Fair progress. Consider focusing on pending tasks.'}
                        {progressStage === 'needs-attention' && 'Needs attention. Review requirements below.'}
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Tasks Completion */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                      <p className="text-xl font-bold text-primary">{vendor.completed_tasks}</p>
                    </div>
                    {nextLevel && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tasks Remaining</p>
                        <p className="text-xl font-bold text-orange-600">{Math.max(0, tasksRemaining)}</p>
                      </div>
                    )}
                  </div>

                  {/* Next Level Guide */}
                  {nextLevel && !vendor.level_achieved_at && (
                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <ArrowRight className="h-5 w-5" />
                        <h5 className="font-semibold">Next Level: {nextLevel.level_name}</h5>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                          <div>
                            <p className="font-medium">Complete {tasksRemaining} more tasks</p>
                            <p className="text-xs text-muted-foreground">Current: {vendor.completed_tasks} / {nextLevel.tasks_required}</p>
                          </div>
                        </div>
                        
                        {nextLevel.min_rating > 0 && (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                            <div>
                              <p className="font-medium">Maintain rating of {nextLevel.min_rating}+</p>
                              <p className="text-xs text-muted-foreground">Provide excellent service quality</p>
                            </div>
                          </div>
                        )}
                        
                        {nextLevel.min_completed_bookings > 0 && (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                            <div>
                              <p className="font-medium">Complete {nextLevel.min_completed_bookings} bookings</p>
                              <p className="text-xs text-muted-foreground">Build your portfolio and experience</p>
                            </div>
                          </div>
                        )}

                        {nextLevel.requirements && (
                          <div className="flex items-start gap-2">
                            <Home className="h-4 w-4 mt-0.5 text-blue-600" />
                            <div>
                              <p className="font-medium">Property Requirements</p>
                              <p className="text-xs text-muted-foreground">
                                {nextLevel.requirements.verification && `Verification: ${nextLevel.requirements.verification}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Benefits Preview */}
                      {nextLevel.benefits && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Level Benefits:</p>
                          <div className="flex flex-wrap gap-2">
                            {nextLevel.benefits.commission && (
                              <Badge variant="secondary" className="text-xs">
                                {nextLevel.benefits.commission}% Commission
                              </Badge>
                            )}
                            {nextLevel.benefits.features && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {nextLevel.benefits.features} Features
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completion Message */}
                  {vendor.level_achieved_at && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <Award className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Level Completed!</strong> Achieved on {new Date(vendor.level_achieved_at).toLocaleDateString()}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Timeline */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Started: {new Date(vendor.level_started_at).toLocaleDateString()}</span>
                    {vendor.level_achieved_at && (
                      <span>Completed: {new Date(vendor.level_achieved_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {vendorProgress && vendorProgress.length > 0 ? (
            <ProgressAnalyticsDashboard 
              vendorId={vendorProgress[0].vendor_id} 
              vendorName={vendorProgress[0].vendor?.full_name || 'Vendor'}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a vendor from the Progress Reports tab to view analytics</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorProgressReports;