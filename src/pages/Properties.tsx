import { useState, useEffect, useMemo } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Search, MapPin, Building2, Bed, Bath, Maximize, Heart,
  Grid3X3, List, ArrowLeft, Home, X, SlidersHorizontal, ChevronDown, RotateCcw,
} from "lucide-react";
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
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'area_desc', label: 'Luas Terbesar' },
];

const MAX_PRICE = 50_000_000_000; // 50B IDR

const Properties = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  // Client-side filtering & sorting
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Text search
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

    // Property type
    if (propertyType !== 'all') {
      result = result.filter((p) => p.property_type?.toLowerCase() === propertyType);
    }

    // Bedrooms
    if (minBedrooms !== '0') {
      result = result.filter((p) => p.bedrooms >= Number(minBedrooms));
    }

    // Bathrooms
    if (minBathrooms !== '0') {
      result = result.filter((p) => p.bathrooms >= Number(minBathrooms));
    }

    // Price range
    if (priceRange[0] > 0) {
      result = result.filter((p) => p.price >= priceRange[0]);
    }
    if (priceRange[1] < MAX_PRICE) {
      result = result.filter((p) => p.price <= priceRange[1]);
    }

    // Area
    if (minArea) {
      result = result.filter((p) => p.area_sqm >= Number(minArea));
    }
    if (maxArea) {
      result = result.filter((p) => p.area_sqm <= Number(maxArea));
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'area_desc':
        result.sort((a, b) => (b.area_sqm || 0) - (a.area_sqm || 0));
        break;
      default:
        break; // already sorted by newest from DB
    }

    return result;
  }, [properties, searchQuery, locationFilter, propertyType, minBedrooms, minBathrooms, priceRange, minArea, maxArea, sortBy]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleClearLocationFilter = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const {
    isPulling, pullDistance, isRefreshing,
    indicatorOpacity, indicatorRotation, threshold,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      toast.success('Properties refreshed!');
    },
  });

  const getImageUrl = (property: Property) => {
    if (property.image_urls && property.image_urls.length > 0) return property.image_urls[0];
    if (property.images && property.images.length > 0) return property.images[0];
    return "/placeholder.svg";
  };

  // Loading state for location search
  if (isLoading && locationFilter) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/location')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20 h-6 px-2 text-[10px]">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Peta
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20 h-6 px-2 text-[10px]">
                  <Home className="h-3 w-3 mr-1" />
                  Beranda
                </Button>
              </div>
              <h1 className="text-sm font-semibold">Properti di {locationFilter}</h1>
              <Badge className="bg-primary-foreground/20 text-primary-foreground text-[10px] px-2">
                {locationFilter}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Memuat Properti...</h3>
            <p className="text-xs text-muted-foreground">Mencari properti di {locationFilter}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/location')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20 h-6 px-2 text-[10px]">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Peta
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20 h-6 px-2 text-[10px]">
                <Home className="h-3 w-3 mr-1" />
                Beranda
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Gagal memuat properti</h3>
            <p className="text-xs text-muted-foreground mb-4">Silakan coba lagi</p>
            <div className="flex gap-2 justify-center">
              <Button variant="default" size="sm" onClick={() => refetch()} className="text-xs h-8">Coba Lagi</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/location')} className="text-xs h-8">Kembali ke Peta</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const locationTitle = locationFilter ? `Properti di ${locationFilter}` : 'Semua Properti';
  const locationMetaTitle = locationFilter
    ? `${filteredProperties.length}+ Properti di ${locationFilter} | ASTRAVILLA`
    : t('seo.properties.title');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" {...pullHandlers}>
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

      {/* Breadcrumb Navigation */}
      {locationFilter && (
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-3 pb-1">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><a href="/" className="hover:text-primary transition-colors">Beranda</a></li>
            <li className="text-muted-foreground/50">/</li>
            <li><a href="/location" className="hover:text-primary transition-colors">Peta Lokasi</a></li>
            <li className="text-muted-foreground/50">/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]">{locationFilter}</li>
          </ol>
        </nav>
      )}

      {/* Location Header */}
      {locationFilter && (
        <div className="container mx-auto px-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">{locationTitle}</h1>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Memuat...' : `${filteredProperties.length} properti ditemukan`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/location')} className="h-8 px-3 text-xs">
                <ArrowLeft className="h-3 w-3 mr-1.5" />
                Peta
              </Button>
              <Badge variant="secondary" className="cursor-pointer hover:bg-destructive/10 text-xs px-2.5 py-1" onClick={handleClearLocationFilter}>
                {locationFilter} <X className="h-3 w-3 ml-1" />
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        {/* Search Bar + Filter Toggle */}
        <div className="glass-card border-border/30 shadow-lg rounded-xl p-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari properti, lokasi, tipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-background/50 backdrop-blur-sm border-border/40"
              />
            </div>

            {/* Listing Type Tabs */}
            <div className="flex gap-1">
              {(['all', 'sale', 'rent'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className={`h-8 px-2.5 text-[11px] ${filterType !== type ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}
                >
                  {type === 'all' ? 'Semua' : type === 'sale' ? 'Dijual' : 'Disewa'}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px] h-8 text-[11px] bg-background/50 backdrop-blur-sm border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant={filtersOpen ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`h-8 px-2.5 text-[11px] relative ${!filtersOpen ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* View Mode */}
            <div className="flex gap-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className={`h-8 w-8 p-0 ${viewMode !== 'grid' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className={`h-8 w-8 p-0 ${viewMode !== 'list' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Collapsible Advanced Filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-border/30 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Property Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tipe Properti</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="h-8 text-xs bg-background/50 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((pt) => (
                          <SelectItem key={pt.value} value={pt.value} className="text-xs">{pt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Kamar Tidur</label>
                    <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                      <SelectTrigger className="h-8 text-xs bg-background/50 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BEDROOM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Kamar Mandi</label>
                    <Select value={minBathrooms} onValueChange={setMinBathrooms}>
                      <SelectTrigger className="h-8 text-xs bg-background/50 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BEDROOM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Min Area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Luas Min (m²)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="h-8 text-xs bg-background/50 border-border/40"
                    />
                  </div>

                  {/* Max Area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Luas Maks (m²)</label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="h-8 text-xs bg-background/50 border-border/40"
                    />
                  </div>

                  {/* Reset */}
                  <div className="space-y-1 flex flex-col justify-end">
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-[11px] text-muted-foreground hover:text-foreground">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset Filter
                    </Button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Rentang Harga</label>
                    <span className="text-[10px] text-muted-foreground">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {propertyType !== 'all' && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-destructive/10" onClick={() => setPropertyType('all')}>
                {PROPERTY_TYPES.find((p) => p.value === propertyType)?.label} <X className="h-2.5 w-2.5 ml-1" />
              </Badge>
            )}
            {minBedrooms !== '0' && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-destructive/10" onClick={() => setMinBedrooms('0')}>
                {minBedrooms}+ KT <X className="h-2.5 w-2.5 ml-1" />
              </Badge>
            )}
            {minBathrooms !== '0' && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-destructive/10" onClick={() => setMinBathrooms('0')}>
                {minBathrooms}+ KM <X className="h-2.5 w-2.5 ml-1" />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-destructive/10" onClick={() => setPriceRange([0, MAX_PRICE])}>
                {formatCurrency(priceRange[0])} - {priceRange[1] >= MAX_PRICE ? '∞' : formatCurrency(priceRange[1])} <X className="h-2.5 w-2.5 ml-1" />
              </Badge>
            )}
            {(minArea || maxArea) && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-destructive/10" onClick={() => { setMinArea(''); setMaxArea(''); }}>
                {minArea || '0'} - {maxArea || '∞'} m² <X className="h-2.5 w-2.5 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Memuat...' : `${filteredProperties.length} properti ditemukan`}
          </p>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden glass-card border-border/30">
                <div className="h-28 bg-muted/50" />
                <CardContent className="p-2">
                  <div className="h-3 bg-muted/50 rounded mb-1.5" />
                  <div className="h-2.5 bg-muted/50 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 glass-card border-border/30 rounded-xl">
            <div className="h-16 w-16 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Tidak ada properti</h3>
            <p className="text-xs text-muted-foreground mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
            <div className="flex gap-2 justify-center">
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs h-8">
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Reset Filter
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/location')} className="text-xs h-8 bg-background/50 backdrop-blur-sm border-border/40">
                <MapPin className="h-3 w-3 mr-1.5" />
                Lihat Peta
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}
          >
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
              >
                <Card
                  className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer glass-card border-border/30 hover:border-primary/40 ${viewMode === 'list' ? 'flex flex-row' : ''}`}
                  onClick={() => handlePropertyClick(property.id)}
                >
                  <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'relative'}>
                    <img
                      src={getImageUrl(property)}
                      alt={property.title}
                      className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-28 sm:h-32'}`}
                      loading="lazy"
                    />
                    <Badge className={`absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 h-5 ${property.listing_type === 'sale' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                      {property.listing_type === 'sale' ? 'Dijual' : 'Disewa'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/60 backdrop-blur-sm hover:bg-background/80 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className={`p-2 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                    <h3 className="font-semibold text-xs mb-0.5 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-1">
                      <MapPin className="h-2.5 w-2.5 mr-0.5 shrink-0" />
                      <span className="text-[10px] line-clamp-1">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Bed className="h-2.5 w-2.5" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Bath className="h-2.5 w-2.5" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area_sqm > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Maximize className="h-2.5 w-2.5" />
                          <span>{property.area_sqm}m²</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-primary">
                        {formatCurrency(property.price)}
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 bg-background/50 backdrop-blur-sm border-border/40">
                        {property.property_type}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Properties;