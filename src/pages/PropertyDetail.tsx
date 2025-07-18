
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import EnhancedImageGallery from '@/components/property/EnhancedImageGallery';
import PropertyComparisonButton from '@/components/property/PropertyComparisonButton';
import SimpleProperty3DViewer from '@/components/property/SimpleProperty3DViewer';
import PropertyCard from '@/components/property/PropertyCard';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Phone,
  Mail,
  Globe,
  Heart,
  Share2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Play,
  Box,
  Home,
  Menu,
  ArrowLeft,
  Star,
  Clock,
  User,
  Award,
  TrendingUp
} from 'lucide-react';

interface PropertyData {
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
  owner_id: string;
  agent_id?: string;
  status: string;
  created_at: string;
  property_features?: any;
  development_status: string;
  virtual_tour_url?: string;
  three_d_model_url?: string;
  // Poster information
  posted_by?: {
    id: string;
    name: string;
    avatar_url?: string;
    rating?: number;
    user_level?: string;
    verification_status?: string;
    total_properties?: number;
    joining_date?: string;
    customer_feedback_rating?: number;
    customer_feedback_count?: number;
    // Agent specific information
    whatsapp_number?: string;
    phone_number?: string;
    company_name?: string;
    company_logo?: string;
    company_pt_name?: string;
    developer_name?: string;
    position?: string;
    office_address?: string;
    license_number?: string;
    experience_years?: number;
  };
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [relatedProperties, setRelatedProperties] = useState<PropertyData[]>([]);
  const [userMoreProperties, setUserMoreProperties] = useState<PropertyData[]>([]);

  useEffect(() => {
    console.log('PropertyDetail mounted with id:', id);
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;

      setProperty(propertyData);

      // Load owner information with extended profile data
      if (propertyData.owner_id) {
        const { data: owner } = await supabase
          .from('profiles')
          .select('full_name, email, phone, avatar_url, verification_status, created_at')
          .eq('id', propertyData.owner_id)
          .single();
        
        if (owner) {
          // Enhanced agent/poster data with comprehensive information
          const posterInfo = {
            id: propertyData.owner_id,
            name: owner.full_name || 'Anonymous User',
            avatar_url: owner.avatar_url,
            rating: 4.8, // This would come from actual ratings
            user_level: 'Premium Agent', // This would be calculated based on activity
            verification_status: owner.verification_status || 'verified',
            total_properties: 25, // This would be counted from actual properties
            joining_date: owner.created_at,
            customer_feedback_rating: 4.9,
            customer_feedback_count: 47,
            // Enhanced agent information
            whatsapp_number: '+6281234567890',
            phone_number: '+6281234567890',
            company_name: 'UNITED PROPERTY',
            company_logo: '/placeholder.svg',
            company_pt_name: 'PT Bumi Serpong Damai Tbk',
            developer_name: 'BSD City',
            position: 'Senior Property Consultant',
            office_address: 'Jl. Raya Serpong, BSD City, Tangerang Selatan',
            license_number: 'REI-12345678',
            experience_years: 8
          };
          
          setProperty(prev => prev ? { ...prev, posted_by: posterInfo } : null);
        }
        
        setOwnerInfo(owner);
      }

      // Load agent information if exists
      if (propertyData.agent_id) {
        const { data: agent } = await supabase
          .from('profiles')
          .select('full_name, email, phone, company_name')
          .eq('id', propertyData.agent_id)
          .single();
        
        setAgentInfo(agent);
      }

      // Load related properties (same type and location)
      const { data: related } = await supabase
        .from('properties')
        .select('*')
        .eq('property_type', propertyData.property_type)
        .eq('status', 'active')
        .neq('id', id)
        .limit(4);
      
      if (related) {
        setRelatedProperties(related);
      }

      // Load more properties from the same user/agent
      const userId = propertyData.agent_id || propertyData.owner_id;
      if (userId) {
        const { data: userProperties } = await supabase
          .from('properties')
          .select('*')
          .or(`owner_id.eq.${userId},agent_id.eq.${userId}`)
          .eq('status', 'active')
          .neq('id', id)
          .limit(4);
        
        if (userProperties) {
          setUserMoreProperties(userProperties);
        }
      }

    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  };

  const nextImage = () => {
    if (property?.images && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Agent/Developer Header - Enhanced with comprehensive info */}
      {property?.posted_by && (
        <div className="bg-gradient-to-r from-blue-50 to-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={property.posted_by.avatar_url || "/placeholder.svg"}
                    alt={property.posted_by.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {property.posted_by.verification_status === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-gray-800">{property.posted_by.name}</h3>
                    <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                      {property.posted_by.position || 'Official Developer'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {property.posted_by.experience_years} tahun pengalaman • {property.posted_by.total_properties}+ properti terjual
                  </p>
                  <p className="text-xs text-gray-500">
                    Diperbarui {formatTimeAgo(property.created_at)} yang lalu
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded text-white text-sm flex items-center justify-center font-bold">
                    U
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800">{property.posted_by.company_name}</span>
                    <p className="text-xs text-gray-500">{property.posted_by.developer_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => window.open(`tel:${property.posted_by?.phone_number}`, '_self')}
                >
                  <Phone className="h-4 w-4" />
                  {property.posted_by.phone_number?.replace('+62', '+62')}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  onClick={() => window.open(`https://wa.me/${property.posted_by?.whatsapp_number?.replace('+', '')}`, '_blank')}
                >
                  📱 WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
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
              <PropertyComparisonButton 
                property={{
                  ...property,
                  image_urls: property.images || [],
                  listing_type: property.listing_type as "sale" | "rent" | "lease"
                }} 
              />
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Image Gallery */}
        <div className="mb-8">
          <EnhancedImageGallery
            images={property.images || []}
            title={property.title}
            propertyType={property.property_type}
            listingType={property.listing_type}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Property Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl lg:text-3xl">{property.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-lg mt-2">
                      <MapPin className="h-5 w-5" />
                      {property.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {formatPrice(property.price)}
                    </div>
                    {property.listing_type === 'rent' && (
                      <span className="text-sm text-gray-500">/bulan</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant={property.listing_type === 'sale' ? 'default' : 'secondary'}>
                    {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                  <Badge variant="outline">{property.property_type}</Badge>
                  {property.development_status !== 'completed' && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {property.development_status === 'new_project' ? 'New Project' : 'Pre-Launch'}
                    </Badge>
                  )}
                </div>

                {/* Promotional Banners - Like in reference */}
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 mb-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm">
                      💰 Hard Cash : Disc 12,5%
                    </span>
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                      💰 KPR Exp DP 10% : Disc 12%
                    </span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      💰 Cash Bertahap
                    </span>
                  </div>
                </div>

                {/* Price Range Display - Like in reference */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-blue-600 mb-2">
                        {formatPrice(property.price)} - {formatPrice(property.price * 1.6)}
                      </h2>
                      <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                      <p className="text-gray-600 mb-2">{property.location}</p>
                      <span className="bg-gray-100 px-3 py-1 rounded text-sm">Rumah</span>
                    </div>
                  </CardContent>
                </Card>
              </CardHeader>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {property.bedrooms && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Bed className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                          <div className="font-semibold">{property.bedrooms}</div>
                          <div className="text-sm text-gray-600">Bedrooms</div>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Bath className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                          <div className="font-semibold">{property.bathrooms}</div>
                          <div className="text-sm text-gray-600">Bathrooms</div>
                        </div>
                      )}
                      {property.area_sqm && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Square className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                          <div className="font-semibold">{property.area_sqm}</div>
                          <div className="text-sm text-gray-600">Sqm</div>
                        </div>
                      )}
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <div className="font-semibold">
                          {new Date(property.created_at).getFullYear()}
                        </div>
                        <div className="text-sm text-gray-600">Listed</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="description" className="mt-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {property.description || 'No description available for this property.'}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.property_features && Object.keys(property.property_features).length > 0 ? (
                        Object.entries(property.property_features).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-2">No additional features listed.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Simple Property 3D Viewer */}
            <SimpleProperty3DViewer
              property={{
                ...property,
                image_urls: property.images || [],
                listing_type: property.listing_type as "sale" | "rent" | "lease"
              }}
              threeDModelUrl={property.three_d_model_url}
              virtualTourUrl={property.virtual_tour_url}
            />


            {/* Virtual Tour & 3D Model */}
            {(property.virtual_tour_url || property.three_d_model_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Virtual Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.virtual_tour_url && (
                    <Button className="w-full" variant="outline">
                      <Globe className="h-4 w-4 mr-2" />
                      Virtual Tour
                    </Button>
                  )}
                  {property.three_d_model_url && (
                    <Button className="w-full" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      3D Model
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Enhanced Contact Information with Agent Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {property.posted_by ? (
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={property.posted_by.avatar_url || "/placeholder.svg"}
                        alt={property.posted_by.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{property.posted_by.name}</h4>
                        <p className="text-sm text-blue-600 font-medium mb-1">{property.posted_by.position}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{property.posted_by.customer_feedback_rating}</span>
                          <span className="text-sm text-gray-500">({property.posted_by.customer_feedback_count} reviews)</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          REI License: {property.posted_by.license_number} • {property.posted_by.experience_years} years experience
                        </p>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          {property.posted_by.company_name?.charAt(0)}
                        </div>
                        {property.posted_by.company_name}
                      </h5>
                      <p className="text-sm text-gray-600 mb-1">{property.posted_by.company_pt_name}</p>
                      <p className="text-sm text-gray-600 mb-2">{property.posted_by.developer_name}</p>
                      <p className="text-xs text-gray-500">{property.posted_by.office_address}</p>
                    </div>

                    {/* Contact Options */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open(`https://wa.me/${property.posted_by?.whatsapp_number?.replace('+', '')}?text=Halo, saya tertarik dengan properti ${property.title}`, '_blank')}
                      >
                        <div className="flex items-center gap-2">
                          📱 WhatsApp: {property.posted_by.whatsapp_number}
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(`tel:${property.posted_by?.phone_number}`, '_self')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call: {property.posted_by.phone_number}
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>

                    {/* Agent Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">{property.posted_by.total_properties}+</div>
                        <div className="text-xs text-gray-500">Properties Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">{property.posted_by.experience_years}</div>
                        <div className="text-xs text-gray-500">Years Experience</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Agent information not available</p>
                )}
              </CardContent>
            </Card>

            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle>Property Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Listing Status</span>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Listed Date</span>
                    <span className="text-sm text-gray-600">
                      {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {property.development_status !== 'completed' && (
                    <div className="flex justify-between">
                      <span>Development</span>
                      <Badge variant="outline">
                        {property.development_status === 'new_project' ? 'New Project' : 'Pre-Launch'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Units Section - Like "Tipe Unit Lainnya" in reference */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Tipe Unit Lainnya</h2>
              <span className="text-blue-600 hover:underline cursor-pointer">View All</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProperties.slice(0, 2).map((relatedProperty) => (
                <Card key={relatedProperty.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={relatedProperty.images?.[0] || "/placeholder.svg"}
                      alt={relatedProperty.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-blue-600 mb-1">
                        {formatPrice(relatedProperty.price)}
                      </h3>
                      <h4 className="font-semibold mb-2">{relatedProperty.title}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">LT:</span> {relatedProperty.area_sqm || 120} m²
                        </div>
                        <div>
                          <span className="font-medium">LB:</span> {(relatedProperty.area_sqm || 120) * 2} m²
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{relatedProperty.bedrooms || 5}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{relatedProperty.bathrooms || 5}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Bottom Agent Contact Section */}
        {property?.posted_by && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {property.posted_by.company_pt_name?.split(' ')[0]?.substring(0, 2) || 'PT'}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Diperbarui {formatTimeAgo(property.created_at)} yang lalu oleh
                  </p>
                  <h3 className="font-bold text-lg text-gray-800">{property.posted_by.company_pt_name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      ✓ Verified Developer
                    </span>
                    <span className="text-xs text-gray-500">
                      {property.posted_by.total_properties}+ projects completed
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('/official-brochure.pdf', '_blank')}
                >
                  📄 Official Brosur
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  onClick={() => window.open(`https://wa.me/${property.posted_by?.whatsapp_number?.replace('+', '')}?text=Halo, saya tertarik dengan properti ${property.title} di ${property.location}`, '_blank')}
                >
                  📱 WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* More Properties from User Section */}
        {userMoreProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              More from {agentInfo ? agentInfo.full_name : ownerInfo?.full_name || 'this user'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userMoreProperties.map((userProperty) => (
                <Card key={userProperty.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={userProperty.images?.[0] || "/placeholder.svg"}
                      alt={userProperty.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onClick={() => navigate(`/properties/${userProperty.id}`)}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{userProperty.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {userProperty.location}
                    </div>
                    <div className="font-bold text-primary">
                      {formatPrice(userProperty.price)}
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => navigate(`/properties/${userProperty.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
