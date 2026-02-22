import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Maximize, Key, Tag, Building, Eye, Camera } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { cn } from "@/lib/utils";

interface ASTRAVillaPropertyCardProps {
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

const ASTRAVillaPropertyCard = ({
  property,
  language = "id",
  isSaved = false,
  onSave,
  onView,
  className,
}: ASTRAVillaPropertyCardProps) => {
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
    const monthlyEstimate = numPrice * 0.006;
    if (monthlyEstimate >= 1000000) {
      return `Rp ${(monthlyEstimate / 1000000).toFixed(1)} Juta/PB`;
    }
    return `Rp ${(monthlyEstimate / 1000).toFixed(0)} Ribu/PB`;
  };

  const getListingLabel = (type?: string) => {
    switch (type) {
      case "rent": return language === "id" ? "Disewa" : "For Rent";
      case "sale": return language === "id" ? "Dijual" : "For Sale";
      default: return language === "id" ? "Dijual" : "For Sale";
    }
  };

  const getListingIcon = (type?: string) => type === "rent" ? Key : Tag;

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
    if (onView) onView();
    else navigate(`/property/${property.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onSave?.();
  };

  const priceInfo = formatPrice(property.price);
  const ListingIcon = getListingIcon(property.listing_type);
  const imageCount = property.images?.length || 1;
  const isRent = property.listing_type === "rent";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-card/60 backdrop-blur-xl",
        "border border-gold-primary/15 hover:border-gold-primary/40",
        "shadow-sm hover:shadow-xl hover:shadow-gold-primary/10",
        "hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={getImageUrl()}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Top Row */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm",
            isRent
              ? "bg-gold-primary/90 text-background backdrop-blur-sm"
              : "bg-gold-primary backdrop-blur-sm text-background"
          )}>
            <ListingIcon className="h-2.5 w-2.5" />
            {getListingLabel(property.listing_type)}
          </span>
          <span className="flex items-center gap-0.5 bg-background/30 backdrop-blur-md text-foreground/90 text-[9px] px-1.5 py-0.5 rounded-full">
            <Building className="h-2.5 w-2.5" />
            {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : "Property"}
          </span>
        </div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-9 right-2 h-7 w-7 rounded-full",
            "bg-background/20 backdrop-blur-md hover:bg-background/40 border border-primary-foreground/10",
            "transition-all duration-200",
            isLiked && "bg-destructive/30 border-destructive/30"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-3.5 w-3.5 transition-colors", isLiked ? "fill-destructive text-destructive" : "text-primary-foreground/80")} />
        </Button>

        {/* Image Count Badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-background/30 backdrop-blur-md text-foreground text-[9px] px-1.5 py-0.5 rounded-full">
            <Camera className="h-2.5 w-2.5" />
            <span>{imageCount}</span>
          </div>
        )}

        {/* View Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className={cn(
            "h-10 w-10 rounded-full bg-gold-primary/90 backdrop-blur-sm flex items-center justify-center",
            "shadow-lg shadow-gold-primary/30 scale-75 group-hover:scale-100 transition-transform duration-300"
          )}>
            <Eye className="h-4.5 w-4.5 text-background" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 space-y-2">
        {/* Price Section */}
        <div className={cn(
          "flex items-baseline gap-1 rounded-lg px-2.5 py-2 border flex-wrap",
          "bg-primary/5 border-primary/15"
        )}>
          <span className="text-base font-black leading-none tracking-tight text-primary">
            {priceInfo.main}
          </span>
          {priceInfo.suffix && (
            <span className="text-[11px] font-extrabold text-primary/60">
              {priceInfo.suffix}
            </span>
          )}
          {isRent && (
            <span className="text-[9px] text-muted-foreground font-bold ml-auto">/{language === "id" ? "bln" : "mo"}</span>
          )}
          {!isRent && (
            <span className="text-[9px] text-muted-foreground/50 font-medium bg-muted/50 rounded-full px-1.5 ml-auto">
              ≈ {formatMonthlyPayment(property.price)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium line-clamp-1">{getLocation()}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-border/30">
          {property.bedrooms !== undefined && Number(property.bedrooms) > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Bed className="h-3 w-3" />
              <span className="text-[10px] font-semibold text-foreground/80">{property.bedrooms}</span>
              <span className="text-[8px] font-medium">KT</span>
            </div>
          )}
          {property.bathrooms !== undefined && Number(property.bathrooms) > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Bath className="h-3 w-3" />
              <span className="text-[10px] font-semibold text-foreground/80">{property.bathrooms}</span>
              <span className="text-[8px] font-medium">KM</span>
            </div>
          )}
          {property.land_area && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <span className="text-[8px] font-semibold">LT</span>
              <span className="text-[10px] font-semibold text-foreground/80">{property.land_area}m²</span>
            </div>
          )}
          {property.area_sqm && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Maximize className="h-3 w-3" />
              <span className="text-[10px] font-semibold text-foreground/80">{property.area_sqm}m²</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ASTRAVillaPropertyCard;
