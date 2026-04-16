/**
 * Luxury Property Card
 * Premium-grade property card for high-net-worth investors
 */

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize, TrendingUp, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLuxuryMicrocopy } from '@/hooks/useLuxuryMicrocopy';
import { useGeoPersonalization } from '@/hooks/useGeoPersonalization';
import { useNavigate } from 'react-router-dom';

interface LuxuryPropertyCardProps {
  property: {
    propertyId: string;
    title: string;
    location: string;
    price: number;
    imageUrl: string;
    propertyType: string;
    score: number;
    reasons: string[];
    category: string;
  };
  rank?: number;
  onInteraction?: (id: string, type: 'click' | 'save') => void;
  className?: string;
}

const LuxuryPropertyCard = memo(({ property, rank, onInteraction, className }: LuxuryPropertyCardProps) => {
  const copy = useLuxuryMicrocopy();
  const { formatPrice } = useGeoPersonalization();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onInteraction?.(property.propertyId, 'click');
    navigate(`/property/${property.propertyId}`);
  };

  const scoreColor = property.score >= 80 ? 'text-emerald-400' : property.score >= 60 ? 'text-amber-400' : 'text-muted-foreground';

  return (
    <motion.div
      className={cn(
        'group relative rounded-xl overflow-hidden cursor-pointer',
        'bg-card border border-border/30',
        'hover:border-primary/40 transition-all duration-500',
        'hover:shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.2)]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      layout
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.imageUrl || '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {rank && rank <= 3 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              #{rank}
            </span>
          )}
          {property.score >= 80 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              High ROI
            </span>
          )}
        </div>

        {/* Trust badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full bg-black/50 text-white/80 text-[10px] font-medium backdrop-blur-sm flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Escrow Protected
          </span>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium mb-0.5">
            {copy.label('price')}
          </p>
          <p className="text-white text-lg font-semibold tracking-tight">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {property.location}
          </p>
        </div>

        {/* AI Match Score */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className={cn('text-xs font-semibold', scoreColor)}>
              {property.score}% Match
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {property.propertyType}
          </span>
        </div>

        {/* Recommendation reason */}
        {property.reasons.length > 0 && (
          <p className="text-[11px] text-primary/70 italic line-clamp-1">
            {property.reasons[0]}
          </p>
        )}
      </div>
    </motion.div>
  );
});

LuxuryPropertyCard.displayName = 'LuxuryPropertyCard';

export default LuxuryPropertyCard;
