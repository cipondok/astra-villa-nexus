import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, ZoomIn, RotateCw, Download, Maximize, Eye, Home, Clock, Camera, Building2, Key, MapPin, Bed, Bath, Square } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface EnhancedImageGalleryProps {
  images: string[];
  title: string;
  propertyType?: string;
  listingType?: string;
  createdAt?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  location?: string;
}

const EnhancedImageGallery = ({ 
  images, 
  title, 
  propertyType, 
  listingType,
  createdAt,
  bedrooms,
  bathrooms,
  areaSqm,
  location 
}: EnhancedImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-lg mb-2">📷</div>
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = images[currentImageIndex];
    link.download = `${title}-image-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentImage = images[currentImageIndex];

  const getPropertyTypeIcon = () => {
    switch (propertyType?.toLowerCase()) {
      case 'apartment':
        return Building2;
      case 'house':
      case 'villa':
        return Home;
      default:
        return Home;
    }
  };

  const PropertyIcon = getPropertyTypeIcon();

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative group">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl sm:rounded-2xl bg-muted">
            {imageError[currentImageIndex] ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground text-xl mb-2">🖼️</div>
                  <p className="text-muted-foreground">Image unavailable</p>
                </div>
              </div>
            ) : (
              <img
                src={currentImage}
                alt={`${title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => handleImageError(currentImageIndex)}
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            
            {/* View Icon on Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md flex items-center justify-center shadow-lg border border-primary/20">
                <Eye className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
            
            {/* Top Left - Listing Type Badge */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-2">
              {listingType && (
                <Badge 
                  className={`text-[10px] sm:text-xs px-2.5 py-1 font-bold shadow-lg border ${
                    listingType === 'sale' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/50' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400/50'
                  }`}
                >
                  {listingType === 'sale' ? (
                    <>
                      <Key className="h-3 w-3 mr-1" />
                      Dijual
                    </>
                  ) : (
                    <>
                      <Home className="h-3 w-3 mr-1" />
                      Disewa
                    </>
                  )}
                </Badge>
              )}
              {propertyType && (
                <Badge variant="outline" className="bg-white/80 dark:bg-black/70 backdrop-blur-md border-white/40 dark:border-white/20 text-foreground px-2 py-1 text-[10px] sm:text-xs capitalize">
                  <PropertyIcon className="h-3 w-3 mr-1" />
                  {propertyType}
                </Badge>
              )}
            </div>

            {/* Top Right - Image Counter & Camera Icon */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <Badge className="bg-black/60 text-white backdrop-blur-md border-0 px-2.5 py-1 text-xs">
                <Camera className="h-3 w-3 mr-1" />
                {currentImageIndex + 1} / {images.length}
              </Badge>
            </div>

            {/* Bottom Left - Property Info Overlay */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Property Stats */}
                {(bedrooms || bathrooms || areaSqm) && (
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-lg px-2.5 py-1.5">
                    {bedrooms && (
                      <span className="flex items-center gap-1 text-white text-xs">
                        <Bed className="h-3 w-3" />
                        {bedrooms}
                      </span>
                    )}
                    {bathrooms && (
                      <span className="flex items-center gap-1 text-white text-xs">
                        <Bath className="h-3 w-3" />
                        {bathrooms}
                      </span>
                    )}
                    {areaSqm && (
                      <span className="flex items-center gap-1 text-white text-xs">
                        <Square className="h-3 w-3" />
                        {areaSqm}m²
                      </span>
                    )}
                  </div>
                )}
                
                {/* Time Ago */}
                {createdAt && (
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-lg px-2.5 py-1.5">
                    <Clock className="h-3 w-3 text-white/80" />
                    <span className="text-white/90 text-xs">
                      {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: id })}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Location */}
              {location && (
                <div className="flex items-center gap-1 text-white/90 text-xs sm:text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 border-white/20 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 border-white/20 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/70 border-white/20 text-white hover:bg-black/90"
                onClick={() => setShowFullscreen(true)}
              >
                <Maximize className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-black/70 border-white/20 text-white hover:bg-black/90"
                onClick={handleDownloadImage}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'ring-2 ring-primary scale-105' 
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <div className="w-20 h-16 rounded-md overflow-hidden bg-muted">
                  {imageError[index] ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">🖼️</span>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
          <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/70 border-white/20 text-white hover:bg-black/90"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-black/70 text-white backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </Badge>
            </div>

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              {imageError[currentImageIndex] ? (
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">🖼️</div>
                  <p>Image unavailable</p>
                </div>
              ) : (
                <img
                  src={currentImage}
                  alt={`${title} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={() => handleImageError(currentImageIndex)}
                />
              )}
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 border-white/20 text-white hover:bg-black/90"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 border-white/20 text-white hover:bg-black/90"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/70 border-white/20 text-white hover:bg-black/90"
                onClick={handleDownloadImage}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedImageGallery;