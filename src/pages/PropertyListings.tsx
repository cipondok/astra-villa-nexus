
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid3X3, List, SlidersHorizontal, CreditCard, LogIn, Home } from 'lucide-react';
import { astraPaymentAPI, Property } from '@/services/astraPaymentAPI';
import AstraPaymentPropertyCard from '@/components/astra/AstraPaymentPropertyCard';
import RoleBasedNavigation from '@/components/RoleBasedNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState as useAuthModal } from 'react';
import EnhancedAuthModal from '@/components/auth/EnhancedAuthModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PropertyListings = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filters, setFilters] = useState({
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    currency: '',
  });
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch properties without authentication requirement - PUBLIC ACCESS
  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['public-properties', filters, searchQuery],
    queryFn: async () => {
      try {
        const searchFilters = {
          ...filters,
          search: searchQuery,
        };
        
        const response = await astraPaymentAPI.getProperties(50, searchFilters);
        
        if (!response.success) {
          console.warn(`Failed to fetch properties: ${response.error}`);
          return [];
        }
        
        return response.data || [];
      } catch (error) {
        console.warn('Error fetching properties for public view:', error);
        return [];
      }
    },
    retry: 1,
  });

  const sortedProperties = [...properties].sort((a, b) => {
    let aValue = a[sortBy as keyof Property];
    let bValue = b[sortBy as keyof Property];
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      currency: '',
    });
    setSearchQuery('');
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation
          onLoginClick={handleLoginClick}
          language="en"
          onLanguageToggle={() => {}}
          theme="light"
          onThemeToggle={() => {}}
        />
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Properties</h2>
                <p className="text-muted-foreground mb-4">Failed to load property listings. Please try again.</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => refetch()}>Retry</Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation
          onLoginClick={handleLoginClick}
          language="en"
          onLanguageToggle={() => {}}
          theme="light"
          onThemeToggle={() => {}}
        />
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Public Property Listings</h1>
              <p className="text-muted-foreground">
                Browse all available properties - no login required for viewing
              </p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Payment Information</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>Property purchases:</strong> Use standard payment methods (cards, bank transfer, etc.)</li>
                      <li>• <strong>ASTRA Token:</strong> Only for vendor services and professional services</li>
                      <li>• <strong>Login required:</strong> Only for purchasing properties, not for browsing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search properties by title, location, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  <Select value={filters.property_type} onValueChange={(value) => handleFilterChange('property_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="3">3+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="IDR">IDR</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Min Price"
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  />

                  <Input
                    placeholder="Max Price"
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  />

                  <Input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>

                  <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="bedrooms">Bedrooms</SelectItem>
                        <SelectItem value="square_feet">Size</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Low to High</SelectItem>
                        <SelectItem value="desc">High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* View Toggle and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CreditCard className="h-3 w-3 mr-1" />
                  {sortedProperties.length} Properties Available
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Public Access - No Login Required
                </Badge>
              </div>

              <div className="flex items-center gap-2">
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

            {/* Properties Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProperties.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No properties match your current search criteria. Try adjusting your filters.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                    <Button onClick={() => navigate('/')}>
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProperties.map((property) => (
                  <AstraPaymentPropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <EnhancedAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        language={language}
      />
    </>
  );
};

export default PropertyListings;
