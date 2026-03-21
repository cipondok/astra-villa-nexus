import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteProperties } from '@/hooks/useInfiniteProperties';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin, Home, X, Heart, Bed, Bath, Maximize, Key, Tag, Sparkles, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackToHomeLink from '@/components/common/BackToHomeLink';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import PropertyViewModeToggle from '@/components/search/PropertyViewModeToggle';
import PropertyListView from '@/components/search/PropertyListView';
const PropertyListingMapView = lazy(() => import('@/components/property/PropertyListingMapView'));
import SearchAlertSubscribeButton from '@/components/search/SearchAlertSubscribeButton';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';

interface PropertyListingPageProps {
  pageType: 'buy' | 'rent' | 'new-projects' | 'pre-launching';
  title: string;
  subtitle: string;
}

// Demo projects for pre-launching offers
const demoPreLaunchingProjects = [
  {
    id: 'demo-pl-1',
    title: 'ASTRA Luxury Residence - Phase 1',
    price: 1850000000,
    location: 'Kemang, Jakarta Selatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    property_type: 'apartment',
    listing_type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 95,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-2',
    title: 'Sunset Villa Collection',
    price: 5200000000,
    location: 'Seminyak, Bali',
    city: 'Seminyak',
    province: 'Bali',
    property_type: 'villa',
    listing_type: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    area_sqm: 380,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-3',
    title: 'Emerald Business Park',
    price: 3800000000,
    location: 'BSD City, Tangerang',
    city: 'Tangerang',
    province: 'Banten',
    property_type: 'commercial',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 4,
    area_sqm: 600,
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-4',
    title: 'Highland Garden Homes',
    price: 2400000000,
    location: 'Lembang, Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    property_type: 'house',
    listing_type: 'sale',
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 180,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-5',
    title: 'Ocean View Penthouse',
    price: 9500000000,
    location: 'Nusa Dua, Bali',
    city: 'Nusa Dua',
    province: 'Bali',
    property_type: 'penthouse',
    listing_type: 'sale',
    bedrooms: 5,
    bathrooms: 5,
    area_sqm: 520,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-6',
    title: 'Prime Land Investment',
    price: 1200000000,
    location: 'Puncak, Bogor',
    city: 'Bogor',
    province: 'Jawa Barat',
    property_type: 'land',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 0,
    area_sqm: 1000,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  }
];

const PropertyListingPage = ({ pageType, title, subtitle }: PropertyListingPageProps) => {
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [filters, setFilters] = useState({
    propertyType: 'all',
    city: 'all',
    priceRange: 'all'
  });

  const listingType = pageType === 'buy' ? 'sale' : pageType === 'rent' ? 'rent' : undefined;
  const developmentStatus = pageType === 'buy' || pageType === 'rent'
    ? ['completed', 'ready']
    : pageType === 'new-projects'
      ? ['new_project']
      : pageType === 'pre-launching'
        ? ['pre_launching']
        : undefined;

  const {
    properties: fetchedProperties,
    isLoading,
    isFetchingMore,
    hasMore,
    sentinelRef,
  } = useInfiniteProperties({
    listingType,
    developmentStatus,
    pageSize: 12,
  });

  const properties = fetchedProperties.length === 0 && !isLoading && pageType === 'pre-launching'
    ? demoPreLaunchingProjects
    : fetchedProperties;

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('title', 'is', null)
        .gt('price', 0);

      if (pageType === 'buy') {
        query = query.eq('listing_type', 'sale').in('development_status', ['completed', 'ready']);
      } else if (pageType === 'rent') {
        query = query.eq('listing_type', 'rent').in('development_status', ['completed', 'ready']);
      } else if (pageType === 'new-projects') {
        query = query.eq('development_status', 'new_project');
      } else if (pageType === 'pre-launching') {
        query = query.eq('development_status', 'pre_launching');
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }
      if (filters.propertyType !== 'all') query = query.eq('property_type', filters.propertyType);
      if (filters.city !== 'all') query = query.ilike('city', `%${filters.city}%`);

      const { data } = await query.order('created_at', { ascending: false }).limit(30);
      setSearchResults((data || []).filter(p => p.title?.trim() && p.price > 0));
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const activeFiltersCount = [
    filters.propertyType !== 'all',
    filters.city !== 'all',
    filters.priceRange !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ propertyType: 'all', city: 'all', priceRange: 'all' });
    setSearchQuery('');
  };

  const displayProperties = hasSearched ? searchResults : properties;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Modern Header with gradient accent */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <BackToHomeLink sectionId={`${pageType}-section`} className="mb-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    AI Enhanced
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {displayProperties.length} properti tersedia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SearchAlertSubscribeButton
                filters={{
                  propertyType: filters.propertyType,
                  city: filters.city,
                  priceRange: filters.priceRange,
                  listingType: listingType,
                }}
              />
              <PropertyViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9 px-3 text-xs font-medium rounded-lg gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="h-4 w-4 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="border-b border-border/30 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari lokasi, nama properti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 pl-10 text-sm bg-background/80 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-10 px-5 text-sm font-medium rounded-lg"
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">{isSearching ? 'Mencari...' : 'Cari'}</span>
            </Button>
          </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Filter Properti</span>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-destructive hover:text-destructive">
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Select value={filters.propertyType} onValueChange={(v) => setFilters(p => ({ ...p, propertyType: v }))}>
                      <SelectTrigger className="h-9 text-xs bg-background/80 border-border/50 rounded-lg">
                        <Home className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <SelectValue placeholder="Tipe Properti" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="apartment">Apartemen</SelectItem>
                        <SelectItem value="house">Rumah</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="land">Tanah</SelectItem>
                        <SelectItem value="commercial">Komersial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.city} onValueChange={(v) => setFilters(p => ({ ...p, city: v }))}>
                      <SelectTrigger className="h-9 text-xs bg-background/80 border-border/50 rounded-lg">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <SelectValue placeholder="Kota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kota</SelectItem>
                        <SelectItem value="Jakarta">Jakarta</SelectItem>
                        <SelectItem value="Bali">Bali</SelectItem>
                        <SelectItem value="Surabaya">Surabaya</SelectItem>
                        <SelectItem value="Bandung">Bandung</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.priceRange} onValueChange={(v) => setFilters(p => ({ ...p, priceRange: v }))}>
                      <SelectTrigger className="h-9 text-xs bg-background/80 border-border/50 rounded-lg">
                        <SelectValue placeholder="Range Harga" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Harga</SelectItem>
                        <SelectItem value="0-500m">&lt; 500 Jt</SelectItem>
                        <SelectItem value="500m-1b">500 Jt - 1 M</SelectItem>
                        <SelectItem value="1b-5b">1 - 5 M</SelectItem>
                        <SelectItem value="5b+">5 M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Property Grid */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {viewMode === 'map' ? (
          <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PropertyListingMapView
              properties={displayProperties.map((p: any) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                city: p.city || p.location,
                images: p.images,
                image_urls: p.image_urls,
              }))}
              formatPrice={(price: number) => getCurrencyFormatterShort()(price)}
            />
          </Suspense>
        ) : isLoading || isSearching ? (
          <PropertyCardSkeleton count={8} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" />
        ) : displayProperties.length === 0 ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-10 sm:p-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Home className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Tidak ada properti ditemukan</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Coba sesuaikan filter pencarian Anda untuk menemukan properti yang sesuai
              </p>
              <Button variant="outline" className="h-10 px-6 rounded-lg" onClick={clearFilters}>
                Reset Filter
              </Button>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <PropertyListView
            properties={displayProperties as any}
            onPropertyClick={(property) => {
              window.location.href = `/properties/${property.id}`;
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {displayProperties.map((property: any, i: number) => {
              const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
              const formatPrice = getCurrencyFormatterShort();

              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.4 }}
                  onClick={() => window.location.href = `/properties/${property.id}`}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Favorite */}
                    <button
                      className="absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background rounded-full shadow-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Save property"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm shadow-sm ${
                        property.listing_type === 'rent'
                          ? 'bg-primary/90 text-primary-foreground'
                          : 'bg-emerald-500/90 text-white'
                      }`}>
                        {property.listing_type === 'rent' ? <Key className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                        {property.listing_type === 'rent' ? 'Sewa' : 'Jual'}
                      </span>
                      {pageType === 'pre-launching' && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent/90 text-accent-foreground backdrop-blur-sm">
                          Pre-Launch
                        </span>
                      )}
                    </div>

                    {/* View details indicator */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-semibold shadow-lg">
                        Lihat Detail
                        <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <p className="text-base sm:text-lg font-bold text-primary tabular-nums">
                      {formatPrice(property.price)}
                    </p>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs truncate">{property.city || property.location}</span>
                    </div>

                    {/* Property specs */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5" />
                          <span className="font-medium">{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area_sqm > 0 && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-3.5 w-3.5" />
                          <span className="font-medium">{property.area_sqm}m²</span>
                        </div>
                      )}
                      {property.property_type && (
                        <span className="ml-auto px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium capitalize">
                          {property.property_type}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!isLoading && !hasSearched && viewMode !== 'map' && (
          <>
            <div ref={sentinelRef} className="h-4" />
            {isFetchingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!hasMore && properties.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">
                Semua properti telah ditampilkan
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyListingPage;
