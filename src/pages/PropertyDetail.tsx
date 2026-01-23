
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
import { UserMembershipBadge } from '@/components/user/UserMembershipBadge';
import UserStatusBadge from '@/components/ui/UserStatusBadge';
import { PropertyReviews } from '@/components/property/PropertyReviews';
import { KPRCalculator } from '@/components/property/KPRCalculator';
import { PropertyPosterInfo } from '@/components/property/PropertyPosterInfo';
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
  X,
  Building2,
  Landmark,
  Navigation,
  CheckCircle2,
  ClipboardCheck
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedContactInfo from '@/components/ProtectedContactInfo';
import useAutoHorizontalScroll from '@/hooks/useAutoHorizontalScroll';
import { BookingDialog } from '@/components/property/BookingDialog';
import { SurveyBookingDialog } from '@/components/property/SurveyBookingDialog';
import SocialShareDialog from '@/components/property/SocialShareDialog';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

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
  // Location details
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  // Poster information
  posted_by?: {
    id: string;
    name: string;
    avatar_url?: string;
    poster_type?: 'personal' | 'pt' | 'developer';
    rating?: number;
    user_level?: string;
    verification_status?: 'unverified' | 'pending' | 'verified' | 'trusted' | 'premium';
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
  const [showShareDialog, setShowShareDialog] = useState(false);
  
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

      // Load owner information with extended profile data including membership level
      if (propertyData.owner_id) {
        const { data: owner } = await supabase
          .from('profiles')
          .select(`
            full_name, 
            email, 
            phone, 
            avatar_url, 
            verification_status, 
            created_at,
            user_level_id,
            user_levels (
              name
            )
          `)
          .eq('id', propertyData.owner_id)
          .single();
        
        if (owner) {
          // Get user level name from joined data
          const userLevel = owner.user_levels 
            ? (Array.isArray(owner.user_levels) ? owner.user_levels[0] : owner.user_levels)
            : null;
          
          // Map user level to membership tier
          const getMembershipLevel = (levelName?: string) => {
            if (!levelName) return 'verified';
            const name = levelName.toLowerCase();
            if (name.includes('diamond')) return 'diamond';
            if (name.includes('platinum')) return 'platinum';
            if (name.includes('gold')) return 'gold';
            if (name.includes('vip')) return 'vip';
            return 'verified';
          };
          
          // Enhanced agent/poster data with comprehensive information
          const posterInfo: PropertyData['posted_by'] = {
            id: propertyData.owner_id,
            name: owner.full_name || 'Anonymous User',
            avatar_url: owner.avatar_url,
            poster_type: 'personal' as const,
            rating: 4.8,
            user_level: getMembershipLevel(userLevel?.name),
            verification_status: (owner.verification_status || 'verified') as 'unverified' | 'pending' | 'verified' | 'trusted' | 'premium',
            total_properties: 25,
            joining_date: owner.created_at,
            customer_feedback_rating: 4.9,
            customer_feedback_count: 47,
            whatsapp_number: owner.phone || undefined,
            phone_number: owner.phone || undefined,
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

  const handleShareProperty = () => {
    if (property) {
      setShowShareDialog(true);
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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header always visible during loading */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Kembali
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]"
              >
                <Home className="h-3 w-3 mr-1" />
                Beranda
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Memuat Detail Properti...</h3>
            <p className="text-xs text-muted-foreground">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header always visible on error */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Kembali
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]"
              >
                <Home className="h-3 w-3 mr-1" />
                Beranda
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/properties')}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Properti
              </Button>
            </div>
          </div>
        </div>
        
        {/* Error content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-lg font-bold text-foreground mb-2">Properti Tidak Ditemukan</h1>
            <p className="text-sm text-muted-foreground mb-4">Properti ini tidak ada atau telah dihapus.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/properties')}
              className="text-xs h-8"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Lihat Properti Lain
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Agent/Developer Header - Glassy Style with Membership Badge */}
      {property?.posted_by && (
        <div className="relative bg-gradient-to-r from-primary/8 via-accent/5 to-secondary/8 backdrop-blur-md border-b border-primary/10 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Agent Profile - Enhanced */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-0.5 shadow-lg">
                    <img
                      src={property.posted_by.avatar_url || "/placeholder.svg"}
                      alt={property.posted_by.name}
                      className="w-full h-full rounded-[10px] object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <UserStatusBadge status={property.posted_by.verification_status} size="sm" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {property.posted_by.name}
                    </h3>
                    {/* Membership Level Badge */}
                    <UserMembershipBadge 
                      membershipLevel={property.posted_by.user_level || 'verified'} 
                      size="xs" 
                      variant="pill"
                      showIcon={true}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gradient-to-r from-primary/15 to-accent/15 text-primary px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium backdrop-blur-sm">
                      {property.posted_by.position || 'Developer'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{property.posted_by.customer_feedback_rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline">• {property.posted_by.experience_years}y exp</span>
                  </div>
                </div>
              </div>
                
              <Button 
                size="sm"
                className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 h-9 px-4 text-xs font-semibold shadow-lg shadow-green-500/20"
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

      {/* Slim Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="h-7 w-7 p-0 hover:bg-muted/50 active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1 hover:bg-muted/50 h-7 px-2 active:scale-95"
              >
                <Home className="h-3.5 w-3.5 text-foreground" />
                <span className="text-[10px] text-foreground">Home</span>
              </Button>
              {/* Property Title in Header */}
              <span className="text-[10px] sm:text-xs font-medium text-foreground/70 truncate max-w-[120px] sm:max-w-[200px] ml-1">
                {property.title}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Admin Controls - Compact */}
              {isAdmin && !adminLoading && (
                <div className="hidden md:flex items-center gap-1 mr-1 border-r border-border/30 pr-1">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-6 text-[9px] px-2"
                  >
                    <Edit className="h-2.5 w-2.5 mr-0.5" />
                    {isEditMode ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      if (confirm('Delete this property?')) {
                        try {
                          const { error } = await supabase.from('properties').delete().eq('id', id);
                          if (error) throw error;
                          toast.success({ title: "Deleted", description: "Property deleted." });
                          navigate('/admin');
                        } catch (error) {
                          toast.error({ title: "Error", description: "Unable to delete." });
                        }
                      }
                    }}
                    className="h-6 text-[9px] px-1.5"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
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
                variant="ghost" 
                size="sm" 
                onClick={handleSaveFavorite}
                disabled={favLoading}
                className={`h-7 w-7 p-0 active:scale-95 transition-transform ${isFavorite(property.id) ? "text-destructive" : "text-foreground/70"}`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShareProperty}
                className="h-7 w-7 p-0 text-foreground/70 hover:text-primary active:scale-95 transition-transform"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="md:hidden h-7 w-7 p-0 text-foreground/70 active:scale-95"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 py-2 sm:py-3 bg-gradient-to-b from-background via-primary/5 to-background min-h-screen">
        
        {/* Admin Edit Form */}
        {isAdmin && isEditMode && (
          <Card className="mb-2 border border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="p-2 sm:p-3 bg-primary/5">
              <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
                <Edit className="h-3 w-3" />
                Edit Property
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
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
              }} className="space-y-2 sm:space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Title</label>
                    <Input name="title" defaultValue={property.title} required className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Location</label>
                    <Input name="location" defaultValue={property.location} required className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Price (IDR)</label>
                    <Input name="price" type="number" defaultValue={property.price} required className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Area (sqm)</label>
                    <Input name="area_sqm" type="number" step="0.01" defaultValue={property.area_sqm || ''} className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Bedrooms</label>
                    <Input name="bedrooms" type="number" defaultValue={property.bedrooms || ''} className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Bathrooms</label>
                    <Input name="bathrooms" type="number" defaultValue={property.bathrooms || ''} className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Type</label>
                    <Select name="property_type" defaultValue={property.property_type}>
                      <SelectTrigger className="h-8 text-xs">
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
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Listing</label>
                    <Select name="listing_type" defaultValue={property.listing_type}>
                      <SelectTrigger className="h-8 text-xs">
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
                    <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Status</label>
                    <Select name="status" defaultValue={property.status}>
                      <SelectTrigger className="h-8 text-xs">
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
                  <label className="text-[10px] sm:text-xs font-medium mb-0.5 block text-foreground">Description</label>
                  <Textarea name="description" rows={3} defaultValue={property.description} required className="text-xs" />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 h-7 text-xs px-3">
                    Save
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditMode(false)} className="h-7 text-xs px-3">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {/* Image Gallery */}
        <div className="mb-2 -mx-2 sm:mx-0">
          <EnhancedImageGallery
            images={property.images || []}
            title={property.title}
            propertyType={property.property_type}
            listingType={property.listing_type}
            createdAt={property.created_at}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            areaSqm={property.area_sqm}
            location={property.location}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            
            {/* Property Header - Slim Glassmorphic */}
            <Card className="border border-border/30 bg-card/80 dark:bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 w-full">
                    <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-foreground mb-1 leading-tight">
                      {property.title}
                    </h1>
                    {/* Location Display - Slim */}
                    <div className="flex items-start gap-1.5 mb-1.5 p-1.5 sm:p-2 bg-muted/30 dark:bg-white/5 rounded-lg">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-xs font-medium text-foreground">{property.location}</div>
                        {property.address && (
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground">{property.address}</div>
                        )}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {property.province && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-muted/50 text-foreground/80 border-border/30">
                              {property.province}
                            </Badge>
                          )}
                          {property.city && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-muted/50 text-foreground/80 border-border/30">
                              {property.city}
                            </Badge>
                          )}
                          {property.district && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-muted/50 text-foreground/80 border-border/30">
                              {property.district}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0 active:scale-95" title="Maps">
                        <Navigation className="h-3 w-3 text-primary" />
                      </Button>
                    </div>
                    
                    {/* Posted Time */}
                    <div className="flex items-center gap-1 mb-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>Posted {formatDistanceToNow(new Date(property.created_at), { addSuffix: true, locale: localeId })}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge className="bg-primary text-primary-foreground px-1.5 py-0 h-5 text-[9px] rounded-md shadow-sm">
                        {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                      </Badge>
                      <Badge variant="outline" className="border-border/50 px-1.5 py-0 h-5 text-[9px] rounded-md bg-muted/50 text-foreground capitalize">
                        {property.property_type}
                      </Badge>
                      {property.development_status !== 'completed' && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-1.5 py-0 h-5 text-[9px] rounded-md">
                          {property.development_status === 'new_project' ? '✨ New' : '🚀 Pre-Launch'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Price Display - Slim */}
                  <div className="w-full sm:w-auto">
                    <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-lg p-2 sm:p-3 border border-primary/15 backdrop-blur-sm">
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">Price</p>
                      <div className="text-base sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {formatPrice(property.price)}
                      </div>
                      {property.listing_type === 'rent' && (
                        <span className="text-[9px] sm:text-xs text-muted-foreground">/month</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Stats - Slim Grid */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-2">
                  {property.bedrooms && (
                    <div className="text-center p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-0.5">
                        <Bed className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-primary" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{property.bedrooms}</div>
                      <div className="text-[7px] sm:text-[9px] text-muted-foreground">Beds</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-1.5 bg-accent/5 rounded-lg border border-accent/10">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-0.5">
                        <Bath className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-accent" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{property.bathrooms}</div>
                      <div className="text-[7px] sm:text-[9px] text-muted-foreground">Baths</div>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="text-center p-1.5 bg-secondary/5 rounded-lg border border-secondary/10">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-0.5">
                        <Square className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-secondary-foreground" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{property.area_sqm}</div>
                      <div className="text-[7px] sm:text-[9px] text-muted-foreground">m²</div>
                    </div>
                  )}
                  <div className="text-center p-1.5 bg-muted/30 rounded-lg border border-border/20">
                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-0.5">
                      <Calendar className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-foreground">
                      {new Date(property.created_at).getFullYear()}
                    </div>
                    <div className="text-[7px] sm:text-[9px] text-muted-foreground">Listed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details Tabs - Slim */}
            <Card className="border border-border/30 bg-card/80 dark:bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-lg h-8 p-0.5">
                    <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md text-[10px] sm:text-xs font-medium h-7">Description</TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md text-[10px] sm:text-xs font-medium h-7">Features</TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md text-[10px] sm:text-xs font-medium h-7">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-2 sm:mt-3">
                    <p className="text-foreground leading-relaxed text-xs sm:text-sm">
                      {property.description || 'No description available.'}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-2 sm:mt-3">
                    <div className="grid grid-cols-1 gap-1 sm:gap-1.5">
                      {property.property_features && Object.keys(property.property_features).length > 0 ? (
                        Object.entries(property.property_features).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                            <span className="font-medium capitalize text-foreground">{key.replace(/_/g, ' ')}</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-xs">No features listed.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-2 sm:mt-3">
                    <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                        <span className="font-medium text-foreground">Type</span>
                        <span className="text-muted-foreground capitalize">{property.property_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                        <span className="font-medium text-foreground">Listing</span>
                        <span className="text-muted-foreground capitalize">{property.listing_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs items-center">
                        <span className="font-medium text-foreground">Status</span>
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="h-4 text-[8px] px-1.5 rounded-md">
                          {property.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                        <span className="font-medium text-foreground">Listed</span>
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

            {/* Virtual Tour & 3D Model - Slim */}
            {(property.virtual_tour_url || property.three_d_model_url) && (
              <Card className="border border-border/30 bg-card/80 dark:bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="p-2 sm:p-3 pb-1 bg-muted/20">
                  <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                      <Camera className="h-2.5 w-2.5 text-primary" />
                    </div>
                    Virtual Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 pt-1 space-y-1">
                  {property.virtual_tour_url && (
                    <Button className="w-full h-7 text-[10px] sm:text-xs bg-primary hover:bg-primary/90">
                      <Globe className="h-3 w-3 mr-1" />
                      Virtual Tour
                    </Button>
                  )}
                  {property.three_d_model_url && (
                    <Button variant="outline" className="w-full h-7 text-[10px] sm:text-xs">
                      <Box className="h-3 w-3 mr-1" />
                      3D Model
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Slim */}
          <div className="space-y-2 sm:space-y-3">
            
            {/* KPR Calculator */}
            {property.listing_type === 'sale' && (
              <KPRCalculator propertyPrice={property.price} />
            )}
            
            {/* Contact Information - Slim Agent Card */}
            <Card className="border border-border/30 bg-card/80 dark:bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="p-2 sm:p-3 pb-1 bg-muted/20">
                <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
                  <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-primary" />
                  </div>
                  Agent Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-1 space-y-2">
                {property.posted_by ? (
                  <div>
                    {/* Agent Profile - Slim */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 p-0.5">
                        <img
                          src={property.posted_by.avatar_url || "/placeholder.svg"}
                          alt={property.posted_by.name}
                          className="w-full h-full rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{property.posted_by.name}</h4>
                        <p className="text-[9px] sm:text-[10px] text-primary font-medium">{property.posted_by.position}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-[9px] sm:text-[10px] font-semibold text-foreground">{property.posted_by.customer_feedback_rating}</span>
                          <span className="text-[8px] sm:text-[9px] text-muted-foreground">({property.posted_by.customer_feedback_count})</span>
                        </div>
                      </div>
                    </div>

                    {/* Company - Slim */}
                    <div className="bg-muted/30 rounded-lg p-2 mb-2">
                      <div className="flex items-center gap-1.5 font-medium mb-0.5">
                        <div className="w-5 h-5 bg-primary/10 rounded text-primary text-[9px] flex items-center justify-center font-bold">
                          {property.posted_by.company_name?.charAt(0)}
                        </div>
                        <span className="truncate text-[10px] sm:text-xs text-foreground">{property.posted_by.company_name}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground truncate">{property.posted_by.office_address}</p>
                    </div>

                    {/* Contact Buttons - Slim */}
                    <div className="space-y-1.5">
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white h-8 text-[10px] sm:text-xs font-medium rounded-lg active:scale-95 transition-transform"
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
                      <div className="grid grid-cols-2 gap-1">
                        <Button 
                          variant="outline" 
                          className="h-7 text-[9px] sm:text-[10px] rounded-lg border-border/50 active:scale-95 transition-transform"
                          onClick={() => {
                            if (user && property.posted_by?.phone_number) {
                              window.open(`tel:${property.posted_by.phone_number}`, '_self');
                            } else {
                              toast({ title: "Sign in required", variant: "destructive" });
                            }
                          }}
                        >
                          <Phone className="h-2.5 w-2.5 mr-0.5" />
                          Call
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-7 text-[9px] sm:text-[10px] rounded-lg border-border/50 active:scale-95 transition-transform"
                          onClick={() => {
                            if (user && ownerInfo?.email) {
                              window.open(`mailto:${ownerInfo.email}?subject=Inquiry: ${property.title}`, '_self');
                            } else {
                              toast({ title: "Sign in required", variant: "destructive" });
                            }
                          }}
                        >
                          <Mail className="h-2.5 w-2.5 mr-0.5" />
                          Email
                        </Button>
                      </div>
                      
                      {/* Booking Buttons - Slim */}
                      <BookingDialog 
                        propertyId={property.id} 
                        propertyTitle={property.title}
                        trigger={
                          <Button 
                            variant="outline"
                            className="w-full h-7 text-[9px] sm:text-[10px] font-medium rounded-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-95 transition-transform"
                          >
                            <Calendar className="h-2.5 w-2.5 mr-0.5" />
                            Schedule Viewing
                          </Button>
                        }
                      />
                      
                      <SurveyBookingDialog 
                        propertyId={property.id} 
                        propertyTitle={property.title}
                        propertyLocation={property.city || property.location}
                        trigger={
                          <Button 
                            variant="outline"
                            className="w-full h-7 text-[9px] sm:text-[10px] font-medium rounded-lg border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform"
                          >
                            <ClipboardCheck className="h-2.5 w-2.5 mr-0.5" />
                            Book Survey
                          </Button>
                        }
                      />
                    </div>

                    {/* Agent Stats - Slim */}
                    <div className="grid grid-cols-2 gap-1 pt-2 mt-2 border-t border-border/20">
                      <div className="text-center p-1.5 bg-primary/5 rounded-lg">
                        <div className="font-bold text-xs sm:text-sm text-primary">{property.posted_by.total_properties}+</div>
                        <div className="text-[7px] sm:text-[8px] text-muted-foreground">Properties</div>
                      </div>
                      <div className="text-center p-1.5 bg-accent/5 rounded-lg">
                        <div className="font-bold text-xs sm:text-sm text-accent">{property.posted_by.experience_years}y</div>
                        <div className="text-[7px] sm:text-[8px] text-muted-foreground">Experience</div>
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

        {/* Reviews Section */}
        <div className="mt-6 sm:mt-8">
          <PropertyReviews propertyId={property.id} />
        </div>

        {/* Similar Properties - Modern Compact Cards */}
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
                  className="flex-shrink-0 w-[140px] sm:w-[200px] border-0 bg-card/90 backdrop-blur-sm shadow-lg cursor-pointer snap-start rounded-xl overflow-hidden group hover:shadow-xl transition-all"
                  onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={relatedProperty.images?.[0] || "/placeholder.svg"}
                      alt={relatedProperty.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Price on image */}
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg">
                        {formatPrice(relatedProperty.price)}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {relatedProperty.bedrooms && (
                          <span className="bg-white/20 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[8px] sm:text-[10px] flex items-center gap-0.5">
                            <Bed className="h-2 w-2" />{relatedProperty.bedrooms}
                          </span>
                        )}
                        {relatedProperty.bathrooms && (
                          <span className="bg-white/20 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[8px] sm:text-[10px] flex items-center gap-0.5">
                            <Bath className="h-2 w-2" />{relatedProperty.bathrooms}
                          </span>
                        )}
                        {relatedProperty.area_sqm && (
                          <span className="bg-white/20 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[8px] sm:text-[10px] flex items-center gap-0.5">
                            <Square className="h-2 w-2" />{relatedProperty.area_sqm}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <h4 className="font-medium text-[10px] sm:text-xs line-clamp-1 group-hover:text-primary transition-colors">{relatedProperty.title}</h4>
                    <div className="flex items-center gap-0.5 text-[8px] sm:text-[10px] text-muted-foreground mt-0.5">
                      <MapPin className="h-2 w-2" />
                      <span className="line-clamp-1">{relatedProperty.location}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* More from Agent - Modern Compact Cards */}
        {userMoreProperties.length > 0 && (
          <div className="mt-4 sm:mt-8">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-lg font-bold text-foreground flex items-center gap-1.5">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                </div>
                More from {agentInfo?.full_name || ownerInfo?.full_name || 'Agent'}
              </h2>
            </div>
            
            <div ref={moreFromAgentRef} className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2">
              {userMoreProperties.map((userProperty) => (
                <Card 
                  key={userProperty.id} 
                  className="flex-shrink-0 w-[130px] sm:w-[180px] border-0 bg-card/90 backdrop-blur-sm shadow-lg cursor-pointer snap-start rounded-xl overflow-hidden group hover:shadow-xl transition-all"
                  onClick={() => navigate(`/properties/${userProperty.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={userProperty.images?.[0] || "/placeholder.svg"}
                      alt={userProperty.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Price overlay */}
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg">
                        {formatPrice(userProperty.price)}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {userProperty.bedrooms && (
                          <span className="bg-white/20 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[8px] sm:text-[10px] flex items-center gap-0.5">
                            <Bed className="h-2 w-2" />{userProperty.bedrooms}
                          </span>
                        )}
                        {userProperty.area_sqm && (
                          <span className="bg-white/20 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[8px] sm:text-[10px] flex items-center gap-0.5">
                            <Square className="h-2 w-2" />{userProperty.area_sqm}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <h3 className="font-medium line-clamp-1 text-[10px] sm:text-xs group-hover:text-primary transition-colors">{userProperty.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Social Share Dialog */}
      {property && (
        <SocialShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          property={{
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            listing_type: property.listing_type as 'sale' | 'rent' | 'lease',
            images: property.images,
            city: property.city,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area_sqm: property.area_sqm,
          }}
        />
      )}

      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language="en"
      />
    </div>
  );
};

export default PropertyDetail;
