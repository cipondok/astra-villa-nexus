import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, MapPin, Bed, DollarSign, Sparkles, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Price from '@/components/ui/Price';
import { useTrendingProperties, useTopROIDeals } from '@/hooks/usePropertyRecommendations';
import OptimizedPropertyImage from '@/components/property/OptimizedPropertyImage';
import { BaseProperty } from '@/types/property';
import { cn } from '@/lib/utils';

interface TrendingROIDealsProps {
  onPropertyClick?: (property: BaseProperty) => void;
  className?: string;
}

const PropertyCard = memo(function PropertyCard({
  property,
  badge,
  badgeColor,
  onClick,
}: {
  property: any;
  badge: string;
  badgeColor: string;
  onClick: () => void;
}) {
  const img = property.thumbnail_url || (property.images && property.images[0]) || '/placeholder.svg';

  return (
    <div
      className="flex-shrink-0 w-[180px] sm:w-[240px] rounded-xl border border-border/50 overflow-hidden bg-card hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <OptimizedPropertyImage
          src={img}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={cn('absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md', badgeColor)}>
          {badge}
        </div>
        {property.investment_score && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-border/30">
            📊 {property.investment_score}
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-1.5">
        <div className="text-sm font-bold text-foreground">
          <Price amount={property.price} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{property.title}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5" /> {property.city}
          </span>
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-0.5">
              <Bed className="h-2.5 w-2.5" /> {property.bedrooms}
            </span>
          )}
        </div>
        {property.expected_roi && (
          <div className="flex items-center gap-1 text-chart-1 text-[10px] font-semibold">
            <DollarSign className="h-2.5 w-2.5" />
            ROI {property.expected_roi}%
            {property.risk_level && (
              <Badge variant="outline" className="text-[8px] h-3.5 ml-auto">
                {property.risk_level}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const SectionSkeleton = () => (
  <div className="flex gap-3 overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[180px] sm:w-[240px] rounded-xl border border-border/50 overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <div className="p-2.5 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const TrendingROIDeals = memo(function TrendingROIDeals({ onPropertyClick, className }: TrendingROIDealsProps) {
  const navigate = useNavigate();
  const { data: trending, isLoading: trendingLoading } = useTrendingProperties(6);
  const { data: roiDeals, isLoading: roiLoading } = useTopROIDeals(6);

  const handleClick = (property: any) => {
    if (onPropertyClick) {
      onPropertyClick(property as BaseProperty);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const hasROI = roiDeals && roiDeals.length > 0;
  const hasTrending = trending && trending.length > 0;

  if (!trendingLoading && !roiLoading && !hasROI && !hasTrending) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Top ROI Deals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-chart-1" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">Top ROI Deals</h2>
            <Badge variant="outline" className="text-[10px] bg-chart-1/5 border-chart-1/20 text-chart-1 gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={() => navigate('/deal-finder')}
          >
            See All <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {roiLoading ? (
          <SectionSkeleton />
        ) : hasROI ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {roiDeals!.map((property: any) => (
              <PropertyCard
                key={property.id}
                property={property}
                badge={property.expected_roi ? `${property.expected_roi}% ROI` : `Score ${property.investment_score}`}
                badgeColor="bg-chart-1/90"
                onClick={() => handleClick(property)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Trending Properties */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-chart-3" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">Trending Properties</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={() => navigate('/properties')}
          >
            See All <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {trendingLoading ? (
          <SectionSkeleton />
        ) : hasTrending ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trending!.map((property: any) => (
              <PropertyCard
                key={property.id}
                property={property}
                badge="🔥 Trending"
                badgeColor="bg-chart-3/90"
                onClick={() => handleClick(property)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default TrendingROIDeals;
