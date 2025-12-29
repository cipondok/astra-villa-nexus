import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdvancedRentalSearch from "@/components/rental/AdvancedRentalSearch";
import BackToHomeLink from "@/components/common/BackToHomeLink";
import { MapPin, Home, Building, Bed, Bath, Square, Heart, Share2, Eye, Calendar, Clock, Zap, User, CheckCircle } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  image_urls: string[];
  status: string;
  created_at: string;
  rental_periods?: string[];
  minimum_rental_days?: number;
  online_booking_enabled?: boolean;
  booking_type?: string;
  advance_booking_days?: number;
  available_from?: string;
  available_until?: string;
  rental_terms?: any;
}

interface RentalFilters {
  searchTerm: string;
  propertyType: string;
  province: string;
  city: string;
  priceRange: string;
  rentalPeriod: string[];
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  onlineBookingOnly: boolean;
  minimumDays: number;
  nearMe: boolean;
  userLocation: {
    lat: number;
    lng: number;
  } | null;
}

const Disewa = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RentalFilters>({
    searchTerm: "",
    propertyType: "all",
    province: "all",
    city: "all",
    priceRange: "all",
    rentalPeriod: [],
    checkInDate: undefined,
    checkOutDate: undefined,
    onlineBookingOnly: false,
    minimumDays: 0,
    nearMe: false,
    userLocation: null
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_type', 'rent')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Gagal memuat properti. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !filters.searchTerm || 
      property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
      property.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
      property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesType = filters.propertyType === "all" || property.property_type === filters.propertyType;
    const matchesProvince = filters.province === "all" || true;
    const matchesCity = filters.city === "all" || property.city === filters.city;

    let matchesPriceRange = true;
    if (filters.priceRange && filters.priceRange !== "all") {
      const price = property.price || 0;
      switch (filters.priceRange) {
        case 'under-1m':
          matchesPriceRange = price < 1000000;
          break;
        case '1m-5m':
          matchesPriceRange = price >= 1000000 && price < 5000000;
          break;
        case '5m-10m':
          matchesPriceRange = price >= 5000000 && price < 10000000;
          break;
        case '10m-20m':
          matchesPriceRange = price >= 10000000 && price < 20000000;
          break;
        case 'over-20m':
          matchesPriceRange = price >= 20000000;
          break;
      }
    }

    const matchesRentalPeriod = filters.rentalPeriod.length === 0 || 
      (property.rental_periods && property.rental_periods.some(period => filters.rentalPeriod.includes(period)));
    const matchesOnlineBooking = !filters.onlineBookingOnly || 
      (property.online_booking_enabled && property.booking_type !== 'owner_only');
    const matchesMinimumDays = filters.minimumDays === 0 || 
      (property.minimum_rental_days && property.minimum_rental_days >= filters.minimumDays);
    const matchesDateAvailability = !filters.checkInDate || !filters.checkOutDate || true;

    return matchesSearch && matchesType && matchesProvince && matchesCity && 
           matchesPriceRange && matchesRentalPeriod && matchesOnlineBooking && 
           matchesMinimumDays && matchesDateAvailability;
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(1)} Jt`;
    } else {
      return `Rp ${price.toLocaleString('id-ID')}`;
    }
  };

  const handleSaveProperty = (propertyId: string) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(propertyId)) {
      newSaved.delete(propertyId);
      toast({
        title: "Dihapus dari favorit",
        description: "Properti telah dihapus dari daftar favorit Anda."
      });
    } else {
      newSaved.add(propertyId);
      toast({
        title: "Ditambah ke favorit",
        description: "Properti telah ditambahkan ke daftar favorit Anda."
      });
    }
    setSavedProperties(newSaved);
  };

  const handleBookingClick = (property: Property) => {
    if (property.online_booking_enabled && property.booking_type !== 'owner_only') {
      toast({
        title: "ASTRA Villa Booking",
        description: "Mengarahkan ke sistem booking online..."
      });
      navigate(`/booking/${property.id}`);
    } else {
      toast({
        title: "Hubungi Pemilik",
        description: "Properti ini hanya bisa dibooking melalui pemilik langsung."
      });
    }
  };

  const getRentalPeriodLabel = (periods: string[]) => {
    if (!periods || periods.length === 0) return "Bulanan";
    return periods.map(period => {
      switch (period) {
        case 'daily': return 'Harian';
        case 'weekly': return 'Mingguan';
        case 'monthly': return 'Bulanan';
        case 'yearly': return 'Tahunan';
        default: return period;
      }
    }).join(', ');
  };

  const propertyTypes = [...new Set(properties.map(p => p.property_type))];
  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background text-foreground pt-10 sm:pt-11 md:pt-12 transition-colors duration-300">
      {/* Luxury Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-56 h-40 sm:h-56 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-2 sm:px-3 md:px-4 pt-1 pb-4 relative">
        {/* Back Link */}
        <BackToHomeLink sectionId="rent-section" />

        {/* Centered Header */}
        <div className="text-center mb-1.5 sm:mb-2">
          <h1 className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Properti Disewa
          </h1>
          <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
            Temukan properti sewa terbaik dengan ASTRA Villa
          </p>
        </div>

        {/* Slim Search Panel */}
        <div className="glass-card p-1.5 sm:p-2 rounded-md sm:rounded-lg mb-2 sm:mb-3 border border-primary/20">
          <AdvancedRentalSearch
            filters={filters} 
            onFiltersChange={setFilters} 
            onSearch={fetchProperties} 
            propertyTypes={propertyTypes} 
            cities={cities} 
            loading={loading} 
          />
        </div>

        {/* Compact Results Info */}
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 text-[9px] sm:text-xs text-muted-foreground">
          <span>{filteredProperties.length} properti ditemukan</span>
        </div>

        {/* Properties Grid - Same style as Dijual */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada properti sewa ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
            {filteredProperties.map((property) => {
              const imageUrl = property.image_urls?.[0] || property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

              return (
                <div
                  key={property.id}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="group relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  
                  {/* Green Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent" />

                  {/* Top Actions */}
                  <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 right-1 sm:right-1.5 flex justify-between items-start z-10">
                    <div className="flex flex-col gap-0.5">
                      <span className="px-1 sm:px-1.5 py-0.5 bg-blue-600/90 text-white text-[6px] sm:text-[7px] font-medium rounded">
                        Sewa
                      </span>
                      {property.online_booking_enabled && property.booking_type !== 'owner_only' && (
                        <span className="px-1 sm:px-1.5 py-0.5 bg-green-500/90 text-white text-[5px] sm:text-[6px] font-medium rounded flex items-center gap-0.5">
                          <Zap className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                          Online
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveProperty(property.id);
                      }}
                      className="p-0.5 sm:p-1 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                    >
                      <Heart className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Center Eye Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full">
                      <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-1/2 left-1 sm:left-1.5 -translate-y-1/2 z-10">
                    <span className="px-1 sm:px-1.5 py-0.5 bg-primary/90 text-primary-foreground text-[7px] sm:text-[8px] font-bold rounded shadow-lg">
                      {formatPrice(property.price)}
                      <span className="text-[5px] sm:text-[6px] font-normal opacity-80">
                        /{getRentalPeriodLabel(property.rental_periods || ['monthly']).split(',')[0].toLowerCase()}
                      </span>
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 z-10">
                    <h3 className="text-white font-semibold text-[8px] sm:text-[9px] md:text-[10px] leading-tight line-clamp-1 mb-0.5">
                      {property.title}
                    </h3>
                    <p className="text-white/80 text-[6px] sm:text-[7px] flex items-center gap-0.5 mb-1">
                      <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                      <span className="truncate">{property.location || property.city}</span>
                    </p>
                    
                    {/* Property Details */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-[6px] sm:text-[7px]">
                      {property.bedrooms > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Bed className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Bath className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                          {property.bathrooms}
                        </span>
                      )}
                      {property.area_sqm > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Square className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                          {property.area_sqm}m²
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rental Tips with Luxury Styling */}
        <div className="mt-4 sm:mt-6 md:mt-8 glass-card rounded-lg p-2 sm:p-3 md:p-4 border border-primary/20">
          <h2 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tips Menyewa Properti via ASTRA Villa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-md sm:rounded-lg border border-primary/20">
              <h3 className="font-semibold text-primary mb-1 text-[9px] sm:text-xs md:text-sm">Online Booking</h3>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                Properti dengan badge "Online" dapat langsung dibooking melalui sistem ASTRA Villa.
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-500/10 rounded-md sm:rounded-lg border border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-1 text-[9px] sm:text-xs md:text-sm">Periode Fleksibel</h3>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                Pilih periode sewa sesuai kebutuhan: harian, mingguan, bulanan, atau tahunan.
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-accent/10 rounded-md sm:rounded-lg border border-accent/20">
              <h3 className="font-semibold text-accent mb-1 text-[9px] sm:text-xs md:text-sm">Owner Only</h3>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                Properti "Owner Only" hanya bisa dibooking langsung dengan pemilik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disewa;
