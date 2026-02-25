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
import { useAdvancedPropertyFilters } from "@/hooks/useAdvancedPropertyFilters";
import RentalSidebarFilters from "@/components/rental/RentalSidebarFilters";
import type { AdvancedRentalFilters } from "@/components/rental/RentalSidebarFilters";
import RentalMobileFilterSheet from "@/components/rental/RentalMobileFilterSheet";
import PropertyListingMapView from "@/components/property/PropertyListingMapView";
import PropertyViewModeToggle from "@/components/search/PropertyViewModeToggle";
import PropertyListView from "@/components/search/PropertyListView";
import SearchPagination from "@/components/search/SearchPagination";
import BackToHomeLink from "@/components/common/BackToHomeLink";
import { MapPin, Home, Bed, Bath, Square, Heart, Zap, Calendar, User, Star, TrendingUp, ShieldCheck, Box, Globe } from "lucide-react";

const RESULTS_PER_PAGE = 15;

const DEFAULT_FILTERS: AdvancedRentalFilters = {
  searchTerm: "", propertyType: "all", province: "all", city: "all", area: "",
  priceRange: "all", rentalPeriod: [], checkInDate: undefined, checkOutDate: undefined,
  onlineBookingOnly: false, minimumDays: 0, nearMe: false, userLocation: null,
  bedrooms: "all", bathrooms: "all", minPrice: 0, maxPrice: 100_000_000, sortBy: "newest",
  furnishing: "all", minArea: 0, maxArea: 1000,
  minLandArea: 0, maxLandArea: 5000, minBuildingArea: 0, maxBuildingArea: 2000,
  floors: "all", hasPool: false, garageCount: "all", viewType: "all",
  minRoi: 0, maxRoi: 50, minYield: 0, maxYield: 30,
  legalStatus: "all", foreignOwnershipFriendly: false, paymentPlanAvailable: false,
  handoverYear: "all", has3DTour: false, hasVR: false, has360View: false,
  hasDroneVideo: false, hasInteractiveFloorplan: false, listingStatus: "all",
};

const Disewa = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AdvancedRentalFilters>(DEFAULT_FILTERS);

  const { data, isLoading: loading, refetch } = useAdvancedPropertyFilters({
    filters,
    page: currentPage,
    pageSize: RESULTS_PER_PAGE,
  });

  const properties = data?.properties || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / RESULTS_PER_PAGE);

  const { isPulling, pullDistance, isRefreshing, indicatorOpacity, indicatorRotation, threshold, handlers } = usePullToRefresh({
    onRefresh: async () => { refetch(); },
  });

  useEffect(() => { setCurrentPage(1); }, [filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('properties-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)} M`;
    if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(1)} Jt`;
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

  const handleBookingClick = (e: React.MouseEvent, property: any) => {
    e.stopPropagation();
    if (property.online_booking_enabled && property.booking_type !== 'owner_only') {
      navigate(`/booking/${property.id}`);
    } else {
      toast({ title: "Hubungi Pemilik", description: "Properti ini hanya bisa dibooking melalui pemilik langsung." });
    }
  };

  const handleFiltersChange = (updates: Partial<AdvancedRentalFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const getRentalPeriodLabel = (periods: string[]) => {
    if (!periods || periods.length === 0) return "Bulanan";
    return periods.map(p => {
      switch (p) { case 'daily': return 'Harian'; case 'weekly': return 'Mingguan'; case 'monthly': return 'Bulanan'; case 'yearly': return 'Tahunan'; default: return p; }
    }).join(', ');
  };

  const cities = useMemo(() => [...new Set(properties.map(p => p.city).filter(Boolean))], [properties]);
  const propertyTypes = useMemo(() => [...new Set(properties.map(p => p.property_type).filter(Boolean))], [properties]);

  // Active filter chips
  const activeChips: { label: string; key: string }[] = [];
  if (filters.propertyType !== "all") activeChips.push({ label: filters.propertyType, key: "type" });
  if (filters.city !== "all") activeChips.push({ label: filters.city, key: "city" });
  if (filters.listingStatus !== "all") activeChips.push({ label: filters.listingStatus, key: "status" });
  if (filters.legalStatus !== "all") activeChips.push({ label: filters.legalStatus.toUpperCase(), key: "legal" });
  if (filters.viewType !== "all") activeChips.push({ label: `View: ${filters.viewType}`, key: "view" });
  if (filters.hasPool) activeChips.push({ label: "Pool", key: "pool" });
  if (filters.foreignOwnershipFriendly) activeChips.push({ label: "WNA Friendly", key: "wna" });
  if (filters.has3DTour) activeChips.push({ label: "3D Tour", key: "3d" });
  if (filters.hasVR) activeChips.push({ label: "VR", key: "vr" });
  if (filters.hasDroneVideo) activeChips.push({ label: "Drone", key: "drone" });
  if (filters.onlineBookingOnly) activeChips.push({ label: "Online Booking", key: "online" });

  return (
    <div {...handlers} className="min-h-screen bg-background text-foreground">
      <PullToRefreshIndicator isPulling={isPulling} isRefreshing={isRefreshing} pullDistance={pullDistance} indicatorOpacity={indicatorOpacity} indicatorRotation={indicatorRotation} threshold={threshold} />
      <SEOHead
        title={t('seo.disewa.title')}
        description={t('seo.disewa.description')}
        keywords="properti disewa, villa disewa, apartemen sewa, rumah sewa, kos-kosan Indonesia, ROI properti, SHM, HGB"
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
                <p className="text-xs text-muted-foreground">{totalCount.toLocaleString()} properti ditemukan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RentalMobileFilterSheet
                filters={filters}
                onFiltersChange={handleFiltersChange}
                propertyTypes={propertyTypes}
                cities={cities}
                resultCount={totalCount}
                open={mobileFilterOpen}
                onOpenChange={setMobileFilterOpen}
              />
              <Select value={filters.sortBy} onValueChange={v => handleFiltersChange({ sortBy: v })}>
                <SelectTrigger className="h-8 w-[130px] sm:w-[160px] text-xs bg-background border-border rounded-md">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                  <SelectItem value="roi_high">ROI Tertinggi</SelectItem>
                  <SelectItem value="yield_high">Yield Tertinggi</SelectItem>
                </SelectContent>
              </Select>
              <PropertyViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeChips.map(chip => (
                <Badge key={chip.key} variant="secondary" className="text-xs capitalize">{chip.label}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="container mx-auto px-3 sm:px-4 py-4">
        <div className="flex gap-5">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="sticky top-[80px]">
              <RentalSidebarFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                propertyTypes={propertyTypes}
                cities={cities}
                resultCount={totalCount}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0" id="properties-content">
            {viewMode === 'map' ? (
              <PropertyListingMapView properties={properties as any} formatPrice={formatPrice} />
            ) : loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-muted h-64 sm:h-72" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <Card className="p-8 sm:p-12 border-border">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada properti ditemukan</h3>
                  <p className="text-sm text-muted-foreground mb-4">Coba sesuaikan filter pencarian Anda</p>
                  <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset Filter</Button>
                </div>
              </Card>
            ) : viewMode === 'list' ? (
              <PropertyListView
                properties={properties as any}
                onPropertyClick={(property) => navigate(`/properties/${property.id}`)}
                onSave={(property) => handleSaveProperty(property.id)}
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {properties.map(property => {
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
                          {property.wna_eligible && (
                            <Badge className="bg-chart-2/80 text-primary-foreground text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
                              <Globe className="h-2.5 w-2.5" /> WNA
                            </Badge>
                          )}
                        </div>
                        {/* Bottom badges */}
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {property.three_d_model_url && (
                            <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] gap-0.5">
                              <Box className="h-2.5 w-2.5" /> 3D
                            </Badge>
                          )}
                          {property.legal_status && (
                            <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] gap-0.5">
                              <ShieldCheck className="h-2.5 w-2.5" /> {property.legal_status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        {/* ROI badge */}
                        {property.roi_percentage && property.roi_percentage > 0 && (
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary" className="bg-chart-1/90 text-primary-foreground text-[10px] gap-0.5">
                              <TrendingUp className="h-2.5 w-2.5" /> {property.roi_percentage}% ROI
                            </Badge>
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
                          {property.land_area_sqm > 0 && <div className="text-[10px] text-muted-foreground">LT:{property.land_area_sqm}m²</div>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && viewMode !== 'map' && (
              <div className="mt-6">
                <SearchPagination currentPage={currentPage} totalPages={totalPages} totalCount={totalCount} pageSize={RESULTS_PER_PAGE} onPageChange={handlePageChange} />
              </div>
            )}

            {/* Rental Tips */}
            {!loading && properties.length > 0 && (
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
                      <ShieldCheck className="h-5 w-5 text-chart-1" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">Status Hukum</h3>
                    <p className="text-xs text-muted-foreground">Gunakan filter SHM, HGB, atau Leasehold untuk keamanan investasi Anda.</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-md border border-accent/10">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">ROI & Yield</h3>
                    <p className="text-xs text-muted-foreground">Filter berdasarkan ROI dan rental yield untuk keputusan investasi cerdas.</p>
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
