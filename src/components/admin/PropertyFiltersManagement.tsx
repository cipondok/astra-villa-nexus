import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { useToast } from '@/hooks/use-toast';

const PropertyFiltersManagement = () => {
  const { filters, loading, updateFilter, deleteFilter } = usePropertyFilters();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleFilter = async (filterId: string, currentState: boolean) => {
    try {
      await updateFilter(filterId, { is_active: !currentState });
    } catch (error) {
      console.error('Failed to toggle filter:', error);
    }
  };

  const handleDeleteFilter = async (filterId: string, filterName: string) => {
    if (confirm(`Are you sure you want to delete "${filterName}"?`)) {
      try {
        await deleteFilter(filterId);
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    }
  };

  const filteredFilters = filters.flatMap(category => 
    category.options.filter(option => 
      option.filter_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading filters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Property Filters Management</h2>
          <p className="text-muted-foreground">Configure rental property filters and facilities</p>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search filters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="facilities" className="w-full">
        <TabsList>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="search">Search Filters</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rental Facilities & Amenities</CardTitle>
              <CardDescription>Manage available facilities for rental properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFilters
                  .filter(f => f.filter_category === 'facilities')
                  .map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium">{filter.filter_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {filter.filter_type} • {filter.listing_type}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={filter.is_active ? 'default' : 'secondary'}>
                          {filter.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={filter.is_active}
                          onCheckedChange={() => handleToggleFilter(filter.id, filter.is_active)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFilter(filter.id, filter.filter_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Property type and location filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFilters
                  .filter(f => f.filter_category === 'search')
                  .map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{filter.filter_name}</div>
                        <div className="text-sm text-muted-foreground">Type: {filter.filter_type}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={filter.is_active}
                          onCheckedChange={() => handleToggleFilter(filter.id, filter.is_active)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Specifications</CardTitle>
              <CardDescription>Size, bedrooms, bathrooms, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFilters
                  .filter(f => f.filter_category === 'specifications')
                  .map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{filter.filter_name}</div>
                        <div className="text-sm text-muted-foreground">Type: {filter.filter_type}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={filter.is_active}
                          onCheckedChange={() => handleToggleFilter(filter.id, filter.is_active)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyFiltersManagement;
