
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Bed, Bath, Square, Car, Home, Eye, Share2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  listing_type: string;
  image_urls?: string[];
  description?: string;
  property_features?: any;
  three_d_model_url?: string;
  virtual_tour_url?: string;
}

interface PropertyDetailModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
  onView3D?: (property: Property) => void;
}

const PropertyDetailModal = ({ 
  property, 
  isOpen, 
  onClose, 
  language,
  onView3D 
}: PropertyDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const text = {
    en: {
      backToHome: "Back to Home",
      view3D: "3D View",
      share: "Share",
      save: "Save",
      description: "Description",
      features: "Features",
      contact: "Contact Agent",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area",
      parking: "Parking",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease"
    },
    id: {
      backToHome: "Kembali ke Beranda",
      view3D: "Tampilan 3D",
      share: "Bagikan",
      save: "Simpan",
      description: "Deskripsi",
      features: "Fitur",
      contact: "Hubungi Agen",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas",
      parking: "Parkir",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return currentText.forSale;
      case 'rent': return currentText.forRent;
      case 'lease': return currentText.forLease;
      default: return type;
    }
  };

  const handleBackToHome = () => {
    onClose();
    navigate('/');
  };

  const handleView3D = () => {
    if (onView3D) {
      onView3D(property);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!property.image_urls?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.image_urls!.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.image_urls!.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 scale-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <Button
            onClick={handleBackToHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {currentText.backToHome}
          </Button>
          
          <div className="flex items-center gap-2">
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button
                onClick={handleView3D}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {currentText.view3D}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src={property.image_urls?.[currentImageIndex] || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {property.image_urls && property.image_urls.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
                    >
                      →
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {property.image_urls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Property Type Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {getListingTypeLabel(property.listing_type)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{property.title}</h2>
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(property.price)}
                  {property.listing_type === 'rent' && (
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">{currentText.bedrooms}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">{currentText.bathrooms}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                  <Square className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{property.area_sqm} sqm</div>
                    <div className="text-sm text-muted-foreground">{currentText.area}</div>
                  </div>
                </div>
                {property.property_features?.parking && (
                  <div className="flex items-center gap-2 p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.property_features.parking}</div>
                      <div className="text-sm text-muted-foreground">{currentText.parking}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">{currentText.description}</h3>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Features */}
              {property.property_features && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">{currentText.features}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(property.property_features)
                      .filter(([key, value]) => value && key !== 'parking')
                      .map(([key, value]) => (
                        <Badge key={key} variant="outline" className="capitalize">
                          {key.replace('_', ' ')}: {String(value)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1">
                  {currentText.contact}
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
