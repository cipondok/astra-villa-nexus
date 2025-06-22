
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users,
  TrendingUp,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react';
import VendorProfileProgress from './VendorProfileProgress';

const EnhancedVendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    monthlyRevenue: 0,
    avgRating: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    profileCompletion: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('vendor_bookings')
        .select('*')
        .eq('vendor_id', user?.id);

      if (bookingsError) throw bookingsError;

      // Load business profile for rating
      const { data: profile, error: profileError } = await supabase
        .from('vendor_business_profiles')
        .select('rating, profile_completion_percentage')
        .eq('vendor_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Calculate stats
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings
        ?.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + (Number(booking.total_amount) || 0), 0) || 0;

      setDashboardData({
        totalBookings,
        monthlyRevenue,
        avgRating: profile?.rating || 0,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        profileCompletion: profile?.profile_completion_percentage || 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your business and track performance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{dashboardData.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${dashboardData.monthlyRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{dashboardData.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold">{dashboardData.profileCompletion}%</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Completion Alert */}
            {dashboardData.profileCompletion < 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your profile is {dashboardData.profileCompletion}% complete. Complete your profile to attract more customers.
                </AlertDescription>
              </Alert>
            )}

            {/* Booking Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Pending Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardData.pendingBookings}</div>
                  <p className="text-sm text-gray-600">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardData.completedBookings}</div>
                  <p className="text-sm text-gray-600">Successfully completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Cancelled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardData.cancelledBookings}</div>
                  <p className="text-sm text-gray-600">Cancelled bookings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Manage your recent booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent bookings to display</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <VendorProfileProgress />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Analytics
                </CardTitle>
                <CardDescription>Track your business performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Analytics data will be available once you have more booking activity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedVendorDashboard;
