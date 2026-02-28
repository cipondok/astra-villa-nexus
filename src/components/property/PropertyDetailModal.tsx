import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, MapPin, Bed, Bath, Square, Car, Home, Eye, Share2, Heart, Phone, MessageSquare, User, Calendar, Tag, Key, Image as ImageIcon, Video, Sparkles, ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseProperty } from "@/types/property";
import ScheduleSurveyModal from "@/components/ScheduleSurveyModal";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import SharePropertyButton from "./SharePropertyButton";
import { useTranslation } from "@/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

// ─── VR Media Gallery Sub-Component ──────────────────────────────────────────
const VRMediaGallery = ({ property }: { property: BaseProperty }) => {
  const panoramas = property.panorama_360_urls || [];
  const stagingImages = property.ai_staging_images || [];
  const droneVideoUrl = property.drone_video_url;
  const hasAnyMedia = panoramas.length > 0 || stagingImages.length > 0 || !!droneVideoUrl;

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (panoramas.length > 0) return "panoramas";
    if (droneVideoUrl) return "drone";
    if (stagingImages.length > 0) return "staging";
    return "panoramas";
  });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!hasAnyMedia) return null;

  const currentImages = activeTab === "panoramas" ? panoramas : activeTab === "staging" ? stagingImages : [];

  const nav = (dir: "prev" | "next") => {
    if (currentImages.length === 0) return;
    setCarouselIndex((prev) =>
      dir === "next"
        ? prev === currentImages.length - 1 ? 0 : prev + 1
        : prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsVideoPlaying(true); }
    else { v.pause(); setIsVideoPlaying(false); }
  };

  const tabs: { value: string; label: string; icon: typeof ImageIcon; count: number }[] = [];
  if (panoramas.length > 0) tabs.push({ value: "panoramas", label: "360° Panorama", icon: ImageIcon, count: panoramas.length });
  if (droneVideoUrl) tabs.push({ value: "drone", label: "Drone Video", icon: Video, count: 1 });
  if (stagingImages.length > 0) tabs.push({ value: "staging", label: "AI Staging", icon: Sparkles, count: stagingImages.length });

  const isYouTube = droneVideoUrl?.includes("youtube.com") || droneVideoUrl?.includes("youtu.be");
  const getYTEmbed = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : url;
  };

  return (
    <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          VR Media Gallery
        </h2>
        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
          {tabs.reduce((s, t) => s + t.count, 0)} items
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCarouselIndex(0); }}>
        <div className="px-6 pb-3">
          <TabsList className="grid w-full bg-muted/50 rounded-lg h-9 p-0.5" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="text-[10px] opacity-70">({tab.count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {panoramas.length > 0 && (
          <TabsContent value="panoramas" className="m-0">
            <div className="relative aspect-[16/9]">
              <img src={panoramas[carouselIndex]} alt={`360° Panorama ${carouselIndex + 1}`} className="w-full h-full object-cover" />
              {panoramas.length > 1 && (
                <>
                  <button onClick={() => nav("prev")} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => nav("next")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70"><ChevronRight className="h-5 w-5" /></button>
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs">{carouselIndex + 1} / {panoramas.length}</div>
                </>
              )}
              <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs border-0"><ImageIcon className="h-3 w-3 mr-1" />360° View</Badge>
            </div>
            {panoramas.length > 1 && (
              <div className="flex gap-1.5 p-3 overflow-x-auto">
                {panoramas.map((url, i) => (
                  <button key={i} onClick={() => setCarouselIndex(i)} className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === carouselIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {droneVideoUrl && (
          <TabsContent value="drone" className="m-0">
            <div className="relative aspect-video bg-black">
              {isYouTube ? (
                <iframe src={getYTEmbed(droneVideoUrl)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen title="Drone walkthrough" />
              ) : (
                <>
                  <video ref={videoRef} src={droneVideoUrl} className="w-full h-full object-contain" playsInline muted preload="metadata" onEnded={() => setIsVideoPlaying(false)} />
                  {!isVideoPlaying && (
                    <button onClick={toggleVideo} className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"><Play className="h-7 w-7 text-primary-foreground ml-1" /></div>
                    </button>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <button onClick={toggleVideo} className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70">
                      {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}
              <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs border-0"><Video className="h-3 w-3 mr-1" />🚁 Drone</Badge>
            </div>
          </TabsContent>
        )}

        {stagingImages.length > 0 && (
          <TabsContent value="staging" className="m-0">
            <div className="relative aspect-[16/9]">
              <img src={stagingImages[carouselIndex]} alt={`AI Staging ${carouselIndex + 1}`} className="w-full h-full object-cover" />
              {stagingImages.length > 1 && (
                <>
                  <button onClick={() => nav("prev")} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => nav("next")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70"><ChevronRight className="h-5 w-5" /></button>
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs">{carouselIndex + 1} / {stagingImages.length}</div>
                </>
              )}
              <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs border-0"><Sparkles className="h-3 w-3 mr-1" />AI Staged</Badge>
            </div>
            {stagingImages.length > 1 && (
              <div className="flex gap-1.5 p-3 overflow-x-auto">
                {stagingImages.map((url, i) => (
                  <button key={i} onClick={() => setCarouselIndex(i)} className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === carouselIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────
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

  // Track property view
  useEffect(() => {
    if (isOpen && property?.id) {
      supabase.rpc('track_property_view', { p_property_id: property.id }).then(() => {});
    }
  }, [isOpen, property?.id]);

  if (!isOpen) return null;

  const { formatPrice: formatCurrency } = useCurrency();
  const formatPrice = (price: number) => formatCurrency(price);

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

              {/* VR Media Gallery */}
              <VRMediaGallery property={property} />
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
