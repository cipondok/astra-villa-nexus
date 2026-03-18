import { useState, memo } from 'react';
import { cn } from '@/lib/utils';
import { Heart, ArrowUpRight, MapPin, Bed, Bath, Maximize, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';
import OpportunityScoreRing from './OpportunityScoreRing';

export interface ListingCardProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  property_type?: string;
  listing_type: string;
  images?: string[];
  thumbnail_url?: string;
  opportunity_score?: number | null;
  ai_estimated_price?: number | null;
  discount_percentage?: number;
}

interface PropertyListingCardProps {
  property: ListingCardProperty;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

type TagType = 'elite' | 'price-drop' | 'high-yield' | null;

function resolveTag(property: ListingCardProperty): TagType {
  if (property.opportunity_score && property.opportunity_score >= 85) return 'elite';
  if (property.discount_percentage && property.discount_percentage > 0) return 'price-drop';
  if (property.ai_estimated_price && property.price < property.ai_estimated_price * 0.9) return 'high-yield';
  return null;
}

const tagConfig: Record<NonNullable<TagType>, { label: string; icon: typeof Sparkles; className: string }> = {
  elite: {
    label: 'Elite',
    icon: Sparkles,
    className: 'bg-chart-2/90 text-white',
  },
  'price-drop': {
    label: 'Price Drop',
    icon: Zap,
    className: 'bg-destructive/90 text-destructive-foreground',
  },
  'high-yield': {
    label: 'High Yield',
    icon: TrendingUp,
    className: 'bg-primary/90 text-primary-foreground',
  },
};

const PropertyListingCard = memo(({
  property,
  isSaved = false,
  onSave,
  onClick,
  className,
}: PropertyListingCardProps) => {
  const [liked, setLiked] = useState(isSaved);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { formatPrice } = useCurrency();
  const { getPropertyImage } = useDefaultPropertyImage();

  const imageUrl = getPropertyImage(property.images, property.thumbnail_url);
  const tag = resolveTag(property);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    onSave?.(property.id);
  };

  const handleClick = () => onClick?.(property.id);

  const fairValueDiff = property.ai_estimated_price && property.ai_estimated_price > 0
    ? Math.round(((property.ai_estimated_price - property.price) / property.price) * 100)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={handleClick}
      className={cn(
        'group relative flex flex-col cursor-pointer',
        'w-full sm:w-[340px]',
        'rounded-[18px] overflow-hidden',
        'bg-card border border-border/60',
        'shadow-sm hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.15)]',
        'hover:border-primary/30 hover:-translate-y-1',
        'transition-all duration-500 ease-out',
        'will-change-transform',
        property.opportunity_score && property.opportunity_score >= 85 &&
          'ring-1 ring-chart-2/20 hover:ring-chart-2/40',
        className
      )}
    >
      {/* ─── IMAGE SECTION ─── */}
      <div className="relative h-[180px] overflow-hidden">
        {/* Shimmer placeholder */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        <img
          src={imageUrl}
          alt={property.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'w-full h-full object-cover',
            'group-hover:scale-105 transition-transform duration-700 ease-out',
            !imgLoaded && 'opacity-0'
          )}
        />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* ─── TOP-LEFT TAG ─── */}
        {tag && (
          <div className={cn(
            'absolute top-3 left-3 z-10',
            'flex items-center gap-1 px-2.5 py-1 rounded-full',
            'text-[11px] font-semibold tracking-wide',
            'backdrop-blur-sm shadow-md',
            tagConfig[tag].className
          )}>
            {(() => {
              const Icon = tagConfig[tag].icon;
              return <Icon className="h-3 w-3" />;
            })()}
            {tagConfig[tag].label}
          </div>
        )}

        {/* ─── TOP-RIGHT OPPORTUNITY SCORE ─── */}
        {property.opportunity_score && property.opportunity_score > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <OpportunityScoreRing score={property.opportunity_score} size={42} />
          </div>
        )}
      </div>

      {/* ─── INFO SECTION ─── */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Title */}
        <h3 className="text-[16px] sm:text-[17px] font-semibold text-foreground leading-snug truncate">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {property.city ? `${property.city} · ${property.location}` : property.location}
          </span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
          {property.bedrooms != null && property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
          )}
          {property.area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.area_sqm} m²
            </span>
          )}
        </div>

        {/* Price + AI fair value */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-foreground leading-none tracking-tight">
              {formatPrice(property.price)}
            </p>
            {fairValueDiff !== null && fairValueDiff > 0 && (
              <p className="flex items-center gap-0.5 mt-1 text-[11px] text-chart-2 font-medium">
                <TrendingUp className="h-3 w-3" />
                {fairValueDiff}% below AI fair value
              </p>
            )}
          </div>
        </div>

        {/* ─── ACTION ROW ─── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          {/* Watchlist */}
          <button
            onClick={handleSave}
            aria-label={liked ? 'Remove from watchlist' : 'Add to watchlist'}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'transition-colors duration-200',
              liked
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
            {liked ? 'Saved' : 'Save'}
          </button>

          {/* Quick view arrow */}
          <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all duration-300">
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </motion.article>
  );
});

PropertyListingCard.displayName = 'PropertyListingCard';
export default PropertyListingCard;
