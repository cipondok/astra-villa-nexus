import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building2, Bed, Bath, Maximize, Heart, Filter, Grid3X3, List, ArrowLeft, Home, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
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
  'Papua': ['Papua', 'Jayapura']
};
const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  // Get search terms for a province (includes Indonesian and English names)
  const getSearchTerms = (provinceName: string): string[] => {
    const terms = provinceNameMapping[provinceName] || [provinceName];
    return [provinceName, ...terms];
  };

  // Update search query when location filter changes
  // Sync search query with location filter only on mount or when filter changes
  useEffect(() => {
    if (locationFilter && searchQuery !== locationFilter) {
      setSearchQuery(locationFilter);
    }
  }, [locationFilter]);

  // Fetch properties - simplified query for better performance
  const {
    data: properties = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['properties-by-location', filterType, locationFilter],
    queryFn: async () => {
      let query = supabase.from('properties').select('*').order('created_at', {
        ascending: false
      }).limit(100); // Limit for performance

      // Apply location filter from URL - simplified query
      if (locationFilter) {
        const searchTerms = getSearchTerms(locationFilter);
        // Use only the most relevant terms (max 3) to reduce query complexity
        const priorityTerms = searchTerms.slice(0, 3);
        const orConditions = priorityTerms.flatMap(term => [`location.ilike.%${term}%`, `city.ilike.%${term}%`, `state.ilike.%${term}%`]).join(',');
        query = query.or(orConditions);
      }
      if (filterType !== 'all') {
        query = query.eq('listing_type', filterType);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data as Property[];
    },
    retry: 2,
    // Retry on failure
    retryDelay: 1000,
    staleTime: 30 * 1000 // Cache for 30 seconds
  });
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };
  const handleClearLocationFilter = () => {
    setSearchParams({});
    setSearchQuery('');
  };
  const getImageUrl = (property: Property) => {
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return "/placeholder.svg";
  };

  // Show full-page loading when coming from location selection
  if (isLoading && locationFilter) {
    return <div className="min-h-screen bg-background flex flex-col">
        {/* Header always visible */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/location')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Peta
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]">
                  <Home className="h-3 w-3 mr-1" />
                  Beranda
                </Button>
              </div>
              <h1 className="text-sm font-semibold">Properti di {locationFilter}</h1>
              <Badge className="bg-white/20 text-primary-foreground text-[10px] px-2">
                {locationFilter}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Loading content */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Memuat Properti...</h3>
            <p className="text-xs text-muted-foreground">Mencari properti di {locationFilter}</p>
          </motion.div>
        </div>
      </div>;
  }

  // Error state
  if (error) {
    return <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/location')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Peta
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]">
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
              <Button variant="default" size="sm" onClick={() => refetch()} className="text-xs h-8">
                Coba Lagi
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/location')} className="text-xs h-8">
                Kembali ke Peta
              </Button>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sub-header with location info - fixed (reliable across scroll containers) */}
      {locationFilter && <>
          <div className="fixed left-0 right-0 top-[40px] md:top-[44px] lg:top-[48px] z-40 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/location')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 h-6 px-2 text-[10px]">
                    <ArrowLeft className="h-3 w-3 mr-0.5" />
                    Peta
                  </Button>
                </div>

                <div className="text-center flex-1 min-w-0">
                  <h1 className="leading-tight text-[4px] sm:text-xs md:text-sm font-normal truncate">
                    Properti di {locationFilter}
                  </h1>
                  <p className="text-[8px] sm:text-[9px] opacity-70 truncate">
                    {isLoading ? 'Memuat...' : `${properties.length} properti ditemukan`}
                  </p>
                </div>

                <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30 px-2 py-0.5 text-[10px] cursor-pointer hover:bg-white/30" onClick={handleClearLocationFilter}>
                  <MapPin className="h-2.5 w-2.5 mr-1" />
                  {locationFilter}
                  <X className="h-2.5 w-2.5 ml-1.5" />
                </Badge>
              </div>
            </div>
          </div>

          {/* Spacer so content doesn't slide under the fixed bar */}
          <div aria-hidden className="h-10" />
        </>}

      <div className="container mx-auto px-4 py-4">
        {/* Compact Search and Filters - Glassy */}
        <div className="glass-card border-border/30 shadow-lg rounded-xl p-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Cari properti..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-background/50 backdrop-blur-sm border-border/40" />
            </div>
            
            <div className="flex gap-1">
              <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')} className={`h-8 px-2.5 text-[10px] ${filterType !== 'all' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                Semua
              </Button>
              <Button variant={filterType === 'sale' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('sale')} className={`h-8 px-2.5 text-[10px] ${filterType !== 'sale' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                Dijual
              </Button>
              <Button variant={filterType === 'rent' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('rent')} className={`h-8 px-2.5 text-[10px] ${filterType !== 'rent' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                Disewa
              </Button>
            </div>

            <div className="flex gap-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className={`h-8 w-8 p-0 ${viewMode !== 'grid' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className={`h-8 w-8 p-0 ${viewMode !== 'list' ? 'bg-background/50 backdrop-blur-sm border-border/40' : ''}`}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid/List - Compact Cards */}
        {isLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => <Card key={i} className="animate-pulse overflow-hidden glass-card border-border/30">
                <div className="h-28 bg-muted/50"></div>
                <CardContent className="p-2">
                  <div className="h-3 bg-muted/50 rounded mb-1.5"></div>
                  <div className="h-2.5 bg-muted/50 rounded w-2/3"></div>
                </CardContent>
              </Card>)}
          </div> : properties.length === 0 ? <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center py-12 glass-card border-border/30 rounded-xl">
            <div className="h-16 w-16 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Tidak ada properti</h3>
            <p className="text-xs text-muted-foreground mb-4">Coba ubah kriteria pencarian Anda</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/location')} className="text-xs h-8 bg-background/50 backdrop-blur-sm border-border/40">
              <MapPin className="h-3 w-3 mr-1.5" />
              Lihat Peta
            </Button>
          </motion.div> : <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" : "space-y-2"}>
            {properties.map((property, index) => <motion.div key={property.id} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.03
        }}>
                <Card className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer glass-card border-border/30 hover:border-primary/40 ${viewMode === 'list' ? 'flex flex-row' : ''}`} onClick={() => handlePropertyClick(property.id)}>
                  <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'relative'}>
                    <img src={getImageUrl(property)} alt={property.title} className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-28 sm:h-32'}`} />
                    {/* Overlay Badge */}
                    <Badge className={`absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0 h-4 ${property.listing_type === 'sale' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                      {property.listing_type === 'sale' ? 'Dijual' : 'Disewa'}
                    </Badge>
                    {/* Heart Button */}
                    <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/60 backdrop-blur-sm hover:bg-background/80 rounded-full" onClick={e => {
                e.stopPropagation();
              }}>
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
                      {property.bedrooms && <div className="flex items-center gap-0.5">
                          <Bed className="h-2.5 w-2.5" />
                          <span>{property.bedrooms}</span>
                        </div>}
                      {property.bathrooms && <div className="flex items-center gap-0.5">
                          <Bath className="h-2.5 w-2.5" />
                          <span>{property.bathrooms}</span>
                        </div>}
                      {property.area_sqm && <div className="flex items-center gap-0.5">
                          <Maximize className="h-2.5 w-2.5" />
                          <span>{property.area_sqm}m²</span>
                        </div>}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-primary">
                        {formatCurrency(property.price)}
                      </div>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-background/50 backdrop-blur-sm border-border/40">
                        {property.property_type}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>)}
          </motion.div>}
      </div>
    </div>;
};
export default Properties;