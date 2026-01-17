import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Save, X, Filter } from 'lucide-react';
import { usePropertyFilters, FilterOption } from '@/hooks/usePropertyFilters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CentralizedFilterManager = () => {
  const { filters, loading, addFilter, updateFilter, deleteFilter } = usePropertyFilters();
  const [editingFilter, setEditingFilter] = useState<FilterOption | null>(null);
  const [newFilter, setNewFilter] = useState({
    filter_name: '',
    filter_category: '',
    filter_type: 'select',
    filter_options: [] as string[],
    listing_type: 'sale' as 'sale' | 'rent',
    is_active: true,
    display_order: 0,
  });
  const [isAddingFilter, setIsAddingFilter] = useState(false);

  const categories = ['search', 'location', 'price', 'specifications', 'investment', 'rental_terms', 'facilities'];
  const filterTypes = [
    { value: 'select', label: 'Dropdown' },
    { value: 'range', label: 'Range' },
    { value: 'checkbox', label: 'Multi' },
    { value: 'radio', label: 'Single' },
    { value: 'slider', label: 'Slider' }
  ];

  const handleAddFilter = async () => {
    if (!newFilter.filter_name || !newFilter.filter_category) return;
    try {
      await addFilter(newFilter);
      setNewFilter({ filter_name: '', filter_category: '', filter_type: 'select', filter_options: [], listing_type: 'sale', is_active: true, display_order: 0 });
      setIsAddingFilter(false);
    } catch (error) {
      console.error('Failed to add filter:', error);
    }
  };

  const handleUpdateFilter = async () => {
    if (!editingFilter) return;
    try {
      await updateFilter(editingFilter.id, editingFilter);
      setEditingFilter(null);
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    if (confirm('Delete this filter?')) {
      try {
        await deleteFilter(id);
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOptions = filters.reduce((acc, cat) => acc + cat.options.length, 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Centralized Filter Manager
          </h2>
          <p className="text-[10px] text-muted-foreground">Manage all property search filters in one place</p>
        </div>
        <Dialog open={isAddingFilter} onOpenChange={setIsAddingFilter}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />Add Filter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm bg-card/95 border-border/50">
            <DialogHeader>
              <DialogTitle className="text-sm text-foreground">Add Filter</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground">
                Create a new filter for all search panels
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={newFilter.filter_category} onValueChange={(value) => setNewFilter({ ...newFilter, filter_category: value })}>
                  <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Name</Label>
                <Input
                  value={newFilter.filter_name}
                  onChange={(e) => setNewFilter({ ...newFilter, filter_name: e.target.value })}
                  className="h-7 text-xs bg-background/50 border-border/50"
                  placeholder="Filter name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Type</Label>
                  <Select value={newFilter.filter_type} onValueChange={(value) => setNewFilter({ ...newFilter, filter_type: value })}>
                    <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Listing</Label>
                  <Select
                    value={newFilter.listing_type}
                    onValueChange={(value: 'sale' | 'rent') => setNewFilter({ ...newFilter, listing_type: value })}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2 bg-background/50 border-border/50"
                onClick={() => setIsAddingFilter(false)}
              >
                Cancel
              </Button>
              <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleAddFilter}>
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
          <CardContent className="p-2 text-center">
            <p className="text-lg font-bold text-foreground">{filters.length}</p>
            <p className="text-[9px] text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
          <CardContent className="p-2 text-center">
            <p className="text-lg font-bold text-foreground">{totalOptions}</p>
            <p className="text-[9px] text-muted-foreground">Total Filters</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
          <CardContent className="p-2 text-center">
            <p className="text-lg font-bold text-foreground">
              {filters.reduce((acc, cat) => acc + cat.options.filter((o) => o.is_active).length, 0)}
            </p>
            <p className="text-[9px] text-muted-foreground">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Categories */}
      <div className="space-y-2">
        {filters.map((category) => (
          <Card key={category.id} className="bg-card/50 border-border/50 border-l-2 border-l-primary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground capitalize flex items-center gap-2">
                {category.name.replace('_', ' ')}
                <Badge variant="secondary" className="text-[8px] px-1 py-0">{category.options.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-1">
                {category.options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
                    {editingFilter?.id === option.id ? (
                      <div className="flex-1 grid grid-cols-3 gap-2 items-center">
                        <Input value={editingFilter.filter_name} onChange={(e) => setEditingFilter({...editingFilter, filter_name: e.target.value})} className="h-6 text-xs bg-background/50" placeholder="Name" />
                        <Select value={editingFilter.filter_type} onValueChange={(value) => setEditingFilter({...editingFilter, filter_type: value})}>
                          <SelectTrigger className="h-6 text-xs bg-background/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {filterTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Switch checked={editingFilter.is_active} onCheckedChange={(checked) => setEditingFilter({...editingFilter, is_active: checked})} className="scale-[0.6]" />
                          <Button size="sm" className="h-5 w-5 p-0" onClick={handleUpdateFilter}><Save className="h-2.5 w-2.5" /></Button>
                          <Button size="sm" variant="outline" className="h-5 w-5 p-0" onClick={() => setEditingFilter(null)}><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">{option.filter_name}</p>
                          <p className="text-[9px] text-muted-foreground">{option.filter_type} • {option.listing_type}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={option.is_active ? "default" : "secondary"} className="text-[8px] px-1 py-0">
                            {option.is_active ? "On" : "Off"}
                          </Badge>
                          <Button size="sm" variant="outline" className="h-5 w-5 p-0" onClick={() => setEditingFilter(option)}><Edit className="h-2.5 w-2.5" /></Button>
                          <Button size="sm" variant="outline" className="h-5 w-5 p-0" onClick={() => handleDeleteFilter(option.id)}><Trash2 className="h-2.5 w-2.5" /></Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CentralizedFilterManager;
