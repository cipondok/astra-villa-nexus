
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Bell,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  AlertTriangle,
  Home,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

// Import vendor components
import EnhancedVendorDashboard from '@/components/vendor/EnhancedVendorDashboard';
import VendorBusinessProfile from '@/components/vendor/VendorBusinessProfile';
import VendorServices from '@/components/vendor/VendorServices';
import VendorServiceManagement from '@/components/vendor/VendorServiceManagement';
import VendorBookings from '@/components/vendor/VendorBookings';
import VendorAnalytics from '@/components/vendor/VendorAnalytics';
import VendorSettings from '@/components/vendor/VendorSettings';
import VendorSupport from '@/components/vendor/VendorSupport';
import VendorReviews from '@/components/vendor/VendorReviews';
import VendorProfileProgress from '@/components/vendor/VendorProfileProgress';
import VendorDashboardNavigation from '@/components/vendor/VendorDashboardNavigation';
import ThemeSwitcher from '@/components/ui/theme-switcher';

const VendorDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Check if user is a vendor
  const isVendor = profile?.role === 'vendor';

  const handleHomeClick = () => {
    navigate('/', { replace: true });
  };

  const handleBackClick = () => {
    window.history.back();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the vendor dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vendor access required to view this dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:block">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Vendor Dashboard</h1>
                <p className="text-white/80 mt-1">
                  Manage your services and business
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleHomeClick}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:block">Home</span>
              </Button>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedVendorDashboard />
      </div>
    </div>
  );
};

export default VendorDashboard;
