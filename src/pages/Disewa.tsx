import { useState, useEffect, useMemo } from "react";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { useNavigate } from "react-router-dom";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteProperties } from "@/hooks/useInfiniteProperties";
import RentalSidebarFilters from "@/components/rental/RentalSidebarFilters";
import RentalMobileFilterSheet from "@/components/rental/RentalMobileFilterSheet";
import PropertyListingMapView from "@/components/property/PropertyListingMapView";
import PropertyViewModeToggle from "@/components/search/PropertyViewModeToggle";
import PropertyListView from "@/components/search/PropertyListView";
import SearchPagination from "@/components/search/SearchPagination";
import BackToHomeLink from "@/components/common/BackToHomeLink";
import { MapPin, Home, Bed, Bath, Square, Heart, Zap, Calendar, User, Star } from "lucide-react";

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
  bedrooms: string;
  bathrooms: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  furnishing?: string;
  minArea?: number;
  maxArea?: number;
}

const Disewa = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    properties, totalCount, isLoading: loading, isFetchingMore, hasMore, sentinelRef, reset,
  } = useInfiniteProperties({ listingType: 'rent', pageSize: 12 });

  const { isPulling, pullDistance, isRefreshing, indicatorOpacity, indicatorRotation, threshold, handlers } = usePullToRefresh({
    onRefresh: async () => { reset(); },
  });

  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 15;
  const [filters, setFilters] = useState<RentalFilters>({
    searchTerm: "", propertyType: "all", province: "all", city: "all", priceRange: "all",
    rentalPeriod: [], checkInDate: undefined, checkOutDate: undefined,
    onlineBookingOnly: false, minimumDays: 0, nearMe: false, userLocation: null,
    bedrooms: "all", bathrooms: "all", minPrice: 0, maxPrice: 100_000_000, sortBy: 'newest',
    furnishing: "all", minArea: 0, maxArea: 1000,
  });

  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = !filters.searchTerm ||
        property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesType = filters.propertyType === "all" || property.property_type === filters.propertyType;
      const matchesCity = filters.city === "all" || property.city === filters.city;
      const price = property.price || 0;
      const matchesSliderPrice = price >= filters.minPrice && price <= filters.maxPrice;
      const matchesBedrooms = !filters.bedrooms || filters.bedrooms === "all" ||
        (filters.bedrooms === "5+" ? property.bedrooms >= 5 : property.bedrooms === parseInt(filters.bedrooms));
      const matchesBathrooms = !filters.bathrooms || filters.bathrooms === "all" ||
        (filters.bathrooms === "4+" ? property.bathrooms >= 4 : property.bathrooms === parseInt(filters.bathrooms));
      const matchesRentalPeriod = filters.rentalPeriod.length === 0 ||
        (property.rental_periods && property.rental_periods.some(period => filters.rentalPeriod.includes(period)));
      const matchesOnlineBooking = !filters.onlineBookingOnly ||
        (property.online_booking_enabled && property.booking_type !== 'owner_only');
      const matchesArea = (!filters.minArea && !filters.maxArea) ||
        (property.area_sqm >= (filters.minArea || 0) && property.area_sqm <= (filters.maxArea || 1000));

      return matchesSearch && matchesType && matchesCity && matchesSliderPrice &&
        matchesBedrooms && matchesBathrooms && matchesRentalPeriod && matchesOnlineBooking && matchesArea;
    });

    switch (filters.sortBy) {
      case 'price_low': filtered.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price_high': filtered.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'oldest': filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'popular': filtered.sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0)); break;
      default: filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }
    return filtered;
  }, [properties, filters]);

  const totalPages = Math.ceil(filteredProperties.length / RESULTS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return filteredProperties.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('properties-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { setCurrentPage(1); }, [filters]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(1)} Jt`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleSaveProperty = (propertyId: string) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(propertyId)) {
      newSaved.delete(propertyId);
      toast({ title: "Dihapus dari favorit", description: "Properti telah dihapus dari daftar favorit Anda." });
    } else {
      newSaved.add(propertyId);
      toast({ title: "Ditambah ke favorit", description: "Properti telah ditambahkan ke daftar favorit Anda." });
    }
    setSavedProperties(newSaved);
  };

  const handleBookingClick = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    if (property.online_booking_enabled && property.booking_type !== 'owner_only') {
      navigate(`/booking/${property.id}`);
    } else {
      toast({ title: "Hubungi Pemilik", description: "Properti ini hanya bisa dibooking melalui pemilik langsung." });
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

  const handleFiltersChange = (updates: Partial<RentalFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Active filter chips for results header
  const activeChips: { label: string; key: string }[] = [];
  if (filters.propertyType !== "all") activeChips.push({ label: filters.propertyType, key: "type" });
  if (filters.city !== "all") activeChips.push({ label: filters.city, key: "city" });
  if (filters.rentalPeriod.length > 0) activeChips.push({ label: filters.rentalPeriod.map(p => p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : p === 'monthly' ? 'Bulanan' : 'Tahunan').join(', '), key: "period" });
  if (filters.onlineBookingOnly) activeChips.push({ label: "Online Booking", key: "online" });

  return (
    <div {...handlers} className="min-h-screen bg-background text-foreground">
      <PullToRefreshIndicator isPulling={isPulling} isRefreshing={isRefreshing} pullDistance={pullDistance} indicatorOpacity={indicatorOpacity} indicatorRotation={indicatorRotation} threshold={threshold} />
      <SEOHead
        title={t('seo.disewa.title')}
        description={t('seo.disewa.description')}
        keywords="properti disewa, villa disewa, apartemen sewa, rumah sewa, kos-kosan Indonesia"
        jsonLd={seoSchemas.breadcrumb([{ name: 'Beranda', url: '/' }, { name: 'Properti Disewa', url: '/disewa' }])}
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackToHomeLink sectionId="rent-section" className="mb-0" />
              <div>
                <h1 className="text-base sm:text-lg font-bold text-foreground">Properti Disewa</h1>
                <p className="text-xs text-muted-foreground">
                  {filteredProperties.length}{totalCount !== null && totalCount > filteredProperties.length ? ` dari ${totalCount}+` : ''} properti
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RentalMobileFilterSheet
                filters={filters}
                onFiltersChange={handleFiltersChange}
                propertyTypes={propertyTypes}
                cities={cities}
                resultCount={filteredProperties.length}
                open={mobileFilterOpen}
                onOpenChange={setMobileFilterOpen}
              />
              <Select value={filters.sortBy} onValueChange={v => handleFiltersChange({ sortBy: v })}>
                <SelectTrigger className="h-8 w-[130px] sm:w-[150px] text-xs bg-background border-border rounded-md">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                  <SelectItem value="popular">Terpopuler</SelectItem>
                </SelectContent>
              </Select>
              <PropertyViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeChips.map(chip => (
                <Badge key={chip.key} variant="secondary" className="text-xs capitalize">
                  {chip.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="container mx-auto px-3 sm:px-4 py-4">
        <div className="flex gap-5">
          {/* Left Sidebar - desktop only */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-[80px]">
              <RentalSidebarFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                propertyTypes={propertyTypes}
                cities={cities}
                resultCount={filteredProperties.length}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0" id="properties-content">
            {viewMode === 'map' ? (
              <PropertyListingMapView properties={filteredProperties} formatPrice={formatPrice} />
            ) : loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-muted h-64 sm:h-72" />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <Card className="p-8 sm:p-12 border-border">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada properti ditemukan</h3>
                  <p className="text-sm text-muted-foreground mb-4">Coba sesuaikan filter pencarian Anda</p>
                  <Button variant="outline" onClick={() => handleFiltersChange({
                    searchTerm: '', propertyType: 'all', city: 'all', rentalPeriod: [], onlineBookingOnly: false,
                    minPrice: 0, maxPrice: 100_000_000, bedrooms: 'all', bathrooms: 'all',
                  })}>
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {paginatedProperties.map(property => {
                  const imageUrl = property.image_urls?.[0] || property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
                  const isOnlineBookable = property.online_booking_enabled && property.booking_type !== 'owner_only';
                  return (
                    <Card
                      key={property.id}
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="group cursor-pointer overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={imageUrl} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <Button
                          size="sm" variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/90 hover:bg-background rounded-full shadow-md"
                          onClick={(e) => { e.stopPropagation(); handleSaveProperty(property.id); }}
                        >
                          <Heart className={`h-4 w-4 ${savedProperties.has(property.id) ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                        </Button>
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5">
                            {getRentalPeriodLabel(property.rental_periods || ['monthly']).split(',')[0]}
                          </Badge>
                          {isOnlineBookable && (
                            <Badge className="bg-chart-1 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 flex items-center gap-0.5">
                              <Zap className="h-2.5 w-2.5" /> Instant
                            </Badge>
                          )}
                        </div>
                        {/* Rating placeholder */}
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-chart-1 text-chart-1" /> 4.8
                          </Badge>
                        </div>
                        {/* Book Now hover overlay */}
                        {isOnlineBookable && (
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="default" className="shadow-lg text-xs" onClick={(e) => handleBookingClick(e, property)}>
                              Book Now
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm sm:text-base font-bold text-primary mb-0.5">
                          {formatPrice(property.price)}
                          <span className="text-[10px] font-normal text-muted-foreground ml-1">
                            /{getRentalPeriodLabel(property.rental_periods || ['monthly']).split(',')[0].toLowerCase()}
                          </span>
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1 mb-1">{property.title}</h3>
                        <div className="flex items-center gap-1 text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="text-[11px] truncate">{property.city || property.location}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground border-t border-border pt-2">
                          {property.bedrooms > 0 && <div className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</div>}
                          {property.bathrooms > 0 && <div className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</div>}
                          {property.area_sqm > 0 && <div className="flex items-center gap-0.5"><Square className="h-3 w-3" />{property.area_sqm}m²</div>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredProperties.length > RESULTS_PER_PAGE && viewMode !== 'map' && (
              <div className="mt-6">
                <SearchPagination currentPage={currentPage} totalPages={totalPages} totalCount={filteredProperties.length} pageSize={RESULTS_PER_PAGE} onPageChange={handlePageChange} />
              </div>
            )}

            {/* Rental Tips */}
            {!loading && filteredProperties.length > 0 && (
              <Card className="mt-6 p-4 sm:p-6 border-border">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Tips Menyewa Properti</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">Online Booking</h3>
                    <p className="text-xs text-muted-foreground">Properti dengan badge "Instant" dapat langsung dibooking melalui ASTRA Villa.</p>
                  </div>
                  <div className="p-4 bg-chart-1/5 rounded-md border border-chart-1/10">
                    <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center mb-3">
                      <Calendar className="h-5 w-5 text-chart-1" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">Periode Fleksibel</h3>
                    <p className="text-xs text-muted-foreground">Pilih periode sewa: harian, mingguan, bulanan, atau tahunan.</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-md border border-accent/10">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">Owner Only</h3>
                    <p className="text-xs text-muted-foreground">Beberapa properti hanya bisa dibooking langsung dengan pemilik.</p>
                  </div>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Disewa;
