import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import SimpleProperty3DViewer from '@/components/property/SimpleProperty3DViewer';
import Property3DModal from '@/components/property/Property3DModal';
import { 
  Box, 
  Eye, 
  Camera, 
  Home,
  ArrowLeft,
  VolumeX,
  Volume2,
  Play,
  Maximize2,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square
} from 'lucide-react';

interface Property3D {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  listing_type: string;
  property_type: string;
  images?: string[];
  virtual_tour_url?: string;
  three_d_model_url?: string;
}

const Property3DShowcase = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property3D[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property3D | null>(null);
  const [show3DModal, setShow3DModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'featured'>('featured');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      // Load properties that have 3D content or create demo ones
      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .limit(6);

      if (error) throw error;

      // Add demo 3D URLs to properties for showcase
      const propertiesWithDemo = (propertiesData || []).map((property, index) => ({
        ...property,
        virtual_tour_url: index === 0 ? 'https://discover.matterport.com/space/MC9zDt6bgEM' : index % 2 === 0 ? 'https://my.matterport.com/show/?m=SxQL3iGyoDo' : null,
        three_d_model_url: index % 3 === 0 ? 'https://sketchfab.com/models/76f0ff8d1c8a4e5a9b9c8c7c3c6c4c1c/embed' : null,
      }));

      setProperties(propertiesWithDemo);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `IDR ${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `IDR ${(price / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const open3DModal = (property: Property3D) => {
    setSelectedProperty(property);
    setShow3DModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading 3D properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Box className="h-3 w-3 mr-1" />
                3D Showcase
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Immersive 3D Property Experience
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore properties like never before with virtual tours, 3D models, and interactive walkthroughs. 
            Experience real estate in stunning detail from anywhere in the world.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Virtual Tours</h3>
                <p className="text-sm text-muted-foreground">
                  Professional Matterport 3D scans with VR support
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Box className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">3D Models</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive architectural models with HD textures
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Camera className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Virtual Staging</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered furniture and decor placement
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-8">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'grid' | 'featured')}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="featured">Featured 3D</TabsTrigger>
              <TabsTrigger value="grid">3D Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="featured" className="mt-8">
              {/* Featured 3D Property */}
              {properties.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">Featured 3D Property</h2>
                  <Card className="max-w-5xl mx-auto">
                    <CardContent className="p-0">
                      <SimpleProperty3DViewer
                        property={{
                          ...properties[0],
                          image_urls: properties[0].images || [],
                          listing_type: properties[0].listing_type as "sale" | "rent" | "lease"
                        }}
                        threeDModelUrl={properties[0].three_d_model_url}
                        virtualTourUrl={properties[0].virtual_tour_url}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="grid" className="mt-8">
              {/* 3D Properties Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4" />
                            {property.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {formatPrice(property.price)}
                          </div>
                          {property.listing_type === 'rent' && (
                            <span className="text-xs text-muted-foreground">/month</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={property.listing_type === 'sale' ? 'default' : 'secondary'}>
                          {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {property.property_type}
                        </Badge>
                        {(property.virtual_tour_url || property.three_d_model_url) && (
                          <Badge className="bg-blue-600 text-white">
                            3D Available
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="h-80">
                        <SimpleProperty3DViewer
                          property={{
                            ...property,
                            image_urls: property.images || [],
                            listing_type: property.listing_type as "sale" | "rent" | "lease"
                          }}
                          threeDModelUrl={property.three_d_model_url}
                          virtualTourUrl={property.virtual_tour_url}
                        />
                      </div>
                      
                      <div className="p-4 border-t">
                        {/* Property Details */}
                        {(property.bedrooms || property.bathrooms || property.area_sqm) && (
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-4">
                              {property.bedrooms && (
                                <div className="flex items-center gap-1">
                                  <Bed className="h-4 w-4" />
                                  <span>{property.bedrooms} bed</span>
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="flex items-center gap-1">
                                  <Bath className="h-4 w-4" />
                                  <span>{property.bathrooms} bath</span>
                                </div>
                              )}
                            </div>
                            {property.area_sqm && (
                              <div className="flex items-center gap-1">
                                <Square className="h-4 w-4" />
                                <span>{property.area_sqm}m²</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="default"
                            className="flex-1"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {(property.virtual_tour_url || property.three_d_model_url) && (
                            <Button 
                              variant="outline"
                              className="flex-1"
                              onClick={() => open3DModal(property)}
                            >
                              <Maximize2 className="h-4 w-4 mr-1" />
                              Fullscreen 3D
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Technology Features */}
        <div className="mt-16 bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">3D Technology Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Matterport Integration</h3>
              <p className="text-sm text-muted-foreground">Professional 3D scans with dollhouse and floor plan views</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Sketchfab Models</h3>
              <p className="text-sm text-muted-foreground">Interactive 3D architectural models with real-time rendering</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">VR Compatible</h3>
              <p className="text-sm text-muted-foreground">Experience properties in virtual reality for ultimate immersion</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">HD Textures</h3>
              <p className="text-sm text-muted-foreground">High-definition materials and lighting for photorealistic results</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Modal */}
      {selectedProperty && (
        <Property3DModal
          property={{
            ...selectedProperty,
            image_urls: selectedProperty.images || [],
            listing_type: selectedProperty.listing_type as "sale" | "rent" | "lease"
          }}
          threeDModelUrl={selectedProperty.three_d_model_url}
          virtualTourUrl={selectedProperty.virtual_tour_url}
          isOpen={show3DModal}
          onClose={() => setShow3DModal(false)}
        />
      )}
    </div>
  );
};

export default Property3DShowcase;