import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Heart, MapPin, Bed, Bath, Maximize, MessageSquare,
  TrendingDown, TrendingUp, Flame, ArrowUpRight,
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';
import OpportunityScoreRing from './OpportunityScoreRing';

export interface WatchlistProperty {
  id: string;
  title: string;
  price: number;
  location?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  property_type?: string;
  listing_type: string;
  images?: string[];
  thumbnail_url?: string;
  opportunity_score?: number | null;
  ai_estimated_price?: number | null;
  discount_percentage?: number | null;
  demand_score?: number | null;
  previous_price?: number | null;
}

interface WatchlistPropertyCardProps {
  property: WatchlistProperty;
  onRemove: (id: string) => void;
  onInquiry?: (id: string) => void;
  index?: number;
}

const WatchlistPropertyCard = memo(({
  property,
  onRemove,
  onInquiry,
  index = 0,
}: WatchlistPropertyCardProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { getPropertyImage } = useDefaultPropertyImage();
  const [imgLoaded, setImgLoaded] = useState(false);

  const imageUrl = getPropertyImage(property.images, property.thumbnail_url);

  // Price change detection
  const priceChanged = property.previous_price && property.previous_price !== property.price;
  const priceDropped = priceChanged && property.price < (property.previous_price ?? 0);
  const priceDropPercent = priceChanged && property.previous_price
    ? Math.abs(Math.round(((property.price - property.previous_price) / property.previous_price) * 100))
    : null;

  // Demand surge detection
  const demandHigh = (property.demand_score ?? 0) >= 70;

  const locationText = property.city || property.state || property.location || '—';

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={cn(
        'group relative flex flex-col cursor-pointer',
        'rounded-2xl overflow-hidden',
        'bg-card border border-border/60',
        'shadow-sm hover:shadow-[0_8px_30px_-10px_hsl(var(--primary)/0.12)]',
        'hover:border-primary/25 hover:-translate-y-0.5',
        'transition-all duration-400 ease-out',
        property.opportunity_score && property.opportunity_score >= 85 &&
          'ring-1 ring-chart-2/20',
      )}
    >
      {/* ── IMAGE ── */}
      <div className="relative h-[140px] sm:h-[160px] overflow-hidden" onClick={() => navigate(`/properties/${property.id}`)}>
        {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
        <img
          src={imageUrl}
          alt={property.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700',
            !imgLoaded && 'opacity-0',
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Opportunity Score Ring */}
        {property.opportunity_score && property.opportunity_score > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <OpportunityScoreRing score={property.opportunity_score} size={38} />
          </div>
        )}

        {/* Signal badges overlay */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {/* Price drop badge */}
          {priceDropped && priceDropPercent && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-2/90 text-white text-[10px] font-bold backdrop-blur-sm shadow-sm">
              <TrendingDown className="h-3 w-3" />
              {priceDropPercent}% Price Drop
            </div>
          )}

          {/* Demand surge badge */}
          {demandHigh && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-bold backdrop-blur-sm shadow-sm">
              <Flame className="h-3 w-3" />
              High Demand
            </div>
          )}
        </div>
      </div>

      {/* ── INFO ── */}
      <div className="flex flex-col flex-1 p-3" onClick={() => navigate(`/properties/${property.id}`)}>
        <h3 className="text-[13px] sm:text-sm font-semibold text-foreground leading-snug truncate">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{locationText}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2.5 mt-2 text-[10px] sm:text-xs text-muted-foreground">
          {property.bedrooms != null && property.bedrooms > 0 && (
            <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>
          )}
          {property.area_sqm != null && (
            <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" />{property.area_sqm}m²</span>
          )}
        </div>

        {/* Price + AI fair value */}
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm sm:text-base font-bold text-foreground leading-none tracking-tight">
              {formatPrice(property.price)}
            </p>
            {priceChanged && property.previous_price && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatPrice(property.previous_price)}
              </span>
            )}
          </div>
          {property.ai_estimated_price && property.ai_estimated_price > property.price && (
            <p className="flex items-center gap-0.5 mt-0.5 text-[10px] text-chart-2 font-medium">
              <TrendingUp className="h-2.5 w-2.5" />
              {Math.round(((property.ai_estimated_price - property.price) / property.price) * 100)}% below AI fair value
            </p>
          )}
        </div>
      </div>

      {/* ── ACTION ROW ── */}
      <div className="flex items-center gap-1.5 px-3 pb-3 pt-0">
        {/* Remove from watchlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(property.id); }}
          aria-label="Remove from watchlist"
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium',
            'bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors',
          )}
        >
          <Heart className="h-3 w-3 fill-current" />
          Unsave
        </button>

        {/* Quick inquiry */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onInquiry) onInquiry(property.id);
            else navigate(`/properties/${property.id}?inquiry=true`);
          }}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium',
            'bg-primary/10 text-primary hover:bg-primary/20 transition-colors',
          )}
        >
          <MessageSquare className="h-3 w-3" />
          Inquire
        </button>

        {/* View details */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property.id}`); }}
          className="ml-auto flex items-center gap-0.5 text-[10px] sm:text-xs font-medium text-primary group-hover:gap-1.5 transition-all"
        >
          Details
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </motion.article>
  );
});

WatchlistPropertyCard.displayName = 'WatchlistPropertyCard';
export default WatchlistPropertyCard;
