import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { useState } from "react";
import WhatsAppInquiryDialog from "./WhatsAppInquiryDialog";
import { Eye, Home, Tag, Building, Bed, Bath, Maximize, Plus, MapPin, Camera } from "lucide-react";
import Price from "@/components/ui/Price";
import { useNavigate } from "react-router-dom";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BrandedStatusBadge from "@/components/ui/BrandedStatusBadge";
import { useBadgeSettings } from "@/hooks/useBadgeSettings";
import PropertyCardSkeleton from "./PropertyCardSkeleton";

interface PropertiesForSaleSectionProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForSaleSection = ({ language, onPropertyClick }: PropertiesForSaleSectionProps) => {
  const navigate = useNavigate();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const { getPropertyImage } = useDefaultPropertyImage();
  const { settings: badgeSettings } = useBadgeSettings();

  const badgePosClass = badgeSettings.badgePosition === 'bottom-left' ? 'bottom-1.5 left-1.5' :
    badgeSettings.badgePosition === 'bottom-right' ? 'bottom-1.5 right-1.5' :
    badgeSettings.badgePosition === 'top-left' ? 'top-8 left-1.5' : 'top-8 right-1.5';

  const { data: saleProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, area, development_status, description, three_d_model_url, virtual_tour_url, created_at, owner_id,
          owner:public_profiles!properties_owner_id_fkey(id, full_name, avatar_url, verification_status, user_level_id)`)
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('listing_type', 'sale')
        .in('development_status', ['completed', 'ready'])
        .not('title', 'is', null)
        .not('title', 'eq', '')
        .gt('price', 0)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) return [];
      return data?.map((property: any) => {
        const ownerData = Array.isArray(property.owner) ? property.owner[0] : property.owner;
        return {
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || [],
          posted_by: ownerData ? {
            id: ownerData.id,
            name: ownerData.full_name || 'Anonymous',
            avatar_url: ownerData.avatar_url,
            verification_status: ownerData.verification_status || 'unverified',
          } : undefined,
        };
      }) || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // formatPrice and formatMonthly replaced by <Price /> component

  const getLocation = (property: any) => {
    if (property.area && property.city) return `${property.area}, ${property.city}`;
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    return property.location || 'Indonesia';
  };

  const maxItems = 12;
  const emptySlots = Math.max(0, maxItems - saleProperties.length);

  if (isLoading) {
    return (
      <section className="rounded-xl px-2 py-3 sm:p-3">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Home className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Properti Dijual</h2>
        </div>
        <PropertyCardSkeleton count={12} />
      </section>
    );
  }

  return (
    <section className="w-full px-2 py-3 sm:p-3">
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-chart-1 to-primary flex items-center justify-center shadow-md shadow-chart-1/30">
          <Home className="h-3.5 w-3.5 text-white" />
        </div>
        <h2 className="text-sm font-bold text-foreground">Properti Dijual</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-3">
        {saleProperties.slice(0, maxItems).map((property) => {
          // price rendered via <Price /> component
          const imageCount = property.images?.length || 1;

          return (
            <div
              key={property.id}
              onClick={() => onPropertyClick(property)}
              className="group cursor-pointer rounded-xl border border-border bg-card backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-400 overflow-hidden relative"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={getPropertyImage(property.images, property.thumbnail_url)}
                  alt={property.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient overlay bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md backdrop-blur-sm">
                    <Tag className="h-2.5 w-2.5" />
                    Dijual
                  </span>
                  <span className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded-full">
                    <Building className="h-2.5 w-2.5" />
                    {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
                  </span>
                </div>

                {/* Image count badge */}
                {imageCount > 1 && (
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded-full">
                    <Camera className="h-2.5 w-2.5" />
                    {imageCount}
                  </div>
                )}

                {/* Branded Status Badge on image */}
                {badgeSettings.showOnPropertyCards && property.posted_by && (
                  <div className={`absolute ${badgePosClass} z-10`}>
                    <BrandedStatusBadge verificationStatus={property.posted_by.verification_status} userLevel={property.posted_by.user_level} />
                  </div>
                )}

                {/* Hover eye */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-10 w-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-2 sm:p-2.5 space-y-1.5 relative">
                {/* Price */}
                <div className="flex items-baseline gap-1 bg-primary/5 border border-primary/15 rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-primary leading-none tracking-tight">
                    <Price amount={property.price} short showFlag />
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold text-foreground truncate leading-snug group-hover:text-primary transition-colors group-hover:whitespace-normal group-hover:overflow-visible" title={property.title}>
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1" title={getLocation(property)}>
                  <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium truncate">{getLocation(property)}</span>
                </div>

                {/* Specs */}
                <div className="flex items-center flex-wrap gap-1.5 pt-1.5 border-t border-border/30">
                  {Number(property.bedrooms) > 0 && (
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <Bed className="h-3 w-3" />
                      <span className="text-[11px] font-semibold text-foreground/80">{property.bedrooms}</span>
                      <span className="text-[8px] font-medium">KT</span>
                    </div>
                  )}
                  {Number(property.bathrooms) > 0 && (
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <Bath className="h-3 w-3" />
                      <span className="text-[11px] font-semibold text-foreground/80">{property.bathrooms}</span>
                      <span className="text-[8px] font-medium">KM</span>
                    </div>
                  )}
                  {Number(property.area_sqm) > 0 && (
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <Maximize className="h-3 w-3" />
                      <span className="text-[11px] font-semibold text-foreground/80">{property.area_sqm}m²</span>
                    </div>
                  )}
                </div>

                {/* Posted By section removed */}
              </div>
            </div>
          );
        })}
        
        {/* Empty Slots */}
        {emptySlots > 0 && [...Array(emptySlots)].map((_, i) => (
          <div
            key={`empty-${i}`}
            onClick={() => navigate('/add-property')}
            className="group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-chart-1/20 hover:border-chart-1/50 bg-chart-1/5 hover:bg-chart-1/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[200px]"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-1/20 to-primary/20 group-hover:from-chart-1/40 group-hover:to-primary/40 flex items-center justify-center transition-colors border border-chart-1/30">
              <Plus className="h-5 w-5 text-chart-1/60 group-hover:text-chart-1 transition-colors" />
            </div>
            <span className="text-[10px] text-chart-1/50 group-hover:text-chart-1 transition-colors font-semibold">
              Tambah Properti
            </span>
          </div>
        ))}
      </div>
      
      {selectedProperty && (
        <WhatsAppInquiryDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          property={selectedProperty}
        />
      )}
    </section>
  );
};

export default PropertiesForSaleSection;
