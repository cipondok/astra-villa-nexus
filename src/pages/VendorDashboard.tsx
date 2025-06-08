
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  DollarSign,
  Settings,
  Plus
} from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import VendorBusinessProfile from "@/components/vendor/VendorBusinessProfile";
import VendorServices from "@/components/vendor/VendorServices";
import VendorBookings from "@/components/vendor/VendorBookings";
import VendorReviews from "@/components/vendor/VendorReviews";
import VendorAnalytics from "@/components/vendor/VendorAnalytics";

const VendorDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "id">("en");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
    if (!loading && isAuthenticated && profile?.role !== 'vendor') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate, profile]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || profile?.role !== 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthenticatedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
        theme="light"
        onThemeToggle={() => {}}
      />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Vendor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your business profile, services, and bookings
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Services
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Bookings
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
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
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$2,480</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Business Profile</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <VendorBusinessProfile />
            </TabsContent>

            <TabsContent value="services">
              <VendorServices />
            </TabsContent>

            <TabsContent value="bookings">
              <VendorBookings />
            </TabsContent>

            <TabsContent value="reviews">
              <VendorReviews />
            </TabsContent>

            <TabsContent value="analytics">
              <VendorAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
