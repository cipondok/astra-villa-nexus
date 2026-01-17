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
import { Filter, Plus, Edit, Trash2, Save, Home, ShoppingCart, X } from 'lucide-react';
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

  const filterCategories = ['search', 'location', 'price', 'specifications', 'investment', 'rental_terms', 'facilities'];
  const filterTypes = [
    { value: 'select', label: 'Dropdown' },
    { value: 'range', label: 'Range' },
    { value: 'checkbox', label: 'Multi' },
    { value: 'radio', label: 'Single' },
    { value: 'slider', label: 'Slider' }
  ];

  useEffect(() => { loadFilters(); }, []);

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
      toast({ title: "Error", description: "Failed to load filters", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (filter: FilterConfiguration) => {
    try {
      const { error } = await supabase.from('property_filter_configurations' as any).upsert(filter);
      if (error) throw error;
      toast({ title: "Success", description: `Filter ${filter.id ? 'updated' : 'created'}` });
      await loadFilters();
      setEditingFilter(null);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error saving filter:', error);
      toast({ title: "Error", description: "Failed to save filter", variant: "destructive" });
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const { error } = await supabase.from('property_filter_configurations' as any).delete().eq('id', filterId);
      if (error) throw error;
      toast({ title: "Success", description: "Filter deleted" });
      await loadFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const toggleFilterStatus = async (filterId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('property_filter_configurations' as any).update({ is_active: isActive }).eq('id', filterId);
      if (error) throw error;
      toast({ title: "Success", description: `Filter ${isActive ? 'activated' : 'deactivated'}` });
      await loadFilters();
    } catch (error) {
      console.error('Error updating filter status:', error);
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const FilterForm = ({ filter, onSave, onCancel }: { filter: FilterConfiguration | null; onSave: (filter: FilterConfiguration) => void; onCancel: () => void; }) => {
    const [formData, setFormData] = useState<FilterConfiguration>(
      filter || { listing_type: 'sale', filter_category: 'search', filter_name: '', filter_type: 'select', filter_options: [], display_order: 0, is_required: false, is_active: true, description: '' }
    );
    const updateField = (field: keyof FilterConfiguration, value: any) => { setFormData(prev => ({ ...prev, [field]: value })); };
    const handleOptionsChange = (value: string) => { updateField('filter_options', value.split('\n').filter(opt => opt.trim())); };

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Listing Type</Label>
            <Select value={formData.listing_type} onValueChange={(value) => updateField('listing_type', value)}>
              <SelectTrigger className="h-7 text-xs bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Category</Label>
            <Select value={formData.filter_category} onValueChange={(value) => updateField('filter_category', value)}>
              <SelectTrigger className="h-7 text-xs bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {filterCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat.replace('_', ' ')}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Filter Name</Label>
            <Input value={formData.filter_name} onChange={(e) => updateField('filter_name', e.target.value)} placeholder="Property Type" className="h-7 text-xs bg-background/50" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Filter Type</Label>
            <Select value={formData.filter_type} onValueChange={(value) => updateField('filter_type', value)}>
              <SelectTrigger className="h-7 text-xs bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {filterTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(formData.filter_type === 'select' || formData.filter_type === 'checkbox' || formData.filter_type === 'radio') ? (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Options (one per line)</Label>
            <Textarea value={formData.filter_options?.join('\n') || ''} onChange={(e) => handleOptionsChange(e.target.value)} placeholder="Villa&#10;Apartment" rows={3} className="text-xs bg-background/50 resize-none" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Min</Label>
              <Input type="number" value={formData.min_value || ''} onChange={(e) => updateField('min_value', parseFloat(e.target.value))} className="h-7 text-xs bg-background/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Max</Label>
              <Input type="number" value={formData.max_value || ''} onChange={(e) => updateField('max_value', parseFloat(e.target.value))} className="h-7 text-xs bg-background/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Step</Label>
              <Input type="number" value={formData.step_value || ''} onChange={(e) => updateField('step_value', parseFloat(e.target.value))} className="h-7 text-xs bg-background/50" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Order</Label>
            <Input type="number" value={formData.display_order} onChange={(e) => updateField('display_order', parseInt(e.target.value))} className="h-7 text-xs bg-background/50" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.is_required} onCheckedChange={(checked) => updateField('is_required', checked)} className="scale-75" />
            <Label className="text-[10px]">Required</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.is_active} onCheckedChange={(checked) => updateField('is_active', checked)} className="scale-75" />
            <Label className="text-[10px]">Active</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="h-6 text-[10px]"><X className="h-3 w-3 mr-1" />Cancel</Button>
          <Button size="sm" onClick={() => onSave(formData)} className="h-6 text-[10px]"><Save className="h-3 w-3 mr-1" />Save</Button>
        </div>
      </div>
    );
  };

  const renderFiltersList = (listingType: 'sale' | 'rent') => {
    const typeFilters = filters.filter(f => f.listing_type === listingType);
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-medium text-foreground flex items-center gap-1">
            {listingType === 'sale' ? <ShoppingCart className="h-3.5 w-3.5" /> : <Home className="h-3.5 w-3.5" />}
            {listingType === 'sale' ? 'Sale' : 'Rent'} ({typeFilters.length})
          </h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-6 text-[10px]" onClick={() => setEditingFilter({ listing_type: listingType } as FilterConfiguration)}>
                <Plus className="h-3 w-3 mr-1" />Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm">Add Filter</DialogTitle>
                <DialogDescription className="text-[10px]">Create a new filter for {listingType} properties</DialogDescription>
              </DialogHeader>
              <FilterForm filter={editingFilter} onSave={saveFilter} onCancel={() => { setEditingFilter(null); setShowAddDialog(false); }} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {typeFilters.map((filter) => (
            <div key={filter.id} className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs font-medium text-foreground">{filter.filter_name}</span>
                  <Badge variant="outline" className="text-[7px] px-1 py-0">{filter.filter_category}</Badge>
                  <Badge variant="secondary" className="text-[7px] px-1 py-0">{filter.filter_type}</Badge>
                  {filter.is_required && <Badge variant="destructive" className="text-[7px] px-1 py-0">Req</Badge>}
                </div>
                {filter.filter_options?.length > 0 && (
                  <span className="text-[9px] text-muted-foreground">{filter.filter_options.slice(0, 3).join(', ')}{filter.filter_options.length > 3 && ` +${filter.filter_options.length - 3}`}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-muted-foreground">#{filter.display_order}</span>
                <Switch checked={filter.is_active} onCheckedChange={(checked) => toggleFilterStatus(filter.id!, checked)} className="scale-[0.6]" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-5 w-5 p-0" onClick={() => setEditingFilter(filter)}><Edit className="h-2.5 w-2.5" /></Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-sm">Edit Filter</DialogTitle>
                    </DialogHeader>
                    <FilterForm filter={editingFilter} onSave={saveFilter} onCancel={() => setEditingFilter(null)} />
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" className="h-5 w-5 p-0" onClick={() => deleteFilter(filter.id!)}><Trash2 className="h-2.5 w-2.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-xs text-muted-foreground p-4">Loading filters...</div>;
  }

  const saleCount = filters.filter(f => f.listing_type === 'sale').length;
  const rentCount = filters.filter(f => f.listing_type === 'rent').length;
  const activeCount = filters.filter(f => f.is_active).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Property Filter Config
          </h2>
          <p className="text-[10px] text-muted-foreground">Manage search filters for sale and rental properties</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Sale Filters', value: saleCount, color: 'text-blue-400' },
          { label: 'Rent Filters', value: rentCount, color: 'text-green-400' },
          { label: 'Active', value: activeCount, color: 'text-emerald-400' },
          { label: 'Inactive', value: filters.length - activeCount, color: 'text-orange-400' }
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50">
            <CardContent className="p-2 text-center">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters by Type */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-blue-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground">Filter Configuration</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Tabs defaultValue="sale" className="w-full">
            <TabsList className="h-7 bg-muted/50 w-full mb-2">
              <TabsTrigger value="sale" className="h-5 text-[10px] flex-1 gap-1">
                <ShoppingCart className="h-3 w-3" />Sale ({saleCount})
              </TabsTrigger>
              <TabsTrigger value="rent" className="h-5 text-[10px] flex-1 gap-1">
                <Home className="h-3 w-3" />Rent ({rentCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sale">{renderFiltersList('sale')}</TabsContent>
            <TabsContent value="rent">{renderFiltersList('rent')}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyFilterSettings;
