import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { useState } from "react";
import WhatsAppInquiryDialog from "./WhatsAppInquiryDialog";
import { Eye, Home, Tag, Building, Bed, Bath, Maximize, Plus, MapPin, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BrandedStatusBadge from "@/components/ui/BrandedStatusBadge";
import { useBadgeSettings } from "@/hooks/useBadgeSettings";

interface PropertiesForSaleSectionProps {
  language: "en" | "id";
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

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return { main: `Rp ${(price / 1000000000).toFixed(1)}`, suffix: 'Miliar' };
    }
    if (price >= 1000000) {
      return { main: `Rp ${(price / 1000000).toFixed(0)}`, suffix: 'Juta' };
    }
    return { main: `Rp ${price.toLocaleString('id-ID')}`, suffix: '' };
  };

  const formatMonthly = (price: number) => {
    const monthly = price * 0.006;
    if (monthly >= 1000000) {
      return `Rp ${(monthly / 1000000).toFixed(1)} Juta/PB`;
    }
    return `Rp ${(monthly / 1000).toFixed(0)} Ribu/PB`;
  };

  const getLocation = (property: any) => {
    if (property.area && property.city) return `${property.area}, ${property.city}`;
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    return property.location || 'Indonesia';
  };

  const maxItems = 12;
  const emptySlots = Math.max(0, maxItems - saleProperties.length);

  if (isLoading) {
    return (
      <section className="rounded-xl p-3">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Home className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Properti Dijual</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden bg-muted h-52 sm:h-60"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full p-3">
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-chart-1 to-primary flex items-center justify-center shadow-md shadow-chart-1/30">
          <Home className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <h2 className="text-sm font-bold text-foreground">Properti Dijual</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
        {saleProperties.slice(0, maxItems).map((property) => {
          const priceInfo = formatPrice(property.price);
          const imageCount = property.images?.length || 1;

          return (
            <div
              key={property.id}
              onClick={() => onPropertyClick(property)}
              className="group cursor-pointer rounded-xl border border-border/30 dark:border-border/15 bg-card/60 dark:bg-card/5 backdrop-blur-xl shadow-lg shadow-chart-1/5 hover:shadow-2xl hover:shadow-chart-1/15 hover:-translate-y-1 transition-all duration-400 overflow-hidden relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-chart-1/5 before:via-transparent before:to-primary/5 before:pointer-events-none before:rounded-xl"
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
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-chart-1 to-primary text-primary-foreground shadow-lg shadow-chart-1/40 ring-1 ring-background/30">
                    <Tag className="h-2 w-2" />
                    JUAL
                  </span>
                  <span className="flex items-center gap-0.5 bg-background/20 backdrop-blur-lg text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full border border-background/30 shadow-sm">
                    <Building className="h-2 w-2" />
                    {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
                  </span>
                </div>

                {/* Image count badge */}
                {imageCount > 1 && (
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-background/15 backdrop-blur-lg text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full border border-background/25 shadow-sm">
                    <Camera className="h-2 w-2" />
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
                  <div className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-xl flex items-center justify-center shadow-xl ring-2 ring-chart-1/50 ring-offset-2 ring-offset-transparent">
                    <Eye className="h-4 w-4 text-chart-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-2.5 space-y-1.5 relative">
                {/* Price */}
                <div className="flex items-baseline gap-1 bg-gradient-to-r from-chart-1/15 via-primary/10 to-chart-4/15 border border-chart-1/25 dark:border-chart-1/20 rounded-lg px-2 py-1.5 flex-wrap backdrop-blur-sm">
                  <span className="text-base font-black bg-gradient-to-r from-chart-1 via-primary to-chart-4 bg-clip-text text-transparent leading-none tracking-tight">{priceInfo.main}</span>
                  {priceInfo.suffix && (
                    <span className="text-[11px] font-extrabold text-chart-1/70">{priceInfo.suffix}</span>
                  )}
                  <span className="text-[9px] text-muted-foreground/60 font-medium bg-background/40 dark:bg-background/10 backdrop-blur-sm rounded-full px-1.5 ml-auto border border-border/30 dark:border-border/10">≈ {formatMonthly(property.price)}</span>
                </div>

                {/* Title */}
                <h3 className="text-[11px] font-semibold text-foreground truncate leading-snug group-hover:text-chart-1 transition-colors group-hover:whitespace-normal group-hover:overflow-visible" title={property.title}>
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary/10 via-chart-4/8 to-chart-1/10 border border-primary/25 px-1.5 py-0.5 backdrop-blur-sm" title={getLocation(property)}>
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-primary" />
                  <span className="text-[10px] text-foreground/70 font-medium truncate">{getLocation(property)}</span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-1 pt-1.5 border-t border-border/30">
                  {Number(property.bedrooms) > 0 && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-br from-chart-5/15 to-chart-5/10 border border-chart-5/30 rounded-lg px-1.5 py-0.5 backdrop-blur-sm shadow-sm shadow-chart-5/10">
                      <Bed className="h-2.5 w-2.5 text-chart-5" />
                      <span className="text-[10px] font-bold text-foreground/80">{property.bedrooms}</span>
                      <span className="text-[8px] text-chart-5/70 font-bold">KT</span>
                    </div>
                  )}
                  {Number(property.bathrooms) > 0 && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-br from-chart-4/15 to-chart-4/10 border border-chart-4/30 rounded-lg px-1.5 py-0.5 backdrop-blur-sm shadow-sm shadow-chart-4/10">
                      <Bath className="h-2.5 w-2.5 text-chart-4" />
                      <span className="text-[10px] font-bold text-foreground/80">{property.bathrooms}</span>
                      <span className="text-[8px] text-chart-4/70 font-bold">KM</span>
                    </div>
                  )}
                  {Number(property.area_sqm) > 0 && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-br from-gold-primary/15 to-chart-3/15 border border-gold-primary/30 rounded-lg px-1.5 py-0.5 backdrop-blur-sm shadow-sm shadow-gold-primary/10">
                      <Maximize className="h-2.5 w-2.5 text-gold-primary" />
                      <span className="text-[10px] font-bold text-foreground/80">{property.area_sqm}m²</span>
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
