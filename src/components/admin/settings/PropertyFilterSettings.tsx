import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Filter, Plus, Edit, Trash2, Save, Home, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FilterConfiguration {
  id?: string;
  listing_type: 'sale' | 'rent';
  filter_category: string;
  filter_name: string;
  filter_type: 'select' | 'range' | 'checkbox' | 'radio' | 'slider';
  filter_options: any[];
  min_value?: number;
  max_value?: number;
  step_value?: number;
  default_value?: any;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  validation_rules?: any;
  description?: string;
}

const PropertyFilterSettings = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFilter, setEditingFilter] = useState<FilterConfiguration | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filterCategories = [
    'search',
    'location', 
    'price',
    'specifications',
    'investment', // for sale only
    'rental_terms', // for rent only
    'facilities'
  ];

  const filterTypes = [
    { value: 'select', label: 'Dropdown Select' },
    { value: 'range', label: 'Range Slider' },
    { value: 'checkbox', label: 'Multiple Choice' },
    { value: 'radio', label: 'Single Choice' },
    { value: 'slider', label: 'Number Slider' }
  ];

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('property_filter_configurations' as any)
        .select('*')
        .order('listing_type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFilters((data as unknown as FilterConfiguration[]) || []);
    } catch (error) {
      console.error('Error loading filters:', error);
      toast({
        title: "Error",
        description: "Failed to load filter configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (filter: FilterConfiguration) => {
    try {
      const { error } = await supabase
        .from('property_filter_configurations' as any)
        .upsert(filter);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Filter ${filter.id ? 'updated' : 'created'} successfully`
      });

      await loadFilters();
      setEditingFilter(null);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error saving filter:', error);
      toast({
        title: "Error",
        description: "Failed to save filter",
        variant: "destructive"
      });
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const { error } = await supabase
        .from('property_filter_configurations' as any)
        .delete()
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Filter deleted successfully"
      });

      await loadFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive"
      });
    }
  };

  const toggleFilterStatus = async (filterId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('property_filter_configurations' as any)
        .update({ is_active: isActive })
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Filter ${isActive ? 'activated' : 'deactivated'}`
      });

      await loadFilters();
    } catch (error) {
      console.error('Error updating filter status:', error);
      toast({
        title: "Error",
        description: "Failed to update filter status",
        variant: "destructive"
      });
    }
  };

  const FilterForm = ({ filter, onSave, onCancel }: {
    filter: FilterConfiguration | null;
    onSave: (filter: FilterConfiguration) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<FilterConfiguration>(
      filter || {
        listing_type: 'sale',
        filter_category: 'search',
        filter_name: '',
        filter_type: 'select',
        filter_options: [],
        display_order: 0,
        is_required: false,
        is_active: true,
        description: ''
      }
    );

    const updateField = (field: keyof FilterConfiguration, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionsChange = (value: string) => {
      const options = value.split('\n').filter(opt => opt.trim());
      updateField('filter_options', options);
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Listing Type</Label>
            <Select value={formData.listing_type} onValueChange={(value) => updateField('listing_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Sale (Dijual)</SelectItem>
                <SelectItem value="rent">Rent (Sewa)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filter Category</Label>
            <Select value={formData.filter_category} onValueChange={(value) => updateField('filter_category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Filter Name</Label>
            <Input
              value={formData.filter_name}
              onChange={(e) => updateField('filter_name', e.target.value)}
              placeholder="e.g., Property Type, Price Range"
            />
          </div>

          <div className="space-y-2">
            <Label>Filter Type</Label>
            <Select value={formData.filter_type} onValueChange={(value) => updateField('filter_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.filter_type === 'select' || formData.filter_type === 'checkbox' || formData.filter_type === 'radio' ? (
          <div className="space-y-2">
            <Label>Filter Options (one per line)</Label>
            <Textarea
              value={formData.filter_options?.join('\n') || ''}
              onChange={(e) => handleOptionsChange(e.target.value)}
              placeholder="Villa&#10;Apartment&#10;House"
              rows={4}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Min Value</Label>
              <Input
                type="number"
                value={formData.min_value || ''}
                onChange={(e) => updateField('min_value', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Value</Label>
              <Input
                type="number"
                value={formData.max_value || ''}
                onChange={(e) => updateField('max_value', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Step</Label>
              <Input
                type="number"
                value={formData.step_value || ''}
                onChange={(e) => updateField('step_value', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Filter description or help text"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input
              type="number"
              value={formData.display_order}
              onChange={(e) => updateField('display_order', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_required}
              onCheckedChange={(checked) => updateField('is_required', checked)}
            />
            <Label>Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField('is_active', checked)}
            />
            <Label>Active</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Save Filter
          </Button>
        </div>
      </div>
    );
  };

  const renderFiltersList = (listingType: 'sale' | 'rent') => {
    const typeFilters = filters.filter(f => f.listing_type === listingType);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {listingType === 'sale' ? <ShoppingCart className="h-5 w-5" /> : <Home className="h-5 w-5" />}
            {listingType === 'sale' ? 'Sale (Dijual)' : 'Rent (Sewa)'} Filters
          </h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingFilter({ listing_type: listingType } as FilterConfiguration)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Filter</DialogTitle>
                <DialogDescription>
                  Create a new filter configuration for {listingType} properties
                </DialogDescription>
              </DialogHeader>
              <FilterForm
                filter={editingFilter}
                onSave={saveFilter}
                onCancel={() => {
                  setEditingFilter(null);
                  setShowAddDialog(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {typeFilters.map((filter) => (
            <Card key={filter.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{filter.filter_name}</h4>
                    <Badge variant="outline">{filter.filter_category}</Badge>
                    <Badge variant={filter.filter_type === 'select' ? 'default' : 'secondary'}>
                      {filter.filter_type}
                    </Badge>
                    {filter.is_required && <Badge variant="destructive">Required</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {filter.description || 'No description'}
                  </p>
                  {filter.filter_options && filter.filter_options.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Options: </span>
                      <span className="text-xs">{filter.filter_options.slice(0, 3).join(', ')}</span>
                      {filter.filter_options.length > 3 && <span className="text-xs text-muted-foreground"> +{filter.filter_options.length - 3} more</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Order: {filter.display_order}</span>
                  <Switch
                    checked={filter.is_active}
                    onCheckedChange={(checked) => toggleFilterStatus(filter.id!, checked)}
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setEditingFilter(filter)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Filter</DialogTitle>
                        <DialogDescription>
                          Modify filter configuration
                        </DialogDescription>
                      </DialogHeader>
                      <FilterForm
                        filter={editingFilter}
                        onSave={saveFilter}
                        onCancel={() => setEditingFilter(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteFilter(filter.id!)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading filter configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Property Filter Configuration
          </CardTitle>
          <CardDescription>
            Manage search filters for both sale and rental properties. Configure different filter sets to provide targeted search experiences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sale" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sale" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Sale Properties
              </TabsTrigger>
              <TabsTrigger value="rent" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Rental Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sale">
              {renderFiltersList('sale')}
            </TabsContent>

            <TabsContent value="rent">
              {renderFiltersList('rent')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filter Statistics</CardTitle>
          <CardDescription>Overview of filter configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filters.filter(f => f.listing_type === 'sale').length}</div>
              <div className="text-sm text-muted-foreground">Sale Filters</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{filters.filter(f => f.listing_type === 'rent').length}</div>
              <div className="text-sm text-muted-foreground">Rental Filters</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{filters.filter(f => f.is_active).length}</div>
              <div className="text-sm text-muted-foreground">Active Filters</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{filters.filter(f => f.is_required).length}</div>
              <div className="text-sm text-muted-foreground">Required Filters</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyFilterSettings;