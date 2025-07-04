
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
  User,
  Settings
} from 'lucide-react';
import VendorProfileProgress from './VendorProfileProgress';
import VendorSmartSummary from './VendorSmartSummary';
import VendorComplianceAlerts from './VendorComplianceAlerts';
import VendorPropertyTypeToggle from './VendorPropertyTypeToggle';
import VendorServiceMatrix from './VendorServiceMatrix';

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
      console.log('Loading dashboard data for user:', user?.id);
      
      // Load bookings data with error handling
      const { data: bookings, error: bookingsError } = await supabase
        .from('vendor_bookings')
        .select('*')
        .eq('vendor_id', user?.id);

      if (bookingsError) {
        console.error('Bookings error:', bookingsError);
        // Continue with empty bookings instead of throwing
      }

      // Load business profile for rating with error handling
      const { data: profile, error: profileError } = await supabase
        .from('vendor_business_profiles')
        .select('rating, profile_completion_percentage')
        .eq('vendor_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Continue with null profile instead of throwing
      }

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
    <div className="space-y-8">
      {/* Smart Summary Header */}
      <VendorSmartSummary />

      {/* Compliance Alerts */}
      <VendorComplianceAlerts />

      {/* Enhanced Control Panels */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
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
                <p className="text-sm text-muted-foreground">Successfully completed</p>
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
                <p className="text-sm text-muted-foreground">Cancelled bookings</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <VendorServiceMatrix />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <VendorPropertyTypeToggle />
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
                <p className="text-muted-foreground">Analytics data will be available once you have more booking activity</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedVendorDashboard;
