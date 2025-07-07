import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, ZoomIn, RotateCw, Download, Maximize } from 'lucide-react';

interface EnhancedImageGalleryProps {
  images: string[];
  title: string;
  propertyType?: string;
  listingType?: string;
}

const EnhancedImageGallery = ({ images, title, propertyType, listingType }: EnhancedImageGalleryProps) => {
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

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative group">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
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
            
            {/* Property Type Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              {listingType && (
                <Badge 
                  variant={listingType === 'sale' ? 'default' : 'secondary'}
                  className="bg-black/70 text-white backdrop-blur-sm"
                >
                  {listingType === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              )}
              {propertyType && (
                <Badge variant="outline" className="bg-black/70 text-white border-white/20 backdrop-blur-sm capitalize">
                  {propertyType}
                </Badge>
              )}
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-black/70 text-white backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </Badge>
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