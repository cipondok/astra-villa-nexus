import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PropertySidebarFilters from "@/components/property/PropertySidebarFilters";
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
  TrendingUp,
  Search
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
}

interface SearchFilters {
  searchTerm: string;
  propertyType: string;
  city: string;
  area: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  minArea: number;
  maxArea: number;
  yearBuilt: string;
  condition: string;
  features: string[];
  sortBy: string;
}

const Dijual = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    propertyType: '',
    city: '',
    area: '',
    minPrice: 0,
    maxPrice: 10000000000,
    bedrooms: '',
    bathrooms: '',
    minArea: 0,
    maxArea: 1000,
    yearBuilt: '',
    condition: '',
    features: [],
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_type', 'sale')
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

  const applyFilters = () => {
    let filtered = properties.filter(property => {
      // Search term filter
      const matchesSearch = !filters.searchTerm || 
        property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Property type filter
      const matchesType = !filters.propertyType || filters.propertyType === "all" || 
        property.property_type === filters.propertyType;
      
      // City filter
      const matchesCity = !filters.city || filters.city === "all" || 
        property.city === filters.city;
      
      // Area filter
      const matchesArea = !filters.area || filters.area === "all" || 
        property.area === filters.area;
      
      // Price range filter
      const price = property.price || 0;
      const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;
      
      // Area size filter
      const area = property.area_sqm || 0;
      const matchesAreaSize = area >= filters.minArea && area <= filters.maxArea;
      
      // Bedrooms filter
      const matchesBedrooms = !filters.bedrooms || filters.bedrooms === "all" || 
        (filters.bedrooms === "5+" ? property.bedrooms >= 5 : property.bedrooms === parseInt(filters.bedrooms));
      
      // Bathrooms filter
      const matchesBathrooms = !filters.bathrooms || filters.bathrooms === "all" || 
        (filters.bathrooms === "4+" ? property.bathrooms >= 4 : property.bathrooms === parseInt(filters.bathrooms));
      
      return matchesSearch && matchesType && matchesCity && matchesArea && 
             matchesPrice && matchesAreaSize && matchesBedrooms && matchesBathrooms;
    });

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'area_large':
        filtered.sort((a, b) => (b.area_sqm || 0) - (a.area_sqm || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProperties(filtered);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toFixed(1)} M`;
    } else if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(0)} Jt`;
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

  const propertyTypes = [...new Set(properties.map(p => p.property_type))];
  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];
  const areas = [...new Set(properties.map(p => p.area).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Properti Dijual
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Temukan properti impian Anda dengan sistem pencarian canggih dan filter yang komprehensif
          </p>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Sidebar Filters */}
        <PropertySidebarFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={applyFilters}
          propertyTypes={propertyTypes}
          cities={cities}
          areas={areas}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">

          {/* Results Summary */}
          <div className="mb-6 professional-card border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">
                Menampilkan {filteredProperties.length} properti
              </p>
              <p className="text-sm text-muted-foreground">
                dari total {properties.length} properti dijual
              </p>
            </div>
            {filteredProperties.length > 0 && (
              <Badge variant="secondary" className="badge-primary">
                {Math.round((filteredProperties.length / properties.length) * 100)}% hasil
              </Badge>
            )}
          </div>
        </div>

          {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-lg">
                <div className="aspect-video bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16 professional-card">
            <Home className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Tidak ada properti ditemukan
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Coba sesuaikan filter pencarian Anda atau hapus beberapa filter untuk melihat lebih banyak hasil.
            </p>
            <Button 
              onClick={() => setFilters({
                searchTerm: '',
                propertyType: '',
                city: '',
                area: '',
                minPrice: 0,
                maxPrice: 10000000000,
                bedrooms: '',
                bathrooms: '',
                minArea: 0,
                maxArea: 1000,
                yearBuilt: '',
                condition: '',
                features: [],
                sortBy: 'newest'
              })}
              className="btn-primary"
            >
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1">
                <div className="relative group">
                  <div className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-lg overflow-hidden">
                    {property.image_urls?.[0] || property.images?.[0] ? (
                      <img 
                        src={property.image_urls?.[0] || property.images?.[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <Building className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-10 h-10 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
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
                      className="w-10 h-10 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="status-success font-medium">
                      Dijual
                    </Badge>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-card/90 text-foreground font-bold text-lg px-3 py-1">
                      {formatPrice(property.price || 0)}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle 
                    className="text-xl hover:text-primary cursor-pointer line-clamp-2 transition-colors"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    {property.title}
                  </CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    {property.location}
                    {property.city && `, ${property.city}`}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>245 views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium">{property.bedrooms} KT</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium">{property.bathrooms} KM</span>
                      </div>
                    )}
                    {property.area_sqm && (
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium">{property.area_sqm} m²</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1 btn-primary"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      Lihat Detail
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Hubungi Agen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

          {/* Market Insights */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Statistik Pasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
                  <div className="text-sm text-gray-600">Total Properti</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {properties.length > 0 
                      ? formatPrice(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length)
                      : 'Rp 0'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Harga Rata-rata</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">+12%</div>
                  <div className="text-sm text-gray-600">Pertumbuhan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Tips Pencarian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Gunakan filter harga untuk menyesuaikan dengan budget Anda</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Pilih lokasi berdasarkan akses transportasi dan fasilitas</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Pertimbangkan fasilitas yang sesuai dengan kebutuhan keluarga</p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dijual;