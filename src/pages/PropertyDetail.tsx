
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
import { useFavorites } from '@/hooks/useFavorites';
import { shareProperty } from '@/utils/shareUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  TrendingUp,
  Plus,
  Shield,
  Crown,
  Medal
} from 'lucide-react';
import ProtectedContactInfo from '@/components/ProtectedContactInfo';

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
  const { toast } = useToast();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [relatedProperties, setRelatedProperties] = useState<PropertyData[]>([]);
  const [userMoreProperties, setUserMoreProperties] = useState<PropertyData[]>([]);
  
  // Initialize favorites hook with property data once available
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites({
    title: property?.title,
    images: property?.images
  });

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

  const handleSaveFavorite = async () => {
    if (property) {
      await toggleFavorite(property.id);
    }
  };

  const handleShareProperty = async () => {
    if (property) {
      const success = await shareProperty({
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        images: property.images
      });
      
      if (success) {
        toast({
          title: "Property shared",
          description: "Property link copied to clipboard or shared successfully!",
        });
      } else {
        toast({
          title: "Share failed",
          description: "Unable to share property. Please try again.",
          variant: "destructive",
        });
      }
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/20">
      {/* Agent/Developer Header - Ultra Modern Design */}
      {property?.posted_by && (
        <div className="relative bg-gradient-to-r from-primary/5 via-accent/3 to-secondary/5 backdrop-blur-sm border-b border-border/10 shadow-xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/2 to-accent/2"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              {/* Agent Profile Section */}
              <div className="flex items-start gap-6 flex-1">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <img
                    src={property.posted_by.avatar_url || "/placeholder.svg"}
                    alt={property.posted_by.name}
                    className="relative w-16 h-16 rounded-full object-cover border-3 border-background shadow-lg"
                  />
                  {property.posted_by.verification_status === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-background shadow-md">
                      <Shield className="w-3 h-3 text-accent-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {property.posted_by.name}
                    </h3>
                    <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {property.posted_by.position || 'Official Developer'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-yellow-700 dark:text-yellow-300">
                        {property.posted_by.customer_feedback_rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                      <Medal className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                        {property.posted_by.experience_years}y Experience
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {formatTimeAgo(property.created_at)} ago
                  </p>
                </div>
              </div>
                
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md"
                  onClick={() => {
                    if (user && property.posted_by?.whatsapp_number) {
                      window.open(`https://wa.me/${property.posted_by.whatsapp_number.replace('+', '')}?text=Hi, I'm interested in ${property.title}`, '_blank');
                    } else {
                      toast({
                        title: "Sign in required", 
                        description: "Please sign in to contact via WhatsApp.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  📱 WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
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
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={handleSaveFavorite}
                 disabled={favLoading}
                 className={isFavorite(property.id) ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "hover:bg-muted/50"}
               >
                 <Heart className={`h-4 w-4 mr-2 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
                 {isFavorite(property.id) ? 'Saved' : 'Save'}
               </Button>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={handleShareProperty}
                 className="hover:bg-muted/50"
               >
                 <Share2 className="h-4 w-4 mr-2" />
                 Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Enhanced Image Gallery */}
        <div className="mb-8">
          <EnhancedImageGallery
            images={property.images || []}
            title={property.title}
            propertyType={property.property_type}
            listingType={property.listing_type}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Property Header */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-lg">{property.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={property.listing_type === 'sale' ? 'default' : 'secondary'} className="px-3 py-1">
                        {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                      </Badge>
                      <Badge variant="outline" className="bg-muted/50 px-3 py-1">{property.property_type}</Badge>
                      {property.development_status !== 'completed' && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                          {property.development_status === 'new_project' ? 'New Project' : 'Pre-Launch'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {formatPrice(property.price)}
                    </div>
                    {property.listing_type === 'rent' && (
                      <span className="text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.bedrooms && (
                    <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                      <Bed className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="font-bold text-lg text-foreground">{property.bedrooms}</div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                      <Bath className="h-6 w-6 text-accent mx-auto mb-2" />
                      <div className="font-bold text-lg text-foreground">{property.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="text-center p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/20 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300">
                      <Square className="h-6 w-6 text-secondary mx-auto mb-2" />
                      <div className="font-bold text-lg text-foreground">{property.area_sqm}</div>
                      <div className="text-sm text-muted-foreground">Sqm</div>
                    </div>
                  )}
                  <div className="text-center p-4 bg-gradient-to-br from-muted/50 to-muted/70 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
                    <Calendar className="h-6 w-6 text-foreground mx-auto mb-2" />
                    <div className="font-bold text-lg text-foreground">
                      {new Date(property.created_at).getFullYear()}
                    </div>
                    <div className="text-sm text-muted-foreground">Listed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details Tabs */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
              <CardContent className="p-6">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/30 rounded-lg">
                    <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Description</TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Features</TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-6">
                    <div className="prose max-w-none">
                      <p className="text-foreground leading-relaxed text-base">
                        {property.description || 'No description available for this property.'}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.property_features && Object.keys(property.property_features).length > 0 ? (
                        Object.entries(property.property_features).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
                            <span className="font-medium text-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground col-span-2 text-center py-8">No additional features listed.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
                          <span className="font-medium text-foreground">Property Type</span>
                          <span className="text-muted-foreground capitalize">{property.property_type}</span>
                        </div>
                        <div className="flex justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
                          <span className="font-medium text-foreground">Listing Type</span>
                          <span className="text-muted-foreground capitalize">{property.listing_type}</span>
                        </div>
                        <div className="flex justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
                          <span className="font-medium text-foreground">Status</span>
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
                          <span className="font-medium text-foreground">Listed Date</span>
                          <span className="text-muted-foreground">
                            {new Date(property.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
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
              <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    <Camera className="h-5 w-5 text-primary" />
                    Virtual Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {property.virtual_tour_url && (
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" variant="default">
                      <Globe className="h-4 w-4 mr-2" />
                      Virtual Tour
                    </Button>
                  )}
                  {property.three_d_model_url && (
                    <Button className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80" variant="default">
                      <Box className="h-4 w-4 mr-2" />
                      3D Model
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Enhanced Contact Information */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  <User className="h-5 w-5 text-primary" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {property.posted_by ? (
                  <div>
                    <div className="flex items-start gap-4 mb-6">
                      <img
                        src={property.posted_by.avatar_url || "/placeholder.svg"}
                        alt={property.posted_by.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-border shadow-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1 text-foreground">{property.posted_by.name}</h4>
                        <p className="text-sm text-primary font-medium mb-2">{property.posted_by.position}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm text-foreground">{property.posted_by.customer_feedback_rating}</span>
                          <span className="text-sm text-muted-foreground">({property.posted_by.customer_feedback_count} reviews)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          REI License: {property.posted_by.license_number} • {property.posted_by.experience_years} years experience
                        </p>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-4 mb-6 border border-border/30">
                      <h5 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded text-primary-foreground text-xs flex items-center justify-center font-bold">
                          {property.posted_by.company_name?.charAt(0)}
                        </div>
                        {property.posted_by.company_name}
                      </h5>
                      <p className="text-sm text-muted-foreground mb-1">{property.posted_by.company_pt_name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{property.posted_by.developer_name}</p>
                      <p className="text-xs text-muted-foreground">{property.posted_by.office_address}</p>
                    </div>

                    {/* Contact Options */}
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-xl border border-border/20">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                          <Shield className="h-4 w-4 text-primary" />
                          Protected Contact Information
                        </h4>
                        <ProtectedContactInfo
                          phone={property.posted_by.phone_number}
                          email={ownerInfo?.email}
                          whatsappNumber={property.posted_by.whatsapp_number}
                          showButtons={true}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                          onClick={() => {
                            if (user && property.posted_by?.whatsapp_number) {
                              window.open(`https://wa.me/${property.posted_by.whatsapp_number.replace('+', '')}?text=Hello, I'm interested in ${property.title}`, '_blank');
                            } else {
                              toast({
                                title: "Sign in required",
                                description: "Please sign in to contact the agent.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          📱 Contact via WhatsApp
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full hover:bg-primary/5 border-border/50"
                          onClick={() => {
                            if (user && property.posted_by?.phone_number) {
                              window.open(`tel:${property.posted_by.phone_number}`, '_self');
                            } else {
                              toast({
                                title: "Sign in required",
                                description: "Please sign in to make a call.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Agent
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full hover:bg-primary/5 border-border/50"
                          onClick={() => {
                            if (user && ownerInfo?.email) {
                              window.open(`mailto:${ownerInfo.email}?subject=Inquiry about ${property.title}`, '_self');
                            } else {
                              toast({
                                title: "Sign in required",
                                description: "Please sign in to send an email.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      </div>
                    </div>

                    {/* Agent Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                      <div className="text-center">
                        <div className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{property.posted_by.total_properties}+</div>
                        <div className="text-xs text-muted-foreground">Properties Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">{property.posted_by.experience_years}</div>
                        <div className="text-xs text-muted-foreground">Years Experience</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Agent information not available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Similar Properties</h2>
              <Button variant="outline" className="text-primary hover:bg-primary/5">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProperties.slice(0, 2).map((relatedProperty) => (
                <Card key={relatedProperty.id} className="group border-0 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover-scale">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={relatedProperty.images?.[0] || "/placeholder.svg"}
                      alt={relatedProperty.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                        {formatPrice(relatedProperty.price)}
                      </h3>
                      <h4 className="font-semibold mb-3 text-foreground">{relatedProperty.title}</h4>
                      <div className="flex items-center justify-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Bed className="h-4 w-4" />
                          <span>{relatedProperty.bedrooms || 5}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Bath className="h-4 w-4" />
                          <span>{relatedProperty.bathrooms || 5}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Square className="h-4 w-4" />
                          <span>{relatedProperty.area_sqm || 120}m²</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* More Properties from User Section */}
        {userMoreProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              More from {agentInfo ? agentInfo.full_name : ownerInfo?.full_name || 'this agent'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userMoreProperties.map((userProperty) => (
                <Card key={userProperty.id} className="group border-0 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover-scale">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={userProperty.images?.[0] || "/placeholder.svg"}
                      alt={userProperty.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => navigate(`/properties/${userProperty.id}`)}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2 text-foreground">{userProperty.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      {userProperty.location}
                    </div>
                    <div className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                      {formatPrice(userProperty.price)}
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      variant="outline"
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
