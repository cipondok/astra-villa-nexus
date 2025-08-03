import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import { ArrowLeft, MapPin, Bed, Bath, Square, Eye, X } from 'lucide-react';

const PropertyComparison = () => {
  const navigate = useNavigate();
  const { selectedProperties, removeFromComparison, clearComparison } = usePropertyComparison();

  if (selectedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">No Properties to Compare</h1>
            <p className="text-muted-foreground mb-8">
              Add properties to your comparison list to see detailed side-by-side analysis
            </p>
            <Button onClick={() => navigate('/dijual')}>
              Browse Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `IDR ${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `IDR ${(price / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (property: any) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    return "/placeholder.svg";
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  // Find min/max values for highlighting
  const prices = selectedProperties.map(p => p.price);
  const areas = selectedProperties.map(p => p.area_sqm || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minArea = Math.min(...areas.filter(a => a > 0));
  const maxArea = Math.max(...areas);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Property Comparison</h1>
              <p className="text-muted-foreground">
                Comparing {selectedProperties.length} properties side by side
              </p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={clearComparison}
          >
            Clear All
          </Button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {selectedProperties.map((property) => (
            <Card key={property.id} className="relative">
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                onClick={() => removeFromComparison(property.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Property Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                <img
                  src={getImageUrl(property)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Listing Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant={property.listing_type === 'sale' ? 'default' : 'secondary'}
                    className="bg-background/90 backdrop-blur-sm"
                  >
                    {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Title & Location */}
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </div>
                </div>

                {/* Price */}
                <div 
                  className={`text-xl font-bold ${
                    property.price === minPrice ? 'text-green-600' : 
                    property.price === maxPrice ? 'text-orange-600' : 
                    'text-foreground'
                  }`}
                >
                  {formatPrice(property.price)}
                  {property.listing_type === 'rent' && (
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  )}
                  {property.price === minPrice && <Badge variant="outline" className="ml-2 text-green-600">Lowest</Badge>}
                  {property.price === maxPrice && <Badge variant="outline" className="ml-2 text-orange-600">Highest</Badge>}
                </div>

                <Separator />

                {/* Property Details */}
                <div className="space-y-3">
                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-2 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Area */}
                  {property.area_sqm && (
                    <div 
                      className={`flex items-center gap-2 ${
                        property.area_sqm === minArea ? 'text-orange-600' : 
                        property.area_sqm === maxArea ? 'text-green-600' : 
                        'text-foreground'
                      }`}
                    >
                      <Square className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {property.area_sqm} m²
                        {property.area_sqm === minArea && <Badge variant="outline" className="ml-2 text-orange-600">Smallest</Badge>}
                        {property.area_sqm === maxArea && <Badge variant="outline" className="ml-2 text-green-600">Largest</Badge>}
                      </span>
                    </div>
                  )}

                  {/* Property Type */}
                  {property.property_type && (
                    <div className="text-sm text-muted-foreground capitalize">
                      Type: {property.property_type}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => handlePropertyClick(property.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                  
                  {(property.three_d_model_url || property.virtual_tour_url) && (
                    <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                      3D Tour Available
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Summary */}
        {selectedProperties.length > 1 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Price Range</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Difference: {formatPrice(maxPrice - minPrice)}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Area Range</h4>
                  <p className="text-sm text-muted-foreground">
                    {minArea}m² - {maxArea}m²
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Difference: {maxArea - minArea}m²
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Best Value</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on price per m²
                  </p>
                  {(() => {
                    const pricePerSqm = selectedProperties
                      .filter(p => p.area_sqm && p.area_sqm > 0)
                      .map(p => ({
                        title: p.title,
                        pricePerSqm: p.price / (p.area_sqm || 1)
                      }))
                      .sort((a, b) => a.pricePerSqm - b.pricePerSqm);
                    
                    return pricePerSqm.length > 0 ? (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        {pricePerSqm[0].title.split(' ').slice(0, 3).join(' ')}...
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Insufficient data
                      </p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertyComparison;