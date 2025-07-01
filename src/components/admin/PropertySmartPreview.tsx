import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  RefreshCw, 
  Search,
  Building2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatIDR } from '@/utils/currency';

interface PreviewProperty {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price?: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  status?: string;
  images?: string[];
  three_d_model_url?: string;
  virtual_tour_url?: string;
  development_status?: string;
}

const PropertySmartPreview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PreviewProperty | null>(null);
  const [previewMode, setPreviewMode] = useState<'card' | 'list' | 'detailed'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_approval'>('all');

  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['preview-properties', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching properties for preview...', { searchTerm, statusFilter });
      
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit for better preview

      // Apply status filter
      if (statusFilter === 'approved') {
        query = query.eq('status', 'approved');
      } else if (statusFilter === 'pending_approval') {
        query = query.eq('status', 'pending_approval');
      } else {
        // Show both approved and pending for preview purposes
        query = query.in('status', ['approved', 'pending_approval']);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      console.log('Properties query result:', { 
        data: data?.length, 
        error, 
        statusFilter, 
        searchTerm 
      });
      
      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }
      
      return data as PreviewProperty[];
    },
  });

  const handleRefresh = () => {
    console.log('Refreshing properties...');
    refetch();
  };

  const PropertyCard = ({ property }: { property: PreviewProperty }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
      onClick={() => setSelectedProperty(property)}
    >
      <CardContent className="p-4">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Building2 className="h-12 w-12 text-gray-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
            <div className="flex items-center space-x-1">
              {property.status === 'pending_approval' && (
                <Badge variant="secondary" className="text-xs">Pending</Badge>
              )}
              {property.three_d_model_url && (
                <Badge variant="secondary" className="text-xs">3D</Badge>
              )}
              {property.virtual_tour_url && (
                <Badge variant="secondary" className="text-xs">VR</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="h-3 w-3 mr-1" />
            {property.location}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-green-600">
              {property.price ? formatIDR(property.price) : 'Price on request'}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {property.listing_type}
            </div>
          </div>
          
          {(property.bedrooms || property.bathrooms || property.area_sqm) && (
            <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" />
                  {property.bedrooms}
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-3 w-3 mr-1" />
                  {property.bathrooms}
                </div>
              )}
              {property.area_sqm && (
                <div className="flex items-center">
                  <Square className="h-3 w-3 mr-1" />
                  {property.area_sqm}m²
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PropertyListItem = ({ property }: { property: PreviewProperty }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800"
      onClick={() => setSelectedProperty(property)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Building2 className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm truncate pr-2">{property.title}</h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {property.status === 'pending_approval' && (
                  <Badge variant="secondary" className="text-xs">Pending</Badge>
                )}
                {property.three_d_model_url && (
                  <Badge variant="secondary" className="text-xs">3D</Badge>
                )}
                {property.virtual_tour_url && (
                  <Badge variant="secondary" className="text-xs">VR</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {property.location}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm font-bold text-green-600">
                {property.price ? formatIDR(property.price) : 'Price on request'}
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-3 w-3 mr-1" />
                    {property.bedrooms}
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-3 w-3 mr-1" />
                    {property.bathrooms}
                  </div>
                )}
                {property.area_sqm && (
                  <div className="flex items-center">
                    <Square className="h-3 w-3 mr-1" />
                    {property.area_sqm}m²
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PropertyDetailedView = ({ property }: { property: PreviewProperty }) => (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="h-16 w-16 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" className="flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {property.three_d_model_url && (
                <Button size="sm" variant="outline" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  3D View
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">{property.title}</h2>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                {property.location}
              </div>
              <div className="text-2xl font-bold text-green-600 mb-4">
                {property.price ? formatIDR(property.price) : 'Price on request'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {property.bedrooms && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold">{property.bedrooms}</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold">{property.bathrooms}</div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                </div>
              )}
              {property.area_sqm && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Square className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold">{property.area_sqm}m²</div>
                  <div className="text-xs text-gray-500">Floor Area</div>
                </div>
              )}
            </div>
            
            {property.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                  {property.description}
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {property.property_type}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {property.listing_type}
              </Badge>
              {property.status === 'pending_approval' && (
                <Badge variant="secondary">Pending Approval</Badge>
              )}
              {property.development_status !== 'completed' && (
                <Badge variant="secondary" className="capitalize">
                  {property.development_status?.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Property Smart Preview</h2>
          <p className="text-gray-400">Preview how properties appear to users on the website</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="preview">Property Preview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* Controls */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'approved' | 'pending_approval') => setStatusFilter(value)}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="approved">Approved Only</SelectItem>
                    <SelectItem value="pending_approval">Pending Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={previewMode} onValueChange={(value: 'card' | 'list' | 'detailed') => setPreviewMode(value)}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card View</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="detailed">Detailed View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          {error && (
            <Card className="bg-red-900/20 border-red-700/50">
              <CardContent className="p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-red-300 font-medium">Error Loading Properties</p>
                  <p className="text-red-200 text-sm">{error.message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Area */}
          <Card className="bg-white dark:bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Live Preview</span>
                {properties && (
                  <Badge variant="outline" className="text-white border-slate-600">
                    {properties.length} properties
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-400">Loading properties...</p>
                </div>
              ) : !properties || properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Properties Found</h3>
                  <div className="space-y-2 text-gray-400">
                    <p>Current filters: Status = {statusFilter}, Search = "{searchTerm || 'none'}"</p>
                    <p>Try changing the status filter or clearing the search to see more properties.</p>
                    <p>You may need to add some properties first in the "Add Property" tab.</p>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  previewMode === 'card' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {properties.map((property) => (
                    <div key={property.id}>
                      {previewMode === 'card' && <PropertyCard property={property} />}
                      {previewMode === 'list' && <PropertyListItem property={property} />}
                      {previewMode === 'detailed' && <PropertyDetailedView property={property} />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {selectedProperty ? (
            <PropertyDetailedView property={selectedProperty} />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Property Selected</h3>
                <p className="text-gray-400">Click on a property in the preview tab to view its detailed information</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertySmartPreview;
