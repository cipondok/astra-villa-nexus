import { useState, useEffect, useMemo } from "react";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useInfiniteProperties } from "@/hooks/useInfiniteProperties";
import AdvancedRentalSearch from "@/components/rental/AdvancedRentalSearch";
import BackToHomeLink from "@/components/common/BackToHomeLink";
import { MapPin, Home, Building, Bed, Bath, Square, Heart, Share2, Eye, Calendar, Clock, Zap, User, CheckCircle, Loader2 } from "lucide-react";

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
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());

  const {
    properties,
    isLoading: loading,
    isFetchingMore,
    hasMore,
    sentinelRef,
    reset,
  } = useInfiniteProperties({
    listingType: 'rent',
    pageSize: 12,
  });

  const {
    isPulling, pullDistance, isRefreshing,
    indicatorOpacity, indicatorRotation, threshold,
    handlers,
  } = usePullToRefresh({
    onRefresh: async () => { reset(); },
  });
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

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
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
  }, [properties, filters]);

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
    <div {...handlers} className="min-h-screen bg-background text-foreground">
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        indicatorOpacity={indicatorOpacity}
        indicatorRotation={indicatorRotation}
        threshold={threshold}
      />
      <SEOHead
        title="Properti Disewa di Indonesia"
        description="Sewa villa, apartemen, rumah, dan kos-kosan di seluruh Indonesia. Booking online mudah & cepat di ASTRA Villa Realty."
        keywords="properti disewa, villa disewa, apartemen sewa, rumah sewa, kos-kosan Indonesia"
        jsonLd={seoSchemas.breadcrumb([{ name: 'Beranda', url: '/' }, { name: 'Properti Disewa', url: '/disewa' }])}
      />
      {/* Clean Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackToHomeLink sectionId="rent-section" className="mb-0" />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">Properti Disewa</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredProperties.length} properti tersedia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <AdvancedRentalSearch
            filters={filters} 
            onFiltersChange={setFilters} 
            onSearch={() => {}} 
            propertyTypes={propertyTypes} 
            cities={cities} 
            loading={loading} 
          />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-md overflow-hidden bg-muted h-64 sm:h-72"></div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card className="p-8 sm:p-12 border-border">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada properti ditemukan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Coba sesuaikan filter pencarian Anda
              </p>
              <Button 
                variant="outline"
                className="h-10 px-6"
                onClick={() => setFilters({
                  ...filters,
                  searchTerm: '',
                  propertyType: 'all',
                  province: 'all',
                  city: 'all',
                  priceRange: 'all',
                  rentalPeriod: [],
                  onlineBookingOnly: false
                })}
              >
                Reset Filter
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProperties.map((property) => {
              const imageUrl = property.image_urls?.[0] || property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

              return (
                <Card
                  key={property.id}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="group cursor-pointer overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Save Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/90 hover:bg-background rounded-full shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveProperty(property.id);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${savedProperties.has(property.id) ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                      />
                    </Button>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded">
                        Disewa
                      </Badge>
                      {property.online_booking_enabled && property.booking_type !== 'owner_only' && (
                        <Badge className="bg-chart-1 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <CardContent className="p-3 sm:p-4">
                    {/* Price */}
                    <p className="text-base sm:text-lg font-bold text-primary mb-1">
                      {formatPrice(property.price)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        /{getRentalPeriodLabel(property.rental_periods || ['monthly']).split(',')[0].toLowerCase()}
                      </span>
                    </p>
                    
                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 mb-1">
                      {property.title}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1 text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{property.city || property.location}</span>
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground border-t border-border pt-3">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area_sqm > 0 && (
                        <div className="flex items-center gap-1">
                          <Square className="h-3.5 w-3.5" />
                          <span>{property.area_sqm}m²</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {isFetchingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {!hasMore && properties.length > 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Semua properti telah ditampilkan
          </p>
        )}

        {/* Rental Tips */}
        {!loading && filteredProperties.length > 0 && (
          <Card className="mt-6 p-4 sm:p-6 border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Tips Menyewa Properti
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">Online Booking</h3>
                <p className="text-xs text-muted-foreground">
                  Properti dengan badge "Online" dapat langsung dibooking melalui sistem.
                </p>
              </div>
              <div className="p-4 bg-chart-1/5 rounded-md border border-chart-1/10">
                <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-chart-1" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">Periode Fleksibel</h3>
                <p className="text-xs text-muted-foreground">
                  Pilih periode sewa: harian, mingguan, bulanan, atau tahunan.
                </p>
              </div>
              <div className="p-4 bg-accent/5 rounded-md border border-accent/10">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">Owner Only</h3>
                <p className="text-xs text-muted-foreground">
                  Beberapa properti hanya bisa dibooking langsung dengan pemilik.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Disewa;
