import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Maximize, Key, Tag, Building, Eye, Camera, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { cn } from "@/lib/utils";

interface Rumah123PropertyCardProps {
  property: {
    id: string | number;
    title: string;
    location?: string;
    price: number | string;
    property_type?: string;
    listing_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area_sqm?: number;
    land_area?: number;
    images?: string[];
    thumbnail_url?: string;
    city?: string;
    state?: string;
    area?: string;
    created_at?: string;
  };
  language?: "en" | "id";
  isSaved?: boolean;
  onSave?: () => void;
  onView?: () => void;
  className?: string;
}

const Rumah123PropertyCard = ({
  property,
  language = "id",
  isSaved = false,
  onSave,
  onView,
  className,
}: Rumah123PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(isSaved);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { getPropertyImage } = useDefaultPropertyImage();

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numPrice >= 1000000000) {
      const value = (numPrice / 1000000000).toFixed(1);
      return { main: `Rp ${value}`, suffix: "Miliar" };
    }
    if (numPrice >= 1000000) {
      const value = (numPrice / 1000000).toFixed(0);
      return { main: `Rp ${value}`, suffix: "Juta" };
    }
    return { main: `Rp ${numPrice.toLocaleString("id-ID")}`, suffix: "" };
  };

  const formatMonthlyPayment = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    // Estimate monthly payment (rough KPR calculation)
    const monthlyEstimate = numPrice * 0.006; // ~0.6% monthly
    if (monthlyEstimate >= 1000000) {
      return `Rp ${(monthlyEstimate / 1000000).toFixed(0)} Jutaan/bulan`;
    }
    return `Rp ${(monthlyEstimate / 1000).toFixed(0)} Ribuan/bulan`;
  };

  const getListingLabel = (type?: string) => {
    switch (type) {
      case "rent":
        return language === "id" ? "Disewa" : "For Rent";
      case "sale":
        return language === "id" ? "Dijual" : "For Sale";
      default:
        return language === "id" ? "Dijual" : "For Sale";
    }
  };

  const getListingIcon = (type?: string) => {
    return type === "rent" ? Key : Tag;
  };

  const getImageUrl = () => {
    if (imageError) return "/placeholder.svg";
    return getPropertyImage(property.images, property.thumbnail_url, (property as any).image_urls);
  };

  const getLocation = () => {
    if (property.area && property.city) return `${property.area}, ${property.city}`;
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    if (property.location) return property.location;
    return "Indonesia";
  };

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

  const priceInfo = formatPrice(property.price);
  const ListingIcon = getListingIcon(property.listing_type);
  const imageCount = property.images?.length || 1;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-lg bg-card/70 backdrop-blur-md border border-primary/10 dark:border-primary/15 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:border-primary/25 transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={getImageUrl()}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Top Row - Listing Type & Property Type */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <Badge
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md shadow-sm",
              property.listing_type === "rent"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground"
            )}
          >
            <ListingIcon className="h-3 w-3" />
            {getListingLabel(property.listing_type)}
          </Badge>

          <Badge className="flex items-center gap-1 bg-card/90 backdrop-blur-sm text-foreground text-[11px] px-2 py-1 rounded-md shadow-sm border border-border/50">
            <Building className="h-3 w-3" />
            {property.property_type
              ? property.property_type.charAt(0).toUpperCase() +
                property.property_type.slice(1).toLowerCase()
              : "Property"}
          </Badge>
        </div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-10 right-2 h-7 w-7 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-sm border border-border/50",
            isLiked && "bg-destructive/10 border-destructive/30"
          )}
          onClick={handleLike}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5",
              isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
        </Button>

        {/* Image Count Badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
            <Camera className="h-3 w-3" />
            <span>{imageCount}</span>
          </div>
        )}

        {/* View Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 dark:bg-black/20">
          <div className="h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Eye className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 space-y-2">
        {/* Price Section */}
        <div className="border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-lg px-3 py-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-primary tracking-tight leading-none">
              {priceInfo.main}
            </span>
            {priceInfo.suffix && (
              <span className="text-sm sm:text-base font-extrabold text-primary/70">
                {priceInfo.suffix}
              </span>
            )}
            {property.listing_type === "rent" && (
              <span className="text-[11px] text-primary/60 font-bold">
                / {language === "id" ? "bln" : "mo"}
              </span>
            )}
            {property.listing_type === "sale" && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-medium bg-muted/40 rounded-full px-1.5 py-px">
                ≈ {formatMonthlyPayment(property.price)}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 bg-primary/5 dark:bg-primary/10 rounded px-2 py-1">
          <MapPin className="h-3 w-3 flex-shrink-0 text-primary/70" />
          <span className="text-[11px] sm:text-xs text-foreground/70 font-medium line-clamp-1">{getLocation()}</span>
        </div>

        {/* Property Specs - KT/KM/LT/LB Style */}
        <div className="flex items-center flex-wrap gap-2.5 pt-2 border-t border-primary/10">
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-lg px-2.5 py-1">
              <Bed className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-xs text-foreground/80 font-bold">{property.bedrooms}</span>
              <span className="text-[10px] text-muted-foreground/70 font-semibold">KT</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-lg px-2.5 py-1">
              <Bath className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-xs text-foreground/80 font-bold">{property.bathrooms}</span>
              <span className="text-[10px] text-muted-foreground/70 font-semibold">KM</span>
            </div>
          )}
          {property.land_area && (
            <div className="flex items-center gap-1.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-lg px-2.5 py-1">
              <span className="text-[10px] text-primary/60 font-bold">LT</span>
              <span className="text-xs text-foreground/80 font-bold">{property.land_area}m²</span>
            </div>
          )}
          {property.area_sqm && (
            <div className="flex items-center gap-1.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-lg px-2.5 py-1">
              <span className="text-[10px] text-primary/60 font-bold">LB</span>
              <span className="text-xs text-foreground/80 font-bold">{property.area_sqm}m²</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Rumah123PropertyCard;
