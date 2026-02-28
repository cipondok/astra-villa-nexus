import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { getCurrencyFormatterShort } from "@/stores/currencyStore";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
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
import PropertyComparisonButton from "@/components/property/PropertyComparisonButton";
import InlineFilterPanel from "@/components/property/InlineFilterPanel";
const PropertyListingMapView = lazy(() => import("@/components/property/PropertyListingMapView"));
import PropertyViewModeToggle from "@/components/search/PropertyViewModeToggle";
import PropertyListView from "@/components/search/PropertyListView";
import SearchPagination from "@/components/search/SearchPagination";
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
  thumbnail_url?: string;
  status: string;
  created_at: string;
  property_features?: Record<string, any>;
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cameFromHome = searchParams.get('from') === 'home';
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 15;

  const {
    properties: fetchedProperties,
    totalCount,
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
    setCurrentPage(1);
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
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [properties, filters]);

  const totalPages = Math.ceil(filteredProperties.length / RESULTS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return filteredProperties.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredProperties, currentPage, RESULTS_PER_PAGE]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('properties-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    return getCurrencyFormatterShort()(price);
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
        title={t('seo.dijual.title')}
        description={t('seo.dijual.description')}
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
                  Menampilkan {filteredProperties.length}{totalCount !== null && totalCount > filteredProperties.length ? ` dari ${totalCount}+` : ''} properti
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="h-8 sm:h-9 w-[130px] sm:w-[160px] text-xs sm:text-sm bg-background border-border rounded-md">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                  <SelectItem value="popular">Terpopuler</SelectItem>
                </SelectContent>
              </Select>
              <PropertyViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
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

      {/* Inline Filter Panel */}
      <div className="px-3 sm:px-4 py-2">
        <InlineFilterPanel
          filters={{
            propertyType: filters.propertyType,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            bedrooms: filters.bedrooms,
            bathrooms: filters.bathrooms,
          }}
          onFiltersChange={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
          propertyTypes={propertyTypes}
          maxPriceLimit={10_000_000_000}
          priceStep={100_000_000}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      </div>

      {/* Properties Content */}
      <div id="properties-content" className="p-3 sm:p-4 md:p-6">
        {viewMode === 'map' ? (
          <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PropertyListingMapView properties={filteredProperties} formatPrice={formatPrice} />
          </Suspense>
        ) : loading ? (
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
        ) : viewMode === 'list' ? (
          <PropertyListView
            properties={paginatedProperties as any}
            onPropertyClick={(property) => navigate(`/properties/${property.id}`)}
            onSave={(property) => handleSaveProperty(property.id)}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {paginatedProperties.map((property) => (
              <Card
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="group cursor-pointer overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.image_urls?.[0] || property.images?.[0] || "/placeholder.svg"}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <PropertyComparisonButton property={{
                      id: property.id,
                      title: property.title,
                      price: property.price || 0,
                      location: property.location || '',
                      listing_type: 'sale',
                      bedrooms: property.bedrooms,
                      bathrooms: property.bathrooms,
                      area_sqm: property.area_sqm,
                      property_type: property.property_type,
                      images: property.images,
                      thumbnail_url: property.thumbnail_url,
                      property_features: property.property_features,
                    }} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-background/90 hover:bg-background rounded-full shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveProperty(property.id);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${savedProperties.has(property.id) ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                      />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                    <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded">
                      Dijual
                    </Badge>
                    <Badge variant="secondary" className="bg-background/90 text-foreground text-xs font-medium px-2 py-0.5 rounded capitalize">
                      {property.property_type || 'Properti'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-base sm:text-lg font-bold text-primary mb-1">
                    {formatPrice(property.price || 0)}
                  </p>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{property.city || property.location}</span>
                  </div>
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

        {/* Pagination */}
        {!loading && filteredProperties.length > RESULTS_PER_PAGE && viewMode !== 'map' && (
          <div className="mt-6">
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={filteredProperties.length}
              pageSize={RESULTS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
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
