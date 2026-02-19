import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Maximize, Key, Tag, Building, Eye, Camera, Clock } from "lucide-react";
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
    // Estimate monthly payment (rough KPR calculation)
    const monthlyEstimate = numPrice * 0.006; // ~0.6% monthly
    if (monthlyEstimate >= 1000000) {
      return `Rp ${(monthlyEstimate / 1000000).toFixed(1)} Juta/PB`;
    }
    return `Rp ${(monthlyEstimate / 1000).toFixed(0)} Ribu/PB`;
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

  const isRent = property.listing_type === "rent";
  const accentFrom = isRent ? "from-blue-500" : "from-emerald-500";
  const accentTo = isRent ? "to-cyan-500" : "to-teal-500";
  const accentText = isRent ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400";
  const accentBorder = isRent ? "border-blue-400/20" : "border-emerald-400/20";
  const accentBg = isRent ? "from-blue-500/10 to-cyan-500/10" : "from-emerald-500/10 to-teal-500/10";
  const hoverShadow = isRent ? "hover:shadow-blue-500/10" : "hover:shadow-emerald-500/10";
  const eyeColor = isRent ? "ring-blue-400/40" : "ring-emerald-400/40";
  const eyeIconColor = isRent ? "text-blue-600" : "text-emerald-600";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer",
        hoverShadow,
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={getImageUrl()}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Row */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
          <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r text-white shadow-sm", accentFrom, accentTo)}>
            <ListingIcon className="h-2 w-2" />
            {getListingLabel(property.listing_type)}
          </span>
          <span className="flex items-center gap-0.5 bg-black/40 backdrop-blur-sm text-white/90 text-[9px] px-1.5 py-0.5 rounded-full border border-white/20">
            <Building className="h-2 w-2" />
            {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : "Property"}
          </span>
        </div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-8 right-1.5 h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20",
            isLiked && "bg-red-500/40 border-red-400/40"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-3 w-3", isLiked ? "fill-red-400 text-red-400" : "text-white/80")} />
        </Button>

        {/* Image Count Badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full border border-white/20">
            <Camera className="h-2 w-2" />
            <span>{imageCount}</span>
          </div>
        )}

        {/* View Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={cn("h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2", eyeColor)}>
            <Eye className={cn("h-4 w-4", eyeIconColor)} />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 space-y-1.5">
        {/* Price Section */}
        <div className={cn("flex items-baseline gap-1 rounded-lg px-2 py-1.5 border flex-wrap bg-gradient-to-r", accentBg, accentBorder)}>
          <span className={cn("text-base font-black bg-gradient-to-r bg-clip-text text-transparent leading-none tracking-tight", accentFrom, accentTo)}>
            {priceInfo.main}
          </span>
          {priceInfo.suffix && (
            <span className={cn("text-[11px] font-extrabold opacity-70", accentText)}>{priceInfo.suffix}</span>
          )}
          {isRent && (
            <span className="text-[9px] text-blue-500/60 font-bold ml-auto">/{language === "id" ? "bln" : "mo"}</span>
          )}
          {!isRent && (
            <span className="text-[9px] text-muted-foreground/60 font-medium bg-muted/40 rounded-full px-1 ml-auto">≈ {formatMonthlyPayment(property.price)}</span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn("text-[11px] font-semibold text-foreground line-clamp-2 leading-snug transition-colors group-hover:", accentText)}>
          {property.title}
        </h3>

        {/* Location */}
        <div className={cn("flex items-center gap-1 rounded-lg border px-1.5 py-0.5 bg-gradient-to-r", accentBg, accentBorder)}>
          <MapPin className={cn("h-2.5 w-2.5 flex-shrink-0", accentText)} />
          <span className="text-[10px] text-foreground/70 font-medium line-clamp-1">{getLocation()}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center flex-wrap gap-1 pt-1 border-t border-white/10 dark:border-white/5">
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <div className="flex items-center gap-0.5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20 rounded-md px-1.5 py-0.5">
              <Bed className="h-2.5 w-2.5 text-violet-600 dark:text-violet-400" />
              <span className="text-[10px] font-bold text-foreground/80">{property.bedrooms}</span>
              <span className="text-[8px] text-muted-foreground font-semibold">KT</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="flex items-center gap-0.5 bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-400/20 rounded-md px-1.5 py-0.5">
              <Bath className="h-2.5 w-2.5 text-sky-600 dark:text-sky-400" />
              <span className="text-[10px] font-bold text-foreground/80">{property.bathrooms}</span>
              <span className="text-[8px] text-muted-foreground font-semibold">KM</span>
            </div>
          )}
          {property.land_area && (
            <div className="flex items-center gap-0.5 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/20 rounded-md px-1.5 py-0.5">
              <span className="text-[8px] text-amber-600 dark:text-amber-400 font-bold">LT</span>
              <span className="text-[10px] font-bold text-foreground/80">{property.land_area}m²</span>
            </div>
          )}
          {property.area_sqm && (
            <div className="flex items-center gap-0.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-md px-1.5 py-0.5">
              <Maximize className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold text-foreground/80">{property.area_sqm}m²</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ASTRAVillaPropertyCard;
