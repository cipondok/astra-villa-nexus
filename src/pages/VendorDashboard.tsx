
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Navigation from "@/components/Navigation";
import VendorServicesList from "@/components/vendor/VendorServicesList";
import VendorListings from "@/components/vendor/VendorListings";
import VendorAnalytics from "@/components/vendor/VendorAnalytics";
import VendorPayouts from "@/components/vendor/VendorPayouts";
import VendorSupport from "@/components/vendor/VendorSupport";
import VendorSettings from "@/components/vendor/VendorSettings";
import { 
  Building, 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Award,
  Crown,
  PlusCircle,
  Wrench,
  Loader2
} from "lucide-react";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Simple authentication check
  useEffect(() => {
    if (!loading) {
      console.log('VendorDashboard - Auth check:', { 
        isAuthenticated, 
        userExists: !!user, 
        profileRole: profile?.role 
      });

      if (!isAuthenticated || !user) {
        console.log('VendorDashboard - Redirecting to home: not authenticated');
        navigate('/?auth=true');
        return;
      }

      if (profile?.role !== 'vendor') {
        console.log('VendorDashboard - Redirecting to user dashboard: not a vendor, role is:', profile?.role);
        navigate('/dashboard/user');
        return;
      }

      setIsInitialized(true);
    }
  }, [loading, isAuthenticated, user, profile, navigate]);

  // Show loading while checking auth
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Loading Vendor Dashboard...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  // Don't render if redirecting
  if (!isAuthenticated || !user || profile?.role !== 'vendor') {
    return null;
  }

  // Vendor membership data
  const vendorMembership = {
    currentLevel: {
      name: "Silver",
      level: 2,
      icon: Award,
      color: "bg-gradient-to-r from-gray-400 to-gray-600",
    },
    nextLevel: {
      name: "Gold",
      level: 3,
      icon: Crown
    },
    progress: {
      current: 6,
      required: 10,
      percentage: 60
    },
    benefits: [
      "2% Commission Rate",
      "Basic Support", 
      "Service Analytics",
      "2 Featured Services/month",
      "Basic Tools Access"
    ]
  };

  const stats = {
    totalServices: 8,
    activeServices: 6,
    totalBookings: 24,
    totalClients: 15,
  };

  const handleAddService = () => {
    console.log('Add service clicked');
  };

  const handleEditService = (service: any) => {
    console.log('Edit service clicked', service);
  };

  const CurrentIcon = vendorMembership.currentLevel.icon;

  return (
    <AlertProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
                    <p className="text-blue-100 mt-2">Welcome back! Manage your services and track your business performance</p>
                  </div>
                  <Building className="h-8 w-8" />
                </div>
              </div>

              {/* Membership Level Card */}
              <Card className="border-l-4 border-l-gray-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${vendorMembership.currentLevel.color} flex items-center justify-center`}>
                        <CurrentIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Level {vendorMembership.currentLevel.level}: {vendorMembership.currentLevel.name} Vendor
                        </CardTitle>
                        <CardDescription>
                          Progress to {vendorMembership.nextLevel.name}: {vendorMembership.progress.current}/{vendorMembership.progress.required}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={vendorMembership.currentLevel.color} variant="secondary">
                      {vendorMembership.currentLevel.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to next level</span>
                        <span>{vendorMembership.progress.percentage}%</span>
                      </div>
                      <Progress value={vendorMembership.progress.percentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {vendorMembership.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalServices}</div>
                    <p className="text-xs text-muted-foreground">Services you offer</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeServices}</div>
                    <p className="text-xs text-muted-foreground">Currently available</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">All time bookings</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalClients}</div>
                    <p className="text-xs text-muted-foreground">Active clients</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="services" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="services">My Services</TabsTrigger>
                  <TabsTrigger value="listings">Listings</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="payouts">Payouts</TabsTrigger>
                  <TabsTrigger value="support">Support</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">My Services</h2>
                    <Button onClick={handleAddService}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                  <VendorServicesList onAddService={handleAddService} onEditService={handleEditService} />
                </TabsContent>

                <TabsContent value="listings">
                  <VendorListings />
                </TabsContent>

                <TabsContent value="analytics">
                  <VendorAnalytics />
                </TabsContent>

                <TabsContent value="payouts">
                  <VendorPayouts />
                </TabsContent>

                <TabsContent value="support">
                  <VendorSupport />
                </TabsContent>

                <TabsContent value="settings">
                  <VendorSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AlertProvider>
  );
};

export default VendorDashboard;
