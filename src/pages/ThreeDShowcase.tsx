import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Eye, MousePointer, Maximize } from 'lucide-react';
import Property3DModal from '@/components/property/Property3DModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BaseProperty } from '@/types/property';

const ThreeDShowcase = () => {
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  // Fetch properties with 3D models or virtual tours
  const { data: properties = [] } = useQuery({
    queryKey: ['showcase-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or('three_d_model_url.neq.null,virtual_tour_url.neq.null')
        .limit(6);
      
      if (error) throw error;
      return data as BaseProperty[];
    }
  });

  const handleView3D = (property: BaseProperty) => {
    setSelectedProperty(property);
    setIs3DModalOpen(true);
  };

  const features = [
    {
      icon: <Box className="h-8 w-8 text-primary" />,
      title: "Interactive 3D Models",
      description: "Explore properties with immersive 3D models that let you walk through every room"
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Virtual Tours",
      description: "Take virtual tours of properties from the comfort of your home using Matterport technology"
    },
    {
      icon: <MousePointer className="h-8 w-8 text-primary" />,
      title: "Measurement Tools",
      description: "Measure distances and dimensions directly within the 3D environment"
    },
    {
      icon: <Maximize className="h-8 w-8 text-primary" />,
      title: "Fullscreen Experience",
      description: "Enjoy immersive fullscreen viewing with advanced navigation controls"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">3D Property Showcase</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of property viewing with our cutting-edge 3D technology. 
            Explore properties like never before with interactive virtual tours and immersive 3D models.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Properties Showcase */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Featured 3D Properties</h2>
          
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={property.images?.[0] || "/placeholder.svg"} 
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {property.virtual_tour_url && (
                        <Badge variant="secondary" className="bg-blue-500 text-white">
                          Virtual Tour
                        </Badge>
                      )}
                      {property.three_d_model_url && (
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          3D Model
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {property.location}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">
                        Rp {property.price?.toLocaleString()}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {property.bedrooms}BR • {property.bathrooms}BA
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleView3D(property)}
                      className="w-full"
                      variant="outline"
                    >
                      <Box className="h-4 w-4 mr-2" />
                      View in 3D
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">3D Properties Coming Soon</h3>
              <p className="text-muted-foreground">
                We're working on adding more properties with 3D virtual tours and models.
              </p>
            </div>
          )}
        </div>

        {/* Technology Info */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Powered by Advanced Technology</CardTitle>
            <CardDescription className="text-lg">
              Our 3D showcase uses industry-leading platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-2">Matterport Integration</h4>
                <p className="text-muted-foreground">
                  Professional 3D virtual tours with dollhouse views and floor plans
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Sketchfab Models</h4>
                <p className="text-muted-foreground">
                  Interactive 3D models with realistic textures and lighting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Modal */}
      {selectedProperty && (
        <Property3DModal
          property={selectedProperty}
          isOpen={is3DModalOpen}
          onClose={() => {
            setIs3DModalOpen(false);
            setSelectedProperty(null);
          }}
          threeDModelUrl={selectedProperty.three_d_model_url}
          virtualTourUrl={selectedProperty.virtual_tour_url}
        />
      )}

      <ProfessionalFooter language="en" />
    </div>
  );
};

export default ThreeDShowcase;