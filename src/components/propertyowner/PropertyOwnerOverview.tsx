
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  PlusCircle, 
  BarChart3, 
  Eye,
  DollarSign,
  Users,
  TrendingUp,
  Edit,
  Trash2
} from "lucide-react";
import PropertyListingForm from "./PropertyListingForm";

const PropertyOwnerOverview = () => {
  const { user } = useAuth();
  const [showAddProperty, setShowAddProperty] = useState(false);

  // Fetch user's properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const stats = {
    totalProperties: properties?.length || 0,
    activeListings: properties?.filter(p => p.status === 'active').length || 0,
    pendingApproval: properties?.filter(p => p.approval_status === 'pending').length || 0,
    totalViews: 0, // This would come from analytics
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Property Owner Dashboard</h1>
            <p className="text-blue-100 mt-2">Manage your property listings and track performance</p>
          </div>
          <Building2 className="h-8 w-8" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Properties in your portfolio</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Properties</h2>
            <Button onClick={() => setShowAddProperty(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          {showAddProperty && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Property</CardTitle>
                <CardDescription>Create a new property listing</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyListingForm onSuccess={() => setShowAddProperty(false)} />
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading properties...</div>
          ) : properties?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first property listing</p>
                <Button onClick={() => setShowAddProperty(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold line-clamp-2">{property.title}</h3>
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span>{property.property_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{property.location}</span>
                        </div>
                        {property.price && (
                          <div className="flex justify-between font-semibold">
                            <span>Price:</span>
                            <span>${property.price.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <Badge variant="outline">
                          {property.approval_status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Property Analytics</CardTitle>
              <CardDescription>Track performance of your listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your property owner preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerOverview;
