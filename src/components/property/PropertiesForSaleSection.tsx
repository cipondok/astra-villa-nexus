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
import { Eye, Home, Tag, Building } from "lucide-react";

// Helper to capitalize first letter
const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Property';

interface PropertiesForSaleSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForSaleSection = ({ language, onPropertyClick }: PropertiesForSaleSectionProps) => {
  const { isMobile } = useIsMobile();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const { data: saleProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-sale'],
    queryFn: async () => {
      console.log('Fetching properties for sale...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url')
          .eq('status', 'active')
          .eq('approval_status', 'approved')
          .eq('listing_type', 'sale')
          .in('development_status', ['completed', 'ready'])
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Properties for sale query error:', error);
          return [];
        }

        console.log('Properties for sale loaded:', data?.length || 0);
        // Transform data to match BaseProperty interface
        const transformedData = data?.map(property => ({
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || []
        })) || [];
        return transformedData;
        
      } catch (err) {
        console.error('Properties for sale fetch error:', err);
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
      <section className="glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="mb-1 sm:mb-1.5 md:mb-2 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5">
          <h2 className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-foreground">
            Properti Dijual
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-1.5 md:gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-md sm:rounded-lg overflow-hidden bg-white/50 dark:bg-white/5 h-24 sm:h-28 md:h-36"></div>
          ))}
        </div>
      </section>
    );
  }

  if (saleProperties.length === 0) {
    return (
      <section className="glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="mb-1 sm:mb-1.5 md:mb-2 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5">
          <h2 className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-foreground">
            Properti Dijual
          </h2>
        </div>
        <div className="text-center text-muted-foreground py-2 sm:py-3 text-[7px] sm:text-[8px] md:text-xs">
          Tidak ada properti dijual saat ini.
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-50/80 via-white/60 to-green-50/40 dark:from-emerald-950/40 dark:via-gray-900/60 dark:to-green-950/30 backdrop-blur-xl shadow-lg">
      <div className="mb-1 sm:mb-1.5 md:mb-2 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
        <Home className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-600 dark:text-green-400" />
        <h2 className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-foreground">
          Properti Dijual
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
        {saleProperties.slice(0, 6).map((property) => (
          <div
            key={property.id}
            onClick={() => onPropertyClick(property)}
            className="group cursor-pointer relative rounded-lg sm:rounded-xl overflow-hidden h-36 sm:h-40 md:h-52 hover:scale-[1.02] transition-all duration-200 ring-1 ring-green-200/50 dark:ring-green-800/30"
          >
            {/* Full Image Background */}
            <img
              src={property.images?.[0] || property.thumbnail_url || "/placeholder.svg"}
              alt={property.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient Overlay - Green tint for sale */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-black/40 to-transparent" />
            
            {/* View Icon - Center on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-xl">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            {/* Top Labels */}
            <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2 flex items-start justify-between">
              {/* Sale Badge with icon */}
              <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Jual
              </span>
              {/* Property Type */}
              <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] md:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 dark:bg-black/80 text-foreground shadow-lg truncate max-w-[55%]">
                <Building className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {capitalizeFirst(property.property_type)}
              </span>
            </div>
            
            {/* Price Label */}
            <div className="absolute top-1/2 left-1.5 sm:left-2 md:left-2.5 -translate-y-1/2">
              <span className="text-xs sm:text-sm md:text-base font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl">
                {property.price >= 1000000000 
                  ? `${(property.price / 1000000000).toFixed(1)}M` 
                  : `${(property.price / 1000000).toFixed(0)}Jt`}
              </span>
            </div>
            
            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 md:p-3">
              {/* Title */}
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white line-clamp-1 drop-shadow-lg">
                {property.title}
              </h3>
              {/* Location */}
              <p className="text-[10px] sm:text-xs md:text-sm text-white/95 truncate drop-shadow-md mt-0.5">
                📍 {property.city || property.location}
              </p>
              {/* Property Details */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-1 text-[10px] sm:text-xs md:text-sm text-white/90 font-medium">
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

export default PropertiesForSaleSection;