
import React, { useState, useEffect, useRef } from 'react';
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
import { useIsAdmin } from '@/hooks/useUserRoles';
import EnhancedAuthModal from '@/components/auth/EnhancedAuthModal';
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
  Medal,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedContactInfo from '@/components/ProtectedContactInfo';
import useAutoHorizontalScroll from '@/hooks/useAutoHorizontalScroll';

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
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [relatedProperties, setRelatedProperties] = useState<PropertyData[]>([]);
  const [userMoreProperties, setUserMoreProperties] = useState<PropertyData[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Initialize favorites hook with property data once available
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites({
    title: property?.title,
    images: property?.images
  });

  // Auto-scroll refs for mobile carousels
  const similarScrollRef = useRef<HTMLDivElement>(null);
  const moreFromAgentRef = useRef<HTMLDivElement>(null);

  useAutoHorizontalScroll(similarScrollRef, { direction: 'rtl', speed: 1, pauseOnHover: true });
  useAutoHorizontalScroll(moreFromAgentRef, { direction: 'rtl', speed: 1, pauseOnHover: true });

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
            // Enhanced agent information - Use actual owner data
            whatsapp_number: owner.phone || undefined, // Use actual phone from profile
            phone_number: owner.phone || undefined, // Use actual phone from profile
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-sm text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-2">Property Not Found</h1>
          <p className="text-sm text-muted-foreground">This property doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/20">
      {/* Agent/Developer Header - Compact Mobile */}
      {property?.posted_by && (
        <div className="relative bg-gradient-to-r from-primary/5 via-accent/3 to-secondary/5 backdrop-blur-sm border-b border-border/10">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Agent Profile - Compact */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={property.posted_by.avatar_url || "/placeholder.svg"}
                    alt={property.posted_by.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-background shadow-md"
                  />
                  {property.posted_by.verification_status === 'verified' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center border border-background">
                      <Shield className="w-2 h-2 text-accent-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                      {property.posted_by.name}
                    </h3>
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                      {property.posted_by.position || 'Developer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-medium">{property.posted_by.customer_feedback_rating}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">• {property.posted_by.experience_years}y exp</span>
                  </div>
                </div>
              </div>
                
              <Button 
                size="sm"
                className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 h-8 px-3 text-xs"
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
                📱 Chat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header - Compact Mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-10 sm:h-12">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1 hover:bg-muted/50 h-8 px-2"
              >
                <Home className="h-4 w-4" />
                <span className="text-xs">Home</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Admin Edit Controls */}
              {isAdmin && !adminLoading && (
                <div className="hidden md:flex items-center gap-1 mr-1 border-r border-border pr-1">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="bg-blue-500 hover:bg-blue-600 text-white h-7 text-xs px-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {isEditMode ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      if (confirm('Delete this property?')) {
                        try {
                          const { error } = await supabase
                            .from('properties')
                            .delete()
                            .eq('id', id);
                          
                          if (error) throw error;
                          
                          toast.success({
                            title: "Deleted",
                            description: "Property deleted successfully."
                          });
                          navigate('/admin');
                        } catch (error) {
                          console.error('Delete error:', error);
                          toast.error({
                            title: "Error",
                            description: "Unable to delete."
                          });
                        }
                      }
                    }}
                    className="h-7 text-xs px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
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
                className={`h-8 w-8 p-0 ${isFavorite(property.id) ? "bg-destructive/10 text-destructive" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareProperty}
                className="h-8 w-8 p-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="md:hidden h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        
        {/* Admin Edit Form */}
        {isAdmin && isEditMode && (
          <Card className="mb-3 sm:mb-6 border border-primary/30">
            <CardHeader className="p-3 sm:p-4 bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Edit className="h-4 w-4" />
                Edit Property
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                try {
                  const { error } = await supabase
                    .from('properties')
                    .update({
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      price: parseFloat(formData.get('price') as string),
                      location: formData.get('location') as string,
                      bedrooms: parseInt(formData.get('bedrooms') as string) || null,
                      bathrooms: parseInt(formData.get('bathrooms') as string) || null,
                      area_sqm: parseFloat(formData.get('area_sqm') as string) || null,
                      property_type: formData.get('property_type') as string,
                      listing_type: formData.get('listing_type') as string,
                      status: formData.get('status') as string,
                    })
                    .eq('id', id);
                  
                  if (error) throw error;
                  
                  toast.success({
                    title: "Property updated",
                    description: "Changes have been saved successfully."
                  });
                  
                  setIsEditMode(false);
                  loadProperty(); // Reload to show updated data
                } catch (error) {
                  console.error('Update error:', error);
                  toast.error({
                    title: "Update failed",
                    description: "Unable to update property. Please try again."
                  });
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input name="title" defaultValue={property.title} required />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Location</label>
                    <Input name="location" defaultValue={property.location} required />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Price (IDR)</label>
                    <Input name="price" type="number" defaultValue={property.price} required />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Area (sqm)</label>
                    <Input name="area_sqm" type="number" step="0.01" defaultValue={property.area_sqm || ''} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bedrooms</label>
                    <Input name="bedrooms" type="number" defaultValue={property.bedrooms || ''} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bathrooms</label>
                    <Input name="bathrooms" type="number" defaultValue={property.bathrooms || ''} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Property Type</label>
                    <Select name="property_type" defaultValue={property.property_type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Listing Type</label>
                    <Select name="listing_type" defaultValue={property.listing_type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="lease">Lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Select name="status" defaultValue={property.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea name="description" rows={6} defaultValue={property.description} required />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {/* Image Gallery - Compact Mobile */}
        <div className="mb-2 sm:mb-4 -mx-2 sm:mx-0">
          <EnhancedImageGallery
            images={property.images || []}
            title={property.title}
            propertyType={property.property_type}
            listingType={property.listing_type}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-4">
            
            {/* Property Header - Compact Mobile */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 w-full">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1.5 sm:mb-2 leading-tight">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{property.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="default" className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] sm:text-[10px]">
                        {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                      </Badge>
                      <Badge variant="outline" className="border-border/50 px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-muted/30">
                        {property.property_type}
                      </Badge>
                      {property.development_status !== 'completed' && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-1.5 py-0.5 text-[9px] sm:text-[10px]">
                          {property.development_status === 'new_project' ? 'New' : 'Pre-Launch'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Price Display - Compact */}
                  <div className="w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-lg p-2.5 sm:p-3 border border-primary/20">
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">Price</p>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {formatPrice(property.price)}
                      </div>
                      {property.listing_type === 'rent' && (
                        <span className="text-xs sm:text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Stats - Compact Mobile Grid */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3 mt-3">
                  {property.bedrooms && (
                    <div className="text-center p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <Bed className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary mx-auto mb-0.5" />
                      <div className="font-bold text-sm sm:text-base">{property.bedrooms}</div>
                      <div className="text-[8px] sm:text-[10px] text-muted-foreground">Beds</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-2 sm:p-3 bg-accent/5 rounded-lg border border-accent/10">
                      <Bath className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-accent mx-auto mb-0.5" />
                      <div className="font-bold text-sm sm:text-base">{property.bathrooms}</div>
                      <div className="text-[8px] sm:text-[10px] text-muted-foreground">Baths</div>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="text-center p-2 sm:p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                      <Square className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-secondary mx-auto mb-0.5" />
                      <div className="font-bold text-sm sm:text-base">{property.area_sqm}</div>
                      <div className="text-[8px] sm:text-[10px] text-muted-foreground">m²</div>
                    </div>
                  )}
                  <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg border border-border/30">
                    <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-muted-foreground mx-auto mb-0.5" />
                    <div className="font-bold text-sm sm:text-base">
                      {new Date(property.created_at).getFullYear()}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-muted-foreground">Listed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details Tabs - Compact Mobile */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-2.5 sm:p-4">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/30 rounded-md h-8 sm:h-9">
                    <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded text-[10px] sm:text-xs py-1.5">Description</TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded text-[10px] sm:text-xs py-1.5">Features</TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded text-[10px] sm:text-xs py-1.5">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-2 sm:mt-3">
                    <p className="text-foreground leading-relaxed text-xs sm:text-sm">
                      {property.description || 'No description available.'}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-2 sm:mt-3">
                    <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                      {property.property_features && Object.keys(property.property_features).length > 0 ? (
                        Object.entries(property.property_features).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1.5 px-2.5 bg-muted/30 rounded text-xs sm:text-sm">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-xs">No features listed.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-2 sm:mt-3">
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <div className="flex justify-between py-1.5 px-2.5 bg-muted/30 rounded text-xs sm:text-sm">
                        <span className="font-medium">Type</span>
                        <span className="text-muted-foreground capitalize">{property.property_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2.5 bg-muted/30 rounded text-xs sm:text-sm">
                        <span className="font-medium">Listing</span>
                        <span className="text-muted-foreground capitalize">{property.listing_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2.5 bg-muted/30 rounded text-xs sm:text-sm items-center">
                        <span className="font-medium">Status</span>
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="h-5 text-[9px] px-1.5">
                          {property.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-1.5 px-2.5 bg-muted/30 rounded text-xs sm:text-sm">
                        <span className="font-medium">Listed</span>
                        <span className="text-muted-foreground">
                          {new Date(property.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 3D Viewer */}
            <SimpleProperty3DViewer
              property={{
                ...property,
                image_urls: property.images || [],
                listing_type: property.listing_type as "sale" | "rent" | "lease"
              }}
              threeDModelUrl={property.three_d_model_url}
              virtualTourUrl={property.virtual_tour_url}
            />

            {/* Virtual Tour & 3D Model - Compact */}
            {(property.virtual_tour_url || property.three_d_model_url) && (
              <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-2.5 sm:p-4 pb-1.5 sm:pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
                    <Camera className="h-4 w-4 text-primary" />
                    Virtual Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 sm:p-4 pt-0 space-y-1.5">
                  {property.virtual_tour_url && (
                    <Button className="w-full h-8 text-xs" variant="default">
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      Virtual Tour
                    </Button>
                  )}
                  {property.three_d_model_url && (
                    <Button className="w-full h-8 text-xs" variant="outline">
                      <Box className="h-3.5 w-3.5 mr-1.5" />
                      3D Model
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Compact Mobile */}
          <div className="space-y-2 sm:space-y-4">
            
            {/* Contact Information - Compact */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="p-2.5 sm:p-4 pb-1.5 sm:pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
                  <User className="h-4 w-4 text-primary" />
                  Agent Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 sm:p-4 pt-0 space-y-3">
                {property.posted_by ? (
                  <div>
                    {/* Agent Profile - Compact */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={property.posted_by.avatar_url || "/placeholder.svg"}
                        alt={property.posted_by.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">{property.posted_by.name}</h4>
                        <p className="text-[10px] sm:text-xs text-primary">{property.posted_by.position}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] sm:text-xs">{property.posted_by.customer_feedback_rating}</span>
                          <span className="text-[9px] text-muted-foreground">({property.posted_by.customer_feedback_count})</span>
                        </div>
                      </div>
                    </div>

                    {/* Company - Compact */}
                    <div className="bg-muted/30 rounded-lg p-2.5 mb-3 text-xs">
                      <div className="flex items-center gap-1.5 font-medium mb-1">
                        <div className="w-5 h-5 bg-primary/10 rounded text-primary text-[9px] flex items-center justify-center font-bold">
                          {property.posted_by.company_name?.charAt(0)}
                        </div>
                        <span className="truncate">{property.posted_by.company_name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{property.posted_by.office_address}</p>
                    </div>

                    {/* Contact Buttons - Compact */}
                    <div className="space-y-1.5">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                        onClick={() => {
                          if (user && property.posted_by?.whatsapp_number) {
                            window.open(`https://wa.me/${property.posted_by.whatsapp_number.replace('+', '')}?text=Hi, interested in ${property.title}`, '_blank');
                          } else if (!user) {
                            setShowAuthModal(true);
                          } else {
                            toast({ title: "Contact not available", variant: "destructive" });
                          }
                        }}
                      >
                        📱 WhatsApp
                      </Button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button 
                          variant="outline" 
                          className="h-8 text-xs"
                          onClick={() => {
                            if (user && property.posted_by?.phone_number) {
                              window.open(`tel:${property.posted_by.phone_number}`, '_self');
                            } else {
                              toast({ title: "Sign in required", variant: "destructive" });
                            }
                          }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-8 text-xs"
                          onClick={() => {
                            if (user && ownerInfo?.email) {
                              window.open(`mailto:${ownerInfo.email}?subject=Inquiry: ${property.title}`, '_self');
                            } else {
                              toast({ title: "Sign in required", variant: "destructive" });
                            }
                          }}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>

                    {/* Agent Stats - Compact */}
                    <div className="grid grid-cols-2 gap-2 pt-2.5 mt-2.5 border-t border-border/30">
                      <div className="text-center">
                        <div className="font-bold text-sm text-primary">{property.posted_by.total_properties}+</div>
                        <div className="text-[9px] text-muted-foreground">Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-accent">{property.posted_by.experience_years}y</div>
                        <div className="text-[9px] text-muted-foreground">Experience</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Agent info not available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties - Compact Mobile Carousel */}
        {relatedProperties.length > 0 && (
          <div className="mt-4 sm:mt-8">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-lg font-bold text-foreground">Similar Properties</h2>
              <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2">View All</Button>
            </div>
            
            <div ref={similarScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2">
              {relatedProperties.map((relatedProperty) => (
                <Card 
                  key={relatedProperty.id}
                  className="flex-shrink-0 w-[160px] sm:w-[220px] border-0 bg-card shadow-md cursor-pointer snap-start"
                  onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={relatedProperty.images?.[0] || "/placeholder.svg"}
                      alt={relatedProperty.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm font-bold text-primary mb-0.5">{formatPrice(relatedProperty.price)}</div>
                    <h4 className="font-medium text-[10px] sm:text-xs line-clamp-1 mb-1">{relatedProperty.title}</h4>
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-muted-foreground">
                      {relatedProperty.bedrooms && <span>{relatedProperty.bedrooms} bed</span>}
                      {relatedProperty.area_sqm && <span>{relatedProperty.area_sqm}m²</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* More from Agent - Compact Mobile Carousel */}
        {userMoreProperties.length > 0 && (
          <div className="mt-4 sm:mt-8">
            <h2 className="text-sm sm:text-lg font-bold mb-2 sm:mb-4 text-foreground">
              More from {agentInfo?.full_name || ownerInfo?.full_name || 'agent'}
            </h2>
            
            <div ref={moreFromAgentRef} className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2">
              {userMoreProperties.map((userProperty) => (
                <Card 
                  key={userProperty.id} 
                  className="flex-shrink-0 w-[140px] sm:w-[180px] border-0 bg-card shadow-md cursor-pointer snap-start"
                  onClick={() => navigate(`/properties/${userProperty.id}`)}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={userProperty.images?.[0] || "/placeholder.svg"}
                      alt={userProperty.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-1.5">
                    <h3 className="font-medium line-clamp-1 text-[10px] sm:text-xs mb-0.5">{userProperty.title}</h3>
                    <div className="font-bold text-primary text-[10px] sm:text-xs">{formatPrice(userProperty.price)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language="en"
      />
    </div>
  );
};

export default PropertyDetail;
