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

interface PropertiesForSaleSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForSaleSection = ({ language, onPropertyClick }: PropertiesForSaleSectionProps) => {
  const navigate = useNavigate();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const { getPropertyImage } = useDefaultPropertyImage();

  const { data: saleProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, area, development_status, description, three_d_model_url, virtual_tour_url, created_at')
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
      return data?.map(property => ({
        ...property,
        listing_type: property.listing_type as "sale" | "rent" | "lease",
        image_urls: property.images || []
      })) || [];
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
      return `Rp ${(monthly / 1000000).toFixed(0)} Jutaan/bulan`;
    }
    return `Rp ${(monthly / 1000).toFixed(0)} Ribuan/bulan`;
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
        <Home className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-foreground">Properti Dijual</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
        {saleProperties.slice(0, maxItems).map((property) => {
          const priceInfo = formatPrice(property.price);
          const imageCount = property.images?.length || 1;

          return (
            <div
              key={property.id}
              onClick={() => onPropertyClick(property)}
              className="group cursor-pointer bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={getPropertyImage(property.images, property.thumbnail_url)}
                  alt={property.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                  <Badge className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md shadow-sm bg-accent text-accent-foreground">
                    <Tag className="h-2.5 w-2.5" />
                    Dijual
                  </Badge>
                  <Badge className="flex items-center gap-0.5 bg-card/90 backdrop-blur-sm text-foreground text-[10px] px-1.5 py-0.5 rounded-md shadow-sm border border-border/50">
                    <Building className="h-2.5 w-2.5" />
                    {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
                  </Badge>
                </div>

                {/* Image Count */}
                {imageCount > 1 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded">
                    <Camera className="h-2.5 w-2.5" />
                    <span>{imageCount}</span>
                  </div>
                )}

                {/* View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                  <div className="h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Eye className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-2.5 space-y-1.5">
                {/* Price */}
                <div className="border border-border/40 bg-accent/5 dark:bg-accent/10 rounded-lg px-2.5 py-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-accent tracking-tight leading-none">{priceInfo.main}</span>
                    {priceInfo.suffix && (
                      <span className="text-[11px] sm:text-sm font-extrabold text-accent/70">{priceInfo.suffix}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground/70 font-medium mt-0.5">≈ {formatMonthly(property.price)}</p>
                </div>

                {/* Title */}
                <h3 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-medium line-clamp-1">{getLocation(property)}</span>
                </div>

                {/* Specs - KT/KM/LB */}
                <div className="flex items-center flex-wrap gap-2 pt-1.5 border-t border-border/30">
                  {property.bedrooms && property.bedrooms > 0 && (
                    <div className="flex items-center gap-1 border border-border/40 bg-accent/5 dark:bg-accent/10 rounded-lg px-2 py-0.5">
                      <Bed className="h-3 w-3 text-accent" />
                      <span className="text-[11px] text-foreground font-bold">{property.bedrooms}</span>
                      <span className="text-[9px] text-muted-foreground font-semibold">KT</span>
                    </div>
                  )}
                  {property.bathrooms && property.bathrooms > 0 && (
                    <div className="flex items-center gap-1 border border-border/40 bg-accent/5 dark:bg-accent/10 rounded-lg px-2 py-0.5">
                      <Bath className="h-3 w-3 text-accent" />
                      <span className="text-[11px] text-foreground font-bold">{property.bathrooms}</span>
                      <span className="text-[9px] text-muted-foreground font-semibold">KM</span>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="flex items-center gap-1 border border-border/40 bg-accent/5 dark:bg-accent/10 rounded-lg px-2 py-0.5">
                      <span className="text-[9px] text-accent font-bold">LB</span>
                      <span className="text-[11px] text-foreground font-bold">{property.area_sqm}m²</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Empty Slots */}
        {emptySlots > 0 && [...Array(emptySlots)].map((_, i) => (
          <div
            key={`empty-${i}`}
            onClick={() => navigate('/add-property')}
            className="group cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/20 hover:border-accent/50 bg-muted/20 hover:bg-accent/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[200px]"
          >
            <div className="h-10 w-10 rounded-full bg-muted/50 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
            </div>
            <span className="text-[10px] text-muted-foreground/50 group-hover:text-accent transition-colors font-medium">
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