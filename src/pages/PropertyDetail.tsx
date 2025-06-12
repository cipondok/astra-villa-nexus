
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Star, Phone, Mail, MessageSquare, Calendar, Box, Loader2, AlertCircle } from 'lucide-react';
import PropertyViewer3D from "@/components/PropertyViewer3D";
import VirtualStagingSelector from "@/components/VirtualStagingSelector";
import AgentContactCard from "@/components/AgentContactCard";
import NeighborhoodInsights from "@/components/NeighborhoodInsights";
import PropertyAmenities from "@/components/PropertyAmenities";
import FeedbackSection from "@/components/FeedbackSection";
import ScheduleSurveyModal from "@/components/ScheduleSurveyModal";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/utils/currency";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);
  const [selectedStagingStyle, setSelectedStagingStyle] = useState('modern');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Fetch property data from database
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching property with ID:", id);
        
        // Fetch property without foreign key joins
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching property:', error);
          setError(error.message);
        } else {
          console.log('Fetched property:', data);
          setProperty(data);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const stagingStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean lines and contemporary furniture' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple, functional design with neutral colors' },
    { id: 'traditional', name: 'Traditional', description: 'Classic and timeless furniture pieces' },
    { id: 'industrial', name: 'Industrial', description: 'Raw materials and urban aesthetics' },
    { id: 'scandinavian', name: 'Scandinavian', description: 'Light woods and cozy textiles' },
    { id: 'tropical', name: 'Tropical', description: 'Natural materials and tropical elements' }
  ];

  // Mock data for features not yet in database
  const mockAgent = {
    id: 1,
    name: "Property Agent",
    title: "Senior Property Consultant",
    phone: "+62 821 1234 5678",
    email: "agent@realestate.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&auto=format",
    rating: 4.9,
    experience: "8 years",
    properties: 156
  };

  const defaultAmenities = [
    "Swimming Pool", "Ocean View", "Private Beach Access", "Parking Garage", 
    "Garden", "Security System", "Air Conditioning", "Modern Kitchen", "Wifi", "Gym/Fitness Center"
  ];

  const mockNeighborhood = {
    walkScore: 85,
    transitScore: 72,
    bikeScore: 78,
    nearbyPlaces: [
      { name: "Local Market", distance: "200m", type: "Shopping" },
      { name: "Restaurant", distance: "500m", type: "Restaurant" },
      { name: "Shopping Mall", distance: "1.2km", type: "Shopping" },
      { name: "Airport", distance: "8km", type: "Airport" }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The property you're looking for doesn't exist."}</p>
          <Link to="/properties">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const propertyImages = property.image_urls && property.image_urls.length > 0 
    ? property.image_urls 
    : ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&auto=format"];

  const propertyLocation = `${property.area || ''}, ${property.city || ''}, ${property.state || ''}`.replace(/^,\s*|,\s*$/g, '') || property.location;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/properties">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={propertyImages[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-green-500 text-white">
                      {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </Badge>
                  </div>
                  {(property.three_d_model_url || property.virtual_tour_url) && (
                    <div className="absolute top-4 right-4">
                      <Button
                        onClick={() => setIs3DViewOpen(true)}
                        className="bg-white/90 text-gray-800 hover:bg-white"
                      >
                        <Box className="h-4 w-4 mr-2" />
                        3D View
                      </Button>
                    </div>
                  )}
                </div>
                {propertyImages.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {propertyImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Property ${index + 1}`}
                        className={`w-20 h-16 object-cover rounded cursor-pointer border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{propertyLocation}</span>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-blue-600">
                    {property.price ? formatIDR(property.price) : 'Contact for price'}
                  </div>

                  <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                    )}
                    {property.area_sqm && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.area_sqm}m²</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-gray-500">(126 reviews)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="staging">Virtual Staging</TabsTrigger>
                <TabsTrigger value="neighborhood">Neighborhood</TabsTrigger>
                <TabsTrigger value="feedback">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {property.description || "This is a beautiful property with excellent features and great location."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <PropertyAmenities amenities={defaultAmenities} />
              </TabsContent>

              <TabsContent value="staging" className="mt-6">
                <VirtualStagingSelector
                  styles={stagingStyles}
                  selectedStyle={selectedStagingStyle}
                  onStyleChange={setSelectedStagingStyle}
                  onOpen3DView={() => setIs3DViewOpen(true)}
                />
              </TabsContent>

              <TabsContent value="neighborhood" className="mt-6">
                <NeighborhoodInsights neighborhood={mockNeighborhood} />
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <FeedbackSection propertyId={property.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Contact */}
            <AgentContactCard agent={mockAgent} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setIsScheduleModalOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Survey
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Agent
                </Button>
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listing Type:</span>
                  <span className="font-medium capitalize">{property.listing_type}</span>
                </div>
                {property.area_sqm && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{property.area_sqm}m²</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{property.status}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 3D Property Viewer Modal */}
      <PropertyViewer3D
        isOpen={is3DViewOpen}
        onClose={() => setIs3DViewOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />

      {/* Schedule Survey Modal */}
      <ScheduleSurveyModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        propertyTitle={property.title}
        agentName={mockAgent.name}
      />
    </div>
  );
};

export default PropertyDetail;
