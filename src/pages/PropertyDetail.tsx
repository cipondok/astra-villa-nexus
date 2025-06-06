
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Star, Phone, Mail, MessageSquare, Calendar, Box } from 'lucide-react';
import PropertyViewer3D from "@/components/PropertyViewer3D";
import VirtualStagingSelector from "@/components/VirtualStagingSelector";
import AgentContactCard from "@/components/AgentContactCard";
import NeighborhoodInsights from "@/components/NeighborhoodInsights";
import PropertyAmenities from "@/components/PropertyAmenities";
import FeedbackSection from "@/components/FeedbackSection";
import ScheduleSurveyModal from "@/components/ScheduleSurveyModal";

// Mock property data with AI-generated images and IDR pricing
const mockProperty = {
  id: 1,
  title: "Luxury Modern Villa with Ocean View",
  location: "Seminyak, Bali, Indonesia",
  price: "Rp 37,500,000,000", // IDR equivalent of $2.5M
  type: "sale",
  bedrooms: 4,
  bathrooms: 3,
  area: 350,
  images: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop&auto=format"
  ],
  description: "Stunning modern villa featuring panoramic ocean views, contemporary design, and premium finishes throughout. This exceptional property offers luxury living with seamless indoor-outdoor entertainment spaces, infinity pool, and private beach access.",
  rating: 4.8,
  featured: true,
  agent: {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Property Consultant",
    phone: "+62 821 1234 5678",
    email: "sarah.johnson@realestate.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&auto=format",
    rating: 4.9,
    experience: "8 years",
    properties: 156
  },
  amenities: [
    "Swimming Pool",
    "Ocean View",
    "Private Beach Access",
    "Parking Garage",
    "Garden",
    "Security System",
    "Air Conditioning",
    "Modern Kitchen",
    "Wifi",
    "Gym/Fitness Center"
  ],
  neighborhood: {
    walkScore: 85,
    transitScore: 72,
    bikeScore: 78,
    nearbyPlaces: [
      { name: "Seminyak Beach", distance: "200m", type: "Beach" },
      { name: "Potato Head Beach Club", distance: "500m", type: "Restaurant" },
      { name: "Seminyak Square", distance: "1.2km", type: "Shopping" },
      { name: "Ngurah Rai Airport", distance: "8km", type: "Airport" }
    ]
  }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);
  const [selectedStagingStyle, setSelectedStagingStyle] = useState('modern');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const stagingStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean lines and contemporary furniture' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple, functional design with neutral colors' },
    { id: 'traditional', name: 'Traditional', description: 'Classic and timeless furniture pieces' },
    { id: 'industrial', name: 'Industrial', description: 'Raw materials and urban aesthetics' },
    { id: 'scandinavian', name: 'Scandinavian', description: 'Light woods and cozy textiles' },
    { id: 'tropical', name: 'Tropical', description: 'Natural materials and tropical elements' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
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
                    src={mockProperty.images[currentImageIndex]}
                    alt={mockProperty.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-green-500 text-white">For Sale</Badge>
                    {mockProperty.featured && (
                      <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={() => setIs3DViewOpen(true)}
                      className="bg-white/90 text-gray-800 hover:bg-white"
                    >
                      <Box className="h-4 w-4 mr-2" />
                      3D View
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {mockProperty.images.map((image, index) => (
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
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {mockProperty.title}
                    </h1>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{mockProperty.location}</span>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-blue-600">
                    {mockProperty.price}
                  </div>

                  <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{mockProperty.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{mockProperty.bathrooms} Bathrooms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{mockProperty.area}m²</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mockProperty.rating}</span>
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
                      {mockProperty.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <PropertyAmenities amenities={mockProperty.amenities} />
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
                <NeighborhoodInsights neighborhood={mockProperty.neighborhood} />
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <FeedbackSection propertyId={mockProperty.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Contact */}
            <AgentContactCard agent={mockProperty.agent} />

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
                  <span className="font-medium">Villa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built:</span>
                  <span className="font-medium">2022</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lot Size:</span>
                  <span className="font-medium">500m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parking:</span>
                  <span className="font-medium">2 Cars</span>
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
        propertyId={mockProperty.id}
        propertyTitle={mockProperty.title}
      />

      {/* Schedule Survey Modal */}
      <ScheduleSurveyModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        propertyTitle={mockProperty.title}
        agentName={mockProperty.agent.name}
      />
    </div>
  );
};

export default PropertyDetail;
