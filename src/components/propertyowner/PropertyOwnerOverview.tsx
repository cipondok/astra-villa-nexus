
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
  Trash2,
  MapPin,
  Bed,
  Bath,
  Square
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

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    
    if (listingType === 'rent') {
      return `${formatted}/month`;
    } else if (listingType === 'lease') {
      return `${formatted}/year`;
    }
    return formatted;
  };

  const getPropertyTypeColor = (type: string) => {
    const colors = {
      villa: 'bg-purple-100 text-purple-800',
      apartment: 'bg-blue-100 text-blue-800',
      house: 'bg-green-100 text-green-800',
      commercial: 'bg-orange-100 text-orange-800',
      land: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      inactive: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getApprovalColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
                <Card key={property.id} className="overflow-hidden">
                  {/* Property Image */}
                  <div className="relative h-48 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-2 mb-1">{property.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getPropertyTypeColor(property.property_type)}>
                          {property.property_type}
                        </Badge>
                        <Badge variant="outline">
                          {property.listing_type}
                        </Badge>
                      </div>

                      {/* Property Details */}
                      {(property.bedrooms || property.bathrooms || property.area_sqm) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {property.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-3 w-3" />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.area_sqm && (
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              <span>{property.area_sqm}m²</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {property.price && (
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(property.price, property.listing_type)}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <Badge variant="outline" className={getApprovalColor(property.approval_status)}>
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
