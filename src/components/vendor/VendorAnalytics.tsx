
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Star, DollarSign, Users, BarChart3 } from "lucide-react";

const VendorAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyBookings: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch services count
      const { data: services, error: servicesError } = await supabase
        .from('vendor_services')
        .select('id')
        .eq('vendor_id', user.id);

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('vendor_bookings')
        .select('status, total_amount, booking_date')
        .eq('vendor_id', user.id);

      // Fetch reviews data
      const { data: reviews, error: reviewsError } = await supabase
        .from('vendor_reviews')
        .select('rating')
        .eq('vendor_id', user.id);

      if (servicesError || bookingsError || reviewsError) {
        throw servicesError || bookingsError || reviewsError;
      }

      // Calculate analytics
      const totalServices = services?.length || 0;
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      
      const totalReviews = reviews?.length || 0;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;

      // Calculate monthly data (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.booking_date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).length || 0;

      const monthlyRevenue = bookings?.filter(b => {
        const bookingDate = new Date(b.booking_date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      setAnalytics({
        totalServices,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue,
        averageRating,
        totalReviews,
        monthlyBookings,
        monthlyRevenue
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your business performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalServices}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalBookings}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">
                  {analytics.totalReviews} reviews
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Current booking distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-sm text-yellow-600 font-semibold">
                  {analytics.pendingBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-green-600 font-semibold">
                  {analytics.completedBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-semibold">
                  {analytics.totalBookings}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Current month performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Bookings</span>
                </div>
                <span className="text-sm font-semibold">
                  {analytics.monthlyBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <span className="text-sm font-semibold">
                  ${analytics.monthlyRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Avg per Booking</span>
                </div>
                <span className="text-sm font-semibold">
                  ${analytics.monthlyBookings > 0 ? (analytics.monthlyRevenue / analytics.monthlyBookings).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Tips to improve your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.totalServices === 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Add your first service to start receiving bookings
                </p>
              </div>
            )}
            
            {analytics.averageRating < 4 && analytics.totalReviews > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Consider improving service quality to increase your rating
                </p>
              </div>
            )}
            
            {analytics.pendingBookings > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  📋 You have {analytics.pendingBookings} pending booking{analytics.pendingBookings === 1 ? '' : 's'} to review
                </p>
              </div>
            )}
            
            {analytics.averageRating >= 4.5 && analytics.totalReviews >= 5 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🌟 Excellent work! Your high rating will attract more customers
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;
