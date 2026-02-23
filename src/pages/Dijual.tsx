import { useState, useEffect, useMemo } from "react";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { useInfiniteProperties } from "@/hooks/useInfiniteProperties";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
  Eye
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
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    properties: fetchedProperties,
    isLoading: loading,
    isFetchingMore,
    hasMore,
    sentinelRef,
    reset,
  } = useInfiniteProperties({
    listingType: 'sale',
    pageSize: 12,
  });

  const {
    isPulling, pullDistance, isRefreshing,
    indicatorOpacity, indicatorRotation, threshold,
    handlers,
  } = usePullToRefresh({
    onRefresh: async () => { reset(); },
  });

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

  // Use demo data if no real properties
  const properties = fetchedProperties.length > 0 ? fetchedProperties : (!loading ? demoProperties : []);


  const filteredProperties = useMemo(() => {
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

    return filtered;
  }, [properties, filters]);

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
        title="Properti Dijual di Indonesia"
        description="Temukan rumah, villa, apartemen, dan properti dijual di seluruh Indonesia. Harga terbaik, pilihan terlengkap di ASTRA Villa Realty."
        keywords="properti dijual, rumah dijual, villa dijual, apartemen dijual, jual beli properti Indonesia"
        jsonLd={seoSchemas.breadcrumb([{ name: 'Beranda', url: '/' }, { name: 'Properti Dijual', url: '/dijual' }])}
      />
      {/* Clean Header with Primary Blue */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {cameFromHome ? (
                <BackToHomeLink sectionId="sale-section" className="mb-0" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4 text-foreground" />
                </Button>
              )}
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">Properti Dijual</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredProperties.length} properti tersedia
                </p>
              </div>
            </div>
            <Button 
              size="sm"
              variant={isFilterOpen ? "default" : "outline"}
              className="h-9 px-4 text-sm font-medium rounded-md"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 sm:p-4 bg-secondary/50 border-b border-border">
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari lokasi, nama properti..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="h-10 sm:h-11 pl-10 text-sm bg-background border-border rounded-md focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
            <SelectTrigger className="h-10 sm:h-11 w-28 sm:w-32 text-sm bg-background border-border rounded-md">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
            <SelectTrigger className="h-10 sm:h-11 w-28 sm:w-36 text-sm bg-background border-border rounded-md hidden sm:flex">
              <SelectValue placeholder="Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kota</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Sidebar */}
      <PropertySidebarFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={() => {}}
        propertyTypes={propertyTypes}
        cities={cities}
        areas={areas}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
      />

      {/* Properties Grid */}
      <div className="p-3 sm:p-4 md:p-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="group cursor-pointer overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.image_urls?.[0] || property.images?.[0] || "/placeholder.svg"}
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
                      Dijual
                    </Badge>
                    <Badge variant="secondary" className="bg-background/90 text-foreground text-xs font-medium px-2 py-0.5 rounded capitalize">
                      {property.property_type || 'Properti'}
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <CardContent className="p-3 sm:p-4">
                  {/* Price */}
                  <p className="text-base sm:text-lg font-bold text-primary mb-1">
                    {formatPrice(property.price || 0)}
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
            ))}
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

        {/* Stats Summary */}
        {!loading && filteredProperties.length > 0 && (
          <Card className="mt-6 p-4 border-border">
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">{properties.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Properti</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {properties.length > 0 
                    ? formatPrice(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length)
                    : 'Rp 0'
                  }
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Harga Rata-rata</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">{cities.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Kota</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dijual;
