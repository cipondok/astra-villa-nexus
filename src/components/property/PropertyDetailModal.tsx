import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Bed, Bath, Square, Car, Home, Eye, Share2, Heart, Phone, MessageSquare, User, Calendar, Tag, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseProperty } from "@/types/property";
import ScheduleSurveyModal from "@/components/ScheduleSurveyModal";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import SharePropertyButton from "./SharePropertyButton";
import { useTranslation } from "@/i18n/useTranslation";

interface PropertyDetailModalProps {
  property: BaseProperty;
  isOpen: boolean;
  onClose: () => void;
  language?: "en" | "id" | "zh" | "ja" | "ko";
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
  const { getPropertyImage } = useDefaultPropertyImage();
  const { t } = useTranslation();

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
      case 'sale': return t('propertyDetail.forSale');
      case 'rent': return t('propertyDetail.forRent');
      case 'lease': return t('propertyDetail.forLease');
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
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-[95%] max-w-7xl h-[95vh] bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-lg border border-border overflow-hidden animate-in fade-in-0 scale-in-95 duration-300 z-[10002]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Button onClick={handleBackToHome} variant="outline" size="sm" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t('propertyDetail.backToHome')}
          </Button>
          
          <div className="flex items-center gap-2">
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button onClick={handleView3D} variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t('propertyDetail.view3D')}
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(90vh-120px)]">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <img
                    src={imageUrls[currentImageIndex] || getPropertyImage(property.images, property.thumbnail_url)}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {imageUrls.length > 1 && (
                    <>
                      <button onClick={() => handleImageNavigation('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/60 transition-all">←</button>
                      <button onClick={() => handleImageNavigation('next')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/60 transition-all">→</button>
                      <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {imageUrls.length}
                      </div>
                    </>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={`font-bold px-2.5 py-1 rounded-md shadow-md border-0 flex items-center gap-1 backdrop-blur-sm ${property.listing_type === 'sale' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'}`}>
                      {property.listing_type === 'sale' ? <Tag className="h-3.5 w-3.5" /> : <Key className="h-3.5 w-3.5" />}
                      {getListingTypeLabel(property.listing_type)}
                    </Badge>
                  </div>
                </div>
                {imageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {imageUrls.map((url, index) => (
                      <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-primary' : 'border-transparent'}`}>
                        <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title and Price */}
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-primary/5 border border-primary/10 rounded-xl">
                    <Bed className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">{t('propertyDetail.bedrooms')}</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-primary/5 border border-primary/10 rounded-xl">
                    <Bath className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">{t('propertyDetail.bathrooms')}</div>
                  </div>
                )}
                {property.area_sqm && (
                  <div className="text-center p-4 bg-primary/5 border border-primary/10 rounded-xl">
                    <Square className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.area_sqm}</div>
                    <div className="text-sm text-muted-foreground">{t('propertyDetail.area')}</div>
                  </div>
                )}
                {property.property_features?.parking && (
                  <div className="text-center p-4 bg-primary/5 border border-primary/10 rounded-xl">
                    <Car className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{property.property_features.parking}</div>
                    <div className="text-sm text-muted-foreground">{t('propertyDetail.parking')}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-muted/30 border border-border rounded-xl p-6">
                  <h2 className="font-bold text-xl mb-4">{t('propertyDetail.description')}</h2>
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="text-muted-foreground leading-relaxed text-lg">{property.description}</p>
                  </div>
                </div>
              )}

              {/* Features */}
              {property.property_features && (
                <div className="bg-muted/30 border border-border rounded-xl p-6">
                  <h2 className="font-bold text-xl mb-4">{t('propertyDetail.features')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(property.property_features)
                      .filter(([key, value]) => value)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-lg">
                          <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-6 bg-card/80 backdrop-blur-xl rounded-xl p-6 space-y-4 border border-border">
                <h3 className="font-bold text-lg">{t('propertyDetail.contact')}</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    {t('propertyDetail.callNow')}
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {t('propertyDetail.sendMessage')}
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" onClick={() => setShowSurveyModal(true)}>
                    <Calendar className="h-5 w-5 mr-2" />
                    {t('propertyDetail.scheduleSurvey')}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="lg" className="flex-1">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <SharePropertyButton
                      propertyId={property.id}
                      propertyTitle={property.title}
                      propertyPrice={property.price}
                      propertyLocation={property.location}
                      variant="button"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-xl rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-4">{t('propertyDetail.listedBy')}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('propertyDetail.realEstateAgent')}</div>
                    <div className="text-sm text-muted-foreground">{t('propertyDetail.licensedProfessional')}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  {t('propertyDetail.viewProfile')}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-card/30">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{t('propertyDetail.relatedProperties')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                    <div className="aspect-[4/3] bg-muted rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-card/20">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{t('propertyDetail.moreFromAgent')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                    <div className="aspect-[4/3] bg-muted rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScheduleSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        propertyTitle={property.title}
        agentName={t('propertyDetail.realEstateAgent')}
      />
    </div>
  );
};

export default PropertyDetailModal;
