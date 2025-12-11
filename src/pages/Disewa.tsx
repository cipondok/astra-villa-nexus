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
    <div className="min-h-screen bg-background text-foreground pt-11 md:pt-12 transition-colors duration-300">
      {/* Luxury Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 md:px-4 pt-1 pb-2 relative">
        {/* Back Link */}
        <BackToHomeLink sectionId="rent-section" />

        {/* Centered Header */}
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Properti Disewa
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Temukan properti sewa terbaik dengan ASTRA Villa
          </p>
        </div>

        {/* Slim Search Panel */}
        <div className="glass-card p-2 rounded-lg mb-2 border border-primary/20">
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
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>{filteredProperties.length} hasil ditemukan</span>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card animate-pulse border border-primary/20">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardContent className="p-3 md:p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl border border-primary/20">
            <Home className="h-16 w-16 text-primary/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada properti sewa ditemukan
            </h3>
            <p className="text-muted-foreground">
              Coba ubah filter pencarian Anda untuk melihat hasil lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProperties.map(property => (
              <Card 
                key={property.id} 
                className="glass-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-primary/20 hover:border-primary/40 group"
              >
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {property.image_urls?.[0] || property.images?.[0] ? (
                      <img 
                        src={property.image_urls?.[0] || property.images?.[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onClick={() => navigate(`/properties/${property.id}`)} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Building className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-8 h-8 p-0 bg-card/80 backdrop-blur-sm hover:bg-card border border-primary/20" 
                      onClick={e => {
                        e.stopPropagation();
                        handleSaveProperty(property.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${savedProperties.has(property.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-8 h-8 p-0 bg-card/80 backdrop-blur-sm hover:bg-card border border-primary/20"
                    >
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Status and Booking Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    <Badge className="bg-primary/90 text-primary-foreground border-0">
                      Disewa
                    </Badge>
                    {property.online_booking_enabled && property.booking_type !== 'owner_only' ? (
                      <Badge className="bg-green-500/90 text-white border-0">
                        <Zap className="h-3 w-3 mr-1" />
                        Online Booking
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-accent/90 text-accent-foreground border-0">
                        <User className="h-3 w-3 mr-1" />
                        Owner Only
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2 p-3 md:p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle 
                      className="text-base md:text-lg text-foreground hover:text-primary cursor-pointer line-clamp-2 transition-colors" 
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      {property.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {property.location}
                    {property.city && `, ${property.city}`}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {formatPrice(property.price || 0)}
                      <span className="text-xs md:text-sm font-normal text-muted-foreground ml-1">
                        /{getRentalPeriodLabel(property.rental_periods || ['monthly']).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      <span>189</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 md:space-x-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        {property.bedrooms} KT
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        {property.bathrooms} KM
                      </div>
                    )}
                    {property.area_sqm && (
                      <div className="flex items-center">
                        <Square className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        {property.area_sqm} m²
                      </div>
                    )}
                  </div>

                  {/* Rental specific info */}
                  <div className="flex items-center space-x-3 md:space-x-4 text-xs text-muted-foreground mb-3 md:mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Min. {property.minimum_rental_days || 30} hari
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {getRentalPeriodLabel(property.rental_periods || ['monthly'])}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-xs md:text-sm h-8 md:h-9" 
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      Lihat Detail
                    </Button>
                    {property.online_booking_enabled && property.booking_type !== 'owner_only' ? (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm h-8 md:h-9" 
                        onClick={() => handleBookingClick(property)}
                      >
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Book Online
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1 border-primary/30 text-foreground hover:bg-primary/10 text-xs md:text-sm h-8 md:h-9" 
                        onClick={() => handleBookingClick(property)}
                      >
                        <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Hubungi
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rental Tips with Luxury Styling */}
        <div className="mt-8 md:mt-12 glass-card rounded-xl p-4 md:p-6 border border-primary/20">
          <h2 className="text-lg md:text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tips Menyewa Properti via ASTRA Villa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-primary mb-2 text-sm md:text-base">Online Booking</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Properti dengan badge "Online Booking" dapat langsung dibooking melalui sistem ASTRA Villa.
              </p>
            </div>
            <div className="p-3 md:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-sm md:text-base">Periode Sewa Fleksibel</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Pilih periode sewa sesuai kebutuhan: harian, mingguan, bulanan, atau tahunan.
              </p>
            </div>
            <div className="p-3 md:p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h3 className="font-semibold text-accent mb-2 text-sm md:text-base">Owner Only</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Properti "Owner Only" hanya bisa dibooking langsung dengan pemilik untuk fleksibilitas maksimal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disewa;
