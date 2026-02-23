import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteProperties } from '@/hooks/useInfiniteProperties';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin, Home, X, Eye, Heart, Bed, Bath, Maximize, Key, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackToHomeLink from '@/components/common/BackToHomeLink';
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
  const [filters, setFilters] = useState({
    propertyType: 'all',
    city: 'all',
    priceRange: 'all'
  });
  const language = 'en';

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

  // Fallback to demo data for pre-launching
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Clean Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackToHomeLink sectionId={`${pageType}-section`} className="mb-0" />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">{title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {(hasSearched ? searchResults : properties).length} properti tersedia
                </p>
              </div>
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 text-sm font-medium rounded-md"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-2 h-5 w-5 flex items-center justify-center text-xs bg-accent text-accent-foreground rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari lokasi, nama properti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 sm:h-11 pl-10 text-sm bg-background border-border rounded-md focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="h-10 sm:h-11 px-6 text-sm font-medium"
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Mencari...' : 'Cari'}
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
                <div className="pt-3 mt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Filter Properti</span>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-destructive">
                        <X className="h-3 w-3 mr-1" />
                        Reset Filter
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    <Select value={filters.propertyType} onValueChange={(v) => setFilters(p => ({ ...p, propertyType: v }))}>
                      <SelectTrigger className="h-10 text-sm bg-background border-border">
                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
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
                      <SelectTrigger className="h-10 text-sm bg-background border-border">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
                      <SelectTrigger className="h-10 text-sm bg-background border-border">
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Properties Grid */}
        {isLoading || isSearching ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-md overflow-hidden bg-muted h-64 sm:h-72"></div>
            ))}
          </div>
        ) : (hasSearched ? searchResults : properties).length === 0 ? (
          <div className="bg-card border border-border rounded-md p-8 sm:p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada properti ditemukan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Coba sesuaikan filter pencarian Anda
              </p>
              <Button variant="outline" className="h-10 px-6" onClick={clearFilters}>
                Reset Filter
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {(hasSearched ? searchResults : properties).map((property: any) => {
              const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
              const formatPrice = (price: number) => {
                if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}M`;
                if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}Jt`;
                return `Rp ${price.toLocaleString('id-ID')}`;
              };

              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group cursor-pointer overflow-hidden bg-card border border-border rounded-md hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Save Button */}
                    <button className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/90 hover:bg-background rounded-full shadow-md flex items-center justify-center">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded text-primary-foreground ${
                        property.listing_type === 'rent' ? 'bg-primary' : 'bg-chart-1'
                      }`}>
                        {property.listing_type === 'rent' ? <Key className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                        {property.listing_type === 'rent' ? 'Sewa' : 'Jual'}
                      </span>
                      {pageType === 'pre-launching' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent text-accent-foreground">
                          Pre-Launch
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    {/* Price */}
                    <p className="text-base sm:text-lg font-bold text-primary mb-1">
                      {formatPrice(property.price)}
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
                          <Maximize className="h-3.5 w-3.5" />
                          <span>{property.area_sqm}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!isLoading && !hasSearched && (
          <>
            <div ref={sentinelRef} className="h-4" />
            {isFetchingMore && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!hasMore && properties.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">
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
