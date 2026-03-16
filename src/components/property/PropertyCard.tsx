
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye, Box, Star, Clock, Calendar, TrendingUp, MessageSquare, Tag, Key, Percent, Glasses, Camera, ShieldCheck } from "lucide-react";
import DemandHeatBadge from './DemandHeatBadge';
import Price from "@/components/ui/Price";
import { useState } from "react";
import PropertyDetailModal from "./PropertyDetailModal";
import Property3DViewModal from "./Property3DViewModal";
import PropertyRatingDisplay from './PropertyRatingDisplay';
import PropertyRatingModal from './PropertyRatingModal';
import { usePropertyRatings } from '@/hooks/usePropertyRatings';
import { BaseProperty } from "@/types/property";
import PropertyTrustBadges from './PropertyTrustBadges';
import UserStatusBadge from "@/components/ui/UserStatusBadge";
import SocialProofWidget from "./SocialProofWidget";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import SharePropertyButton from "./SharePropertyButton";
import OwnerSubscriptionBadge from "./OwnerSubscriptionBadge";

interface PropertyCardProps {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  listing_type: string;
  images?: string[];
  image_urls?: string[];
  thumbnail_url?: string;
  development_status?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  drone_video_url?: string;
  glb_model_url?: string;
  has_vr?: boolean;
  has_360_view?: boolean;
  has_drone_video?: boolean;
  created_at?: string;
  posted_at?: string;
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
  ownership_verified?: boolean;
  developer_certified?: boolean;
  legal_checked?: boolean;
  premium_partner?: boolean;
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
  };
  discount_percentage?: number;
  owner_subscription_type?: string | null;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  location,
  price,
  bedrooms,
  bathrooms,
  area_sqm,
  listing_type,
  images,
  image_urls,
  thumbnail_url,
  development_status = 'completed',
  three_d_model_url,
  virtual_tour_url,
  drone_video_url,
  glb_model_url,
  has_vr,
  has_360_view,
  has_drone_video,
  created_at,
  posted_at,
  owner_type,
  owner_verified,
  agent_verified,
  agency_verified,
  ownership_verified,
  developer_certified,
  legal_checked,
  premium_partner,
  posted_by,
  discount_percentage,
  owner_subscription_type
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const { aggregate } = usePropertyRatings(id);
  const { getPropertyImage } = useDefaultPropertyImage();

  // formatPrice removed — using <Price /> component instead

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  };

  /** True if listed within last 48 hours */
  const isFresh = (() => {
    const d = posted_at || created_at;
    if (!d) return false;
    return (Date.now() - new Date(d).getTime()) < 48 * 60 * 60 * 1000;
  })();

  const photoCount = (images?.length || 0) + (image_urls?.length || 0);

  const formatJoiningDate = (dateString: string) => {
    const now = new Date();
    const joined = new Date(dateString);
    const diffYears = Math.floor((now.getTime() - joined.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (diffYears < 1) return '< 1 Year';
    return `${diffYears} Year${diffYears > 1 ? 's' : ''}`;
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowDetailModal(true);
  };

  const handleView3D = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShow3DModal(true);
  };

  // Convert property to BaseProperty format for modal compatibility
  const convertedProperty: BaseProperty = {
    id: id,
    title: title,
    price: price,
    location: location,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    area_sqm: area_sqm,
    property_type: development_status,
    listing_type: (listing_type === 'sale' || listing_type === 'rent' || listing_type === 'lease') 
      ? listing_type as 'sale' | 'rent' | 'lease'
      : 'sale',
    images: images || [],
    description: description,
    three_d_model_url: three_d_model_url,
    virtual_tour_url: virtual_tour_url,
    posted_by: posted_by,
  };


  return (
    <>
      <Card 
        className={cn(
          "group cursor-pointer overflow-hidden bg-card border rounded-xl will-change-transform",
          "hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.12)] transition-all duration-300 ease-out",
          owner_subscription_type === 'enterprise'
            ? 'border-[hsl(var(--gold-primary)/0.5)] shadow-[0_0_15px_-3px_hsl(var(--gold-primary)/0.15)]'
            : 'border-border hover:border-primary/30',
        )} 
        onClick={handleViewDetails}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={getPropertyImage(images, thumbnail_url, image_urls)}
            alt={title}
            width={400}
            height={300}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Gradient overlay for badge readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
          
          {/* Save Button */}
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
            <button 
              className="h-8 w-8 bg-black/30 backdrop-blur-md hover:bg-black/50 border border-white/20 rounded-full shadow-md flex items-center justify-center btn-press min-h-[32px]"
              onClick={(e) => e.stopPropagation()}
              aria-label="Save property"
            >
              <Heart className="h-4 w-4 text-white/90" />
            </button>
            <SharePropertyButton
              propertyId={id}
              propertyTitle={title}
              propertyPrice={price}
              propertyLocation={location}
              className="h-8 w-8 p-0 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full border border-white/20 shadow-md min-h-[32px]"
              aria-label="Share property"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <Badge 
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md shadow-md border-0 flex items-center gap-1",
                listing_type === 'sale' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
              )}
            >
              {listing_type === 'sale' ? <Tag className="h-2.5 w-2.5" /> : <Key className="h-2.5 w-2.5" />}
              {listing_type === 'sale' ? 'Dijual' : 'Disewa'}
            </Badge>
            {development_status === 'new_project' && (
              <Badge className="bg-accent text-accent-foreground text-[10px] font-medium px-2 py-0.5 rounded-md">
                New Project
              </Badge>
            )}
            {development_status === 'pre_launching' && (
              <Badge className="bg-accent text-accent-foreground text-[10px] font-medium px-2 py-0.5 rounded-md">
                Pre-Launch
              </Badge>
            )}
            {(three_d_model_url || virtual_tour_url || glb_model_url || drone_video_url || has_vr || has_360_view || has_drone_video) && (
              <Badge className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border-0 flex items-center gap-1">
                <Glasses className="h-2.5 w-2.5" />
                Virtual Tour
              </Badge>
             )}
            {isFresh && (
              <Badge className="bg-chart-1/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border-0 flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" />
                Just Listed
              </Badge>
            )}
          </div>

          {/* Photo count + subscription — bottom right */}
          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
            {owner_subscription_type && owner_subscription_type !== 'free' && (
              <OwnerSubscriptionBadge subscriptionType={owner_subscription_type} />
            )}
            {photoCount > 1 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
                <Camera className="h-3 w-3" />
                <span>{photoCount}</span>
              </div>
            )}
          </div>

          {/* Trust Badges - Bottom Left */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <PropertyTrustBadges
              property={{
                owner_type, owner_verified, agent_verified, agency_verified,
                ownership_verified, developer_certified, legal_checked, premium_partner
              }}
              size="sm"
            />
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-3.5 sm:p-4 space-y-2">
          {/* Price — primary focal point */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-lg sm:text-xl font-black text-primary drop-shadow-sm tracking-tight leading-none">
              <Price amount={price} />
            </p>
            {listing_type === 'rent' && (
              <span className="text-[11px] font-semibold text-muted-foreground">/bln</span>
            )}
            {discount_percentage && discount_percentage > 0 && (
              <Badge className="bg-accent text-accent-foreground text-[10px] font-semibold px-1.5 py-0.5">
                -{discount_percentage}%
              </Badge>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          
          {/* Location + freshness */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{location}</span>
            {(created_at || posted_at) && (
              <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(posted_at || created_at!)}
              </span>
            )}
          </div>
          
          {/* Property Specs */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border/40">
            {bedrooms !== undefined && bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{bedrooms}</span>
              </div>
            )}
            {bathrooms !== undefined && bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{bathrooms}</span>
              </div>
            )}
            {area_sqm !== undefined && area_sqm > 0 && (
              <div className="flex items-center gap-1">
                <Square className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{area_sqm}m²</span>
              </div>
            )}
          </div>

          {/* VR Quick Action */}
          {(three_d_model_url || virtual_tour_url || glb_model_url || has_vr) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs w-full border-primary/30 text-primary hover:bg-primary/10 min-h-[36px]"
              onClick={(e) => { e.stopPropagation(); handleView3D(e); }}
            >
              <Glasses className="h-3 w-3 mr-1.5" />
              VR Mode
            </Button>
          )}

          {/* Agent info */}
          {posted_by && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              {posted_by.avatar_url ? (
                <img 
                  src={posted_by.avatar_url} 
                  alt={posted_by.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                  {posted_by.name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-xs font-medium text-foreground truncate flex-1">{posted_by.name}</p>
              {posted_by.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-chart-3 text-chart-3" />
                  <span className="text-xs font-medium">{posted_by.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Rating Summary */}
          {aggregate && aggregate.total_ratings > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <Star className="h-3.5 w-3.5 fill-chart-3 text-chart-3" />
              <span className="text-sm font-semibold">{aggregate.average_rating.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">({aggregate.total_ratings})</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Detail Modal */}
      {showDetailModal && (
        <PropertyDetailModal
          property={convertedProperty}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
          }}
          language="en"
          onView3D={() => {
            setShowDetailModal(false);
            setShow3DModal(true);
          }}
        />
      )}

      {/* 3D View Modal */}
      {show3DModal && (
        <Property3DViewModal
          property={convertedProperty}
          isOpen={show3DModal}
          onClose={() => {
            setShow3DModal(false);
          }}
          language="en"
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <PropertyRatingModal
          propertyId={id}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
};

export default PropertyCard;
