import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import { BarChart3, X, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';

const PropertyComparisonPanel = () => {
  const { selectedProperties, removeFromComparison, clearComparison } = usePropertyComparison();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { getPropertyImage } = useDefaultPropertyImage();

  if (selectedProperties.length === 0) return null;

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
    return getPropertyImage(property.images, property.thumbnail_url, property.image_urls);
  };

  const handleViewComparison = () => {
    setIsOpen(false);
    navigate('/property-comparison');
  };

  return (
    <>
      {/* Floating Comparison Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg relative">
              <BarChart3 className="h-5 w-5 mr-2" />
              Compare
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground"
              >
                {selectedProperties.length}
              </Badge>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-full sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Property Comparison</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearComparison}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {/* Selected Properties */}
              <div className="space-y-3">
                {selectedProperties.map((property) => (
                  <Card key={property.id} className="relative">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={getImageUrl(property)}
                          alt={property.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{property.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{property.location}</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(property.price)}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeFromComparison(property.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full"
                  onClick={handleViewComparison}
                  disabled={selectedProperties.length < 2}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Comparison
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  {selectedProperties.length < 2 
                    ? "Add at least 2 properties to compare"
                    : `Comparing ${selectedProperties.length} properties`
                  }
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default PropertyComparisonPanel;