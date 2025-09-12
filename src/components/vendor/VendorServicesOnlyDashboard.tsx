import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Plus, Settings, BarChart3 } from 'lucide-react';
import VendorServiceManagement from './VendorServiceManagement';
import MultiStepServiceForm from './MultiStepServiceForm';
import VendorServiceCategoryChecker from './VendorServiceCategoryChecker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const VendorServicesOnlyDashboard = () => {
  const { user, profile } = useAuth();
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);

  // Check if user is a vendor (or admin for testing)
  const isVendor = profile?.role === 'vendor' || profile?.role === 'admin';

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
            Vendor or Admin access required to view this dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Service Management</h1>
              <p className="text-white/80 mt-1">
                Manage your services, add new offerings, and track performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsCreateServiceOpen(true)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Service
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Services you're offering
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                All time bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Management with Category Checker */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Kelola Layanan</TabsTrigger>
            <TabsTrigger value="categories">Cek Kategori & Diskon</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="mt-6">
            <VendorServiceManagement />
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6">
            <VendorServiceCategoryChecker />
          </TabsContent>
        </Tabs>
      </div>

      {/* Multi-Step Service Creation Dialog */}
      <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Service - 5 Step Process</DialogTitle>
          </DialogHeader>
          <MultiStepServiceForm
            onClose={() => setIsCreateServiceOpen(false)}
            onSuccess={() => {
              setIsCreateServiceOpen(false);
              // Refresh services list - this will be handled by react-query
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorServicesOnlyDashboard;