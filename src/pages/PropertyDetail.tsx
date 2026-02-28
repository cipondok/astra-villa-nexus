
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useUserBehaviorAnalytics } from '@/hooks/useUserBehaviorAnalytics';
import { useTranslation } from '@/i18n/useTranslation';
import { SEOHead, seoSchemas } from '@/components/SEOHead';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import EnhancedImageGallery from '@/components/property/EnhancedImageGallery';
import PropertyComparisonButton from '@/components/property/PropertyComparisonButton';
import SimpleProperty3DViewer from '@/components/property/SimpleProperty3DViewer';
import DroneVideoPlayer from '@/components/property/DroneVideoPlayer';
const GLBModelViewer = lazy(() => import('@/components/property/GLBModelViewer'));
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
import PropertyRecommendations from '@/components/property/PropertyRecommendations';
import { KPRCalculator } from '@/components/property/KPRCalculator';
import PropertyMortgageWidget from '@/components/mortgage/PropertyMortgageWidget';
import { PropertyPosterInfo } from '@/components/property/PropertyPosterInfo';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
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
  ClipboardCheck,
  Loader2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedContactInfo from '@/components/ProtectedContactInfo';
import useAutoHorizontalScroll from '@/hooks/useAutoHorizontalScroll';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';
import { BookingDialog } from '@/components/property/BookingDialog';
import { SurveyBookingDialog } from '@/components/property/SurveyBookingDialog';
import SocialShareDialog from '@/components/property/SocialShareDialog';
import SmartCollectionBadges from '@/components/property/SmartCollectionBadges';
import PropertyInvestmentWidget from '@/components/property/PropertyInvestmentWidget';
const PropertyNeighborhoodInsights = lazy(() => import('@/components/property/PropertyNeighborhoodInsights'));
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
  image_urls?: string[];
  owner_id: string;
  agent_id?: string;
  status: string;
  created_at: string;
  property_features?: any;
  development_status: string;
  virtual_tour_url?: string;
  three_d_model_url?: string;
  drone_video_url?: string;
  panorama_360_urls?: string[];
  glb_model_url?: string;
  ai_staging_images?: string[];
  has_vr?: boolean;
  has_360_view?: boolean;
  has_drone_video?: boolean;
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
  const { t } = useTranslation();
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

  const { getPropertyImage } = useDefaultPropertyImage();

  // Auto-scroll refs for mobile carousels
  const similarScrollRef = useRef<HTMLDivElement>(null);
  const moreFromAgentRef = useRef<HTMLDivElement>(null);

  useAutoHorizontalScroll(similarScrollRef, { direction: 'rtl', speed: 1, pauseOnHover: true });
  useAutoHorizontalScroll(moreFromAgentRef, { direction: 'rtl', speed: 1, pauseOnHover: true });

  // Behavior tracking
  const { trackPropertyView, trackInteraction } = useUserBehaviorAnalytics();

  useEffect(() => {
    console.log('PropertyDetail mounted with id:', id);
    if (id) {
      loadProperty();
    }
  }, [id]);

  // Track property view with duration
  useEffect(() => {
    if (!id || !property) return;
    let cleanup: (() => void) | undefined;

    trackPropertyView(id).then(fn => { cleanup = fn; });

    // Also track property metadata for richer signals
    trackInteraction({
      interaction_type: 'view',
      property_id: id,
      interaction_data: {
        view_type: 'property_detail',
        property_type: property.property_type,
        listing_type: property.listing_type,
        price: property.price,
        city: property.city,
        bedrooms: property.bedrooms,
        area_sqm: property.area_sqm,
      }
    });

    return () => { cleanup?.(); };
  }, [id, property?.id]);

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
        .select('id, title, price, images, image_urls, location, property_type, listing_type, bedrooms, bathrooms, area_sqm, status, created_at, description, owner_id, agent_id, development_status')
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
          .select('id, title, price, images, image_urls, location, property_type, listing_type, bedrooms, bathrooms, area_sqm, status, created_at, description, owner_id, agent_id, development_status')
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
      trackInteraction({
        interaction_type: 'save',
        property_id: property.id,
        interaction_data: {
          action: isFavorite(property.id) ? 'unfavorite' : 'favorite',
          property_type: property.property_type,
          price: property.price,
          city: property.city,
        }
      });
    }
  };

  const handleShareProperty = () => {
    if (property) {
      setShowShareDialog(true);
      trackInteraction({
        interaction_type: 'share',
        property_id: property.id,
        interaction_data: {
          property_type: property.property_type,
          price: property.price,
          city: property.city,
        }
      });
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
        <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 h-10">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t('propertyDetail.back')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Home className="h-3.5 w-3.5 mr-1" />
                {t('propertyDetail.home')}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Building2 className="h-8 w-8 text-gold-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">{t('propertyDetail.loading')}</h3>
            <p className="text-xs text-muted-foreground">{t('propertyDetail.pleaseWait')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header always visible on error */}
        <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 h-10">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t('propertyDetail.back')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Home className="h-3.5 w-3.5 mr-1" />
                {t('propertyDetail.home')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/properties')}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {t('propertyDetail.properties')}
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
            <h1 className="text-lg font-bold text-foreground mb-2">{t('propertyDetail.notFound')}</h1>
            <p className="text-sm text-muted-foreground mb-4">{t('propertyDetail.notFoundDesc')}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/properties')}
              className="text-xs h-8"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {t('propertyDetail.viewOther')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {property && (
        <SEOHead
          title={property.title}
          description={property.description?.slice(0, 155)}
          ogImage={property.images?.[0] || property.image_urls?.[0]}
          ogType="product"
          jsonLd={[
            seoSchemas.breadcrumb([
              { name: t('propertyDetail.home'), url: '/' },
              { name: t('propertyDetail.properties'), url: '/properties' },
              { name: property.title, url: `/properties/${property.id}` },
            ]),
            seoSchemas.property({
              title: property.title,
              description: property.description || '',
              price: property.price,
              city: property.city || '',
              state: property.province || '',
              images: property.images,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              areaSqm: property.area_sqm,
              url: `https://astra-villa-realty.lovable.app/properties/${property.id}`,
            }),
          ]}
        />
      )}
      {/* Agent/Developer Header - Glassy Style with Membership Badge */}
      {property?.posted_by && (
        <div className="relative bg-gradient-to-r from-gold-primary/5 via-background to-gold-primary/5 backdrop-blur-2xl border-b border-gold-primary/15">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Agent Profile - Enhanced */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-gold-primary/20 to-gold-primary/10 p-0.5 shadow-lg shadow-gold-primary/10">
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
                    <span className="bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium backdrop-blur-sm">
                      {property.posted_by.position || 'Developer'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold-primary text-gold-primary" />
                      <span className="text-xs font-semibold">{property.posted_by.customer_feedback_rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline">• {property.posted_by.experience_years}y exp</span>
                  </div>
                </div>
              </div>
                
              <Button 
                size="sm"
                className="flex-shrink-0 bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background border-0 h-9 px-4 text-xs font-semibold shadow-sm shadow-gold-primary/20"
                onClick={() => {
                  if (user && property.posted_by?.whatsapp_number) {
                    window.open(`https://wa.me/${property.posted_by.whatsapp_number.replace('+', '')}?text=Hi, I'm interested in ${property.title}`, '_blank');
                  } else {
                    toast({
                      title: t('propertyDetail.signInRequired'), 
                      description: t('propertyDetail.signInToContact'),
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
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-border shadow-sm">
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
                <span className="text-[10px] text-foreground">{t('propertyDetail.home')}</span>
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
                    {isEditMode ? t('common.cancel') : t('common.edit')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      if (confirm(t('propertyDetail.deleteConfirm'))) {
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

      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 py-2 sm:py-3 min-h-screen">
        
        {/* Admin Edit Form */}
        {isAdmin && isEditMode && (
          <Card className="mb-2 border border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="p-2 sm:p-3 bg-primary/5">
              <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
                <Edit className="h-3 w-3" />
                {t('propertyDetail.editProperty')}
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
            images={property.images?.length ? property.images : (property.image_urls?.length ? property.image_urls : [])}
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
            <Card className="border border-gold-primary/10 bg-card backdrop-blur-xl rounded-xl overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 w-full">
                    <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-foreground mb-1 leading-tight">
                      {property.title}
                    </h1>
                    {/* Location Display - Slim */}
                    <div className="flex items-start gap-1.5 mb-1.5 p-1.5 sm:p-2 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
                      <div className="w-6 h-6 rounded-md bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-3 w-3 text-gold-primary" />
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
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0 active:scale-95" title="Maps"><Navigation className="h-3 w-3 text-gold-primary" /></Button>
                    </div>
                    
                    {/* Posted Time */}
                    <div className="flex items-center gap-1 mb-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>Posted {formatDistanceToNow(new Date(property.created_at), { addSuffix: true, locale: localeId })}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`px-1.5 py-0 h-5 text-[9px] rounded-md shadow-sm border-0 ${property.listing_type === 'sale' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'}`}>
                        {property.listing_type === 'sale' ? t('propertyDetail.forSale') : t('propertyDetail.forRent')}
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
                    <div className="bg-gold-primary/5 rounded-lg p-2 sm:p-3 border border-gold-primary/15">
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">{t('propertyDetail.price')}</p>
                      <div className="text-base sm:text-2xl font-bold text-gold-primary">
                        {formatPrice(property.price)}
                      </div>
                      {property.listing_type === 'rent' && (
                        <span className="text-[9px] sm:text-xs text-muted-foreground">{t('propertyDetail.perMonth')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Stats - Slim Grid */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-2">
                  {property.bedrooms && (
                    <div className="text-center p-1.5 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-0.5">
                        <Bed className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-gold-primary" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{property.bedrooms}</div>
                      <div className="text-[7px] sm:text-[9px] text-muted-foreground">{t('propertyDetail.beds')}</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-1.5 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-0.5">
                        <Bath className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-gold-primary" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{property.bathrooms}</div>
                      <div className="text-[7px] sm:text-[9px] text-muted-foreground">{t('propertyDetail.baths')}</div>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="text-center p-1.5 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-0.5">
                        <Square className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-gold-primary" />
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
                    <div className="text-[7px] sm:text-[9px] text-muted-foreground">{t('propertyDetail.listed')}</div>
                  </div>
                </div>

                {/* AI Smart Collection Badges */}
                <SmartCollectionBadges propertyId={property.id} />

                {/* Quick Action Buttons - Book Survey prominently displayed */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                  <BookingDialog 
                    propertyId={property.id} 
                    propertyTitle={property.title}
                    trigger={
                      <Button 
                        className="w-full h-9 text-[10px] sm:text-xs font-medium rounded-lg bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background active:scale-95 transition-transform shadow-sm shadow-gold-primary/20"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {t('propertyDetail.scheduleViewing')}
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
                        className="w-full h-9 text-[10px] sm:text-xs font-medium rounded-lg border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform"
                      >
                        <ClipboardCheck className="h-3 w-3 mr-1" />
                        {t('propertyDetail.bookSurvey')}
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details Tabs - Slim */}
            <Card className="border border-gold-primary/10 bg-card backdrop-blur-xl rounded-xl overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gold-primary/5 rounded-lg h-8 p-0.5 border border-gold-primary/10">
                    <TabsTrigger value="description" className="data-[state=active]:bg-gold-primary data-[state=active]:text-background rounded-md text-[10px] sm:text-xs font-medium h-7">{t('propertyDetail.description')}</TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-gold-primary data-[state=active]:text-background rounded-md text-[10px] sm:text-xs font-medium h-7">{t('propertyDetail.features')}</TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-gold-primary data-[state=active]:text-background rounded-md text-[10px] sm:text-xs font-medium h-7">{t('propertyDetail.details')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-2 sm:mt-3">
                    <p className="text-foreground leading-relaxed text-xs sm:text-sm">
                      {property.description || t('propertyDetail.noDescription')}
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
                        <p className="text-muted-foreground text-center py-4 text-xs">{t('propertyDetail.noFeatures')}</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-2 sm:mt-3">
                    <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                        <span className="font-medium text-foreground">{t('propertyDetail.type')}</span>
                        <span className="text-muted-foreground capitalize">{property.property_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                        <span className="font-medium text-foreground">{t('propertyDetail.listing')}</span>
                        <span className="text-muted-foreground capitalize">{property.listing_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs items-center">
                        <span className="font-medium text-foreground">{t('propertyDetail.status')}</span>
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="h-4 text-[8px] px-1.5 rounded-md">
                          {property.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                        <span className="font-medium text-foreground">{t('propertyDetail.listed')}</span>
                        <span className="text-muted-foreground">
                          {new Date(property.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Neighborhood Insights */}
            <Suspense fallback={<div className="h-40 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold-primary" /></div>}>
              <PropertyNeighborhoodInsights
                city={property.city}
                coordinates={property.coordinates}
                propertyType={property.property_type}
              />
            </Suspense>

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

            {/* Drone Video Player */}
            {property.drone_video_url && (
              <DroneVideoPlayer
                videoUrl={property.drone_video_url}
                title="Drone Walkthrough Video"
              />
            )}

            {/* GLB/GLTF 3D Model Viewer */}
            {property.glb_model_url && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                <GLBModelViewer
                  modelUrl={property.glb_model_url}
                  title="3D Property Model"
                />
              </Suspense>
            )}

            {/* Virtual Tour & 3D Model - Slim */}
            {(property.virtual_tour_url || property.three_d_model_url) && (
              <Card className="border border-border bg-card backdrop-blur-xl rounded-xl overflow-hidden">
                <CardHeader className="p-2 sm:p-3 pb-1 bg-muted/30">
                  <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                      <Camera className="h-2.5 w-2.5 text-primary" />
                    </div>
                    {t('propertyDetail.virtualExperience')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 pt-1 space-y-1">
                  {property.virtual_tour_url && (
                    <Button className="w-full h-7 text-[10px] sm:text-xs bg-primary hover:bg-primary/90">
                      <Globe className="h-3 w-3 mr-1" />
                      {t('propertyDetail.virtualTour')}
                    </Button>
                  )}
                  {property.three_d_model_url && (
                    <Button variant="outline" className="w-full h-7 text-[10px] sm:text-xs">
                      <Box className="h-3 w-3 mr-1" />
                      {t('propertyDetail.model3D')}
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
              <div className="space-y-2 sm:space-y-3">
                <KPRCalculator propertyPrice={property.price} />
                <PropertyMortgageWidget
                  propertyPrice={property.price}
                  propertyId={property.id}
                />
              </div>
            )}

            {/* Investment Snapshot Widget */}
            <PropertyInvestmentWidget
              price={property.price}
              city={property.city || property.location}
              propertyType={property.property_type}
              landArea={property.area_sqm}
            />
            
            {/* Contact Information - Slim Agent Card */}
            <Card className="border border-gold-primary/10 bg-card backdrop-blur-xl rounded-xl overflow-hidden">
              <CardHeader className="p-2 sm:p-3 pb-1 bg-gold-primary/5">
                <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
                  <div className="w-5 h-5 rounded-md bg-gold-primary/10 flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-gold-primary" />
                   </div>
                  {t('propertyDetail.agentInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-1 space-y-2">
                {property.posted_by ? (
                  <div>
                    {/* Agent Profile - Slim */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-gold-primary/15 to-gold-primary/5 p-0.5">
                        <img
                          src={property.posted_by.avatar_url || "/placeholder.svg"}
                          alt={property.posted_by.name}
                          className="w-full h-full rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{property.posted_by.name}</h4>
                        <p className="text-[9px] sm:text-[10px] text-gold-primary font-medium">{property.posted_by.position}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-gold-primary text-gold-primary" />
                          <span className="text-[9px] sm:text-[10px] font-semibold text-foreground">{property.posted_by.customer_feedback_rating}</span>
                          <span className="text-[8px] sm:text-[9px] text-muted-foreground">({property.posted_by.customer_feedback_count})</span>
                        </div>
                      </div>
                    </div>

                    {/* Company - Slim */}
                    <div className="bg-gold-primary/5 border border-gold-primary/10 rounded-lg p-2 mb-2">
                      <div className="flex items-center gap-1.5 font-medium mb-0.5">
                        <div className="w-5 h-5 bg-gold-primary/10 rounded text-gold-primary text-[9px] flex items-center justify-center font-bold">
                          {property.posted_by.company_name?.charAt(0)}
                        </div>
                        <span className="truncate text-[10px] sm:text-xs text-foreground">{property.posted_by.company_name}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground truncate">{property.posted_by.office_address}</p>
                    </div>

                    {/* Contact Buttons - Slim */}
                    <div className="space-y-1.5">
                      <Button 
                        className="w-full bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background h-8 text-[10px] sm:text-xs font-medium rounded-lg active:scale-95 transition-transform shadow-sm shadow-gold-primary/20"
                        onClick={() => {
                          if (user && property.posted_by?.whatsapp_number) {
                            window.open(`https://wa.me/${property.posted_by.whatsapp_number.replace('+', '')}?text=Hi, interested in ${property.title}`, '_blank');
                          } else if (!user) {
                            setShowAuthModal(true);
                          } else {
                            toast({ title: t('propertyDetail.contactNotAvailable'), variant: "destructive" });
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
                              toast({ title: t('propertyDetail.signInRequired'), variant: "destructive" });
                            }
                          }}
                        >
                          <Phone className="h-2.5 w-2.5 mr-0.5" />
                          {t('propertyDetail.call')}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-7 text-[9px] sm:text-[10px] rounded-lg border-border/50 active:scale-95 transition-transform"
                          onClick={() => {
                            if (user && ownerInfo?.email) {
                              window.open(`mailto:${ownerInfo.email}?subject=Inquiry: ${property.title}`, '_self');
                            } else {
                              toast({ title: t('propertyDetail.signInRequired'), variant: "destructive" });
                            }
                          }}
                        >
                          <Mail className="h-2.5 w-2.5 mr-0.5" />
                          {t('propertyDetail.email')}
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
                            {t('propertyDetail.scheduleViewing')}
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
                            {t('propertyDetail.bookSurvey')}
                          </Button>
                        }
                      />
                    </div>

                    {/* Agent Stats - Slim */}
                    <div className="grid grid-cols-2 gap-1 pt-2 mt-2 border-t border-gold-primary/10">
                      <div className="text-center p-1.5 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
                        <div className="font-bold text-xs sm:text-sm text-gold-primary">{property.posted_by.total_properties}+</div>
                        <div className="text-[7px] sm:text-[8px] text-muted-foreground">{t('propertyDetail.properties')}</div>
                      </div>
                      <div className="text-center p-1.5 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
                        <div className="font-bold text-xs sm:text-sm text-gold-primary">{property.posted_by.experience_years}y</div>
                        <div className="text-[7px] sm:text-[8px] text-muted-foreground">{t('propertyDetail.experience')}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">{t('propertyDetail.agentNotAvailable')}</p>
                    <SurveyBookingDialog 
                      propertyId={property.id} 
                      propertyTitle={property.title}
                      propertyLocation={property.city || property.location}
                      trigger={
                        <Button 
                          variant="outline"
                          className="w-full h-8 text-[10px] sm:text-xs font-medium rounded-lg border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform"
                        >
                           <ClipboardCheck className="h-3 w-3 mr-1" />
                           {t('propertyDetail.bookSurvey')}
                        </Button>
                      }
                    />
                    <BookingDialog 
                      propertyId={property.id} 
                      propertyTitle={property.title}
                      trigger={
                        <Button 
                          className="w-full h-8 text-[10px] sm:text-xs font-medium rounded-lg bg-primary hover:bg-primary/90 active:scale-95 transition-transform"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          {t('propertyDetail.scheduleViewing')}
                        </Button>
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6 sm:mt-8">
          <PropertyReviews propertyId={property.id} />
        </div>

        {/* Similar Properties & More From - Side by Side on Wide Screens */}
        <div className="mt-4 sm:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Smart Property Recommendations */}
          <PropertyRecommendations propertyId={property.id} propertyType={property.property_type} />

          {/* More from Agent */}
          {userMoreProperties.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-lg font-bold text-foreground flex items-center gap-1.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold-primary" />
                  </div>
                  More from {agentInfo?.full_name || ownerInfo?.full_name || t('propertyDetail.agentInfo')}
                </h2>
              </div>
              
              <div ref={moreFromAgentRef} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2">
                {userMoreProperties.map((userProperty) => {
                  const upPrice = userProperty.price;
                  const upPriceFormatted = { main: getCurrencyFormatterShort()(upPrice), suffix: '' };

                  return (
                    <Card 
                      key={userProperty.id} 
                      className="flex-shrink-0 w-[160px] sm:w-[220px] border border-border/50 bg-card shadow-sm cursor-pointer snap-start rounded-xl overflow-hidden group hover:shadow-md hover:border-gold-primary/30 transition-all"
                      onClick={() => navigate(`/properties/${userProperty.id}`)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={getPropertyImage(userProperty.images, undefined, userProperty.image_urls)}
                          alt={userProperty.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5 space-y-1.5">
                        <div className="border border-gold-primary/20 bg-gold-primary/5 dark:bg-gold-primary/10 rounded-lg px-2 py-1.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm sm:text-base font-black text-gold-primary tracking-tight leading-none">{upPriceFormatted.main}</span>
                            {upPriceFormatted.suffix && (
                              <span className="text-[10px] sm:text-xs font-extrabold text-gold-primary/70">{upPriceFormatted.suffix}</span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-semibold line-clamp-2 text-[11px] sm:text-xs leading-snug group-hover:text-gold-primary transition-colors">{userProperty.title}</h3>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-gold-primary" />
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium line-clamp-1">{userProperty.location}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5 pt-1.5 border-t border-border/30">
                          {userProperty.bedrooms && userProperty.bedrooms > 0 && (
                            <div className="flex items-center gap-1 border border-gold-primary/20 bg-gold-primary/5 dark:bg-gold-primary/10 rounded-lg px-2 py-0.5">
                              <Bed className="h-3 w-3 text-gold-primary" />
                              <span className="text-[10px] text-foreground font-bold">{userProperty.bedrooms}</span>
                              <span className="text-[9px] text-muted-foreground font-semibold">KT</span>
                            </div>
                          )}
                          {userProperty.area_sqm && (
                            <div className="flex items-center gap-1 border border-border/40 bg-accent/5 dark:bg-accent/10 rounded-lg px-2 py-0.5">
                              <span className="text-[9px] text-accent font-bold">LB</span>
                              <span className="text-[10px] text-foreground font-bold">{userProperty.area_sqm}m²</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
