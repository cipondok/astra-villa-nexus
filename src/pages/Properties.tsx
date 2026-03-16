import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Search, MapPin, Building2, Bed, Bath, Maximize, Heart,
  Grid3X3, List, ArrowLeft, Home, X, SlidersHorizontal, RotateCcw,
  TrendingUp, Sparkles, Map,
} from "lucide-react";

const PropertyListingMapView = lazy(() => import("@/components/property/PropertyListingMapView"));
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  image_urls: string[];
  status: string;
  created_at: string;
}

// Province name mapping (Indonesian to English)
const provinceNameMapping: Record<string, string[]> = {
  'Aceh': ['Aceh'],
  'Sumatera Utara': ['North Sumatra', 'Sumatra Utara', 'Medan'],
  'Sumatera Barat': ['West Sumatra', 'Sumatra Barat', 'Padang'],
  'Riau': ['Riau', 'Pekanbaru'],
  'Kepulauan Riau': ['Riau Islands', 'Batam'],
  'Jambi': ['Jambi'],
  'Sumatera Selatan': ['South Sumatra', 'Sumatra Selatan', 'Palembang'],
  'Bengkulu': ['Bengkulu'],
  'Bangka Belitung': ['Bangka Belitung'],
  'Lampung': ['Lampung'],
  'Banten': ['Banten', 'Tangerang', 'Serang'],
  'DKI Jakarta': ['Jakarta', 'DKI Jakarta', 'Central Jakarta', 'South Jakarta', 'North Jakarta', 'West Jakarta', 'East Jakarta'],
  'Jawa Barat': ['West Java', 'Jawa Barat', 'Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cimahi', 'Karawang', 'Cirebon'],
  'Jawa Tengah': ['Central Java', 'Jawa Tengah', 'Semarang', 'Solo', 'Surakarta'],
  'Yogyakarta': ['DIY Yogyakarta', 'Yogyakarta', 'Jogja', 'Jogjakarta'],
  'Jawa Timur': ['East Java', 'Jawa Timur', 'Surabaya', 'Malang', 'Sidoarjo'],
  'Kalimantan Barat': ['West Kalimantan', 'Kalimantan Barat', 'Pontianak'],
  'Kalimantan Tengah': ['Central Kalimantan', 'Kalimantan Tengah', 'Palangkaraya'],
  'Kalimantan Selatan': ['South Kalimantan', 'Kalimantan Selatan', 'Banjarmasin'],
  'Kalimantan Timur': ['East Kalimantan', 'Kalimantan Timur', 'Balikpapan', 'Samarinda'],
  'Kalimantan Utara': ['North Kalimantan', 'Kalimantan Utara', 'Tarakan'],
  'Sulawesi Utara': ['North Sulawesi', 'Sulawesi Utara', 'Manado'],
  'Gorontalo': ['Gorontalo'],
  'Sulawesi Tengah': ['Central Sulawesi', 'Sulawesi Tengah', 'Palu'],
  'Sulawesi Barat': ['West Sulawesi', 'Sulawesi Barat'],
  'Sulawesi Selatan': ['South Sulawesi', 'Sulawesi Selatan', 'Makassar'],
  'Sulawesi Tenggara': ['Southeast Sulawesi', 'Sulawesi Tenggara', 'Kendari'],
  'Bali': ['Bali', 'Denpasar', 'Seminyak', 'Ubud', 'Kuta', 'Sanur', 'Canggu'],
  'Nusa Tenggara Barat': ['West Nusa Tenggara', 'NTB', 'Lombok', 'Mataram'],
  'Nusa Tenggara Timur': ['East Nusa Tenggara', 'NTT', 'Kupang'],
  'Maluku Utara': ['North Maluku', 'Maluku Utara', 'Ternate'],
  'Maluku': ['Maluku', 'Ambon'],
  'Papua Barat': ['West Papua', 'Papua Barat', 'Sorong'],
  'Papua': ['Papua', 'Jayapura'],
};

const PROPERTY_TYPES = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'house', label: 'Rumah' },
  { value: 'apartment', label: 'Apartemen' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Tanah' },
  { value: 'commercial', label: 'Komersial' },
  { value: 'warehouse', label: 'Gudang' },
  { value: 'office', label: 'Kantor' },
];

const BEDROOM_OPTIONS = [
  { value: '0', label: 'Semua' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru', icon: Sparkles },
  { value: 'price_asc', label: 'Harga Terendah', icon: TrendingUp },
  { value: 'price_desc', label: 'Harga Tertinggi', icon: TrendingUp },
  { value: 'area_desc', label: 'Luas Terbesar', icon: Maximize },
];

const MAX_PRICE = 50_000_000_000;

/* ─── Filter Sidebar Content ─── */
const FilterPanelContent = ({
  propertyType, setPropertyType,
  minBedrooms, setMinBedrooms,
  minBathrooms, setMinBathrooms,
  priceRange, setPriceRange,
  minArea, setMinArea,
  maxArea, setMaxArea,
  resetFilters,
}: any) => (
  <div className="space-y-6">
    {/* Property Type */}
    <div className="space-y-2">
      <label className="text-xs font-semibold text-foreground tracking-wide">Tipe Properti</label>
      <Select value={propertyType} onValueChange={setPropertyType}>
        <SelectTrigger className="h-10 text-sm rounded-xl border-border/50 bg-muted/30">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROPERTY_TYPES.map((pt) => (
            <SelectItem key={pt.value} value={pt.value} className="text-sm">{pt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Bedrooms & Bathrooms */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground tracking-wide">Kamar Tidur</label>
        <Select value={minBedrooms} onValueChange={setMinBedrooms}>
          <SelectTrigger className="h-10 text-sm rounded-xl border-border/50 bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground tracking-wide">Kamar Mandi</label>
        <Select value={minBathrooms} onValueChange={setMinBathrooms}>
          <SelectTrigger className="h-10 text-sm rounded-xl border-border/50 bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Price Range */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground tracking-wide">Rentang Harga</label>
        <span className="text-[11px] text-primary font-medium">
          {priceRange[0] > 0 || priceRange[1] < MAX_PRICE
            ? `${formatCurrency(priceRange[0])} — ${priceRange[1] >= MAX_PRICE ? '∞' : formatCurrency(priceRange[1])}`
            : 'Semua harga'}
        </span>
      </div>
      <Slider
        value={priceRange}
        onValueChange={(v) => setPriceRange(v as [number, number])}
        min={0}
        max={MAX_PRICE}
        step={100_000_000}
        className="w-full"
      />
    </div>

    {/* Area */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground tracking-wide">Luas Min (m²)</label>
        <Input
          type="number"
          placeholder="0"
          value={minArea}
          onChange={(e) => setMinArea(e.target.value)}
          className="h-10 text-sm rounded-xl border-border/50 bg-muted/30"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground tracking-wide">Luas Maks (m²)</label>
        <Input
          type="number"
          placeholder="∞"
          value={maxArea}
          onChange={(e) => setMaxArea(e.target.value)}
          className="h-10 text-sm rounded-xl border-border/50 bg-muted/30"
        />
      </div>
    </div>

    {/* Reset */}
    <Button variant="outline" onClick={resetFilters} className="w-full h-10 rounded-xl text-sm border-border/50">
      <RotateCcw className="h-3.5 w-3.5 mr-2" />
      Reset Semua Filter
    </Button>
  </div>
);

const Properties = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [minBedrooms, setMinBedrooms] = useState('0');
  const [minBathrooms, setMinBathrooms] = useState('0');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  const activeFilterCount = [
    propertyType !== 'all',
    minBedrooms !== '0',
    minBathrooms !== '0',
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE,
    !!minArea || !!maxArea,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setPropertyType('all');
    setMinBedrooms('0');
    setMinBathrooms('0');
    setPriceRange([0, MAX_PRICE]);
    setMinArea('');
    setMaxArea('');
    setSortBy('newest');
    setFilterType('all');
    setSearchQuery('');
  };

  const getSearchTerms = (provinceName: string): string[] => {
    const terms = provinceNameMapping[provinceName] || [provinceName];
    return [provinceName, ...terms];
  };

  useEffect(() => {
    if (locationFilter && searchQuery !== locationFilter) {
      setSearchQuery(locationFilter);
    }
  }, [locationFilter]);

  const {
    data: properties = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['properties-by-location', filterType, locationFilter],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (locationFilter) {
        const searchTerms = getSearchTerms(locationFilter);
        const priorityTerms = searchTerms.slice(0, 3);
        const orConditions = priorityTerms
          .flatMap((term) => [
            `location.ilike.%${term}%`,
            `city.ilike.%${term}%`,
            `state.ilike.%${term}%`,
          ])
          .join(',');
        query = query.or(orConditions);
      }
      if (filterType !== 'all') {
        query = query.eq('listing_type', filterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30 * 1000,
  });

  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (searchQuery && !locationFilter) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.property_type?.toLowerCase().includes(q)
      );
    }
    if (propertyType !== 'all') result = result.filter((p) => p.property_type?.toLowerCase() === propertyType);
    if (minBedrooms !== '0') result = result.filter((p) => p.bedrooms >= Number(minBedrooms));
    if (minBathrooms !== '0') result = result.filter((p) => p.bathrooms >= Number(minBathrooms));
    if (priceRange[0] > 0) result = result.filter((p) => p.price >= priceRange[0]);
    if (priceRange[1] < MAX_PRICE) result = result.filter((p) => p.price <= priceRange[1]);
    if (minArea) result = result.filter((p) => p.area_sqm >= Number(minArea));
    if (maxArea) result = result.filter((p) => p.area_sqm <= Number(maxArea));

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price_desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'area_desc': result.sort((a, b) => (b.area_sqm || 0) - (a.area_sqm || 0)); break;
      default: break;
    }
    return result;
  }, [properties, searchQuery, locationFilter, propertyType, minBedrooms, minBathrooms, priceRange, minArea, maxArea, sortBy]);

  const handlePropertyClick = (propertyId: string) => navigate(`/properties/${propertyId}`);
  const handleClearLocationFilter = () => { setSearchParams({}); setSearchQuery(''); };

  const {
    isPulling, pullDistance, isRefreshing,
    indicatorOpacity, indicatorRotation, threshold,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => { await refetch(); toast.success('Properties refreshed!'); },
  });

  const getImageUrl = (property: Property) => {
    if (property.image_urls?.length > 0) return property.image_urls[0];
    if (property.images?.length > 0) return property.images[0];
    return "/placeholder.svg";
  };

  const filterProps = {
    propertyType, setPropertyType,
    minBedrooms, setMinBedrooms,
    minBathrooms, setMinBathrooms,
    priceRange, setPriceRange,
    minArea, setMinArea,
    maxArea, setMaxArea,
    resetFilters,
  };

  // Loading state
  if (isLoading && locationFilter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 animate-pulse">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-1">Memuat Properti...</h3>
          <p className="text-sm text-muted-foreground">Mencari properti di {locationFilter}</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <X className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="text-base font-semibold mb-1">Gagal memuat properti</h3>
          <p className="text-sm text-muted-foreground mb-6">Silakan coba lagi</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => refetch()} className="rounded-xl h-10 px-5">Coba Lagi</Button>
            <Button variant="outline" onClick={() => navigate('/location')} className="rounded-xl h-10 px-5">Kembali</Button>
          </div>
        </div>
      </div>
    );
  }

  const locationTitle = locationFilter ? `Properti di ${locationFilter}` : 'Discover Properties';
  const locationMetaTitle = locationFilter
    ? `${filteredProperties.length}+ Properti di ${locationFilter} | ASTRAVILLA`
    : t('seo.properties.title');

  const currentSort = SORT_OPTIONS.find(s => s.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-background" {...pullHandlers}>
      <SEOHead
        title={locationMetaTitle}
        description={locationFilter
          ? `Temukan ${filteredProperties.length}+ properti di ${locationFilter}. Rumah, apartemen, villa, dan tanah tersedia untuk dijual dan disewa.`
          : t('seo.properties.description')}
        keywords={locationFilter
          ? `properti ${locationFilter}, rumah ${locationFilter}, jual properti ${locationFilter}, sewa properti ${locationFilter}`
          : "properti indonesia, semua properti, jual beli properti, sewa properti indonesia"}
        jsonLd={locationFilter ? seoSchemas.breadcrumb([
          { name: 'Beranda', url: '/' },
          { name: 'Peta Lokasi', url: '/location' },
          { name: locationFilter, url: `/properties?location=${encodeURIComponent(locationFilter)}` },
        ]) : undefined}
      />
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        indicatorOpacity={indicatorOpacity}
        indicatorRotation={indicatorRotation}
        threshold={threshold}
      />

      {/* ─── Hero Search Header ─── */}
      <div className="relative border-b border-border/40 bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container mx-auto px-4 sm:px-6 pt-6 pb-5 sm:pt-8 sm:pb-6">
          {/* Breadcrumb */}
          {locationFilter && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <li><a href="/" className="hover:text-primary transition-colors">Beranda</a></li>
                <li className="text-muted-foreground/40">/</li>
                <li><a href="/location" className="hover:text-primary transition-colors">Peta</a></li>
                <li className="text-muted-foreground/40">/</li>
                <li className="text-foreground font-medium truncate max-w-[200px]">{locationFilter}</li>
              </ol>
            </nav>
          )}

          {/* Title */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                {locationFilter ? locationTitle : 'Discover Properties'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? 'Memuat...' : `${filteredProperties.length} properti tersedia`}
              </p>
            </div>
            {locationFilter && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10 text-xs px-3 py-1.5 rounded-full transition-colors"
                onClick={handleClearLocationFilter}
              >
                {locationFilter} <X className="h-3 w-3 ml-1.5" />
              </Badge>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari properti, lokasi, atau tipe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 sm:h-12 text-sm rounded-2xl border-border/50 bg-card shadow-sm focus-visible:ring-primary/30"
            />
          </div>

          {/* Listing Type Pills */}
          <div className="flex gap-2 mt-4">
            {(['all', 'sale', 'rent'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {type === 'all' ? 'Semua' : type === 'sale' ? 'Dijual' : 'Disewa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex gap-6">

          {/* ─── Desktop Filter Sidebar ─── */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-20 space-y-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
              </div>
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <FilterPanelContent {...filterProps} />
              </div>
            </div>
          </aside>

          {/* ─── Results Area ─── */}
          <div className="flex-1 min-w-0">
            {/* Sticky Toolbar */}
            <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-b border-border/30 mb-4">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Count + Active Filters */}
                <div className="flex items-center gap-3 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {isLoading ? 'Memuat...' : <><span className="text-primary">{filteredProperties.length}</span> Properti</>}
                  </p>

                  {/* Active filter pills inline */}
                  {activeFilterCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      {propertyType !== 'all' && (
                        <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 whitespace-nowrap" onClick={() => setPropertyType('all')}>
                          {PROPERTY_TYPES.find((p) => p.value === propertyType)?.label} <X className="h-2.5 w-2.5 ml-1" />
                        </Badge>
                      )}
                      {minBedrooms !== '0' && (
                        <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 whitespace-nowrap" onClick={() => setMinBedrooms('0')}>
                          {minBedrooms}+ KT <X className="h-2.5 w-2.5 ml-1" />
                        </Badge>
                      )}
                      {minBathrooms !== '0' && (
                        <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 whitespace-nowrap" onClick={() => setMinBathrooms('0')}>
                          {minBathrooms}+ KM <X className="h-2.5 w-2.5 ml-1" />
                        </Badge>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
                        <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 whitespace-nowrap" onClick={() => setPriceRange([0, MAX_PRICE])}>
                          Harga <X className="h-2.5 w-2.5 ml-1" />
                        </Badge>
                      )}
                      {activeFilterCount > 1 && (
                        <button onClick={resetFilters} className="text-[11px] text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap">
                          Hapus semua
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Sort + View + Mobile Filter */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 w-[140px] sm:w-[160px] text-xs sm:text-sm rounded-xl border-border/50 bg-card">
                      <div className="flex items-center gap-1.5 truncate">
                        <currentSort.icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border border-border/50 rounded-xl p-0.5 bg-card">
                    {([
                      { mode: 'grid' as const, icon: Grid3X3, label: 'Grid' },
                      { mode: 'list' as const, icon: List, label: 'List' },
                      { mode: 'map' as const, icon: Map, label: 'Map' },
                    ]).map(({ mode, icon: Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        aria-label={`${label} view`}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>

                  {/* Mobile Filter Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden h-9 rounded-xl border-border/50 relative">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                      <SheetHeader className="pb-4">
                        <SheetTitle className="text-left text-lg font-bold">Filter Properti</SheetTitle>
                      </SheetHeader>
                      <FilterPanelContent {...filterProps} />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* ─── Property Grid / List ─── */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border/30 bg-card overflow-hidden">
                    <div className="h-44 bg-muted/40 relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-muted/40 rounded-lg w-2/3" />
                      <div className="h-4 bg-muted/40 rounded-lg w-1/2" />
                      <div className="flex gap-2">
                        <div className="h-6 w-14 bg-muted/40 rounded-full" />
                        <div className="h-6 w-14 bg-muted/40 rounded-full" />
                        <div className="h-6 w-16 bg-muted/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                <div className="h-24 w-24 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tidak ada properti ditemukan</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Coba ubah kriteria pencarian atau filter Anda untuk menemukan properti yang sesuai</p>
                <div className="flex gap-3 justify-center">
                  {activeFilterCount > 0 && (
                    <Button variant="outline" onClick={resetFilters} className="rounded-xl h-10 px-5">
                      <RotateCcw className="h-3.5 w-3.5 mr-2" />
                      Reset Filter
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate('/location')} className="rounded-xl h-10 px-5">
                    <MapPin className="h-3.5 w-3.5 mr-2" />
                    Lihat Peta
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                  : 'space-y-3'
                }
              >
                {filteredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.35 }}
                  >
                    {viewMode === 'grid' ? (
                      /* ─── Grid Card ─── */
                      <div
                        className="group rounded-2xl border border-border/30 bg-card overflow-hidden cursor-pointer card-hover-lift will-change-transform"
                        onClick={() => handlePropertyClick(property.id)}
                      >
                        {/* Image */}
                        <div className="relative h-36 sm:h-44 overflow-hidden">
                          <img
                            src={getImageUrl(property)}
                            alt={property.title}
                            className="w-full h-full object-cover img-hover-zoom"
                            loading="lazy"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

                          {/* Listing badge */}
                          <Badge className={`absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-lg font-semibold shadow-sm ${
                            property.listing_type === 'sale'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-accent-foreground'
                          }`}>
                            {property.listing_type === 'sale' ? 'Dijual' : 'Disewa'}
                          </Badge>

                          {/* Heart */}
                          <button
                            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-colors btn-press"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="h-4 w-4 text-foreground/70" />
                          </button>

                          {/* Price on image */}
                          <div className="absolute bottom-3 left-3">
                            <p className="text-base sm:text-lg font-black text-white drop-shadow-md">
                              {formatCurrency(property.price)}
                            </p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3.5 sm:p-4">
                          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 mb-1.5">
                            {property.title}
                          </h3>

                          <div className="flex items-center text-muted-foreground mb-3">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-primary/60" />
                            <span className="text-xs line-clamp-1">{property.location}</span>
                          </div>

                          {/* Spec chips */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {property.bedrooms > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Bed className="h-3 w-3" /> {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Bath className="h-3 w-3" /> {property.bathrooms}
                              </span>
                            )}
                            {property.area_sqm > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Maximize className="h-3 w-3" /> {property.area_sqm}m²
                              </span>
                            )}
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full ml-auto border-border/40">
                              {property.property_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ─── List Card ─── */
                      <div
                        className="group flex rounded-2xl border border-border/30 bg-card overflow-hidden cursor-pointer card-hover-lift will-change-transform"
                        onClick={() => handlePropertyClick(property.id)}
                      >
                        <div className="relative w-40 sm:w-48 flex-shrink-0 overflow-hidden">
                          <img
                            src={getImageUrl(property)}
                            alt={property.title}
                            className="w-full h-full object-cover img-hover-zoom"
                            loading="lazy"
                          />
                          <Badge className={`absolute top-2.5 left-2.5 text-[11px] px-2 py-0.5 rounded-lg font-semibold ${
                            property.listing_type === 'sale'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-accent-foreground'
                          }`}>
                            {property.listing_type === 'sale' ? 'Dijual' : 'Disewa'}
                          </Badge>
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-center">
                          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 mb-1">{property.title}</h3>
                          <div className="flex items-center text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-primary/60" />
                            <span className="text-xs line-clamp-1">{property.location}</span>
                          </div>
                          {property.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{property.description}</p>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            {property.bedrooms > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Bed className="h-3 w-3" /> {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Bath className="h-3 w-3" /> {property.bathrooms}
                              </span>
                            )}
                            {property.area_sqm > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Maximize className="h-3 w-3" /> {property.area_sqm}m²
                              </span>
                            )}
                          </div>
                          <p className="text-base font-black text-primary drop-shadow-sm">{formatCurrency(property.price)}</p>
                        </div>
                        <button
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-colors btn-press"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Heart className="h-4 w-4 text-foreground/70" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
