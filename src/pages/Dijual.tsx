import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { 
  Search, 
  MapPin, 
  Home, 
  Building, 
  Bed, 
  Bath, 
  Square, 
  Filter,
  Heart,
  Share2,
  Eye,
  TrendingUp,
  DollarSign
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

const Dijual = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_type', 'sale')
        .eq('status', 'available')
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
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || property.property_type === selectedType;
    const matchesCity = !selectedCity || property.city === selectedCity;
    
    let matchesPriceRange = true;
    if (priceRange) {
      const price = property.price || 0;
      switch (priceRange) {
        case 'under-500m':
          matchesPriceRange = price < 500000000;
          break;
        case '500m-1b':
          matchesPriceRange = price >= 500000000 && price < 1000000000;
          break;
        case '1b-2b':
          matchesPriceRange = price >= 1000000000 && price < 2000000000;
          break;
        case 'over-2b':
          matchesPriceRange = price >= 2000000000;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesCity && matchesPriceRange;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Properti Dijual
          </h1>
          <p className="text-lg text-gray-600">
            Temukan properti impian Anda dengan harga terbaik
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari lokasi atau nama properti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe Properti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Tipe</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Kota</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Kisaran Harga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Harga</SelectItem>
                <SelectItem value="under-500m">Di bawah Rp 500 Jt</SelectItem>
                <SelectItem value="500m-1b">Rp 500 Jt - 1 M</SelectItem>
                <SelectItem value="1b-2b">Rp 1 M - 2 M</SelectItem>
                <SelectItem value="over-2b">Di atas Rp 2 M</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={fetchProperties}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan {filteredProperties.length} dari {properties.length} properti
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
              Tidak ada properti ditemukan
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

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Dijual
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle 
                      className="text-lg hover:text-blue-600 cursor-pointer line-clamp-2"
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
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(property.price || 0)}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>245</span>
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

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
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
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Insight Pasar Properti</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
              <div className="text-sm text-gray-600">Properti Tersedia</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Rp 1.2M</div>
              <div className="text-sm text-gray-600">Harga Rata-rata</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">+12%</div>
              <div className="text-sm text-gray-600">Pertumbuhan YoY</div>
            </div>
          </div>
        </div>
      </div>

      <ProfessionalFooter language="id" />
    </div>
  );
};

export default Dijual;