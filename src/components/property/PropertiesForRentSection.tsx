import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { useState } from "react";
import WhatsAppInquiryDialog from "./WhatsAppInquiryDialog";
import { Eye, Key, Building, Bed, Bath, Maximize, Plus, MapPin, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { Badge } from "@/components/ui/badge";

interface PropertiesForRentSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForRentSection = ({ language, onPropertyClick }: PropertiesForRentSectionProps) => {
  const navigate = useNavigate();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const { getPropertyImage } = useDefaultPropertyImage();

  const { data: rentProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-rent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, area, development_status, description, three_d_model_url, virtual_tour_url, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('listing_type', 'rent')
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

  const getLocation = (property: any) => {
    if (property.area && property.city) return `${property.area}, ${property.city}`;
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    return property.location || 'Indonesia';
  };

  const maxItems = 12;
  const emptySlots = Math.max(0, maxItems - rentProperties.length);

  if (isLoading) {
    return (
      <section className="rounded-xl p-3">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Properti Disewa</h2>
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
    <section className="rounded-xl p-3">
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/30">
          <Key className="h-3.5 w-3.5 text-white" />
        </div>
        <h2 className="text-sm font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-primary bg-clip-text text-transparent">Properti Disewa</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
        {rentProperties.slice(0, maxItems).map((property) => {
          const priceInfo = formatPrice(property.price);
          const imageCount = property.images?.length || 1;

          return (
            <div
              key={property.id}
              onClick={() => onPropertyClick(property)}
              className="group cursor-pointer rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-500/40">
                    <Key className="h-2 w-2" />
                    RENT
                  </span>
                  <span className="flex items-center gap-0.5 bg-black/40 backdrop-blur-sm text-white/90 text-[9px] px-1.5 py-0.5 rounded-full border border-white/20">
                    <Building className="h-2 w-2" />
                    {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
                  </span>
                </div>

                {/* Image count badge */}
                {imageCount > 1 && (
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full border border-white/20">
                    <Camera className="h-2 w-2" />
                    {imageCount}
                  </div>
                )}

                {/* Hover eye */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-blue-400/40">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-2.5 space-y-1.5">
                {/* Price */}
                <div className="flex items-baseline gap-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 dark:border-blue-400/15 rounded-lg px-2 py-1.5">
                  <span className="text-base font-black bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent leading-none tracking-tight">{priceInfo.main}</span>
                  {priceInfo.suffix && (
                    <span className="text-[11px] font-extrabold text-blue-600/70 dark:text-blue-400/70">{priceInfo.suffix}</span>
                  )}
                  <span className="text-[9px] text-blue-500/60 font-bold ml-auto">/bln</span>
                </div>

                {/* Title */}
                <h3 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500/8 to-blue-500/8 border border-cyan-400/20 px-1.5 py-0.5" title={getLocation(property)}>
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-[10px] text-foreground/70 font-medium truncate">{getLocation(property)}</span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-1 pt-1 border-t border-blue-400/10 dark:border-blue-400/10">
                  {property.bedrooms && property.bedrooms > 0 && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-400/20 rounded-md px-1.5 py-0.5">
                      <Bed className="h-2.5 w-2.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[10px] font-bold text-foreground/80">{property.bedrooms}</span>
                      <span className="text-[8px] text-muted-foreground font-semibold">KT</span>
                    </div>
                  )}
                  {property.bathrooms && property.bathrooms > 0 && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-md px-1.5 py-0.5">
                      <Bath className="h-2.5 w-2.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-[10px] font-bold text-foreground/80">{property.bathrooms}</span>
                      <span className="text-[8px] text-muted-foreground font-semibold">KM</span>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-md px-1.5 py-0.5">
                      <Maximize className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] font-bold text-foreground/80">{property.area_sqm}m²</span>
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
            className="group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-blue-400/20 hover:border-blue-400/50 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[200px]"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 flex items-center justify-center transition-colors border border-blue-400/30">
              <Plus className="h-5 w-5 text-blue-500/60 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-[10px] text-blue-500/50 group-hover:text-blue-500 transition-colors font-semibold">
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

export default PropertiesForRentSection;
