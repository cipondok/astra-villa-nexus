import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, MapPin, Bed, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Price from '@/components/ui/Price';
import { usePropertyRecommendations } from '@/hooks/usePropertyRecommendations';
import OptimizedPropertyImage from '@/components/property/OptimizedPropertyImage';

interface NearbyInvestmentsProps {
  propertyId: string;
}

const NearbyInvestments = memo(function NearbyInvestments({ propertyId }: NearbyInvestmentsProps) {
  const navigate = useNavigate();
  const { data: investments, isLoading } = usePropertyRecommendations(propertyId, 'nearby_investment', 6);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-chart-1" />
          <h2 className="text-sm sm:text-lg font-bold text-foreground">Nearby Investment Opportunities</h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[220px] rounded-xl border border-border/50 overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="p-2.5 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!investments || investments.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-chart-1" />
        <h2 className="text-sm sm:text-lg font-bold text-foreground">Nearby Investment Opportunities</h2>
        <Badge variant="outline" className="text-[10px] bg-chart-1/5 border-chart-1/20 text-chart-1">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI Picked
        </Badge>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {investments.map((property) => {
          const img = property.thumbnail_url || (property.images && property.images[0]) || '/placeholder.svg';

          return (
            <div
              key={property.id}
              className="flex-shrink-0 w-[160px] sm:w-[220px] rounded-xl border border-border/50 overflow-hidden bg-card hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <OptimizedPropertyImage
                  src={img}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {property.investment_score && (
                  <div className="absolute top-2 right-2 bg-chart-1/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    Score {property.investment_score}
                  </div>
                )}
              </div>

              <div className="p-2.5 space-y-1">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default NearbyInvestments;
