
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
      <Card className="group card-hover professional-card overflow-hidden h-full flex flex-col border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-lg rounded-xl">
        {/* Image Section with Overlay Info */}
        <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Left Badges */}
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-wrap gap-1 max-w-[75%]">
            {similarityScore && (
              <Badge className="bg-purple-600 text-white font-bold px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs shadow-md flex items-center gap-0.5">
                <ScanEye className="h-2 sm:h-2.5 w-2 sm:w-2.5" />
                {similarityScore.toFixed(0)}%
              </Badge>
            )}
            <Badge className="bg-primary text-primary-foreground font-medium px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs shadow-md">
              {property.listing_type === 'sale' ? currentText.forSale : currentText.forRent}
            </Badge>
            {property.property_type && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                {property.property_type}
              </Badge>
            )}
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex gap-1 sm:gap-1.5">
            {searchImage && similarityScore && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-purple-500/90 hover:bg-purple-600 text-white shadow-lg rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComparisonModal(true);
                }}
              >
                <ScanEye className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 w-6 sm:h-7 sm:w-7 p-0 bg-white/90 hover:bg-white rounded-full ${isLiked ? "ring-2 ring-red-400" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`h-3 sm:h-3.5 w-3 sm:w-3.5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-white/90 hover:bg-white text-blue-500 rounded-full"
                onClick={handleView3D}
              >
                <ViewIcon className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-white/90 hover:bg-white text-gray-600 rounded-full"
              onClick={handleShare}
            >
              <Share2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            </Button>
          </div>

          {/* Bottom Overlay - Property Info on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-3">
            {/* Price */}
            <div className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight drop-shadow-lg">
              {formatPrice(property.price)}
              {property.listing_type === 'rent' && (
                <span className="text-[9px] sm:text-xs font-normal opacity-90">/mo</span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-white text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1 drop-shadow-md mt-0.5">
              {property.title}
            </h4>

            {/* Property Details Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mt-1 sm:mt-1.5">
              {property.bedrooms && property.bedrooms > 0 && (
                <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5">
                  <Bed className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-white" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-white font-medium">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && property.bathrooms > 0 && (
                <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5">
                  <Bath className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-white" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-white font-medium">{property.bathrooms}</span>
                </div>
              )}
              {property.area_sqm && (
                <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5">
                  <Square className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-white" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-white font-medium">{property.area_sqm}m²</span>
                </div>
              )}
              {(property.three_d_model_url || property.virtual_tour_url) && (
                <div className="flex items-center gap-0.5 bg-blue-500/80 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5">
                  <ViewIcon className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-white" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-white font-medium">3D</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-0.5 mt-1 sm:mt-1.5">
              <MapPin className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-white/80 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] md:text-xs text-white/90 truncate">{property.location}</span>
            </div>

            {/* Verification Badges */}
            <div className="flex flex-wrap gap-1 mt-1">
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
          </div>
        </div>

        {/* Compact Bottom Section */}
        <CardContent className="p-1.5 sm:p-2 md:p-3 space-y-1 sm:space-y-1.5 flex-1 flex flex-col">
          {/* Posted By - Compact */}
          {property.posted_by && (
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 glass-ios rounded-lg">
              {property.posted_by.avatar_url ? (
                <img 
                  src={property.posted_by.avatar_url} 
                  alt={property.posted_by.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-[9px] sm:text-xs font-bold flex-shrink-0">
                  {property.posted_by.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] sm:text-xs font-medium text-foreground truncate leading-tight">
                  {property.posted_by.name}
                </span>
                {property.posted_by.user_level && (
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate leading-tight">
                    {property.posted_by.user_level}
                  </span>
                )}
              </div>
              {property.posted_by.rating && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Star className="h-2.5 sm:h-3 w-2.5 sm:w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-[9px] sm:text-xs font-bold text-yellow-600 dark:text-yellow-400">
                    {property.posted_by.rating.toFixed(1)}
                  </span>
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
                className="h-5 sm:h-6 px-1.5 sm:px-2 text-[9px] sm:text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRatingModal(true);
                }}
              >
                <MessageSquare className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5" />
                Reviews
              </Button>
            </div>
          )}

          {/* Action Button - Compact */}
          <div className="flex gap-1 sm:gap-1.5 mt-auto pt-1">
            <Button 
              className="flex-1 h-6 sm:h-7 md:h-8 text-[9px] sm:text-[10px] md:text-xs btn-primary"
              onClick={handleViewDetails}
            >
              <Eye className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5" />
              View
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                className="flex-1 h-6 sm:h-7 md:h-8 text-[9px] sm:text-[10px] md:text-xs"
                onClick={handleView3D}
              >
                <ViewIcon className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5" />
                3D
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
