
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
      {/* Agent/Developer Header - Mobile Optimized */}
      {property?.posted_by && (
        <div className="relative bg-gradient-to-r from-primary/5 via-accent/3 to-secondary/5 backdrop-blur-sm border-b border-border/10 shadow-xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/2 to-accent/2"></div>
          <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-3 sm:gap-6">
              {/* Agent Profile Section - Mobile Optimized */}
              <div className="flex items-start gap-3 sm:gap-6 flex-1 w-full">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <img
                    src={property.posted_by.avatar_url || "/placeholder.svg"}
                    alt={property.posted_by.name}
                    className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-background shadow-lg"
                  />
                  {property.posted_by.verification_status === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-accent rounded-full flex items-center justify-center border-2 border-background shadow-md">
                      <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {property.posted_by.name}
                    </h3>
                    <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                      {property.posted_by.position || 'Official Developer'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-yellow-700 dark:text-yellow-300 text-[10px] sm:text-xs">
                        {property.posted_by.customer_feedback_rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                      <Medal className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs">
                        {property.posted_by.experience_years}y Experience
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Updated {formatTimeAgo(property.created_at)} ago
                  </p>
                </div>
              </div>
                
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md h-8 sm:h-9 text-xs sm:text-sm"
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

      {/* Navigation Header - Mobile Optimized with Close Button */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <div className="flex items-center gap-1 sm:gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-1 sm:gap-2 hover:bg-muted/50 h-8 sm:h-9 px-2 sm:px-3 md:flex"
              >
                <Home className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 sm:gap-2 hover:bg-muted/50 h-8 sm:h-9 px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Admin Edit Controls - Mobile Hidden */}
              {isAdmin && !adminLoading && (
                <div className="hidden md:flex items-center gap-2 mr-2 border-r border-border pr-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Cancel Edit' : 'Edit Property'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                        try {
                          const { error } = await supabase
                            .from('properties')
                            .delete()
                            .eq('id', id);
                          
                          if (error) throw error;
                          
                          toast.success({
                            title: "Property deleted",
                            description: "The property has been successfully deleted."
                          });
                          navigate('/admin');
                        } catch (error) {
                          console.error('Delete error:', error);
                          toast.error({
                            title: "Delete failed",
                            description: "Unable to delete property. Please try again."
                          });
                        }
                      }
                    }}
                    className="shadow-md"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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
                 className={`h-8 sm:h-9 px-2 sm:px-3 ${isFavorite(property.id) ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "hover:bg-muted/50"}`}
               >
                 <Heart className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
                 <span className="hidden sm:inline">{isFavorite(property.id) ? 'Saved' : 'Save'}</span>
               </Button>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={handleShareProperty}
                 className="hover:bg-muted/50 h-8 sm:h-9 px-2 sm:px-3"
               >
                 <Share2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                 <span className="hidden sm:inline">Share</span>
              </Button>
              
              {/* Close/Home Button - Prominent on Mobile */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="md:hidden hover:bg-muted/50 h-8 w-8 p-0"
                aria-label="Close and go home"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        
        {/* Admin Edit Form */}
        {isAdmin && isEditMode && (
          <Card className="mb-6 border-2 border-primary/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Property Details
              </CardTitle>
              <CardDescription>Update property information (Admin Access)</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
        
        {/* Enhanced Image Gallery - Mobile Optimized */}
        <div className="mb-4 sm:mb-8 -mx-2 sm:mx-0">
          <EnhancedImageGallery
            images={property.images || []}
            title={property.title}
            propertyType={property.property_type}
            listingType={property.listing_type}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            
            {/* Property Header - Mobile Optimized */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6">
                  <div className="flex-1 w-full">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2 sm:mb-3">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-3 sm:mb-4">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-lg">{property.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs shadow-md">
                        {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                      </Badge>
                      <Badge variant="outline" className="border-border/50 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs bg-muted/50">
                        {property.property_type}
                      </Badge>
                      {property.development_status !== 'completed' && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs">
                          {property.development_status === 'new_project' ? 'New Project' : 'Pre-Launch'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Price Display - Mobile Optimized */}
                  <div className="w-full mt-4 sm:mt-0 sm:w-auto sm:text-right">
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-primary/20 shadow-lg">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">Price</p>
                      <div className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                        {formatPrice(property.price)}
                      </div>
                      {property.listing_type === 'rent' && (
                        <span className="text-xs sm:text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Stats - Mobile Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {property.bedrooms && (
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg sm:rounded-xl border border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                      <Bed className="h-4 w-4 sm:h-6 sm:w-6 text-primary mx-auto mb-1 sm:mb-2" />
                      <div className="font-bold text-base sm:text-lg text-foreground">{property.bedrooms}</div>
                      <div className="text-[10px] sm:text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg sm:rounded-xl border border-accent/20 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                      <Bath className="h-4 w-4 sm:h-6 sm:w-6 text-accent mx-auto mb-1 sm:mb-2" />
                      <div className="font-bold text-base sm:text-lg text-foreground">{property.bathrooms}</div>
                      <div className="text-[10px] sm:text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg sm:rounded-xl border border-secondary/20 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300">
                      <Square className="h-4 w-4 sm:h-6 sm:w-6 text-secondary mx-auto mb-1 sm:mb-2" />
                      <div className="font-bold text-base sm:text-lg text-foreground">{property.area_sqm}</div>
                      <div className="text-[10px] sm:text-sm text-muted-foreground">Sqm</div>
                    </div>
                  )}
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/70 rounded-lg sm:rounded-xl border border-border hover:shadow-lg transition-all duration-300">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-foreground mx-auto mb-1 sm:mb-2" />
                    <div className="font-bold text-base sm:text-lg text-foreground">
                      {new Date(property.created_at).getFullYear()}
                    </div>
                    <div className="text-[10px] sm:text-sm text-muted-foreground">Listed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details Tabs - Mobile Optimized */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
              <CardContent className="p-3 sm:p-6">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/30 rounded-lg h-auto">
                    <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md text-xs sm:text-sm py-2">Description</TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md text-xs sm:text-sm py-2">Features</TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md text-xs sm:text-sm py-2">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-3 sm:mt-6">
                    <div className="prose max-w-none">
                      <p className="text-foreground leading-relaxed text-sm sm:text-base">
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

          {/* Sidebar - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-6">
            
            {/* Enhanced Contact Information */}
            <Card className="border-0 bg-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0 sm:pt-0">
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

                {/* Contact Options - Mobile Optimized */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 sm:p-4 rounded-xl border border-border/20">
                    <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2 text-foreground">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      Protected Contact Information
                    </h4>
                    <ProtectedContactInfo
                      phone={property.posted_by.phone_number}
                      email={ownerInfo?.email}
                      whatsappNumber={property.posted_by.whatsapp_number}
                      showButtons={true}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all h-9 sm:h-10 text-xs sm:text-sm"
                      onClick={() => {
                        if (user && property.posted_by?.whatsapp_number) {
                          window.open(`https://wa.me/${property.posted_by.whatsapp_number.replace('+', '')}?text=Hello, I'm interested in ${property.title}`, '_blank');
                        } else if (!user) {
                          setShowAuthModal(true);
                        } else {
                          toast({
                            title: "Contact not available",
                            description: "WhatsApp number not provided for this property.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      📱 Contact via WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary/5 border-border/50 h-9 sm:h-10 text-xs sm:text-sm"
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
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Call Agent
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary/5 border-border/50 h-9 sm:h-10 text-xs sm:text-sm"
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
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>

                {/* Agent Stats - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border/30">
                  <div className="text-center">
                    <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{property.posted_by.total_properties}+</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Properties Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">{property.posted_by.experience_years}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Years Experience</div>
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

        {/* Similar Properties Carousel - Horizontal Scroll */}
        {relatedProperties.length > 0 && (
          <div className="mt-6 sm:mt-12">
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Similar Properties</h2>
              <Button variant="outline" size="sm" className="text-primary hover:bg-primary/5 text-xs sm:text-sm">View All</Button>
            </div>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
                {relatedProperties.map((relatedProperty) => (
                  <Card 
                    key={relatedProperty.id} 
                    className="group flex-shrink-0 w-[280px] sm:w-[320px] border-0 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer snap-start"
                    onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded-t-lg">
                      <img
                        src={relatedProperty.images?.[0] || "/placeholder.svg"}
                        alt={relatedProperty.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                        {formatPrice(relatedProperty.price)}
                      </h3>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-foreground text-sm sm:text-base line-clamp-1">{relatedProperty.title}</h4>
                      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
                        {relatedProperty.bedrooms && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{relatedProperty.bedrooms}</span>
                          </div>
                        )}
                        {relatedProperty.bathrooms && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Bath className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{relatedProperty.bathrooms}</span>
                          </div>
                        )}
                        {relatedProperty.area_sqm && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{relatedProperty.area_sqm}m²</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/properties/${relatedProperty.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* More Properties from Agent Carousel - Horizontal Scroll */}
        {userMoreProperties.length > 0 && (
          <div className="mt-6 sm:mt-12">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              More from {agentInfo ? agentInfo.full_name : ownerInfo?.full_name || 'this agent'}
            </h2>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
                {userMoreProperties.map((userProperty) => (
                  <Card 
                    key={userProperty.id} 
                    className="group flex-shrink-0 w-[240px] sm:w-[260px] border-0 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer snap-start"
                    onClick={() => navigate(`/properties/${userProperty.id}`)}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img
                        src={userProperty.images?.[0] || "/placeholder.svg"}
                        alt={userProperty.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-2.5 sm:p-3">
                      <h3 className="font-semibold line-clamp-2 mb-1.5 sm:mb-2 text-foreground text-xs sm:text-sm">{userProperty.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mb-1.5 sm:mb-2">
                        <MapPin className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                        <span className="truncate">{userProperty.location}</span>
                      </div>
                      <div className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 sm:mb-3 text-sm sm:text-base">
                        {formatPrice(userProperty.price)}
                      </div>
                      <Button 
                        className="w-full h-7 sm:h-8 text-xs sm:text-sm" 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/properties/${userProperty.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Auth Modal for login/registration */}
      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language="en"
      />
    </div>
  );
};

export default PropertyDetail;
