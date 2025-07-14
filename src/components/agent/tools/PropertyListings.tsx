import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Eye, Edit, Plus, MapPin, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PropertyManager from "../PropertyManager";
import RentalBookingManager from "../../rental/RentalBookingManager";

const PropertyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleCreateProperty = () => {
    navigate('/add-property');
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your properties...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Property & Booking Management
        </CardTitle>
        <CardDescription>Comprehensive property and rental booking management system</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="manage">Property Manager</TabsTrigger>
            <TabsTrigger value="bookings">Rental Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Total listings: {properties?.length || 0}
                </p>
                <Button onClick={handleCreateProperty}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Listing
                </Button>
              </div>

          {properties?.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Listed</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first property listing</p>
              <Button onClick={handleCreateProperty}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Listing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties?.map((property) => (
                <div key={property.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(property.status)} className="capitalize">
                        {property.status?.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {property.listing_type}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{property.property_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {property.price ? `Rp ${property.price.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bedrooms:</span>
                      <p className="font-medium">{property.bedrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Area:</span>
                      <p className="font-medium">{property.area_sqm ? `${property.area_sqm} m²` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(property.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewProperty(property.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/property/${property.id}/edit`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="mt-6">
            <PropertyManager />
          </TabsContent>
          
          <TabsContent value="bookings" className="mt-6">
            <RentalBookingManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PropertyListings;