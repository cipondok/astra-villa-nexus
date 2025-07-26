import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdvancedRentalSearch from "@/components/rental/AdvancedRentalSearch";
import { 
  MapPin, 
  Home, 
  Building, 
  Bed, 
  Bath, 
  Square,
  Heart,
  Share2,
  Eye,
  Calendar,
  Clock,
  Zap,
  User,
  CheckCircle
} from "lucide-react";

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
  userLocation: { lat: number; lng: number } | null;
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
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    // Basic search
    const matchesSearch = !filters.searchTerm || 
      property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Property type filter
    const matchesType = filters.propertyType === "all" || property.property_type === filters.propertyType;
    
    // Province filter (simplified - would need property to have province data)
    const matchesProvince = filters.province === "all" || true; // TODO: Add province data to properties
    
    // City filter
    const matchesCity = filters.city === "all" || property.city === filters.city;
    
    // Price range filter
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
    
    // Rental period filter
    const matchesRentalPeriod = filters.rentalPeriod.length === 0 || 
      (property.rental_periods && property.rental_periods.some(period => filters.rentalPeriod.includes(period)));
    
    // Online booking filter
    const matchesOnlineBooking = !filters.onlineBookingOnly || 
      (property.online_booking_enabled && property.booking_type !== 'owner_only');
    
    // Minimum days filter
    const matchesMinimumDays = filters.minimumDays === 0 || 
      (property.minimum_rental_days && property.minimum_rental_days >= filters.minimumDays);
    
    // Date availability filter (simplified - in real app would check booking calendar)
    const matchesDateAvailability = !filters.checkInDate || !filters.checkOutDate || true;
    
    return matchesSearch && matchesType && matchesProvince && matchesCity && matchesPriceRange && 
           matchesRentalPeriod && matchesOnlineBooking && matchesMinimumDays && matchesDateAvailability;
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
        description: "Properti telah dihapus dari daftar favorit Anda.",
      });
    } else {
      newSaved.add(propertyId);
      toast({
        title: "Ditambah ke favorit",
        description: "Properti telah ditambahkan ke daftar favorit Anda.",
      });
    }
    setSavedProperties(newSaved);
  };

  const handleBookingClick = (property: Property) => {
    if (property.online_booking_enabled && property.booking_type !== 'owner_only') {
      toast({
        title: "ASTRA Villa Booking",
        description: "Mengarahkan ke sistem booking online...",
      });
      // Navigate to booking system
      navigate(`/booking/${property.id}`);
    } else {
      toast({
        title: "Hubungi Pemilik",
        description: "Properti ini hanya bisa dibooking melalui pemilik langsung.",
      });
    }
  };

  const getRentalPeriodLabel = (periods: string[]) => {
    if (!periods || periods.length === 0) return "Bulanan";
    return periods.map(period => {
      switch(period) {
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
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Properti Disewa - ASTRA Villa
          </h1>
          <p className="text-lg text-gray-600">
            Temukan properti sewa dengan sistem booking online dan offline
          </p>
        </div>

        {/* Advanced Search */}
        <AdvancedRentalSearch
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={fetchProperties}
          propertyTypes={propertyTypes}
          cities={cities}
          loading={loading}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan {filteredProperties.length} dari {properties.length} properti sewa
          </p>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Tidak ada properti sewa ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah filter pencarian Anda untuk melihat hasil lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    {property.image_urls?.[0] || property.images?.[0] ? (
                      <img 
                        src={property.image_urls?.[0] || property.images?.[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveProperty(property.id);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  {/* Status and Booking Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Disewa
                    </Badge>
                    {property.online_booking_enabled && property.booking_type !== 'owner_only' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Online Booking
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        <User className="h-3 w-3 mr-1" />
                        Owner Only
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle 
                      className="text-lg hover:text-purple-600 cursor-pointer line-clamp-2"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      {property.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                    {property.city && `, ${property.city}`}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(property.price || 0)}
                      <span className="text-sm font-normal text-gray-500">
                        /{getRentalPeriodLabel(property.rental_periods || ['monthly']).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>189</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms} KT
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} KM
                      </div>
                    )}
                    {property.area_sqm && (
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.area_sqm} m²
                      </div>
                    )}
                  </div>

                  {/* Rental specific info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Min. {property.minimum_rental_days || 30} hari
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {getRentalPeriodLabel(property.rental_periods || ['monthly'])}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      Lihat Detail
                    </Button>
                    {property.online_booking_enabled && property.booking_type !== 'owner_only' ? (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleBookingClick(property)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Book Online
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleBookingClick(property)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Hubungi Pemilik
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rental Tips */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tips Menyewa Properti via ASTRA Villa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Online Booking</h3>
              <p className="text-sm text-gray-600">Properti dengan badge "Online Booking" dapat langsung dibooking melalui sistem ASTRA Villa.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Periode Sewa Fleksibel</h3>
              <p className="text-sm text-gray-600">Pilih periode sewa sesuai kebutuhan: harian, mingguan, bulanan, atau tahunan.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Owner Only</h3>
              <p className="text-sm text-gray-600">Properti "Owner Only" hanya bisa dibooking langsung dengan pemilik untuk fleksibilitas maksimal.</p>
            </div>
          </div>
        </div>
      </div>

      </div>
  );
};

export default Disewa;