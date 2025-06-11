
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
  TrendingUp,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Square
} from "lucide-react";
import PropertyListingForm from "./PropertyListingForm";
import PropertyOwnerAnalytics from "./PropertyOwnerAnalytics";
import PropertyOwnerSettings from "./PropertyOwnerSettings";
import MembershipLevel from "./MembershipLevel";

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
    totalViews: 0,
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
    <div className="space-y-4">
      {/* Compact Welcome Section with Membership Level */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Property Owner Dashboard</h1>
                <p className="text-blue-100 text-sm">Manage your property listings and track performance</p>
              </div>
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <MembershipLevel />
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Properties</p>
              <p className="text-lg font-bold">{stats.totalProperties}</p>
            </div>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active</p>
              <p className="text-lg font-bold">{stats.activeListings}</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">{stats.pendingApproval}</p>
            </div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Views</p>
              <p className="text-lg font-bold">{stats.totalViews}</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-3">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowAddProperty(true)} size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Property
          </Button>
        </div>

        <TabsContent value="properties" className="space-y-3">
          {showAddProperty && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add New Property</CardTitle>
                <CardDescription>Create a new property listing</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyListingForm onSuccess={() => setShowAddProperty(false)} />
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-6">Loading properties...</div>
          ) : properties?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6">
                <Building2 className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <h3 className="text-base font-medium mb-2">No Properties Yet</h3>
                <p className="text-gray-600 text-sm mb-3">Start by adding your first property listing</p>
                <Button onClick={() => setShowAddProperty(true)} size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {properties?.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  {/* Compact Property Image */}
                  <div className="relative h-24 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Building2 className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1">
                      <Badge className={`${getStatusColor(property.status)} text-xs px-1 py-0`}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-2 space-y-1">
                    <div>
                      <h3 className="font-semibold text-xs line-clamp-1">{property.title}</h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-2 w-2 mr-1" />
                        <span className="line-clamp-1 text-xs">{property.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={`${getPropertyTypeColor(property.property_type)} text-xs px-1 py-0`}>
                        {property.property_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {property.listing_type}
                      </Badge>
                    </div>

                    {/* Ultra Compact Property Details */}
                    {(property.bedrooms || property.bathrooms || property.area_sqm) && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {property.bedrooms && (
                          <div className="flex items-center gap-0.5">
                            <Bed className="h-2 w-2" />
                            <span className="text-xs">{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-0.5">
                            <Bath className="h-2 w-2" />
                            <span className="text-xs">{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area_sqm && (
                          <div className="flex items-center gap-0.5">
                            <Square className="h-2 w-2" />
                            <span className="text-xs">{property.area_sqm}m²</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {property.price && (
                      <div className="text-xs font-bold text-primary">
                        {formatPrice(property.price, property.listing_type)}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={`${getApprovalColor(property.approval_status)} text-xs px-1 py-0`}>
                        {property.approval_status}
                      </Badge>
                      <div className="flex gap-0.5">
                        <Button size="sm" variant="outline" className="h-5 w-5 p-0">
                          <Edit className="h-2 w-2" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-5 w-5 p-0">
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <PropertyOwnerAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <PropertyOwnerSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerOverview;
