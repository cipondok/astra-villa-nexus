
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star, Box, User, Building2, Calendar, Tag, Percent, Eye, Building } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserStatusBadge from "@/components/ui/UserStatusBadge";

interface PropertyOwner {
  id: string;
  name: string;
  avatar_url?: string;
  rating?: number;
  user_level?: string;
  verification_status?: string;
  total_properties?: number;
  joining_date?: string;
  type?: 'agent' | 'owner' | 'company';
}

interface ModernPropertyCardProps {
  property: {
    id: string | number;
    title: string;
    location?: string;
    price: number | string;
    property_type?: string;
    listing_type?: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area_sqm?: number;
    area?: number;
    images?: string[];
    image?: string;
    rating?: number;
    three_d_model_url?: string;
    virtual_tour_url?: string;
    created_at?: string;
    owner?: PropertyOwner;
    agent?: PropertyOwner;
    posted_by?: PropertyOwner;
    city?: string;
    state?: string;
    discount_percentage?: number;
  };
  language?: string;
  isSaved?: boolean;
  onSave?: () => void;
  onView?: () => void;
  onView3D?: () => void;
}

const ModernPropertyCard = ({ 
  property, 
  language = 'en',
  isSaved = false,
  onSave,
  onView,
  onView3D
}: ModernPropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(isSaved);
  const navigate = useNavigate();

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 1000000000) {
      return (
        <>
          <span className="text-[0.7em] font-medium opacity-90">Rp</span>
          {(numPrice / 1000000000).toFixed(1)}
          <span className="text-[0.7em] font-medium opacity-90">M</span>
        </>
      );
    }
    if (numPrice >= 1000000) {
      return (
        <>
          <span className="text-[0.7em] font-medium opacity-90">Rp</span>
          {(numPrice / 1000000).toFixed(0)}
          <span className="text-[0.7em] font-medium opacity-90">Jt</span>
        </>
      );
    }
    return (
      <>
        <span className="text-[0.7em] font-medium opacity-90">Rp</span>
        {numPrice.toLocaleString()}
      </>
    );
  };

  const getTypeLabel = (type?: string) => {
    const t = type || property.listing_type || property.type;
    switch (t) {
      case 'sale': return 'Sale';
      case 'rent': return 'Rent';
      case 'new-project': return 'New';
      default: return t || 'Property';
    }
  };

  const getImageUrl = () => {
    if (property.images && property.images.length > 0) return property.images[0];
    if (property.image) return property.image;
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  };

  const getLocation = () => {
    if (property.location) return property.location;
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    return 'Location';
  };

  const ownerInfo = property.owner || property.agent || property.posted_by;
  const hasVirtualTour = property.three_d_model_url || property.virtual_tour_url;
  const area = property.area_sqm || property.area;
  const rating = property.rating || 4.5;

  const handleClick = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onSave?.();
  };

  const formatJoinDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <Card 
      className="group relative overflow-hidden rounded-xl border-0 bg-card/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getImageUrl()}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start">
          <div className="flex gap-1">
            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
              {getTypeLabel()}
            </Badge>
            {hasVirtualTour && (
              <Badge className="bg-accent/90 text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Box className="h-2.5 w-2.5" />
                3D
              </Badge>
            )}
          </div>
          {/* Property Type Badge */}
          <Badge className="flex items-center gap-0.5 bg-white/60 dark:bg-black/60 backdrop-blur-sm text-foreground text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
            <Building className="h-2.5 w-2.5" />
            {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
          </Badge>
        </div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-8 right-1.5 h-6 w-6 rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/80 ${
            isLiked ? 'text-destructive' : 'text-muted-foreground'
          }`}
          onClick={handleLike}
        >
          <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {/* View Icon - Center on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Eye className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
        </div>

        {/* Bottom Info Overlay - Price & Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          {/* Price with Gradient Badge */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-primary via-primary/90 to-accent shadow-lg backdrop-blur-sm">
              <Tag className="h-3 w-3 text-primary-foreground" />
              <span className="text-primary-foreground font-bold text-sm sm:text-base leading-tight">
                {formatPrice(property.price)}
              </span>
              {(property.listing_type === 'rent' || property.type === 'rent') && (
                <span className="text-primary-foreground/80 text-[9px] font-medium">/mo</span>
              )}
            </div>
            
            {/* Discount Badge */}
            {property.discount_percentage && property.discount_percentage > 0 && (
              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-destructive to-destructive/80 shadow-md animate-pulse">
                <Percent className="h-2.5 w-2.5 text-destructive-foreground" />
                <span className="text-destructive-foreground font-bold text-[10px]">
                  {property.discount_percentage}% OFF
                </span>
              </div>
            )}
          </div>
          
          {/* Property Stats Pills */}
          <div className="flex gap-1 flex-wrap">
            {property.bedrooms && (
              <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px]">
                <Bed className="h-2.5 w-2.5" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px]">
                <Bath className="h-2.5 w-2.5" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {area && (
              <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px]">
                <Square className="h-2.5 w-2.5" />
                <span>{area}m²</span>
              </div>
            )}
            <div className="flex items-center gap-0.5 bg-amber-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] ml-auto">
              <Star className="h-2.5 w-2.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
          <span className="text-[10px] line-clamp-1">{getLocation()}</span>
        </div>

        {/* Owner/Agent Info - Compact */}
        {ownerInfo && (
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded-lg border border-border/30">
            {/* Avatar */}
            {ownerInfo.avatar_url ? (
              <img 
                src={ownerInfo.avatar_url} 
                alt={ownerInfo.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-primary/20"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {ownerInfo.type === 'company' ? (
                  <Building2 className="h-2.5 w-2.5 text-primary-foreground" />
                ) : (
                  <User className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
            )}
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-foreground truncate">
                  {ownerInfo.name}
                </span>
                <UserStatusBadge status={ownerInfo.verification_status} size="xs" />
              </div>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                {ownerInfo.type && (
                  <span className="capitalize">{ownerInfo.type}</span>
                )}
                {ownerInfo.joining_date && (
                  <>
                    <span>•</span>
                    <Calendar className="h-2 w-2" />
                    <span>{formatJoinDate(ownerInfo.joining_date)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Rating */}
            {ownerInfo.rating && (
              <div className="flex items-center gap-0.5 bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  {ownerInfo.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ModernPropertyCard;
