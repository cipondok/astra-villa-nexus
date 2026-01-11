import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Building2, 
  Bed, 
  Bath, 
  Maximize,
  Heart,
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Home,
  X
} from "lucide-react";
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

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  // Update search query when location filter changes
  useEffect(() => {
    if (locationFilter) {
      setSearchQuery(locationFilter);
    }
  }, [locationFilter]);

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', searchQuery, filterType, locationFilter],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply location filter from URL or search query
      const searchTerm = locationFilter || searchQuery;
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('listing_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Back Navigation */}
          <div className="flex items-center gap-2 mb-4">
            {locationFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/location')}
                className="text-white/80 hover:text-white hover:bg-white/20 h-8 px-2 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Kembali ke Peta
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 px-2 text-xs"
            >
              <Home className="h-3.5 w-3.5 mr-1" />
              Beranda
            </Button>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            {locationFilter ? `Properti di ${locationFilter}` : 'Properties'}
          </h1>
          <p className="text-sm md:text-xl opacity-90">
            {locationFilter 
              ? `Menampilkan ${properties.length} properti di wilayah ${locationFilter}`
              : 'Discover your perfect home from our extensive collection'
            }
          </p>
          
          {/* Location Filter Badge */}
          {locationFilter && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 px-3 py-1.5 text-sm cursor-pointer hover:bg-white/30"
                onClick={handleClearLocationFilter}
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {locationFilter}
                <X className="h-3.5 w-3.5 ml-2" />
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by title, location, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'sale' ? 'default' : 'outline'}
              onClick={() => setFilterType('sale')}
            >
              For Sale
            </Button>
            <Button
              variant={filterType === 'rent' ? 'default' : 'outline'}
              onClick={() => setFilterType('rent')}
            >
              For Rent
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : `${properties.length} properties found`}
          </p>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {properties.map((property) => (
              <Card 
                key={property.id} 
                className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
                onClick={() => handlePropertyClick(property.id)}
              >
                <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}>
                  <img
                    src={getImageUrl(property)}
                    alt={property.title}
                    className={`object-cover ${
                      viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                    }`}
                  />
                </div>
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={property.listing_type === 'sale' ? 'default' : 'secondary'}>
                      For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                  
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm line-clamp-1">{property.location}, {property.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </div>
                    )}
                    {property.area_sqm && (
                      <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1" />
                        {property.area_sqm}m²
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(property.price)}
                    </div>
                    <Badge variant="outline">{property.property_type}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;