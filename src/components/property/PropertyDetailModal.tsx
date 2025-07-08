import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Bed, Bath, Square, Car, Home, Eye, Share2, Heart, Phone, MessageSquare, User, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseProperty } from "@/types/property";
import ScheduleSurveyModal from "@/components/ScheduleSurveyModal";

interface PropertyDetailModalProps {
  property: BaseProperty;
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
  onView3D?: (property: BaseProperty) => void;
}

const PropertyDetailModal = ({ 
  property, 
  isOpen, 
  onClose, 
  language,
  onView3D 
}: PropertyDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
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
    const imageUrls = property.image_urls || property.images || [];
    if (!imageUrls.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === imageUrls.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? imageUrls.length - 1 : prev - 1
      );
    }
  };

  const imageUrls = property.image_urls || property.images || [];

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-2 lg:p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop - blocks all interaction */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content - 95% of screen */}
      <div className="relative w-[95%] max-w-7xl h-[95vh] bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 scale-in-95 duration-300 z-[10002]"
        onClick={(e) => e.stopPropagation()}
      >
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

        {/* Content - Full Details with Related Properties */}
        <div className="overflow-y-auto h-[calc(90vh-120px)]">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Main Content - Left 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <img
                    src={imageUrls[currentImageIndex] || property.thumbnail_url || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Navigation */}
                  {imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={() => handleImageNavigation('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => handleImageNavigation('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all"
                      >
                        →
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {imageUrls.length}
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

                {/* Thumbnail Gallery */}
                {imageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Title and Price */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-3">{property.title}</h1>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {formatPrice(property.price)}
                    {property.listing_type === 'rent' && (
                      <span className="text-xl font-normal text-muted-foreground">/month</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
              </div>

              {/* Property Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-xl">
                    <Bed className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">{currentText.bedrooms}</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-xl">
                    <Bath className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">{currentText.bathrooms}</div>
                  </div>
                )}
                {property.area_sqm && (
                  <div className="text-center p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-xl">
                    <Square className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.area_sqm}</div>
                    <div className="text-sm text-muted-foreground">{currentText.area}</div>
                  </div>
                )}
                {property.property_features?.parking && (
                  <div className="text-center p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-xl">
                    <Car className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.property_features.parking}</div>
                    <div className="text-sm text-muted-foreground">{currentText.parking}</div>
                  </div>
                )}
              </div>

              {/* Full Description */}
              {property.description && (
                <div className="bg-gray-50/70 dark:bg-gray-800/70 rounded-xl p-6">
                  <h2 className="font-bold text-xl mb-4">{currentText.description}</h2>
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="text-muted-foreground leading-relaxed text-lg">{property.description}</p>
                  </div>
                </div>
              )}

              {/* All Features */}
              {property.property_features && (
                <div className="bg-gray-50/70 dark:bg-gray-800/70 rounded-xl p-6">
                  <h2 className="font-bold text-xl mb-4">{currentText.features}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(property.property_features)
                      .filter(([key, value]) => value)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                          <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Right column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Actions */}
              <div className="sticky top-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-lg">Contact Agent</h3>
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowSurveyModal(true)}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Survey
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="lg" className="flex-1">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Property Owner/Agent Info */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Listed By</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Real Estate Agent</div>
                    <div className="text-sm text-muted-foreground">Licensed Professional</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Related Properties Section */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/30">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Related Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for related properties - will be populated with actual data */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 space-y-3">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Same Owner Properties Section */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">More from this Agent</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for same owner properties */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 space-y-3">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Booking Modal */}
      <ScheduleSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        propertyTitle={property.title}
        agentName="Real Estate Agent"
      />
    </div>
  );
};

export default PropertyDetailModal;
