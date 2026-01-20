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
      className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
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
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {property.wna_eligible && (
            <Badge className="bg-blue-500/90 text-white text-[10px] px-1.5 py-0.5">
              <Globe className="h-2.5 w-2.5 mr-0.5" />
              WNA
            </Badge>
          )}
          {property.is_featured && (
            <Badge className="bg-amber-500/90 text-white text-[10px] px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 mr-0.5" />
              Featured
            </Badge>
          )}
          {property.investor_highlight && (
            <Badge className="bg-emerald-500/90 text-white text-[10px] px-1.5 py-0.5">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              Investor Pick
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-primary/90 text-primary-foreground font-bold text-xs px-2 py-1">
            {formatPrice(property.price)}
          </Badge>
        </div>

        {/* Listing Type */}
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 capitalize">
            {property.listing_type || 'sale'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3">
        <h4 className="font-semibold text-sm truncate text-foreground">
          {property.title}
        </h4>
        
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs truncate">
            {property.city || property.location || 'Indonesia'}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.bathrooms}
            </span>
          )}
          {property.area_sqm && (
            <span className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              {property.area_sqm}m²
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full" />
    <CardContent className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
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
    <Card>
      <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{description}</CardDescription>
          </div>
        </div>
        {viewAllPath && properties.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => navigate(viewAllPath)}
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                onClick={() => navigate(`/property/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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
    <div className="space-y-4">
      {/* Investor Type Badge */}
      {investorType && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${isWna ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-emerald-500 text-emerald-600 dark:text-emerald-400'}`}
          >
            <Globe className="h-3 w-3 mr-1" />
            {isWna ? 'Foreign Investor (WNA)' : 'Indonesian Investor (WNI)'}
          </Badge>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs h-auto p-0"
            onClick={() => navigate(isWna ? '/investor/wna' : '/investor/wni')}
          >
            View Investment Guide
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
        icon={isWna ? <Globe className="h-5 w-5 text-blue-500" /> : <Building2 className="h-5 w-5 text-primary" />}
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
          icon={<Star className="h-5 w-5 text-amber-500" />}
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
        icon={<Heart className="h-5 w-5 text-red-500" />}
      />
    </div>
  );
};

export default InvestorPropertiesSection;
