import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PropertySidebarFilters from "@/components/property/PropertySidebarFilters";
import BackToHomeLink from "@/components/common/BackToHomeLink";
import { 
  MapPin, 
  Home, 
  Building, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Search,
  ArrowLeft,
  SlidersHorizontal,
  ChevronRight
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cameFromHome = searchParams.get('from') === 'home';
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Demo properties for display
  const demoProperties: Property[] = [
    {
      id: 'demo-sale-1',
      title: 'Modern Minimalist House',
      description: 'Beautiful modern house in prime location',
      price: 2800000000,
      property_type: 'house',
      listing_type: 'sale',
      location: 'Pondok Indah',
      city: 'Jakarta Selatan',
      area: 'Pondok Indah',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 250,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      image_urls: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-sale-2',
      title: 'Luxury Apartment SCBD',
      description: 'Premium apartment with city view',
      price: 4500000000,
      property_type: 'apartment',
      listing_type: 'sale',
      location: 'SCBD',
      city: 'Jakarta Selatan',
      area: 'SCBD',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 180,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      image_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-sale-3',
      title: 'Bali Style Villa',
      description: 'Tropical villa with private pool',
      price: 6200000000,
      property_type: 'villa',
      listing_type: 'sale',
      location: 'Canggu',
      city: 'Bali',
      area: 'Canggu',
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 400,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      image_urls: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-sale-4',
      title: 'Commercial Space BSD',
      description: 'Strategic commercial property',
      price: 3500000000,
      property_type: 'commercial',
      listing_type: 'sale',
      location: 'BSD City',
      city: 'Tangerang',
      area: 'BSD',
      bedrooms: 0,
      bathrooms: 2,
      area_sqm: 300,
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
      image_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-sale-5',
      title: 'Cluster House Bandung',
      description: 'New cluster in highland area',
      price: 1850000000,
      property_type: 'house',
      listing_type: 'sale',
      location: 'Dago',
      city: 'Bandung',
      area: 'Dago',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 150,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      image_urls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-sale-6',
      title: 'Investment Land Plot',
      description: 'Prime land for development',
      price: 950000000,
      property_type: 'land',
      listing_type: 'sale',
      location: 'Puncak',
      city: 'Bogor',
      area: 'Puncak',
      bedrooms: 0,
      bathrooms: 0,
      area_sqm: 800,
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      image_urls: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  // Check if user came from dashboard
  const fromDashboard = location.state?.from === 'dashboard' || 
    document.referrer.includes('/dashboard');

  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    propertyType: 'all',
    city: 'all',
    area: 'all',
    minPrice: 0,
    maxPrice: 10000000000,
    bedrooms: 'all',
    bathrooms: 'all',
    minArea: 0,
    maxArea: 1000,
    yearBuilt: '',
    condition: '',
    features: [],
    sortBy: 'newest'
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
      // Use demo data if no real properties exist
      const realData = data || [];
      setProperties(realData.length > 0 ? realData : demoProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback to demo data on error
      setProperties(demoProperties);
      toast({
        title: "Info",
        description: "Menampilkan data demo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = properties.filter(property => {
      const matchesSearch = !filters.searchTerm || 
        property.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesType = !filters.propertyType || filters.propertyType === "all" || 
        property.property_type === filters.propertyType;
      
      const matchesCity = !filters.city || filters.city === "all" || 
        property.city === filters.city;
      
      const matchesArea = !filters.area || filters.area === "all" || 
        property.area === filters.area;
      
      const price = property.price || 0;
      const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;
      
      const area = property.area_sqm || 0;
      const matchesAreaSize = area >= filters.minArea && area <= filters.maxArea;
      
      const matchesBedrooms = !filters.bedrooms || filters.bedrooms === "all" || 
        (filters.bedrooms === "5+" ? property.bedrooms >= 5 : property.bedrooms === parseInt(filters.bedrooms));
      
      const matchesBathrooms = !filters.bathrooms || filters.bathrooms === "all" || 
        (filters.bathrooms === "4+" ? property.bathrooms >= 4 : property.bathrooms === parseInt(filters.bathrooms));
      
      return matchesSearch && matchesType && matchesCity && matchesArea && 
             matchesPrice && matchesAreaSize && matchesBedrooms && matchesBathrooms;
    });

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
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}M`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}Jt`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleSaveProperty = (propertyId: string) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(propertyId)) {
      newSaved.delete(propertyId);
      toast({ title: "Dihapus dari favorit" });
    } else {
      newSaved.add(propertyId);
      toast({ title: "Ditambah ke favorit" });
    }
    setSavedProperties(newSaved);
  };

  const propertyTypes = [...new Set(properties.map(p => p.property_type))];
  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];
  const areas = [...new Set(properties.map(p => p.area).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background text-foreground pt-10 sm:pt-11 md:pt-12">
      {/* Luxury Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[250px] sm:w-[300px] md:w-[400px] h-[250px] sm:h-[300px] md:h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-52 md:w-64 h-40 sm:h-52 md:h-64 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Compact Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-primary/20">
        <div className="px-1.5 sm:px-2 py-1.5 sm:py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {cameFromHome ? (
              <BackToHomeLink sectionId="sale-section" className="mb-0" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-primary/10"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-[10px] sm:text-xs md:text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Properti Dijual</h1>
              <p className="text-[7px] sm:text-[8px] md:text-[9px] text-muted-foreground">
                {filteredProperties.length} dari {properties.length} listing
              </p>
            </div>
          </div>
          <Button 
            size="sm"
            variant="outline"
            className="h-6 sm:h-7 px-1.5 sm:px-2 text-[8px] sm:text-[9px] md:text-[10px] border-primary/30 hover:bg-primary/10"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* Compact Search */}
      <div className="p-1.5 sm:p-2 bg-background border-b border-border/50">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-1.5 sm:left-2 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
            <Input
              placeholder="Cari lokasi, tipe..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="h-6 sm:h-7 md:h-8 pl-5 sm:pl-6 md:pl-7 text-[9px] sm:text-[10px] md:text-xs"
            />
          </div>
          <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
            <SelectTrigger className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 md:w-24 text-[8px] sm:text-[9px] md:text-[10px]">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[9px] sm:text-[10px] md:text-xs">Semua</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-[9px] sm:text-[10px] md:text-xs">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
            <SelectTrigger className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 md:w-24 text-[8px] sm:text-[9px] md:text-[10px]">
              <SelectValue placeholder="Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[9px] sm:text-[10px] md:text-xs">Semua</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-[9px] sm:text-[10px] md:text-xs">{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Sidebar */}
      <PropertySidebarFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={applyFilters}
        propertyTypes={propertyTypes}
        cities={cities}
        areas={areas}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
      />

      {/* Properties List */}
      <div className="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5">
        {loading ? (
          <div className="space-y-1 sm:space-y-1.5">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-1.5 sm:p-2 animate-pulse">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-muted rounded-md sm:rounded-lg"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2.5 sm:h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                    <div className="h-2.5 sm:h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card className="p-3 sm:p-4">
            <div className="text-center py-4 sm:py-6">
              <Home className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-1.5 sm:mb-2 text-muted-foreground/50" />
              <p className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Tidak ada properti ditemukan</p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground mb-2 sm:mb-3">
                Coba sesuaikan filter pencarian
              </p>
              <Button 
                size="sm"
                variant="outline"
                className="h-6 sm:h-7 text-[8px] sm:text-[9px] md:text-[10px]"
                onClick={() => setFilters({
                  ...filters,
                  searchTerm: '',
                  propertyType: 'all',
                  city: 'all',
                  area: 'all',
                  minPrice: 0,
                  maxPrice: 10000000000,
                  bedrooms: 'all',
                  bathrooms: 'all'
                })}
              >
                Reset Filter
              </Button>
            </div>
          </Card>
        ) : (
          filteredProperties.map((property) => (
            <Card 
              key={property.id} 
              className="p-1 sm:p-1.5 active:scale-[0.99] transition-transform cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <div className="flex gap-1.5 sm:gap-2">
                {/* Thumbnail */}
                <div className="relative h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-md sm:rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {property.image_urls?.[0] || property.images?.[0] ? (
                    <img 
                      src={property.image_urls?.[0] || property.images?.[0]} 
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Building className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    </div>
                  )}
                  {/* Save Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-0.5 right-0.5 h-4 w-4 sm:h-5 sm:w-5 p-0 bg-white/80 hover:bg-white rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveProperty(property.id);
                    }}
                  >
                    <Heart 
                      className={`h-2 w-2 sm:h-2.5 sm:w-2.5 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                    />
                  </Button>
                  {/* Price Badge */}
                  <Badge className="absolute bottom-0.5 left-0.5 text-[6px] sm:text-[7px] md:text-[8px] px-0.5 sm:px-1 py-0 h-3 sm:h-3.5 md:h-4 bg-primary/90">
                    {formatPrice(property.price || 0)}
                  </Badge>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-0.5 sm:gap-1 mb-0.5">
                    <h3 className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold truncate flex-1 leading-tight">
                      {property.title || 'Untitled'}
                    </h3>
                    <Badge variant="secondary" className="text-[5px] sm:text-[6px] md:text-[7px] px-0.5 sm:px-1 py-0 h-3 sm:h-3.5 flex-shrink-0 capitalize">
                      {property.property_type}
                    </Badge>
                  </div>
                  
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] text-muted-foreground flex items-center gap-0.5 mb-0.5 sm:mb-1">
                    <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                    <span className="truncate">
                      {property.location}{property.city && `, ${property.city}`}
                    </span>
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[6px] sm:text-[7px] md:text-[8px] text-muted-foreground mb-0.5 sm:mb-1">
                    {property.bedrooms && (
                      <span className="flex items-center gap-0.5">
                        <Bed className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-0.5">
                        <Bath className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        {property.bathrooms}
                      </span>
                    )}
                    {property.area_sqm && (
                      <span className="flex items-center gap-0.5">
                        <Square className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        {property.area_sqm}m²
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-0.5 sm:gap-1">
                    <Button 
                      size="sm"
                      className="h-4 sm:h-5 px-1.5 sm:px-2 text-[6px] sm:text-[7px] md:text-[8px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/properties/${property.id}`);
                      }}
                    >
                      Detail
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-4 sm:h-5 px-1.5 sm:px-2 text-[6px] sm:text-[7px] md:text-[8px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Hubungi
                    </Button>
                  </div>
                </div>

                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground self-center flex-shrink-0" />
              </div>
            </Card>
          ))
        )}

        {/* Quick Stats */}
        {!loading && filteredProperties.length > 0 && (
          <Card className="p-1.5 sm:p-2 mt-2 sm:mt-3">
            <div className="flex items-center justify-between text-[7px] sm:text-[8px] md:text-[9px]">
              <div className="text-center">
                <p className="font-bold text-primary">{properties.length}</p>
                <p className="text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-600">
                  {properties.length > 0 
                    ? formatPrice(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length)
                    : 'Rp 0'
                  }
                </p>
                <p className="text-muted-foreground">Rata-rata</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-blue-600">{cities.length}</p>
                <p className="text-muted-foreground">Kota</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dijual;
