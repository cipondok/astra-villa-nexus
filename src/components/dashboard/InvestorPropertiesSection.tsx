import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useInvestorProperties, 
  useFeaturedInvestorProperties, 
  useSavedInvestorProperties,
  InvestorProperty 
} from '@/hooks/useInvestorProperties';
import { useInvestorProfile } from '@/hooks/useInvestorProfile';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Star, 
  Globe,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PropertyCardProps {
  property: InvestorProperty;
  onClick: () => void;
}

const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toFixed(1)}M`;
    }
    if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(0)}Jt`;
    }
    return `Rp ${price.toLocaleString()}`;
  };

  const getImageUrl = () => {
    if (property.thumbnail_url) return property.thumbnail_url;
    if (property.image_urls && property.image_urls.length > 0) return property.image_urls[0];
    return '/placeholder.svg';
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden bg-white/70 dark:bg-white/5 border-2 border-border/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={getImageUrl()} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-0.5">
          {property.wna_eligible && (
            <Badge className="bg-blue-500/90 text-white text-[8px] px-1 py-0.5">
              <Globe className="h-2 w-2 mr-0.5" />
              WNA
            </Badge>
          )}
          {property.is_featured && (
            <Badge className="bg-amber-500/90 text-white text-[8px] px-1 py-0.5">
              <Star className="h-2 w-2 mr-0.5" />
              Featured
            </Badge>
          )}
          {property.investor_highlight && (
            <Badge className="bg-emerald-500/90 text-white text-[8px] px-1 py-0.5">
              <Sparkles className="h-2 w-2 mr-0.5" />
              Pick
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-1.5 left-1.5">
          <Badge className="bg-primary/90 text-primary-foreground font-bold text-[10px] px-1.5 py-0.5">
            {formatPrice(property.price)}
          </Badge>
        </div>

        {/* Listing Type */}
        <div className="absolute bottom-1.5 right-1.5">
          <Badge variant="secondary" className="text-[8px] px-1 py-0.5 capitalize bg-white/80 dark:bg-black/50">
            {property.listing_type || 'sale'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-2">
        <h4 className="font-semibold text-xs truncate text-foreground">
          {property.title}
        </h4>
        
        <div className="flex items-center gap-1 mt-0.5 text-foreground/70">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
          <span className="text-[10px] truncate">
            {property.city || property.location || 'Indonesia'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-foreground/60">
          {property.bedrooms && (
            <span className="flex items-center gap-0.5">
              <Bed className="h-2.5 w-2.5" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-0.5">
              <Bath className="h-2.5 w-2.5" />
              {property.bathrooms}
            </span>
          )}
          {property.area_sqm && (
            <span className="flex items-center gap-0.5">
              <Square className="h-2.5 w-2.5" />
              {property.area_sqm}m²
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden bg-white/70 dark:bg-white/5 border-2 border-border/50">
    <Skeleton className="aspect-[4/3] w-full" />
    <CardContent className="p-2 space-y-1.5">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2.5 w-1/2" />
      <Skeleton className="h-2.5 w-2/3" />
    </CardContent>
  </Card>
);

interface PropertySectionProps {
  title: string;
  description: string;
  properties: InvestorProperty[];
  isLoading: boolean;
  emptyMessage: string;
  viewAllPath?: string;
  icon?: React.ReactNode;
}

const PropertySection = ({ 
  title, 
  description, 
  properties, 
  isLoading, 
  emptyMessage,
  viewAllPath,
  icon
}: PropertySectionProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white/50 dark:bg-white/5 border-2 border-border/50 backdrop-blur-sm">
      <CardHeader className="p-2.5 sm:p-3 pb-1.5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>
            <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">{title}</CardTitle>
            <CardDescription className="text-[9px] sm:text-[10px] text-foreground/60">{description}</CardDescription>
          </div>
        </div>
        {viewAllPath && properties.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] h-6 px-2 text-primary hover:text-primary/80"
            onClick={() => navigate(viewAllPath)}
          >
            View All
            <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-2.5 sm:p-3 pt-0">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                onClick={() => navigate(`/property/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-foreground/30" />
            <p className="text-[10px] sm:text-xs text-foreground/50">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const InvestorPropertiesSection = () => {
  const navigate = useNavigate();
  const { data: investorProfile, isLoading: profileLoading } = useInvestorProfile();
  
  // Fetch properties based on investor type
  const { data: recommendedProperties = [], isLoading: recommendedLoading } = useInvestorProperties({ 
    limit: 4 
  });
  
  // Fetch featured properties
  const { data: featuredProperties = [], isLoading: featuredLoading } = useFeaturedInvestorProperties(4);
  
  // Fetch saved properties
  const { data: savedProperties = [], isLoading: savedLoading } = useSavedInvestorProperties(4);

  const investorType = investorProfile?.investor_type;
  const isWna = investorType === 'wna';

  return (
    <div className="space-y-3">
      {/* Investor Type Badge */}
      {investorType && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={`text-[10px] px-2 py-0.5 ${isWna ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'}`}
          >
            <Globe className="h-2.5 w-2.5 mr-1" />
            {isWna ? 'Foreign Investor (WNA)' : 'Indonesian Investor (WNI)'}
          </Badge>
          <Button 
            variant="link" 
            size="sm" 
            className="text-[10px] h-auto p-0 text-primary"
            onClick={() => navigate(isWna ? '/investor/wna' : '/investor/wni')}
          >
            View Investment Guide →
          </Button>
        </div>
      )}

      {/* Recommended Properties for Investor */}
      <PropertySection
        title={isWna ? 'WNA-Eligible Properties' : 'Recommended Properties'}
        description={isWna ? 'Properties available for foreign nationals' : 'Based on your investment preferences'}
        properties={recommendedProperties}
        isLoading={recommendedLoading || profileLoading}
        emptyMessage={isWna ? 'No WNA-eligible properties available' : 'No recommendations yet. Update your preferences!'}
        viewAllPath="/dijual"
        icon={isWna ? <Globe className="h-4 w-4 text-blue-500" /> : <Building2 className="h-4 w-4 text-primary" />}
      />

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <PropertySection
          title="Featured Investment Properties"
          description="Premium properties highlighted for investors"
          properties={featuredProperties}
          isLoading={featuredLoading}
          emptyMessage="No featured properties available"
          viewAllPath="/dijual"
          icon={<Star className="h-4 w-4 text-amber-500" />}
        />
      )}

      {/* Saved Properties */}
      <PropertySection
        title="Your Saved Properties"
        description="Properties you've saved for later"
        properties={savedProperties}
        isLoading={savedLoading}
        emptyMessage="No saved properties yet. Start browsing!"
        viewAllPath="/saved"
        icon={<Heart className="h-4 w-4 text-red-500" />}
      />
    </div>
  );
};

export default InvestorPropertiesSection;
