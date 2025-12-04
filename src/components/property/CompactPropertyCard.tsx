
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Eye, Heart, Share2, View as ViewIcon, Star, Clock, Calendar, TrendingUp, MessageSquare, ScanEye } from 'lucide-react';
import PropertyDetailModal from './PropertyDetailModal';
import Property3DViewModal from './Property3DViewModal';
import PropertyRatingDisplay from './PropertyRatingDisplay';
import PropertyRatingModal from './PropertyRatingModal';
import { VisualComparisonModal } from '@/components/search/VisualComparisonModal';
import { usePropertyRatings } from '@/hooks/usePropertyRatings';
import { BaseProperty } from '@/types/property';
import VerificationBadge from '@/components/ui/VerificationBadge';

interface CompactProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  property_type?: string;
  listing_type: string;
  images?: string[];
  thumbnail_url?: string;
  description?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  state?: string;
  city?: string;
  created_at?: string;
  posted_at?: string;
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
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
}

interface CompactPropertyCardProps {
  property: CompactProperty;
  language: "en" | "id";
  onView?: (id: string) => void;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onView3D?: (property: CompactProperty) => void;
  searchImage?: string;
  similarityScore?: number;
  similarityBreakdown?: {
    propertyType?: number;
    style?: number;
    architecture?: number;
    bedrooms?: number;
    amenities?: number;
  };
}

const CompactPropertyCard = ({ 
  property, 
  language, 
  onView, 
  isSaved = false,
  onSave,
  onShare,
  onView3D,
  searchImage,
  similarityScore,
  similarityBreakdown
}: CompactPropertyCardProps) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isLiked, setIsLiked] = useState(isSaved);

  const { aggregate } = usePropertyRatings(property.id);

  const text = {
    en: {
      viewDetails: "View Details",
      view3D: "3D View",
      forSale: "For Sale",
      forRent: "For Rent",
      bedrooms: "bed",
      bathrooms: "bath"
    },
    id: {
      viewDetails: "Lihat Detail",
      view3D: "Tampilan 3D",
      forSale: "Dijual",
      forRent: "Disewa",
      bedrooms: "kmr", 
      bathrooms: "kmdi"
    }
  };

  const currentText = text[language];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return language === 'en' ? 'Just now' : 'Baru saja';
    if (diffInHours < 24) return `${diffInHours}${language === 'en' ? 'h ago' : 'j lalu'}`;
    if (diffInDays < 30) return `${diffInDays}${language === 'en' ? 'd ago' : 'h lalu'}`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}${language === 'en' ? 'mo ago' : 'bl lalu'}`;
    return `${Math.floor(diffInDays / 365)}${language === 'en' ? 'y ago' : 'th lalu'}`;
  };

  const formatJoiningDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getImageUrl = () => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.thumbnail_url) {
      return property.thumbnail_url;
    }
    return "/placeholder.svg";
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('CompactPropertyCard - Opening detail modal for property:', property.id);
    setShowDetailModal(true);
  };

  const handleView3D = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('CompactPropertyCard - Opening 3D modal for property:', property.id);
    setShow3DModal(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(property.id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onSave) {
      onSave(property.id);
    }
  };

  // Convert property to BaseProperty format for modals
  const convertedProperty: BaseProperty = {
    ...property,
    listing_type: (property.listing_type === 'sale' || property.listing_type === 'rent' || property.listing_type === 'lease') 
      ? property.listing_type as 'sale' | 'rent' | 'lease'
      : 'sale'
  };

  console.log('CompactPropertyCard - Rendering with showDetailModal:', showDetailModal);
  console.log('CompactPropertyCard - Rendering with show3DModal:', show3DModal);

  return (
    <>
      <Card className="group card-hover professional-card overflow-hidden h-full flex flex-col">
        {/* Image Section - Optimized for mobile */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] overflow-hidden flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
            {similarityScore && (
              <Badge 
                className="bg-purple-600 text-white font-bold px-2 py-0.5 text-xs shadow-md flex items-center gap-1"
              >
                <ScanEye className="h-2.5 w-2.5" />
                {similarityScore.toFixed(0)}% Match
              </Badge>
            )}
            <Badge 
              className="bg-primary text-primary-foreground font-medium px-2 py-0.5 text-xs shadow-md"
            >
              {property.listing_type === 'sale' ? currentText.forSale : currentText.forRent}
            </Badge>
            {property.property_type && (
              <Badge variant="outline" className="bg-background/90 capitalize text-xs px-2 py-0.5">
                {property.property_type}
              </Badge>
            )}
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground backdrop-blur-sm border-none flex items-center gap-1 px-2 py-0.5 text-xs">
                <ViewIcon className="h-2.5 w-2.5" />
                <span>3D</span>
              </Badge>
            )}
          </div>

          {/* Verification Badges - Bottom Left */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {property.owner_type === 'individual' && property.owner_verified && (
              <VerificationBadge type="owner" verified={true} size="sm" />
            )}
            {property.owner_type === 'agent' && property.agent_verified && (
              <VerificationBadge type="agent" verified={true} size="sm" />
            )}
            {property.owner_type === 'agency' && property.agency_verified && (
              <VerificationBadge type="agency" verified={true} size="sm" />
            )}
          </div>

          {/* Top-right: Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            {searchImage && similarityScore && (
              <Button
                size="sm"
                variant="ghost"
                className="bg-purple-500/90 hover:bg-purple-600 text-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComparisonModal(true);
                }}
                title="Compare visually"
              >
                <ScanEye className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`bg-white/90 hover:bg-white ${isLiked ? "ring-2 ring-red-400" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/90 hover:bg-white text-blue-500"
                onClick={handleView3D}
              >
                <ViewIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white text-gray-600"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section - Compact mobile styling */}
        <CardContent className="p-2 sm:p-2.5 md:p-4 space-y-1.5 sm:space-y-2 md:space-y-3 flex-1 flex flex-col">
          {/* Price */}
          <div className="price-section">
            <div className="text-sm sm:text-base md:text-lg font-bold gradient-text tracking-tight leading-none">
              {formatPrice(property.price)}
            </div>
            {property.listing_type === 'rent' && (
              <div className="text-[10px] md:text-xs font-medium text-muted-foreground mt-0.5">
                Per Month
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-[11px] sm:text-xs md:text-sm text-foreground line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem] md:min-h-[2.5rem] flex-grow">
            {property.title}
          </h4>

          {/* User Information Section - Compact */}
          {property.posted_by && (
            <div className="space-y-2">
              {/* Main User Info */}
              <div className="flex items-center gap-2 p-2 glass-ios">
                <div className="flex items-center gap-2">
                  {property.posted_by.avatar_url ? (
                    <img 
                      src={property.posted_by.avatar_url} 
                      alt={property.posted_by.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {property.posted_by.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-medium text-foreground truncate">
                      {property.posted_by.name}
                    </span>
                    {property.posted_by.user_level && (
                      <span className="text-xs text-muted-foreground font-medium truncate">
                        {property.posted_by.user_level}
                      </span>
                    )}
                  </div>
                </div>
                {property.posted_by.rating && (
                  <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                      {property.posted_by.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs md:text-sm truncate">{property.location}</span>
          </div>

          {/* Property Details - Compact mobile */}
          {(property.bedrooms || property.bathrooms || property.area_sqm) && (
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm text-muted-foreground flex-wrap">
              {property.bedrooms && property.bedrooms > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Bed className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && property.bathrooms > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Bath className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area_sqm && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Square className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span>{property.area_sqm}m²</span>
                </div>
              )}
            </div>
          )}

          {/* Property Rating */}
          {aggregate && aggregate.total_ratings > 0 && (
            <div className="flex items-center justify-between">
              <PropertyRatingDisplay
                averageRating={aggregate.average_rating}
                totalRatings={aggregate.total_ratings}
                size="sm"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRatingModal(true);
                }}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reviews
              </Button>
            </div>
          )}

          {/* Action Buttons - Compact on mobile */}
          <div className="flex gap-1.5 sm:gap-2 mt-auto pt-1.5 sm:pt-2">
            <Button 
              className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs btn-primary"
              onClick={handleViewDetails}
            >
              <Eye className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">{currentText.viewDetails}</span>
              <span className="xs:hidden">View</span>
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                onClick={handleView3D}
              >
                <ViewIcon className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="hidden xs:inline">{currentText.view3D}</span>
                <span className="xs:hidden">3D</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Detail Modal */}
      {showDetailModal && (
        <PropertyDetailModal
          property={convertedProperty}
          isOpen={showDetailModal}
          onClose={() => {
            console.log('CompactPropertyCard - Closing detail modal');
            setShowDetailModal(false);
          }}
          language={language}
          onView3D={() => {
            console.log('CompactPropertyCard - Opening 3D from detail modal');
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
            console.log('CompactPropertyCard - Closing 3D modal');
            setShow3DModal(false);
          }}
          language={language}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <PropertyRatingModal
          propertyId={property.id}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
        />
      )}

      {/* Visual Comparison Modal */}
      {showComparisonModal && searchImage && (
        <VisualComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          searchImage={searchImage}
          propertyImage={getImageUrl()}
          propertyTitle={property.title}
          similarityScore={similarityScore || 0}
          similarityBreakdown={similarityBreakdown}
        />
      )}
    </>
  );
};

export default CompactPropertyCard;
