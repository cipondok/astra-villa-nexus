import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyGridView from "@/components/search/PropertyGridView";
import { BaseProperty } from "@/types/property";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { shareProperty } from "@/utils/shareUtils";
import { useState } from "react";
import WhatsAppInquiryDialog from "./WhatsAppInquiryDialog";
import { toast } from "sonner";
import { Eye, Key } from "lucide-react";

interface PropertiesForRentSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForRentSection = ({ language, onPropertyClick }: PropertiesForRentSectionProps) => {
  const { isMobile } = useIsMobile();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const { data: rentProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-rent'],
    queryFn: async () => {
      console.log('Fetching properties for rent...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url')
          .eq('status', 'active')
          .eq('approval_status', 'approved')
          .eq('listing_type', 'rent')
          .in('development_status', ['completed', 'ready'])
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Properties for rent query error:', error);
          return [];
        }

        console.log('Properties for rent loaded:', data?.length || 0);
        // Transform data to match BaseProperty interface
        const transformedData = data?.map(property => ({
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || []
        })) || [];
        return transformedData;
        
      } catch (err) {
        console.error('Properties for rent fetch error:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) {
    return (
      <section className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="mb-1.5 md:mb-2 flex items-center justify-center gap-1 md:gap-1.5">
          <h2 className="text-[10px] md:text-xs font-semibold text-foreground">
            Properties for Rent
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-white/50 dark:bg-white/5 h-36 md:h-44"></div>
          ))}
        </div>
      </section>
    );
  }

  if (rentProperties.length === 0) {
    return (
      <section className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="mb-1.5 md:mb-2 flex items-center justify-center gap-1 md:gap-1.5">
          <h2 className="text-[10px] md:text-xs font-semibold text-foreground">
            Properties for Rent
          </h2>
        </div>
        <div className="text-center text-muted-foreground py-3 text-[9px] md:text-xs">
          No rental properties available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-blue-50/80 via-white/60 to-sky-50/40 dark:from-blue-950/40 dark:via-gray-900/60 dark:to-sky-950/30 backdrop-blur-xl shadow-lg">
      <div className="mb-1.5 md:mb-2 flex items-center justify-center gap-1.5 md:gap-2">
        <Key className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-[10px] md:text-xs font-semibold text-foreground">
          Properties for Rent
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {rentProperties.slice(0, 6).map((property) => (
          <div
            key={property.id}
            onClick={() => onPropertyClick(property)}
            className="group cursor-pointer relative rounded-xl overflow-hidden h-36 md:h-44 hover:scale-[1.02] transition-all duration-200 ring-1 ring-blue-200/50 dark:ring-blue-800/30"
          >
            {/* Full Image Background */}
            <img
              src={property.images?.[0] || property.thumbnail_url || "/placeholder.svg"}
              alt={property.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient Overlay - Blue tint for rent */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-black/40 to-transparent" />
            
            {/* View Icon - Center on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-xl">
                <Eye className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            {/* Top Labels */}
            <div className="absolute top-1.5 left-1.5 right-1.5 md:top-2 md:left-2 md:right-2 flex items-start justify-between">
              {/* Rent Badge */}
              <span className="text-[9px] md:text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg">
                Sewa
              </span>
              {/* Property Type */}
              <span className="text-[8px] md:text-[10px] font-semibold px-2 py-1 rounded-full bg-white/95 dark:bg-black/80 text-foreground shadow-lg truncate max-w-[55%]">
                {property.property_type || 'Property'}
              </span>
            </div>
            
            {/* Price Label - Positioned prominently */}
            <div className="absolute top-1/2 left-1.5 md:left-2 -translate-y-1/2">
              <span className="text-xs md:text-sm font-bold px-2 py-1 rounded-md bg-gradient-to-r from-blue-600 to-sky-700 text-white shadow-xl">
                {property.price >= 1000000000 
                  ? `IDR ${(property.price / 1000000000).toFixed(1)}M` 
                  : `IDR ${(property.price / 1000000).toFixed(0)}Jt`}
                <span className="text-[8px] md:text-[10px] font-normal">/bln</span>
              </span>
            </div>
            
            {/* Bottom Content - All info on image */}
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
              {/* Title */}
              <h3 className="text-[11px] md:text-sm font-bold text-white line-clamp-1 drop-shadow-lg">
                {property.title}
              </h3>
              {/* Location */}
              <p className="text-[9px] md:text-xs text-white/95 truncate drop-shadow-md mt-0.5">
                📍 {property.city || property.location}
              </p>
              {/* Property Details */}
              <div className="flex items-center gap-2 md:gap-3 mt-1 text-[9px] md:text-[11px] text-white/90 font-medium">
                {property.bedrooms && (
                  <span className="flex items-center gap-0.5">
                    🛏️ {property.bedrooms}
                  </span>
                )}
                {property.bathrooms && (
                  <span className="flex items-center gap-0.5">
                    🚿 {property.bathrooms}
                  </span>
                )}
                {property.area_sqm && (
                  <span className="flex items-center gap-0.5">
                    📐 {property.area_sqm}m²
                  </span>
                )}
              </div>
            </div>
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